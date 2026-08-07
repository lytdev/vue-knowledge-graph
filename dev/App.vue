<template>
  <div class="playground">
    <GraphVisualization
      ref="graphRef"
      :nodes="nodes"
      :edges="edges"
    />
    <GraphToolbar
      :layout-type="layoutType"
      @fit-view="handleFitView"
      @reset-layout="handleResetLayout"
      @switch-to-force="handleSwitchForce"
      @switch-to-circular="handleSwitchCircular"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { GraphVisualization,GraphToolbar } from '../src/index'
const nodes = ref([
  { id: '1', label: '人工智能', type: '概念' },
  { id: '2', label: '机器学习', type: '概念' },
  { id: '3', label: '深度学习', type: '概念' },
  { id: '4', label: 'Deepseek', type: '概念' },
  { id: '5', label: 'GitNexus', type: '知识点' },
  { id: '6', label: 'graphify', type: '知识点' },
  { id: '7', label: 'algrophy', type: '知识点' },
  { id: '8', label: 'relation-graph', type: '知识点' },
  { id: '9', label: 'nex-graph', type: '知识点' }
])

const edges = ref([
  { source: '1', target: '2', label: '包含' },
  { source: '2', target: '3', label: '属于' },
  { source: '2', target: '4', label: '扩展' },
  { source: '2', target: '5', label: '扩展' },
  { source: '2', target: '8', label: '扩展' },
  { source: '5', target: '7', label: '延伸' },
  { source: '5', target: '8', label: '延伸' }
])
const graphRef = ref()
const layoutType = ref<'force' | 'circular'>('force')

const handleFitView = () => graphRef.value?.fitView()
const handleResetLayout = () => graphRef.value?.resetLayout()
const handleSwitchForce = () => {
  layoutType.value = 'force'
  graphRef.value?.switchLayout('force')
}
const handleSwitchCircular = () => {
  layoutType.value = 'circular'
  graphRef.value?.switchLayout('circular')
}
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: #f5f5f5;
}

.playground {
  width: 100%;
  height: 760px;
  position: relative;
}

</style>
