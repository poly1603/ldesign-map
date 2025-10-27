/**
 * HeatmapPlugin - 热力图插件示例
 * 展示如何将现有功能封装为插件
 */
import { BasePlugin } from './BasePlugin';
import type { PluginMetadata, PluginContext } from './PluginSystem';
export declare class HeatmapPlugin extends BasePlugin {
    metadata: PluginMetadata;
    private renderer;
    onInit(context: PluginContext): Promise<void>;
    onMount(context: PluginContext): Promise<void>;
    onDestroy(context: PluginContext): Promise<void>;
    api?: Record<string, any>;
}
/**
 * 创建热力图插件
 */
export declare function createHeatmapPlugin(): HeatmapPlugin;
//# sourceMappingURL=HeatmapPlugin.d.ts.map