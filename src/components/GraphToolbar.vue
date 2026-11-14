<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import {
  GRAPH_LAYOUT_OPTIONS,
  type GraphLayoutCategory,
  type LayoutType,
} from '../module/g6Graph'

interface Props {
  layoutType?: LayoutType
}

const props = withDefaults(defineProps<Props>(), {
  layoutType: 'force'
})

const emit = defineEmits<{
  fitView: []
  resetLayout: []
  switchLayout: [type: LayoutType]
  switchToForce: []
  switchToCircular: []
}>()

const collapsed = ref(false)
const selectedLayout = ref<LayoutType>(props.layoutType)
const toolbarRef = ref<HTMLElement | null>(null)
const position = ref<{ left: number; top: number } | null>(null)
const isDragging = ref(false)
let dragOffset = { x: 0, y: 0 }
let dragPointerId: number | null = null

const layoutGroups: Array<{ category: GraphLayoutCategory; label: string }> = [
  { category: 'network', label: '关系网络' },
  { category: 'hierarchy', label: '层级与树形' },
]

const groupedLayouts = computed(() =>
  layoutGroups
    .map((group) => ({
      ...group,
      options: GRAPH_LAYOUT_OPTIONS.filter((layout) => layout.category === group.category),
    }))
    .filter((group) => group.options.length > 0)
)

const currentLayout = computed(
  () => GRAPH_LAYOUT_OPTIONS.find((layout) => layout.value === selectedLayout.value)
)

const handleLayoutChange = (event: Event) => {
  const type = (event.target as HTMLSelectElement).value as LayoutType
  if (!GRAPH_LAYOUT_OPTIONS.some((layout) => layout.value === type)) return

  selectedLayout.value = type
  emit('switchLayout', type)
  if (type === 'force') emit('switchToForce')
  if (type === 'circular') emit('switchToCircular')
}

watch(
  () => props.layoutType,
  (type) => {
    selectedLayout.value = type
  }
)

const toggleCollapse = () => {
  const nextCollapsed = !collapsed.value
  if (nextCollapsed) position.value = null
  collapsed.value = nextCollapsed
}

const toolbarStyle = computed(() => {
  if (!position.value) return undefined
  return {
    left: `${position.value.left}px`,
    top: `${position.value.top}px`,
    right: 'auto',
  }
})

const clampPosition = (left: number, top: number) => {
  const toolbar = toolbarRef.value
  const parent = toolbar?.offsetParent as HTMLElement | null
  if (!toolbar || !parent) return { left, top }

  const parentRect = parent.getBoundingClientRect()
  const maxLeft = Math.max(0, (parent.clientWidth || parentRect.width) - toolbar.offsetWidth)
  const maxTop = Math.max(0, (parent.clientHeight || parentRect.height) - toolbar.offsetHeight)

  return {
    left: Math.min(Math.max(0, left), maxLeft),
    top: Math.min(Math.max(0, top), maxTop),
  }
}

const constrainPosition = () => {
  if (!position.value) return
  position.value = clampPosition(position.value.left, position.value.top)
}

const startDrag = (event: PointerEvent) => {
  if (event.button !== 0) return

  const target = event.target as HTMLElement
  const isHandle = Boolean(target.closest('.kg-drag-handle'))
  const isInteractive = Boolean(target.closest('button, select, input, textarea, label, a'))
  if (isInteractive && !isHandle) return

  const toolbar = toolbarRef.value
  const parent = toolbar?.offsetParent as HTMLElement | null
  if (!toolbar || !parent) return

  const toolbarRect = toolbar.getBoundingClientRect()
  const parentRect = parent.getBoundingClientRect()
  position.value = {
    left: toolbarRect.left - parentRect.left,
    top: toolbarRect.top - parentRect.top,
  }
  dragOffset = {
    x: event.clientX - toolbarRect.left,
    y: event.clientY - toolbarRect.top,
  }
  dragPointerId = event.pointerId
  isDragging.value = true
  toolbar.setPointerCapture?.(event.pointerId)
  event.preventDefault()
}

const moveDrag = (event: PointerEvent) => {
  if (!isDragging.value || dragPointerId !== event.pointerId) return

  const toolbar = toolbarRef.value
  const parent = toolbar?.offsetParent as HTMLElement | null
  if (!toolbar || !parent) return

  const parentRect = parent.getBoundingClientRect()
  position.value = clampPosition(
    event.clientX - parentRect.left - dragOffset.x,
    event.clientY - parentRect.top - dragOffset.y,
  )
  event.preventDefault()
}

const endDrag = (event: PointerEvent) => {
  if (!isDragging.value || dragPointerId !== event.pointerId) return

  isDragging.value = false
  dragPointerId = null
  if (toolbarRef.value?.hasPointerCapture?.(event.pointerId)) {
    toolbarRef.value.releasePointerCapture(event.pointerId)
  }
}

watch(collapsed, async () => {
  await nextTick()
  constrainPosition()
})
</script>

<template>
  <div
    ref="toolbarRef"
    class="kg-toolbar"
    :class="{ 'kg-collapsed': collapsed, 'kg-dragging': isDragging }"
    :style="toolbarStyle"
    @pointerdown="startDrag"
    @pointermove="moveDrag"
    @pointerup="endDrag"
    @pointercancel="endDrag"
  >
    <span
      class="kg-drag-handle"
      title="拖动工具栏"
      aria-hidden="true"
    >
      ⠿
    </span>
    <button
      @click="toggleCollapse"
      class="kg-btn kg-toggle"
      :title="collapsed ? '展开工具栏' : '收起工具栏'"
      :aria-label="collapsed ? '展开工具栏' : '收起工具栏'"
      :aria-expanded="!collapsed"
    >
      {{ collapsed ? '◀' : '▶' }}
    </button>
    <div
      class="kg-btn-group"
      v-show="!collapsed"
    >
      <button
        @click="emit('fitView')"
        class="kg-btn"
        title="适应画布"
      >
        <span class="kg-icon">⊡</span>
        <span class="kg-btn-label">适应画布</span>
      </button>
      <button
        @click="emit('resetLayout')"
        class="kg-btn"
        title="重置布局"
      >
        <span class="kg-icon">↻</span>
        <span class="kg-btn-label">重置布局</span>
      </button>
      <label
        class="kg-layout-control"
        :title="currentLayout?.description"
      >
        <span class="kg-layout-label">图类型</span>
        <select
          class="kg-layout-select"
          :value="selectedLayout"
          aria-label="选择图布局"
          @change="handleLayoutChange"
        >
          <optgroup
            v-for="group in groupedLayouts"
            :key="group.category"
            :label="group.label"
          >
            <option
              v-for="layout in group.options"
              :key="layout.value"
              :value="layout.value"
            >
              {{ layout.label }}
            </option>
          </optgroup>
        </select>
      </label>
    </div>
  </div>
</template>

<style scoped>
.kg-toolbar {
  position: absolute;
  top: 16px;
  right: 16px;
  width: max-content;
  max-width: calc(100% - 24px);
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 8px;
  z-index: 100;
  display: flex;
  gap: 6px;
  align-items: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  font-family: 'Segoe UI', 'PingFang SC', system-ui, sans-serif;
  touch-action: none;
}

.kg-toolbar:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.kg-toolbar.kg-collapsed {
  padding: 6px;
  right: 12px;
}

.kg-btn-group {
  display: flex;
  flex: 0 0 auto;
  gap: 8px;
  align-items: center;
}

.kg-drag-handle {
  color: #94a3b8;
  cursor: grab;
  font-size: 14px;
  line-height: 1;
  padding: 4px 2px;
  user-select: none;
}

.kg-toolbar.kg-dragging {
  user-select: none;
}

.kg-toolbar.kg-dragging .kg-drag-handle {
  cursor: grabbing;
}

.kg-btn {
  flex: 0 0 auto;
  padding: 6px 12px;
  background: transparent;
  border: none;
  border-radius: 6px;
  color: #334155;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 5px;
  outline: none;
  white-space: nowrap;
}

.kg-btn:hover {
  background: #e2e8f0;
  color: #0f172a;
}

.kg-btn:focus-visible,
.kg-toggle:focus-visible {
  outline: 2px solid #60a5fa;
  outline-offset: 2px;
}

.kg-icon {
  font-size: 13px;
  line-height: 1;
}

.kg-layout-control {
  display: flex;
  flex: 0 0 auto;
  align-items: center;
  gap: 7px;
  padding-left: 10px;
  border-left: 1px solid #e2e8f0;
}

.kg-layout-label {
  color: #64748b;
  font-size: 11px;
  font-weight: 650;
  white-space: nowrap;
}

.kg-layout-select {
  width: 128px;
  min-height: 31px;
  padding: 5px 26px 5px 9px;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  background: #fff;
  color: #1e293b;
  font-size: 12px;
  outline: none;
}

.kg-layout-select:hover,
.kg-layout-select:focus {
  border-color: #60a5fa;
  box-shadow: 0 0 0 2px #dbeafe;
}

.kg-toggle {
  padding: 4px 8px;
  background: transparent;
  color: #64748b;
  border: none;
  border-radius: 4px;
  font-size: 11px;
}

.kg-toggle:hover {
  background: #e2e8f0;
  color: #0f172a;
}

@media (max-width: 640px) {
  .kg-toolbar {
    max-width: calc(100% - 24px);
  }

  .kg-btn-group {
    gap: 4px;
  }

  .kg-btn {
    padding: 6px 8px;
  }

  .kg-btn-label {
    display: none;
  }

  .kg-layout-control {
    padding-left: 6px;
    gap: 4px;
  }

  .kg-layout-label {
    display: none;
  }

  .kg-layout-select {
    width: 120px;
  }
}
</style>
