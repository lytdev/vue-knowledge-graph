import { describe, expect, it, vi } from 'vitest'

const graphMock = vi.hoisted(() => ({
  on: vi.fn(),
  destroy: vi.fn(),
  configs: [] as unknown[],
}))

vi.mock('@antv/g6', () => ({
  Graph: class {
    constructor(config: unknown) {
      graphMock.configs.push(config)
    }

    on = graphMock.on
    destroy = graphMock.destroy
    render = () => new Promise(() => {})
  },
  NodeEvent: {
    CLICK: 'node:click',
    DRAG: 'node:drag',
  },
}))

import { KnowledgeGraph } from './g6Graph'

describe('KnowledgeGraph node events', () => {
  it('forwards clicked node IDs to the configured handler', () => {
    const onNodeClick = vi.fn()
    const container = document.createElement('div')
    const graph = new KnowledgeGraph()
    graphMock.configs.length = 0

    graph.init(
      {
        container,
        onNodeClick,
      },
      [{
        id: 'node-1',
        label: '节点一',
        type: '概念',
        score: 98,
        metadata: { source: 'manual' },
      }],
      [],
    )

    const graphConfig = graphMock.configs.at(-1) as {
      data?: { nodes?: Array<{ data?: Record<string, unknown> }> }
    }
    const clickHandler = graphMock.on.mock.calls.find(([event]) => event === 'node:click')?.[1]
    clickHandler?.({ target: { id: 'node-1' } })

    expect(graphConfig.data?.nodes?.[0]?.data).toMatchObject({
      label: '节点一',
      entityType: '概念',
      score: 98,
      metadata: { source: 'manual' },
    })
    expect(onNodeClick).toHaveBeenCalledWith('node-1')
    graph.destroy()
  })
})
