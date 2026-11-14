import { flushPromises, mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { GraphEdge, GraphNode } from '../types'
import GraphVisualization from './GraphVisualization.vue'

const graphMock = vi.hoisted(() => ({
  initOptions: undefined as {
    layoutType?: string
    onNodeClick?: (nodeId: string) => void
    nodeTypeColors?: Record<string, string>
    edgeLabelColors?: Record<string, string>
  } | undefined,
  nodes: undefined as GraphNode[] | undefined,
  edges: undefined as GraphEdge[] | undefined,
  switchLayout: vi.fn(),
  setColorMaps: vi.fn(),
  update: vi.fn(),
}))

vi.mock('../module/g6Graph', () => ({
  resolveNodeColor: (type?: string, colors: Record<string, string> = {}) =>
    colors[type || 'entity'] || '#13c2c2',
  KnowledgeGraph: class {
    init(options: typeof graphMock.initOptions, nodes: GraphNode[], edges: GraphEdge[]) {
      graphMock.initOptions = options
      graphMock.nodes = nodes
      graphMock.edges = edges
    }

    switchLayout = graphMock.switchLayout
    setColorMaps = graphMock.setColorMaps
    update = graphMock.update
    destroy() {}
  },
}))

describe('GraphVisualization', () => {
  beforeEach(() => {
    graphMock.initOptions = undefined
    graphMock.nodes = undefined
    graphMock.edges = undefined
    graphMock.switchLayout.mockClear()
    graphMock.setColorMaps.mockClear()
    graphMock.update.mockClear()
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

  it('passes node type and edge label color maps and updates them', async () => {
    const wrapper = mount(GraphVisualization, {
      props: {
        nodes: [
          { id: 'chapter', label: '章节点', type: '章' },
          { id: 'section', label: '小节节点', type: '小节' },
        ],
        edges: [
          {
            source: 'chapter',
            target: 'section',
            label: '包含',
            relation_type: '所属',
          },
        ],
        nodeTypeColors: {
          章: '#409EFF',
          小节: '#67C23A',
        },
        edgeLabelColors: {
          包含: '#409EFF',
        },
      },
    })

    await flushPromises()

    expect(graphMock.initOptions?.nodeTypeColors).toEqual({
      章: '#409EFF',
      小节: '#67C23A',
    })
    expect(graphMock.initOptions?.edgeLabelColors).toEqual({
      包含: '#409EFF',
    })

    await wrapper.setProps({
      nodeTypeColors: {
        章: '#0057B8',
        小节: '#67C23A',
      },
    })

    expect(graphMock.setColorMaps).toHaveBeenLastCalledWith(
      {
        章: '#0057B8',
        小节: '#67C23A',
      },
      {
        包含: '#409EFF',
      },
    )
  })

  it('filters nodes and connected edges through the type legend', async () => {
    const wrapper = mount(GraphVisualization, {
      props: {
        nodes: [
          { id: 'chapter', label: '章节点', type: '章' },
          { id: 'section', label: '小节节点', type: '小节' },
        ],
        edges: [
          { source: 'chapter', target: 'section', label: '包含' },
        ],
        nodeTypeColors: {
          章: '#409EFF',
          小节: '#67C23A',
        },
      },
    })

    await flushPromises()
    const items = wrapper.findAll('.kg-type-filter-item')
    expect(items.map((item) => item.text())).toEqual(['章', '小节'])
    expect(items[0].attributes('aria-pressed')).toBe('true')

    await items[0].trigger('click')
    await flushPromises()

    expect(items[0].classes()).toContain('kg-type-filter-item--hidden')
    expect(items[0].attributes('aria-pressed')).toBe('false')
    expect(graphMock.update).toHaveBeenLastCalledWith(
      [expect.objectContaining({ id: 'section' })],
      [],
    )

    await items[0].trigger('click')
    await flushPromises()

    expect(items[0].classes()).not.toContain('kg-type-filter-item--hidden')
    expect(graphMock.update.mock.lastCall?.[0]).toHaveLength(2)
    expect(graphMock.update.mock.lastCall?.[1]).toHaveLength(1)
  })

  it('can hide the type filter legend', () => {
    const wrapper = mount(GraphVisualization, {
      props: {
        nodes: [{ id: 'node-1', label: '节点一', type: '章' }],
        edges: [],
        showTypeFilter: false,
      },
    })

    expect(wrapper.find('.kg-type-filter').exists()).toBe(false)
  })

  it('can drag and collapse the type filter legend', async () => {
    const wrapper = mount(GraphVisualization, {
      attachTo: document.body,
      props: {
        nodes: [{ id: 'node-1', label: '节点一', type: '章' }],
        edges: [],
      },
    })
    await flushPromises()

    const filter = wrapper.get('.kg-type-filter')
    const filterElement = filter.element as HTMLElement
    const shell = wrapper.get('.graph-shell').element as HTMLElement
    shell.getBoundingClientRect = () => ({
      x: 0,
      y: 0,
      left: 0,
      top: 0,
      right: 800,
      bottom: 600,
      width: 800,
      height: 600,
      toJSON: () => ({}),
    })
    Object.defineProperties(shell, {
      clientWidth: { value: 800 },
      clientHeight: { value: 600 },
    })
    Object.defineProperties(filterElement, {
      offsetParent: { value: shell },
      offsetWidth: { value: 120 },
      offsetHeight: { value: 40 },
    })
    filterElement.getBoundingClientRect = () => ({
      x: 600,
      y: 500,
      left: 600,
      top: 500,
      right: 720,
      bottom: 540,
      width: 120,
      height: 40,
      toJSON: () => ({}),
    })
    filterElement.setPointerCapture = vi.fn()
    filterElement.hasPointerCapture = vi.fn(() => true)
    filterElement.releasePointerCapture = vi.fn()

    const pointerDown = new MouseEvent('pointerdown', {
      bubbles: true,
      button: 0,
      clientX: 610,
      clientY: 510,
    })
    Object.defineProperty(pointerDown, 'pointerId', { value: 1 })
    wrapper.get('.kg-type-filter-handle').element.dispatchEvent(pointerDown)

    const pointerMove = new MouseEvent('pointermove', {
      bubbles: true,
      clientX: 300,
      clientY: 200,
    })
    Object.defineProperty(pointerMove, 'pointerId', { value: 1 })
    filterElement.dispatchEvent(pointerMove)
    await wrapper.vm.$nextTick()

    expect(filterElement.style.left).toBe('290px')
    expect(filterElement.style.top).toBe('190px')

    const toggle = wrapper.get('.kg-type-filter-toggle')
    await toggle.trigger('click')

    expect(filter.classes()).toContain('kg-type-filter--collapsed')
    expect(filter.classes()).toContain('kg-type-filter--docked-right')
    expect(wrapper.find('.kg-type-filter-items').isVisible()).toBe(false)
    expect(toggle.text()).toBe('◀')
    expect(filterElement.style.left).toBe('')
    expect(filterElement.style.top).toBe('')

    await toggle.trigger('click')
    expect(wrapper.find('.kg-type-filter-items').isVisible()).toBe(true)
    expect(toggle.text()).toBe('▶')
    expect(filter.classes()).toContain('kg-type-filter--docked-right')

    wrapper.unmount()
  })

  it('scrolls overflowing type items with left and right arrows', async () => {
    const nodes = Array.from({ length: 8 }, (_, index) => ({
      id: `node-${index}`,
      label: `节点${index}`,
      type: `类型${index}`,
    }))
    const wrapper = mount(GraphVisualization, {
      props: {
        nodes,
        edges: [],
      },
    })
    await flushPromises()

    const items = wrapper.get('.kg-type-filter-items').element as HTMLElement
    Object.defineProperties(items, {
      clientWidth: { value: 200, configurable: true },
      scrollWidth: { value: 600, configurable: true },
      scrollLeft: { value: 0, writable: true, configurable: true },
    })
    items.scrollBy = vi.fn()
    items.dispatchEvent(new Event('scroll'))
    await wrapper.vm.$nextTick()

    let scrollButtons = wrapper.findAll('.kg-type-filter-scroll')
    expect(scrollButtons).toHaveLength(2)
    expect(wrapper.find('.kg-type-filter-chevron--left').exists()).toBe(true)
    expect(wrapper.find('.kg-type-filter-chevron--right').exists()).toBe(true)
    expect(scrollButtons[0].attributes('disabled')).toBeDefined()
    expect(scrollButtons[1].attributes('disabled')).toBeUndefined()

    await scrollButtons[1].trigger('click')
    expect(items.scrollBy).toHaveBeenCalledWith({
      left: 160,
      behavior: 'smooth',
    })

    items.scrollLeft = 400
    items.dispatchEvent(new Event('scroll'))
    await wrapper.vm.$nextTick()

    scrollButtons = wrapper.findAll('.kg-type-filter-scroll')
    expect(scrollButtons[0].attributes('disabled')).toBeUndefined()
    expect(scrollButtons[1].attributes('disabled')).toBeDefined()
  })
})
