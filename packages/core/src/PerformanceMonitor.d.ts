/**
 * PerformanceMonitor - 性能监控器
 * 监控FPS、内存使用、渲染时间等性能指标
 */
export interface PerformanceStats {
    fps: number;
    frameTime: number;
    memory?: {
        used: number;
        total: number;
        limit: number;
    };
    renderTime: number;
    layerCount: number;
    markerCount: number;
}
export interface PerformanceMonitorOptions {
    position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
    updateInterval?: number;
    showFPS?: boolean;
    showMemory?: boolean;
    showRenderTime?: boolean;
    showLayerCount?: boolean;
    style?: Partial<CSSStyleDeclaration>;
}
export declare class PerformanceMonitor {
    private container;
    private panelElement;
    private options;
    private stats;
    private frameCount;
    private lastTime;
    private updateTimer;
    private fpsHistory;
    private maxHistoryLength;
    constructor(container: HTMLElement, options?: PerformanceMonitorOptions);
    private create;
    private startMonitoring;
    private updateStats;
    private updateDisplay;
    private createMiniChart;
    private getFPSColor;
    private getMemoryColor;
    private getPositionStyles;
    private applyStyles;
    /**
     * 手动更新统计数据
     */
    setStats(stats: Partial<PerformanceStats>): void;
    /**
     * 获取当前统计数据
     */
    getStats(): PerformanceStats;
    /**
     * 获取平均FPS
     */
    getAverageFPS(): number;
    /**
     * 获取最小FPS
     */
    getMinFPS(): number;
    /**
     * 获取最大FPS
     */
    getMaxFPS(): number;
    /**
     * 显示监控面板
     */
    show(): void;
    /**
     * 隐藏监控面板
     */
    hide(): void;
    /**
     * 切换显示状态
     */
    toggle(): void;
    /**
     * 重置统计
     */
    reset(): void;
    /**
     * 销毁监控器
     */
    destroy(): void;
}
//# sourceMappingURL=PerformanceMonitor.d.ts.map