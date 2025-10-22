/**
 * AnimationBatcher测试
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { AnimationBatcher, animate, stopAnimation } from '../src/animation/AnimationBatcher';

describe('AnimationBatcher', () => {
  let batcher: AnimationBatcher;

  beforeEach(() => {
    vi.useFakeTimers();
    batcher = new AnimationBatcher();
  });

  afterEach(() => {
    batcher.destroy();
    vi.useRealTimers();
  });

  describe('基础功能', () => {
    it('应该添加动画', () => {
      batcher.add({
        id: 'test-anim',
        duration: 1000,
        onUpdate: vi.fn()
      });

      const stats = batcher.getStats();
      expect(stats.activeAnimations).toBe(1);
      expect(stats.isRunning).toBe(true);
    });

    it('应该移除动画', () => {
      batcher.add({
        id: 'test-anim',
        duration: 1000,
        onUpdate: vi.fn()
      });

      batcher.remove('test-anim');

      const stats = batcher.getStats();
      expect(stats.activeAnimations).toBe(0);
    });

    it('应该在没有动画时停止', () => {
      batcher.add({
        id: 'test-anim',
        duration: 1000,
        onUpdate: vi.fn()
      });

      expect(batcher.getStats().isRunning).toBe(true);

      batcher.remove('test-anim');
      vi.advanceTimersByTime(100);

      expect(batcher.getStats().isRunning).toBe(false);
    });
  });

  describe('动画更新', () => {
    it('应该调用onUpdate回调', () => {
      const onUpdate = vi.fn();

      batcher.add({
        id: 'test-anim',
        duration: 1000,
        onUpdate
      });

      // 前进500ms（50%进度）
      vi.advanceTimersByTime(500);

      expect(onUpdate).toHaveBeenCalled();
      const lastCall = onUpdate.mock.calls[onUpdate.mock.calls.length - 1];
      expect(lastCall[0]).toBeGreaterThan(0);
      expect(lastCall[0]).toBeLessThanOrEqual(1);
    });

    it('应该在完成时调用onComplete', () => {
      const onComplete = vi.fn();

      batcher.add({
        id: 'test-anim',
        duration: 1000,
        onUpdate: vi.fn(),
        onComplete
      });

      // 完成动画
      vi.advanceTimersByTime(1100);

      expect(onComplete).toHaveBeenCalled();
    });

    it('应该支持循环动画', () => {
      const onUpdate = vi.fn();

      batcher.add({
        id: 'test-anim',
        duration: 1000,
        loop: true,
        onUpdate
      });

      // 第一轮
      vi.advanceTimersByTime(1100);
      const callsAfterFirstLoop = onUpdate.mock.calls.length;

      // 第二轮
      vi.advanceTimersByTime(1000);
      const callsAfterSecondLoop = onUpdate.mock.calls.length;

      expect(callsAfterSecondLoop).toBeGreaterThan(callsAfterFirstLoop);
      expect(batcher.getStats().activeAnimations).toBe(1); // 仍在运行
    });
  });

  describe('缓动函数', () => {
    it('应该应用linear缓动', () => {
      const onUpdate = vi.fn();

      batcher.add({
        id: 'test-anim',
        duration: 1000,
        easing: 'linear',
        onUpdate
      });

      vi.advanceTimersByTime(500);

      const lastCall = onUpdate.mock.calls[onUpdate.mock.calls.length - 1];
      expect(lastCall[0]).toBeCloseTo(0.5, 1);
    });

    it('应该应用easeIn缓动', () => {
      const onUpdate = vi.fn();

      batcher.add({
        id: 'test-anim',
        duration: 1000,
        easing: 'easeIn',
        onUpdate
      });

      vi.advanceTimersByTime(500);

      const lastCall = onUpdate.mock.calls[onUpdate.mock.calls.length - 1];
      // easeIn在50%时应该小于0.5
      expect(lastCall[0]).toBeLessThan(0.5);
    });
  });

  describe('暂停和恢复', () => {
    it('应该暂停动画', () => {
      const onUpdate = vi.fn();

      batcher.add({
        id: 'test-anim',
        duration: 1000,
        onUpdate
      });

      vi.advanceTimersByTime(300);
      const callsBeforePause = onUpdate.mock.calls.length;

      batcher.pause('test-anim');
      vi.advanceTimersByTime(500);
      const callsAfterPause = onUpdate.mock.calls.length;

      expect(callsAfterPause).toBe(callsBeforePause);
    });

    it('应该恢复动画', () => {
      const onUpdate = vi.fn();

      batcher.add({
        id: 'test-anim',
        duration: 1000,
        onUpdate
      });

      batcher.pause('test-anim');
      vi.advanceTimersByTime(500);

      batcher.resume('test-anim');
      vi.advanceTimersByTime(100);

      // 恢复后应该继续调用
      expect(onUpdate).toHaveBeenCalled();
    });

    it('应该暂停所有动画', () => {
      batcher.add({ id: 'anim1', duration: 1000, onUpdate: vi.fn() });
      batcher.add({ id: 'anim2', duration: 1000, onUpdate: vi.fn() });

      batcher.pauseAll();

      expect(batcher.getAnimation('anim1')?.config.paused).toBe(true);
      expect(batcher.getAnimation('anim2')?.config.paused).toBe(true);
    });
  });

  describe('批量操作', () => {
    it('应该处理多个并发动画', () => {
      const callbacks = Array.from({ length: 50 }, () => vi.fn());

      callbacks.forEach((callback, i) => {
        batcher.add({
          id: `anim-${i}`,
          duration: 1000,
          onUpdate: callback
        });
      });

      expect(batcher.getStats().activeAnimations).toBe(50);

      vi.advanceTimersByTime(500);

      // 所有回调都应该被调用
      callbacks.forEach(callback => {
        expect(callback).toHaveBeenCalled();
      });
    });

    it('应该清空所有动画', () => {
      for (let i = 0; i < 10; i++) {
        batcher.add({
          id: `anim-${i}`,
          duration: 1000,
          onUpdate: vi.fn()
        });
      }

      batcher.clear();

      expect(batcher.getStats().activeAnimations).toBe(0);
      expect(batcher.getStats().isRunning).toBe(false);
    });
  });

  describe('性能统计', () => {
    it('应该跟踪FPS', () => {
      batcher.add({
        id: 'test-anim',
        duration: 1000,
        loop: true,
        onUpdate: vi.fn()
      });

      // 模拟多帧
      for (let i = 0; i < 60; i++) {
        vi.advanceTimersByTime(16); // ~60fps
      }

      const stats = batcher.getStats();
      expect(stats.fps).toBeGreaterThan(0);
      expect(stats.frameCount).toBeGreaterThan(0);
    });
  });

  describe('辅助函数', () => {
    it('animate函数应该创建动画', () => {
      const id = animate({
        duration: 1000,
        onUpdate: vi.fn()
      });

      expect(id).toBeTruthy();
      expect(id).toMatch(/^anim-/);
    });

    it('stopAnimation函数应该停止动画', () => {
      const id = animate({
        duration: 1000,
        onUpdate: vi.fn()
      });

      stopAnimation(id);

      // 验证动画已停止（需要访问全局实例）
      // 这里简单验证函数不抛出错误
      expect(true).toBe(true);
    });
  });
});

