# API参考文档 - v3.0

## 📚 完整API清单

---

## 核心渲染器

### MapRenderer
主渲染器类，管理地图视图和图层。

```typescript
import { MapRenderer } from '@ldesign/map-renderer';

const map = new MapRenderer(container, options);
```

**方法：**
- `loadGeoJSON(url, options)` - 加载GeoJSON
- `renderGeoJSON(data, options)` - 渲染GeoJSON
- `setMode(mode)` - 切换2D/3D
- `flyTo(lng, lat, zoom)` - 飞行到位置
- `addLayer(layer)` - 添加图层
- `removeLayer(id)` - 移除图层
- `clearLayers()` - 清空图层
- `destroy()` - 销毁实例

---

## WebWorker聚类 (新)

### ClusterManager
```typescript
import { ClusterManager } from '@ldesign/map-renderer';

const manager = new ClusterManager();
```

**同步API（向后兼容）：**
- `addCluster(options)` - 添加聚类
- `getLayers(zoom)` - 获取图层（同步）
- `getStats(id, zoom)` - 获取统计（同步）

**异步API（推荐）：**
- `getLayersAsync(zoom)` - 异步获取图层
- `getStatsAsync(id, zoom)` - 异步获取统计
- `clearCache()` - 清除缓存
- `destroy()` - 销毁资源

**示例：**
```typescript
// 添加聚类
const id = manager.addCluster({
  data: points,
  radius: 60,
  minPoints: 2,
  useWorker: true  // 自动使用Worker（>1000点）
});

// 异步获取图层
const layers = await manager.getLayersAsync(zoom);

// 获取统计
const stats = await manager.getStatsAsync(id, zoom);
console.log(stats.clusterCount, stats.avgClusterSize);
```

---

## 动画批处理 (新)

### AnimationBatcher
```typescript
import { globalAnimationBatcher, animate } from '@ldesign/map-renderer';
```

**方法：**
- `add(config)` - 添加动画
- `remove(id)` - 移除动画
- `pause(id)` - 暂停动画
- `resume(id)` - 恢复动画
- `pauseAll()` - 暂停所有
- `resumeAll()` - 恢复所有
- `clear()` - 清空所有
- `getStats()` - 获取统计

**便捷函数：**
- `animate(config)` - 快速创建动画
- `stopAnimation(id)` - 停止动画
- `pauseAnimation(id)` - 暂停动画
- `resumeAnimation(id)` - 恢复动画

**示例：**
```typescript
// 添加动画
const id = animate({
  duration: 2000,
  loop: true,
  easing: 'easeInOut',
  onUpdate: (progress) => {
    console.log('Progress:', progress);
  },
  onComplete: () => {
    console.log('Done!');
  }
});

// 控制动画
globalAnimationBatcher.pause(id);
globalAnimationBatcher.resume(id);

// 获取性能
const stats = globalAnimationBatcher.getStats();
console.log(`FPS: ${stats.fps}, Active: ${stats.activeAnimations}`);
```

---

## 空间索引 (新)

### Quadtree / GeoQuadtree
```typescript
import { Quadtree, GeoQuadtree } from '@ldesign/map-renderer';
```

**方法：**
- `insert(point)` - 插入点
- `insertMany(points)` - 批量插入
- `query(range)` - 范围查询
- `queryCircle(x, y, radius)` - 圆形查询
- `queryNearest(x, y, count)` - 最近点查询
- `clear()` - 清空
- `rebuild()` - 重建优化
- `getStats()` - 获取统计

### SpatialIndex
```typescript
import { SpatialIndex, createGeoIndex } from '@ldesign/map-renderer';
```

**方法：**
- `insert(point)` - 插入点
- `insertMany(points)` - 批量插入
- `query(range)` - 范围查询
- `queryCircle(x, y, r)` - 圆形查询
- `queryNearest(x, y, count)` - 最近点
- `clipToViewport(viewport)` - 视口裁剪
- `rebuild()` - 重建索引
- `benchmark(count)` - 性能测试

**示例：**
```typescript
// 创建地理索引
const index = createGeoIndex();

// 插入点
index.insertMany([
  { x: 113.3, y: 23.1, data: { city: 'Guangzhou' } },
  { x: 116.4, y: 39.9, data: { city: 'Beijing' } }
]);

// 范围查询
const points = index.query({ x: 110, y: 20, width: 10, height: 10 });

// 圆形查询
const nearby = index.queryCircle(113.3, 23.1, 5);

// 最近点
const nearest = index.queryNearest(113.3, 23.1, 5);

// 视口裁剪
const visible = index.clipToViewport(viewport);

// 性能基准
const bench = await index.benchmark(10000);
console.log(bench.queriesPerSecond);
```

---

## 编辑器 (新)

### DrawingManager
```typescript
import { createDrawingManager } from '@ldesign/map-renderer';
```

**方法：**
- `enable()` - 启用编辑
- `disable()` - 禁用编辑
- `setMode(mode)` - 设置模式
- `getFeatures()` - 获取所有要素
- `toGeoJSON()` - 导出GeoJSON
- `deleteFeature(id)` - 删除要素
- `clear()` - 清空
- `on(event, handler)` - 事件监听
- `destroy()` - 销毁

**绘制模式：**
- `'none'` - 无
- `'point'` - 点
- `'line'` - 线
- `'polygon'` - 多边形
- `'rectangle'` - 矩形
- `'circle'` - 圆形

**事件：**
- `'drawstart'` - 开始绘制
- `'drawend'` - 完成绘制
- `'drawcancel'` - 取消绘制
- `'vertexadd'` - 添加顶点

**示例：**
```typescript
const drawing = createDrawingManager(container, {
  strokeColor: [66, 165, 245, 255],
  fillColor: [66, 165, 245, 100],
  enableSnap: true
});

drawing.enable();
drawing.setMode('polygon');

drawing.on('drawend', ({ feature }) => {
  console.log('Feature drawn:', feature);
});

const geoJSON = drawing.toGeoJSON();
```

### GeometryEditor
```typescript
import { GeometryEditor } from '@ldesign/map-renderer';
```

**方法：**
- `setMode(mode)` - 设置编辑模式
- `getSelectedFeature()` - 获取选中要素
- `on(event, handler)` - 事件监听
- `destroy()` - 销毁

**编辑模式：**
- `'select'` - 选择
- `'move'` - 移动
- `'vertex'` - 顶点编辑
- `'delete'` - 删除

---

## 插件系统 (新)

### PluginSystem
```typescript
import { createPluginSystem } from '@ldesign/map-renderer';
```

**方法：**
- `register(plugin)` - 注册插件
- `unregister(name)` - 注销插件
- `mount(name)` - 挂载插件
- `unmount(name)` - 卸载插件
- `mountAll()` - 挂载所有
- `getAPI(name)` - 获取插件API
- `destroy()` - 销毁系统

**示例：**
```typescript
import { createPluginSystem, HeatmapPlugin } from '@ldesign/map-renderer';

const plugins = createPluginSystem(mapRenderer);

// 注册插件
await plugins.register(new HeatmapPlugin());

// 挂载插件
await plugins.mountAll();

// 使用插件API
const api = plugins.getAPI('heatmap');
api.addHeatmap({ data: points });
```

### 自定义插件
```typescript
import { BasePlugin } from '@ldesign/map-renderer';

class MyPlugin extends BasePlugin {
  metadata = {
    name: 'my-plugin',
    version: '1.0.0'
  };
  
  async onInit(context) {
    // 初始化逻辑
  }
  
  async onMount(context) {
    // 挂载逻辑
    this.api = {
      doSomething: () => { /* ... */ }
    };
  }
}
```

---

## 资源管理 (新)

### ResourcePool
```typescript
import { ResourcePool, globalLayerPool } from '@ldesign/map-renderer';
```

**方法：**
- `acquire()` - 获取对象
- `release(obj)` - 释放对象
- `getStats()` - 获取统计
- `warmup(count)` - 预热
- `shrink(target)` - 收缩
- `clear()` - 清空

**示例：**
```typescript
const pool = new ResourcePool({
  factory: () => new MyObject(),
  maxSize: 100,
  reset: (obj) => obj.reset()
});

const obj = pool.acquire();
// 使用对象...
pool.release(obj);
```

### LazyLoader
```typescript
import { LazyLoader, globalLazyLoader } from '@ldesign/map-renderer';
```

**方法：**
- `register(id, loader, priority)` - 注册图层
- `load(id)` - 加载图层
- `unload(id)` - 卸载图层
- `loadVisible(viewport)` - 加载可见图层
- `loadByPriority(count)` - 按优先级加载
- `unloadLowPriority()` - 卸载低优先级

**示例：**
```typescript
const loader = new LazyLoader({
  maxConcurrent: 3,
  preloadDistance: 200
});

// 注册图层
loader.register('layer1', async () => {
  const data = await fetch('data.json');
  return createLayer(data);
}, 0.8);

// 加载可见图层
const visible = await loader.loadVisible(viewport);
```

---

## 批量渲染 (新)

### BatchRenderer
```typescript
import { BatchRenderer, globalBatchRenderer } from '@ldesign/map-renderer';
```

**方法：**
- `process(layers)` - 处理图层列表
- `getStats()` - 获取统计
- `clearBatches()` - 清除批次
- `destroy()` - 销毁

**示例：**
```typescript
// 自动合并同类型图层
const optimized = globalBatchRenderer.process(layers);

// 获取统计
const stats = globalBatchRenderer.getStats();
console.log(`Reduction: ${stats.reductionRate * 100}%`);
```

---

## 严格类型系统 (新)

### 类型定义
```typescript
import type {
  Coordinate,
  RGBAColor,
  ColorValue,
  NumericValue
} from '@ldesign/map-renderer';

const coord: Coordinate = [113.3, 23.1];
const color: RGBAColor = [255, 0, 0, 255];
```

### 类型守卫
```typescript
import { 
  isCoordinate, 
  isRGBAColor, 
  assertNotNull 
} from '@ldesign/map-renderer';

if (isCoordinate(value)) {
  // value 类型为 Coordinate
}

assertNotNull(value); // 抛出错误如果为null
```

### 工具函数
```typescript
import { 
  validateColor, 
  normalizeColor, 
  clamp,
  toArray 
} from '@ldesign/map-renderer';

const isValid = validateColor(color);
const rgba = normalizeColor([255, 0, 0]); // [255, 0, 0, 255]
const clamped = clamp(value, 0, 100);
const arr = toArray(value); // 确保数组
```

---

## 测试工具

### 运行测试
```bash
npm test              # 运行测试
npm run test:ui       # 可视化UI
npm run test:coverage # 覆盖率报告
```

### Mock工具
```typescript
import { vi } from 'vitest';

vi.useFakeTimers();
vi.advanceTimersByTime(1000);
```

---

## 配置选项

### ClusterOptions
```typescript
interface ClusterOptions {
  data: ClusterPoint[];
  radius?: number;           // 默认: 60
  minPoints?: number;        // 默认: 2
  maxZoom?: number;          // 默认: 15
  useWorker?: boolean;       // 默认: true（>1000点）
  clusterColor?: number[];
  pointColor?: number[];
  showCount?: boolean;
}
```

### AnimationConfig
```typescript
interface AnimationConfig {
  id: string;
  duration: number;
  loop?: boolean;
  easing?: 'linear' | 'easeIn' | 'easeOut' | 'easeInOut' | 'bounce';
  delay?: number;
  onUpdate?: (progress: number) => void;
  onComplete?: () => void;
}
```

### DrawingOptions
```typescript
interface DrawingOptions {
  mode?: DrawingMode;
  strokeColor?: number[];
  fillColor?: number[];
  strokeWidth?: number;
  enableSnap?: boolean;
  snapDistance?: number;
}
```

### PluginMetadata
```typescript
interface PluginMetadata {
  name: string;
  version: string;
  description?: string;
  author?: string;
  dependencies?: string[];
}
```

---

## 性能监控API

### 获取统计信息
```typescript
// 聚类统计
const clusterStats = await clusterManager.getStatsAsync(id, zoom);

// 动画统计
const animStats = globalAnimationBatcher.getStats();

// 空间索引统计
const indexStats = index.getStats();

// 批量渲染统计
const batchStats = globalBatchRenderer.getStats();

// 资源池统计
const poolStats = pool.getStats();

// 懒加载统计
const loaderStats = loader.getStats();
```

---

## 🎓 高级用法

### 组合使用
```typescript
// 1. 创建地图
const map = new MapRenderer('#map');

// 2. 创建空间索引
const index = createGeoIndex();
index.insertMany(allPoints);

// 3. 视口裁剪
const visible = index.clipToViewport(viewport);

// 4. 聚类可见点
const cluster = new ClusterManager();
cluster.addCluster({ data: visible });
const layers = await cluster.getLayersAsync(zoom);

// 5. 批量渲染优化
const optimized = globalBatchRenderer.process(layers);

// 6. 添加到地图
optimized.forEach(layer => map.addLayer(layer));

// 7. 启用编辑
const drawing = createDrawingManager(container);
drawing.enable();
```

---

## 📊 性能基准

### 运行基准测试
```typescript
// 空间索引基准
const bench = await index.benchmark(10000);
console.log('Queries/sec:', bench.queriesPerSecond);

// 聚类性能测试
console.time('cluster');
const layers = await clusterManager.getLayersAsync(zoom);
console.timeEnd('cluster');
```

---

## 🔍 调试工具

### 日志系统
```typescript
import { Logger, LogLevel } from '@ldesign/map-renderer';

const logger = Logger.getInstance();
logger.setLevel(LogLevel.DEBUG);

// 导出日志
logger.downloadLogs();
```

### 性能监控
```typescript
import { PerformanceMonitor } from '@ldesign/map-renderer';

const monitor = new PerformanceMonitor(container, {
  position: 'top-left',
  showFPS: true,
  showMemory: true
});
```

---

**API版本：** v3.0  
**最后更新：** 2024年  
**状态：** Stable ✅

