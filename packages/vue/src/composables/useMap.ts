import { inject, Ref, ShallowRef } from 'vue';
import type { MapRenderer, LayerManager, AnimationController } from '@ldesign-map/core';

/**
 * 使用地图实例的 Composable
 */
export function useMap() {
  const mapInstance = inject<ShallowRef<MapRenderer | undefined>>('mapInstance');
  const layerManager = inject<ShallowRef<LayerManager | undefined>>('layerManager');
  const animationController = inject<ShallowRef<AnimationController | undefined>>('animationController');

  if (!mapInstance || !layerManager || !animationController) {
    console.warn('useMap() must be used within LDesignMap component');
  }

  return {
    mapInstance,
    layerManager,
    animationController,

    // 便捷方法
    isReady: () => !!mapInstance?.value,

    flyTo: (options: any) => {
      if (animationController?.value) {
        animationController.value.flyTo(options);
      }
    },

    getViewState: () => {
      if (mapInstance?.value) {
        return mapInstance.value.getViewState();
      }
      return null;
    },

    setViewState: (viewState: any) => {
      if (mapInstance?.value) {
        mapInstance.value.setViewState(viewState);
      }
    }
  };
}



