import { create } from 'zustand'

const colorTokens = [
  { key: 'origin', label: '原始框', hex: '#ef4444', accent: 'rgba(239, 68, 68, 0.18)' },
  { key: 'kept', label: '保留框', hex: '#22c55e', accent: 'rgba(34, 197, 94, 0.18)' },
]

const stageInsights = {
  原始图: {
    type: '背景',
    score: 0.92,
    status: '待分析',
  },
  SAM池子图: {
    type: '候选区域',
    score: 0.88,
    status: '待筛选',
  },
  背景头: {
    type: '背景',
    score: 0.85,
    status: '已删除',
  },
  碎片头: {
    type: '碎片',
    score: 0.81,
    status: '已保留',
  },
  最终效果: {
    type: '未知目标',
    score: 0.87,
    status: '已保留',
  },
}

const createInitialState = () => ({
  activeNav: '图像清理',
  activeStage: '最终效果',
  toggles: {
    backgroundHead: true,
    fragmentHead: true,
  },
  strategies: {
    backgroundHead: '保守',
    fragmentHead: '激进',
  },
  colors: colorTokens,
  selectedColorKey: 'kept',
  metrics: {
    retention: 42.8,
    deletion: 57.2,
  },
  selectedBox: stageInsights['最终效果'],
  runStatus: '完成',
})

export const useConsoleStore = create((set) => ({
  ...createInitialState(),
  setActiveNav: (activeNav) => set({ activeNav }),
  setActiveStage: (activeStage) =>
    set({
      activeStage,
      selectedBox: stageInsights[activeStage] ?? stageInsights['最终效果'],
    }),
  toggleHead: (key) =>
    set((state) => ({
      toggles: {
        ...state.toggles,
        [key]: !state.toggles[key],
      },
    })),
  setStrategy: (key, value) =>
    set((state) => ({
      strategies: {
        ...state.strategies,
        [key]: value,
      },
    })),
  selectColor: (selectedColorKey) => set({ selectedColorKey }),
  resetConsole: () => set(createInitialState()),
}))
