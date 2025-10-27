# ⚡ 快速参考指南

## 📦 包列表

| 包名 | 描述 | 版本 |
|------|------|------|
| `@ldesign-map/core` | 核心功能库 | 3.0.0 |
| `@ldesign-map/vanilla` | 原生 JS 适配器 | 3.0.0 |
| `@ldesign-map/vue` | Vue 3 组件 | 3.0.0 |
| `@ldesign-map/react` | React 组件 | 3.0.0 |
| `@ldesign-map/lit` | Lit Web Components | 3.0.0 |
| `@ldesign-map/plugin-heatmap` | 热力图插件 | 3.0.0 |
| `@ldesign-map/plugin-cluster` | 聚类插件 | 3.0.0 |
| `@ldesign-map/plugin-editor` | 编辑器插件 | 3.0.0 |
| `@ldesign-map/plugin-measurement` | 测量工具插件 | 3.0.0 |

## 🚀 常用命令

```bash
# 安装依赖
pnpm install

# 构建所有包
pnpm build

# 开发模式（watch）
pnpm dev

# 运行示例
pnpm example:vanilla   # http://localhost:3000
pnpm example:vue       # http://localhost:3001
pnpm example:react     # http://localhost:3002
pnpm example:lit       # http://localhost:3003

# 测试
pnpm test              # 运行所有测试
pnpm test:coverage     # 生成覆盖率报告

# 类型检查
pnpm typecheck

# 清理构建产物
pnpm clean

# 版本管理
pnpm changeset         # 创建变更记录
pnpm version          # 更新版本号
pnpm release          # 发布到 npm
```

## 📝 使用示例

### 原生 JavaScript

```javascript
import { LDesignMap } from '@ldesign-map/vanilla';

const map = new LDesignMap('#map', {
  initialViewState: { longitude: 116.4074, latitude: 39.9042, zoom: 5 }
});

map.addLayer({
  id: 'points',
  type: 'scatterplot',
  data: points,
  getPosition: d => d.position
});
```

### Vue 3

```vue
<template>
  <LDesignMap :options="options" :layers="layers" @ready="onReady" />
</template>

<script setup>
import { LDesignMap } from '@ldesign-map/vue';
</script>
```

### React

```jsx
import { LDesignMap } from '@ldesign-map/react';

<LDesignMap options={options} layers={layers} onReady={handleReady} />
```

### Lit / Web Components

```html
<ldesign-map width="800" height="600" interactive="true"></ldesign-map>

<script type="module">
  import '@ldesign-map/lit';
</script>
```

## 🔧 开发工作流

### 添加新功能到核心包

1. 编辑 `packages/core/src/`
2. 运行 `pnpm --filter @ldesign-map/core dev`
3. 测试功能
4. 运行 `pnpm --filter @ldesign-map/core build`

### 更新适配器

1. 编辑对应适配器目录
2. 确保依赖 `@ldesign-map/core` 最新版本
3. 构建并测试

### 添加新插件

1. 在 `packages/` 创建 `plugin-xxx/` 目录
2. 添加 `package.json` 和 `src/index.ts`
3. 实现插件逻辑
4. 更新根 `tsconfig.json` 添加引用

## 📂 目录结构速查

```
libraries/map/
├── packages/
│   ├── core/                 # 核心包
│   ├── vanilla/              # 原生 JS
│   ├── vue/                  # Vue 3
│   ├── react/                # React
│   ├── lit/                  # Lit
│   ├── plugin-heatmap/       # 热力图
│   ├── plugin-cluster/       # 聚类
│   ├── plugin-editor/        # 编辑器
│   └── plugin-measurement/   # 测量工具
│
├── examples/
│   ├── vanilla/              # 原生 JS 示例
│   ├── vue/                  # Vue 示例
│   ├── react/                # React 示例
│   └── lit/                  # Lit 示例
│
├── docs/                     # 文档
├── package.json             # 根配置
├── pnpm-workspace.yaml      # 工作空间
└── turbo.json               # Turbo 配置
```

## 🐛 故障排除

### 依赖问题

```bash
# 清理并重新安装
rm -rf node_modules
pnpm install
```

### 构建失败

```bash
# 清理构建产物
pnpm clean
# 重新构建
pnpm build
```

### 类型错误

```bash
# 运行类型检查
pnpm typecheck
# 检查特定包
pnpm --filter @ldesign-map/core typecheck
```

## 📚 文档链接

- [完整 README](./README_WORKSPACE.md)
- [快速开始](./GETTING_STARTED.md)
- [项目重构报告](./PROJECT_RESTRUCTURE_COMPLETE.md)

## 💡 提示

- 使用 `pnpm --filter` 针对特定包运行命令
- 所有包共享相同的依赖版本
- 使用 Turbo 进行增量构建
- Changesets 管理版本和发布

## 🎯 下一步

1. 阅读 [GETTING_STARTED.md](./GETTING_STARTED.md)
2. 运行示例项目
3. 查看 API 文档
4. 开始开发！

