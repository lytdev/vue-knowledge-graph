<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import { GraphVisualization, GraphToolbar, type GraphEdge, type GraphNode, type LayoutType } from '../src/index'
import { cloneGraph, parseGraphJson, presets } from './demoData'

interface GraphHandle {
  fitView: () => void
  resetLayout: () => void
  switchLayout: (type: LayoutType) => void
  focusNode: (id: string) => void
}

const graphRef = ref<GraphHandle | null>(null)
const initial = cloneGraph(presets.knowledge)
const nodes = ref<GraphNode[]>(initial.nodes)
const edges = ref<GraphEdge[]>(initial.edges)
const selectedPreset = ref('knowledge')
const layoutType = ref<LayoutType>('force')
const selectedNode = ref('ai')
const newNodeLabel = ref('')
const newNodeType = ref('概念')
const connectTo = ref('ai')
const newRelationLabel = ref('关联')
const newRelationType = ref('相关')
const relationDirection = ref<'existing-to-new' | 'new-to-existing'>('existing-to-new')
const edgeTarget = ref('ml')
const edgeLabel = ref('关联')
const edgeType = ref('相关')
const formError = ref('')
const editorText = ref(JSON.stringify(initial, null, 2))
const editorError = ref('')
const status = ref('已载入知识图谱示例')
const editCount = ref(0)

const nodeOptions = computed(() => nodes.value.map(({ id, label }) => ({ id, label })))
const edgeTargets = computed(() => nodeOptions.value.filter(({ id }) => id !== selectedNode.value))
const graphKey = computed(() => `graph-${editCount.value}`)

watch(selectedNode, () => {
  if (!edgeTargets.value.some(({ id }) => id === edgeTarget.value)) {
    edgeTarget.value = edgeTargets.value[0]?.id ?? ''
  }
})

function syncRelationTargets() {
  connectTo.value = nodes.value[0]?.id ?? ''
  edgeTarget.value = nodes.value[1]?.id ?? ''
  formError.value = ''
}

function syncEditor() {
  editorText.value = JSON.stringify({ nodes: nodes.value, edges: edges.value }, null, 2)
  editorError.value = ''
}

function loadPreset(name: string) {
  const preset = presets[name]
  if (!preset) return
  const data = cloneGraph(preset)
  nodes.value = data.nodes
  edges.value = data.edges
  selectedPreset.value = name
  selectedNode.value = data.nodes[0]?.id ?? ''
  syncRelationTargets()
  layoutType.value = 'force'
  editCount.value += 1
  syncEditor()
  status.value = name === 'empty' ? '已清空画布' : '已载入示例数据'
}

function applyJson() {
  try {
    const data = parseGraphJson(editorText.value)
    nodes.value = data.nodes
    edges.value = data.edges
    selectedPreset.value = 'custom'
    selectedNode.value = data.nodes[0]?.id ?? ''
    syncRelationTargets()
    editorError.value = ''
    status.value = `已应用 JSON：${data.nodes.length} 个节点，${data.edges.length} 条关系`
  } catch (error) {
    editorError.value = error instanceof Error ? error.message : '无法解析数据。'
  }
}

function addNode() {
  const existing = new Set(nodes.value.map((node) => node.id))
  const label = newNodeLabel.value.trim()
  if (!label) {
    formError.value = '请填写新节点名称。'
    return
  }
  let number = 1
  while (existing.has(`demo-${number}`)) number += 1
  const id = `demo-${number}`
  const relatedId = existing.has(connectTo.value) ? connectTo.value : ''
  const relation = newRelationLabel.value.trim()

  nodes.value = [...nodes.value, { id, label, type: newNodeType.value }]
  if (relatedId) {
    edges.value = [...edges.value, {
      source: relationDirection.value === 'existing-to-new' ? relatedId : id,
      target: relationDirection.value === 'existing-to-new' ? id : relatedId,
      label: relation,
      relation_type: newRelationType.value,
    }]
  }
  newNodeLabel.value = ''
  connectTo.value = id
  selectedNode.value = id
  selectedPreset.value = 'custom'
  formError.value = ''
  syncEditor()
  status.value = `已添加 ${label}${relatedId ? `，与 ${relatedId} 建立「${relation || newRelationType.value}」关系` : ''}`
}

function addRelation() {
  const source = selectedNode.value
  const target = edgeTarget.value
  if (!source || !target || source === target) {
    formError.value = '请选择两个不同的节点。'
    return
  }

  edges.value = [...edges.value, {
    source,
    target,
    label: edgeLabel.value.trim(),
    relation_type: edgeType.value,
  }]
  selectedPreset.value = 'custom'
  formError.value = ''
  syncEditor()
  status.value = `已添加关系：${source} → ${target}`
}

function removeNode() {
  const id = selectedNode.value
  if (!id) return
  nodes.value = nodes.value.filter((node) => node.id !== id)
  edges.value = edges.value.filter((edge) => edge.source !== id && edge.target !== id)
  selectedNode.value = nodes.value[0]?.id ?? ''
  if (connectTo.value === id) connectTo.value = nodes.value[0]?.id ?? ''
  selectedPreset.value = 'custom'
  syncEditor()
  status.value = `已删除 ${id} 及其关系`
}

async function focusSelected() {
  if (!selectedNode.value) return
  await nextTick()
  graphRef.value?.focusNode(selectedNode.value)
  status.value = `已聚焦 ${selectedNode.value}`
}

function switchLayout(type: LayoutType) {
  layoutType.value = type
  graphRef.value?.switchLayout(type)
  status.value = type === 'force' ? '已切换力导向布局' : '已切换环形布局'
}

function resetLayout() {
  graphRef.value?.resetLayout()
  status.value = '已重置布局'
}

function fitView() {
  graphRef.value?.fitView()
  status.value = '已适应画布'
}

function handleNodeClick(node: GraphNode) {
  selectedNode.value = node.id
  console.log('点击节点', node)
  status.value = `已点击节点：${node.label} (${node.id})`
}
</script>

<template>
  <div class="demo-shell">
    <header class="demo-header">
      <div>
        <span class="eyebrow">KNOWLEDGE GRAPH / DEV</span>
        <h1>知识图谱调试台</h1>
        <p>直接修改数据，检查组件的渲染、布局和交互。</p>
      </div>
      <div class="header-badges">
        <span>{{ nodes.length }} 节点</span>
        <span>{{ edges.length }} 关系</span>
        <span>{{ layoutType === 'force' ? '力导向' : '环形' }}</span>
      </div>
    </header>

    <main class="demo-main">
      <aside class="control-panel">
        <section class="panel-section">
          <div class="section-heading">
            <span class="section-index">01</span>
            <h2>示例数据</h2>
          </div>
          <div
            class="preset-list"
            role="group"
            aria-label="示例数据"
          >
            <button
              :class="{ active: selectedPreset === 'knowledge' }"
              @click="loadPreset('knowledge')"
            >
              知识网络
            </button>
            <button
              :class="{ active: selectedPreset === 'people' }"
              @click="loadPreset('people')"
            >
              人物关系
            </button>
            <button
              :class="{ active: selectedPreset === 'empty' }"
              @click="loadPreset('empty')"
            >
              空画布
            </button>
          </div>
        </section>

        <section class="panel-section">
          <div class="section-heading">
            <span class="section-index">02</span>
            <h2>节点操作</h2>
          </div>
          <label
            class="field-label"
            for="node-select"
          >当前节点（聚焦、删除及新增关系的起点）</label>
          <select
            id="node-select"
            v-model="selectedNode"
            :disabled="nodes.length === 0"
          >
            <option
              v-if="nodes.length === 0"
              value=""
            >
              暂无节点
            </option>
            <option
              v-for="node in nodeOptions"
              :key="node.id"
              :value="node.id"
            >
              {{ node.label }} ({{ node.id }})
            </option>
          </select>
          <div class="action-row">
            <button
              class="action-button"
              :disabled="!selectedNode"
              @click="focusSelected"
            >
              聚焦节点
            </button>
          </div>
          <button
            class="text-button"
            :disabled="!selectedNode"
            @click="removeNode"
          >
            删除当前节点及关系
          </button>

          <div class="subsection">
            <h3>添加节点</h3>
            <div class="form-grid">
              <label
                class="field-label"
                for="new-node-label"
              >节点名称</label>
              <input
                id="new-node-label"
                v-model="newNodeLabel"
                placeholder="例如：知识工程"
                @input="formError = ''"
              >
              <label
                class="field-label"
                for="new-node-type"
              >节点类型</label>
              <select
                id="new-node-type"
                v-model="newNodeType"
              >
                <option
                  v-for="type in ['概念', '人物', '组织', '地点', '事件']"
                  :key="type"
                  :value="type"
                >
                  {{ type }}
                </option>
              </select>
              <label
                class="field-label"
                for="connect-to"
              >连接到现有节点</label>
              <select
                id="connect-to"
                v-model="connectTo"
                :disabled="nodes.length === 0"
              >
                <option value="">
                  不建立关系
                </option>
                <option
                  v-for="node in nodeOptions"
                  :key="node.id"
                  :value="node.id"
                >
                  {{ node.label }} ({{ node.id }})
                </option>
              </select>
              <template v-if="connectTo">
                <label
                  class="field-label"
                  for="new-relation-label"
                >关系名称</label>
                <input
                  id="new-relation-label"
                  v-model="newRelationLabel"
                  placeholder="例如：属于"
                >
                <label
                  class="field-label"
                  for="new-relation-type"
                >关系类型</label>
                <select
                  id="new-relation-type"
                  v-model="newRelationType"
                >
                  <option
                    v-for="type in ['相关', '所属', '因果', '引用']"
                    :key="type"
                    :value="type"
                  >
                    {{ type }}
                  </option>
                </select>
                <label
                  class="field-label"
                  for="relation-direction"
                >箭头方向</label>
                <select
                  id="relation-direction"
                  v-model="relationDirection"
                >
                  <option value="existing-to-new">
                    现有节点 → 新节点
                  </option>
                  <option value="new-to-existing">
                    新节点 → 现有节点
                  </option>
                </select>
              </template>
            </div>
            <button
              class="action-button primary full-width"
              @click="addNode"
            >
              + 添加节点
            </button>
          </div>

          <div class="subsection">
            <h3>为已有节点添加关系</h3>
            <p class="section-help">
              从当前节点指向目标节点，可连续添加多条关系。
            </p>
            <div class="form-grid">
              <label
                class="field-label"
                for="edge-target"
              >目标节点</label>
              <select
                id="edge-target"
                v-model="edgeTarget"
                :disabled="edgeTargets.length === 0"
              >
                <option
                  v-for="node in edgeTargets"
                  :key="node.id"
                  :value="node.id"
                >
                  {{ node.label }} ({{ node.id }})
                </option>
              </select>
              <label
                class="field-label"
                for="edge-label"
              >关系名称</label>
              <input
                id="edge-label"
                v-model="edgeLabel"
                placeholder="例如：引用"
              >
              <label
                class="field-label"
                for="edge-type"
              >关系类型</label>
              <select
                id="edge-type"
                v-model="edgeType"
              >
                <option
                  v-for="type in ['相关', '所属', '因果', '引用']"
                  :key="type"
                  :value="type"
                >
                  {{ type }}
                </option>
              </select>
            </div>
            <button
              class="action-button full-width"
              :disabled="edgeTargets.length === 0"
              @click="addRelation"
            >
              + 添加关系
            </button>
          </div>
          <p
            v-if="formError"
            class="editor-error"
            role="alert"
          >
            {{ formError }}
          </p>
        </section>

        <section class="panel-section editor-section">
          <div class="section-heading">
            <span class="section-index">03</span>
            <h2>GraphData JSON</h2>
          </div>
          <p class="section-help">
            编辑 nodes / edges，点击应用后立即更新画布。
          </p>
          <textarea
            v-model="editorText"
            aria-label="图谱 JSON 数据"
            spellcheck="false"
            @input="editorError = ''"
          ></textarea>
          <p
            v-if="editorError"
            class="editor-error"
            role="alert"
          >
            {{ editorError }}
          </p>
          <div class="editor-actions">
            <button
              class="action-button primary"
              @click="applyJson"
            >
              应用 JSON
            </button>
            <button
              class="action-button"
              @click="syncEditor"
            >
              恢复当前数据
            </button>
          </div>
        </section>
      </aside>

      <section
        class="canvas-panel"
        aria-label="知识图谱画布"
      >
        <div class="canvas-topbar">
          <div class="canvas-title">
            <span class="live-dot"></span> 实时预览
          </div>
          <span class="canvas-hint">滚轮缩放 · 拖动节点 · 右键拖动画布</span>
        </div>
        <div class="canvas-stage">
          <GraphVisualization
            v-if="nodes.length > 0"
            :key="graphKey"
            ref="graphRef"
            :nodes="nodes"
            :edges="edges"
            @node-click="handleNodeClick"
          />
          <div
            v-else
            class="empty-state"
          >
            <span class="empty-icon">◎</span>
            <strong>画布中还没有节点</strong>
            <span>选择示例数据、添加节点或应用 JSON 开始调试</span>
          </div>
          <GraphToolbar
            v-if="nodes.length > 0"
            :key="graphKey"
            :layout-type="layoutType"
            @fit-view="fitView"
            @reset-layout="resetLayout"
            @switch-to-force="switchLayout('force')"
            @switch-to-circular="switchLayout('circular')"
          />
        </div>
        <footer class="canvas-footer">
          <span>{{ status }}</span>
          <span>组件来自 src/index.ts</span>
        </footer>
      </section>
    </main>
  </div>
</template>

<style>
:root {
  font-family: Inter, 'Segoe UI', 'PingFang SC', system-ui, sans-serif;
  color: #1b2940;
  background: #eef2f7;
  font-synthesis: none;
}

* { box-sizing: border-box; }
body { margin: 0; }
button, input, select, textarea { font: inherit; }
button { cursor: pointer; }
button:disabled { cursor: not-allowed; opacity: .45; }

.demo-shell { min-height: 100vh; padding: 28px clamp(16px, 3vw, 48px) 32px; }
.demo-header { display: flex; align-items: end; justify-content: space-between; gap: 24px; max-width: 1800px; margin: 0 auto 24px; }
.eyebrow { color: #53729e; font-size: 11px; font-weight: 800; letter-spacing: .16em; }
h1 { margin: 8px 0 4px; font-size: clamp(25px, 2.4vw, 34px); letter-spacing: -.035em; }
.demo-header p { margin: 0; color: #728097; font-size: 14px; }
.header-badges { display: flex; gap: 8px; flex-wrap: wrap; }
.header-badges span { padding: 7px 11px; border: 1px solid #dce5ef; border-radius: 100px; background: #fff; color: #536680; font-size: 12px; font-weight: 650; white-space: nowrap; }
.demo-main { display: grid; grid-template-columns: minmax(310px, 360px) minmax(0, 1fr); gap: 18px; max-width: 1800px; margin: auto; align-items: stretch; }
.control-panel, .canvas-panel { border: 1px solid #dce4ee; border-radius: 18px; background: #fff; box-shadow: 0 8px 32px #2f47700b; overflow: hidden; }
.control-panel { display: flex; flex-direction: column; max-height: calc(100vh - 160px); min-height: 650px; overflow-y: auto; }
.panel-section { padding: 22px; border-bottom: 1px solid #edf1f6; }
.panel-section:last-child { border-bottom: 0; }
.section-heading { display: flex; align-items: center; gap: 10px; margin-bottom: 16px; }
.section-index { color: #6d8db9; font-size: 11px; font-weight: 800; letter-spacing: .08em; }
h2 { margin: 0; font-size: 15px; letter-spacing: -.01em; }
.preset-list { display: grid; grid-template-columns: repeat(3, 1fr); gap: 7px; }
.preset-list button, .action-button { border: 1px solid #dce4ef; border-radius: 9px; background: #fff; color: #40516a; font-size: 12px; font-weight: 650; padding: 10px 8px; transition: background .15s, border-color .15s; }
.preset-list button:hover, .action-button:hover:not(:disabled) { border-color: #6c9cdf; background: #f4f8ff; }
.preset-list button.active { color: #245fb6; border-color: #a7c7f1; background: #eaf3ff; }
.field-label { display: block; color: #74839a; font-size: 12px; margin-bottom: 7px; }
input, select { width: 100%; border: 1px solid #dce4ef; border-radius: 9px; padding: 10px 12px; color: #253651; background: #fff; outline-color: #6c9cdf; }
.subsection { margin-top: 22px; padding-top: 18px; border-top: 1px solid #edf1f6; }
.subsection h3 { margin: 0 0 14px; font-size: 13px; }
.subsection .section-help { margin: -6px 0 12px; }
.form-grid { display: grid; gap: 7px; }
.form-grid .field-label { margin: 5px 0 0; }
.full-width { width: 100%; margin-top: 12px; }
.action-row, .editor-actions { display: flex; gap: 8px; margin-top: 12px; }
.action-row .action-button, .editor-actions .action-button { flex: 1; }
.action-button.primary { background: #286ac3; border-color: #286ac3; color: #fff; }
.action-button.primary:hover:not(:disabled) { background: #1c5aad; border-color: #1c5aad; }
.text-button { margin-top: 12px; padding: 0; border: 0; color: #c05252; background: transparent; font-size: 12px; }
.text-button:hover:not(:disabled) { text-decoration: underline; }
.editor-section { display: flex; flex: 1; min-height: 330px; flex-direction: column; }
.section-help { color: #8793a5; margin: -6px 0 12px; font-size: 12px; line-height: 1.5; }
textarea { flex: 1; min-height: 200px; width: 100%; padding: 12px; resize: vertical; border: 1px solid #dce4ef; border-radius: 9px; background: #f8fafd; color: #344561; font: 12px/1.5 Consolas, 'SFMono-Regular', monospace; outline-color: #6c9cdf; }
.editor-error { margin: 8px 0 0; color: #c14242; font-size: 12px; line-height: 1.4; }
.canvas-panel { display: flex; flex-direction: column; min-height: 650px; height: calc(100vh - 160px); }
.canvas-topbar, .canvas-footer { display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 15px 20px; }
.canvas-topbar { border-bottom: 1px solid #edf1f6; }
.canvas-title { display: flex; align-items: center; gap: 9px; font-size: 13px; font-weight: 750; }
.live-dot { width: 8px; height: 8px; border-radius: 50%; background: #3cbd90; box-shadow: 0 0 0 4px #e7f8f1; }
.canvas-hint, .canvas-footer { color: #96a2b2; font-size: 11px; }
.canvas-stage { position: relative; flex: 1; min-height: 0; background-color: #fcfdff; background-image: radial-gradient(#d9e2ee 0.8px, transparent 0.8px); background-size: 20px 20px; }
.canvas-footer { border-top: 1px solid #edf1f6; }
.empty-state { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 9px; color: #8795a9; font-size: 13px; text-align: center; padding: 20px; }
.empty-state strong { color: #354967; font-size: 16px; }
.empty-icon { font-size: 56px; line-height: 1; color: #b6c7dc; }

@media (max-width: 900px) {
  .demo-header { align-items: start; flex-direction: column; }
  .demo-main { grid-template-columns: 1fr; }
  .control-panel { max-height: none; min-height: 0; }
  .editor-section { min-height: 320px; }
  .canvas-panel { height: 620px; min-height: 500px; }
}
@media (max-width: 520px) {
  .demo-shell { padding-top: 20px; }
  .canvas-hint { display: none; }
  .canvas-footer span:last-child { display: none; }
  .canvas-panel { height: 530px; }
}
</style>
