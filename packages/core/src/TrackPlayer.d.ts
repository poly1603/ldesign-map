import type { DeckGLLayer } from './types';
/**
 * 轨迹点数据
 */
export interface TrackPoint {
    position: [number, number];
    timestamp: number;
    altitude?: number;
    speed?: number;
    direction?: number;
    data?: any;
}
/**
 * 轨迹数据
 */
export interface TrackData {
    id: string;
    points: TrackPoint[];
    color?: number[];
    width?: number;
    name?: string;
    description?: string;
}
/**
 * 播放选项
 */
export interface PlayOptions {
    speed?: number;
    loop?: boolean;
    trailLength?: number;
    showPath?: boolean;
    showMarker?: boolean;
    markerIcon?: string;
    onFrame?: (progress: number, point: TrackPoint) => void;
    onComplete?: () => void;
}
/**
 * 轨迹播放状态
 */
export type PlaybackState = 'idle' | 'playing' | 'paused' | 'finished';
/**
 * TrackPlayer - 轨迹回放播放器
 * 支持轨迹动画播放、速度控制、进度控制等
 */
export declare class TrackPlayer {
    private tracks;
    private layers;
    private state;
    private currentTime;
    private totalDuration;
    private animationId;
    private lastFrameTime;
    private playOptions;
    private progress;
    private currentPoints;
    /**
     * 添加轨迹
     */
    addTrack(track: TrackData): void;
    /**
     * 批量添加轨迹
     */
    addTracks(tracks: TrackData[]): void;
    /**
     * 移除轨迹
     */
    removeTrack(trackId: string): void;
    /**
     * 清空所有轨迹
     */
    clearTracks(): void;
    /**
     * 开始播放
     */
    play(options?: PlayOptions): void;
    /**
     * 暂停播放
     */
    pause(): void;
    /**
     * 停止播放
     */
    stop(): void;
    /**
     * 跳转到指定进度
     */
    seek(progress: number): void;
    /**
     * 设置播放速度
     */
    setSpeed(speed: number): void;
    /**
     * 获取当前状态
     */
    getState(): PlaybackState;
    /**
     * 获取当前进度
     */
    getProgress(): number;
    /**
     * 获取图层
     */
    getLayers(): DeckGLLayer[];
    /**
     * 动画循环
     */
    private animate;
    /**
     * 计算总时长
     */
    private calculateDuration;
    /**
     * 更新当前点
     */
    private updateCurrentPoints;
    /**
     * 插值计算当前位置
     */
    private interpolatePoint;
    /**
     * 更新图层
     */
    private updateLayers;
    /**
     * 获取轨迹尾巴点
     */
    private getTrailPoints;
    /**
     * 导出轨迹数据
     */
    exportTracks(): TrackData[];
    /**
     * 导入轨迹数据
     */
    importTracks(tracks: TrackData[]): void;
    /**
     * 生成轨迹统计信息
     */
    getStatistics(): any;
    /**
     * 计算两点距离
     */
    private calculateDistance;
}
/**
 * 创建轨迹播放器
 */
export declare function createTrackPlayer(): TrackPlayer;
/**
 * 从 GPS 数据创建轨迹
 */
export declare function createTrackFromGPS(data: any[], options?: {
    positionKey?: string;
    timestampKey?: string;
    altitudeKey?: string;
    speedKey?: string;
}): TrackData;
//# sourceMappingURL=TrackPlayer.d.ts.map