import { flushPromises, mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { GraphNode } from '../types'
import GraphVisualization from './GraphVisualization.vue'

const graphMock = vi.hoisted(() => ({
  initOptions: undefined as {
    layoutType?: string
    onNodeClick?: (nodeId: string) => void
  } | undefined,
  switchLayout: vi.fn(),
}))

vi.mock('../module/g6Graph', () => ({
  KnowledgeGraph: class {
    init(options: typeof graphMock.initOptions) {
      graphMock.initOptions = options
    }

    switchLayout = graphMock.switchLayout
    destroy() {}
  },
}))

describe('GraphVisualization', () => {
  beforeEach(() => {
    graphMock.initOptions = undefined
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
})
