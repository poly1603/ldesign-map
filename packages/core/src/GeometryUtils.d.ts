/**
 * GeometryUtils - 几何工具集
 * 提供常用的几何计算功能
 */
export interface Point {
    x: number;
    y: number;
}
export interface Bounds {
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
}
export declare class GeometryUtils {
    /**
     * 计算两点之间的距离（Haversine公式）
     */
    static haversineDistance(lng1: number, lat1: number, lng2: number, lat2: number): number;
    /**
     * 计算多边形面积（球面三角形公式）
     */
    static polygonArea(coordinates: number[][]): number;
    /**
     * 计算路径长度
     */
    static pathLength(coordinates: number[][]): number;
    /**
     * 计算多边形的质心
     */
    static polygonCentroid(coordinates: number[][]): [number, number] | null;
    /**
     * 检查点是否在多边形内（射线法）
     */
    static pointInPolygon(point: [number, number], polygon: number[][]): boolean;
    /**
     * 计算边界框
     */
    static calculateBounds(coordinates: number[][]): Bounds;
    /**
     * 计算两个边界框的交集
     */
    static intersectBounds(b1: Bounds, b2: Bounds): Bounds | null;
    /**
     * 检查两个边界框是否相交
     */
    static boundsIntersect(b1: Bounds, b2: Bounds): boolean;
    /**
     * 简化路径（Douglas-Peucker算法）
     */
    static simplifyPath(coordinates: number[][], tolerance?: number): number[][];
    /**
     * 计算点到线段的垂直距离
     */
    private static perpendicularDistance;
    /**
     * 插值计算两点之间的中间点
     */
    static interpolate(p1: [number, number], p2: [number, number], fraction: number): [number, number];
    /**
     * 计算方位角（从北方顺时针）
     */
    static bearing(lng1: number, lat1: number, lng2: number, lat2: number): number;
    /**
     * 根据距离和方位角计算目标点
     */
    static destination(lng: number, lat: number, distance: number, bearing: number): [number, number];
    /**
     * 格式化距离
     */
    static formatDistance(meters: number): string;
    /**
     * 格式化面积
     */
    static formatArea(squareMeters: number): string;
    /**
     * 创建缓冲区（简化版）
     */
    static createBuffer(point: [number, number], radiusMeters: number, segments?: number): number[][];
    /**
     * 计算线段与线段的交点
     */
    static lineIntersection(p1: [number, number], p2: [number, number], p3: [number, number], p4: [number, number]): [number, number] | null;
}
//# sourceMappingURL=GeometryUtils.d.ts.map