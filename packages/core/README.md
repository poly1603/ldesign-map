# @ldesign-map/core

高性能的地图渲染核心库，基于 deck.gl 构建。

## 特性

- 🚀 高性能渲染引擎
- 📊 空间索引优化
- 🎬 动画批处理系统
- 🔌 插件化架构
- 🎯 完整的 TypeScript 类型
- ⚡ WebWorker 支持
- 📦 零运行时依赖（除 deck.gl）

## 安装

```bash
npm install @ldesign-map/core @deck.gl/core @deck.gl/layers @deck.gl/geo-layers
```

## 基本使用

```typescript
import { MapRenderer, LayerManager } from '@ldesign-map/core';

// 创建地图渲染器
const renderer = new MapRenderer(container, {
  initialViewState: {
    longitude: 116.4074,
    latitude: 39.9042,
    zoom: 5
  }
});

// 创建图层管理器
const layerManager = new LayerManager(renderer);

// 添加图层
layerManager.addLayer({
  id: 'points',
  type: 'scatterplot',
  data: points,
  getPosition: d => d.position,
  getRadius: d => d.radius,
  getFillColor: [255, 140, 0]
});
```

## 核心模块

### MapRenderer
地图渲染器，处理地图的基础渲染逻辑。

### LayerManager
图层管理器，管理图层的添加、删除、更新。

### AnimationController
动画控制器，提供流畅的动画效果。

### EventManager
事件管理器，处理地图事件。

### 空间索引
- Quadtree - 四叉树索引
- SpatialIndex - 空间索引抽象

## License

MIT

