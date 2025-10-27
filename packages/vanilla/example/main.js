import { Deck } from '@deck.gl/core';
import { ScatterplotLayer, PathLayer } from '@deck.gl/layers';

// 创建地图实例
const deck = new Deck({
  container: 'map',
  initialViewState: {
    longitude: 116.4074,
    latitude: 39.9042,
    zoom: 5,
    pitch: 0,
    bearing: 0
  },
  controller: true
});

// 示例数据
const cities = [
  { position: [116.4074, 39.9042], name: '北京', color: [255, 0, 0] },
  { position: [121.4737, 31.2304], name: '上海', color: [0, 128, 255] },
  { position: [113.2644, 23.1291], name: '广州', color: [255, 165, 0] },
  { position: [114.0579, 22.5431], name: '深圳', color: [0, 255, 0] }
];

const path = [
  [116.4074, 39.9042],
  [121.4737, 31.2304],
  [113.2644, 23.1291],
  [114.0579, 22.5431]
];

// 添加散点
window.addPoints = function () {
  const layer = new ScatterplotLayer({
    id: 'scatterplot',
    data: cities,
    getPosition: d => d.position,
    getRadius: 50000,
    getFillColor: d => d.color,
    pickable: true,
    radiusMinPixels: 10
  });

  const currentLayers = deck.props.layers || [];
  deck.setProps({ layers: [...currentLayers.filter(l => l.id !== 'scatterplot'), layer] });
};

// 添加路径
window.addPath = function () {
  const layer = new PathLayer({
    id: 'path',
    data: [{ path }],
    getPath: d => d.path,
    getColor: [80, 180, 230, 255],
    getWidth: 5,
    widthMinPixels: 2,
    pickable: true
  });

  const currentLayers = deck.props.layers || [];
  deck.setProps({ layers: [...currentLayers.filter(l => l.id !== 'path'), layer] });
};

// 清除地图
window.clearMap = function () {
  deck.setProps({ layers: [] });
};

// 自动添加初始图层
setTimeout(() => {
  addPoints();
  addPath();
}, 500);

console.log('Vanilla JS Map initialized');
