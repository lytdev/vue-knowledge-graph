<template>
  <div class="graph-shell">
    <div
      ref="containerRef"
      class="graph-container"
    ></div>
    <div
      v-if="props.showTypeFilter && typeLegendItems.length > 0"
      ref="typeFilterRef"
      class="kg-type-filter"
      :class="{
        'kg-type-filter--collapsed': typeFilterCollapsed,
        'kg-type-filter--docked-right': typeFilterDockedRight && !typeFilterPosition,
        'kg-type-filter--dragging': isTypeFilterDragging,
      }"
      :style="typeFilterStyle"
      role="group"
      aria-label="节点类型筛选"
      @pointerdown.stop="startTypeFilterDrag"
      @pointermove="moveTypeFilterDrag"
      @pointerup="endTypeFilterDrag"
      @pointercancel="endTypeFilterDrag"
    >
      <span
        class="kg-type-filter-handle"
        title="拖动类型筛选"
        aria-hidden="true"
      >
        ⠿
      </span>
      <button
        type="button"
        class="kg-type-filter-toggle"
        :title="typeFilterCollapsed ? '展开类型筛选' : '折叠类型筛选'"
        :aria-label="typeFilterCollapsed ? '展开类型筛选' : '折叠类型筛选'"
        :aria-expanded="!typeFilterCollapsed"
        @click="toggleTypeFilterCollapsed"
      >
        {{ typeFilterCollapsed ? '◀' : '▶' }}
      </button>
      <div
        v-show="!typeFilterCollapsed"
        class="kg-type-filter-content"
      >
        <button
          v-if="hasTypeFilterOverflow"
          type="button"
          class="kg-type-filter-scroll"
          title="向左查看更多类型"
          aria-label="向左查看更多类型"
          :disabled="!canScrollTypeFilterLeft"
          @click="scrollTypeFilter(-1)"
        >
          <svg
            class="kg-type-filter-chevron kg-type-filter-chevron--left"
            viewBox="0 0 16 16"
            aria-hidden="true"
          >
            <path
              d="M10 3 6 8 10 13"
              fill="none"
              stroke="currentColor"
              stroke-width="1.7"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </button>
        <div
          ref="typeFilterItemsRef"
          class="kg-type-filter-items"
          @scroll="updateTypeFilterScrollState"
        >
          <button
            v-for="item in typeLegendItems"
            :key="item.key"
            type="button"
            class="kg-type-filter-item"
            :class="{ 'kg-type-filter-item--hidden': hiddenTypes.has(item.key) }"
            :aria-pressed="!hiddenTypes.has(item.key)"
            :title="hiddenTypes.has(item.key) ? `显示${item.label}` : `隐藏${item.label}`"
            @click="toggleNodeType(item.key)"
            @pointerdown.stop
          >
            <span
              class="kg-type-filter-swatch"
              :style="{ backgroundColor: item.color }"
            ></span>
            <span class="kg-type-filter-label">{{ item.label }}</span>
          </button>
        </div>
        <button
          v-if="hasTypeFilterOverflow"
          type="button"
          class="kg-type-filter-scroll"
          title="向右查看更多类型"
          aria-label="向右查看更多类型"
          :disabled="!canScrollTypeFilterRight"
          @click="scrollTypeFilter(1)"
        >
          <svg
            class="kg-type-filter-chevron kg-type-filter-chevron--right"
            viewBox="0 0 16 16"
            aria-hidden="true"
          >
            <path
              d="M6 3 10 8 6 13"
              fill="none"
              stroke="currentColor"
              stroke-width="1.7"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import type { GraphNode } from '../types'
import {
  KnowledgeGraph,
  resolveNodeColor,
  type GraphColorMap,
  type LayoutType,
} from '../module/g6Graph'
import {
  normalizeGraphEdge,
  normalizeGraphNode,
  type EdgeFieldMap,
  type NodeFieldMap,
} from '../module/graphAdapter'

interface Props {
  nodes: object[]
  edges: object[]
  width?: number
  height?: number
  /** 初始布局类型，默认 force；变化时同步切换。 */
  layoutType?: LayoutType
  /** 业务节点字段名到组件标准字段名的映射。 */
  nodeFieldMap?: NodeFieldMap
  /** 业务边字段名到组件标准字段名的映射。 */
  edgeFieldMap?: EdgeFieldMap
  /** 节点类型到颜色的映射。 */
  nodeTypeColors?: GraphColorMap
  /** 边标签到颜色的映射。 */
  edgeLabelColors?: GraphColorMap
  /** 是否显示节点类型筛选图例，默认显示。 */
  showTypeFilter?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  width: 0,
  height: 0,
  layoutType: 'force',
  nodeFieldMap: undefined,
  edgeFieldMap: undefined,
  nodeTypeColors: undefined,
  edgeLabelColors: undefined,
  showTypeFilter: true,
})

const emit = defineEmits<{
  nodeClick: [node: GraphNode]
}>()

const normalizedNodes = computed(() =>
  props.nodes.map((node) => normalizeGraphNode(node, props.nodeFieldMap))
)
const normalizedEdges = computed(() =>
  props.edges.map((edge) => normalizeGraphEdge(edge, props.edgeFieldMap))
)
const hiddenTypes = ref(new Set<string>())
const typeLegendItems = computed(() => {
  const items = new Map<string, { key: string; label: string; color: string; count: number }>()

  for (const node of normalizedNodes.value) {
    const key = node.type?.trim() || ''
    const current = items.get(key)
    if (current) {
      current.count += 1
      continue
    }

    items.set(key, {
      key,
      label: key || '未分类',
      color: node.style?.fill || resolveNodeColor(key || undefined, props.nodeTypeColors),
      count: 1,
    })
  }

  return Array.from(items.values())
})
const visibleNodes = computed(() =>
  hiddenTypes.value.size === 0
    ? normalizedNodes.value
    : normalizedNodes.value.filter((node) => !hiddenTypes.value.has(node.type?.trim() || ''))
)
const visibleEdges = computed(() => {
  if (hiddenTypes.value.size === 0) return normalizedEdges.value

  const visibleNodeIds = new Set(visibleNodes.value.map((node) => node.id))
  return normalizedEdges.value.filter(
    (edge) => visibleNodeIds.has(edge.source) && visibleNodeIds.has(edge.target),
  )
})

const toggleNodeType = (type: string) => {
  const next = new Set(hiddenTypes.value)
  if (next.has(type)) {
    next.delete(type)
  } else {
    next.add(type)
  }
  hiddenTypes.value = next
}

const typeFilterRef = ref<HTMLElement | null>(null)
const typeFilterItemsRef = ref<HTMLElement | null>(null)
const typeFilterCollapsed = ref(false)
const typeFilterPosition = ref<{ left: number; top: number } | null>(null)
const typeFilterDockedRight = ref(false)
const isTypeFilterDragging = ref(false)
const canScrollTypeFilterLeft = ref(false)
const canScrollTypeFilterRight = ref(false)
const hasTypeFilterOverflow = computed(
  () => canScrollTypeFilterLeft.value || canScrollTypeFilterRight.value,
)
let typeFilterDragOffset = { x: 0, y: 0 }
let typeFilterPointerId: number | null = null

const typeFilterStyle = computed(() => {
  if (!typeFilterPosition.value) return undefined
  return {
    left: `${typeFilterPosition.value.left}px`,
    top: `${typeFilterPosition.value.top}px`,
    right: 'auto',
    bottom: 'auto',
    transform: 'none',
  }
})

const clampTypeFilterPosition = (left: number, top: number) => {
  const element = typeFilterRef.value
  const parent = element?.offsetParent as HTMLElement | null
  if (!element || !parent) return { left, top }

  const parentRect = parent.getBoundingClientRect()
  const maxLeft = Math.max(0, (parent.clientWidth || parentRect.width) - element.offsetWidth)
  const maxTop = Math.max(0, (parent.clientHeight || parentRect.height) - element.offsetHeight)

  return {
    left: Math.min(Math.max(0, left), maxLeft),
    top: Math.min(Math.max(0, top), maxTop),
  }
}

const constrainTypeFilterPosition = () => {
  if (!typeFilterPosition.value) return
  typeFilterPosition.value = clampTypeFilterPosition(
    typeFilterPosition.value.left,
    typeFilterPosition.value.top,
  )
}

const startTypeFilterDrag = (event: PointerEvent) => {
  if (event.button !== 0) return

  const target = event.target as HTMLElement
  const isHandle = Boolean(target.closest('.kg-type-filter-handle'))
  const isInteractive = Boolean(target.closest('button, select, input, textarea, label, a'))
  if (isInteractive && !isHandle) return

  const element = typeFilterRef.value
  const parent = element?.offsetParent as HTMLElement | null
  if (!element || !parent) return

  const elementRect = element.getBoundingClientRect()
  const parentRect = parent.getBoundingClientRect()
  typeFilterDockedRight.value = false
  typeFilterPosition.value = {
    left: elementRect.left - parentRect.left,
    top: elementRect.top - parentRect.top,
  }
  typeFilterDragOffset = {
    x: event.clientX - elementRect.left,
    y: event.clientY - elementRect.top,
  }
  typeFilterPointerId = event.pointerId
  isTypeFilterDragging.value = true
  element.setPointerCapture?.(event.pointerId)
  event.preventDefault()
}

const moveTypeFilterDrag = (event: PointerEvent) => {
  if (!isTypeFilterDragging.value || typeFilterPointerId !== event.pointerId) return

  const element = typeFilterRef.value
  const parent = element?.offsetParent as HTMLElement | null
  if (!element || !parent) return

  const parentRect = parent.getBoundingClientRect()
  typeFilterPosition.value = clampTypeFilterPosition(
    event.clientX - parentRect.left - typeFilterDragOffset.x,
    event.clientY - parentRect.top - typeFilterDragOffset.y,
  )
  event.preventDefault()
}

const endTypeFilterDrag = (event: PointerEvent) => {
  if (!isTypeFilterDragging.value || typeFilterPointerId !== event.pointerId) return

  isTypeFilterDragging.value = false
  typeFilterPointerId = null
  if (typeFilterRef.value?.hasPointerCapture?.(event.pointerId)) {
    typeFilterRef.value.releasePointerCapture(event.pointerId)
  }
}

const toggleTypeFilterCollapsed = () => {
  const nextCollapsed = !typeFilterCollapsed.value
  if (nextCollapsed) {
    typeFilterPosition.value = null
    typeFilterDockedRight.value = true
  }
  typeFilterCollapsed.value = nextCollapsed
}

const updateTypeFilterScrollState = () => {
  const items = typeFilterItemsRef.value
  if (!items) {
    canScrollTypeFilterLeft.value = false
    canScrollTypeFilterRight.value = false
    return
  }

  canScrollTypeFilterLeft.value = items.scrollLeft > 1
  canScrollTypeFilterRight.value = items.scrollLeft + items.clientWidth < items.scrollWidth - 1
}

const scrollTypeFilter = (direction: -1 | 1) => {
  const items = typeFilterItemsRef.value
  if (!items) return

  items.scrollBy({
    left: direction * Math.max(items.clientWidth * 0.7, 160),
    behavior: 'smooth',
  })
}

const containerRef = ref<HTMLElement | null>(null)
let graph: KnowledgeGraph | null = null
let resizeObserver: ResizeObserver | null = null
let resizeTimeout: ReturnType<typeof setTimeout> | null = null

const getContainerSize = () => {
  if (!containerRef.value) return { width: 0, height: 0 }
  return {
    width: containerRef.value.clientWidth,
    height: containerRef.value.clientHeight
  }
}

const initGraph = () => {
  if (!containerRef.value) return

  // 确保容器有高度
  if (containerRef.value.clientHeight === 0) {
    containerRef.value.style.height = '100%'
  }

  nextTick(() => {
    const { width, height } = getContainerSize()
    if (width === 0 || height === 0) {
      return
    }

    if (!graph) {
      graph = new KnowledgeGraph()
    }

    graph.init(
      {
        container: containerRef.value!,
        width: props.width || width,
        height: props.height || height,
        layoutType: props.layoutType,
        nodeTypeColors: props.nodeTypeColors,
        edgeLabelColors: props.edgeLabelColors,
        onNodeClick: (nodeId) => {
          const node = normalizedNodes.value.find((item) => item.id === nodeId)
          if (node) emit('nodeClick', node)
        },
      },
      visibleNodes.value,
      visibleEdges.value
    )
  })
}

const updateGraph = () => {
  if (!graph) {
    initGraph()
    return
  }

  graph.setColorMaps(props.nodeTypeColors, props.edgeLabelColors)
  graph.update(visibleNodes.value, visibleEdges.value)
}

const fitView = () => {
  graph?.fitView(20)
}

const resetLayout = () => {
  graph?.resetLayout()
}

const switchLayout = (type: LayoutType) => {
  graph?.switchLayout(type)
}

const getLayoutType = () => graph?.getLayoutType() ?? 'force'

const focusNode = (nodeId: string) => {
  graph?.focusNode(nodeId)
}

defineExpose({
  fitView,
  resetLayout,
  switchLayout,
  getLayoutType,
  focusNode
})

watch(
  () => [
    props.nodes,
    props.edges,
    props.nodeFieldMap,
    props.edgeFieldMap,
    props.nodeTypeColors,
    props.edgeLabelColors,
    hiddenTypes.value,
  ],
  () => {
    if (graph) {
      updateGraph()
    } else {
      initGraph()
    }
  },
  { deep: true }
)

watch(
  () => props.layoutType,
  (type) => {
    graph?.switchLayout(type)
  }
)

watch(typeFilterCollapsed, async () => {
  await nextTick()
  constrainTypeFilterPosition()
})

watch(
  () => [
    typeLegendItems.value.map((item) => item.key).join('|'),
    typeFilterCollapsed.value,
    props.showTypeFilter,
  ],
  async () => {
    await nextTick()
    updateTypeFilterScrollState()
  },
)

onMounted(() => {
  if (props.nodes.length > 0 || props.edges.length > 0) {
    initGraph()
  }

  // 使用 ResizeObserver 监听容器尺寸变化
  resizeObserver = new ResizeObserver((entries) => {
    for (const entry of entries) {
      const { width, height } = entry.contentRect
      // 防止 resize 循环：使用防抖
      if (resizeTimeout) clearTimeout(resizeTimeout)
      resizeTimeout = setTimeout(() => {
        if (width > 0 && height > 0 && graph) {
          graph.resize(width, height)
        } else if (width > 0 && height > 0) {
          // 首次初始化
          initGraph()
        }
        updateTypeFilterScrollState()
      }, 100)
    }
  })

  if (containerRef.value) {
    resizeObserver.observe(containerRef.value)

    // 如果数据已存在但尺寸为 0，延迟尝试初始化
    if ((props.nodes.length > 0 || props.edges.length > 0)) {
      setTimeout(() => {
        if (!graph) initGraph()
      }, 100)
    }
  }

  nextTick(updateTypeFilterScrollState)
})

onUnmounted(() => {
  if (resizeTimeout) clearTimeout(resizeTimeout)
  resizeObserver?.disconnect()
  resizeObserver = null
  graph?.destroy()
  graph = null
})
</script>

<style scoped>
.graph-shell {
  position: relative;
  width: 100%;
  height: 100%;
}

.graph-container {
  width: 100%;
  height: 100%;
}

.kg-type-filter {
  position: absolute;
  bottom: 16px;
  left: 50%;
  z-index: 90;
  display: flex;
  align-items: center;
  gap: 6px;
  width: max-content;
  max-width: calc(100% - 32px);
  padding: 8px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.94);
  box-shadow: 0 2px 10px rgba(15, 23, 42, 0.08);
  transform: translateX(-50%);
  backdrop-filter: blur(6px);
  touch-action: none;
}

.kg-type-filter--collapsed {
  padding: 6px;
}

.kg-type-filter--docked-right {
  right: 12px;
  bottom: 16px;
  left: auto;
  transform: none;
}

.kg-type-filter--dragging {
  user-select: none;
}

.kg-type-filter-handle {
  flex: 0 0 auto;
  padding: 3px 1px;
  color: #94a3b8;
  font-size: 14px;
  line-height: 1;
  cursor: grab;
  user-select: none;
}

.kg-type-filter--dragging .kg-type-filter-handle {
  cursor: grabbing;
}

.kg-type-filter-toggle {
  flex: 0 0 auto;
  padding: 4px 6px;
  border: 0;
  border-radius: 4px;
  background: transparent;
  color: #64748b;
  font: inherit;
  font-size: 11px;
  line-height: 1;
  cursor: pointer;
}

.kg-type-filter-toggle:hover {
  color: #0f172a;
  background: #e2e8f0;
}

.kg-type-filter-toggle:focus-visible {
  outline: 2px solid #60a5fa;
  outline-offset: 2px;
}

.kg-type-filter-content {
  display: flex;
  flex: 0 1 auto;
  align-items: center;
  gap: 6px;
  min-width: 0;
}

.kg-type-filter-items {
  display: flex;
  flex: 0 1 auto;
  gap: 6px;
  min-width: 0;
  overflow-x: auto;
  overscroll-behavior-inline: contain;
  scrollbar-width: none;
}

.kg-type-filter-items::-webkit-scrollbar {
  display: none;
}

.kg-type-filter-scroll {
  position: relative;
  flex: 0 0 auto;
  width: 26px;
  height: 26px;
  padding: 0;
  border: 1px solid #d8e1ec;
  border-radius: 6px;
  background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
  color: #64748b;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.05);
  transition: color 0.15s ease, border-color 0.15s ease, background 0.15s ease;
}

.kg-type-filter-scroll:hover:not(:disabled) {
  border-color: #9fb2c8;
  background: #f1f5f9;
  color: #1e293b;
}

.kg-type-filter-scroll:disabled {
  cursor: not-allowed;
  opacity: 0.32;
  box-shadow: none;
}

.kg-type-filter-scroll:focus-visible {
  outline: 2px solid #60a5fa;
  outline-offset: 2px;
}

.kg-type-filter-chevron {
  display: block;
  flex: 0 0 auto;
  width: 16px;
  height: 16px;
}

.kg-type-filter-item {
  display: inline-flex;
  flex: 0 0 auto;
  align-items: center;
  gap: 6px;
  min-height: 26px;
  max-width: 180px;
  padding: 5px 9px;
  border: 1px solid #dbe3ee;
  border-radius: 6px;
  background: #fff;
  color: #334155;
  font: inherit;
  font-size: 12px;
  line-height: 1;
  cursor: pointer;
  transition: opacity 0.15s ease, border-color 0.15s ease, background 0.15s ease;
}

.kg-type-filter-item:hover {
  border-color: #94a3b8;
  background: #f8fafc;
}

.kg-type-filter-item:focus-visible {
  outline: 2px solid #60a5fa;
  outline-offset: 2px;
}

.kg-type-filter-item--hidden {
  opacity: 0.45;
  background: #f1f5f9;
}

.kg-type-filter-swatch {
  flex: 0 0 auto;
  width: 10px;
  height: 10px;
  border-radius: 2px;
}

.kg-type-filter-label {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

@media (max-width: 520px) {
  .kg-type-filter {
    bottom: 10px;
    max-width: calc(100% - 20px);
    padding: 6px;
  }

  .kg-type-filter--docked-right {
    right: 10px;
    bottom: 10px;
  }

  .kg-type-filter-item {
    max-width: 130px;
    padding: 5px 7px;
  }
}
</style>
