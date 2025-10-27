import type { DeckGLLayer } from './types';
/**
 * 标记点样式类型
 */
export type MarkerStyle = 'circle' | 'square' | 'triangle' | 'diamond' | 'pin' | 'icon' | 'custom';
/**
 * 标记点动画类型
 */
export type MarkerAnimation = 'none' | 'pulse' | 'bounce' | 'spin' | 'ripple';
/**
 * 标记点基础配置
 */
export interface MarkerOptions {
    id?: string;
    position: [number, number];
    style?: MarkerStyle;
    size?: number;
    color?: number[] | ((marker: MarkerOptions) => number[]);
    icon?: string | MarkerIconOptions;
    label?: MarkerLabelOptions;
    animation?: MarkerAnimation;
    animationDuration?: number;
    opacity?: number;
    pickable?: boolean;
    visible?: boolean;
    zIndex?: number;
    data?: any;
    onClick?: (marker: MarkerOptions, event: any) => void;
    onHover?: (marker: MarkerOptions, event: any) => void;
}
/**
 * 图标标记配置
 */
export interface MarkerIconOptions {
    url: string;
    width?: number;
    height?: number;
    anchorX?: number;
    anchorY?: number;
    mask?: boolean;
    maskColor?: number[];
}
/**
 * 标记标签配置
 */
export interface MarkerLabelOptions {
    text: string;
    offset?: [number, number];
    fontSize?: number;
    fontFamily?: string;
    fontWeight?: string | number;
    color?: number[];
    backgroundColor?: number[];
    backgroundPadding?: number[];
    anchor?: 'start' | 'middle' | 'end';
    alignment?: 'top' | 'center' | 'bottom';
    maxWidth?: number;
    visible?: boolean;
}
/**
 * 标记组配置
 */
export interface MarkerGroupOptions {
    id: string;
    markers: MarkerOptions[];
    style?: Partial<MarkerOptions>;
    clustering?: boolean;
    clusterRadius?: number;
    clusterMinPoints?: number;
}
/**
 * 自定义标记渲染器
 */
export type CustomMarkerRenderer = (marker: MarkerOptions) => {
    type: 'svg' | 'html' | 'canvas';
    content: string | HTMLElement | (() => void);
    width: number;
    height: number;
};
/**
 * MarkerRenderer - 标记点渲染器
 * 支持多种标记样式和自定义
 */
export declare class MarkerRenderer {
    private markers;
    private markerGroups;
    private markerLayers;
    private customRenderers;
    private markerIdCounter;
    private animationTimer;
    private animationTime;
    private animationCallbackId;
    private logger;
    private needsUpdate;
    constructor();
    /**
     * 检查是否有动画标记
     */
    private hasAnimatedMarkers;
    /**
     * 添加单个标记
     */
    addMarker(marker: MarkerOptions): string;
    /**
     * 注册标记动画到批处理器
     */
    private registerMarkerAnimation;
    /**
     * 批量添加标记
     */
    addMarkers(markers: MarkerOptions[]): string[];
    /**
     * 添加标记组
     */
    addMarkerGroup(group: MarkerGroupOptions): void;
    /**
     * 更新标记
     */
    updateMarker(markerId: string, updates: Partial<MarkerOptions>): void;
    /**
     * 删除标记
     */
    removeMarker(markerId: string): void;
    /**
     * 删除标记组
     */
    removeMarkerGroup(groupId: string): void;
    /**
     * 清空所有标记
     */
    clearMarkers(): void;
    /**
     * 注册自定义标记渲染器
     */
    registerCustomRenderer(style: string, renderer: CustomMarkerRenderer): void;
    /**
     * 更新标记图层
     */
    private updateMarkerLayers;
    /**
     * 按样式分组标记
     */
    private groupMarkersByStyle;
    /**
     * 根据样式创建主图层（不包含水波纹）
     */
    private createMainLayerForStyle;
    /**
     * 创建主形状图层
     */
    private createMainShapeLayer;
    /**
     * 创建图钉图层
     */
    private createPinLayer;
    /**
     * 创建图标图层
     */
    private createIconLayer;
    /**
     * 创建标签图层
     */
    private createLabelLayer;
    /**
     * 获取所有图层
     */
    getLayers(): DeckGLLayer[];
    /**
     * 启动动画循环（已废弃，使用AnimationBatcher）
     * @deprecated 使用 AnimationBatcher 替代
     */
    private startAnimationLoop;
    /**
     * 停止动画循环（已废弃）
     * @deprecated 使用 AnimationBatcher 替代
     */
    private stopAnimationLoop;
    /**
     * 获取标记
     */
    getMarker(markerId: string): MarkerOptions | undefined;
    /**
     * 获取所有标记
     */
    getAllMarkers(): MarkerOptions[];
    /**
     * 通过条件查找标记
     */
    findMarkers(predicate: (marker: MarkerOptions) => boolean): MarkerOptions[];
    /**
     * 显示/隐藏标记
     */
    setMarkerVisibility(markerId: string, visible: boolean): void;
    /**
     * 批量显示/隐藏标记
     */
    setMarkersVisibility(markerIds: string[], visible: boolean): void;
    /**
     * 高亮标记
     */
    highlightMarker(markerId: string, highlightColor?: number[]): void;
    /**
     * 取消高亮
     */
    unhighlightMarker(markerId: string): void;
    /**
     * 设置标记动画
     */
    setMarkerAnimation(markerId: string, animation: MarkerAnimation, duration?: number): void;
    /**
     * 批量设置标记动画
     */
    setMarkersAnimation(markerIds: string[], animation: MarkerAnimation, duration?: number): void;
    /**
     * 获取动画统计
     */
    getAnimationStats(): {
        animatedMarkers: number;
        activeAnimations: number;
        fps: number;
    };
    /**
     * 销毁渲染器
     */
    destroy(): void;
}
//# sourceMappingURL=MarkerRenderer.d.ts.map