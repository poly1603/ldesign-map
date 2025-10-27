/**
 * SpatialIndex - 空间索引管理器
 * 集成Quadtree，提供高性能空间查询
 */
import { type Point, type Bounds } from './Quadtree';
export interface SpatialIndexOptions {
    autoRebuild?: boolean;
    rebuildThreshold?: number;
    useGeo?: boolean;
}
/**
 * SpatialIndex - 空间索引管理器
 */
export declare class SpatialIndex {
    private quadtree;
    private logger;
    private options;
    private queryCount;
    private totalQueryTime;
    constructor(bounds: Bounds, options?: SpatialIndexOptions);
    /**
     * 插入点
     */
    insert(point: Point): boolean;
    /**
     * 批量插入
     */
    insertMany(points: Point[]): number;
    /**
     * 查询范围
     */
    query(range: Bounds): Point[];
    /**
     * 查询圆形范围
     */
    queryCircle(x: number, y: number, radius: number): Point[];
    /**
     * 查询最近点
     */
    queryNearest(x: number, y: number, count?: number): Point[];
    /**
     * 视口裁剪（返回视口内的点）
     */
    clipToViewport(viewport: Bounds): Point[];
    /**
     * 检查并重建索引
     */
    private checkAndRebuild;
    /**
     * 手动重建索引
     */
    rebuild(): void;
    /**
     * 清空索引
     */
    clear(): void;
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
    };
    /**
     * 性能基准测试
     */
    benchmark(testPoints?: number): Promise<{
        insertTime: number;
        queryTime: number;
        pointsPerSecond: number;
        queriesPerSecond: number;
    }>;
    /**
     * 获取调试信息
     */
    getDebugInfo(): {
        bounds: Bounds[];
        stats: ReturnType<typeof this.getStats>;
    };
}
/**
 * 创建地理坐标索引
 */
export declare function createGeoIndex(options?: SpatialIndexOptions): SpatialIndex;
/**
 * 创建平面坐标索引
 */
export declare function createPlanarIndex(bounds: Bounds, options?: SpatialIndexOptions): SpatialIndex;
//# sourceMappingURL=SpatialIndex.d.ts.map