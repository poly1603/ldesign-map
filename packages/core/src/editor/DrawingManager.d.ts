/**
 * DrawingManager - 地图绘制编辑器
 * 支持绘制点、线、面等几何图形
 */
import type { Feature, FeatureCollection } from '../types';
export type DrawingMode = 'none' | 'point' | 'line' | 'polygon' | 'rectangle' | 'circle';
export type DrawingEventType = 'drawstart' | 'drawend' | 'drawcancel' | 'vertexadd' | 'vertexmove' | 'vertexdelete';
export interface DrawingOptions {
    mode?: DrawingMode;
    strokeColor?: number[];
    fillColor?: number[];
    strokeWidth?: number;
    enableSnap?: boolean;
    snapDistance?: number;
    minVertices?: number;
    maxVertices?: number;
}
export interface DrawingFeature extends Feature {
    id: string;
    geometry: {
        type: 'Point' | 'LineString' | 'Polygon';
        coordinates: any;
    };
    properties: {
        drawingMode: DrawingMode;
        created: number;
        modified: number;
        [key: string]: any;
    };
}
export interface DrawingState {
    mode: DrawingMode;
    isDrawing: boolean;
    currentFeature: DrawingFeature | null;
    vertices: [number, number][];
    selectedFeature: string | null;
}
/**
 * DrawingManager - 绘制管理器
 */
export declare class DrawingManager {
    private container;
    private eventManager;
    private logger;
    private features;
    private featureIdCounter;
    private state;
    private options;
    private canvas;
    private ctx;
    private isEnabled;
    constructor(container: HTMLElement, options?: DrawingOptions);
    /**
     * 启用绘制功能
     */
    enable(): void;
    /**
     * 禁用绘制功能
     */
    disable(): void;
    /**
     * 创建绘制画布
     */
    private createCanvas;
    /**
     * 移除画布
     */
    private removeCanvas;
    /**
     * 绑定事件监听
     */
    private attachEventListeners;
    /**
     * 解绑事件监听
     */
    private detachEventListeners;
    /**
     * 处理点击事件
     */
    private handleClick;
    /**
     * 处理双击事件
     */
    private handleDoubleClick;
    /**
     * 处理鼠标移动
     */
    private handleMouseMove;
    /**
     * 处理右键菜单
     */
    private handleContextMenu;
    /**
     * 处理键盘事件
     */
    private handleKeyDown;
    /**
     * 获取地图坐标
     */
    private getMapCoordinates;
    /**
     * 添加点
     */
    private addPoint;
    /**
     * 添加顶点
     */
    private addVertex;
    /**
     * 开始绘制矩形
     */
    private startRectangle;
    /**
     * 开始绘制圆形
     */
    private startCircle;
    /**
     * 完成绘制
     */
    private finishDrawing;
    /**
     * 取消绘制
     */
    private cancelDrawing;
    /**
     * 重置绘制状态
     */
    private resetDrawingState;
    /**
     * 渲染画布
     */
    private render;
    /**
     * 渲染要素
     */
    private renderFeature;
    /**
     * 渲染绘制中的要素
     */
    private renderDrawing;
    /**
     * 生成要素ID
     */
    private generateFeatureId;
    /**
     * 设置绘制模式
     */
    setMode(mode: DrawingMode): void;
    /**
     * 获取当前模式
     */
    getMode(): DrawingMode;
    /**
     * 获取所有要素
     */
    getFeatures(): DrawingFeature[];
    /**
     * 获取GeoJSON格式
     */
    toGeoJSON(): FeatureCollection;
    /**
     * 删除要素
     */
    deleteFeature(id: string): boolean;
    /**
     * 清空所有要素
     */
    clear(): void;
    /**
     * 监听绘制事件
     */
    on(eventType: DrawingEventType, handler: (data: any) => void): () => void;
    /**
     * 销毁管理器
     */
    destroy(): void;
}
/**
 * 创建绘制管理器
 */
export declare function createDrawingManager(container: HTMLElement, options?: DrawingOptions): DrawingManager;
//# sourceMappingURL=DrawingManager.d.ts.map