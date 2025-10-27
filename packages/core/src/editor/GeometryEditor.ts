/**
 * GeometryEditor - 几何编辑器
 * 支持拖拽、删除、修改几何体
 */

import { EventManager } from '../EventManager';
import { Logger } from '../Logger';
import type { DrawingFeature } from './DrawingManager';

export type EditMode = 'select' | 'move' | 'vertex' | 'delete';

export interface EditOptions {
  vertexRadius?: number;
  selectColor?: number[];
  hoverColor?: number[];
  enableSnap?: boolean;
  snapDistance?: number;
}

export interface EditState {
  mode: EditMode;
  selectedFeature: string | null;
  selectedVertex: number | null;
  isDragging: boolean;
  dragStart: [number, number] | null;
}

/**
 * GeometryEditor - 几何编辑器
 */
export class GeometryEditor {
  private container: HTMLElement;
  private eventManager: EventManager;
  private logger = Logger.getInstance();
  private features: Map<string, DrawingFeature>;

  private state: EditState = {
    mode: 'select',
    selectedFeature: null,
    selectedVertex: null,
    isDragging: false,
    dragStart: null
  };

  private options: Required<EditOptions> = {
    vertexRadius: 6,
    selectColor: [255, 215, 0, 255],
    hoverColor: [255, 152, 0, 255],
    enableSnap: true,
    snapDistance: 10
  };

  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;

  constructor(
    container: HTMLElement,
    features: Map<string, DrawingFeature>,
    options: EditOptions = {}
  ) {
    this.container = container;
    this.features = features;
    this.eventManager = new EventManager();
    this.options = { ...this.options, ...options };

    this.createCanvas();
    this.attachEventListeners();
  }

  /**
   * 创建编辑画布
   */
  private createCanvas(): void {
    this.canvas = document.createElement('canvas');
    this.canvas.style.position = 'absolute';
    this.canvas.style.top = '0';
    this.canvas.style.left = '0';
    this.canvas.style.pointerEvents = 'auto';
    this.canvas.style.zIndex = '1001';

    const rect = this.container.getBoundingClientRect();
    this.canvas.width = rect.width;
    this.canvas.height = rect.height;

    this.ctx = this.canvas.getContext('2d');
    this.container.appendChild(this.canvas);
  }

  /**
   * 绑定事件
   */
  private attachEventListeners(): void {
    if (!this.canvas) return;

    this.canvas.addEventListener('mousedown', this.handleMouseDown);
    this.canvas.addEventListener('mousemove', this.handleMouseMove);
    this.canvas.addEventListener('mouseup', this.handleMouseUp);
    this.canvas.addEventListener('click', this.handleClick);
  }

  /**
   * 处理鼠标按下
   */
  private handleMouseDown = (event: MouseEvent): void => {
    const coords = this.getCanvasCoordinates(event);

    if (this.state.mode === 'vertex') {
      const vertex = this.findNearestVertex(coords);
      if (vertex) {
        this.state.selectedVertex = vertex.index;
        this.state.selectedFeature = vertex.featureId;
        this.state.isDragging = true;
        this.state.dragStart = coords;
      }
    } else if (this.state.mode === 'move') {
      const feature = this.findFeatureAtPoint(coords);
      if (feature) {
        this.state.selectedFeature = feature.id;
        this.state.isDragging = true;
        this.state.dragStart = coords;
      }
    }

    this.render();
  };

  /**
   * 处理鼠标移动
   */
  private handleMouseMove = (event: MouseEvent): void => {
    const coords = this.getCanvasCoordinates(event);

    if (this.state.isDragging && this.state.dragStart) {
      const dx = coords[0] - this.state.dragStart[0];
      const dy = coords[1] - this.state.dragStart[1];

      if (this.state.mode === 'vertex' && this.state.selectedFeature && this.state.selectedVertex !== null) {
        this.moveVertex(this.state.selectedFeature, this.state.selectedVertex, dx, dy);
      } else if (this.state.mode === 'move' && this.state.selectedFeature) {
        this.moveFeature(this.state.selectedFeature, dx, dy);
      }

      this.state.dragStart = coords;
      this.render();
    } else {
      // 悬停效果
      this.updateCursor(coords);
    }
  };

  /**
   * 处理鼠标释放
   */
  private handleMouseUp = (event: MouseEvent): void => {
    if (this.state.isDragging) {
      this.state.isDragging = false;
      this.state.dragStart = null;

      if (this.state.selectedFeature) {
        const feature = this.features.get(this.state.selectedFeature);
        if (feature) {
          feature.properties.modified = Date.now();
          this.eventManager.emit('featuremodified' as any, { feature });
        }
      }
    }
  };

  /**
   * 处理点击
   */
  private handleClick = (event: MouseEvent): void => {
    const coords = this.getCanvasCoordinates(event);

    if (this.state.mode === 'select') {
      const feature = this.findFeatureAtPoint(coords);
      this.state.selectedFeature = feature ? feature.id : null;
      this.render();
    } else if (this.state.mode === 'delete') {
      const feature = this.findFeatureAtPoint(coords);
      if (feature) {
        this.deleteFeature(feature.id);
      }
    }
  };

  /**
   * 获取画布坐标
   */
  private getCanvasCoordinates(event: MouseEvent): [number, number] {
    if (!this.canvas) return [0, 0];

    const rect = this.canvas.getBoundingClientRect();
    return [
      event.clientX - rect.left,
      event.clientY - rect.top
    ];
  }

  /**
   * 查找点位置的要素
   */
  private findFeatureAtPoint(point: [number, number]): DrawingFeature | null {
    for (const feature of this.features.values()) {
      if (this.isPointInFeature(point, feature)) {
        return feature;
      }
    }
    return null;
  }

  /**
   * 检查点是否在要素内
   */
  private isPointInFeature(point: [number, number], feature: DrawingFeature): boolean {
    if (feature.geometry.type === 'Point') {
      const [x, y] = feature.geometry.coordinates;
      const distance = Math.sqrt(
        Math.pow(point[0] - x, 2) + Math.pow(point[1] - y, 2)
      );
      return distance <= 10;
    } else if (feature.geometry.type === 'LineString') {
      const coords = feature.geometry.coordinates;
      for (let i = 0; i < coords.length - 1; i++) {
        const dist = this.distanceToSegment(point, coords[i], coords[i + 1]);
        if (dist <= 10) return true;
      }
    } else if (feature.geometry.type === 'Polygon') {
      return this.isPointInPolygon(point, feature.geometry.coordinates[0]);
    }

    return false;
  }

  /**
   * 查找最近的顶点
   */
  private findNearestVertex(point: [number, number]): { featureId: string; index: number } | null {
    let nearest: { featureId: string; index: number; distance: number } | null = null;

    this.features.forEach((feature, featureId) => {
      let coords: [number, number][] = [];

      if (feature.geometry.type === 'LineString') {
        coords = feature.geometry.coordinates;
      } else if (feature.geometry.type === 'Polygon') {
        coords = feature.geometry.coordinates[0];
      }

      coords.forEach((vertex, index) => {
        const distance = Math.sqrt(
          Math.pow(point[0] - vertex[0], 2) + Math.pow(point[1] - vertex[1], 2)
        );

        if (distance <= this.options.vertexRadius && (!nearest || distance < nearest.distance)) {
          nearest = { featureId, index, distance };
        }
      });
    });

    return nearest;
  }

  /**
   * 移动顶点
   */
  private moveVertex(featureId: string, vertexIndex: number, dx: number, dy: number): void {
    const feature = this.features.get(featureId);
    if (!feature) return;

    if (feature.geometry.type === 'LineString') {
      const coords = feature.geometry.coordinates;
      coords[vertexIndex][0] += dx;
      coords[vertexIndex][1] += dy;
    } else if (feature.geometry.type === 'Polygon') {
      const coords = feature.geometry.coordinates[0];
      coords[vertexIndex][0] += dx;
      coords[vertexIndex][1] += dy;

      // 如果是第一个点，也更新最后一个点（闭合）
      if (vertexIndex === 0) {
        coords[coords.length - 1] = [...coords[0]];
      }
    }
  }

  /**
   * 移动整个要素
   */
  private moveFeature(featureId: string, dx: number, dy: number): void {
    const feature = this.features.get(featureId);
    if (!feature) return;

    if (feature.geometry.type === 'Point') {
      feature.geometry.coordinates[0] += dx;
      feature.geometry.coordinates[1] += dy;
    } else if (feature.geometry.type === 'LineString') {
      feature.geometry.coordinates.forEach(coord => {
        coord[0] += dx;
        coord[1] += dy;
      });
    } else if (feature.geometry.type === 'Polygon') {
      feature.geometry.coordinates[0].forEach(coord => {
        coord[0] += dx;
        coord[1] += dy;
      });
    }
  }

  /**
   * 删除要素
   */
  private deleteFeature(featureId: string): void {
    this.features.delete(featureId);
    this.state.selectedFeature = null;
    this.eventManager.emit('featuredeleted' as any, { featureId });
    this.render();
  }

  /**
   * 渲染画布
   */
  private render(): void {
    if (!this.ctx || !this.canvas) return;

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // 渲染选中效果
    if (this.state.selectedFeature) {
      const feature = this.features.get(this.state.selectedFeature);
      if (feature) {
        this.renderSelectedFeature(feature);
      }
    }
  }

  /**
   * 渲染选中的要素
   */
  private renderSelectedFeature(feature: DrawingFeature): void {
    if (!this.ctx) return;

    const [r, g, b, a] = this.options.selectColor;
    this.ctx.strokeStyle = `rgba(${r},${g},${b},${a / 255})`;
    this.ctx.lineWidth = 3;

    // 渲染顶点
    let vertices: [number, number][] = [];

    if (feature.geometry.type === 'LineString') {
      vertices = feature.geometry.coordinates;
    } else if (feature.geometry.type === 'Polygon') {
      vertices = feature.geometry.coordinates[0];
    }

    vertices.forEach((vertex, index) => {
      this.ctx!.beginPath();
      this.ctx!.arc(vertex[0], vertex[1], this.options.vertexRadius, 0, Math.PI * 2);
      this.ctx!.fillStyle = 'rgba(255, 255, 255, 1)';
      this.ctx!.fill();
      this.ctx!.stroke();
    });
  }

  /**
   * 更新光标样式
   */
  private updateCursor(coords: [number, number]): void {
    if (!this.canvas) return;

    if (this.state.mode === 'vertex') {
      const vertex = this.findNearestVertex(coords);
      this.canvas.style.cursor = vertex ? 'move' : 'default';
    } else if (this.state.mode === 'move') {
      const feature = this.findFeatureAtPoint(coords);
      this.canvas.style.cursor = feature ? 'move' : 'default';
    } else if (this.state.mode === 'delete') {
      const feature = this.findFeatureAtPoint(coords);
      this.canvas.style.cursor = feature ? 'not-allowed' : 'default';
    }
  }

  /**
   * 点到线段的距离
   */
  private distanceToSegment(
    point: [number, number],
    start: [number, number],
    end: [number, number]
  ): number {
    const [px, py] = point;
    const [x1, y1] = start;
    const [x2, y2] = end;

    const A = px - x1;
    const B = py - y1;
    const C = x2 - x1;
    const D = y2 - y1;

    const dot = A * C + B * D;
    const lenSq = C * C + D * D;
    let param = -1;

    if (lenSq !== 0) {
      param = dot / lenSq;
    }

    let xx: number, yy: number;

    if (param < 0) {
      xx = x1;
      yy = y1;
    } else if (param > 1) {
      xx = x2;
      yy = y2;
    } else {
      xx = x1 + param * C;
      yy = y1 + param * D;
    }

    const dx = px - xx;
    const dy = py - yy;

    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * 判断点是否在多边形内
   */
  private isPointInPolygon(point: [number, number], polygon: [number, number][]): boolean {
    const [x, y] = point;
    let inside = false;

    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const xi = polygon[i][0], yi = polygon[i][1];
      const xj = polygon[j][0], yj = polygon[j][1];

      const intersect = ((yi > y) !== (yj > y)) &&
        (x < (xj - xi) * (y - yi) / (yj - yi) + xi);

      if (intersect) inside = !inside;
    }

    return inside;
  }

  /**
   * 设置编辑模式
   */
  setMode(mode: EditMode): void {
    this.state.mode = mode;
    this.state.selectedFeature = null;
    this.state.selectedVertex = null;

    if (this.canvas) {
      const cursors: Record<EditMode, string> = {
        select: 'default',
        move: 'move',
        vertex: 'crosshair',
        delete: 'not-allowed'
      };
      this.canvas.style.cursor = cursors[mode];
    }

    this.render();
  }

  /**
   * 获取选中要素
   */
  getSelectedFeature(): DrawingFeature | null {
    if (!this.state.selectedFeature) return null;
    return this.features.get(this.state.selectedFeature) || null;
  }

  /**
   * 监听编辑事件
   */
  on(eventType: string, handler: (data: any) => void): () => void {
    return this.eventManager.on(eventType as any, handler as any);
  }

  /**
   * 销毁编辑器
   */
  destroy(): void {
    if (this.canvas) {
      this.canvas.removeEventListener('mousedown', this.handleMouseDown);
      this.canvas.removeEventListener('mousemove', this.handleMouseMove);
      this.canvas.removeEventListener('mouseup', this.handleMouseUp);
      this.canvas.removeEventListener('click', this.handleClick);

      if (this.canvas.parentNode) {
        this.canvas.parentNode.removeChild(this.canvas);
      }
    }

    this.eventManager.removeAllListeners();
    this.logger.info('GeometryEditor destroyed');
  }
}

