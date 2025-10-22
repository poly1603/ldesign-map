/**
 * DrawingManager - 地图绘制编辑器
 * 支持绘制点、线、面等几何图形
 */

import { EventManager } from '../EventManager';
import { Logger } from '../Logger';
import type { Feature, FeatureCollection } from '../types';

export type DrawingMode = 'none' | 'point' | 'line' | 'polygon' | 'rectangle' | 'circle';
export type DrawingEventType = 'drawstart' | 'drawend' | 'drawcancel' | 'vertexadd' | 'vertexmove' | 'vertexdelete';

export interface DrawingOptions {
  mode?: DrawingMode;
  strokeColor?: number[];
  fillColor?: number[];
  strokeWidth?: number;
  enableSnap?: boolean; // 启用吸附
  snapDistance?: number; // 吸附距离（像素）
  minVertices?: number; // 最小顶点数
  maxVertices?: number; // 最大顶点数
}

export interface DrawingFeature extends Feature {
  id: string;
  geometry: {
    type: 'Point' | 'LineString' | 'Polygon';
    coordinates: any;
  };
  properties: {
    drawingMode: DrawingMode;
    created: number;
    modified: number;
    [key: string]: any;
  };
}

export interface DrawingState {
  mode: DrawingMode;
  isDrawing: boolean;
  currentFeature: DrawingFeature | null;
  vertices: [number, number][];
  selectedFeature: string | null;
}

/**
 * DrawingManager - 绘制管理器
 */
export class DrawingManager {
  private container: HTMLElement;
  private eventManager: EventManager;
  private logger = Logger.getInstance();
  private features: Map<string, DrawingFeature> = new Map();
  private featureIdCounter = 0;

  private state: DrawingState = {
    mode: 'none',
    isDrawing: false,
    currentFeature: null,
    vertices: [],
    selectedFeature: null
  };

  private options: Required<DrawingOptions> = {
    mode: 'none',
    strokeColor: [66, 165, 245, 255],
    fillColor: [66, 165, 245, 100],
    strokeWidth: 2,
    enableSnap: true,
    snapDistance: 10,
    minVertices: 2,
    maxVertices: 1000
  };

  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private isEnabled = false;

  constructor(container: HTMLElement, options: DrawingOptions = {}) {
    this.container = container;
    this.eventManager = new EventManager();
    this.options = { ...this.options, ...options };

    if (options.mode) {
      this.state.mode = options.mode;
    }

    this.logger.info('DrawingManager initialized');
  }

  /**
   * 启用绘制功能
   */
  enable(): void {
    if (this.isEnabled) return;

    this.createCanvas();
    this.attachEventListeners();
    this.isEnabled = true;

    this.logger.info('DrawingManager enabled');
  }

  /**
   * 禁用绘制功能
   */
  disable(): void {
    if (!this.isEnabled) return;

    this.detachEventListeners();
    this.removeCanvas();
    this.isEnabled = false;

    this.logger.info('DrawingManager disabled');
  }

  /**
   * 创建绘制画布
   */
  private createCanvas(): void {
    this.canvas = document.createElement('canvas');
    this.canvas.style.position = 'absolute';
    this.canvas.style.top = '0';
    this.canvas.style.left = '0';
    this.canvas.style.pointerEvents = 'auto';
    this.canvas.style.cursor = 'crosshair';
    this.canvas.style.zIndex = '1000';

    const rect = this.container.getBoundingClientRect();
    this.canvas.width = rect.width;
    this.canvas.height = rect.height;

    this.ctx = this.canvas.getContext('2d');
    this.container.appendChild(this.canvas);
  }

  /**
   * 移除画布
   */
  private removeCanvas(): void {
    if (this.canvas && this.canvas.parentNode) {
      this.canvas.parentNode.removeChild(this.canvas);
    }
    this.canvas = null;
    this.ctx = null;
  }

  /**
   * 绑定事件监听
   */
  private attachEventListeners(): void {
    if (!this.canvas) return;

    this.canvas.addEventListener('click', this.handleClick);
    this.canvas.addEventListener('dblclick', this.handleDoubleClick);
    this.canvas.addEventListener('mousemove', this.handleMouseMove);
    this.canvas.addEventListener('contextmenu', this.handleContextMenu);
    window.addEventListener('keydown', this.handleKeyDown);
  }

  /**
   * 解绑事件监听
   */
  private detachEventListeners(): void {
    if (!this.canvas) return;

    this.canvas.removeEventListener('click', this.handleClick);
    this.canvas.removeEventListener('dblclick', this.handleDoubleClick);
    this.canvas.removeEventListener('mousemove', this.handleMouseMove);
    this.canvas.removeEventListener('contextmenu', this.handleContextMenu);
    window.removeEventListener('keydown', this.handleKeyDown);
  }

  /**
   * 处理点击事件
   */
  private handleClick = (event: MouseEvent): void => {
    if (this.state.mode === 'none') return;

    const coords = this.getMapCoordinates(event);

    switch (this.state.mode) {
      case 'point':
        this.addPoint(coords);
        break;
      case 'line':
      case 'polygon':
        this.addVertex(coords);
        break;
      case 'rectangle':
        this.startRectangle(coords);
        break;
      case 'circle':
        this.startCircle(coords);
        break;
    }

    this.render();
  };

  /**
   * 处理双击事件
   */
  private handleDoubleClick = (event: MouseEvent): void => {
    event.preventDefault();

    if (this.state.mode === 'line' || this.state.mode === 'polygon') {
      this.finishDrawing();
    }
  };

  /**
   * 处理鼠标移动
   */
  private handleMouseMove = (event: MouseEvent): void => {
    if (!this.state.isDrawing) return;

    const coords = this.getMapCoordinates(event);
    this.render(coords);
  };

  /**
   * 处理右键菜单
   */
  private handleContextMenu = (event: MouseEvent): void => {
    event.preventDefault();
    this.cancelDrawing();
  };

  /**
   * 处理键盘事件
   */
  private handleKeyDown = (event: KeyboardEvent): void => {
    if (event.key === 'Escape') {
      this.cancelDrawing();
    } else if (event.key === 'Enter') {
      this.finishDrawing();
    } else if (event.key === 'Backspace' && this.state.vertices.length > 0) {
      this.state.vertices.pop();
      this.render();
    }
  };

  /**
   * 获取地图坐标
   */
  private getMapCoordinates(event: MouseEvent): [number, number] {
    if (!this.canvas) return [0, 0];

    const rect = this.canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // TODO: 转换为实际地理坐标（需要地图实例）
    return [x, y];
  }

  /**
   * 添加点
   */
  private addPoint(coords: [number, number]): void {
    const feature: DrawingFeature = {
      id: this.generateFeatureId(),
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: coords
      },
      properties: {
        drawingMode: 'point',
        created: Date.now(),
        modified: Date.now()
      }
    };

    this.features.set(feature.id, feature);
    this.eventManager.emit('drawend', { feature });
    this.logger.debug('Point added:', feature);
  }

  /**
   * 添加顶点
   */
  private addVertex(coords: [number, number]): void {
    if (!this.state.isDrawing) {
      this.state.isDrawing = true;
      this.state.vertices = [];
      this.eventManager.emit('drawstart', { mode: this.state.mode });
    }

    // 吸附处理
    if (this.options.enableSnap && this.state.vertices.length > 0) {
      const lastVertex = this.state.vertices[this.state.vertices.length - 1];
      const distance = Math.sqrt(
        Math.pow(coords[0] - lastVertex[0], 2) +
        Math.pow(coords[1] - lastVertex[1], 2)
      );

      if (distance < this.options.snapDistance) {
        coords = lastVertex;
      }
    }

    this.state.vertices.push(coords);
    this.eventManager.emit('vertexadd', { coords });

    // 检查是否达到最大顶点数
    if (this.state.vertices.length >= this.options.maxVertices) {
      this.finishDrawing();
    }
  }

  /**
   * 开始绘制矩形
   */
  private startRectangle(coords: [number, number]): void {
    // TODO: 实现矩形绘制
    this.logger.debug('Rectangle drawing not yet implemented');
  }

  /**
   * 开始绘制圆形
   */
  private startCircle(coords: [number, number]): void {
    // TODO: 实现圆形绘制
    this.logger.debug('Circle drawing not yet implemented');
  }

  /**
   * 完成绘制
   */
  private finishDrawing(): void {
    if (!this.state.isDrawing) return;

    if (this.state.vertices.length < this.options.minVertices) {
      this.logger.warn(`Not enough vertices: ${this.state.vertices.length} < ${this.options.minVertices}`);
      return;
    }

    let feature: DrawingFeature | null = null;

    if (this.state.mode === 'line') {
      feature = {
        id: this.generateFeatureId(),
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates: this.state.vertices
        },
        properties: {
          drawingMode: 'line',
          created: Date.now(),
          modified: Date.now()
        }
      };
    } else if (this.state.mode === 'polygon') {
      // 闭合多边形
      const coords = [...this.state.vertices, this.state.vertices[0]];
      feature = {
        id: this.generateFeatureId(),
        type: 'Feature',
        geometry: {
          type: 'Polygon',
          coordinates: [coords]
        },
        properties: {
          drawingMode: 'polygon',
          created: Date.now(),
          modified: Date.now()
        }
      };
    }

    if (feature) {
      this.features.set(feature.id, feature);
      this.eventManager.emit('drawend', { feature });
      this.logger.debug('Drawing finished:', feature);
    }

    this.resetDrawingState();
    this.render();
  }

  /**
   * 取消绘制
   */
  private cancelDrawing(): void {
    if (!this.state.isDrawing) return;

    this.eventManager.emit('drawcancel', {});
    this.resetDrawingState();
    this.render();

    this.logger.debug('Drawing cancelled');
  }

  /**
   * 重置绘制状态
   */
  private resetDrawingState(): void {
    this.state.isDrawing = false;
    this.state.vertices = [];
    this.state.currentFeature = null;
  }

  /**
   * 渲染画布
   */
  private render(cursorCoords?: [number, number]): void {
    if (!this.ctx || !this.canvas) return;

    // 清空画布
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // 绘制已有要素
    this.features.forEach(feature => {
      this.renderFeature(feature);
    });

    // 绘制当前绘制中的要素
    if (this.state.isDrawing && this.state.vertices.length > 0) {
      this.renderDrawing(cursorCoords);
    }
  }

  /**
   * 渲染要素
   */
  private renderFeature(feature: DrawingFeature): void {
    if (!this.ctx) return;

    const [r, g, b, a] = this.options.strokeColor;
    this.ctx.strokeStyle = `rgba(${r},${g},${b},${a / 255})`;
    this.ctx.lineWidth = this.options.strokeWidth;

    const [fr, fg, fb, fa] = this.options.fillColor;
    this.ctx.fillStyle = `rgba(${fr},${fg},${fb},${fa / 255})`;

    if (feature.geometry.type === 'Point') {
      const [x, y] = feature.geometry.coordinates;
      this.ctx.beginPath();
      this.ctx.arc(x, y, 5, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.stroke();
    } else if (feature.geometry.type === 'LineString') {
      const coords = feature.geometry.coordinates;
      this.ctx.beginPath();
      this.ctx.moveTo(coords[0][0], coords[0][1]);
      for (let i = 1; i < coords.length; i++) {
        this.ctx.lineTo(coords[i][0], coords[i][1]);
      }
      this.ctx.stroke();
    } else if (feature.geometry.type === 'Polygon') {
      const coords = feature.geometry.coordinates[0];
      this.ctx.beginPath();
      this.ctx.moveTo(coords[0][0], coords[0][1]);
      for (let i = 1; i < coords.length; i++) {
        this.ctx.lineTo(coords[i][0], coords[i][1]);
      }
      this.ctx.closePath();
      this.ctx.fill();
      this.ctx.stroke();
    }
  }

  /**
   * 渲染绘制中的要素
   */
  private renderDrawing(cursorCoords?: [number, number]): void {
    if (!this.ctx || this.state.vertices.length === 0) return;

    const vertices = cursorCoords
      ? [...this.state.vertices, cursorCoords]
      : this.state.vertices;

    this.ctx.strokeStyle = 'rgba(66, 165, 245, 0.8)';
    this.ctx.lineWidth = 2;
    this.ctx.setLineDash([5, 5]);

    this.ctx.beginPath();
    this.ctx.moveTo(vertices[0][0], vertices[0][1]);
    for (let i = 1; i < vertices.length; i++) {
      this.ctx.lineTo(vertices[i][0], vertices[i][1]);
    }

    if (this.state.mode === 'polygon' && vertices.length > 2 && cursorCoords) {
      this.ctx.lineTo(vertices[0][0], vertices[0][1]);
    }

    this.ctx.stroke();
    this.ctx.setLineDash([]);

    // 绘制顶点
    vertices.forEach((vertex, index) => {
      this.ctx!.beginPath();
      this.ctx!.arc(vertex[0], vertex[1], 4, 0, Math.PI * 2);
      this.ctx!.fillStyle = index === 0 ? 'rgba(76, 175, 80, 1)' : 'rgba(66, 165, 245, 1)';
      this.ctx!.fill();
      this.ctx!.strokeStyle = '#fff';
      this.ctx!.lineWidth = 2;
      this.ctx!.stroke();
    });
  }

  /**
   * 生成要素ID
   */
  private generateFeatureId(): string {
    return `feature-${++this.featureIdCounter}-${Date.now()}`;
  }

  /**
   * 设置绘制模式
   */
  setMode(mode: DrawingMode): void {
    this.cancelDrawing();
    this.state.mode = mode;

    if (this.canvas) {
      this.canvas.style.cursor = mode === 'none' ? 'default' : 'crosshair';
    }

    this.logger.debug('Drawing mode changed:', mode);
  }

  /**
   * 获取当前模式
   */
  getMode(): DrawingMode {
    return this.state.mode;
  }

  /**
   * 获取所有要素
   */
  getFeatures(): DrawingFeature[] {
    return Array.from(this.features.values());
  }

  /**
   * 获取GeoJSON格式
   */
  toGeoJSON(): FeatureCollection {
    return {
      type: 'FeatureCollection',
      features: this.getFeatures()
    };
  }

  /**
   * 删除要素
   */
  deleteFeature(id: string): boolean {
    const result = this.features.delete(id);
    if (result) {
      this.render();
      this.logger.debug('Feature deleted:', id);
    }
    return result;
  }

  /**
   * 清空所有要素
   */
  clear(): void {
    this.features.clear();
    this.cancelDrawing();
    this.render();
    this.logger.info('All features cleared');
  }

  /**
   * 监听绘制事件
   */
  on(eventType: DrawingEventType, handler: (data: any) => void): () => void {
    return this.eventManager.on(eventType as any, handler as any);
  }

  /**
   * 销毁管理器
   */
  destroy(): void {
    this.disable();
    this.clear();
    this.eventManager.removeAllListeners();
    this.logger.info('DrawingManager destroyed');
  }
}

/**
 * 创建绘制管理器
 */
export function createDrawingManager(
  container: HTMLElement,
  options?: DrawingOptions
): DrawingManager {
  return new DrawingManager(container, options);
}

