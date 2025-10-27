/**
 * BasePlugin - 插件基类
 * 提供插件开发的便捷基类
 */
import type { Plugin, PluginMetadata, PluginContext } from './PluginSystem';
import { Logger } from '../Logger';
export declare abstract class BasePlugin implements Plugin {
    abstract metadata: PluginMetadata;
    protected context: PluginContext | null;
    protected logger: Logger;
    protected isInitialized: boolean;
    protected isMounted: boolean;
    /**
     * 初始化钩子
     */
    onInit(context: PluginContext): Promise<void>;
    /**
     * 挂载钩子
     */
    onMount(context: PluginContext): Promise<void>;
    /**
     * 更新钩子
     */
    onUpdate(context: PluginContext, data: any): Promise<void>;
    /**
     * 卸载钩子
     */
    onUnmount(context: PluginContext): Promise<void>;
    /**
     * 销毁钩子
     */
    onDestroy(context: PluginContext): Promise<void>;
    /**
     * 获取插件状态
     */
    getState(): {
        isInitialized: boolean;
        isMounted: boolean;
    };
}
//# sourceMappingURL=BasePlugin.d.ts.map