/**
 * Quadtree - 四叉树空间索引
 * 用于高效的空间查询和视口裁剪
 */
export interface Point {
    x: number;
    y: number;
    data?: any;
}
export interface Bounds {
    x: number;
    y: number;
    width: number;
    height: number;
}
export interface QuadtreeOptions {
    bounds: Bounds;
    capacity?: number;
    maxDepth?: number;
}
/**
 * Quadtree - 四叉树主类
 */
export declare class Quadtree {
    private root;
    private pointCount;
    constructor(options: QuadtreeOptions);
    /**
     * 插入点
     */
    insert(point: Point): boolean;
    /**
     * 批量插入点
     */
    insertMany(points: Point[]): number;
    /**
     * 查询范围内的点
     */
    query(range: Bounds): Point[];
    /**
     * 查询圆形范围内的点
     */
    queryCircle(centerX: number, centerY: number, radius: number): Point[];
    /**
     * 查询最近的N个点
     */
    queryNearest(x: number, y: number, count?: number, maxRadius?: number): Point[];
    /**
     * 获取所有点
     */
    getAllPoints(): Point[];
    /**
     * 清空树
     */
    clear(): void;
    /**
     * 重建树（优化性能）
     */
    rebuild(): void;
    /**
     * 获取点数量
     */
    size(): number;
    /**
     * 获取边界
     */
    getBounds(): Bounds;
    /**
     * 获取统计信息
     */
    getStats(): {
        totalPoints: number;
        totalNodes: number;
        maxDepth: number;
        avgPointsPerNode: number;
        efficiency: number;
    };
    /**
     * 可视化调试（返回所有节点边界）
     */
    getDebugBounds(): Bounds[];
}
/**
 * GeoQuadtree - 地理坐标专用四叉树
 * 自动处理经纬度坐标
 */
export declare class GeoQuadtree extends Quadtree {
    constructor(options?: Partial<QuadtreeOptions>);
    /**
     * 插入地理点 [经度, 纬度]
     */
    insertGeoPoint(lng: number, lat: number, data?: any): boolean;
    /**
     * 批量插入地理点
     */
    insertGeoPoints(points: Array<{
        lng: number;
        lat: number;
        data?: any;
    }>): number;
    /**
     * 查询地理范围 [西, 南, 东, 北]
     */
    queryGeoRange(west: number, south: number, east: number, north: number): Point[];
    /**
     * 查询地理圆形范围（单位：度）
     */
    queryGeoCircle(lng: number, lat: number, radiusDegrees: number): Point[];
}
//# sourceMappingURL=Quadtree.d.ts.map