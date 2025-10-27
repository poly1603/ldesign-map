// 核心渲染器
export { MapRenderer } from './MapRenderer';
export { MarkerRenderer } from './MarkerRenderer';
export { RippleMarker, createRippleMarker } from './RippleMarker';

// 新功能模块
export { HeatmapRenderer } from './HeatmapRenderer';
export { PathRenderer } from './PathRenderer';
export { ClusterManager } from './ClusterManager';
export { Legend } from './Legend';
export { EventManager, createEventManager } from './EventManager';
export { Logger, LogLevel, MapError, ErrorType, createMapError } from './Logger';
export { ExportUtil } from './ExportUtil';
export { LayerCache, globalLayerCache } from './LayerCache';
export {
  MarkerShapes,
  getMarkerShape,
  getAllMarkerShapeNames,
  createCustomShape,
  svgToDataUrl,
  applySvgColor
} from './MarkerShapes';

// v2.1 新增功能
export { MapControls } from './MapControls';
export { PerformanceMonitor } from './PerformanceMonitor';
export { MemoryManager, globalMemoryManager } from './MemoryManager';
export { DataFilter } from './DataFilter';
export { SearchLocator } from './SearchLocator';
export { LayerPanel } from './LayerPanel';

// v2.2 新增功能
export { AnimationController, globalAnimationController, Easings, animate } from './AnimationController';
export { LayerManager } from './LayerManager';
export { GeometryUtils } from './GeometryUtils';
export { DataTransformer } from './DataTransformer';

// v2.4 动画批处理
export {
  AnimationBatcher,
  globalAnimationBatcher,
  animate as animateBatch,
  stopAnimation,
  pauseAnimation,
  resumeAnimation,
  type AnimationConfig,
  type AnimationEasing
} from './animation/AnimationBatcher';

// v2.5 空间索引
export {
  Quadtree,
  GeoQuadtree,
  type Point,
  type Bounds
} from './spatial/Quadtree';

export {
  SpatialIndex,
  createGeoIndex,
  createPlanarIndex,
  type SpatialIndexOptions
} from './spatial/SpatialIndex';

// v2.6 编辑器功能
export {
  DrawingManager,
  createDrawingManager,
  type DrawingMode,
  type DrawingOptions,
  type DrawingFeature,
  type DrawingEventType
} from './editor/DrawingManager';

export {
  GeometryEditor,
  type EditMode,
  type EditOptions
} from './editor/GeometryEditor';

// v2.7 插件系统
export {
  PluginSystem,
  createPluginSystem,
  type Plugin,
  type PluginMetadata,
  type PluginContext,
  type PluginLifecycleHook
} from './plugin/PluginSystem';

export {
  BasePlugin
} from './plugin/BasePlugin';

export {
  HeatmapPlugin,
  createHeatmapPlugin
} from './plugin/HeatmapPlugin';

// v2.8 资源管理
export {
  ResourcePool,
  LayerPool,
  globalLayerPool,
  type PoolOptions
} from './resource/ResourcePool';

export {
  LazyLoader,
  globalLazyLoader,
  type LazyLoadOptions,
  type LayerItem
} from './resource/LazyLoader';

// v2.9 批量渲染
export {
  BatchRenderer,
  globalBatchRenderer,
  type BatchOptions,
  type BatchGroup
} from './renderer/BatchRenderer';

// v3.0 严格类型系统
export {
  type Coordinate,
  type Coordinate3D,
  type RGBAColor,
  type RGBColor,
  type ColorValue,
  type NumericValue,
  type StringValue,
  type DeckGLLayerType,
  type LayerConstructor,
  type MapEventData,
  type ClickInfo,
  type HoverInfo,
  type EventCallback,
  type ClickCallback,
  type HoverCallback,
  type ProgressCallback,
  type ErrorCallback,
  type AsyncResult,
  type MaybeAsync,
  type DeepReadonly,
  type DeepPartial,
  isCoordinate,
  isRGBAColor,
  isPromise,
  assertNotNull,
  assertType,
  validateCoordinateRange,
  validateColor,
  normalizeColor,
  safeConvert,
  toArray,
  clamp,
  toInteger
} from './types/strict';

// v2.3 新增功能
export { TrackPlayer, createTrackPlayer, createTrackFromGPS } from './TrackPlayer';
export { GeoFence, createGeoFence, createFenceFromGeoJSON } from './GeoFence';
export { POISearch, createPOISearch, createPOIsFromGeoJSON } from './POISearch';

// 测量工具
export {
  MeasurementTool,
  calculateDistance,
  calculatePathLength,
  calculatePolygonArea,
  formatDistance,
  formatArea,
  createDistanceTool,
  createAreaTool
} from './MeasurementTool';

// 类型导出
export type {
  ViewMode,
  ViewState,
  MapRendererOptions,
  LayerOptions,
  TextLabelOptions,
  ColorScheme,
  ColorMode,
  CityMarker,
  CityMarkerOptions,
  TooltipInfo,
  DeckGLLayer,
  SelectionMode,
  SelectionStyle,
  Feature,
  FeatureCollection,
  GeoJsonProperties
} from './types';

export type {
  MarkerStyle,
  MarkerAnimation,
  MarkerOptions,
  MarkerIconOptions,
  MarkerLabelOptions,
  MarkerGroupOptions,
  CustomMarkerRenderer
} from './MarkerRenderer';

export type {
  HeatmapDataPoint,
  HeatmapOptions
} from './HeatmapRenderer';

export type {
  PathData,
  ArcData,
  PathLayerOptions,
  ArcLayerOptions
} from './PathRenderer';

export type {
  ClusterPoint,
  Cluster,
  ClusterOptions
} from './ClusterManager';

export type {
  LegendPosition,
  LegendItem,
  LegendOptions
} from './Legend';

export type {
  MapEventType,
  EventHandler,
  MapEvent
} from './EventManager';

export type {
  LogEntry,
  LogHandler
} from './Logger';

export type {
  ExportFormat,
  ExportOptions
} from './ExportUtil';

export type {
  CacheStrategy
} from './LayerCache';

export type {
  MeasurementType,
  MeasurementResult
} from './MeasurementTool';

export type {
  MarkerShape
} from './MarkerShapes';

export type {
  RippleMarkerOptions
} from './RippleMarker';

export type {
  MapControlsOptions
} from './MapControls';

export type {
  PerformanceStats,
  PerformanceMonitorOptions
} from './PerformanceMonitor';

export type {
  MemoryManagerOptions
} from './MemoryManager';

export type {
  FilterOperator,
  FilterRule,
  FilterGroup,
  FilterExpression
} from './DataFilter';

export type {
  SearchResult,
  SearchOptions
} from './SearchLocator';

export type {
  LayerInfo,
  LayerPanelOptions
} from './LayerPanel';

export type {
  AnimationOptions,
  Animation
} from './AnimationController';

export type {
  Point,
  Bounds
} from './GeometryUtils';

export type {
  TrackPoint,
  TrackData,
  PlayOptions,
  PlaybackState
} from './TrackPlayer';

export type {
  FenceType,
  FenceStatus,
  FenceEventType,
  GeoFenceOptions,
  FenceEvent,
  MonitorTarget,
  FenceStatistics
} from './GeoFence';

export type {
  POIType,
  POIData,
  SearchOptions,
  SearchFilter,
  SearchResult,
  POICategoryConfig
} from './POISearch';
