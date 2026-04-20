# OWOD检测辅助分析原型

一个基于 React、Vite、Tailwind CSS 4 和 zustand 搭建的演示型 Web 控制台，用来展示 OWOD 图像清理流程的可视化界面。

## 技术栈

- React
- Vite
- Tailwind CSS 4
- zustand
- lucide-react

## 功能概览

- 顶部导航栏，展示系统名称、当前时间和用户信息
- 左侧侧边栏，包含个人中心、图像清理、最近样例
- 中间 Pipeline 工作区，展示 5 段图像处理流程
- 参数控制区，支持开关、策略切换、颜色配置和重置
- 右侧数据面板，展示指标、选中框信息、运行摘要和结论

## 本地启动

```bash
npm install
npm run dev
```

默认开发地址：

```bash
http://localhost:5173
```

## 生产构建

```bash
npm run build
```

## 项目结构

```text
src/
├─ components/
│  ├─ Header.jsx
│  ├─ Sidebar.jsx
│  ├─ PipelineViewer.jsx
│  ├─ ControlPanel.jsx
│  └─ DataPanel.jsx
├─ store/
│  └─ useConsoleStore.js
├─ App.jsx
├─ main.jsx
└─ index.css
```

## 说明

这是一个初版演示项目，当前重点是界面原型和交互表现，不包含完整业务逻辑、接口联调和测试体系。
