import React, { useRef, useEffect, useState, useImperativeHandle, forwardRef, ReactNode } from 'react';
import {
  MapRenderer,
  LayerManager,
  AnimationController,
  EventManager,
  type MapOptions,
  type LayerOptions
} from '@ldesign-map/core';
import { MapContext } from '../context/MapContext';

/**
 * LDesignMap Props
 */
export interface LDesignMapProps {
  /** 容器宽度 */
  width?: string | number;
  /** 容器高度 */
  height?: string | number;
  /** 地图配置选项 */
  options?: MapOptions;
  /** 初始图层 */
  layers?: LayerOptions[];
  /** 视图状态 */
  viewState?: any;
  /** 是否可交互 */
  interactive?: boolean;
  /** 加载时显示的内容 */
  loadingComponent?: ReactNode;
  /** 子组件 */
  children?: ReactNode;
  /** 类名 */
  className?: string;
  /** 样式 */
  style?: React.CSSProperties;

  // 事件回调
  onReady?: (map: MapRenderer) => void;
  onClick?: (info: any) => void;
  onHover?: (info: any) => void;
  onViewChange?: (viewState: any) => void;
  onLayerAdd?: (layerId: string) => void;
  onLayerRemove?: (layerId: string) => void;
  onLayerUpdate?: (layerId: string) => void;
  onError?: (error: Error) => void;
}

export interface LDesignMapRef {
  addLayer: (options: LayerOptions) => string;
  removeLayer: (layerId: string) => boolean;
  updateLayer: (layerId: string, updates: Partial<LayerOptions>) => boolean;
  flyTo: (options: any) => void;
  getViewState: () => any;
  setViewState: (viewState: any) => void;
  mapInstance?: MapRenderer;
  layerManager?: LayerManager;
  animationController?: AnimationController;
}

/**
 * LDesignMap React Component
 */
export const LDesignMap = forwardRef<LDesignMapRef, LDesignMapProps>((props, ref) => {
  const {
    width = '100%',
    height = '400px',
    options,
    layers = [],
    viewState,
    interactive = true,
    loadingComponent,
    children,
    className = '',
    style = {},
    onReady,
    onClick,
    onHover,
    onViewChange,
    onLayerAdd,
    onLayerRemove,
    onLayerUpdate,
    onError
  } = props;

  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [mapInstance, setMapInstance] = useState<MapRenderer>();
  const [layerManager, setLayerManager] = useState<LayerManager>();
  const [animationController, setAnimationController] = useState<AnimationController>();
  const eventManagerRef = useRef<EventManager>();

  // 初始化地图
  useEffect(() => {
    if (!containerRef.current) return;

    const initMap = async () => {
      try {
        // 创建地图实例
        const map = new MapRenderer(containerRef.current!, {
          ...options,
          interactive
        });

        // 创建管理器
        const lm = new LayerManager(map);
        const ac = new AnimationController(map);
        const em = new EventManager();

        eventManagerRef.current = em;

        // 设置事件监听
        if (onClick) {
          map.on('click', onClick);
        }
        if (onHover) {
          map.on('hover', onHover);
        }
        if (onViewChange) {
          map.on('viewStateChange', onViewChange);
        }

        // 添加初始图层
        layers.forEach(layer => {
          const layerId = lm.addLayer(layer);
          onLayerAdd?.(layerId);
        });

        // 设置初始视图状态
        if (viewState) {
          map.setViewState(viewState);
        }

        setMapInstance(map);
        setLayerManager(lm);
        setAnimationController(ac);
        setLoading(false);

        onReady?.(map);
      } catch (error) {
        console.error('Failed to initialize map:', error);
        setLoading(false);
        onError?.(error as Error);
      }
    };

    initMap();

    // 清理函数
    return () => {
      if (eventManagerRef.current) {
        eventManagerRef.current.removeAll();
      }
      if (layerManager) {
        layerManager.destroy();
      }
      if (animationController) {
        animationController.destroy();
      }
      if (mapInstance) {
        mapInstance.destroy();
      }
    };
  }, []); // 只在组件挂载时初始化一次

  // 监听图层变化
  useEffect(() => {
    if (!layerManager || !layers) return;

    // 清除现有图层
    layerManager.clear();

    // 添加新图层
    layers.forEach(layer => {
      const layerId = layerManager.addLayer(layer);
      onLayerAdd?.(layerId);
    });
  }, [layers, layerManager]);

  // 监听视图状态变化
  useEffect(() => {
    if (!mapInstance || !viewState) return;
    mapInstance.setViewState(viewState);
  }, [viewState, mapInstance]);

  // 暴露方法给父组件
  useImperativeHandle(ref, () => ({
    addLayer: (options: LayerOptions) => {
      if (!layerManager) throw new Error('Map not initialized');
      const layerId = layerManager.addLayer(options);
      onLayerAdd?.(layerId);
      return layerId;
    },
    removeLayer: (layerId: string) => {
      if (!layerManager) throw new Error('Map not initialized');
      const result = layerManager.removeLayer(layerId);
      if (result) onLayerRemove?.(layerId);
      return result;
    },
    updateLayer: (layerId: string, updates: Partial<LayerOptions>) => {
      if (!layerManager) throw new Error('Map not initialized');
      const result = layerManager.updateLayer(layerId, updates);
      if (result) onLayerUpdate?.(layerId);
      return result;
    },
    flyTo: (options: any) => {
      if (!animationController) throw new Error('Map not initialized');
      animationController.flyTo(options);
    },
    getViewState: () => {
      if (!mapInstance) throw new Error('Map not initialized');
      return mapInstance.getViewState();
    },
    setViewState: (vs: any) => {
      if (!mapInstance) throw new Error('Map not initialized');
      mapInstance.setViewState(vs);
    },
    mapInstance,
    layerManager,
    animationController
  }), [mapInstance, layerManager, animationController]);

  // 容器样式
  const containerStyle: React.CSSProperties = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
    position: 'relative',
    overflow: 'hidden',
    ...style
  };

  return (
    <MapContext.Provider value={{ mapInstance, layerManager, animationController }}>
      <div
        ref={containerRef}
        className={`ldesign-map ${className}`}
        style={containerStyle}
      >
        {loading && (
          <div className="ldesign-map__loading">
            {loadingComponent || <span>Loading map...</span>}
          </div>
        )}
        {children}
      </div>
    </MapContext.Provider>
  );
});

LDesignMap.displayName = 'LDesignMap';



