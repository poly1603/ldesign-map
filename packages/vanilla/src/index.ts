/**
 * @ldesign-map/vanilla - Vanilla JavaScript Adapter
 * 
 * 提供原生 JavaScript 使用的简单 API 封装
 */

export * from '@ldesign-map/core';
import {
  MapRenderer,
  LayerManager,
  AnimationController,
  ClusterManager,
  HeatmapRenderer,
  MeasurementTool,
  GeometryEditor,
  TrackPlayer,
  EventManager,
  type MapOptions,
  type LayerOptions
} from '@ldesign-map/core';

/**
 * Vanilla JavaScript 地图实例
 * 提供简化的 API 供原生 JavaScript 使用
 */
export class LDesignMap {
  private renderer: MapRenderer;
  private layerManager: LayerManager;
  private animationController: AnimationController;
  private eventManager: EventManager;
  private plugins: Map<string, any> = new Map();

  constructor(container: HTMLElement | string, options: MapOptions) {
    const element = typeof container === 'string'
      ? document.querySelector(container) as HTMLElement
      : container;

    if (!element) {
      throw new Error('Container element not found');
    }

    this.renderer = new MapRenderer(element, options);
    this.layerManager = new LayerManager(this.renderer);
    this.animationController = new AnimationController(this.renderer);
    this.eventManager = new EventManager();

    this.setupDefaultEventHandlers();
  }

  /**
   * 设置默认事件处理
   */
  private setupDefaultEventHandlers(): void {
    // 添加默认的交互事件处理
    this.renderer.on('click', (info) => {
      this.eventManager.emit('map:click', info);
    });

    this.renderer.on('hover', (info) => {
      this.eventManager.emit('map:hover', info);
    });

    this.renderer.on('viewStateChange', (viewState) => {
      this.eventManager.emit('map:viewchange', viewState);
    });
  }

  /**
   * 添加图层
   */
  addLayer(options: LayerOptions): string {
    return this.layerManager.addLayer(options);
  }

  /**
   * 移除图层
   */
  removeLayer(layerId: string): boolean {
    return this.layerManager.removeLayer(layerId);
  }

  /**
   * 更新图层
   */
  updateLayer(layerId: string, updates: Partial<LayerOptions>): boolean {
    return this.layerManager.updateLayer(layerId, updates);
  }

  /**
   * 获取所有图层
   */
  getLayers(): LayerOptions[] {
    return this.layerManager.getLayers();
  }

  /**
   * 设置视图状态
   */
  setViewState(viewState: any): void {
    this.renderer.setViewState(viewState);
  }

  /**
   * 获取视图状态
   */
  getViewState(): any {
    return this.renderer.getViewState();
  }

  /**
   * 飞行到指定位置
   */
  flyTo(options: {
    longitude: number;
    latitude: number;
    zoom?: number;
    duration?: number;
  }): void {
    this.animationController.flyTo(options);
  }

  /**
   * 开启聚类功能
   */
  enableClustering(layerId: string, options?: any): ClusterManager {
    const cluster = new ClusterManager(this.renderer);
    cluster.enableForLayer(layerId, options);
    this.plugins.set(`cluster_${layerId}`, cluster);
    return cluster;
  }

  /**
   * 开启热力图
   */
  enableHeatmap(layerId: string, options?: any): HeatmapRenderer {
    const heatmap = new HeatmapRenderer();
    heatmap.setData(this.layerManager.getLayer(layerId)?.data || []);
    this.plugins.set(`heatmap_${layerId}`, heatmap);
    return heatmap;
  }

  /**
   * 开启测量工具
   */
  enableMeasurement(): MeasurementTool {
    const measurement = new MeasurementTool(this.renderer);
    this.plugins.set('measurement', measurement);
    return measurement;
  }

  /**
   * 开启编辑器
   */
  enableEditor(): GeometryEditor {
    const editor = new GeometryEditor(this.renderer);
    this.plugins.set('editor', editor);
    return editor;
  }

  /**
   * 开启轨迹播放
   */
  enableTrackPlayer(trackData: any[]): TrackPlayer {
    const player = new TrackPlayer(this.renderer);
    player.setTrack(trackData);
    this.plugins.set('trackPlayer', player);
    return player;
  }

  /**
   * 事件监听
   */
  on(event: string, handler: Function): void {
    this.eventManager.on(event, handler);
  }

  /**
   * 移除事件监听
   */
  off(event: string, handler: Function): void {
    this.eventManager.off(event, handler);
  }

  /**
   * 一次性事件监听
   */
  once(event: string, handler: Function): void {
    this.eventManager.once(event, handler);
  }

  /**
   * 触发事件
   */
  emit(event: string, ...args: any[]): void {
    this.eventManager.emit(event, ...args);
  }

  /**
   * 获取插件实例
   */
  getPlugin(name: string): any {
    return this.plugins.get(name);
  }

  /**
   * 销毁地图实例
   */
  destroy(): void {
    // 销毁所有插件
    this.plugins.forEach(plugin => {
      if (plugin.destroy) {
        plugin.destroy();
      }
    });
    this.plugins.clear();

    // 销毁核心组件
    this.layerManager.destroy();
    this.animationController.destroy();
    this.eventManager.removeAll();
    this.renderer.destroy();
  }

  /**
   * 静态方法：创建地图实例
   */
  static create(container: HTMLElement | string, options: MapOptions): LDesignMap {
    return new LDesignMap(container, options);
  }

  /**
   * 获取版本信息
   */
  static get version(): string {
    return '3.0.0';
  }
}

// 默认导出
export default LDesignMap;



