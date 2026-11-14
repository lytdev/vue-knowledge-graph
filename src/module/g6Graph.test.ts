import { describe, expect, it, vi } from 'vitest'

const graphMock = vi.hoisted(() => ({
  on: vi.fn(),
  off: vi.fn(),
  destroy: vi.fn(),
  setLayout: vi.fn(),
  setCursor: vi.fn(),
  fitView: vi.fn(() => Promise.resolve()),
  translateBy: vi.fn(() => Promise.resolve()),
  configs: [] as unknown[],
  canvasElement: null as HTMLCanvasElement | null,
  resolveRender: null as (() => void) | null,
}))

vi.mock('@antv/g6', () => ({
  Graph: class {
    constructor(config: unknown) {
      graphMock.configs.push(config)
    }

    on = graphMock.on
    off = graphMock.off
    destroy = graphMock.destroy
    getSize = () => [800, 600] as [number, number]
    setLayout = graphMock.setLayout
    fitView = graphMock.fitView
    translateBy = graphMock.translateBy
    layout = () => new Promise(() => {})
    render = () => new Promise<void>((resolve) => {
      graphMock.resolveRender = resolve
    })
    getCanvas = () => ({
      getContextService: () => ({
        getDomElement: () => graphMock.canvasElement,
      }),
      getConfig: () => ({ cursor: 'default' }),
      setCursor: graphMock.setCursor,
    })
  },
  CanvasEvent: {
    POINTER_DOWN: 'canvas:pointerdown',
  },
  NodeEvent: {
    CLICK: 'node:click',
    DRAG: 'node:drag',
  },
}))

import { GRAPH_LAYOUT_OPTIONS, KnowledgeGraph } from './g6Graph'

describe('KnowledgeGraph events', () => {
  it('forwards node clicks and drags only blank canvas with the left button', async () => {
    vi.useFakeTimers()
    const onNodeClick = vi.fn()
    const container = document.createElement('div')
    const canvasElement = document.createElement('canvas')
    canvasElement.setPointerCapture = vi.fn()
    canvasElement.hasPointerCapture = vi.fn(() => true)
    canvasElement.releasePointerCapture = vi.fn()

    graphMock.canvasElement = canvasElement
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

    graphMock.resolveRender?.()
    await Promise.resolve()
    await Promise.resolve()
    graphMock.translateBy.mockClear()
    const canvasPointerDown = graphMock.on.mock.calls
      .find(([event]) => event === 'canvas:pointerdown')?.[1]
    expect(canvasPointerDown).toBeTypeOf('function')

    canvasPointerDown?.({
      button: 2,
      pointerId: 1,
      clientX: 100,
      clientY: 100,
      preventDefault: vi.fn(),
    })
    expect(graphMock.translateBy).not.toHaveBeenCalled()

    canvasPointerDown?.({
      button: 0,
      pointerId: 1,
      clientX: 100,
      clientY: 100,
    })
    const pointerMove = new MouseEvent('pointermove', {
      clientX: 120,
      clientY: 115,
    })
    Object.defineProperty(pointerMove, 'pointerId', { value: 1 })
    window.dispatchEvent(pointerMove)

    expect(canvasElement.setPointerCapture).toHaveBeenCalledWith(1)
    expect(graphMock.translateBy).toHaveBeenCalledWith([20, 15], false)
    graph.destroy()
    vi.clearAllTimers()
    vi.useRealTimers()
  })

  it('uses custom node type and edge label colors', () => {
    const container = document.createElement('div')
    const graph = new KnowledgeGraph()
    graphMock.configs.length = 0

    graph.init(
      {
        container,
        nodeTypeColors: {
          章: '#409EFF',
          小节: '#67C23A',
          知识点: '#E6A23C',
        },
        edgeLabelColors: {
          包含: '#409EFF',
          组成: '#67C23A',
        },
      },
      [
        { id: 'chapter', label: '章节点', type: '章' },
        { id: 'section', label: '小节节点', type: '小节' },
        { id: 'knowledge', label: '知识点节点', type: '知识点' },
      ],
      [
        { source: 'chapter', target: 'section', label: '包含', relation_type: '所属' },
        { source: 'section', target: 'knowledge', label: '组成', relation_type: '相关' },
      ],
    )

    const graphConfig = graphMock.configs.at(-1) as {
      data?: {
        nodes?: Array<{ style?: { fill?: string } }>
        edges?: Array<{ style?: { stroke?: string } }>
      }
    }

    expect(graphConfig.data?.nodes?.map((node) => node.style?.fill)).toEqual([
      '#409EFF',
      '#67C23A',
      '#E6A23C',
    ])
    expect(graphConfig.data?.edges?.map((edge) => edge.style?.stroke)).toEqual([
      '#409EFF',
      '#67C23A',
    ])
    graph.destroy()
  })

  it('initializes and switches between the supported flat-graph layouts', () => {
    const container = document.createElement('div')
    const graph = new KnowledgeGraph()
    graphMock.configs.length = 0
    graphMock.setLayout.mockClear()

    graph.init(
      {
        container,
        layoutType: 'antv-dagre',
      },
      [
        { id: 'root', label: '根节点' },
        { id: 'child', label: '子节点' },
      ],
      [
        { source: 'root', target: 'child' },
      ],
    )

    const graphConfig = graphMock.configs.at(-1) as {
      layout?: { type?: string; focusNode?: string }
    }
    expect(graphConfig.layout).toMatchObject({
      type: 'antv-dagre',
    })

    for (const layout of GRAPH_LAYOUT_OPTIONS) {
      graph.switchLayout(layout.value)
      expect(graphMock.setLayout).toHaveBeenLastCalledWith(
        expect.objectContaining({ type: layout.value }),
      )
    }

    graph.destroy()
  })
})
