/**
 * 事件类型定义
 */
export type MapEventType = 'viewStateChange' | 'zoomStart' | 'zoomEnd' | 'panStart' | 'panEnd' | 'rotateStart' | 'rotateEnd' | 'click' | 'dblclick' | 'hover' | 'drag' | 'dragStart' | 'dragEnd' | 'layerAdd' | 'layerRemove' | 'load' | 'error';
/**
 * 事件处理函数类型
 */
export type EventHandler = (event: MapEvent) => void;
/**
 * 地图事件接口
 */
export interface MapEvent {
    type: MapEventType;
    data?: any;
    timestamp: number;
    target?: any;
}
/**
 * EventManager - 事件管理器
 * 提供事件监听和触发功能
 */
export declare class EventManager {
    private listeners;
    private eventHistory;
    private maxHistorySize;
    /**
     * 添加事件监听器
     */
    on(eventType: MapEventType, handler: EventHandler): () => void;
    /**
     * 添加一次性事件监听器
     */
    once(eventType: MapEventType, handler: EventHandler): () => void;
    /**
     * 移除事件监听器
     */
    off(eventType: MapEventType, handler?: EventHandler): void;
    /**
     * 移除所有事件监听器
     */
    removeAllListeners(): void;
    /**
     * 触发事件
     */
    emit(eventType: MapEventType, data?: any, target?: any): void;
    /**
     * 获取监听器数量
     */
    getListenerCount(eventType?: MapEventType): number;
    /**
     * 检查是否有监听器
     */
    hasListeners(eventType: MapEventType): boolean;
    /**
     * 获取所有事件类型
     */
    getEventTypes(): MapEventType[];
    /**
     * 添加到事件历史
     */
    private addToHistory;
    /**
     * 获取事件历史
     */
    getEventHistory(eventType?: MapEventType, limit?: number): MapEvent[];
    /**
     * 清除事件历史
     */
    clearEventHistory(): void;
    /**
     * 设置事件历史最大大小
     */
    setMaxHistorySize(size: number): void;
}
/**
 * 创建事件管理器实例
 */
export declare function createEventManager(): EventManager;
//# sourceMappingURL=EventManager.d.ts.map