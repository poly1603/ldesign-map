/**
 * WorkerPool - Worker线程池管理
 * 复用Worker实例，提高性能
 */
export interface WorkerTask<T = any, R = any> {
    id: string;
    data: T;
    resolve: (result: R) => void;
    reject: (error: Error) => void;
    onProgress?: (progress: number) => void;
}
export interface WorkerPoolOptions {
    maxWorkers?: number;
    workerScript: string | (() => Worker);
    timeout?: number;
}
export declare class WorkerPool<T = any, R = any> {
    private workers;
    private availableWorkers;
    private taskQueue;
    private activeTasks;
    private maxWorkers;
    private workerScript;
    private timeout;
    private isDestroyed;
    constructor(options: WorkerPoolOptions);
    /**
     * 执行任务
     */
    execute(data: T, onProgress?: (progress: number) => void): Promise<R>;
    /**
     * 处理任务队列
     */
    private processTasks;
    /**
     * 检查是否可以处理更多任务
     */
    private canProcessMore;
    /**
     * 获取可用worker
     */
    private getAvailableWorker;
    /**
     * 创建worker实例
     */
    private createWorker;
    /**
     * 运行任务
     */
    private runTask;
    /**
     * 处理任务超时
     */
    private handleTaskTimeout;
    /**
     * 获取统计信息
     */
    getStats(): {
        totalWorkers: number;
        availableWorkers: number;
        activeTasks: number;
        queuedTasks: number;
    };
    /**
     * 销毁线程池
     */
    destroy(): void;
}
//# sourceMappingURL=WorkerPool.d.ts.map