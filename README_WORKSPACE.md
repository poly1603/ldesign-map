# 🗺️ LDesign Map - Monorepo 工作空间

高性能的基于 deck.gl 的地图渲染器，采用 Monorepo 架构，支持多框架使用。

## 📦 包结构

```
libraries/map/
├── packages/                    # 核心包和适配器
│   ├── core/                   # 核心功能包
│   ├── vanilla/                # 原生 JavaScript 适配器
│   ├── vue/                    # Vue 3 组件库
│   ├── react/                  # React 组件库
│   ├── lit/                    # Lit Web Components
│   ├── plugin-heatmap/         # 热力图插件
│   ├── plugin-cluster/         # 聚类插件
│   ├── plugin-editor/          # 编辑器插件
│   └── plugin-measurement/     # 测量工具插件
│
├── examples/                    # 示例项目
│   ├── vanilla/                # 原生 JS 示例
│   ├── vue/                    # Vue 3 示例
│   ├── react/                  # React 示例
│   └── lit/                    # Lit 示例
│
├── docs/                       # 文档
├── package.json               # 根包配置
├── pnpm-workspace.yaml        # 工作空间配置
└── tsconfig.json              # TypeScript 配置
```

## 🚀 快速开始

### 安装依赖

```bash
# 使用 pnpm
pnpm install
```

### 构建所有包

```bash
pnpm build
```

### 开发模式

```bash
# 运行所有包的开发模式
pnpm dev

# 运行特定示例
pnpm example:vanilla
pnpm example:vue
pnpm example:react
pnpm example:lit
```

## 📚 包说明

### 核心包

#### @ldesign-map/core
核心功能包，包含所有地图渲染的核心逻辑：
- MapRenderer - 地图渲染器
- LayerManager - 图层管理
- AnimationController - 动画控制
- EventManager - 事件管理
- 空间索引、性能优化等核心功能

### 框架适配器

#### @ldesign-map/vanilla
原生 JavaScript 适配器，提供简单易用的 API：
```javascript
import { LDesignMap } from '@ldesign-map/vanilla';

const map = new LDesignMap('#map', {
  initialViewState: {
    longitude: 116.4074,
    latitude: 39.9042,
    zoom: 5
  }
});
```

#### @ldesign-map/vue
Vue 3 组件库，提供声明式的 Vue 组件：
```vue
<template>
  <LDesignMap 
    :options="mapOptions"
    :layers="layers"
    @ready="onMapReady"
  />
</template>

<script setup>
import { LDesignMap } from '@ldesign-map/vue';
</script>
```

#### @ldesign-map/react
React 组件库，提供 React Hooks 和组件：
```jsx
import { LDesignMap, useMap } from '@ldesign-map/react';

function App() {
  return (
    <LDesignMap 
      options={mapOptions}
      layers={layers}
      onReady={handleMapReady}
    />
  );
}
```

#### @ldesign-map/lit
Lit Web Components，提供标准的 Web Components：
```html
<ldesign-map 
  width="800" 
  height="600"
  interactive="true">
</ldesign-map>

<script type="module">
  import '@ldesign-map/lit';
</script>
```

### 插件包

#### @ldesign-map/plugin-heatmap
热力图插件，提供热力图渲染功能：
- 支持自定义颜色范围
- 支持动态权重计算
- WebWorker 加速

#### @ldesign-map/plugin-cluster
聚类插件，提供点聚类功能：
- 基于 Supercluster 算法
- 支持自定义聚类规则
- 支持多级聚类

#### @ldesign-map/plugin-editor
编辑器插件，提供地理要素编辑功能：
- 绘制点、线、面
- 编辑已有要素
- 支持撤销/重做

#### @ldesign-map/plugin-measurement
测量工具插件，提供测量功能：
- 距离测量
- 面积测量
- 角度测量

## 🔧 开发指南

### 添加新包

1. 在 `packages/` 目录下创建新包
2. 添加 `package.json` 配置
3. 实现功能代码
4. 添加测试
5. 更新文档

### 包之间的依赖

- 所有适配器依赖 `@ldesign-map/core`
- 插件包依赖 `@ldesign-map/core`
- 示例项目依赖对应的适配器包

### 版本管理

使用 Changesets 进行版本管理：

```bash
# 创建变更记录
pnpm changeset

# 更新版本
pnpm version

# 发布
pnpm release
```

## 📄 许可证

MIT License

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📞 联系方式

- GitHub: [https://github.com/your-username/ldesign-map](https://github.com/your-username/ldesign-map)
- Email: your-email@example.com


