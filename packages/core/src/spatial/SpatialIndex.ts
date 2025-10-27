/**
 * SpatialIndex - 空间索引管理器
 * 集成Quadtree，提供高性能空间查询
 */

import { Quadtree, GeoQuadtree, type Point, type Bounds } from './Quadtree';
import { Logger } from '../Logger';

export interface SpatialIndexOptions {
  autoRebuild?: boolean;
  rebuildThreshold?: number; // 效率低于此值时重建（0-1）
  useGeo?: boolean; // 是否使用地理坐标
}

/**
 * SpatialIndex - 空间索引管理器
 */
export class SpatialIndex {
  private quadtree: Quadtree | GeoQuadtree;
  private logger = Logger.getInstance();
  private options: Required<SpatialIndexOptions>;
  private queryCount = 0;
  private totalQueryTime = 0;

  constructor(bounds: Bounds, options: SpatialIndexOptions = {}) {
    this.options = {
      autoRebuild: options.autoRebuild !== false,
      rebuildThreshold: options.rebuildThreshold || 0.3,
      useGeo: options.useGeo || false
    };

    if (this.options.useGeo) {
      this.quadtree = new GeoQuadtree({ bounds });
    } else {
      this.quadtree = new Quadtree({ bounds });
    }

    this.logger.info('SpatialIndex created', {
      bounds,
      useGeo: this.options.useGeo
    });
  }

  /**
   * 插入点
   */
  insert(point: Point): boolean {
    const result = this.quadtree.insert(point);

    // 自动重建检查
    if (this.options.autoRebuild && this.quadtree.size() % 1000 === 0) {
      this.checkAndRebuild();
    }

    return result;
  }

  /**
   * 批量插入
   */
  insertMany(points: Point[]): number {
    const startTime = performance.now();
    const inserted = this.quadtree.insertMany(points);
    const duration = performance.now() - startTime;

    this.logger.debug(`Inserted ${inserted} points in ${duration.toFixed(2)}ms`);

    // 批量插入后检查重建
    if (this.options.autoRebuild) {
      this.checkAndRebuild();
    }

    return inserted;
  }

  /**
   * 查询范围
   */
  query(range: Bounds): Point[] {
    const startTime = performance.now();
    const result = this.quadtree.query(range);
    const duration = performance.now() - startTime;

    this.queryCount++;
    this.totalQueryTime += duration;

    return result;
  }

  /**
   * 查询圆形范围
   */
  queryCircle(x: number, y: number, radius: number): Point[] {
    const startTime = performance.now();
    const result = this.quadtree.queryCircle(x, y, radius);
    const duration = performance.now() - startTime;

    this.queryCount++;
    this.totalQueryTime += duration;

    return result;
  }

  /**
   * 查询最近点
   */
  queryNearest(x: number, y: number, count: number = 1): Point[] {
    return this.quadtree.queryNearest(x, y, count);
  }

  /**
   * 视口裁剪（返回视口内的点）
   */
  clipToViewport(viewport: Bounds): Point[] {
    return this.query(viewport);
  }

  /**
   * 检查并重建索引
   */
  private checkAndRebuild(): void {
    const stats = this.quadtree.getStats();

    if (stats.efficiency < this.options.rebuildThreshold) {
      this.logger.info(`Rebuilding index (efficiency: ${(stats.efficiency * 100).toFixed(1)}%)`);
      const startTime = performance.now();

      this.quadtree.rebuild();

      const duration = performance.now() - startTime;
      const newStats = this.quadtree.getStats();

      this.logger.info(`Index rebuilt in ${duration.toFixed(2)}ms`, {
        oldEfficiency: stats.efficiency,
        newEfficiency: newStats.efficiency
      });
    }
  }

  /**
   * 手动重建索引
   */
  rebuild(): void {
    const startTime = performance.now();
    this.quadtree.rebuild();
    const duration = performance.now() - startTime;

    this.logger.info(`Index manually rebuilt in ${duration.toFixed(2)}ms`);
  }

  /**
   * 清空索引
   */
  clear(): void {
    this.quadtree.clear();
    this.queryCount = 0;
    this.totalQueryTime = 0;
  }

  /**
   * 获取统计信息
   */
  getStats(): {
    points: number;
    nodes: number;
    maxDepth: number;
    efficiency: number;
    avgQueryTime: number;
    totalQueries: number;
  } {
    const treeStats = this.quadtree.getStats();

    return {
      points: treeStats.totalPoints,
      nodes: treeStats.totalNodes,
      maxDepth: treeStats.maxDepth,
      efficiency: treeStats.efficiency,
      avgQueryTime: this.queryCount > 0 ? this.totalQueryTime / this.queryCount : 0,
      totalQueries: this.queryCount
    };
  }

  /**
   * 性能基准测试
   */
  async benchmark(testPoints: number = 10000): Promise<{
    insertTime: number;
    queryTime: number;
    pointsPerSecond: number;
    queriesPerSecond: number;
  }> {
    this.logger.info(`Running benchmark with ${testPoints} points...`);

    // 生成随机测试点
    const points: Point[] = [];
    const bounds = this.quadtree.getBounds();

    for (let i = 0; i < testPoints; i++) {
      points.push({
        x: bounds.x + Math.random() * bounds.width,
        y: bounds.y + Math.random() * bounds.height,
        data: { id: i }
      });
    }

    // 测试插入性能
    this.clear();
    const insertStart = performance.now();
    this.insertMany(points);
    const insertTime = performance.now() - insertStart;

    // 测试查询性能
    const queryStart = performance.now();
    const queryCount = 1000;

    for (let i = 0; i < queryCount; i++) {
      const x = bounds.x + Math.random() * bounds.width;
      const y = bounds.y + Math.random() * bounds.height;
      const range: Bounds = {
        x: x - bounds.width * 0.1,
        y: y - bounds.height * 0.1,
        width: bounds.width * 0.2,
        height: bounds.height * 0.2
      };
      this.query(range);
    }

    const queryTime = performance.now() - queryStart;

    const result = {
      insertTime,
      queryTime,
      pointsPerSecond: Math.round(testPoints / (insertTime / 1000)),
      queriesPerSecond: Math.round(queryCount / (queryTime / 1000))
    };

    this.logger.info('Benchmark results:', result);

    return result;
  }

  /**
   * 获取调试信息
   */
  getDebugInfo(): {
    bounds: Bounds[];
    stats: ReturnType<typeof this.getStats>;
  } {
    return {
      bounds: this.quadtree.getDebugBounds(),
      stats: this.getStats()
    };
  }
}

/**
 * 创建地理坐标索引
 */
export function createGeoIndex(options: SpatialIndexOptions = {}): SpatialIndex {
  const bounds: Bounds = {
    x: -180,
    y: -90,
    width: 360,
    height: 180
  };

  return new SpatialIndex(bounds, { ...options, useGeo: true });
}

/**
 * 创建平面坐标索引
 */
export function createPlanarIndex(bounds: Bounds, options: SpatialIndexOptions = {}): SpatialIndex {
  return new SpatialIndex(bounds, { ...options, useGeo: false });
}

