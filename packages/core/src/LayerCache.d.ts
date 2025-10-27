import type { DeckGLLayer } from './types';
/**
 * 缓存策略
 */
export type CacheStrategy = 'LRU' | 'LFU' | 'FIFO';
/**
 * LayerCache - 图层缓存管理器
 * 提供图层缓存功能，优化性能
 */
export declare class LayerCache {
    private cache;
    private maxSize;
    private maxMemory;
    private strategy;
    private currentMemory;
    private logger;
    constructor(maxSize?: number, maxMemory?: number, // 100MB
    strategy?: CacheStrategy);
    /**
     * 添加图层到缓存
     */
    set(key: string, layer: DeckGLLayer): void;
    /**
     * 从缓存获取图层
     */
    get(key: string): DeckGLLayer | undefined;
    /**
     * 检查缓存是否包含指定键
     */
    has(key: string): boolean;
    /**
     * 删除缓存项
     */
    delete(key: string): boolean;
    /**
     * 清空缓存
     */
    clear(): void;
    /**
     * 驱逐缓存项（根据策略）
     */
    private evict;
    /**
     * 查找最久未使用的键 (LRU)
     */
    private findLRUKey;
    /**
     * 查找最少使用的键 (LFU)
     */
    private findLFUKey;
    /**
     * 查找最早添加的键 (FIFO)
     */
    private findFIFOKey;
    /**
     * 估算图层大小
     */
    private estimateLayerSize;
    /**
     * 获取缓存统计信息
     */
    getStats(): {
        size: number;
        maxSize: number;
        memory: number;
        maxMemory: number;
        hitRate: number;
        entries: Array<{
            key: string;
            size: number;
            accessCount: number;
            age: number;
        }>;
    };
    /**
     * 设置缓存策略
     */
    setStrategy(strategy: CacheStrategy): void;
    /**
     * 设置最大缓存大小
     */
    setMaxSize(maxSize: number): void;
    /**
     * 设置最大内存限制
     */
    setMaxMemory(maxMemory: number): void;
    /**
     * 获取缓存大小
     */
    getSize(): number;
    /**
     * 获取当前内存使用量
     */
    getMemoryUsage(): number;
    /**
     * 优化缓存（移除过期或很少使用的项）
     */
    optimize(): void;
}
/**
 * 全局图层缓存实例
 */
export declare const globalLayerCache: LayerCache;
//# sourceMappingURL=LayerCache.d.ts.map