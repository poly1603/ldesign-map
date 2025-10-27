/**
 * LazyLoader - 懒加载管理器
 * 按需加载图层和资源，优化内存占用
 */
import type { DeckGLLayer } from '../types';
export interface LazyLoadOptions {
    priorityThreshold?: number;
    maxConcurrent?: number;
    preloadDistance?: number;
    unloadDelay?: number;
}
export interface LayerItem {
    id: string;
    layer: DeckGLLayer | null;
    loader: () => Promise<DeckGLLayer> | DeckGLLayer;
    priority: number;
    bounds?: {
        x: number;
        y: number;
        width: number;
        height: number;
    };
    loaded: boolean;
    loading: boolean;
    lastAccessed: number;
}
/**
 * LazyLoader - 懒加载管理器
 */
export declare class LazyLoader {
    private items;
    private loadQueue;
    private unloadQueue;
    private logger;
    private options;
    private loadingCount;
    constructor(options?: LazyLoadOptions);
    /**
     * 注册图层
     */
    register(id: string, loader: () => Promise<DeckGLLayer> | DeckGLLayer, priority?: number, bounds?: {
        x: number;
        y: number;
        width: number;
        height: number;
    }): void;
    /**
     * 加载图层
     */
    load(id: string): Promise<DeckGLLayer | null>;
    /**
     * 执行加载
     */
    private performLoad;
    /**
     * 等待加载完成
     */
    private waitForLoad;
    /**
     * 处理加载队列
     */
    private processQueue;
    /**
     * 卸载图层
     */
    unload(id: string, immediate?: boolean): void;
    /**
     * 计划卸载
     */
    private scheduleUnload;
    /**
     * 取消卸载计划
     */
    private cancelUnload;
    /**
     * 执行卸载
     */
    private performUnload;
    /**
     * 基于视口加载
     */
    loadVisible(viewport: {
        x: number;
        y: number;
        width: number;
        height: number;
    }): Promise<DeckGLLayer[]>;
    /**
     * 检查边界是否相交（含距离）
     */
    private intersects;
    /**
     * 按优先级加载
     */
    loadByPriority(count?: number): Promise<DeckGLLayer[]>;
    /**
     * 卸载低优先级图层
     */
    unloadLowPriority(): number;
    /**
     * 获取统计信息
     */
    getStats(): {
        total: number;
        loaded: number;
        loading: number;
        queued: number;
        avgPriority: number;
    };
    /**
     * 清空所有
     */
    clear(): void;
    /**
     * 销毁加载器
     */
    destroy(): void;
}
/**
 * 全局懒加载器实例
 */
export declare const globalLazyLoader: LazyLoader;
//# sourceMappingURL=LazyLoader.d.ts.map