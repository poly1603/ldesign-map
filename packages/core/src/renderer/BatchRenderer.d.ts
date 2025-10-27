/**
 * BatchRenderer - 批量渲染器
 * 合并同类型图层，减少draw call，提升GPU性能
 */
import type { DeckGLLayer } from '../types';
export interface BatchOptions {
    enableBatching?: boolean;
    maxBatchSize?: number;
    batchByType?: boolean;
    batchByMaterial?: boolean;
}
export interface BatchGroup {
    id: string;
    type: string;
    layers: DeckGLLayer[];
    mergedLayer: DeckGLLayer | null;
    needsUpdate: boolean;
}
/**
 * BatchRenderer - 批量渲染器
 */
export declare class BatchRenderer {
    private batches;
    private logger;
    private options;
    private batchIdCounter;
    constructor(options?: BatchOptions);
    /**
     * 处理图层列表
     */
    process(layers: DeckGLLayer[]): DeckGLLayer[];
    /**
     * 按类型分组图层
     */
    private groupLayers;
    /**
     * 获取图层类型
     */
    private getLayerType;
    /**
     * 检查是否可以批处理
     */
    private canBatch;
    /**
     * 创建批次
     */
    private createBatch;
    /**
     * 合并图层数据
     */
    private mergeLayers;
    /**
     * 创建合并图层
     */
    private createMergedLayer;
    /**
     * 清除批次
     */
    clearBatches(): void;
    /**
     * 获取统计信息
     */
    getStats(): {
        totalBatches: number;
        totalLayersBeforeBatch: number;
        totalLayersAfterBatch: number;
        reductionRate: number;
    };
    /**
     * 销毁渲染器
     */
    destroy(): void;
}
/**
 * 全局批量渲染器
 */
export declare const globalBatchRenderer: BatchRenderer;
//# sourceMappingURL=BatchRenderer.d.ts.map