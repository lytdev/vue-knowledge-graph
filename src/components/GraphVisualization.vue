<template>
  <div
    ref="containerRef"
    class="graph-container"
  ></div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import type { GraphNode } from '../types'
import {
  KnowledgeGraph,
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
}

const props = withDefaults(defineProps<Props>(), {
  width: 0,
  height: 0,
  layoutType: 'force',
  nodeFieldMap: undefined,
  edgeFieldMap: undefined,
  nodeTypeColors: undefined,
  edgeLabelColors: undefined,
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
      normalizedNodes.value,
      normalizedEdges.value
    )
  })
}

const updateGraph = () => {
  if (!graph) {
    initGraph()
    return
  }

  graph.setColorMaps(props.nodeTypeColors, props.edgeLabelColors)
  graph.update(normalizedNodes.value, normalizedEdges.value)
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
.graph-container {
  width: 100%;
  height: 100%;
}
</style>
