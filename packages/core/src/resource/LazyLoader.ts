/**
 * LazyLoader - 懒加载管理器
 * 按需加载图层和资源，优化内存占用
 */

import { Logger } from '../Logger';
import type { DeckGLLayer } from '../types';

export interface LazyLoadOptions {
  priorityThreshold?: number; // 优先级阈值（0-1）
  maxConcurrent?: number; // 最大并发加载数
  preloadDistance?: number; // 预加载距离（像素）
  unloadDelay?: number; // 卸载延迟（毫秒）
}

export interface LayerItem {
  id: string;
  layer: DeckGLLayer | null;
  loader: () => Promise<DeckGLLayer> | DeckGLLayer;
  priority: number; // 0-1，越高越优先
  bounds?: { x: number; y: number; width: number; height: number };
  loaded: boolean;
  loading: boolean;
  lastAccessed: number;
}

/**
 * LazyLoader - 懒加载管理器
 */
export class LazyLoader {
  private items: Map<string, LayerItem> = new Map();
  private loadQueue: string[] = [];
  private unloadQueue: Map<string, number> = new Map(); // id -> timeoutId
  private logger = Logger.getInstance();
  private options: Required<LazyLoadOptions>;
  private loadingCount = 0;

  constructor(options: LazyLoadOptions = {}) {
    this.options = {
      priorityThreshold: options.priorityThreshold || 0.5,
      maxConcurrent: options.maxConcurrent || 3,
      preloadDistance: options.preloadDistance || 200,
      unloadDelay: options.unloadDelay || 5000
    };

    this.logger.info('LazyLoader initialized');
  }

  /**
   * 注册图层
   */
  register(
    id: string,
    loader: () => Promise<DeckGLLayer> | DeckGLLayer,
    priority: number = 0.5,
    bounds?: { x: number; y: number; width: number; height: number }
  ): void {
    if (this.items.has(id)) {
      this.logger.warn(`Layer ${id} already registered`);
      return;
    }

    const item: LayerItem = {
      id,
      layer: null,
      loader,
      priority,
      bounds,
      loaded: false,
      loading: false,
      lastAccessed: 0
    };

    this.items.set(id, item);
    this.logger.debug(`Layer registered: ${id}, priority: ${priority}`);
  }

  /**
   * 加载图层
   */
  async load(id: string): Promise<DeckGLLayer | null> {
    const item = this.items.get(id);
    if (!item) {
      this.logger.error(`Layer ${id} not found`);
      return null;
    }

    // 已加载，直接返回
    if (item.loaded && item.layer) {
      item.lastAccessed = Date.now();
      this.cancelUnload(id);
      return item.layer;
    }

    // 正在加载，等待
    if (item.loading) {
      return this.waitForLoad(id);
    }

    // 检查并发限制
    if (this.loadingCount >= this.options.maxConcurrent) {
      this.loadQueue.push(id);
      this.logger.debug(`Layer ${id} queued for loading`);
      return this.waitForLoad(id);
    }

    return this.performLoad(item);
  }

  /**
   * 执行加载
   */
  private async performLoad(item: LayerItem): Promise<DeckGLLayer | null> {
    item.loading = true;
    this.loadingCount++;

    try {
      this.logger.debug(`Loading layer: ${item.id}`);
      const startTime = performance.now();

      const result = item.loader();
      item.layer = result instanceof Promise ? await result : result;

      const loadTime = performance.now() - startTime;

      item.loaded = true;
      item.lastAccessed = Date.now();

      this.logger.info(`Layer loaded: ${item.id} in ${loadTime.toFixed(2)}ms`);

      return item.layer;
    } catch (error) {
      this.logger.error(`Failed to load layer ${item.id}`, error);
      return null;
    } finally {
      item.loading = false;
      this.loadingCount--;
      this.processQueue();
    }
  }

  /**
   * 等待加载完成
   */
  private waitForLoad(id: string): Promise<DeckGLLayer | null> {
    return new Promise((resolve) => {
      const checkInterval = setInterval(() => {
        const item = this.items.get(id);
        if (!item || (!item.loading && item.loaded)) {
          clearInterval(checkInterval);
          resolve(item?.layer || null);
        }
      }, 50);

      // 超时保护
      setTimeout(() => {
        clearInterval(checkInterval);
        resolve(null);
      }, 10000);
    });
  }

  /**
   * 处理加载队列
   */
  private processQueue(): void {
    while (this.loadQueue.length > 0 && this.loadingCount < this.options.maxConcurrent) {
      const id = this.loadQueue.shift();
      if (id) {
        const item = this.items.get(id);
        if (item && !item.loaded && !item.loading) {
          this.performLoad(item);
        }
      }
    }
  }

  /**
   * 卸载图层
   */
  unload(id: string, immediate: boolean = false): void {
    const item = this.items.get(id);
    if (!item || !item.loaded) return;

    if (immediate) {
      this.performUnload(item);
    } else {
      // 延迟卸载
      this.scheduleUnload(id);
    }
  }

  /**
   * 计划卸载
   */
  private scheduleUnload(id: string): void {
    // 取消之前的卸载计划
    this.cancelUnload(id);

    const timeoutId = window.setTimeout(() => {
      const item = this.items.get(id);
      if (item) {
        this.performUnload(item);
      }
      this.unloadQueue.delete(id);
    }, this.options.unloadDelay);

    this.unloadQueue.set(id, timeoutId);
  }

  /**
   * 取消卸载计划
   */
  private cancelUnload(id: string): void {
    const timeoutId = this.unloadQueue.get(id);
    if (timeoutId) {
      clearTimeout(timeoutId);
      this.unloadQueue.delete(id);
    }
  }

  /**
   * 执行卸载
   */
  private performUnload(item: LayerItem): void {
    item.layer = null;
    item.loaded = false;
    this.logger.debug(`Layer unloaded: ${item.id}`);
  }

  /**
   * 基于视口加载
   */
  async loadVisible(viewport: { x: number; y: number; width: number; height: number }): Promise<DeckGLLayer[]> {
    const visibleLayers: Promise<DeckGLLayer | null>[] = [];

    this.items.forEach((item, id) => {
      if (!item.bounds) {
        // 无边界信息，始终加载
        visibleLayers.push(this.load(id));
      } else {
        // 检查是否在视口内（含预加载距离）
        const isVisible = this.intersects(viewport, item.bounds, this.options.preloadDistance);

        if (isVisible) {
          visibleLayers.push(this.load(id));
        } else if (item.loaded) {
          // 不可见的已加载图层，计划卸载
          this.scheduleUnload(id);
        }
      }
    });

    const results = await Promise.all(visibleLayers);
    return results.filter((layer): layer is DeckGLLayer => layer !== null);
  }

  /**
   * 检查边界是否相交（含距离）
   */
  private intersects(
    a: { x: number; y: number; width: number; height: number },
    b: { x: number; y: number; width: number; height: number },
    distance: number = 0
  ): boolean {
    return !(
      a.x + a.width + distance < b.x - distance ||
      a.x - distance > b.x + b.width + distance ||
      a.y + a.height + distance < b.y - distance ||
      a.y - distance > b.y + b.height + distance
    );
  }

  /**
   * 按优先级加载
   */
  async loadByPriority(count: number = 5): Promise<DeckGLLayer[]> {
    const sorted = Array.from(this.items.values())
      .filter(item => !item.loaded && !item.loading)
      .sort((a, b) => b.priority - a.priority)
      .slice(0, count);

    const layers = await Promise.all(
      sorted.map(item => this.load(item.id))
    );

    return layers.filter((layer): layer is DeckGLLayer => layer !== null);
  }

  /**
   * 卸载低优先级图层
   */
  unloadLowPriority(): number {
    let unloaded = 0;

    this.items.forEach((item, id) => {
      if (item.loaded && item.priority < this.options.priorityThreshold) {
        this.unload(id, true);
        unloaded++;
      }
    });

    this.logger.info(`Unloaded ${unloaded} low-priority layers`);
    return unloaded;
  }

  /**
   * 获取统计信息
   */
  getStats(): {
    total: number;
    loaded: number;
    loading: number;
    queued: number;
    avgPriority: number;
  } {
    let loaded = 0;
    let loading = 0;
    let totalPriority = 0;

    this.items.forEach(item => {
      if (item.loaded) loaded++;
      if (item.loading) loading++;
      totalPriority += item.priority;
    });

    return {
      total: this.items.size,
      loaded,
      loading,
      queued: this.loadQueue.length,
      avgPriority: this.items.size > 0 ? totalPriority / this.items.size : 0
    };
  }

  /**
   * 清空所有
   */
  clear(): void {
    this.items.forEach((_, id) => {
      this.cancelUnload(id);
    });

    this.items.clear();
    this.loadQueue = [];
    this.unloadQueue.clear();

    this.logger.info('LazyLoader cleared');
  }

  /**
   * 销毁加载器
   */
  destroy(): void {
    this.clear();
    this.logger.info('LazyLoader destroyed');
  }
}

/**
 * 全局懒加载器实例
 */
export const globalLazyLoader = new LazyLoader();

