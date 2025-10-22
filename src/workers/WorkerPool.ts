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

export class WorkerPool<T = any, R = any> {
  private workers: Worker[] = [];
  private availableWorkers: Worker[] = [];
  private taskQueue: WorkerTask<T, R>[] = [];
  private activeTasks: Map<string, WorkerTask<T, R>> = new Map();
  private maxWorkers: number;
  private workerScript: string | (() => Worker);
  private timeout: number;
  private isDestroyed = false;

  constructor(options: WorkerPoolOptions) {
    this.maxWorkers = options.maxWorkers || navigator.hardwareConcurrency || 4;
    this.workerScript = options.workerScript;
    this.timeout = options.timeout || 30000; // 30秒超时
  }

  /**
   * 执行任务
   */
  async execute(data: T, onProgress?: (progress: number) => void): Promise<R> {
    if (this.isDestroyed) {
      throw new Error('WorkerPool has been destroyed');
    }

    return new Promise((resolve, reject) => {
      const taskId = `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      const task: WorkerTask<T, R> = {
        id: taskId,
        data,
        resolve,
        reject,
        onProgress
      };

      this.taskQueue.push(task);
      this.processTasks();
    });
  }

  /**
   * 处理任务队列
   */
  private processTasks(): void {
    while (this.taskQueue.length > 0 && this.canProcessMore()) {
      const task = this.taskQueue.shift()!;
      const worker = this.getAvailableWorker();

      if (worker) {
        this.runTask(worker, task);
      } else {
        // 如果没有可用worker且未达到最大数量，创建新worker
        if (this.workers.length < this.maxWorkers) {
          const newWorker = this.createWorker();
          this.workers.push(newWorker);
          this.runTask(newWorker, task);
        } else {
          // 否则将任务放回队列
          this.taskQueue.unshift(task);
          break;
        }
      }
    }
  }

  /**
   * 检查是否可以处理更多任务
   */
  private canProcessMore(): boolean {
    return this.activeTasks.size < this.maxWorkers;
  }

  /**
   * 获取可用worker
   */
  private getAvailableWorker(): Worker | null {
    return this.availableWorkers.shift() || null;
  }

  /**
   * 创建worker实例
   */
  private createWorker(): Worker {
    if (typeof this.workerScript === 'function') {
      return this.workerScript();
    } else {
      return new Worker(this.workerScript);
    }
  }

  /**
   * 运行任务
   */
  private runTask(worker: Worker, task: WorkerTask<T, R>): void {
    this.activeTasks.set(task.id, task);

    // 设置超时
    const timeoutId = setTimeout(() => {
      this.handleTaskTimeout(task);
    }, this.timeout);

    // 设置消息监听
    const messageHandler = (event: MessageEvent) => {
      const { type, data, error, progress, requestId } = event.data;

      if (requestId !== task.id) return;

      if (type === 'progress' && task.onProgress) {
        task.onProgress(progress);
      } else if (type === 'result') {
        clearTimeout(timeoutId);
        worker.removeEventListener('message', messageHandler);
        worker.removeEventListener('error', errorHandler);

        this.activeTasks.delete(task.id);
        this.availableWorkers.push(worker);

        task.resolve(data);
        this.processTasks();
      } else if (type === 'error') {
        clearTimeout(timeoutId);
        worker.removeEventListener('message', messageHandler);
        worker.removeEventListener('error', errorHandler);

        this.activeTasks.delete(task.id);
        this.availableWorkers.push(worker);

        task.reject(new Error(error));
        this.processTasks();
      }
    };

    const errorHandler = (error: ErrorEvent) => {
      clearTimeout(timeoutId);
      worker.removeEventListener('message', messageHandler);
      worker.removeEventListener('error', errorHandler);

      this.activeTasks.delete(task.id);
      this.availableWorkers.push(worker);

      task.reject(new Error(error.message));
      this.processTasks();
    };

    worker.addEventListener('message', messageHandler);
    worker.addEventListener('error', errorHandler);

    // 发送任务
    worker.postMessage({
      type: 'cluster',
      data: {
        ...task.data,
        requestId: task.id
      }
    });
  }

  /**
   * 处理任务超时
   */
  private handleTaskTimeout(task: WorkerTask<T, R>): void {
    this.activeTasks.delete(task.id);
    task.reject(new Error(`Task timeout after ${this.timeout}ms`));
    this.processTasks();
  }

  /**
   * 获取统计信息
   */
  getStats(): {
    totalWorkers: number;
    availableWorkers: number;
    activeTasks: number;
    queuedTasks: number;
  } {
    return {
      totalWorkers: this.workers.length,
      availableWorkers: this.availableWorkers.length,
      activeTasks: this.activeTasks.size,
      queuedTasks: this.taskQueue.length
    };
  }

  /**
   * 销毁线程池
   */
  destroy(): void {
    if (this.isDestroyed) return;

    this.isDestroyed = true;

    // 终止所有worker
    this.workers.forEach(worker => worker.terminate());

    // 清空队列和活动任务
    this.workers = [];
    this.availableWorkers = [];
    this.taskQueue = [];

    // 拒绝所有活动任务
    this.activeTasks.forEach(task => {
      task.reject(new Error('WorkerPool destroyed'));
    });
    this.activeTasks.clear();
  }
}

