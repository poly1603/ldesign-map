# 🚀 快速开始指南

本指南将帮助您快速上手使用 LDesign Map 在不同框架中。

## 📋 前置要求

- Node.js >= 18
- pnpm >= 8

## 🔧 安装

### 使用 pnpm (推荐)

```bash
# 安装 pnpm
npm install -g pnpm

# 安装依赖
cd libraries/map
pnpm install
```

## 🏗️ 构建项目

```bash
# 构建所有包
pnpm build

# 仅构建核心包
pnpm --filter @ldesign-map/core build

# 构建特定框架适配器
pnpm --filter @ldesign-map/vue build
pnpm --filter @ldesign-map/react build
```

## 🎮 运行示例

### 原生 JavaScript 示例

```bash
pnpm example:vanilla
# 访问 http://localhost:3000
```

### Vue 3 示例

```bash
pnpm example:vue
# 访问 http://localhost:3001
```

### React 示例

```bash
pnpm example:react
# 访问 http://localhost:3002
```

### Lit 示例

```bash
pnpm example:lit
# 访问 http://localhost:3003
```

## 📦 在项目中使用

### 1. 原生 JavaScript

```bash
npm install @ldesign-map/vanilla @deck.gl/core @deck.gl/layers @deck.gl/geo-layers
```

```javascript
import { LDesignMap } from '@ldesign-map/vanilla';

// 创建地图实例
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
  data: [
    { position: [116.4074, 39.9042], value: 100 }
  ],
  getPosition: d => d.position,
  getRadius: d => d.value,
  getFillColor: [255, 140, 0]
});

// 监听事件
map.on('map:click', (info) => {
  console.log('Clicked:', info);
});
```

### 2. Vue 3

```bash
npm install @ldesign-map/vue @deck.gl/core @deck.gl/layers @deck.gl/geo-layers
```

```vue
<template>
  <LDesignMap
    ref="mapRef"
    width="100%"
    height="600px"
    :options="mapOptions"
    :layers="layers"
    @ready="onMapReady"
    @click="onMapClick"
  />
</template>

<script setup>
import { ref } from 'vue';
import { LDesignMap } from '@ldesign-map/vue';

const mapRef = ref(null);

const mapOptions = {
  initialViewState: {
    longitude: 116.4074,
    latitude: 39.9042,
    zoom: 5
  }
};

const layers = ref([
  {
    id: 'points',
    type: 'scatterplot',
    data: [
      { position: [116.4074, 39.9042], value: 100 }
    ],
    getPosition: d => d.position,
    getRadius: d => d.value,
    getFillColor: [255, 140, 0]
  }
]);

const onMapReady = (map) => {
  console.log('Map ready:', map);
};

const onMapClick = (info) => {
  console.log('Clicked:', info);
};
</script>
```

### 3. React

```bash
npm install @ldesign-map/react @deck.gl/core @deck.gl/layers @deck.gl/geo-layers
```

```jsx
import React, { useRef, useState } from 'react';
import { LDesignMap } from '@ldesign-map/react';

function App() {
  const mapRef = useRef(null);
  const [layers] = useState([
    {
      id: 'points',
      type: 'scatterplot',
      data: [
        { position: [116.4074, 39.9042], value: 100 }
      ],
      getPosition: d => d.position,
      getRadius: d => d.value,
      getFillColor: [255, 140, 0]
    }
  ]);

  const handleMapReady = (map) => {
    console.log('Map ready:', map);
  };

  const handleMapClick = (info) => {
    console.log('Clicked:', info);
  };

  return (
    <LDesignMap
      ref={mapRef}
      width="100%"
      height="600px"
      options={{
        initialViewState: {
          longitude: 116.4074,
          latitude: 39.9042,
          zoom: 5
        }
      }}
      layers={layers}
      onReady={handleMapReady}
      onClick={handleMapClick}
    />
  );
}

export default App;
```

### 4. Lit / Web Components

```bash
npm install @ldesign-map/lit @deck.gl/core @deck.gl/layers @deck.gl/geo-layers
```

```html
<!DOCTYPE html>
<html>
<head>
  <script type="module">
    import '@ldesign-map/lit';
    
    const map = document.querySelector('ldesign-map');
    
    map.addEventListener('ready', (e) => {
      console.log('Map ready:', e.detail.map);
      
      // 添加图层
      map.addLayer({
        id: 'points',
        type: 'scatterplot',
        data: [
          { position: [116.4074, 39.9042], value: 100 }
        ],
        getPosition: d => d.position,
        getRadius: d => d.value,
        getFillColor: [255, 140, 0]
      });
    });
    
    map.addEventListener('map-click', (e) => {
      console.log('Clicked:', e.detail);
    });
  </script>
</head>
<body>
  <ldesign-map 
    width="800" 
    height="600"
    interactive="true">
  </ldesign-map>
</body>
</html>
```

## 🔌 使用插件

### 热力图插件

```javascript
import { LDesignMap } from '@ldesign-map/vanilla';
// 如果需要单独使用插件
// import { install } from '@ldesign-map/plugin-heatmap';

const map = new LDesignMap('#map', options);

// 启用热力图
const heatmap = map.enableHeatmap('layer-id', {
  radius: 30,
  intensity: 1,
  colorRange: [
    [255, 255, 178],
    [254, 204, 92],
    [253, 141, 60],
    [240, 59, 32],
    [189, 0, 38]
  ]
});
```

### 聚类插件

```javascript
// 启用聚类
const cluster = map.enableClustering('layer-id', {
  radius: 40,
  maxZoom: 15,
  minPoints: 2
});
```

### 测量工具

```javascript
// 启用测量工具
const measurement = map.enableMeasurement();
measurement.enable();

// 监听测量结果
measurement.on('measure-complete', (result) => {
  console.log('Distance:', result.distance);
  console.log('Area:', result.area);
});
```

### 编辑器

```javascript
// 启用编辑器
const editor = map.enableEditor();
editor.enable();

// 开始绘制
editor.startDrawing('polygon');

// 监听编辑事件
editor.on('feature-created', (feature) => {
  console.log('Created:', feature);
});
```

## 🧪 开发和测试

```bash
# 运行测试
pnpm test

# 运行特定包的测试
pnpm --filter @ldesign-map/core test

# 运行测试并生成覆盖率报告
pnpm test:coverage

# 类型检查
pnpm typecheck
```

## 📚 更多资源

- [完整 API 文档](./docs/API_REFERENCE.md)
- [架构设计](./docs/ARCHITECTURE.md)
- [贡献指南](./CONTRIBUTING.md)
- [更新日志](./CHANGELOG.md)

## ❓ 常见问题

### 1. 如何自定义地图样式？

参考 [自定义样式指南](./docs/STYLING.md)

### 2. 性能优化建议

参考 [性能优化指南](./docs/PERFORMANCE.md)

### 3. 如何处理大数据量？

使用空间索引、聚类、虚拟化等技术，详见 [大数据处理指南](./docs/BIG_DATA.md)

## 💬 获取帮助

- 提交 Issue: [GitHub Issues](https://github.com/your-username/ldesign-map/issues)
- 讨论: [GitHub Discussions](https://github.com/your-username/ldesign-map/discussions)
- Email: your-email@example.com

