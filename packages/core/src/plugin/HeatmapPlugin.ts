/**
 * HeatmapPlugin - 热力图插件示例
 * 展示如何将现有功能封装为插件
 */

import { BasePlugin } from './BasePlugin';
import { HeatmapRenderer, type HeatmapOptions } from '../HeatmapRenderer';
import type { PluginMetadata, PluginContext } from './PluginSystem';

export class HeatmapPlugin extends BasePlugin {
  metadata: PluginMetadata = {
    name: 'heatmap',
    version: '1.0.0',
    description: 'Heatmap visualization plugin',
    author: 'LDesign'
  };

  private renderer: HeatmapRenderer | null = null;

  async onInit(context: PluginContext): Promise<void> {
    await super.onInit(context);
    this.renderer = new HeatmapRenderer();
  }

  async onMount(context: PluginContext): Promise<void> {
    await super.onMount(context);

    // 提供API给外部使用
    this.api = {
      addHeatmap: (options: HeatmapOptions) => {
        if (!this.renderer) throw new Error('Renderer not initialized');
        return this.renderer.addHeatmap(options);
      },

      updateHeatmap: (id: string, updates: Partial<HeatmapOptions>) => {
        if (!this.renderer) throw new Error('Renderer not initialized');
        this.renderer.updateHeatmap(id, updates);
      },

      removeHeatmap: (id: string) => {
        if (!this.renderer) throw new Error('Renderer not initialized');
        this.renderer.removeHeatmap(id);
      },

      getLayers: () => {
        if (!this.renderer) throw new Error('Renderer not initialized');
        return this.renderer.getLayers();
      }
    };
  }

  async onDestroy(context: PluginContext): Promise<void> {
    if (this.renderer) {
      this.renderer.clearHeatmaps();
      this.renderer = null;
    }

    await super.onDestroy(context);
  }

  api?: Record<string, any>;
}

/**
 * 创建热力图插件
 */
export function createHeatmapPlugin(): HeatmapPlugin {
  return new HeatmapPlugin();
}

