import { flushPromises, mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { GraphEdge, GraphNode } from '../types'
import GraphVisualization from './GraphVisualization.vue'

const graphMock = vi.hoisted(() => ({
  initOptions: undefined as {
    layoutType?: string
    onNodeClick?: (nodeId: string) => void
  } | undefined,
  nodes: undefined as GraphNode[] | undefined,
  edges: undefined as GraphEdge[] | undefined,
  switchLayout: vi.fn(),
}))

vi.mock('../module/g6Graph', () => ({
  KnowledgeGraph: class {
    init(options: typeof graphMock.initOptions, nodes: GraphNode[], edges: GraphEdge[]) {
      graphMock.initOptions = options
      graphMock.nodes = nodes
      graphMock.edges = edges
    }

    switchLayout = graphMock.switchLayout
    destroy() {}
  },
}))

describe('GraphVisualization', () => {
  beforeEach(() => {
    graphMock.initOptions = undefined
    graphMock.nodes = undefined
    graphMock.edges = undefined
    graphMock.switchLayout.mockClear()
    vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(600)
    vi.spyOn(HTMLElement.prototype, 'clientHeight', 'get').mockReturnValue(400)
    vi.stubGlobal('ResizeObserver', class {
      observe() {}
      disconnect() {}
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  it('emits nodeClick with the original node data', async () => {
    const nodes: GraphNode[] = [
      { id: 'node-1', label: '节点一', type: '概念' },
      {
        id: 'node-2',
        label: '节点二',
        type: '人物',
        score: 98,
        metadata: { source: 'manual' },
      },
    ]
    const wrapper = mount(GraphVisualization, {
      props: {
        nodes,
        edges: [],
      },
    })

    await flushPromises()
    graphMock.initOptions?.onNodeClick?.('node-2')

    expect(wrapper.emitted('nodeClick')).toEqual([[nodes[1]]])
  })

  it('passes the initial layout and follows layout prop changes', async () => {
    const wrapper = mount(GraphVisualization, {
      props: {
        nodes: [{ id: 'node-1', label: '节点一' }],
        edges: [],
        layoutType: 'concentric',
      },
    })

    await flushPromises()
    expect(graphMock.initOptions?.layoutType).toBe('concentric')

    await wrapper.setProps({ layoutType: 'indented' })
    expect(graphMock.switchLayout).toHaveBeenCalledWith('indented')
  })

  it('maps custom node and edge field names before initializing the graph', async () => {
    mount(GraphVisualization, {
      props: {
        nodes: [
          { nodeId: 101, name: '自定义节点', category: '人物', score: 98 },
        ],
        edges: [
          {
            edgeId: 'edge-1',
            from: 101,
            to: 102,
            name: '合作关系',
            relation: '相关',
          },
        ],
        nodeFieldMap: {
          id: 'nodeId',
          label: 'name',
          type: 'category',
        },
        edgeFieldMap: {
          id: 'edgeId',
          source: 'from',
          target: 'to',
          label: 'name',
          relationType: 'relation',
        },
      },
    })

    await flushPromises()

    expect(graphMock.nodes?.[0]).toMatchObject({
      id: '101',
      label: '自定义节点',
      type: '人物',
      score: 98,
    })
    expect(graphMock.edges?.[0]).toMatchObject({
      id: 'edge-1',
      source: '101',
      target: '102',
      label: '合作关系',
      relation_type: '相关',
    })
  })
})
