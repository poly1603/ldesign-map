import { onMounted, onUnmounted } from 'vue';
import { useMap } from './useMap';

export function useMapEvents() {
  const { mapInstance } = useMap();

  const on = (event: string, handler: Function) => {
    if (mapInstance?.value) {
      mapInstance.value.on(event, handler);
    }
  };

  const off = (event: string, handler: Function) => {
    if (mapInstance?.value) {
      mapInstance.value.off(event, handler);
    }
  };

  return {
    on,
    off
  };
}
