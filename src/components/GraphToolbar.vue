<script setup lang="ts">
import { ref } from 'vue'

interface Props {
  layoutType?: 'force' | 'circular'
}

const props = withDefaults(defineProps<Props>(), {
  layoutType: 'force'
})

const emit = defineEmits<{
  fitView: []
  resetLayout: []
  switchToForce: []
  switchToCircular: []
}>()

const layoutType = ref(props.layoutType)
const collapsed = ref(false)

const handleSwitchToForce = () => {
  layoutType.value = 'force'
  emit('switchToForce')
}

const handleSwitchToCircular = () => {
  layoutType.value = 'circular'
  emit('switchToCircular')
}

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
    >
      {{ collapsed ? '▶' : '◀' }}
    </button>
    <div
      class="kg-btn-group"
      v-show="!collapsed"
    >
      <button
        @click="emit('fitView')"
        class="kg-btn"
      >
        <span class="kg-icon">⊡</span>
        适应画布
      </button>
      <button
        @click="emit('resetLayout')"
        class="kg-btn"
      >
        <span class="kg-icon">↻</span>
        重置布局
      </button>
      <button 
        @click="handleSwitchToForce" 
        class="kg-btn" 
        :class="{ 'kg-active': layoutType === 'force' }" 
        title="力导向布局，节点更分散"
      >
        <span class="kg-icon">⚡</span>
        力导向
      </button>
      <button 
        @click="handleSwitchToCircular" 
        class="kg-btn" 
        :class="{ 'kg-active': layoutType === 'circular' }" 
        title="环形布局，适合枢纽型图谱"
      >
        <span class="kg-icon">◎</span>
        环形
      </button>
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

.kg-btn.kg-active {
  background: #3b82f6;
  color: #fff;
}

.kg-icon {
  font-size: 13px;
  line-height: 1;
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
</style>