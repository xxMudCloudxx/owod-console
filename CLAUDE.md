# OWOD检测辅助分析原型

## 项目概述

这是一个基于 React + Vite + Tailwind CSS 的算法可视化控制台页面，用于展示 OWOD (Open World Object Detection) 图像清理流程。

## 技术栈

- React 18 + Vite
- Tailwind CSS v4
- Zustand (状态管理)
- Lucide React (图标)

## 项目结构

```
owod-console/
├── src/
│   ├── main.jsx              # 入口
│   ├── index.css             # 全局样式 + Tailwind
│   ├── App.jsx               # 根组件，整体布局
│   ├── components/
│   │   ├── Header.jsx        # 顶部导航栏
│   │   ├── Sidebar.jsx       # 左侧菜单
│   │   ├── PipelineViewer.jsx # 处理流程可视化（主区域）
│   │   ├── ControlPanel.jsx  # 参数配置面板
│   │   └── DataPanel.jsx     # 右侧数据面板
│   └── store/
│       └── useConsoleStore.js # Zustand 状态
```

## 布局结构

```
┌─────────────────────────────────────────────────────┐
│  Header (系统名称 + 时间 + 用户信息)                  │
├──────────┬──────────────────────────┬───────────────┤
│          │                          │               │
│ Sidebar  │   PipelineViewer         │  DataPanel    │
│ (菜单)   │   (5阶段流程卡片)         │  (指标/摘要)  │
│          │                          │               │
│          ├──────────────────────────┤               │
│          │   ControlPanel           │               │
│          │   (开关/策略/颜色/重置)   │               │
└──────────┴──────────────────────────┴───────────────┘
```

## 设计风格

简约中性风格：
- 背景: `#f9fafb` (gray-50)
- 卡片: `#ffffff` 白色，`1px solid #e5e7eb` 边框
- 文字: gray-900 (标题), gray-600 (正文), gray-400 (辅助)
- 选中态: gray-900 深灰
- 圆角: `rounded-lg` (8px)

## 状态管理 (Zustand)

`useConsoleStore` 包含：
- `activeNav` - 当前菜单项
- `activeStage` - 当前选中的流程阶段
- `toggles` - 功能开关 (backgroundHead, fragmentHead)
- `strategies` - 策略选择 (激进/保守)
- `colors` - 框体颜色配置
- `metrics` - 保留率/删除率
- `selectedBox` - 选中框信息
- `runStatus` - 运行状态

## 开发命令

```bash
cd owod-console
npm install
npm run dev      # 启动开发服务器
npm run build    # 构建生产版本
```

## 待开发功能

- [ ] 图片上传功能 (原始图卡片)
- [ ] 实际的图像处理逻辑
- [ ] 各阶段结果图展示
- [ ] 框体点击交互
- [ ] 数据持久化
