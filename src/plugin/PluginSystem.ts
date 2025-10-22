/**
 * PluginSystem - 插件化架构系统
 * 提供插件注册、加载、生命周期管理
 */

import { EventManager } from '../EventManager';
import { Logger } from '../Logger';

export type PluginLifecycleHook = 'onInit' | 'onMount' | 'onUpdate' | 'onUnmount' | 'onDestroy';

export interface PluginMetadata {
  name: string;
  version: string;
  description?: string;
  author?: string;
  dependencies?: string[];
}

export interface PluginContext {
  mapRenderer: any; // MapRenderer实例
  eventManager: EventManager;
  logger: Logger;
  config: Record<string, any>;
}

export interface Plugin {
  metadata: PluginMetadata;

  // 生命周期钩子
  onInit?(context: PluginContext): void | Promise<void>;
  onMount?(context: PluginContext): void | Promise<void>;
  onUpdate?(context: PluginContext, data: any): void | Promise<void>;
  onUnmount?(context: PluginContext): void | Promise<void>;
  onDestroy?(context: PluginContext): void | Promise<void>;

  // 插件API（可选）
  api?: Record<string, any>;
}

export interface PluginSystemOptions {
  enableHotReload?: boolean;
  pluginTimeout?: number;
  strictMode?: boolean; // 严格模式：依赖缺失时报错
}

/**
 * PluginSystem - 插件系统
 */
export class PluginSystem {
  private plugins: Map<string, Plugin> = new Map();
  private pluginContexts: Map<string, PluginContext> = new Map();
  private pluginOrder: string[] = [];
  private eventManager: EventManager;
  private logger = Logger.getInstance();
  private options: Required<PluginSystemOptions>;
  private mapRenderer: any;

  constructor(mapRenderer: any, options: PluginSystemOptions = {}) {
    this.mapRenderer = mapRenderer;
    this.eventManager = new EventManager();
    this.options = {
      enableHotReload: options.enableHotReload || false,
      pluginTimeout: options.pluginTimeout || 5000,
      strictMode: options.strictMode !== false
    };

    this.logger.info('PluginSystem initialized');
  }

  /**
   * 注册插件
   */
  async register(plugin: Plugin): Promise<void> {
    const { name, version } = plugin.metadata;

    if (this.plugins.has(name)) {
      throw new Error(`Plugin ${name} is already registered`);
    }

    // 检查依赖
    if (plugin.metadata.dependencies) {
      for (const dep of plugin.metadata.dependencies) {
        if (!this.plugins.has(dep)) {
          const message = `Plugin ${name} requires ${dep}`;
          if (this.options.strictMode) {
            throw new Error(message);
          } else {
            this.logger.warn(message);
          }
        }
      }
    }

    // 创建插件上下文
    const context: PluginContext = {
      mapRenderer: this.mapRenderer,
      eventManager: this.eventManager,
      logger: this.logger,
      config: {}
    };

    this.plugins.set(name, plugin);
    this.pluginContexts.set(name, context);
    this.pluginOrder.push(name);

    // 调用onInit钩子
    if (plugin.onInit) {
      try {
        await this.executeWithTimeout(
          plugin.onInit(context),
          `${name}.onInit`,
          this.options.pluginTimeout
        );
      } catch (error) {
        this.logger.error(`Plugin ${name} onInit failed`, error);
        this.unregister(name);
        throw error;
      }
    }

    this.logger.info(`Plugin registered: ${name}@${version}`);
  }

  /**
   * 注销插件
   */
  async unregister(name: string): Promise<void> {
    const plugin = this.plugins.get(name);
    if (!plugin) {
      this.logger.warn(`Plugin ${name} not found`);
      return;
    }

    const context = this.pluginContexts.get(name);

    // 调用onDestroy钩子
    if (plugin.onDestroy && context) {
      try {
        await this.executeWithTimeout(
          plugin.onDestroy(context),
          `${name}.onDestroy`,
          this.options.pluginTimeout
        );
      } catch (error) {
        this.logger.error(`Plugin ${name} onDestroy failed`, error);
      }
    }

    this.plugins.delete(name);
    this.pluginContexts.delete(name);
    this.pluginOrder = this.pluginOrder.filter(n => n !== name);

    this.logger.info(`Plugin unregistered: ${name}`);
  }

  /**
   * 挂载插件
   */
  async mount(name: string): Promise<void> {
    const plugin = this.plugins.get(name);
    const context = this.pluginContexts.get(name);

    if (!plugin || !context) {
      throw new Error(`Plugin ${name} not found`);
    }

    if (plugin.onMount) {
      try {
        await this.executeWithTimeout(
          plugin.onMount(context),
          `${name}.onMount`,
          this.options.pluginTimeout
        );
        this.logger.info(`Plugin mounted: ${name}`);
      } catch (error) {
        this.logger.error(`Plugin ${name} onMount failed`, error);
        throw error;
      }
    }
  }

  /**
   * 卸载插件
   */
  async unmount(name: string): Promise<void> {
    const plugin = this.plugins.get(name);
    const context = this.pluginContexts.get(name);

    if (!plugin || !context) {
      throw new Error(`Plugin ${name} not found`);
    }

    if (plugin.onUnmount) {
      try {
        await this.executeWithTimeout(
          plugin.onUnmount(context),
          `${name}.onUnmount`,
          this.options.pluginTimeout
        );
        this.logger.info(`Plugin unmounted: ${name}`);
      } catch (error) {
        this.logger.error(`Plugin ${name} onUnmount failed`, error);
        throw error;
      }
    }
  }

  /**
   * 挂载所有插件
   */
  async mountAll(): Promise<void> {
    for (const name of this.pluginOrder) {
      await this.mount(name);
    }
  }

  /**
   * 获取插件
   */
  get(name: string): Plugin | undefined {
    return this.plugins.get(name);
  }

  /**
   * 获取插件API
   */
  getAPI(name: string): Record<string, any> | undefined {
    const plugin = this.plugins.get(name);
    return plugin?.api;
  }

  /**
   * 获取所有插件
   */
  getAllPlugins(): Plugin[] {
    return Array.from(this.plugins.values());
  }

  /**
   * 获取插件列表
   */
  getPluginNames(): string[] {
    return [...this.pluginOrder];
  }

  /**
   * 检查插件是否已注册
   */
  has(name: string): boolean {
    return this.plugins.has(name);
  }

  /**
   * 执行插件更新
   */
  async updatePlugins(data: any): Promise<void> {
    for (const name of this.pluginOrder) {
      const plugin = this.plugins.get(name);
      const context = this.pluginContexts.get(name);

      if (plugin?.onUpdate && context) {
        try {
          await plugin.onUpdate(context, data);
        } catch (error) {
          this.logger.error(`Plugin ${name} onUpdate failed`, error);
        }
      }
    }
  }

  /**
   * 带超时的执行
   */
  private executeWithTimeout(
    promise: void | Promise<void>,
    hookName: string,
    timeout: number
  ): Promise<void> {
    if (!promise || !(promise instanceof Promise)) {
      return Promise.resolve();
    }

    return Promise.race([
      promise,
      new Promise<void>((_, reject) => {
        setTimeout(() => {
          reject(new Error(`${hookName} timeout after ${timeout}ms`));
        }, timeout);
      })
    ]);
  }

  /**
   * 销毁插件系统
   */
  async destroy(): Promise<void> {
    // 按逆序卸载插件
    const reverseOrder = [...this.pluginOrder].reverse();

    for (const name of reverseOrder) {
      try {
        await this.unregister(name);
      } catch (error) {
        this.logger.error(`Failed to unregister plugin ${name}`, error);
      }
    }

    this.plugins.clear();
    this.pluginContexts.clear();
    this.pluginOrder = [];
    this.eventManager.removeAllListeners();

    this.logger.info('PluginSystem destroyed');
  }
}

/**
 * 创建插件系统
 */
export function createPluginSystem(
  mapRenderer: any,
  options?: PluginSystemOptions
): PluginSystem {
  return new PluginSystem(mapRenderer, options);
}

