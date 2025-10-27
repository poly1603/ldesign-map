/**
 * LayerPanel - 图层管理面板
 * 显示和控制地图图层的显示/隐藏
 */
export interface LayerInfo {
    id: string;
    name: string;
    visible: boolean;
    type: string;
}
export interface LayerPanelOptions {
    position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
    maxHeight?: number;
    onToggleLayer?: (layerId: string, visible: boolean) => void;
}
export declare class LayerPanel {
    private container;
    private panelElement;
    private options;
    private layers;
    constructor(container: HTMLElement, options?: LayerPanelOptions);
    private create;
    private renderContent;
    private createLayerItem;
    addLayer(layerId: string, name: string, type?: string, visible?: boolean): void;
    removeLayer(layerId: string): void;
    updateLayer(layerId: string, updates: Partial<LayerInfo>): void;
    clearLayers(): void;
    private getPositionStyles;
    show(): void;
    hide(): void;
    destroy(): void;
}
//# sourceMappingURL=LayerPanel.d.ts.map