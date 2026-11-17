import { useMemo, useRef } from 'react'
import { boxesAtPoint, getStageBoxes } from '../lib/boxes.js'
import { useLazyImage } from './LazyImage.jsx'

// 在原图上按坐标绘制候选框（SVG，坐标系 = 原图像素）
// interactive 时点击选框：同一位置重复点击会在重叠框之间轮换
function BoxCanvas({
  caseData,
  variantKey,
  showRemoved,
  colors,
  selectedBoxId,
  onSelectBox,
  interactive = false,
  strokeScale = 1,
  className = '',
}) {
  const svgRef = useRef(null)
  const boxes = useMemo(
    () => getStageBoxes(caseData, variantKey, showRemoved),
    [caseData, variantKey, showRemoved],
  )
  const { width, height } = caseData
  const base = Math.max(width, height) / 250
  const keptWidth = 1.1 * base * strokeScale
  const removedWidth = 0.7 * base * strokeScale

  const handleClick = (event) => {
    if (!interactive || !onSelectBox) return
    const svg = svgRef.current
    const ctm = svg.getScreenCTM()
    if (!ctm) return
    const pt = new DOMPoint(event.clientX, event.clientY).matrixTransform(ctm.inverse())
    const hits = boxesAtPoint(boxes, pt.x, pt.y)
    if (!hits.length) {
      onSelectBox(null)
      return
    }
    const idx = hits.findIndex((b) => b.id === selectedBoxId)
    onSelectBox(hits[(idx + 1) % hits.length].id)
  }

  // 选中框始终高亮（即使在当前阶段被删除且删除框已隐藏），便于跨阶段追踪
  const selected =
    variantKey && selectedBoxId != null ? caseData.proposalById.get(selectedBoxId) : null
  const imageUrl = useLazyImage(caseData.originalLoader)

  if (!imageUrl) {
    return (
      <div className={`flex h-full w-full items-center justify-center bg-gray-100 ${className}`}>
        <span className="text-xs text-gray-400">加载中...</span>
      </div>
    )
  }

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="xMidYMid meet"
      className={`block h-full w-full ${interactive ? 'cursor-crosshair' : ''} ${className}`}
      onClick={handleClick}
    >
      <image href={imageUrl} x="0" y="0" width={width} height={height} />
      {boxes.map(({ id, bbox: [x1, y1, x2, y2], kept }) => (
        <rect
          key={id}
          x={x1}
          y={y1}
          width={Math.max(0, x2 - x1)}
          height={Math.max(0, y2 - y1)}
          fill="none"
          stroke={kept ? colors.kept : colors.removed}
          strokeWidth={kept ? keptWidth : removedWidth}
          strokeOpacity={kept ? 0.95 : 0.6}
          strokeDasharray={kept ? undefined : `${3 * base} ${2 * base}`}
          pointerEvents="none"
        />
      ))}
      {selected ? (
        <rect
          x={selected.bbox[0]}
          y={selected.bbox[1]}
          width={selected.bbox[2] - selected.bbox[0]}
          height={selected.bbox[3] - selected.bbox[1]}
          fill={colors.selected}
          fillOpacity="0.15"
          stroke={colors.selected}
          strokeWidth={2.2 * base * strokeScale}
          pointerEvents="none"
        />
      ) : null}
    </svg>
  )
}

export default BoxCanvas
