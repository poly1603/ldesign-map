import { useContext } from 'react';
import { MapContext } from '../context/MapContext';

/**
 * Hook to access the map instance and managers
 */
export function useMap() {
  const context = useContext(MapContext);

  if (!context) {
    console.warn('useMap must be used within a LDesignMap component');
  }

  return {
    ...context,
    isReady: !!context.mapInstance,

    flyTo: (options: any) => {
      if (context.animationController) {
        context.animationController.flyTo(options);
      }
    },

    getViewState: () => {
      if (context.mapInstance) {
        return context.mapInstance.getViewState();
      }
      return null;
    },

    setViewState: (viewState: any) => {
      if (context.mapInstance) {
        context.mapInstance.setViewState(viewState);
      }
    }
  };
}



