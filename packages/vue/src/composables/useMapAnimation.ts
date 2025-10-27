import { useMap } from './useMap';

export function useMapAnimation() {
  const { animationController } = useMap();

  return {
    animationController,
    flyTo: (options: any) => {
      animationController?.value?.flyTo(options);
    }
  };
}
