<template>
  <div ref="mapContainer" class="ldesign-map" :style="containerStyle">
    <div v-if="loading" class="ldesign-map__loading">
      <slot name="loading">加载中...</slot>
    </div>
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
import { 
  ref, 
  onMounted, 
  onUnmounted, 
  computed, 
  watch, 
  provide,
  shallowRef
} from 'vue';
import { 
  MapRenderer,
  LayerManager,
  AnimationController,
  EventManager,
  type MapOptions,
  type LayerOptions 
} from '@ldesign-map/core';

// Props 定义
const props = withDefaults(defineProps<{
  width?: string | number;
  height?: string | number;
  options?: MapOptions;
  layers?: LayerOptions[];
  viewState?: any;
  interactive?: boolean;
}>(), {
  width: '100%',
  height: '400px',
  interactive: true
});

// Emits 定义
const emit = defineEmits<{
  ready: [map: MapRenderer];
  click: [info: any];
  hover: [info: any];
  viewChange: [viewState: any];
  layerAdd: [layerId: string];
  layerRemove: [layerId: string];
  layerUpdate: [layerId: string];
  error: [error: Error];
}>();

// Refs
const mapContainer = ref<HTMLElement>();
const loading = ref(true);
const mapInstance = shallowRef<MapRenderer>();
const layerManager = shallowRef<LayerManager>();
const animationController = shallowRef<AnimationController>();
const eventManager = shallowRef<EventManager>();

// Computed
const containerStyle = computed(() => ({
  width: typeof props.width === 'number' ? `${props.width}px` : props.width,
  height: typeof props.height === 'number' ? `${props.height}px` : props.height
}));

// 初始化地图
const initMap = async () => {
  if (!mapContainer.value) return;

  try {
    // 创建地图实例
    mapInstance.value = new MapRenderer(mapContainer.value, {
      ...props.options,
      interactive: props.interactive
    });

    // 创建管理器
    layerManager.value = new LayerManager(mapInstance.value);
    animationController.value = new AnimationController(mapInstance.value);
    eventManager.value = new EventManager();

    // 设置事件监听
    setupEventListeners();

    // 添加初始图层
    if (props.layers) {
      props.layers.forEach(layer => {
        layerManager.value!.addLayer(layer);
      });
    }

    // 设置初始视图状态
    if (props.viewState) {
      mapInstance.value.setViewState(props.viewState);
    }

    loading.value = false;
    emit('ready', mapInstance.value);
  } catch (error) {
    console.error('Failed to initialize map:', error);
    loading.value = false;
    emit('error', error as Error);
  }
};

// 设置事件监听器
const setupEventListeners = () => {
  if (!mapInstance.value) return;

  mapInstance.value.on('click', (info: any) => {
    emit('click', info);
  });

  mapInstance.value.on('hover', (info: any) => {
    emit('hover', info);
  });

  mapInstance.value.on('viewStateChange', (viewState: any) => {
    emit('viewChange', viewState);
  });
};

// Watch props 变化
watch(() => props.layers, (newLayers) => {
  if (!layerManager.value || !newLayers) return;
  
  // 清除现有图层
  layerManager.value.clear();
  
  // 添加新图层
  newLayers.forEach(layer => {
    layerManager.value!.addLayer(layer);
  });
}, { deep: true });

watch(() => props.viewState, (newViewState) => {
  if (!mapInstance.value || !newViewState) return;
  mapInstance.value.setViewState(newViewState);
}, { deep: true });

// 公开的方法
const addLayer = (options: LayerOptions): string => {
  if (!layerManager.value) throw new Error('Map not initialized');
  const layerId = layerManager.value.addLayer(options);
  emit('layerAdd', layerId);
  return layerId;
};

const removeLayer = (layerId: string): boolean => {
  if (!layerManager.value) throw new Error('Map not initialized');
  const result = layerManager.value.removeLayer(layerId);
  if (result) emit('layerRemove', layerId);
  return result;
};

const updateLayer = (layerId: string, updates: Partial<LayerOptions>): boolean => {
  if (!layerManager.value) throw new Error('Map not initialized');
  const result = layerManager.value.updateLayer(layerId, updates);
  if (result) emit('layerUpdate', layerId);
  return result;
};

const flyTo = (options: {
  longitude: number;
  latitude: number;
  zoom?: number;
  duration?: number;
}): void => {
  if (!animationController.value) throw new Error('Map not initialized');
  animationController.value.flyTo(options);
};

const getViewState = (): any => {
  if (!mapInstance.value) throw new Error('Map not initialized');
  return mapInstance.value.getViewState();
};

const setViewState = (viewState: any): void => {
  if (!mapInstance.value) throw new Error('Map not initialized');
  mapInstance.value.setViewState(viewState);
};

// 提供给子组件的注入
provide('mapInstance', mapInstance);
provide('layerManager', layerManager);
provide('animationController', animationController);

// 生命周期
onMounted(() => {
  initMap();
});

onUnmounted(() => {
  if (eventManager.value) {
    eventManager.value.removeAll();
  }
  if (layerManager.value) {
    layerManager.value.destroy();
  }
  if (animationController.value) {
    animationController.value.destroy();
  }
  if (mapInstance.value) {
    mapInstance.value.destroy();
  }
});

// 暴露给父组件的方法
defineExpose({
  addLayer,
  removeLayer,
  updateLayer,
  flyTo,
  getViewState,
  setViewState,
  mapInstance,
  layerManager,
  animationController
});
</script>

<style scoped>
.ldesign-map {
  position: relative;
  overflow: hidden;
}

.ldesign-map__loading {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 10;
  background: rgba(255, 255, 255, 0.9);
  padding: 20px;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}
</style>



