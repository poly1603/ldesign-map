/**
 * GeometryEditor - 几何编辑器
 * 支持拖拽、删除、修改几何体
 */
import type { DrawingFeature } from './DrawingManager';
export type EditMode = 'select' | 'move' | 'vertex' | 'delete';
export interface EditOptions {
    vertexRadius?: number;
    selectColor?: number[];
    hoverColor?: number[];
    enableSnap?: boolean;
    snapDistance?: number;
}
export interface EditState {
    mode: EditMode;
    selectedFeature: string | null;
    selectedVertex: number | null;
    isDragging: boolean;
    dragStart: [number, number] | null;
}
/**
 * GeometryEditor - 几何编辑器
 */
export declare class GeometryEditor {
    private container;
    private eventManager;
    private logger;
    private features;
    private state;
    private options;
    private canvas;
    private ctx;
    constructor(container: HTMLElement, features: Map<string, DrawingFeature>, options?: EditOptions);
    /**
     * 创建编辑画布
     */
    private createCanvas;
    /**
     * 绑定事件
     */
    private attachEventListeners;
    /**
     * 处理鼠标按下
     */
    private handleMouseDown;
    /**
     * 处理鼠标移动
     */
    private handleMouseMove;
    /**
     * 处理鼠标释放
     */
    private handleMouseUp;
    /**
     * 处理点击
     */
    private handleClick;
    /**
     * 获取画布坐标
     */
    private getCanvasCoordinates;
    /**
     * 查找点位置的要素
     */
    private findFeatureAtPoint;
    /**
     * 检查点是否在要素内
     */
    private isPointInFeature;
    /**
     * 查找最近的顶点
     */
    private findNearestVertex;
    /**
     * 移动顶点
     */
    private moveVertex;
    /**
     * 移动整个要素
     */
    private moveFeature;
    /**
     * 删除要素
     */
    private deleteFeature;
    /**
     * 渲染画布
     */
    private render;
    /**
     * 渲染选中的要素
     */
    private renderSelectedFeature;
    /**
     * 更新光标样式
     */
    private updateCursor;
    /**
     * 点到线段的距离
     */
    private distanceToSegment;
    /**
     * 判断点是否在多边形内
     */
    private isPointInPolygon;
    /**
     * 设置编辑模式
     */
    setMode(mode: EditMode): void;
    /**
     * 获取选中要素
     */
    getSelectedFeature(): DrawingFeature | null;
    /**
     * 监听编辑事件
     */
    on(eventType: string, handler: (data: any) => void): () => void;
    /**
     * 销毁编辑器
     */
    destroy(): void;
}
//# sourceMappingURL=GeometryEditor.d.ts.map