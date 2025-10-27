/**
 * MemoryManager - 内存管理器
 * 自动监控和优化内存使用，防止内存泄漏
 */
export interface MemoryManagerOptions {
    maxMemoryMB?: number;
    checkInterval?: number;
    autoCleanup?: boolean;
    gcThreshold?: number;
    onMemoryWarning?: (usage: number) => void;
    onMemoryError?: (usage: number) => void;
}
export declare class MemoryManager {
    private options;
    private logger;
    private checkTimer;
    private cleanupCallbacks;
    private memoryHistory;
    private isMonitoring;
    constructor(options?: MemoryManagerOptions);
    /**
     * 开始监控内存
     */
    startMonitoring(): void;
    /**
     * 停止监控
     */
    stopMonitoring(): void;
    /**
     * 检查内存使用
     */
    private checkMemory;
    /**
     * 获取内存使用情况
     */
    getMemoryUsage(): {
        used: number;
        total: number;
        limit: number;
    } | null;
    /**
     * 注册清理回调
     */
    registerCleanupCallback(callback: () => void): () => void;
    /**
     * 执行清理
     */
    performCleanup(): void;
    /**
     * 紧急清理
     */
    private performEmergencyCleanup;
    /**
     * 获取内存趋势
     */
    getMemoryTrend(): 'increasing' | 'decreasing' | 'stable';
    /**
     * 获取内存统计
     */
    getStats(): {
        current: number;
        average: number;
        min: number;
        max: number;
        trend: string;
    };
    /**
     * 清除历史记录
     */
    clearHistory(): void;
    /**
     * 检查是否有内存泄漏
     */
    detectMemoryLeak(): boolean;
    /**
     * 获取内存报告
     */
    getReport(): string;
    /**
     * 销毁管理器
     */
    destroy(): void;
}
/**
 * 全局内存管理器实例
 */
export declare const globalMemoryManager: MemoryManager;
//# sourceMappingURL=MemoryManager.d.ts.map