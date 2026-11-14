import type { App } from 'vue'
import GraphVisualization from './components/GraphVisualization.vue'
import GraphToolbar from './components/GraphToolbar.vue'
import { GRAPH_LAYOUT_OPTIONS, KnowledgeGraph } from './module/g6Graph'

// 导出类型
export type { GraphNode, GraphEdge } from './types'
export type { GraphInitOptions } from './module/g6Graph'
export type { EdgeFieldMap, NodeFieldMap } from './module/graphAdapter'
export type {
  GraphColorMap,
  GraphLayoutCategory,
  GraphLayoutOption,
  LayoutType,
} from './module/g6Graph'

// Vue 插件 install 方法
const install = (app: App) => {
  app.component('GraphVisualization', GraphVisualization)
  app.component('GraphToolbar', GraphToolbar)
}

// 具名导出（ES Modules）
export {
  install,
  GRAPH_LAYOUT_OPTIONS,
  GraphVisualization,
  GraphToolbar,
  KnowledgeGraph,
}

// 自动导出（UMD）- 默认导出
export default {
  install,
  version: __PACKAGE_VERSION__,
}
