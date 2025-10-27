import { useMap } from './useMap';

export function useLayer() {
  const { layerManager } = useMap();

  return {
    layerManager,
    addLayer: (options: any) => {
      return layerManager?.value?.addLayer(options);
    },
    removeLayer: (id: string) => {
      return layerManager?.value?.removeLayer(id);
    },
    updateLayer: (id: string, updates: any) => {
      return layerManager?.value?.updateLayer(id, updates);
    }
  };
}
