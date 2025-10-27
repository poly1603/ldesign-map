import { Deck } from '@deck.gl/core';
import { ScatterplotLayer, PathLayer } from '@deck.gl/layers';

const deck = new Deck({
  container: 'map',
  initialViewState: {
    longitude: 116.4074,
    latitude: 39.9042,
    zoom: 5
  },
  controller: true
});

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

document.getElementById('addPoints').addEventListener('click', () => {
  const layer = new ScatterplotLayer({
    id: 'points',
    data: cities,
    getPosition: d => d.position,
    getRadius: 50000,
    getFillColor: d => d.color,
    radiusMinPixels: 10
  });

  const layers = deck.props.layers || [];
  deck.setProps({ layers: [...layers.filter(l => l.id !== 'points'), layer] });
});

document.getElementById('addPath').addEventListener('click', () => {
  const layer = new PathLayer({
    id: 'path',
    data: [{ path }],
    getPath: d => d.path,
    getColor: [80, 180, 230, 255],
    getWidth: 5
  });

  const layers = deck.props.layers || [];
  deck.setProps({ layers: [...layers.filter(l => l.id !== 'path'), layer] });
});

document.getElementById('clearMap').addEventListener('click', () => {
  deck.setProps({ layers: [] });
});

// 自动添加初始图层
setTimeout(() => {
  document.getElementById('addPoints').click();
  document.getElementById('addPath').click();
}, 500);

console.log('Lit Map initialized');
