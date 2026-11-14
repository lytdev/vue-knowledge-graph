# @agilehub/vue-knowledge-graph

基于 Vue 3 和 AntV G6 的知识图谱可视化组件。业务端只需要准备节点和关系数据，即可获得可缩放、可拖动、可筛选、支持多种布局的知识图谱。

## 功能

- 支持力导向、环形、同心圆、有向层级、缩进树和思维导图布局
- 支持鼠标滚轮缩放、空白画布左键拖动、节点拖动
- 支持节点点击事件和节点聚焦
- 支持业务字段名映射
- 支持节点类型颜色和边标签颜色自定义
- 支持节点类型筛选图例
- 支持可拖动、可折叠、可隐藏的图谱工具栏
- 自动注入组件样式，无需单独引入 CSS

## 环境要求

- Vue 3.2+
- `@antv/g6` 5.1+
- 推荐使用 TypeScript

本地开发建议使用 Node.js 20.19+。

## 安装

```bash
pnpm add @agilehub/vue-knowledge-graph @antv/g6 vue
```

也可以使用 npm：

```bash
npm install @agilehub/vue-knowledge-graph @antv/g6 vue
```

`vue` 和 `@antv/g6` 是组件的 peer dependencies，需要业务项目自行安装。

## 5 分钟快速开始

下面是一个可以直接放进业务页面的完整组件：

```vue
<template>
  <div class="knowledge-graph-page">
    <GraphVisualization
      :nodes="nodes"
      :edges="edges"
      @node-click="handleNodeClick"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import {
  GraphVisualization,
  type GraphEdge,
  type GraphNode,
} from '@agilehub/vue-knowledge-graph'

const nodes = ref<GraphNode[]>([
  { id: '1', label: '人工智能', type: '概念' },
  { id: '2', label: '机器学习', type: '概念' },
  { id: '3', label: '深度学习', type: '概念' },
])

const edges = ref<GraphEdge[]>([
  {
    source: '1',
    target: '2',
    label: '包含',
    relation_type: '所属',
  },
  {
    source: '2',
    target: '3',
    label: '包含',
    relation_type: '所属',
  },
])

const handleNodeClick = (node: GraphNode) => {
  console.log('点击节点：', node)
}
</script>

<style scoped>
.knowledge-graph-page {
  width: 100%;
  height: 600px;
  min-height: 400px;
}
</style>
```

> 外层容器必须有明确的高度。高度为 `0` 时无法绘制图谱。

## 数据格式

### 节点

```ts
interface GraphNode {
  id: string
  label: string
  type?: string
  size?: number
  x?: number
  y?: number
  style?: {
    fill?: string
    stroke?: string
    lineWidth?: number
  }
  [key: string]: unknown
}
```

- `id`：节点唯一标识。
- `label`：画布中显示的节点名称。
- `type`：节点类型，用于颜色和类型筛选。
- `style.fill`：节点自身颜色，优先级最高。
- 其他业务字段会保留在节点对象和 G6 节点数据中。

### 边

```ts
interface GraphEdge {
  id?: string
  source: string
  target: string
  label?: string
  relation_type?: string
  style?: {
    stroke?: string
    lineWidth?: number
  }
}
```

- `source` 和 `target` 必须对应一个已存在节点的 `id`。
- `label`：画布中显示的边文字，也可以用于边颜色映射。
- `relation_type`：未配置 `edgeLabelColors` 时，用于默认关系配色。
- `style.stroke`：边自身颜色，优先级最高。

最小数据示例：

```ts
const nodes = [
  { id: 'a', label: '知识工程', type: '概念' },
  { id: 'b', label: '知识图谱', type: '概念' },
]

const edges = [
  {
    source: 'a',
    target: 'b',
    label: '应用于',
    relation_type: '相关',
  },
]
```

## GraphVisualization

### Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| nodes | `object[]` | 必填 | 节点数据 |
| edges | `object[]` | 必填 | 边数据 |
| width | `number` | `0` | 画布宽度，`0` 表示使用容器宽度 |
| height | `number` | `0` | 画布高度，`0` 表示使用容器高度 |
| layoutType | `LayoutType` | `'force'` | 初始和当前布局类型，参数变化时自动切换 |
| nodeFieldMap | `NodeFieldMap` | 标准字段 | 业务节点字段到标准字段的映射 |
| edgeFieldMap | `EdgeFieldMap` | 标准字段 | 业务边字段到标准字段的映射 |
| nodeTypeColors | `GraphColorMap` | 内置配色 | 节点 `type` 到颜色的映射 |
| edgeLabelColors | `GraphColorMap` | 内置配色 | 边 `label` 到颜色的映射 |
| showTypeFilter | `boolean` | `true` | 是否显示节点类型筛选图例 |

### Events

| 事件 | 参数 | 说明 |
|------|------|------|
| nodeClick | `GraphNode` | 点击节点时触发 |

```vue
<GraphVisualization
  :nodes="nodes"
  :edges="edges"
  @node-click="handleNodeClick"
/>
```

如果使用了字段映射，`nodeClick` 返回的是转换后的节点对象，既包含 `id`、`label`、`type` 等标准字段，也保留原始业务字段。

### 公开方法

通过模板 ref 调用：

```vue
<template>
  <GraphVisualization
    ref="graphRef"
    :nodes="nodes"
    :edges="edges"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { GraphVisualization } from '@agilehub/vue-knowledge-graph'

const graphRef = ref<InstanceType<typeof GraphVisualization> | null>(null)

const fitView = () => graphRef.value?.fitView()
const resetLayout = () => graphRef.value?.resetLayout()
const focusFirstNode = () => graphRef.value?.focusNode('1')
const switchToMindmap = () => graphRef.value?.switchLayout('mindmap')
</script>
```

| 方法 | 说明 |
|------|------|
| `fitView()` | 缩放并平移图谱以适配画布 |
| `resetLayout()` | 清除现有节点位置并重新布局 |
| `switchLayout(type)` | 切换到指定布局 |
| `getLayoutType()` | 获取当前布局类型 |
| `focusNode(nodeId)` | 将指定节点聚焦到画布中心 |

## 布局类型

`LayoutType` 支持：

| 值 | 名称 | 适用场景 |
|---|---|---|
| `force` | 力导向 | 普通关系网络、关系较密集的数据 |
| `circular` | 环形 | 观察整体结构、节点分布 |
| `concentric` | 同心圆 | 按连接度突出核心和外围节点 |
| `antv-dagre` | 有向层级 | DAG、流程、方向明确的层级数据 |
| `indented` | 缩进树 | 目录、章节等近树结构 |
| `mindmap` | 思维导图 | 中心主题向多个分支展开 |

设置默认布局：

```vue
<script setup lang="ts">
import { ref } from 'vue'
import {
  GraphVisualization,
  type LayoutType,
} from '@agilehub/vue-knowledge-graph'

const layoutType = ref<LayoutType>('circular')
</script>

<template>
  <GraphVisualization
    :nodes="nodes"
    :edges="edges"
    :layout-type="layoutType"
  />
</template>
```

树形布局更适合每个子节点只有一个父节点的数据。存在多父节点或环路时，优先使用网络布局。

`GRAPH_LAYOUT_OPTIONS` 可从包入口导入，用于业务端自行生成布局选择器：

```ts
import { GRAPH_LAYOUT_OPTIONS } from '@agilehub/vue-knowledge-graph'
```

## 业务字段名映射

如果业务字段名和组件标准字段不同，不需要先转换数据，可以直接传入映射：

```vue
<script setup lang="ts">
import {
  GraphVisualization,
  type EdgeFieldMap,
  type NodeFieldMap,
} from '@agilehub/vue-knowledge-graph'

const nodes = [
  { nodeId: 'a', name: '知识工程', category: '概念' },
  { nodeId: 'b', name: '知识图谱', category: '概念' },
]

const edges = [
  {
    edgeId: 'e1',
    from: 'a',
    to: 'b',
    relationName: '包含',
    relationType: '所属',
  },
]

const nodeFieldMap: NodeFieldMap = {
  id: 'nodeId',
  label: 'name',
  type: 'category',
}

const edgeFieldMap: EdgeFieldMap = {
  id: 'edgeId',
  source: 'from',
  target: 'to',
  label: 'relationName',
  relationType: 'relationType',
}
</script>

<template>
  <GraphVisualization
    :nodes="nodes"
    :edges="edges"
    :node-field-map="nodeFieldMap"
    :edge-field-map="edgeFieldMap"
  />
</template>
```

当前映射针对顶层字段名。映射完成后，组件会保留原始字段并生成标准字段。

## 节点类型和边标签颜色

```vue
<script setup lang="ts">
import {
  GraphVisualization,
  type GraphColorMap,
} from '@agilehub/vue-knowledge-graph'

const nodeTypeColors: GraphColorMap = {
  章: '#409EFF',
  小节: '#67C23A',
  知识点: '#E6A23C',
}

const edgeLabelColors: GraphColorMap = {
  包含: '#409EFF',
  组成: '#67C23A',
}
</script>

<template>
  <GraphVisualization
    :nodes="nodes"
    :edges="edges"
    :node-type-colors="nodeTypeColors"
    :edge-label-colors="edgeLabelColors"
  />
</template>
```

颜色优先级：

1. 节点：`node.style.fill` > `nodeTypeColors[type]` > 内置节点配色
2. 边：`edge.style.stroke` > `edgeLabelColors[label]` > 内置 `relation_type` 配色

### 内置节点配色

| 类型 | 颜色 |
|---|---|
| 人物 | `#ff4d4f` |
| 地点 | `#52c41a` |
| 组织 | `#1890ff` |
| 概念 | `#faad14` |
| 事件 | `#722ed1` |
| 其他 | `#13c2c2` |

### 内置关系配色

| 关系类型 | 颜色 |
|---|---|
| 因果 | `#e74c3c` |
| 所属 | `#2ecc71` |
| 引用 | `#3498db` |
| 相关 | `#9b59b6` |

## 节点类型筛选

组件会在画布底部自动生成节点类型图例：

- 自动收集所有节点 `type`
- 点击类型可隐藏对应节点和关联边
- 再次点击恢复显示
- 支持拖动图例
- 支持折叠图例
- 折叠后默认停靠到右侧
- 类型较多时显示左右滚动按钮
- 无类型的节点归入“未分类”

显示筛选图例：

```vue
<GraphVisualization
  :nodes="nodes"
  :edges="edges"
  :node-type-colors="nodeTypeColors"
  :show-type-filter="true"
/>
```

隐藏筛选图例：

```vue
<GraphVisualization
  :nodes="nodes"
  :edges="edges"
  :show-type-filter="false"
/>
```

## GraphToolbar

`GraphToolbar` 是一个可独立放置的工具栏，提供：

- 适应画布
- 重置布局
- 切换图类型
- 工具栏拖动
- 折叠和展开

工具栏使用绝对定位，因此父容器必须设置 `position: relative`。

```vue
<template>
  <div class="graph-workspace">
    <GraphVisualization
      ref="graphRef"
      :nodes="nodes"
      :edges="edges"
      :layout-type="layoutType"
    />

    <GraphToolbar
      :layout-type="layoutType"
      @fit-view="handleFitView"
      @reset-layout="handleResetLayout"
      @switch-layout="handleSwitchLayout"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import {
  GraphToolbar,
  GraphVisualization,
  type LayoutType,
} from '@agilehub/vue-knowledge-graph'

const graphRef = ref<InstanceType<typeof GraphVisualization> | null>(null)
const layoutType = ref<LayoutType>('force')

const handleFitView = () => graphRef.value?.fitView()
const handleResetLayout = () => graphRef.value?.resetLayout()

const handleSwitchLayout = (type: LayoutType) => {
  layoutType.value = type
}
</script>

<style scoped>
.graph-workspace {
  position: relative;
  width: 100%;
  height: 600px;
}
</style>
```

### GraphToolbar Props

| 属性 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| layoutType | `LayoutType` | `'force'` | 当前布局 |
| showLayoutControl | `boolean` | `true` | 是否显示图类型选择控件 |

隐藏图类型选择器：

```vue
<GraphToolbar
  :layout-type="layoutType"
  :show-layout-control="false"
  @fit-view="handleFitView"
  @reset-layout="handleResetLayout"
/>
```

### GraphToolbar Events

| 事件 | 参数 | 说明 |
|---|---|---|
| fitView | 无 | 点击“适应画布” |
| resetLayout | 无 | 点击“重置布局” |
| switchLayout | `LayoutType` | 选择新的布局类型 |
| switchToForce | 无 | 兼容事件，切换到力导向时触发 |
| switchToCircular | 无 | 兼容事件，切换到环形时触发 |

## 在 el-dialog 中使用

弹窗中最重要的两点是：

1. 图谱容器必须有明确高度。
2. 弹窗打开并完成渲染后再调用 `fitView()`。

```vue
<template>
  <el-dialog
    v-model="dialogVisible"
    title="知识图谱"
    width="900px"
    destroy-on-close
    @opened="handleOpened"
  >
    <div class="dialog-graph">
      <GraphVisualization
        v-if="dialogVisible"
        ref="graphRef"
        :nodes="nodes"
        :edges="edges"
        :node-type-colors="nodeTypeColors"
      />
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { GraphVisualization } from '@agilehub/vue-knowledge-graph'

const dialogVisible = ref(false)
const graphRef = ref<InstanceType<typeof GraphVisualization> | null>(null)

const handleOpened = () => {
  graphRef.value?.fitView()
}
</script>

<style scoped>
.dialog-graph {
  width: 100%;
  height: min(70vh, 720px);
  min-height: 480px;
}
</style>
```

建议同时使用：

- `destroy-on-close`：每次打开弹窗重新创建图谱
- `v-if="dialogVisible"`：避免在隐藏容器中初始化画布
- `@opened`：等弹窗动画结束后再适配画布

## 作为 Vue 插件使用

```ts
import { createApp } from 'vue'
import KnowledgeGraphPlugin from '@agilehub/vue-knowledge-graph'
import App from './App.vue'

const app = createApp(App)
app.use(KnowledgeGraphPlugin)
app.mount('#app')
```

注册后可直接使用：

```vue
<GraphVisualization :nodes="nodes" :edges="edges" />
<GraphToolbar :layout-type="layoutType" />
```

## 交互说明

| 操作 | 效果 |
|---|---|
| 鼠标滚轮 | 缩放画布 |
| 画布空白处按住左键拖动 | 平移画布 |
| 拖动节点 | 移动节点及其关联节点 |
| 点击节点 | 触发 `nodeClick`，并选中和高亮节点 |
| 点击空白 | 取消高亮 |

## 常见问题

### 画布是空白的

检查父容器是否设置了明确高度：

```css
.graph-container {
  width: 100%;
  height: 600px;
}
```

### 节点显示了，但边没有显示

确认：

- `edge.source` 和 `edge.target` 与节点 `id` 完全一致
- 业务字段不同时已配置 `edgeFieldMap`
- ID 没有被转换成不一致的字符串

### 业务字段不同怎么办

使用 `nodeFieldMap` 和 `edgeFieldMap`，不需要提前修改业务数据。

### 节点或边颜色没有生效

颜色优先级为：

- 节点自身 `style.fill`
- `nodeTypeColors[type]`
- 内置颜色

- 边自身 `style.stroke`
- `edgeLabelColors[label]`
- 内置 `relation_type` 颜色

### 类型筛选后节点不见了

再次点击对应类型图例即可恢复。如果不需要筛选图例，可设置：

```vue
<GraphVisualization
  :show-type-filter="false"
/>
```

### 树形布局显示异常

`indented` 和 `mindmap` 更适合单父节点的树结构。存在多父节点或环路时，请使用 `force`、`circular` 或 `concentric`。

## 本地开发

```bash
pnpm install
pnpm dev
```

调试页通常运行在 `http://localhost:5173/`。

提交或发布前运行：

```bash
pnpm check
pnpm build
```

## License

[Apache-2.0](./LICENSE)

## 作者

lytdev
