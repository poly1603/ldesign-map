/**
 * AnimationBatcher - 动画批处理器
 * 统一管理所有动画更新，减少重绘次数，提升性能
 */

export type AnimationEasing = 'linear' | 'easeIn' | 'easeOut' | 'easeInOut' | 'bounce';

export interface AnimationConfig {
  id: string;
  duration: number; // 毫秒
  loop?: boolean;
  easing?: AnimationEasing;
  delay?: number; // 延迟启动（毫秒）
  onUpdate?: (progress: number, value: any) => void;
  onComplete?: () => void;
  paused?: boolean;
}

export interface AnimationState {
  config: AnimationConfig;
  startTime: number;
  currentTime: number;
  progress: number; // 0-1
  completed: boolean;
  pausedAt?: number;
}

/**
 * 缓动函数
 */
const easingFunctions: Record<AnimationEasing, (t: number) => number> = {
  linear: (t) => t,
  easeIn: (t) => t * t,
  easeOut: (t) => t * (2 - t),
  easeInOut: (t) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t),
  bounce: (t) => {
    const n1 = 7.5625;
    const d1 = 2.75;
    if (t < 1 / d1) {
      return n1 * t * t;
    } else if (t < 2 / d1) {
      return n1 * (t -= 1.5 / d1) * t + 0.75;
    } else if (t < 2.5 / d1) {
      return n1 * (t -= 2.25 / d1) * t + 0.9375;
    } else {
      return n1 * (t -= 2.625 / d1) * t + 0.984375;
    }
  }
};

/**
 * AnimationBatcher - 动画批处理管理器
 */
export class AnimationBatcher {
  private animations: Map<string, AnimationState> = new Map();
  private rafId: number | null = null;
  private lastFrameTime: number = 0;
  private updateCallbacks: Set<(deltaTime: number) => void> = new Set();
  private isRunning = false;
  private frameCount = 0;
  private fps = 60;
  private targetFPS = 60;
  private fpsHistory: number[] = [];

  constructor() {
    this.lastFrameTime = performance.now();
  }

  /**
   * 添加动画
   */
  add(config: AnimationConfig): void {
    const now = performance.now();

    this.animations.set(config.id, {
      config,
      startTime: now + (config.delay || 0),
      currentTime: now,
      progress: 0,
      completed: false,
      paused: config.paused || false
    });

    // 启动动画循环
    if (!this.isRunning) {
      this.start();
    }
  }

  /**
   * 移除动画
   */
  remove(id: string): void {
    this.animations.delete(id);

    // 如果没有动画了，停止循环
    if (this.animations.size === 0) {
      this.stop();
    }
  }

  /**
   * 暂停动画
   */
  pause(id: string): void {
    const animation = this.animations.get(id);
    if (animation && !animation.paused) {
      animation.pausedAt = performance.now();
      animation.config.paused = true;
    }
  }

  /**
   * 恢复动画
   */
  resume(id: string): void {
    const animation = this.animations.get(id);
    if (animation && animation.pausedAt) {
      const pauseDuration = performance.now() - animation.pausedAt;
      animation.startTime += pauseDuration;
      delete animation.pausedAt;
      animation.config.paused = false;
    }
  }

  /**
   * 暂停所有动画
   */
  pauseAll(): void {
    this.animations.forEach((_, id) => this.pause(id));
  }

  /**
   * 恢复所有动画
   */
  resumeAll(): void {
    this.animations.forEach((_, id) => this.resume(id));
  }

  /**
   * 清空所有动画
   */
  clear(): void {
    this.animations.clear();
    this.stop();
  }

  /**
   * 注册更新回调
   */
  onUpdate(callback: (deltaTime: number) => void): () => void {
    this.updateCallbacks.add(callback);
    return () => {
      this.updateCallbacks.delete(callback);
    };
  }

  /**
   * 启动动画循环
   */
  private start(): void {
    if (this.isRunning) return;

    this.isRunning = true;
    this.lastFrameTime = performance.now();
    this.frameCount = 0;
    this.tick();
  }

  /**
   * 停止动画循环
   */
  private stop(): void {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    this.isRunning = false;
  }

  /**
   * 动画帧回调
   */
  private tick = (): void => {
    const now = performance.now();
    const deltaTime = now - this.lastFrameTime;

    // 计算FPS
    this.frameCount++;
    if (deltaTime > 0) {
      const currentFPS = 1000 / deltaTime;
      this.fpsHistory.push(currentFPS);
      if (this.fpsHistory.length > 60) {
        this.fpsHistory.shift();
      }
      this.fps = this.fpsHistory.reduce((a, b) => a + b, 0) / this.fpsHistory.length;
    }

    // 更新所有动画
    this.updateAnimations(now, deltaTime);

    // 调用更新回调
    this.updateCallbacks.forEach(callback => {
      try {
        callback(deltaTime);
      } catch (error) {
        console.error('AnimationBatcher: Update callback error:', error);
      }
    });

    this.lastFrameTime = now;

    // 如果还有动画，继续下一帧
    if (this.animations.size > 0) {
      this.rafId = requestAnimationFrame(this.tick);
    } else {
      this.stop();
    }
  };

  /**
   * 更新所有动画状态
   */
  private updateAnimations(now: number, deltaTime: number): void {
    const toRemove: string[] = [];

    this.animations.forEach((animation, id) => {
      // 跳过暂停的动画
      if (animation.config.paused) {
        return;
      }

      // 检查是否到达启动时间
      if (now < animation.startTime) {
        return;
      }

      const { config } = animation;
      const elapsed = now - animation.startTime;
      let progress = Math.min(elapsed / config.duration, 1);

      // 应用缓动函数
      const easing = config.easing || 'linear';
      const easedProgress = easingFunctions[easing](progress);

      // 更新状态
      animation.currentTime = now;
      animation.progress = easedProgress;

      // 调用更新回调
      if (config.onUpdate) {
        try {
          config.onUpdate(easedProgress, {
            elapsed,
            deltaTime,
            rawProgress: progress
          });
        } catch (error) {
          console.error(`AnimationBatcher: Update error for ${id}:`, error);
        }
      }

      // 检查是否完成
      if (progress >= 1) {
        if (config.loop) {
          // 循环动画：重置开始时间
          animation.startTime = now;
          animation.progress = 0;
        } else {
          // 非循环动画：标记完成
          animation.completed = true;

          // 调用完成回调
          if (config.onComplete) {
            try {
              config.onComplete();
            } catch (error) {
              console.error(`AnimationBatcher: Complete error for ${id}:`, error);
            }
          }

          toRemove.push(id);
        }
      }
    });

    // 移除已完成的动画
    toRemove.forEach(id => this.animations.delete(id));
  }

  /**
   * 获取动画状态
   */
  getAnimation(id: string): AnimationState | undefined {
    return this.animations.get(id);
  }

  /**
   * 获取所有动画
   */
  getAllAnimations(): AnimationState[] {
    return Array.from(this.animations.values());
  }

  /**
   * 获取统计信息
   */
  getStats(): {
    activeAnimations: number;
    fps: number;
    isRunning: boolean;
    frameCount: number;
  } {
    return {
      activeAnimations: this.animations.size,
      fps: Math.round(this.fps),
      isRunning: this.isRunning,
      frameCount: this.frameCount
    };
  }

  /**
   * 设置目标FPS
   */
  setTargetFPS(fps: number): void {
    this.targetFPS = Math.max(1, Math.min(120, fps));
  }

  /**
   * 销毁批处理器
   */
  destroy(): void {
    this.clear();
    this.updateCallbacks.clear();
  }
}

/**
 * 全局动画批处理器实例
 */
export const globalAnimationBatcher = new AnimationBatcher();

/**
 * 便捷动画函数
 */
export function animate(config: Omit<AnimationConfig, 'id'>): string {
  const id = `anim-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  globalAnimationBatcher.add({ ...config, id });
  return id;
}

/**
 * 停止动画
 */
export function stopAnimation(id: string): void {
  globalAnimationBatcher.remove(id);
}

/**
 * 暂停/恢复动画
 */
export function pauseAnimation(id: string): void {
  globalAnimationBatcher.pause(id);
}

export function resumeAnimation(id: string): void {
  globalAnimationBatcher.resume(id);
}

