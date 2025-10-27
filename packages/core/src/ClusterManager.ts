import { ScatterplotLayer, TextLayer } from '@deck.gl/layers';
import type { DeckGLLayer } from './types';
import { WorkerPool } from './workers/WorkerPool';
import type { ClusterWorkerMessage, ClusterWorkerResponse } from './workers/ClusterWorker';
import { Logger } from './Logger';

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
  radius?: number; // 聚类半径（像素）
  minPoints?: number; // 最小聚类点数
  maxZoom?: number; // 最大聚类缩放级别
  clusterColor?: number[];
  pointColor?: number[];
  showCount?: boolean;
  getPosition?: (d: any) => [number, number];
  getWeight?: (d: any) => number;
  radiusScale?: number;
  radiusMinPixels?: number;
  radiusMaxPixels?: number;
  useWorker?: boolean; // 是否使用WebWorker（默认true）
}

/**
 * ClusterManager - 聚类管理器
 * 实现基于网格的点聚类算法，支持WebWorker并行计算
 */
export class ClusterManager {
  private clusters: Map<string, ClusterOptions> = new Map();
  private clusterIdCounter = 0;
  private clusterCache: Map<string, { zoom: number; result: Cluster[] }> = new Map();
  private workerPool: WorkerPool<ClusterWorkerMessage['data'], Cluster[]> | null = null;
  private logger = Logger.getInstance();
  private useWorkerThreshold = 1000; // 超过1000个点使用Worker

  constructor() {
    // 初始化Worker池（仅在浏览器环境）
    if (typeof Worker !== 'undefined') {
      try {
        this.workerPool = new WorkerPool({
          maxWorkers: Math.min(navigator.hardwareConcurrency || 2, 4),
          workerScript: () => {
            // 创建内联Worker
            const workerCode = `
              ${this.getClusterWorkerCode()}
            `;
            const blob = new Blob([workerCode], { type: 'application/javascript' });
            return new Worker(URL.createObjectURL(blob));
          },
          timeout: 30000
        });
        this.logger.info('ClusterManager: Worker pool initialized');
      } catch (error) {
        this.logger.warn('ClusterManager: Failed to initialize worker pool, falling back to main thread', error);
      }
    }
  }

  /**
   * 获取Worker代码（内联）
   */
  private getClusterWorkerCode(): string {
    return `
      // ClusterWorker内联代码
      function performClustering(points, radius, minPoints, zoom, maxZoom) {
        if (zoom > maxZoom) {
          return points.map((point, index) => ({
            id: 'point-' + index,
            position: point.position,
            points: [point],
            count: 1,
            weight: point.weight || 1
          }));
        }

        const cellSize = radius / Math.pow(2, Math.min(zoom, 20));
        const grid = new Map();

        const toGridKey = (lng, lat) => {
          const x = Math.floor(lng / cellSize);
          const y = Math.floor(lat / cellSize);
          return x + ':' + y;
        };

        for (let i = 0; i < points.length; i++) {
          const point = points[i];
          const key = toGridKey(point.position[0], point.position[1]);
          
          if (!grid.has(key)) {
            grid.set(key, []);
          }
          grid.get(key).push(point);
        }

        const clusters = [];
        let clusterIndex = 0;

        grid.forEach((cellPoints) => {
          if (cellPoints.length >= minPoints) {
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

            const centerPosition = [
              result.weightedLng / result.totalWeight,
              result.weightedLat / result.totalWeight
            ];

            clusters.push({
              id: 'cluster-' + (clusterIndex++),
              position: centerPosition,
              points: cellPoints,
              count: cellPoints.length,
              weight: result.totalWeight
            });
          } else {
            cellPoints.forEach((point) => {
              clusters.push({
                id: 'point-' + (clusterIndex++),
                position: point.position,
                points: [point],
                count: 1,
                weight: point.weight || 1
              });
            });
          }
        });

        return clusters;
      }

      self.addEventListener('message', (event) => {
        const { type, data } = event.data;

        if (type === 'cluster' && data) {
          try {
            const { points, radius, minPoints, zoom, maxZoom, requestId } = data;
            const clusters = performClustering(points, radius, minPoints, zoom, maxZoom);

            self.postMessage({
              type: 'result',
              data: clusters,
              requestId
            });
          } catch (error) {
            self.postMessage({
              type: 'error',
              error: error.message,
              requestId: data.requestId
            });
          }
        }
      });
    `;
  }

  /**
   * 添加聚类
   */
  addCluster(options: ClusterOptions): string {
    const clusterId = options.id || `cluster-${++this.clusterIdCounter}`;
    const clusterWithId = { ...options, id: clusterId, useWorker: options.useWorker !== false };
    this.clusters.set(clusterId, clusterWithId);
    // 清除缓存
    this.clusterCache.delete(clusterId);
    return clusterId;
  }

  /**
   * 更新聚类
   */
  updateCluster(clusterId: string, updates: Partial<ClusterOptions>): void {
    const cluster = this.clusters.get(clusterId);
    if (cluster) {
      this.clusters.set(clusterId, { ...cluster, ...updates });
      // 清除缓存
      this.clusterCache.delete(clusterId);
    }
  }

  /**
   * 删除聚类
   */
  removeCluster(clusterId: string): void {
    this.clusters.delete(clusterId);
  }

  /**
   * 清空所有聚类
   */
  clear(): void {
    this.clusters.clear();
    this.clusterCache.clear();
  }

  /**
   * 执行聚类算法（优化版，支持WebWorker）
   */
  private async performClusteringAsync(
    clusterId: string,
    points: ClusterPoint[],
    radius: number,
    minPoints: number,
    zoom: number,
    maxZoom: number,
    useWorker: boolean
  ): Promise<Cluster[]> {
    // 检查缓存
    const cached = this.clusterCache.get(clusterId);
    if (cached && cached.zoom === zoom) {
      this.logger.debug(`ClusterManager: Cache hit for ${clusterId} at zoom ${zoom}`);
      return cached.result;
    }

    let clusters: Cluster[];

    // 决定是否使用Worker
    const shouldUseWorker = useWorker &&
      this.workerPool !== null &&
      points.length > this.useWorkerThreshold;

    if (shouldUseWorker) {
      this.logger.debug(`ClusterManager: Using Worker for ${points.length} points`);
      try {
        clusters = await this.workerPool!.execute({
          points,
          radius,
          minPoints,
          zoom,
          maxZoom
        });
      } catch (error) {
        this.logger.warn('ClusterManager: Worker failed, falling back to main thread', error);
        clusters = this.performClusteringSync(points, radius, minPoints, zoom, maxZoom);
      }
    } else {
      this.logger.debug(`ClusterManager: Using main thread for ${points.length} points`);
      clusters = this.performClusteringSync(points, radius, minPoints, zoom, maxZoom);
    }

    // 缓存结果
    this.clusterCache.set(clusterId, { zoom, result: clusters });

    return clusters;
  }

  /**
   * 同步聚类算法（主线程）
   */
  private performClusteringSync(
    points: ClusterPoint[],
    radius: number,
    minPoints: number,
    zoom: number,
    maxZoom: number
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
      return `${x}:${y}`; // 使用冒号分隔符，避免坐标混淆
    };

    // 优化：批量分配点到网格
    const gridKeys: string[] = new Array(points.length);
    for (let i = 0; i < points.length; i++) {
      const point = points[i];
      const key = toGridKey(point.position[0], point.position[1]);
      gridKeys[i] = key;

      if (!grid.has(key)) {
        grid.set(key, []);
      }
      grid.get(key)!.push(point);
    }

    // 生成聚类结果
    const clusters: Cluster[] = [];
    let clusterIndex = 0;

    grid.forEach((cellPoints) => {
      if (cellPoints.length >= minPoints) {
        // 优化：使用更高效的加权平均计算
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
    });

    return clusters;
  }

  /**
   * 获取聚类图层（异步版本）
   */
  async getLayersAsync(currentZoom: number = 10): Promise<DeckGLLayer[]> {
    const layers: DeckGLLayer[] = [];

    // 并行执行所有聚类计算
    const clusterPromises = Array.from(this.clusters.entries()).map(async ([clusterId, clusterOptions]) => {
      const {
        data,
        radius = 60,
        minPoints = 2,
        maxZoom = 15,
        clusterColor = [0, 140, 255, 200],
        pointColor = [255, 100, 0, 200],
        showCount = true,
        radiusScale = 1,
        radiusMinPixels = 5,
        radiusMaxPixels = 50,
        useWorker = true
      } = clusterOptions;

      // 执行聚类
      const clusteredData = await this.performClusteringAsync(
        clusterId,
        data,
        radius,
        minPoints,
        currentZoom,
        maxZoom,
        useWorker
      );

      return { clusterId, clusterOptions, clusteredData };
    });

    const clusterResults = await Promise.all(clusterPromises);

    // 为每个聚类结果创建图层
    clusterResults.forEach(({ clusterId, clusterOptions, clusteredData }) => {
      const {
        clusterColor = [0, 140, 255, 200],
        pointColor = [255, 100, 0, 200],
        showCount = true,
        radiusScale = 1,
        radiusMinPixels = 5,
        radiusMaxPixels = 50
      } = clusterOptions;

      // 创建散点图层
      const scatterLayer = new ScatterplotLayer({
        id: `${clusterOptions.id}-scatter`,
        data: clusteredData,
        pickable: true,
        opacity: 0.8,
        stroked: true,
        filled: true,
        radiusScale,
        radiusMinPixels,
        radiusMaxPixels,
        lineWidthMinPixels: 1,
        getPosition: (d: Cluster) => d.position,
        getRadius: (d: Cluster) => {
          // 聚类点半径根据点数缩放
          return d.count > 1 ? Math.sqrt(d.count) * 5 : 5;
        },
        getFillColor: (d: Cluster) => {
          return d.count > 1 ? clusterColor : pointColor;
        },
        getLineColor: [255, 255, 255, 200],
        updateTriggers: {
          getRadius: currentZoom,
          getFillColor: currentZoom
        }
      } as any);

      layers.push(scatterLayer);

      // 如果启用显示数量，添加文本图层
      if (showCount) {
        const textData = clusteredData.filter((d) => d.count > 1);

        if (textData.length > 0) {
          const textLayer = new TextLayer({
            id: `${clusterId}-text`,
            data: textData,
            pickable: false,
            getPosition: (d: Cluster) => d.position,
            getText: (d: Cluster) => String(d.count),
            getSize: 14,
            getColor: [255, 255, 255, 255],
            getTextAnchor: 'middle',
            getAlignmentBaseline: 'center',
            fontWeight: 'bold',
            updateTriggers: {
              getText: currentZoom
            }
          } as any);

          layers.push(textLayer);
        }
      }
    });

    return layers;
  }

  /**
   * 获取聚类图层（同步版本，向后兼容）
   */
  getLayers(currentZoom: number = 10): DeckGLLayer[] {
    const layers: DeckGLLayer[] = [];

    this.clusters.forEach((clusterOptions) => {
      const {
        data,
        radius = 60,
        minPoints = 2,
        maxZoom = 15,
        clusterColor = [0, 140, 255, 200],
        pointColor = [255, 100, 0, 200],
        showCount = true,
        radiusScale = 1,
        radiusMinPixels = 5,
        radiusMaxPixels = 50
      } = clusterOptions;

      // 执行同步聚类
      const clusteredData = this.performClusteringSync(
        data,
        radius,
        minPoints,
        currentZoom,
        maxZoom
      );

      // 创建散点图层
      const scatterLayer = new ScatterplotLayer({
        id: `${clusterOptions.id}-scatter`,
        data: clusteredData,
        pickable: true,
        opacity: 0.8,
        stroked: true,
        filled: true,
        radiusScale,
        radiusMinPixels,
        radiusMaxPixels,
        lineWidthMinPixels: 1,
        getPosition: (d: Cluster) => d.position,
        getRadius: (d: Cluster) => {
          return d.count > 1 ? Math.sqrt(d.count) * 5 : 5;
        },
        getFillColor: (d: Cluster) => {
          return d.count > 1 ? clusterColor : pointColor;
        },
        getLineColor: [255, 255, 255, 200],
        updateTriggers: {
          getRadius: currentZoom,
          getFillColor: currentZoom
        }
      } as any);

      layers.push(scatterLayer);

      // 如果启用显示数量，添加文本图层
      if (showCount) {
        const textData = clusteredData.filter((d) => d.count > 1);

        if (textData.length > 0) {
          const textLayer = new TextLayer({
            id: `${clusterOptions.id}-text`,
            data: textData,
            pickable: false,
            getPosition: (d: Cluster) => d.position,
            getText: (d: Cluster) => String(d.count),
            getSize: 14,
            getColor: [255, 255, 255, 255],
            getTextAnchor: 'middle',
            getAlignmentBaseline: 'center',
            fontWeight: 'bold',
            updateTriggers: {
              getText: currentZoom
            }
          } as any);

          layers.push(textLayer);
        }
      }
    });

    return layers;
  }

  /**
   * 获取聚类
   */
  getCluster(clusterId: string): ClusterOptions | undefined {
    return this.clusters.get(clusterId);
  }

  /**
   * 获取所有聚类
   */
  getAllClusters(): ClusterOptions[] {
    return Array.from(this.clusters.values());
  }

  /**
   * 获取聚类统计信息（异步）
   */
  async getStatsAsync(clusterId: string, zoom: number = 10): Promise<{
    totalPoints: number;
    clusterCount: number;
    avgClusterSize: number;
    maxClusterSize: number;
  } | null> {
    const cluster = this.clusters.get(clusterId);
    if (!cluster) {
      return null;
    }

    const {
      data,
      radius = 60,
      minPoints = 2,
      maxZoom = 15,
      useWorker = true
    } = cluster;

    const clusteredData = await this.performClusteringAsync(
      clusterId,
      data,
      radius,
      minPoints,
      zoom,
      maxZoom,
      useWorker
    );

    const clusterSizes = clusteredData.map((c) => c.count);
    const totalClusters = clusteredData.filter((c) => c.count > 1).length;

    return {
      totalPoints: data.length,
      clusterCount: totalClusters,
      avgClusterSize: totalClusters > 0
        ? clusterSizes.reduce((sum, size) => sum + size, 0) / totalClusters
        : 0,
      maxClusterSize: Math.max(...clusterSizes, 0)
    };
  }

  /**
   * 获取聚类统计信息（同步，向后兼容）
   */
  getStats(clusterId: string, zoom: number = 10): {
    totalPoints: number;
    clusterCount: number;
    avgClusterSize: number;
    maxClusterSize: number;
  } | null {
    const cluster = this.clusters.get(clusterId);
    if (!cluster) {
      return null;
    }

    const {
      data,
      radius = 60,
      minPoints = 2,
      maxZoom = 15
    } = cluster;

    const clusteredData = this.performClusteringSync(
      data,
      radius,
      minPoints,
      zoom,
      maxZoom
    );

    const clusterSizes = clusteredData.map((c) => c.count);
    const totalClusters = clusteredData.filter((c) => c.count > 1).length;

    return {
      totalPoints: data.length,
      clusterCount: totalClusters,
      avgClusterSize: totalClusters > 0
        ? clusterSizes.reduce((sum, size) => sum + size, 0) / totalClusters
        : 0,
      maxClusterSize: Math.max(...clusterSizes, 0)
    };
  }

  /**
   * 清除缓存
   */
  clearCache(): void {
    this.clusterCache.clear();
    this.logger.info('ClusterManager: Cache cleared');
  }

  /**
   * 销毁管理器
   */
  destroy(): void {
    this.clear();
    this.clearCache();

    if (this.workerPool) {
      this.workerPool.destroy();
      this.workerPool = null;
      this.logger.info('ClusterManager: Worker pool destroyed');
    }
  }
}

