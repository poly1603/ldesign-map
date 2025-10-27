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
    mapRenderer: any;
    eventManager: EventManager;
    logger: Logger;
    config: Record<string, any>;
}
export interface Plugin {
    metadata: PluginMetadata;
    onInit?(context: PluginContext): void | Promise<void>;
    onMount?(context: PluginContext): void | Promise<void>;
    onUpdate?(context: PluginContext, data: any): void | Promise<void>;
    onUnmount?(context: PluginContext): void | Promise<void>;
    onDestroy?(context: PluginContext): void | Promise<void>;
    api?: Record<string, any>;
}
export interface PluginSystemOptions {
    enableHotReload?: boolean;
    pluginTimeout?: number;
    strictMode?: boolean;
}
/**
 * PluginSystem - 插件系统
 */
export declare class PluginSystem {
    private plugins;
    private pluginContexts;
    private pluginOrder;
    private eventManager;
    private logger;
    private options;
    private mapRenderer;
    constructor(mapRenderer: any, options?: PluginSystemOptions);
    /**
     * 注册插件
     */
    register(plugin: Plugin): Promise<void>;
    /**
     * 注销插件
     */
    unregister(name: string): Promise<void>;
    /**
     * 挂载插件
     */
    mount(name: string): Promise<void>;
    /**
     * 卸载插件
     */
    unmount(name: string): Promise<void>;
    /**
     * 挂载所有插件
     */
    mountAll(): Promise<void>;
    /**
     * 获取插件
     */
    get(name: string): Plugin | undefined;
    /**
     * 获取插件API
     */
    getAPI(name: string): Record<string, any> | undefined;
    /**
     * 获取所有插件
     */
    getAllPlugins(): Plugin[];
    /**
     * 获取插件列表
     */
    getPluginNames(): string[];
    /**
     * 检查插件是否已注册
     */
    has(name: string): boolean;
    /**
     * 执行插件更新
     */
    updatePlugins(data: any): Promise<void>;
    /**
     * 带超时的执行
     */
    private executeWithTimeout;
    /**
     * 销毁插件系统
     */
    destroy(): Promise<void>;
}
/**
 * 创建插件系统
 */
export declare function createPluginSystem(mapRenderer: any, options?: PluginSystemOptions): PluginSystem;
//# sourceMappingURL=PluginSystem.d.ts.map