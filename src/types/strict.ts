/**
 * 严格类型定义
 * 消除any类型，提供完整的类型安全
 */

import type { GeoJsonLayer, ScatterplotLayer, IconLayer, TextLayer, PathLayer, ArcLayer } from '@deck.gl/layers';

// ============ 基础类型 ============

/**
 * 坐标类型
 */
export type Coordinate = [number, number];
export type Coordinate3D = [number, number, number];

/**
 * RGBA颜色
 */
export type RGBAColor = [number, number, number, number];
export type RGBColor = [number, number, number];

/**
 * 颜色值（支持函数）
 */
export type ColorValue<T = unknown> = RGBAColor | ((data: T) => RGBAColor);

/**
 * 数值属性（支持函数）
 */
export type NumericValue<T = unknown> = number | ((data: T) => number);

/**
 * 字符串属性（支持函数）
 */
export type StringValue<T = unknown> = string | ((data: T) => string);

// ============ Deck.gl图层类型 ============

/**
 * 所有支持的Deck.gl图层类型
 */
export type DeckGLLayerType =
  | GeoJsonLayer
  | ScatterplotLayer
  | IconLayer
  | TextLayer
  | PathLayer
  | ArcLayer;

/**
 * 图层构造函数
 */
export type LayerConstructor<T extends DeckGLLayerType = DeckGLLayerType> = new (props: any) => T;

// ============ 事件类型 ============

/**
 * 地图事件数据
 */
export interface MapEventData<T = unknown> {
  type: string;
  target?: unknown;
  data?: T;
  timestamp: number;
}

/**
 * 点击事件信息
 */
export interface ClickInfo<T = unknown> {
  object?: T;
  x: number;
  y: number;
  coordinate?: Coordinate;
  layer?: DeckGLLayerType;
}

/**
 * 悬停事件信息
 */
export interface HoverInfo<T = unknown> extends ClickInfo<T> {
  picked: boolean;
}

// ============ 回调函数类型 ============

/**
 * 事件回调
 */
export type EventCallback<T = unknown> = (event: MapEventData<T>) => void;

/**
 * 点击回调
 */
export type ClickCallback<T = unknown> = (info: ClickInfo<T>) => void;

/**
 * 悬停回调
 */
export type HoverCallback<T = unknown> = (info: HoverInfo<T>) => void;

/**
 * 进度回调
 */
export type ProgressCallback = (progress: number, total: number) => void;

/**
 * 错误回调
 */
export type ErrorCallback = (error: Error) => void;

// ============ Promise类型 ============

/**
 * 异步结果
 */
export type AsyncResult<T> = Promise<T>;

/**
 * 可选异步
 */
export type MaybeAsync<T> = T | Promise<T>;

// ============ 工具类型 ============

/**
 * 深度只读
 */
export type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
};

/**
 * 深度部分
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/**
 * 必需属性
 */
export type RequireKeys<T, K extends keyof T> = T & Required<Pick<T, K>>;

/**
 * 可选属性
 */
export type OptionalKeys<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

/**
 * 提取函数返回类型
 */
export type ExtractReturnType<T> = T extends (...args: unknown[]) => infer R ? R : never;

/**
 * 提取数组元素类型
 */
export type ExtractArrayType<T> = T extends (infer U)[] ? U : never;

// ============ 验证类型守卫 ============

/**
 * 检查是否为坐标
 */
export function isCoordinate(value: unknown): value is Coordinate {
  return (
    Array.isArray(value) &&
    value.length === 2 &&
    typeof value[0] === 'number' &&
    typeof value[1] === 'number'
  );
}

/**
 * 检查是否为RGBA颜色
 */
export function isRGBAColor(value: unknown): value is RGBAColor {
  return (
    Array.isArray(value) &&
    value.length === 4 &&
    value.every(v => typeof v === 'number' && v >= 0 && v <= 255)
  );
}

/**
 * 检查是否为Promise
 */
export function isPromise<T>(value: unknown): value is Promise<T> {
  return value instanceof Promise || (
    typeof value === 'object' &&
    value !== null &&
    'then' in value &&
    typeof (value as any).then === 'function'
  );
}

/**
 * 断言非空
 */
export function assertNotNull<T>(value: T | null | undefined, message?: string): asserts value is T {
  if (value === null || value === undefined) {
    throw new Error(message || 'Value is null or undefined');
  }
}

/**
 * 断言类型
 */
export function assertType<T>(
  value: unknown,
  guard: (v: unknown) => v is T,
  message?: string
): asserts value is T {
  if (!guard(value)) {
    throw new Error(message || 'Type assertion failed');
  }
}

// ============ 数据验证 ============

/**
 * 验证坐标范围
 */
export function validateCoordinateRange(
  coord: Coordinate,
  minLng: number = -180,
  maxLng: number = 180,
  minLat: number = -90,
  maxLat: number = 90
): boolean {
  const [lng, lat] = coord;
  return lng >= minLng && lng <= maxLng && lat >= minLat && lat <= maxLat;
}

/**
 * 验证颜色值
 */
export function validateColor(color: unknown): color is RGBAColor {
  return isRGBAColor(color);
}

/**
 * 规范化颜色（确保RGBA格式）
 */
export function normalizeColor(color: RGBColor | RGBAColor): RGBAColor {
  if (color.length === 3) {
    return [...color, 255] as RGBAColor;
  }
  return color as RGBAColor;
}

// ============ 类型转换 ============

/**
 * 安全类型转换
 */
export function safeConvert<T, R>(
  value: T,
  converter: (v: T) => R,
  fallback: R
): R {
  try {
    return converter(value);
  } catch {
    return fallback;
  }
}

/**
 * 转换为数组
 */
export function toArray<T>(value: T | T[]): T[] {
  return Array.isArray(value) ? value : [value];
}

/**
 * 确保数值范围
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * 确保整数
 */
export function toInteger(value: number): number {
  return Math.floor(value);
}

