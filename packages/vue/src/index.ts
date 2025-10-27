/**
 * @ldesign-map/vue - Vue 3 Components
 */

import type { App, Plugin } from 'vue';
import LDesignMap from './components/LDesignMap.vue';
import LDesignMapLayer from './components/LDesignMapLayer.vue';
import LDesignMapMarker from './components/LDesignMapMarker.vue';
import LDesignMapControl from './components/LDesignMapControl.vue';
import LDesignMapCluster from './components/LDesignMapCluster.vue';
import LDesignMapHeatmap from './components/LDesignMapHeatmap.vue';
import LDesignMapMeasurement from './components/LDesignMapMeasurement.vue';

// 导出组件
export { LDesignMap, LDesignMapLayer, LDesignMapMarker, LDesignMapControl, LDesignMapCluster, LDesignMapHeatmap, LDesignMapMeasurement };

// 导出 composables
export { useMap } from './composables/useMap';
export { useLayer } from './composables/useLayer';
export { useMapEvents } from './composables/useMapEvents';
export { useMapAnimation } from './composables/useMapAnimation';

// 导出类型
export * from '@ldesign-map/core';
export * from './types';

// 组件列表
const components = [
  LDesignMap,
  LDesignMapLayer,
  LDesignMapMarker,
  LDesignMapControl,
  LDesignMapCluster,
  LDesignMapHeatmap,
  LDesignMapMeasurement
];

// Vue 插件安装
const install: Plugin = {
  install(app: App) {
    components.forEach(component => {
      app.component(component.name || 'LDesignMap', component);
    });
  }
};

export default {
  install,
  ...components
};



