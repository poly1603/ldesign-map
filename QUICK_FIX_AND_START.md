# 🚀 快速修复和启动指南

## 📋 状态概览

项目已完成 Monorepo 架构重构，但需要完成最后的验证和测试步骤。

## ⚡ 快速启动（推荐）

### 步骤 1: 安装依赖

```bash
cd D:\WorkBench\ldesign\libraries\map
pnpm install
```

### 步骤 2: 直接运行示例（不需要构建）

由于示例使用了 Vite 的源码引用，可以直接启动：

```bash
# 原生 JS 示例
cd examples/vanilla
../../node_modules/.bin/vite --port 3001 --host

# 或者使用 PowerShell
cd D:\WorkBench\ldesign\libraries\map\examples\vanilla
..\..\node_modules\.bin\vite --port 3001 --host
```

然后在浏览器打开: `http://localhost:3001`

### 步骤 3: 测试功能

在浏览器中测试以下功能：
- ✅ 添加散点图层
- ✅ 添加路径图层
- ✅ 添加多边形图层
- ✅ 添加六边形图层
- ✅ 飞行到不同位置
- ✅ 视图控制（旋转、重置）
- ✅ 动画效果
- ✅ 性能测试（1000点、10000点）

## 🔧 如果遇到问题

### 问题 1: 端口被占用

**错误信息**: `Port 3001 is in use`

**解决方案**:
```bash
# 使用其他端口
../../node_modules/.bin/vite --port 3005 --host
```

### 问题 2: 找不到模块

**错误信息**: `Cannot find module '@ldesign-map/core'`

**解决方案**:
```bash
# 确保在正确的目录
cd D:\WorkBench\ldesign\libraries\map\examples\vanilla

# 检查 vite.config.js 中的 alias 配置
# 应该指向源码目录
```

### 问题 3: TypeScript 错误

**错误信息**: `parsing tsconfig.json failed`

**解决方案**:
```bash
# 确保所有包都有 tsconfig.json
# 已创建的文件：
# - packages/core/tsconfig.json
# - packages/vanilla/tsconfig.json
# - packages/vue/tsconfig.json
# - packages/react/tsconfig.json  
# - packages/lit/tsconfig.json
```

## 📦 构建包（可选）

如果需要构建包用于生产：

```bash
cd D:\WorkBench\ldesign\libraries\map

# 构建核心包
cd packages/core
node D:\WorkBench\ldesign\tools\builder\bin\ldesign-builder.js

# 构建 vanilla 包
cd ../vanilla  
node D:\WorkBench\ldesign\tools\builder\bin\ldesign-builder.js

# 或者使用根目录脚本
cd ../..
pnpm build
```

## 🎮 示例项目说明

### Vanilla 示例 (examples/vanilla)

**特点**:
- 直接使用 deck.gl API
- 展示所有核心功能
- 精美的交互式界面
- 实时 FPS 监控

**功能**:
1. **图层管理**
   - 散点图层（10个城市）
   - 路径图层（城市连线）
   - 多边形图层（区域范围）
   - 六边形聚合图层（3D 可视化）

2. **视图控制**
   - 飞行到北京/上海
   - 重置视图
   - 旋转视图

3. **动画效果**
   - 持续旋转动画
   - 脉冲缩放动画
   - 平滑过渡

4. **性能测试**
   - 添加1000个随机点
   - 添加10000个随机点
   - 实时FPS显示

### Vue 示例 (examples/vue)

**特点**:
- Vue 3 Composition API
- 响应式数据绑定
- 完整的组件封装

**使用**:
```bash
cd examples/vue
pnpm dev  # 端口 3001
```

### React 示例 (examples/react)

**特点**:
- React 18+ Hooks
- TypeScript 支持
- 函数组件

**使用**:
```bash
cd examples/react
pnpm dev  # 端口 3002
```

### Lit 示例 (examples/lit)

**特点**:
- 标准 Web Components
- 轻量级
- 框架无关

**使用**:
```bash
cd examples/lit
pnpm dev  # 端口 3003
```

## 🔍 验证检查清单

### 基础验证
- [ ] pnpm install 成功
- [ ] 所有依赖安装完成
- [ ] 没有错误信息

### 构建验证
- [ ] 核心包构建成功
- [ ] Vanilla 包构建成功
- [ ] Vue 包构建成功
- [ ] React 包构建成功
- [ ] Lit 包构建成功

### 运行验证
- [ ] Vanilla 示例启动成功
- [ ] 浏览器可以访问
- [ ] 地图正常渲染
- [ ] 所有功能按钮可点击
- [ ] 图层可以添加/删除
- [ ] 动画正常播放
- [ ] 性能测试正常

### 功能验证
- [ ] 添加散点图层 - 显示城市标记
- [ ] 添加路径图层 - 显示城市连线
- [ ] 添加多边形图层 - 显示区域范围
- [ ] 添加六边形图层 - 3D聚合显示
- [ ] 飞行动画 - 平滑过渡到目标位置
- [ ] 视图旋转 - 地图旋转90度
- [ ] 添加1000点 - 性能测试
- [ ] 添加10000点 - 压力测试
- [ ] FPS显示 - 实时性能监控

## 💻 开发环境要求

- Node.js >= 18
- pnpm >= 8
- 现代浏览器（Chrome/Edge/Firefox 最新版）

## 📝 常用命令速查

```bash
# 在根目录
pnpm install        # 安装依赖
pnpm build          # 构建所有包
pnpm dev            # 开发模式
pnpm test           # 运行测试
pnpm clean          # 清理构建产物

# 在示例目录
pnpm dev            # 启动开发服务器
pnpm build          # 构建生产版本
pnpm preview        # 预览生产构建

# 使用 filter 运行特定包
pnpm --filter @ldesign-map-example/vanilla dev
pnpm --filter @ldesign-map/core build
```

## 🎯 成功标志

当你看到以下情况时，说明一切正常：

1. ✅ 浏览器显示地图界面
2. ✅ 控制面板在左侧显示
3. ✅ 地图区域在右侧显示  
4. ✅ 地图上有浅色背景
5. ✅ 点击"添加散点图层"后可以看到城市点
6. ✅ FPS 显示为 60 左右
7. ✅ 鼠标移动时坐标实时更新
8. ✅ 图层列表显示已添加的图层

## 🐛 故障排除

### 服务无法启动

```bash
# 检查端口占用
netstat -ano | findstr :3001

# 杀死占用进程
taskkill /PID <进程ID> /F

# 或使用其他端口
../../node_modules/.bin/vite --port 3005
```

### 依赖问题

```bash
# 清理并重装
cd D:\WorkBench\ldesign\libraries\map
rm -rf node_modules
rm pnpm-lock.yaml
pnpm install
```

### 构建失败

```bash
# 清理构建产物
pnpm clean

# 逐个包构建并查看错误
cd packages/core
node D:\WorkBench\ldesign\tools\builder\bin\ldesign-builder.js
```

## 📞 获取帮助

1. 查看 `MAP_WORKSPACE_SETUP_STATUS.md` 了解整体状态
2. 查看 `GETTING_STARTED.md` 了解使用方法
3. 查看各示例的代码了解实现细节
4. 提交 Issue 到项目仓库

---

**最后更新**: 2025年10月27日  
**版本**: 3.0.0
