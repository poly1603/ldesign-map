<template>
  <div class="app">
    <h1>🗺️ Vue 3 Map Example</h1>
    <div id="map"></div>
    <div class="controls">
      <button @click="addPoints">添加散点</button>
      <button @click="addPath">添加路径</button>
      <button @click="clearMap">清除</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { Deck } from '@deck.gl/core';
import { ScatterplotLayer, PathLayer } from '@deck.gl/layers';

const deck = ref(null);

const cities = [
  { position: [116.4074, 39.9042], color: [255, 0, 0] },
  { position: [121.4737, 31.2304], color: [0, 128, 255] },
  { position: [113.2644, 23.1291], color: [255, 165, 0] }
];

const path = [
  [116.4074, 39.9042],
  [121.4737, 31.2304],
  [113.2644, 23.1291]
];

onMounted(() => {
  deck.value = new Deck({
    container: 'map',
    initialViewState: {
      longitude: 116.4074,
      latitude: 39.9042,
      zoom: 5
    },
    controller: true
  });
  
  setTimeout(() => {
    addPoints();
    addPath();
  }, 500);
});

const addPoints = () => {
  const layer = new ScatterplotLayer({
    id: 'points',
    data: cities,
    getPosition: d => d.position,
    getRadius: 50000,
    getFillColor: d => d.color,
    radiusMinPixels: 10
  });
  
  const layers = deck.value.props.layers || [];
  deck.value.setProps({ layers: [...layers.filter(l => l.id !== 'points'), layer] });
};

const addPath = () => {
  const layer = new PathLayer({
    id: 'path',
    data: [{ path }],
    getPath: d => d.path,
    getColor: [80, 180, 230, 255],
    getWidth: 5
  });
  
  const layers = deck.value.props.layers || [];
  deck.value.setProps({ layers: [...layers.filter(l => l.id !== 'path'), layer] });
};

const clearMap = () => {
  deck.value.setProps({ layers: [] });
};
</script>

<style scoped>
* { margin: 0; padding: 0; box-sizing: border-box; }

.app {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
  padding: 20px;
}

h1 {
  color: white;
  margin-bottom: 20px;
  text-align: center;
}

#map {
  width: 100%;
  height: 600px;
  border-radius: 12px;
  background: #f0f2f5;
  margin-bottom: 20px;
}

.controls {
  display: flex;
  gap: 10px;
  justify-content: center;
}

button {
  padding: 12px 24px;
  background: white;
  color: #667eea;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.2s;
}

button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}
</style>
