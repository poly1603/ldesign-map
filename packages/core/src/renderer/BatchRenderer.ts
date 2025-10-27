/**
 * BatchRenderer - 批量渲染器
 * 合并同类型图层，减少draw call，提升GPU性能
 */

import { Logger } from '../Logger';
import type { DeckGLLayer } from '../types';

export interface BatchOptions {
  enableBatching?: boolean;
  maxBatchSize?: number; // 单批最大图层数
  batchByType?: boolean; // 按类型批处理
  batchByMaterial?: boolean; // 按材质批处理
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
export class BatchRenderer {
  private batches: Map<string, BatchGroup> = new Map();
  private logger = Logger.getInstance();
  private options: Required<BatchOptions>;
  private batchIdCounter = 0;

  constructor(options: BatchOptions = {}) {
    this.options = {
      enableBatching: options.enableBatching !== false,
      maxBatchSize: options.maxBatchSize || 50,
      batchByType: options.batchByType !== false,
      batchByMaterial: options.batchByMaterial !== false
    };

    this.logger.info('BatchRenderer initialized', this.options);
  }

  /**
   * 处理图层列表
   */
  process(layers: DeckGLLayer[]): DeckGLLayer[] {
    if (!this.options.enableBatching || layers.length === 0) {
      return layers;
    }

    // 按类型分组
    const groups = this.groupLayers(layers);

    // 合并可批处理的图层
    const batched: DeckGLLayer[] = [];

    groups.forEach((groupLayers, type) => {
      if (this.canBatch(type) && groupLayers.length > 1) {
        // 创建批次
        const batchId = this.createBatch(type, groupLayers);
        const batch = this.batches.get(batchId);

        if (batch && batch.mergedLayer) {
          batched.push(batch.mergedLayer);
          this.logger.debug(`Batched ${groupLayers.length} ${type} layers into 1`);
        } else {
          batched.push(...groupLayers);
        }
      } else {
        // 不批处理，直接添加
        batched.push(...groupLayers);
      }
    });

    const reduction = layers.length - batched.length;
    if (reduction > 0) {
      this.logger.info(`Batch rendering reduced ${reduction} draw calls`);
    }

    return batched;
  }

  /**
   * 按类型分组图层
   */
  private groupLayers(layers: DeckGLLayer[]): Map<string, DeckGLLayer[]> {
    const groups = new Map<string, DeckGLLayer[]>();

    layers.forEach(layer => {
      const type = this.getLayerType(layer);

      if (!groups.has(type)) {
        groups.set(type, []);
      }

      groups.get(type)!.push(layer);
    });

    return groups;
  }

  /**
   * 获取图层类型
   */
  private getLayerType(layer: DeckGLLayer): string {
    return layer.constructor.name || 'Unknown';
  }

  /**
   * 检查是否可以批处理
   */
  private canBatch(type: string): boolean {
    // 可批处理的图层类型
    const batchableTypes = [
      'ScatterplotLayer',
      'IconLayer',
      'TextLayer',
      'PathLayer'
    ];

    return batchableTypes.includes(type);
  }

  /**
   * 创建批次
   */
  private createBatch(type: string, layers: DeckGLLayer[]): string {
    const batchId = `batch-${type}-${++this.batchIdCounter}`;

    // 合并数据
    const mergedData = this.mergeLayers(layers);

    // 创建合并图层（简化版，实际需要更复杂的合并逻辑）
    const mergedLayer = this.createMergedLayer(type, mergedData, layers[0]);

    const batch: BatchGroup = {
      id: batchId,
      type,
      layers,
      mergedLayer,
      needsUpdate: false
    };

    this.batches.set(batchId, batch);

    return batchId;
  }

  /**
   * 合并图层数据
   */
  private mergeLayers(layers: DeckGLLayer[]): any[] {
    const merged: any[] = [];

    layers.forEach(layer => {
      if (Array.isArray(layer.props.data)) {
        merged.push(...layer.props.data);
      }
    });

    return merged;
  }

  /**
   * 创建合并图层
   */
  private createMergedLayer(
    type: string,
    data: any[],
    template: DeckGLLayer
  ): DeckGLLayer | null {
    // 简化实现：返回模板图层的副本
    // 实际应该根据类型创建合适的合并图层

    if (!template) return null;

    try {
      const LayerClass = template.constructor as any;
      return new LayerClass({
        ...template.props,
        id: `merged-${type}-${Date.now()}`,
        data
      });
    } catch (error) {
      this.logger.error(`Failed to create merged layer for ${type}`, error);
      return null;
    }
  }

  /**
   * 清除批次
   */
  clearBatches(): void {
    this.batches.clear();
    this.logger.info('All batches cleared');
  }

  /**
   * 获取统计信息
   */
  getStats(): {
    totalBatches: number;
    totalLayersBeforeBatch: number;
    totalLayersAfterBatch: number;
    reductionRate: number;
  } {
    let totalLayersBeforeBatch = 0;
    let totalLayersAfterBatch = this.batches.size;

    this.batches.forEach(batch => {
      totalLayersBeforeBatch += batch.layers.length;
    });

    const reductionRate = totalLayersBeforeBatch > 0
      ? (totalLayersBeforeBatch - totalLayersAfterBatch) / totalLayersBeforeBatch
      : 0;

    return {
      totalBatches: this.batches.size,
      totalLayersBeforeBatch,
      totalLayersAfterBatch,
      reductionRate
    };
  }

  /**
   * 销毁渲染器
   */
  destroy(): void {
    this.clearBatches();
    this.logger.info('BatchRenderer destroyed');
  }
}

/**
 * 全局批量渲染器
 */
export const globalBatchRenderer = new BatchRenderer();

