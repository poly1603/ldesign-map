/**
 * Vitest全局测试设置
 */

import { vi } from 'vitest';

// Mock性能API
global.performance = global.performance || {
  now: () => Date.now(),
  mark: vi.fn(),
  measure: vi.fn(),
  clearMarks: vi.fn(),
  clearMeasures: vi.fn(),
  getEntriesByName: vi.fn(),
  getEntriesByType: vi.fn()
} as any;

// Mock requestAnimationFrame
global.requestAnimationFrame = vi.fn((callback: FrameRequestCallback) => {
  return setTimeout(() => callback(Date.now()), 16) as any;
});

global.cancelAnimationFrame = vi.fn((id: number) => {
  clearTimeout(id);
});

// Mock Worker
global.Worker = class MockWorker {
  url: string;
  onmessage: ((event: MessageEvent) => void) | null = null;
  onerror: ((event: ErrorEvent) => void) | null = null;

  constructor(url: string) {
    this.url = url;
  }

  postMessage(data: any) {
    // Mock worker响应
    setTimeout(() => {
      if (this.onmessage) {
        this.onmessage(new MessageEvent('message', { data }));
      }
    }, 0);
  }

  terminate() {
    // Mock终止
  }

  addEventListener(event: string, handler: any) {
    if (event === 'message') {
      this.onmessage = handler;
    } else if (event === 'error') {
      this.onerror = handler;
    }
  }

  removeEventListener() {
    // Mock移除监听
  }
} as any;

// Mock navigator.hardwareConcurrency
Object.defineProperty(global.navigator, 'hardwareConcurrency', {
  value: 4,
  writable: true
});

// Mock console methods for cleaner test output
const originalConsole = {
  log: console.log,
  warn: console.warn,
  error: console.error,
  info: console.info,
  debug: console.debug
};

// 在测试中静默某些日志
global.console = {
  ...console,
  log: vi.fn(originalConsole.log),
  warn: vi.fn(originalConsole.warn),
  error: vi.fn(originalConsole.error),
  info: vi.fn(originalConsole.info),
  debug: vi.fn()
};

// 全局测试工具
export const mockPerformanceNow = (value: number) => {
  vi.spyOn(performance, 'now').mockReturnValue(value);
};

export const advanceTime = (ms: number) => {
  vi.advanceTimersByTime(ms);
};

export const flushPromises = () => new Promise(resolve => setImmediate(resolve));

