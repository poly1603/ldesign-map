import type { DeckGLLayer } from './types';
/**
 * 路径数据接口
 */
export interface PathData {
    path: [number, number][];
    name?: string;
    color?: number[];
    width?: number;
    [key: string]: any;
}
/**
 * 弧线数据接口
 */
export interface ArcData {
    sourcePosition: [number, number];
    targetPosition: [number, number];
    name?: string;
    color?: number[];
    width?: number;
    [key: string]: any;
}
/**
 * 路径图层配置选项
 */
export interface PathLayerOptions {
    id?: string;
    data: PathData[];
    widthScale?: number;
    widthMinPixels?: number;
    widthMaxPixels?: number;
    rounded?: boolean;
    billboard?: boolean;
    miterLimit?: number;
    getPath?: (d: any) => [number, number][];
    getColor?: (d: any) => number[];
    getWidth?: (d: any) => number;
    pickable?: boolean;
    visible?: boolean;
    opacity?: number;
    capRounded?: boolean;
    jointRounded?: boolean;
    dashArray?: number[];
    dashJustified?: boolean;
    animated?: boolean;
    animationSpeed?: number;
}
/**
 * 弧线图层配置选项
 */
export interface ArcLayerOptions {
    id?: string;
    data: ArcData[];
    greatCircle?: boolean;
    numSegments?: number;
    widthUnits?: 'meters' | 'pixels';
    widthScale?: number;
    widthMinPixels?: number;
    widthMaxPixels?: number;
    getSourcePosition?: (d: any) => [number, number];
    getTargetPosition?: (d: any) => [number, number];
    getSourceColor?: (d: any) => number[];
    getTargetColor?: (d: any) => number[];
    getWidth?: (d: any) => number;
    getHeight?: (d: any) => number;
    getTilt?: (d: any) => number;
    pickable?: boolean;
    visible?: boolean;
    opacity?: number;
}
/**
 * PathRenderer - 路径渲染器
 * 用于绘制路线、轨迹和弧线
 */
export declare class PathRenderer {
    private paths;
    private arcs;
    private pathIdCounter;
    private arcIdCounter;
    private animationTimer;
    private dashOffset;
    /**
     * 添加路径
     */
    addPath(options: PathLayerOptions): string;
    /**
     * 更新路径
     */
    updatePath(pathId: string, updates: Partial<PathLayerOptions>): void;
    /**
     * 删除路径
     */
    removePath(pathId: string): void;
    /**
     * 添加弧线
     */
    addArc(options: ArcLayerOptions): string;
    /**
     * 更新弧线
     */
    updateArc(arcId: string, updates: Partial<ArcLayerOptions>): void;
    /**
     * 删除弧线
     */
    removeArc(arcId: string): void;
    /**
     * 清空所有路径和弧线
     */
    clear(): void;
    /**
     * 获取所有图层
     */
    getLayers(): DeckGLLayer[];
    /**
     * 启动动画循环
     */
    private startAnimationLoop;
    /**
     * 停止动画循环
     */
    private stopAnimationLoop;
    /**
     * 获取路径
     */
    getPath(pathId: string): PathLayerOptions | undefined;
    /**
     * 获取所有路径
     */
    getAllPaths(): PathLayerOptions[];
    /**
     * 获取弧线
     */
    getArc(arcId: string): ArcLayerOptions | undefined;
    /**
     * 获取所有弧线
     */
    getAllArcs(): ArcLayerOptions[];
    /**
     * 设置路径可见性
     */
    setPathVisibility(pathId: string, visible: boolean): void;
    /**
     * 设置弧线可见性
     */
    setArcVisibility(arcId: string, visible: boolean): void;
}
//# sourceMappingURL=PathRenderer.d.ts.map