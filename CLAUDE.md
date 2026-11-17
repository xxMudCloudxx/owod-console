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
│   │   ├── PipelineViewer.jsx # 样例选择 + 5阶段流程卡片
│   │   ├── StageZoomModal.jsx # 阶段放大查看 + 点击选框
│   │   ├── BoxCanvas.jsx     # 按坐标绘制候选框（SVG）
│   │   ├── ControlPanel.jsx  # 开关/删除框显示/颜色/导出/重置
│   │   ├── DataPanel.jsx     # 右侧统计、选中框信息、结论
│   │   └── DetectorComparison.jsx # 检测对比页（独立实验结果）
│   ├── data/assets.js        # 读取素材包 manifest.json 及其引用文件
│   ├── lib/boxes.js          # 阶段定义、开关→记录映射、框命中
│   ├── lib/export.js         # 导出 PNG / JSON / CSV
│   └── store/
│       └── useConsoleStore.js # Zustand 状态
OWOD_console_assets_20261117/  # 素材包，manifest.json 为数据入口
```

## 数据约定

- 所有框坐标与保留/删除决策取自 `cleaning/*/data.json` 的 `proposals` 与 `variants.*.kept_proposal_ids`，前端不推断、不拼接。
- 开关映射：都关→`raw`，仅背景头→`background_only`，仅碎片头→`fragment_only`，都开→`dual_head`。
- 素材无连续分数，也没有多档阈值结果，不要显示分数或做“激进/保守”策略。
- 检测对比页只读 `detector_comparison/` 和 `metrics/`，不与清洗开关联动。

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
- `activeNav` - 当前菜单项（图像清理 / 检测对比）
- `caseId` - 当前清洗样例
- `activeStage` / `zoomStage` - 当前阶段 / 放大中的阶段
- `toggles` - 功能开关 (backgroundHead, fragmentHead)
- `showRemoved` - 是否显示删除框
- `colors` - 框颜色 (kept, removed, selected)
- `selectedBoxId` - 选中框的 proposal_id
- 统计不存入 store，由 `computeStats(caseData, variant)` 实时计算

## 开发命令

```bash
cd owod-console
npm install
npm run dev      # 启动开发服务器
npm run build    # 构建生产版本
```

## 待开发功能

- [x] 素材包样例选择、各阶段结果展示、框点击交互、导出
- [ ] 数据持久化
- 暂不做：注册登录、个人中心业务、在线训练、任意图片实时检测、云部署
