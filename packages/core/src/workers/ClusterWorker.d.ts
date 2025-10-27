/**
 * ClusterWorker - 聚类计算WebWorker
 * 在后台线程执行聚类算法，避免阻塞主线程
 */
import type { ClusterPoint, Cluster } from '../ClusterManager';
export interface ClusterWorkerMessage {
    type: 'cluster' | 'cancel';
    data?: {
        points: ClusterPoint[];
        radius: number;
        minPoints: number;
        zoom: number;
        maxZoom: number;
        requestId?: string;
    };
}
export interface ClusterWorkerResponse {
    type: 'result' | 'error' | 'progress';
    data?: Cluster[];
    error?: string;
    progress?: number;
    requestId?: string;
}
/**
 * 执行聚类算法（优化版）
 */
declare function performClustering(points: ClusterPoint[], radius: number, minPoints: number, zoom: number, maxZoom: number, onProgress?: (progress: number) => void): Cluster[];
export { performClustering };
//# sourceMappingURL=ClusterWorker.d.ts.map