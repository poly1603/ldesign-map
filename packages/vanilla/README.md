# @ldesign-map/vanilla

原生 JavaScript 适配器，提供简单易用的 API。

## 安装

```bash
npm install @ldesign-map/vanilla @deck.gl/core @deck.gl/layers @deck.gl/geo-layers
```

## 使用

```javascript
import { LDesignMap } from '@ldesign-map/vanilla';

// 创建地图
const map = new LDesignMap('#map', {
  initialViewState: {
    longitude: 116.4074,
    latitude: 39.9042,
    zoom: 5
  }
});

// 添加图层
map.addLayer({
  id: 'points',
  type: 'scatterplot',
  data: points,
  getPosition: d => d.position,
  getRadius: 100,
  getFillColor: [255, 140, 0]
});

// 监听事件
map.on('map:click', (info) => {
  console.log('Clicked:', info);
});

// 飞行到位置
map.flyTo({
  longitude: 121.4737,
  latitude: 31.2304,
  zoom: 10,
  duration: 2000
});
```

## API

### 构造函数

```javascript
new LDesignMap(container, options)
```

### 方法

- `addLayer(options)` - 添加图层
- `removeLayer(layerId)` - 删除图层
- `updateLayer(layerId, updates)` - 更新图层
- `flyTo(options)` - 飞行到指定位置
- `on(event, handler)` - 监听事件
- `destroy()` - 销毁地图

## License

MIT

