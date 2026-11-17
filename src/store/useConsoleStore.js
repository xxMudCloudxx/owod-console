import { create } from 'zustand'
import { cleaningCases } from '../data/assets.js'

export const defaultColors = {
  kept: '#22c55e',
  removed: '#ef4444',
  selected: '#2563eb',
}

// 当前样例的默认视图设置（重置按钮恢复到这里，样例本身不变）
const createCaseDefaults = () => ({
  toggles: {
    backgroundHead: true,
    fragmentHead: true,
  },
  activeStage: 'final',
  showRemoved: true,
  colors: { ...defaultColors },
  selectedBoxId: null,
  zoomStage: null,
})

export const useConsoleStore = create((set) => ({
  activeNav: '图像清理',
  caseId: cleaningCases[0]?.id ?? null,
  ...createCaseDefaults(),

  setActiveNav: (activeNav) => set({ activeNav }),
  setCase: (caseId) => set({ caseId, selectedBoxId: null, zoomStage: null }),
  setActiveStage: (activeStage) => set({ activeStage }),
  openZoom: (stage) => set({ zoomStage: stage, activeStage: stage }),
  closeZoom: () => set({ zoomStage: null }),
  toggleHead: (key) =>
    set((state) => ({
      toggles: { ...state.toggles, [key]: !state.toggles[key] },
    })),
  setShowRemoved: (showRemoved) => set({ showRemoved }),
  setColor: (key, hex) =>
    set((state) => ({ colors: { ...state.colors, [key]: hex } })),
  selectBox: (selectedBoxId) => set({ selectedBoxId }),
  resetConsole: () => set(createCaseDefaults()),
}))
