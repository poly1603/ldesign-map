/**
 * AnimationBatcher - 动画批处理器
 * 统一管理所有动画更新，减少重绘次数，提升性能
 */
export type AnimationEasing = 'linear' | 'easeIn' | 'easeOut' | 'easeInOut' | 'bounce';
export interface AnimationConfig {
    id: string;
    duration: number;
    loop?: boolean;
    easing?: AnimationEasing;
    delay?: number;
    onUpdate?: (progress: number, value: any) => void;
    onComplete?: () => void;
    paused?: boolean;
}
export interface AnimationState {
    config: AnimationConfig;
    startTime: number;
    currentTime: number;
    progress: number;
    completed: boolean;
    pausedAt?: number;
}
/**
 * AnimationBatcher - 动画批处理管理器
 */
export declare class AnimationBatcher {
    private animations;
    private rafId;
    private lastFrameTime;
    private updateCallbacks;
    private isRunning;
    private frameCount;
    private fps;
    private targetFPS;
    private fpsHistory;
    constructor();
    /**
     * 添加动画
     */
    add(config: AnimationConfig): void;
    /**
     * 移除动画
     */
    remove(id: string): void;
    /**
     * 暂停动画
     */
    pause(id: string): void;
    /**
     * 恢复动画
     */
    resume(id: string): void;
    /**
     * 暂停所有动画
     */
    pauseAll(): void;
    /**
     * 恢复所有动画
     */
    resumeAll(): void;
    /**
     * 清空所有动画
     */
    clear(): void;
    /**
     * 注册更新回调
     */
    onUpdate(callback: (deltaTime: number) => void): () => void;
    /**
     * 启动动画循环
     */
    private start;
    /**
     * 停止动画循环
     */
    private stop;
    /**
     * 动画帧回调
     */
    private tick;
    /**
     * 更新所有动画状态
     */
    private updateAnimations;
    /**
     * 获取动画状态
     */
    getAnimation(id: string): AnimationState | undefined;
    /**
     * 获取所有动画
     */
    getAllAnimations(): AnimationState[];
    /**
     * 获取统计信息
     */
    getStats(): {
        activeAnimations: number;
        fps: number;
        isRunning: boolean;
        frameCount: number;
    };
    /**
     * 设置目标FPS
     */
    setTargetFPS(fps: number): void;
    /**
     * 销毁批处理器
     */
    destroy(): void;
}
/**
 * 全局动画批处理器实例
 */
export declare const globalAnimationBatcher: AnimationBatcher;
/**
 * 便捷动画函数
 */
export declare function animate(config: Omit<AnimationConfig, 'id'>): string;
/**
 * 停止动画
 */
export declare function stopAnimation(id: string): void;
/**
 * 暂停/恢复动画
 */
export declare function pauseAnimation(id: string): void;
export declare function resumeAnimation(id: string): void;
//# sourceMappingURL=AnimationBatcher.d.ts.map