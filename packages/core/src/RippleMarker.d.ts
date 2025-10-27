import type { Layer } from '@deck.gl/core';
export interface RippleMarkerOptions {
    id: string;
    position: [number, number];
    color?: [number, number, number];
    baseRadius?: number;
    rippleCount?: number;
    animationSpeed?: number;
}
export declare class RippleMarker {
    private id;
    private position;
    private color;
    private baseRadius;
    private rippleCount;
    private animationSpeed;
    private startTime;
    private currentTime;
    private pulseIntensity;
    private waveSpacing;
    constructor(options: RippleMarkerOptions);
    /**
     * 创建水波纹图层
     */
    createLayers(): Layer[];
    /**
     * 缓动函数 - easeOutQuart
     * 用于创建更自然的动画效果
     */
    private easeOutQuart;
    /**
     * 更新动画（触发重绘）
     */
    update(): Layer[];
    /**
     * 获取位置
     */
    getPosition(): [number, number];
    /**
     * 获取ID
     */
    getId(): string;
}
/**
 * 创建水波纹标记的便捷方法
 */
export declare function createRippleMarker(id: string, longitude: number, latitude: number, color?: [number, number, number], options?: Partial<RippleMarkerOptions>): RippleMarker;
//# sourceMappingURL=RippleMarker.d.ts.map