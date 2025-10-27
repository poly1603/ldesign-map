/**
 * AnimationController - 动画控制器
 * 统一管理地图动画，提供流畅的动画体验
 */
export interface AnimationOptions {
    duration?: number;
    easing?: (t: number) => number;
    loop?: boolean;
    autoStart?: boolean;
    onStart?: () => void;
    onUpdate?: (progress: number) => void;
    onComplete?: () => void;
}
export interface Animation {
    id: string;
    startTime: number;
    duration: number;
    progress: number;
    loop: boolean;
    paused: boolean;
    easing: (t: number) => number;
    onUpdate: (progress: number) => void;
    onComplete?: () => void;
}
/**
 * 缓动函数集合
 */
export declare const Easings: {
    linear: (t: number) => number;
    easeInQuad: (t: number) => number;
    easeOutQuad: (t: number) => number;
    easeInOutQuad: (t: number) => number;
    easeInCubic: (t: number) => number;
    easeOutCubic: (t: number) => number;
    easeInOutCubic: (t: number) => number;
    easeInQuart: (t: number) => number;
    easeOutQuart: (t: number) => number;
    easeInOutQuart: (t: number) => number;
    easeInQuint: (t: number) => number;
    easeOutQuint: (t: number) => number;
    easeInOutQuint: (t: number) => number;
    easeInSine: (t: number) => number;
    easeOutSine: (t: number) => number;
    easeInOutSine: (t: number) => number;
    easeInExpo: (t: number) => number;
    easeOutExpo: (t: number) => number;
    easeInOutExpo: (t: number) => number;
    easeInCirc: (t: number) => number;
    easeOutCirc: (t: number) => number;
    easeInOutCirc: (t: number) => number;
    easeInElastic: (t: number) => number;
    easeOutElastic: (t: number) => number;
    easeInOutElastic: (t: number) => number;
    easeInBack: (t: number) => number;
    easeOutBack: (t: number) => number;
    easeInOutBack: (t: number) => number;
    easeInBounce: (t: number) => number;
    easeOutBounce: (t: number) => number;
    easeInOutBounce: (t: number) => number;
};
export declare class AnimationController {
    private animations;
    private animationFrameId;
    private isRunning;
    /**
     * 创建新动画
     */
    createAnimation(id: string, options?: AnimationOptions): string;
    /**
     * 开始所有动画
     */
    start(): void;
    /**
     * 暂停所有动画
     */
    pause(): void;
    /**
     * 暂停特定动画
     */
    pauseAnimation(id: string): void;
    /**
     * 恢复特定动画
     */
    resumeAnimation(id: string): void;
    /**
     * 停止特定动画
     */
    stopAnimation(id: string): void;
    /**
     * 停止所有动画
     */
    stopAll(): void;
    /**
     * 动画循环
     */
    private animate;
    /**
     * 获取动画进度
     */
    getProgress(id: string): number;
    /**
     * 检查动画是否正在运行
     */
    isAnimationRunning(id: string): boolean;
    /**
     * 获取所有活动动画
     */
    getActiveAnimations(): string[];
    /**
     * 获取动画数量
     */
    getAnimationCount(): number;
    /**
     * 销毁控制器
     */
    destroy(): void;
}
/**
 * 全局动画控制器实例
 */
export declare const globalAnimationController: AnimationController;
/**
 * 便捷的动画函数
 */
export declare function animate(options: AnimationOptions & {
    from: number;
    to: number;
}): Promise<void>;
//# sourceMappingURL=AnimationController.d.ts.map