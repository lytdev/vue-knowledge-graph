import type { GraphEdge, GraphNode } from '../src/types'

export interface DemoGraph {
  nodes: GraphNode[]
  edges: GraphEdge[]
}

export const presets: Record<string, DemoGraph> = {
  knowledge: {
    nodes: [
      { id: 'ai', label: '人工智能', type: '概念' },
      { id: 'ml', label: '机器学习', type: '概念' },
      { id: 'dl', label: '深度学习', type: '概念' },
      { id: 'nlp', label: '自然语言处理', type: '概念' },
      { id: 'vision', label: '计算机视觉', type: '概念' },
      { id: 'model', label: '大语言模型', type: '概念' },
      { id: 'team', label: '研发团队', type: '组织' },
      { id: 'launch', label: '模型发布', type: '事件' },
    ],
    edges: [
      { source: 'ai', target: 'ml', label: '包含', relation_type: '所属' },
      { source: 'ml', target: 'dl', label: '包含', relation_type: '所属' },
      { source: 'ai', target: 'nlp', label: '包含', relation_type: '所属' },
      { source: 'ai', target: 'vision', label: '包含', relation_type: '所属' },
      { source: 'nlp', target: 'model', label: '支撑', relation_type: '相关' },
      { source: 'dl', target: 'model', label: '支撑', relation_type: '因果' },
      { source: 'team', target: 'model', label: '研发', relation_type: '相关' },
      { source: 'model', target: 'launch', label: '促成', relation_type: '因果' },
    ],
  },
  people: {
    nodes: [
      { id: 'lin', label: '林晨', type: '人物' },
      { id: 'wang', label: '王宁', type: '人物' },
      { id: 'zhou', label: '周敏', type: '人物' },
      { id: 'studio', label: '设计工作室', type: '组织' },
      { id: 'lab', label: '研究实验室', type: '组织' },
      { id: 'shanghai', label: '上海', type: '地点' },
    ],
    edges: [
      { source: 'lin', target: 'studio', label: '任职于', relation_type: '所属' },
      { source: 'wang', target: 'lab', label: '任职于', relation_type: '所属' },
      { source: 'zhou', target: 'lab', label: '任职于', relation_type: '所属' },
      { source: 'lin', target: 'wang', label: '合作', relation_type: '相关' },
      { source: 'studio', target: 'shanghai', label: '位于', relation_type: '所属' },
      { source: 'lab', target: 'shanghai', label: '位于', relation_type: '所属' },
    ],
  },
  empty: { nodes: [], edges: [] },
}

export function cloneGraph(data: DemoGraph): DemoGraph {
  return structuredClone(data)
}

export function parseGraphJson(input: string): DemoGraph {
  let value: unknown
  try {
    value = JSON.parse(input)
  } catch {
    throw new Error('JSON 格式有误，请检查标点和引号。')
  }

  if (!value || typeof value !== 'object') {
    throw new Error('数据应为包含 nodes 和 edges 的对象。')
  }

  const data = value as Record<string, unknown>
  if (!Array.isArray(data.nodes) || !Array.isArray(data.edges)) {
    throw new Error('nodes 和 edges 都必须是数组。')
  }

  const ids = new Set<string>()
  for (const [index, item] of data.nodes.entries()) {
    if (!item || typeof item !== 'object') throw new Error(`节点 ${index + 1} 必须是对象。`)
    const node = item as Record<string, unknown>
    if (typeof node.id !== 'string' || !node.id.trim() || typeof node.label !== 'string') {
      throw new Error(`节点 ${index + 1} 需要非空字符串 id 和字符串 label。`)
    }
    if (ids.has(node.id)) throw new Error(`节点 id 重复：${node.id}`)
    ids.add(node.id)
  }

  for (const [index, item] of data.edges.entries()) {
    if (!item || typeof item !== 'object') throw new Error(`关系 ${index + 1} 必须是对象。`)
    const edge = item as Record<string, unknown>
    if (typeof edge.source !== 'string' || typeof edge.target !== 'string') {
      throw new Error(`关系 ${index + 1} 需要字符串 source 和 target。`)
    }
    if (!ids.has(edge.source) || !ids.has(edge.target)) {
      throw new Error(`关系 ${index + 1} 引用了不存在的节点。`)
    }
  }

  return data as unknown as DemoGraph
}
