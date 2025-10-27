<template>
  <slot></slot>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';
import { useMap } from '../composables/useMap';

const props = defineProps<{
  layerId: string;
  type: string;
  data: any[];
  options?: any;
}>();

const { layerManager } = useMap();

onMounted(() => {
  if (layerManager?.value) {
    layerManager.value.addLayer({
      id: props.layerId,
      type: props.type,
      data: props.data,
      ...props.options
    });
  }
});

onUnmounted(() => {
  if (layerManager?.value) {
    layerManager.value.removeLayer(props.layerId);
  }
});
</script>
