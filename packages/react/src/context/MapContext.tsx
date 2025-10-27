import { createContext } from 'react';
import type { MapRenderer, LayerManager, AnimationController } from '@ldesign-map/core';

export interface MapContextValue {
  mapInstance?: MapRenderer;
  layerManager?: LayerManager;
  animationController?: AnimationController;
}

export const MapContext = createContext<MapContextValue>({});



