/**
 * BasePlugin - 插件基类
 * 提供插件开发的便捷基类
 */

import type { Plugin, PluginMetadata, PluginContext } from './PluginSystem';
import { Logger } from '../Logger';

export abstract class BasePlugin implements Plugin {
  abstract metadata: PluginMetadata;

  protected context: PluginContext | null = null;
  protected logger = Logger.getInstance();
  protected isInitialized = false;
  protected isMounted = false;

  /**
   * 初始化钩子
   */
  async onInit(context: PluginContext): Promise<void> {
    this.context = context;
    this.isInitialized = true;
    this.logger.info(`Plugin ${this.metadata.name} initialized`);
  }

  /**
   * 挂载钩子
   */
  async onMount(context: PluginContext): Promise<void> {
    this.isMounted = true;
    this.logger.info(`Plugin ${this.metadata.name} mounted`);
  }

  /**
   * 更新钩子
   */
  async onUpdate(context: PluginContext, data: any): Promise<void> {
    // 可选实现
  }

  /**
   * 卸载钩子
   */
  async onUnmount(context: PluginContext): Promise<void> {
    this.isMounted = false;
    this.logger.info(`Plugin ${this.metadata.name} unmounted`);
  }

  /**
   * 销毁钩子
   */
  async onDestroy(context: PluginContext): Promise<void> {
    this.isInitialized = false;
    this.logger.info(`Plugin ${this.metadata.name} destroyed`);
  }

  /**
   * 获取插件状态
   */
  getState(): {
    isInitialized: boolean;
    isMounted: boolean;
  } {
    return {
      isInitialized: this.isInitialized,
      isMounted: this.isMounted
    };
  }
}

