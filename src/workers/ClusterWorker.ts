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

// Worker环境检测
const isWorkerContext = typeof self !== 'undefined' && typeof WorkerGlobalScope !== 'undefined';

/**
 * 执行聚类算法（优化版）
 */
function performClustering(
  points: ClusterPoint[],
  radius: number,
  minPoints: number,
  zoom: number,
  maxZoom: number,
  onProgress?: (progress: number) => void
): Cluster[] {
  // 如果缩放级别超过最大聚类级别，不进行聚类
  if (zoom > maxZoom) {
    return points.map((point, index) => ({
      id: `point-${index}`,
      position: point.position,
      points: [point],
      count: 1,
      weight: point.weight || 1
    }));
  }

  // 优化：使用更精确的网格大小计算
  const cellSize = radius / Math.pow(2, Math.min(zoom, 20));
  const grid: Map<string, ClusterPoint[]> = new Map();

  // 优化：使用整数网格坐标提升性能
  const toGridKey = (lng: number, lat: number): string => {
    const x = Math.floor(lng / cellSize);
    const y = Math.floor(lat / cellSize);
    return `${x}:${y}`;
  };

  // 批量分配点到网格（优化内存分配）
  const totalPoints = points.length;
  for (let i = 0; i < totalPoints; i++) {
    const point = points[i];
    const key = toGridKey(point.position[0], point.position[1]);

    if (!grid.has(key)) {
      grid.set(key, []);
    }
    grid.get(key)!.push(point);

    // 报告进度（每处理10%报告一次）
    if (onProgress && i % Math.ceil(totalPoints / 10) === 0) {
      onProgress((i / totalPoints) * 0.5); // 前50%进度用于网格分配
    }
  }

  // 生成聚类结果
  const clusters: Cluster[] = [];
  let clusterIndex = 0;
  const gridEntries = Array.from(grid.entries());
  const totalCells = gridEntries.length;

  gridEntries.forEach(([_, cellPoints], cellIndex) => {
    if (cellPoints.length >= minPoints) {
      // 优化：使用reduce一次性计算所有聚合值
      const result = cellPoints.reduce(
        (acc, point) => {
          const weight = point.weight || 1;
          acc.totalWeight += weight;
          acc.weightedLng += point.position[0] * weight;
          acc.weightedLat += point.position[1] * weight;
          return acc;
        },
        { totalWeight: 0, weightedLng: 0, weightedLat: 0 }
      );

      const centerPosition: [number, number] = [
        result.weightedLng / result.totalWeight,
        result.weightedLat / result.totalWeight
      ];

      clusters.push({
        id: `cluster-${clusterIndex++}`,
        position: centerPosition,
        points: cellPoints,
        count: cellPoints.length,
        weight: result.totalWeight
      });
    } else {
      // 单点不聚类
      cellPoints.forEach((point) => {
        clusters.push({
          id: `point-${clusterIndex++}`,
          position: point.position,
          points: [point],
          count: 1,
          weight: point.weight || 1
        });
      });
    }

    // 报告进度（后50%进度用于聚类生成）
    if (onProgress && cellIndex % Math.ceil(totalCells / 10) === 0) {
      onProgress(0.5 + (cellIndex / totalCells) * 0.5);
    }
  });

  return clusters;
}

/**
 * Worker消息处理
 */
if (isWorkerContext) {
  self.addEventListener('message', (event: MessageEvent<ClusterWorkerMessage>) => {
    const { type, data } = event.data;

    if (type === 'cluster' && data) {
      try {
        const { points, radius, minPoints, zoom, maxZoom, requestId } = data;

        // 执行聚类，带进度回调
        const clusters = performClustering(
          points,
          radius,
          minPoints,
          zoom,
          maxZoom,
          (progress) => {
            // 发送进度更新
            self.postMessage({
              type: 'progress',
              progress: Math.round(progress * 100),
              requestId
            } as ClusterWorkerResponse);
          }
        );

        // 发送结果
        self.postMessage({
          type: 'result',
          data: clusters,
          requestId
        } as ClusterWorkerResponse);
      } catch (error) {
        // 发送错误
        self.postMessage({
          type: 'error',
          error: error instanceof Error ? error.message : String(error),
          requestId: data.requestId
        } as ClusterWorkerResponse);
      }
    }
  });
}

// 导出用于非Worker环境
export { performClustering };

