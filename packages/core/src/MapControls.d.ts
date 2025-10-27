/**
 * MapControls - 地图控制器组件
 * 提供缩放、定位、重置等控制按钮
 */
export interface MapControlsOptions {
    position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
    showZoom?: boolean;
    showCompass?: boolean;
    showHome?: boolean;
    showFullscreen?: boolean;
    showLocation?: boolean;
    zoomDelta?: number;
    style?: Partial<CSSStyleDeclaration>;
}
export declare class MapControls {
    private container;
    private controlsElement;
    private options;
    private onZoomIn?;
    private onZoomOut?;
    private onReset?;
    private onFullscreen?;
    private onLocation?;
    constructor(container: HTMLElement, options?: MapControlsOptions, callbacks?: {
        onZoomIn?: () => void;
        onZoomOut?: () => void;
        onReset?: () => void;
        onFullscreen?: () => void;
        onLocation?: () => void;
    });
    private create;
    private addZoomControls;
    private addButton;
    private createControlButton;
    private getPositionStyles;
    private applyStyles;
    private toggleFullscreen;
    show(): void;
    hide(): void;
    destroy(): void;
}
//# sourceMappingURL=MapControls.d.ts.map