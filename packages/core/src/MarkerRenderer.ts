import { ScatterplotLayer, IconLayer, TextLayer } from '@deck.gl/layers';
import type { DeckGLLayer } from './types';
import { globalAnimationBatcher, type AnimationConfig } from './animation/AnimationBatcher';
import { Logger } from './Logger';

/**
 * 标记点样式类型
 */
export type MarkerStyle = 'circle' | 'square' | 'triangle' | 'diamond' | 'pin' | 'icon' | 'custom';

/**
 * 标记点动画类型
 */
export type MarkerAnimation = 'none' | 'pulse' | 'bounce' | 'spin' | 'ripple';

/**
 * 标记点基础配置
 */
export interface MarkerOptions {
  id?: string;
  position: [number, number]; // [经度, 纬度]
  style?: MarkerStyle;
  size?: number;
  color?: number[] | ((marker: MarkerOptions) => number[]);
  icon?: string | MarkerIconOptions;
  label?: MarkerLabelOptions;
  animation?: MarkerAnimation;
  animationDuration?: number;
  opacity?: number;
  pickable?: boolean;
  visible?: boolean;
  zIndex?: number;
  data?: any; // 用户自定义数据
  onClick?: (marker: MarkerOptions, event: any) => void;
  onHover?: (marker: MarkerOptions, event: any) => void;
}

/**
 * 图标标记配置
 */
export interface MarkerIconOptions {
  url: string;
  width?: number;
  height?: number;
  anchorX?: number;
  anchorY?: number;
  mask?: boolean;
  maskColor?: number[];
}

/**
 * 标记标签配置
 */
export interface MarkerLabelOptions {
  text: string;
  offset?: [number, number];
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: string | number;
  color?: number[];
  backgroundColor?: number[];
  backgroundPadding?: number[];
  anchor?: 'start' | 'middle' | 'end';
  alignment?: 'top' | 'center' | 'bottom';
  maxWidth?: number;
  visible?: boolean;
}

/**
 * 标记组配置
 */
export interface MarkerGroupOptions {
  id: string;
  markers: MarkerOptions[];
  style?: Partial<MarkerOptions>;
  clustering?: boolean;
  clusterRadius?: number;
  clusterMinPoints?: number;
}

/**
 * 自定义标记渲染器
 */
export type CustomMarkerRenderer = (marker: MarkerOptions) => {
  type: 'svg' | 'html' | 'canvas';
  content: string | HTMLElement | (() => void);
  width: number;
  height: number;
};

/**
 * MarkerRenderer - 标记点渲染器
 * 支持多种标记样式和自定义
 */
export class MarkerRenderer {
  private markers: Map<string, MarkerOptions> = new Map();
  private markerGroups: Map<string, MarkerGroupOptions> = new Map();
  private markerLayers: DeckGLLayer[] = [];
  private customRenderers: Map<MarkerStyle, CustomMarkerRenderer> = new Map();
  private markerIdCounter = 0;
  private animationTimer: number | null = null;
  private animationTime: number = 0; // 统一动画时间
  private animationCallbackId: (() => void) | null = null;
  private logger = Logger.getInstance();
  private needsUpdate = false;

  constructor() {
    // 注册全局动画更新回调
    this.animationCallbackId = globalAnimationBatcher.onUpdate((deltaTime) => {
      this.animationTime += deltaTime;
      if (this.hasAnimatedMarkers()) {
        this.needsUpdate = true;
        this.updateMarkerLayers();
      }
    });
  }

  /**
   * 检查是否有动画标记
   */
  private hasAnimatedMarkers(): boolean {
    return Array.from(this.markers.values()).some(
      m => m.animation && m.animation !== 'none' && m.visible !== false
    );
  }

  /**
   * 添加单个标记
   */
  addMarker(marker: MarkerOptions): string {
    const markerId = marker.id || `marker-${++this.markerIdCounter}`;
    const markerWithId = { ...marker, id: markerId };
    this.markers.set(markerId, markerWithId);
    this.updateMarkerLayers();

    // 如果添加的标记有动画，注册到AnimationBatcher
    if (marker.animation && marker.animation !== 'none') {
      this.registerMarkerAnimation(markerWithId);
    }

    return markerId;
  }

  /**
   * 注册标记动画到批处理器
   */
  private registerMarkerAnimation(marker: MarkerOptions): void {
    if (!marker.id || !marker.animation || marker.animation === 'none') {
      return;
    }

    const animId = `marker-anim-${marker.id}`;
    const duration = marker.animationDuration || 1000;

    // 移除旧动画（如果存在）
    globalAnimationBatcher.remove(animId);

    // 添加新动画
    globalAnimationBatcher.add({
      id: animId,
      duration,
      loop: true,
      easing: marker.animation === 'bounce' ? 'bounce' : 'linear',
      onUpdate: (progress) => {
        // 动画进度更新时标记需要刷新
        this.needsUpdate = true;
      }
    });
  }

  /**
   * 批量添加标记
   */
  addMarkers(markers: MarkerOptions[]): string[] {
    const markerIds: string[] = [];
    markers.forEach(marker => {
      const id = this.addMarker(marker);
      markerIds.push(id);
    });
    return markerIds;
  }

  /**
   * 添加标记组
   */
  addMarkerGroup(group: MarkerGroupOptions): void {
    this.markerGroups.set(group.id, group);
    // 添加组内的所有标记
    group.markers.forEach(marker => {
      const mergedMarker = { ...group.style, ...marker };
      this.addMarker(mergedMarker);
    });
  }

  /**
   * 更新标记
   */
  updateMarker(markerId: string, updates: Partial<MarkerOptions>): void {
    const marker = this.markers.get(markerId);
    if (marker) {
      this.markers.set(markerId, { ...marker, ...updates });
      this.updateMarkerLayers();
    }
  }

  /**
   * 删除标记
   */
  removeMarker(markerId: string): void {
    // 移除动画
    const animId = `marker-anim-${markerId}`;
    globalAnimationBatcher.remove(animId);

    this.markers.delete(markerId);
    this.updateMarkerLayers();
  }

  /**
   * 删除标记组
   */
  removeMarkerGroup(groupId: string): void {
    const group = this.markerGroups.get(groupId);
    if (group) {
      // 删除组内所有标记
      group.markers.forEach(marker => {
        if (marker.id) {
          this.removeMarker(marker.id);
        }
      });
      this.markerGroups.delete(groupId);
    }
  }

  /**
   * 清空所有标记
   */
  clearMarkers(): void {
    // 移除所有标记动画
    this.markers.forEach((_, id) => {
      const animId = `marker-anim-${id}`;
      globalAnimationBatcher.remove(animId);
    });

    this.markers.clear();
    this.markerGroups.clear();
    this.markerLayers = [];
    this.stopAnimationLoop();
  }

  /**
   * 注册自定义标记渲染器
   */
  registerCustomRenderer(style: string, renderer: CustomMarkerRenderer): void {
    this.customRenderers.set(style as MarkerStyle, renderer);
  }

  /**
   * 更新标记图层
   */
  private updateMarkerLayers(): void {
    const newLayers: DeckGLLayer[] = [];

    // 首先添加水波纹图层（在底层）- 使用统一动画时间
    const allMarkers = Array.from(this.markers.values());
    const rippleMarkers = allMarkers.filter(m => m.animation === 'ripple' && m.style === 'circle' && m.visible !== false);

    if (rippleMarkers.length > 0) {
      const time = this.animationTime / 2000; // 统一时间，减慢速度

      // 为每个水波纹标记创建3个环
      rippleMarkers.forEach((marker) => {
        for (let ringIndex = 0; ringIndex < 3; ringIndex++) {
          const rippleLayer = new ScatterplotLayer({
            id: `ripple-${marker.id}-ring-${ringIndex}`,
            data: [{
              ...marker,
              position: marker.position,
              _ringIndex: ringIndex,
              _animationPhase: ringIndex * 0.33  // 相位差，让3个环错开
            }],
            pickable: false,
            opacity: 1,
            stroked: true,
            filled: false,
            radiusScale: 1,
            radiusMinPixels: 10,
            radiusMaxPixels: 150,
            lineWidthMinPixels: 2,
            lineWidthMaxPixels: 4,
            getPosition: (d: any) => d.position,
            getRadius: (d: any) => {
              const baseRadius = d.size || 15;
              const phase = d._animationPhase || 0;
              const animProgress = ((time + phase) % 1.0);
              return baseRadius * (1 + animProgress * 3);
            },
            getLineColor: (d: any) => {
              const phase = d._animationPhase || 0;
              const animProgress = ((time + phase) % 1.0);
              const opacity = Math.max(0, 0.8 * (1 - animProgress));
              const color = d.color || [0, 150, 255, 255];
              return [color[0], color[1], color[2], Math.floor(opacity * 255)];
            },
            getLineWidth: (d: any) => {
              const phase = d._animationPhase || 0;
              const animProgress = ((time + phase) % 1.0);
              return 3 * (1 - animProgress * 0.7);
            },
            updateTriggers: {
              getRadius: [this.animationTime],
              getLineColor: [this.animationTime],
              getLineWidth: [this.animationTime]
            }
          } as any);
          newLayers.push(rippleLayer);
        }
      });
    }

    // 然后按样式分组标记创建主图层
    const markersByStyle = this.groupMarkersByStyle();

    markersByStyle.forEach((markers, style) => {
      const layer = this.createMainLayerForStyle(style, markers);
      if (layer) {
        newLayers.push(layer);
      }
    });

    // 创建标签图层
    const labelLayer = this.createLabelLayer();
    if (labelLayer) {
      newLayers.push(labelLayer);
    }

    this.markerLayers = newLayers;
  }

  /**
   * 按样式分组标记
   */
  private groupMarkersByStyle(): Map<MarkerStyle, MarkerOptions[]> {
    const groups = new Map<MarkerStyle, MarkerOptions[]>();

    this.markers.forEach(marker => {
      const style = marker.style || 'circle';
      if (!groups.has(style)) {
        groups.set(style, []);
      }
      groups.get(style)!.push(marker);
    });

    return groups;
  }

  /**
   * 根据样式创建主图层（不包含水波纹）
   */
  private createMainLayerForStyle(style: MarkerStyle, markers: MarkerOptions[]): DeckGLLayer | null {
    // 过滤可见的标记
    const visibleMarkers = markers.filter(m => m.visible !== false);

    if (visibleMarkers.length === 0) {
      return null;
    }

    // 为每个样式创建唯一的层ID，添加时间戳避免冲突
    const layerId = `marker-${style}-${Date.now()}`;

    switch (style) {
      case 'circle':
      case 'square':
      case 'triangle':
      case 'diamond':
        return this.createMainShapeLayer(style, visibleMarkers, layerId);

      case 'pin':
        return this.createPinLayer(visibleMarkers, layerId);

      case 'icon':
        return this.createIconLayer(visibleMarkers, layerId);

      case 'custom':
        return this.createMainShapeLayer('circle', visibleMarkers, layerId);

      default:
        return this.createMainShapeLayer('circle', visibleMarkers, layerId);
    }
  }


  /**
   * 创建主形状图层
   */
  private createMainShapeLayer(shape: string, markers: MarkerOptions[], layerId: string): ScatterplotLayer {
    return new ScatterplotLayer({
      id: layerId,
      data: markers,
      pickable: true,
      opacity: 1,  // 完全不透明
      stroked: true,
      filled: true,
      radiusScale: 1,
      radiusMinPixels: 8,  // 合适的最小半径
      radiusMaxPixels: 100,  // 合适的最大半径
      lineWidthMinPixels: 2,  // 边框宽度
      getPosition: (d: MarkerOptions) => d.position,
      getRadius: (d: MarkerOptions) => {
        const baseRadius = d.size || 15; // 使用原始大小
        return baseRadius;
      },
      getFillColor: (d: MarkerOptions) => {
        let color = d.color || [255, 0, 0, 255];  // 默认完全不透明
        if (typeof d.color === 'function') {
          color = d.color(d);
        }

        if (Array.isArray(color)) {
          // 确保颜色是纯色，不透明
          return [
            color[0],
            color[1],
            color[2],
            255  // 完全不透明
          ];
        }
        return color;
      },
      getLineColor: () => {
        // 白色边框，完全不透明
        return [255, 255, 255, 255];
      },
      lineWidthScale: 1,
      getLineWidth: () => {
        return 2; // 固定边框宽度
      },
      onClick: (info: any) => {
        const marker = info.object as MarkerOptions;
        if (marker && marker.onClick) {
          marker.onClick(marker, info);
        }
      },
      onHover: (info: any) => {
        if (info.picked) {
          document.body.style.cursor = 'pointer';
        } else {
          document.body.style.cursor = 'default';
        }
        const marker = info.object as MarkerOptions;
        if (marker && marker.onHover) {
          marker.onHover(marker, info);
        }
      },
      updateTriggers: {
        getRadius: [shape],
        getFillColor: [shape]
      }
    } as any);
  }

  /**
   * 创建图钉图层
   */
  private createPinLayer(markers: MarkerOptions[], layerId: string): IconLayer {
    // 默认图钉 SVG
    const defaultPinSvg = `
      <svg width="24" height="36" viewBox="0 0 24 36" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 0C5.37 0 0 5.37 0 12c0 9 12 24 12 24s12-15 12-24c0-6.63-5.37-12-12-12zm0 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z" fill="currentColor"/>
      </svg>
    `;

    const iconMapping = {
      pin: {
        x: 0,
        y: 0,
        width: 24,
        height: 36,
        anchorX: 12,
        anchorY: 36
      }
    };

    return new IconLayer({
      id: layerId,
      data: markers,
      pickable: true,
      iconAtlas: 'data:image/svg+xml;base64,' + btoa(defaultPinSvg),
      iconMapping,
      getIcon: () => 'pin',
      getPosition: (d: MarkerOptions) => d.position,
      getSize: (d: MarkerOptions) => d.size || 24,
      getColor: (d: MarkerOptions) => {
        if (typeof d.color === 'function') {
          return d.color(d);
        }
        return d.color || [255, 0, 0, 255];
      },
      onClick: (info: any) => {
        const marker = info.object as MarkerOptions;
        if (marker.onClick) {
          marker.onClick(marker, info);
        }
      },
      onHover: (info: any) => {
        const marker = info.object as MarkerOptions;
        if (marker.onHover) {
          marker.onHover(marker, info);
        }
      }
    } as any);
  }

  /**
   * 创建图标图层
   */
  private createIconLayer(markers: MarkerOptions[], layerId: string): IconLayer {
    // 准备图标数据
    const iconData = markers.map(marker => {
      const icon = marker.icon;
      if (typeof icon === 'string') {
        return {
          ...marker,
          iconUrl: icon,
          iconWidth: 32,
          iconHeight: 32
        };
      } else if (icon) {
        return {
          ...marker,
          iconUrl: icon.url,
          iconWidth: icon.width || 32,
          iconHeight: icon.height || 32,
          anchorX: icon.anchorX || 16,
          anchorY: icon.anchorY || 16
        };
      }
      return marker;
    });

    return new IconLayer({
      id: layerId,
      data: iconData,
      pickable: true,
      getIcon: (d: any) => ({
        url: d.iconUrl,
        width: d.iconWidth,
        height: d.iconHeight,
        anchorX: d.anchorX,
        anchorY: d.anchorY
      }),
      getPosition: (d: any) => d.position,
      getSize: (d: any) => d.size || 1,
      onClick: (info: any) => {
        const marker = info.object as MarkerOptions;
        if (marker.onClick) {
          marker.onClick(marker, info);
        }
      },
      onHover: (info: any) => {
        const marker = info.object as MarkerOptions;
        if (marker.onHover) {
          marker.onHover(marker, info);
        }
      }
    } as any);
  }


  /**
   * 创建标签图层
   */
  private createLabelLayer(): TextLayer | null {
    const markersWithLabels = Array.from(this.markers.values())
      .filter(m => m.label && m.label.visible !== false);

    if (markersWithLabels.length === 0) {
      return null;
    }

    const labelData = markersWithLabels.map(marker => ({
      position: [
        marker.position[0] + (marker.label?.offset?.[0] || 0),
        marker.position[1] + (marker.label?.offset?.[1] || 0)
      ],
      text: marker.label?.text || '',
      marker
    }));

    // 构建标签字符集
    const labelChars = labelData.map(d => d.text).join('');
    const uniqueLabelChars = Array.from(new Set(labelChars)).join('');

    return new TextLayer({
      id: `marker-labels-${Date.now()}`,
      data: labelData,
      pickable: false,
      getPosition: (d: any) => d.position,
      getText: (d: any) => d.text,
      getSize: (d: any) => d.marker.label?.fontSize || 12,
      getColor: () => [0, 0, 0, 255],
      getTextAnchor: () => 'middle',
      getAlignmentBaseline: () => 'center',
      fontFamily: 'Arial, sans-serif',
      fontWeight: 'normal',
      maxWidth: 200,
      getBackgroundColor: () => [255, 255, 255, 0],
      backgroundPadding: [2, 2],
      characterSet: uniqueLabelChars  // 设置字符集
    } as any);
  }

  /**
   * 获取所有图层
   */
  getLayers(): DeckGLLayer[] {
    return this.markerLayers;
  }

  /**
   * 启动动画循环（已废弃，使用AnimationBatcher）
   * @deprecated 使用 AnimationBatcher 替代
   */
  private startAnimationLoop(): void {
    // 不再需要独立的动画循环
    // AnimationBatcher 会统一管理
    this.logger.debug('MarkerRenderer: Using AnimationBatcher for animations');
  }

  /**
   * 停止动画循环（已废弃）
   * @deprecated 使用 AnimationBatcher 替代
   */
  private stopAnimationLoop(): void {
    // 不再需要停止
    if (this.animationTimer) {
      cancelAnimationFrame(this.animationTimer);
      this.animationTimer = null;
    }
  }

  /**
   * 获取标记
   */
  getMarker(markerId: string): MarkerOptions | undefined {
    return this.markers.get(markerId);
  }

  /**
   * 获取所有标记
   */
  getAllMarkers(): MarkerOptions[] {
    return Array.from(this.markers.values());
  }

  /**
   * 通过条件查找标记
   */
  findMarkers(predicate: (marker: MarkerOptions) => boolean): MarkerOptions[] {
    return Array.from(this.markers.values()).filter(predicate);
  }

  /**
   * 显示/隐藏标记
   */
  setMarkerVisibility(markerId: string, visible: boolean): void {
    this.updateMarker(markerId, { visible });
  }

  /**
   * 批量显示/隐藏标记
   */
  setMarkersVisibility(markerIds: string[], visible: boolean): void {
    markerIds.forEach(id => this.setMarkerVisibility(id, visible));
  }

  /**
   * 高亮标记
   */
  highlightMarker(markerId: string, highlightColor?: number[]): void {
    const marker = this.markers.get(markerId);
    if (marker) {
      const originalColor = marker.color;
      this.updateMarker(markerId, {
        color: highlightColor || [255, 255, 0, 255],
        data: { ...marker.data, originalColor }
      });
    }
  }

  /**
   * 取消高亮
   */
  unhighlightMarker(markerId: string): void {
    const marker = this.markers.get(markerId);
    if (marker && marker.data?.originalColor) {
      this.updateMarker(markerId, {
        color: marker.data.originalColor
      });
    }
  }

  /**
   * 设置标记动画
   */
  setMarkerAnimation(markerId: string, animation: MarkerAnimation, duration?: number): void {
    this.updateMarker(markerId, {
      animation,
      animationDuration: duration || 1000
    });
  }

  /**
   * 批量设置标记动画
   */
  setMarkersAnimation(markerIds: string[], animation: MarkerAnimation, duration?: number): void {
    markerIds.forEach(id => this.setMarkerAnimation(id, animation, duration));
  }

  /**
   * 获取动画统计
   */
  getAnimationStats(): {
    animatedMarkers: number;
    activeAnimations: number;
    fps: number;
  } {
    const animatedMarkers = Array.from(this.markers.values())
      .filter(m => m.animation && m.animation !== 'none').length;

    const batcherStats = globalAnimationBatcher.getStats();

    return {
      animatedMarkers,
      activeAnimations: batcherStats.activeAnimations,
      fps: batcherStats.fps
    };
  }

  /**
   * 销毁渲染器
   */
  destroy(): void {
    this.clearMarkers();

    // 取消注册动画回调
    if (this.animationCallbackId) {
      this.animationCallbackId();
      this.animationCallbackId = null;
    }

    this.logger.info('MarkerRenderer destroyed');
  }
}