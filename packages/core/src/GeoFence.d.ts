import type { DeckGLLayer } from './types';
/**
 * 围栏类型
 */
export type FenceType = 'polygon' | 'circle' | 'rectangle' | 'corridor';
/**
 * 围栏状态
 */
export type FenceStatus = 'active' | 'inactive' | 'warning' | 'alarming';
/**
 * 围栏事件类型
 */
export type FenceEventType = 'enter' | 'leave' | 'dwell' | 'cross';
/**
 * 围栏基础配置
 */
export interface GeoFenceOptions {
    id: string;
    name?: string;
    type: FenceType;
    coordinates: number[][];
    radius?: number;
    width?: number;
    status?: FenceStatus;
    color?: number[];
    fillColor?: number[];
    strokeColor?: number[];
    strokeWidth?: number;
    opacity?: number;
    visible?: boolean;
    enabled?: boolean;
    checkInterval?: number;
    dwellTime?: number;
    metadata?: any;
}
/**
 * 围栏事件
 */
export interface FenceEvent {
    type: FenceEventType;
    fenceId: string;
    targetId: string;
    position: [number, number];
    timestamp: number;
    data?: any;
}
/**
 * 监控目标
 */
export interface MonitorTarget {
    id: string;
    position: [number, number];
    data?: any;
}
/**
 * 围栏统计
 */
export interface FenceStatistics {
    fenceId: string;
    enterCount: number;
    leaveCount: number;
    currentCount: number;
    dwellCount: number;
    averageDwellTime: number;
    lastEvent?: FenceEvent;
}
/**
 * GeoFence - 地理围栏管理器
 * 支持多种围栏类型、事件监听、目标跟踪等
 */
export declare class GeoFence {
    private fences;
    private targets;
    private targetStates;
    private targetEnterTimes;
    private statistics;
    private eventListeners;
    private checkTimer;
    private layers;
    constructor();
    /**
     * 添加围栏
     */
    addFence(fence: GeoFenceOptions): void;
    /**
     * 批量添加围栏
     */
    addFences(fences: GeoFenceOptions[]): void;
    /**
     * 更新围栏
     */
    updateFence(fenceId: string, updates: Partial<GeoFenceOptions>): void;
    /**
     * 删除围栏
     */
    removeFence(fenceId: string): void;
    /**
     * 清空所有围栏
     */
    clearFences(): void;
    /**
     * 添加监控目标
     */
    addTarget(target: MonitorTarget): void;
    /**
     * 批量添加监控目标
     */
    addTargets(targets: MonitorTarget[]): void;
    /**
     * 更新目标位置
     */
    updateTarget(targetId: string, position: [number, number], data?: any): void;
    /**
     * 删除监控目标
     */
    removeTarget(targetId: string): void;
    /**
     * 清空所有目标
     */
    clearTargets(): void;
    /**
     * 监听围栏事件
     */
    on(eventType: FenceEventType, callback: (event: FenceEvent) => void): void;
    /**
     * 移除事件监听
     */
    off(eventType: FenceEventType, callback: (event: FenceEvent) => void): void;
    /**
     * 获取围栏统计信息
     */
    getStatistics(fenceId?: string): FenceStatistics | FenceStatistics[];
    /**
     * 获取围栏内的目标
     */
    getTargetsInFence(fenceId: string): MonitorTarget[];
    /**
     * 检查点是否在围栏内
     */
    isPointInFence(point: [number, number], fenceId: string): boolean;
    /**
     * 获取图层
     */
    getLayers(): DeckGLLayer[];
    /**
     * 启动监控
     */
    private startMonitoring;
    /**
     * 停止监控
     */
    private stopMonitoring;
    /**
     * 检查所有目标
     */
    private checkAllTargets;
    /**
     * 检查单个目标
     */
    private checkTarget;
    /**
     * 触发事件
     */
    private emitEvent;
    /**
     * 更新图层
     */
    private updateLayers;
    /**
     * 判断点是否在多边形内（射线法）
     */
    private isPointInPolygon;
    /**
     * 判断点是否在圆内
     */
    private isPointInCircle;
    /**
     * 判断点是否在矩形内
     */
    private isPointInRectangle;
    /**
     * 判断点是否在走廊内
     */
    private isPointInCorridor;
    /**
     * 矩形转多边形
     */
    private rectangleToPolygon;
    /**
     * 创建圆形多边形
     */
    private createCirclePolygon;
    /**
     * 创建走廊多边形
     */
    private createCorridorPolygon;
    /**
     * 计算两点距离
     */
    private calculateDistance;
    /**
     * 点到线段的距离
     */
    private pointToSegmentDistance;
}
/**
 * 创建地理围栏管理器
 */
export declare function createGeoFence(): GeoFence;
/**
 * 从 GeoJSON 创建围栏
 */
export declare function createFenceFromGeoJSON(geojson: any, options?: Partial<GeoFenceOptions>): GeoFenceOptions[];
//# sourceMappingURL=GeoFence.d.ts.map