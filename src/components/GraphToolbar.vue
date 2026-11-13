<script setup lang="ts">
import { computed, ref, watch } from 'vue'
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
  collapsed.value = !collapsed.value
}
</script>

<template>
  <div
    class="kg-toolbar"
    :class="{ 'kg-collapsed': collapsed }"
  >
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
  gap: 8px;
  align-items: center;
}

.kg-btn {
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
