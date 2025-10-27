/**
 * LayerManager - 图层管理器
 * 提供图层的增删改查、排序、分组等高级功能
 */
import type { DeckGLLayer } from './types';
export interface LayerInfo {
    id: string;
    name: string;
    type: string;
    visible: boolean;
    opacity: number;
    zIndex: number;
    group?: string;
    metadata?: Record<string, any>;
    layer: DeckGLLayer;
}
export interface LayerGroup {
    id: string;
    name: string;
    visible: boolean;
    expanded: boolean;
    layers: string[];
}
export declare class LayerManager {
    private layers;
    private groups;
    private logger;
    private onLayersChange?;
    constructor(onLayersChange?: () => void);
    /**
     * 添加图层
     */
    addLayer(layer: DeckGLLayer, options?: Partial<LayerInfo>): void;
    /**
     * 移除图层
     */
    removeLayer(layerId: string): boolean;
    /**
     * 获取图层
     */
    getLayer(layerId: string): LayerInfo | undefined;
    /**
     * 获取所有图层
     */
    getAllLayers(): LayerInfo[];
    /**
     * 获取可见图层
     */
    getVisibleLayers(): DeckGLLayer[];
    /**
     * 设置图层可见性
     */
    setLayerVisibility(layerId: string, visible: boolean): void;
    /**
     * 切换图层可见性
     */
    toggleLayerVisibility(layerId: string): void;
    /**
     * 设置图层透明度
     */
    setLayerOpacity(layerId: string, opacity: number): void;
    /**
     * 设置图层层级
     */
    setLayerZIndex(layerId: string, zIndex: number): void;
    /**
     * 将图层移到顶部
     */
    bringLayerToFront(layerId: string): void;
    /**
     * 将图层移到底部
     */
    sendLayerToBack(layerId: string): void;
    /**
     * 创建分组
     */
    createGroup(id: string, name: string): void;
    /**
     * 移除分组
     */
    removeGroup(groupId: string): void;
    /**
     * 将图层添加到分组
     */
    addLayerToGroup(layerId: string, groupId: string): void;
    /**
     * 设置分组可见性
     */
    setGroupVisibility(groupId: string, visible: boolean): void;
    /**
     * 获取所有分组
     */
    getAllGroups(): LayerGroup[];
    /**
     * 获取分组
     */
    getGroup(groupId: string): LayerGroup | undefined;
    /**
     * 获取分组中的图层
     */
    getLayersInGroup(groupId: string): LayerInfo[];
    /**
     * 清空所有图层
     */
    clearLayers(): void;
    /**
     * 清空所有分组
     */
    clearGroups(): void;
    /**
     * 根据条件筛选图层
     */
    filterLayers(predicate: (layerInfo: LayerInfo) => boolean): LayerInfo[];
    /**
     * 根据类型获取图层
     */
    getLayersByType(type: string): LayerInfo[];
    /**
     * 根据分组获取图层
     */
    getLayersByGroup(groupId: string): LayerInfo[];
    /**
     * 获取图层数量
     */
    getLayerCount(): number;
    /**
     * 获取可见图层数量
     */
    getVisibleLayerCount(): number;
    /**
     * 更新图层元数据
     */
    updateLayerMetadata(layerId: string, metadata: Record<string, any>): void;
    /**
     * 获取图层元数据
     */
    getLayerMetadata(layerId: string): Record<string, any> | undefined;
    /**
     * 批量更新图层
     */
    batchUpdate(updates: Array<{
        layerId: string;
        updates: Partial<LayerInfo>;
    }>): void;
    /**
     * 导出配置
     */
    exportConfig(): {
        layers: Array<Omit<LayerInfo, 'layer'>>;
        groups: LayerGroup[];
    };
    /**
     * 导入配置
     */
    importConfig(config: {
        layers: Array<Omit<LayerInfo, 'layer'>>;
        groups: LayerGroup[];
    }): void;
    /**
     * 通知变化
     */
    private notifyChange;
    /**
     * 销毁管理器
     */
    destroy(): void;
}
//# sourceMappingURL=LayerManager.d.ts.map