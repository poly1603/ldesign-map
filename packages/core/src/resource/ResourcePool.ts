/**
 * ResourcePool - 资源池管理
 * 复用对象，减少内存分配和GC压力
 */

import { Logger } from '../Logger';

export interface PoolOptions<T> {
  initialSize?: number;
  maxSize?: number;
  factory: () => T;
  reset?: (obj: T) => void;
  validate?: (obj: T) => boolean;
}

/**
 * ResourcePool - 通用资源池
 */
export class ResourcePool<T> {
  private pool: T[] = [];
  private inUse: Set<T> = new Set();
  private factory: () => T;
  private reset?: (obj: T) => void;
  private validate?: (obj: T) => boolean;
  private maxSize: number;
  private logger = Logger.getInstance();

  constructor(options: PoolOptions<T>) {
    this.factory = options.factory;
    this.reset = options.reset;
    this.validate = options.validate;
    this.maxSize = options.maxSize || 100;

    // 预创建初始对象
    const initialSize = options.initialSize || 0;
    for (let i = 0; i < initialSize; i++) {
      this.pool.push(this.factory());
    }

    this.logger.debug(`ResourcePool created with ${initialSize} initial objects`);
  }

  /**
   * 获取对象
   */
  acquire(): T {
    let obj: T;

    // 从池中获取
    if (this.pool.length > 0) {
      obj = this.pool.pop()!;

      // 验证对象
      if (this.validate && !this.validate(obj)) {
        this.logger.warn('Invalid object in pool, creating new one');
        obj = this.factory();
      }
    } else {
      // 池已空，创建新对象
      obj = this.factory();
    }

    this.inUse.add(obj);
    return obj;
  }

  /**
   * 释放对象回池
   */
  release(obj: T): void {
    if (!this.inUse.has(obj)) {
      this.logger.warn('Attempting to release object not in use');
      return;
    }

    this.inUse.delete(obj);

    // 重置对象
    if (this.reset) {
      this.reset(obj);
    }

    // 检查池大小限制
    if (this.pool.length < this.maxSize) {
      this.pool.push(obj);
    } else {
      // 池已满，丢弃对象让GC回收
      this.logger.debug('Pool full, discarding object');
    }
  }

  /**
   * 批量释放
   */
  releaseAll(objects: T[]): void {
    objects.forEach(obj => this.release(obj));
  }

  /**
   * 获取统计信息
   */
  getStats(): {
    available: number;
    inUse: number;
    total: number;
    utilization: number;
  } {
    const available = this.pool.length;
    const inUse = this.inUse.size;
    const total = available + inUse;

    return {
      available,
      inUse,
      total,
      utilization: total > 0 ? inUse / total : 0
    };
  }

  /**
   * 清空池
   */
  clear(): void {
    this.pool = [];
    this.inUse.clear();
    this.logger.info('ResourcePool cleared');
  }

  /**
   * 预热池（预创建对象）
   */
  warmup(count: number): void {
    const toCreate = Math.min(count, this.maxSize - this.pool.length);

    for (let i = 0; i < toCreate; i++) {
      this.pool.push(this.factory());
    }

    this.logger.info(`Pool warmed up with ${toCreate} objects`);
  }

  /**
   * 收缩池（移除未使用的对象）
   */
  shrink(targetSize: number = 0): number {
    const toRemove = Math.max(0, this.pool.length - targetSize);
    this.pool.splice(0, toRemove);

    this.logger.info(`Pool shrunk by ${toRemove} objects`);
    return toRemove;
  }
}

/**
 * LayerPool - 图层对象池
 */
export class LayerPool {
  private pools: Map<string, ResourcePool<any>> = new Map();
  private logger = Logger.getInstance();

  /**
   * 创建图层池
   */
  createPool<T>(
    type: string,
    factory: () => T,
    options: Partial<PoolOptions<T>> = {}
  ): void {
    if (this.pools.has(type)) {
      this.logger.warn(`Pool for ${type} already exists`);
      return;
    }

    const pool = new ResourcePool({
      factory,
      initialSize: options.initialSize || 5,
      maxSize: options.maxSize || 50,
      reset: options.reset,
      validate: options.validate
    });

    this.pools.set(type, pool);
    this.logger.info(`Layer pool created for ${type}`);
  }

  /**
   * 获取图层对象
   */
  acquire<T>(type: string): T | null {
    const pool = this.pools.get(type);
    if (!pool) {
      this.logger.error(`Pool for ${type} not found`);
      return null;
    }

    return pool.acquire();
  }

  /**
   * 释放图层对象
   */
  release(type: string, obj: any): void {
    const pool = this.pools.get(type);
    if (!pool) {
      this.logger.error(`Pool for ${type} not found`);
      return;
    }

    pool.release(obj);
  }

  /**
   * 获取所有池的统计
   */
  getAllStats(): Record<string, ReturnType<ResourcePool<any>['getStats']>> {
    const stats: Record<string, any> = {};

    this.pools.forEach((pool, type) => {
      stats[type] = pool.getStats();
    });

    return stats;
  }

  /**
   * 清空所有池
   */
  clearAll(): void {
    this.pools.forEach(pool => pool.clear());
    this.logger.info('All layer pools cleared');
  }

  /**
   * 预热所有池
   */
  warmupAll(count: number = 10): void {
    this.pools.forEach(pool => pool.warmup(count));
  }

  /**
   * 收缩所有池
   */
  shrinkAll(targetSize: number = 5): void {
    let totalRemoved = 0;
    this.pools.forEach(pool => {
      totalRemoved += pool.shrink(targetSize);
    });

    this.logger.info(`Shrunk all pools, removed ${totalRemoved} objects`);
  }

  /**
   * 销毁所有池
   */
  destroy(): void {
    this.clearAll();
    this.pools.clear();
    this.logger.info('LayerPool destroyed');
  }
}

/**
 * 全局图层池实例
 */
export const globalLayerPool = new LayerPool();

