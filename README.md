# @agilehub/vue-knowledge-graph

Vue 3 知识图谱可视化组件，基于 AntV G6。支持力导向、环形、同心圆和层级树形布局，以及节点聚焦和交互式图谱调试页。

## 安装

```bash
npm install @agilehub/vue-knowledge-graph @antv/g6 vue
```

## 依赖

- Vue 3.2+
- @antv/g6 ^5.1.1

这两个包是 peer dependencies，使用本库的项目需要自行安装。

## 快速开始

```vue
<template>
  <div style="width: 100%; height: 600px;">
    <GraphVisualization
      :nodes="nodes"
      :edges="edges"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { GraphVisualization } from '@agilehub/vue-knowledge-graph'

const nodes = ref([
  { id: '1', label: '人工智能', type: '概念' },
  { id: '2', label: '机器学习', type: '概念' },
  { id: '3', label: '深度学习', type: '概念' }
])

const edges = ref([
  { source: '1', target: '2', label: '包含', relation_type: '所属' },
  { source: '2', target: '3', label: '属于', relation_type: '所属' }
])
</script>
```

## 组件

### GraphVisualization

知识图谱可视化组件。

#### Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| nodes | `GraphNode[]` | 必填 | 节点数据 |
| edges | `GraphEdge[]` | 必填 | 关系数据，`source` 和 `target` 必须引用已有节点 ID |
| width | `number` | `0` | 画布宽度，0 表示自适应容器 |
| height | `number` | `0` | 画布高度，0 表示自适应容器 |
| layoutType | `LayoutType` | `'force'` | 默认布局类型，传入后初始化并随参数变化自动切换 |
| nodeFieldMap | `NodeFieldMap` | 标准字段 | 业务节点字段到 `id`、`label`、`type` 的映射 |
| edgeFieldMap | `EdgeFieldMap` | 标准字段 | 业务边字段到 `id`、`source`、`target`、`label`、`relation_type` 的映射 |

#### 设置默认图类型

业务端通过 `layout-type` 参数设置组件初始化时使用的图类型：

```vue
<script setup lang="ts">
import { GraphVisualization, type LayoutType } from '@agilehub/vue-knowledge-graph'

const defaultLayout: LayoutType = 'concentric'
</script>

<template>
  <GraphVisualization
    :nodes="nodes"
    :edges="edges"
    :layout-type="defaultLayout"
  />
</template>
```

也可以直接传入固定值，例如 `<GraphVisualization layout-type="circular" />`。支持的类型为：

- `force`：力导向
- `circular`：环形
- `concentric`：同心圆
- `antv-dagre`：有向层级
- `indented`：缩进树
- `mindmap`：思维导图

#### 自定义业务字段

如果业务数据的字段名与组件标准字段不同，可以通过 `nodeFieldMap` 和 `edgeFieldMap` 转换：

```vue
<script setup lang="ts">
import {
  GraphVisualization,
  type EdgeFieldMap,
  type NodeFieldMap,
} from '@agilehub/vue-knowledge-graph'

const nodes = [
  { nodeId: 'a', name: '知识工程', category: '概念', score: 98 },
  { nodeId: 'b', name: '知识图谱', category: '概念', score: 96 },
]

const edges = [
  {
    edgeId: 'e1',
    from: 'a',
    to: 'b',
    name: '应用于',
    relation: '相关',
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
  label: 'name',
  relationType: 'relation',
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

映射后，组件会保留原始业务字段，同时生成标准的 `GraphNode` 和 `GraphEdge` 字段供 G6 使用。`nodeClick` 事件返回转换后的节点对象，标准字段和原始业务字段都可以访问。

#### Events

| 事件名 | 参数 | 说明 |
|--------|------|------|
| nodeClick | `GraphNode` | 点击节点时触发，返回被点击的节点数据 |

```vue
<GraphVisualization
  :nodes="nodes"
  :edges="edges"
  @node-click="handleNodeClick"
/>
```

```typescript
import type { GraphNode } from '@agilehub/vue-knowledge-graph'

const handleNodeClick = (node: GraphNode) => {
  console.log(node.id)
}
```

#### 节点数据类型 (GraphNode)

```typescript
interface GraphNode {
  id: string          // 唯一标识
  label: string       // 显示文本
  type?: string       // 节点类型（用于配色）
  size?: number       // 节点大小
  style?: {
    fill?: string     // 填充色
    stroke?: string   // 边框色
    lineWidth?: number // 边框宽度
  }
  x?: number          // 初始 X 坐标
  y?: number          // 初始 Y 坐标
  [key: string]: unknown // 自定义属性，值可以是字符串、数字、对象等
}
```

自定义属性会保留在 `nodeClick` 事件参数和 G6 节点 `data` 中。需要强类型访问时可以扩展 `GraphNode`：

```typescript
import type { GraphNode } from '@agilehub/vue-knowledge-graph'

interface ArticleNode extends GraphNode {
  score: number
  bookCode: string
}

const nodes: ArticleNode[] = [
  {
    id: '1',
    label: '金融资产',
    type: '概念',
    score: 98,
    bookCode: 'b087892de9ef4108ae952267adf8e0db',
  },
]
```

#### 边数据类型 (GraphEdge)

```typescript
interface GraphEdge {
  id?: string         // 可选；未提供时组件自动生成
  source: string      // 源节点 ID
  target: string      // 目标节点 ID
  label?: string      // 关系标签
  relation_type?: string // 关系类型（用于配色）
  style?: {
    stroke?: string   // 线条颜色
    lineWidth?: number // 线条宽度
  }
}
```

#### 公开方法

`GraphVisualization` 通过模板 ref 暴露 `fitView()`、`resetLayout()`、`switchLayout(type)`、`getLayoutType()` 和 `focusNode(nodeId)`。`type` 使用导出的 `LayoutType`，例如 `graphRef.value?.switchLayout('mindmap')`。组件挂载后再调用这些方法。

### GraphToolbar

图谱工具栏组件，提供布局切换等功能。

#### Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| layoutType | `LayoutType` | `'force'` | 当前布局类型 |
| showLayoutControl | `boolean` | `true` | 是否显示图类型选择控件 |

#### Events

| 事件名 | 说明 |
|--------|------|
| fitView | 点击"适应画布"时触发 |
| resetLayout | 点击"重置布局"时触发 |
| switchLayout | 下拉框切换布局时触发，参数为 `LayoutType` |
| switchToForce | 兼容事件；切换到力导向时触发 |
| switchToCircular | 兼容事件；切换到环形时触发 |

#### 使用示例

```vue
<template>
  <div style="width: 100%; height: 600px; position: relative;">
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
import { GraphVisualization, GraphToolbar, type LayoutType } from '@agilehub/vue-knowledge-graph'

const nodes = ref([
  { id: '1', label: '人工智能', type: '概念' },
  { id: '2', label: '机器学习', type: '概念' }
])
const edges = ref([
  { source: '1', target: '2', label: '包含', relation_type: '所属' }
])
const graphRef = ref<InstanceType<typeof GraphVisualization> | null>(null)
const layoutType = ref<LayoutType>('force')

const handleFitView = () => graphRef.value?.fitView()
const handleResetLayout = () => graphRef.value?.resetLayout()
const handleSwitchLayout = (type: LayoutType) => {
  layoutType.value = type
}
</script>
```

如业务端不需要让用户切换图类型，可以隐藏图类型控件：

```vue
<GraphToolbar
  :layout-type="layoutType"
  :show-layout-control="false"
  @fit-view="handleFitView"
  @reset-layout="handleResetLayout"
/>
```

## 交互功能

- **缩放画布**: 鼠标滚轮
- **拖拽节点**: 拖动节点可移动位置，相邻节点会跟随移动
- **拖动画布**: 在画布空白区域按住鼠标左键拖动
- **悬停高亮**: 鼠标悬停在节点上时，相关节点和边高亮，其他节点变暗
- **点击选中**: 点击节点选中并高亮相关节点，再次点击取消
- **点击空白**: 点击空白处取消所有高亮

## 布局说明

组件不限定数据语义，所有布局都消费相同的 `nodes + edges`。`GRAPH_LAYOUT_OPTIONS` 导出完整布局清单，可用于自定义选择器。

- **网络布局**: `force`、`circular`、`concentric`
- **层级布局**: `antv-dagre`、`indented`、`mindmap`

树形布局更适合每个子节点只有一个父节点的数据；普通网络或存在多父节点、环路的图谱优先使用力导向、环形或同心圆布局。

## 节点/边颜色

根据类型自动配色：

### 节点类型颜色

| 类型 | 颜色 |
|------|------|
| 人物 | #ff4d4f |
| 地点 | #52c41a |
| 组织 | #1890ff |
| 概念 | #faad14 |
| 事件 | #722ed1 |
| 其他 | #13c2c2 |

### 关系类型颜色

| 类型 | 颜色 |
|------|------|
| 因果 | #e74c3c |
| 所属 | #2ecc71 |
| 引用 | #3498db |
| 相关 | #9b59b6 |

## 作为 Vue 插件使用

```js
import { createApp } from 'vue'
import KnowledgeGraph from '@agilehub/vue-knowledge-graph'
import App from './App.vue'

const app = createApp(App)
app.use(KnowledgeGraph)
app.mount('#app')
```

然后在组件中直接使用：

```vue
<template>
  <GraphVisualization :nodes="nodes" :edges="edges" />
</template>
```

## 本地开发

开发调试页使用 Vite，建议 Node.js 20.19+，并使用仓库锁文件对应的 pnpm。

```bash
pnpm install
pnpm dev
```

打开终端输出的本地地址（通常是 `http://localhost:5173/`）。调试页直接引用 `src/index.ts`，修改组件源码后可通过热更新查看效果。

### 调试页操作

1. **加载数据**：选择“知识网络”“人物关系”或“空画布”。
2. **添加节点和第一条关系**：填写节点名称、类型；在“连接到现有节点”中选择目标，填写关系名称和类型，再选择箭头方向，点击“添加节点”。选择“不建立关系”可创建孤立节点。节点 ID 由调试页自动生成，格式为 `demo-1`、`demo-2` 等。
3. **为节点添加更多关系**：在“当前节点”中选起点，在“为已有节点添加关系”中选目标、关系名称和类型，点击“添加关系”。关系从当前节点指向目标节点，可重复操作。删除节点会同时删除与它相连的关系。
4. **查看图谱行为**：可聚焦节点，并通过图谱工具栏适应画布、重置布局或切换力导向与环形布局。画布支持滚轮缩放、拖动节点和在空白区域按住鼠标左键拖动画布。
5. **调试自己的数据**：在 `GraphData JSON` 编辑器中粘贴 `nodes` 和 `edges`，点击“应用 JSON”。编辑器会检查 JSON 格式、节点 ID 是否重复，以及关系端点是否存在；校验失败时保留当前图谱。

例如，可粘贴下面的数据，验证节点和关系的渲染：

```json
{
  "nodes": [
    { "id": "a", "label": "知识工程", "type": "概念" },
    { "id": "b", "label": "知识图谱", "type": "概念" }
  ],
  "edges": [
    { "source": "a", "target": "b", "label": "应用于", "relation_type": "相关" }
  ]
}
```

修改完成后运行：

```bash
pnpm check
pnpm build
```

## License

[Apache-2.0](./LICENSE)

## 作者

lytdev
