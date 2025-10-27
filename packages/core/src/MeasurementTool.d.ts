/**
 * MeasurementTool - 测量工具
 * 提供距离测量和面积测量功能
 */
/**
 * 计算两点之间的大圆距离（Haversine公式）
 * @param point1 第一个点 [经度, 纬度]
 * @param point2 第二个点 [经度, 纬度]
 * @returns 距离（米）
 */
export declare function calculateDistance(point1: [number, number], point2: [number, number]): number;
/**
 * 计算路径的总长度
 * @param path 路径点数组 [[经度, 纬度], ...]
 * @returns 总距离（米）
 */
export declare function calculatePathLength(path: [number, number][]): number;
/**
 * 计算多边形的面积（使用球面三角形公式）
 * @param polygon 多边形点数组 [[经度, 纬度], ...]
 * @returns 面积（平方米）
 */
export declare function calculatePolygonArea(polygon: [number, number][]): number;
/**
 * 格式化距离为人类可读的字符串
 * @param meters 距离（米）
 * @returns 格式化的字符串
 */
export declare function formatDistance(meters: number): string;
/**
 * 格式化面积为人类可读的字符串
 * @param squareMeters 面积（平方米）
 * @returns 格式化的字符串
 */
export declare function formatArea(squareMeters: number): string;
/**
 * 测量工具类型
 */
export type MeasurementType = 'distance' | 'area';
/**
 * 测量结果接口
 */
export interface MeasurementResult {
    type: MeasurementType;
    value: number;
    formatted: string;
    points: [number, number][];
}
/**
 * MeasurementTool 类
 */
export declare class MeasurementTool {
    private type;
    private points;
    private isActive;
    private onMeasure?;
    constructor(type: MeasurementType, onMeasure?: (result: MeasurementResult) => void);
    /**
     * 激活测量工具
     */
    activate(): void;
    /**
     * 停用测量工具
     */
    deactivate(): void;
    /**
     * 添加测量点
     */
    addPoint(point: [number, number]): void;
    /**
     * 移除最后一个点
     */
    removeLastPoint(): void;
    /**
     * 清空所有点
     */
    clearPoints(): void;
    /**
     * 完成测量
     */
    finish(): MeasurementResult | null;
    /**
     * 获取当前测量结果
     */
    getMeasurement(): MeasurementResult | null;
    /**
     * 更新测量（内部使用）
     */
    private updateMeasurement;
    /**
     * 获取所有点
     */
    getPoints(): [number, number][];
    /**
     * 获取点数
     */
    getPointCount(): number;
    /**
     * 检查是否激活
     */
    isActivated(): boolean;
    /**
     * 获取测量类型
     */
    getType(): MeasurementType;
    /**
     * 设置测量类型
     */
    setType(type: MeasurementType): void;
}
/**
 * 创建距离测量工具
 */
export declare function createDistanceTool(onMeasure?: (result: MeasurementResult) => void): MeasurementTool;
/**
 * 创建面积测量工具
 */
export declare function createAreaTool(onMeasure?: (result: MeasurementResult) => void): MeasurementTool;
//# sourceMappingURL=MeasurementTool.d.ts.map