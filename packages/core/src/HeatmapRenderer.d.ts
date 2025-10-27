import type { DeckGLLayer } from './types';
/**
 * 热力图数据点接口
 */
export interface HeatmapDataPoint {
    position: [number, number];
    weight?: number;
    [key: string]: any;
}
/**
 * 热力图配置选项
 */
export interface HeatmapOptions {
    id?: string;
    data: HeatmapDataPoint[];
    intensity?: number;
    threshold?: number;
    radiusPixels?: number;
    colorRange?: number[][];
    aggregation?: 'SUM' | 'MEAN' | 'MIN' | 'MAX';
    weightsTextureSize?: number;
    debounceTimeout?: number;
    pickable?: boolean;
    visible?: boolean;
    opacity?: number;
    getPosition?: (d: any) => [number, number];
    getWeight?: (d: any) => number;
}
/**
 * HeatmapRenderer - 热力图渲染器
 * 用于数据密度可视化
 */
export declare class HeatmapRenderer {
    private heatmaps;
    private heatmapIdCounter;
    /**
     * 添加热力图
     */
    addHeatmap(options: HeatmapOptions): string;
    /**
     * 更新热力图
     */
    updateHeatmap(heatmapId: string, updates: Partial<HeatmapOptions>): void;
    /**
     * 删除热力图
     */
    removeHeatmap(heatmapId: string): void;
    /**
     * 清空所有热力图
     */
    clearHeatmaps(): void;
    /**
     * 获取热力图图层
     */
    getLayers(): DeckGLLayer[];
    /**
     * 获取热力图
     */
    getHeatmap(heatmapId: string): HeatmapOptions | undefined;
    /**
     * 获取所有热力图
     */
    getAllHeatmaps(): HeatmapOptions[];
    /**
     * 设置热力图可见性
     */
    setHeatmapVisibility(heatmapId: string, visible: boolean): void;
}
//# sourceMappingURL=HeatmapRenderer.d.ts.map