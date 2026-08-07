# agile-knowledge-graph

#### Vue 3 知识图谱可视化组件，基于 AntV G6。


## 安装

```bash
npm install agile-knowledge-graph
```




## 依赖

- Vue 3.2+
- @antv/g6 ^5.1.1

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

<script setup>
import { ref } from 'vue'
import { GraphVisualization } from 'agile-knowledge-graph'

const nodes = ref([
  { id: '1', label: '人工智能', type: '概念' },
  { id: '2', label: '机器学习', type: '概念' },
  { id: '3', label: '深度学习', type: '概念' }
])

const edges = ref([
  { source: '1', target: '2', label: '包含' },
  { source: '2', target: '3', label: '属于' }
])
</script>
```

## 组件

### GraphVisualization

知识图谱可视化组件。

#### Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| nodes | `GraphNode[]` | `[]` | 节点数据 |
| edges | `GraphEdge[]` | `[]` | 边数据 |
| width | `number` | `0` | 画布宽度，0 表示自适应容器 |
| height | `number` | `0` | 画布高度，0 表示自适应容器 |

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
}
```

#### 边数据类型 (GraphEdge)

```typescript
interface GraphEdge {
  id: string          // 唯一标识
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

#### 事件 / 方法

通过 `ref` 调用：

```vue
<template>
  <GraphVisualization ref="graphRef" :nodes="nodes" :edges="edges" />
</template>

<script setup>
const graphRef = ref()

// 适应画布
graphRef.value?.fitView()

// 重置布局
graphRef.value?.resetLayout()

// 切换到力导向布局
graphRef.value?.switchLayout('force')

// 切换到环形布局
graphRef.value?.switchLayout('circular')

// 获取当前布局类型
const layoutType = graphRef.value?.getLayoutType()

// 聚焦到指定节点
graphRef.value?.focusNode('node-id')
</script>
```

### GraphToolbar

图谱工具栏组件，提供布局切换等功能。

#### Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| layoutType | `'force' \| 'circular'` | `'force'` | 当前布局类型 |

#### Events

| 事件名 | 说明 |
|--------|------|
| fitView | 点击"适应画布"时触发 |
| resetLayout | 点击"重置布局"时触发 |
| switchToForce | 切换到力导向布局时触发 |
| switchToCircular | 切换到环形布局时触发 |

#### 使用示例

```vue
<template>
  <div style="width: 100%; height: 600px; position: relative;">
    <GraphVisualization
      ref="graphRef"
      :nodes="nodes"
      :edges="edges"
    />
    <GraphToolbar
      :layoutType="layoutType"
      @fitView="handleFitView"
      @resetLayout="handleResetLayout"
      @switchToForce="handleSwitchForce"
      @switchToCircular="handleSwitchCircular"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { GraphVisualization, GraphToolbar } from 'agile-knowledge-graph'

const graphRef = ref()
const layoutType = ref('force')

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
```

## 交互功能

- **缩放画布**: 鼠标滚轮
- **拖拽节点**: 拖动节点可移动位置，相邻节点会跟随移动
- **拖动画布**: 右键拖动
- **悬停高亮**: 鼠标悬停在节点上时，相关节点和边高亮，其他节点变暗
- **点击选中**: 点击节点选中并高亮相关节点，再次点击取消
- **点击空白**: 点击空白处取消所有高亮

## 布局说明

- **力导向布局 (force)**: 节点自然分散，适合展示复杂关系
- **环形布局 (circular)**: 节点围绕中心排列，适合展示枢纽型图谱

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

```main.js
import { createApp } from 'vue'
import KnowledgeGraph from 'agile-knowledge-graph'
import App from './App.vue'

const app = createApp(App)
app.use(KnowledgeGraph)
app.mount('#div')
```

然后在组件中直接使用：

```vue
<template>
  <GraphVisualization :nodes="nodes" :edges="edges" />
</template>
```

## 本地开发

```bash
pnpm install
pnpm dev
pnpm check
pnpm build
```

## License

[Apache-2.0](./LICENSE)

## 作者

lytdev
