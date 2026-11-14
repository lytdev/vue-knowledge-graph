import { describe, expect, it } from 'vitest'
import { normalizeGraphEdge, normalizeGraphNode } from './graphAdapter'

describe('graph field mapping', () => {
  it('maps custom node fields and preserves extra attributes', () => {
    const node = normalizeGraphNode(
      {
        nodeId: 101,
        name: '自定义节点',
        category: '人物',
        score: 98,
      },
      {
        id: 'nodeId',
        label: 'name',
        type: 'category',
      },
    )

    expect(node).toMatchObject({
      id: '101',
      label: '自定义节点',
      type: '人物',
      nodeId: 101,
      name: '自定义节点',
      category: '人物',
      score: 98,
    })
  })

  it('maps custom edge fields and preserves extra attributes', () => {
    const edge = normalizeGraphEdge(
      {
        edgeId: 'edge-1',
        from: 101,
        to: 102,
        name: '合作',
        relation: '相关',
        weight: 0.8,
      },
      {
        id: 'edgeId',
        source: 'from',
        target: 'to',
        label: 'name',
        relationType: 'relation',
      },
    )

    expect(edge).toMatchObject({
      id: 'edge-1',
      source: '101',
      target: '102',
      label: '合作',
      relation_type: '相关',
      edgeId: 'edge-1',
      from: 101,
      to: 102,
      weight: 0.8,
    })
  })
})
