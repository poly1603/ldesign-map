import type { DeckGLLayer } from './types';
/**
 * 聚类点数据接口
 */
export interface ClusterPoint {
    position: [number, number];
    weight?: number;
    [key: string]: any;
}
/**
 * 聚类结果接口
 */
export interface Cluster {
    id: string;
    position: [number, number];
    points: ClusterPoint[];
    count: number;
    weight: number;
}
/**
 * 聚类配置选项
 */
export interface ClusterOptions {
    id?: string;
    data: ClusterPoint[];
    radius?: number;
    minPoints?: number;
    maxZoom?: number;
    clusterColor?: number[];
    pointColor?: number[];
    showCount?: boolean;
    getPosition?: (d: any) => [number, number];
    getWeight?: (d: any) => number;
    radiusScale?: number;
    radiusMinPixels?: number;
    radiusMaxPixels?: number;
    useWorker?: boolean;
}
/**
 * ClusterManager - 聚类管理器
 * 实现基于网格的点聚类算法，支持WebWorker并行计算
 */
export declare class ClusterManager {
    private clusters;
    private clusterIdCounter;
    private clusterCache;
    private workerPool;
    private logger;
    private useWorkerThreshold;
    constructor();
    /**
     * 获取Worker代码（内联）
     */
    private getClusterWorkerCode;
    /**
     * 添加聚类
     */
    addCluster(options: ClusterOptions): string;
    /**
     * 更新聚类
     */
    updateCluster(clusterId: string, updates: Partial<ClusterOptions>): void;
    /**
     * 删除聚类
     */
    removeCluster(clusterId: string): void;
    /**
     * 清空所有聚类
     */
    clear(): void;
    /**
     * 执行聚类算法（优化版，支持WebWorker）
     */
    private performClusteringAsync;
    /**
     * 同步聚类算法（主线程）
     */
    private performClusteringSync;
    /**
     * 获取聚类图层（异步版本）
     */
    getLayersAsync(currentZoom?: number): Promise<DeckGLLayer[]>;
    /**
     * 获取聚类图层（同步版本，向后兼容）
     */
    getLayers(currentZoom?: number): DeckGLLayer[];
    /**
     * 获取聚类
     */
    getCluster(clusterId: string): ClusterOptions | undefined;
    /**
     * 获取所有聚类
     */
    getAllClusters(): ClusterOptions[];
    /**
     * 获取聚类统计信息（异步）
     */
    getStatsAsync(clusterId: string, zoom?: number): Promise<{
        totalPoints: number;
        clusterCount: number;
        avgClusterSize: number;
        maxClusterSize: number;
    } | null>;
    /**
     * 获取聚类统计信息（同步，向后兼容）
     */
    getStats(clusterId: string, zoom?: number): {
        totalPoints: number;
        clusterCount: number;
        avgClusterSize: number;
        maxClusterSize: number;
    } | null;
    /**
     * 清除缓存
     */
    clearCache(): void;
    /**
     * 销毁管理器
     */
    destroy(): void;
}
//# sourceMappingURL=ClusterManager.d.ts.map