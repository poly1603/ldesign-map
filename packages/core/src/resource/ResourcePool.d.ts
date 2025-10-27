/**
 * ResourcePool - 资源池管理
 * 复用对象，减少内存分配和GC压力
 */
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
export declare class ResourcePool<T> {
    private pool;
    private inUse;
    private factory;
    private reset?;
    private validate?;
    private maxSize;
    private logger;
    constructor(options: PoolOptions<T>);
    /**
     * 获取对象
     */
    acquire(): T;
    /**
     * 释放对象回池
     */
    release(obj: T): void;
    /**
     * 批量释放
     */
    releaseAll(objects: T[]): void;
    /**
     * 获取统计信息
     */
    getStats(): {
        available: number;
        inUse: number;
        total: number;
        utilization: number;
    };
    /**
     * 清空池
     */
    clear(): void;
    /**
     * 预热池（预创建对象）
     */
    warmup(count: number): void;
    /**
     * 收缩池（移除未使用的对象）
     */
    shrink(targetSize?: number): number;
}
/**
 * LayerPool - 图层对象池
 */
export declare class LayerPool {
    private pools;
    private logger;
    /**
     * 创建图层池
     */
    createPool<T>(type: string, factory: () => T, options?: Partial<PoolOptions<T>>): void;
    /**
     * 获取图层对象
     */
    acquire<T>(type: string): T | null;
    /**
     * 释放图层对象
     */
    release(type: string, obj: any): void;
    /**
     * 获取所有池的统计
     */
    getAllStats(): Record<string, ReturnType<ResourcePool<any>['getStats']>>;
    /**
     * 清空所有池
     */
    clearAll(): void;
    /**
     * 预热所有池
     */
    warmupAll(count?: number): void;
    /**
     * 收缩所有池
     */
    shrinkAll(targetSize?: number): void;
    /**
     * 销毁所有池
     */
    destroy(): void;
}
/**
 * 全局图层池实例
 */
export declare const globalLayerPool: LayerPool;
//# sourceMappingURL=ResourcePool.d.ts.map