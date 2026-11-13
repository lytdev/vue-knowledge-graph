import {
  Graph,
  NodeEvent,
  type EdgeData,
  type GraphOptions,
  type IElementEvent,
  type IElementDragEvent,
  type NodeData,
} from '@antv/g6'
import { nextTick } from 'vue'
import type { GraphEdge, GraphNode } from '../types'

export interface GraphInitOptions {
  container: HTMLElement
  width?: number
  height?: number
  onNodeClick?: (nodeId: string) => void
}

export type LayoutType = 'force' | 'circular'

/** 负责 G6 实例的生命周期和通用视口操作。 */
export class BaseG6Graph {
  protected graph: Graph | null = null
  protected container: HTMLElement | null = null

  private resizeHandler: (() => void) | null = null

  protected createGraph(
    config: Omit<GraphOptions, 'container' | 'width' | 'height'>,
    options: GraphInitOptions,
  ) {
    const { container, width, height } = options

    if (this.graph) this.destroy()

    this.container = container
    this.graph = new Graph({
      container,
      width: width || container.offsetWidth,
      height: height || container.offsetHeight,
      ...config,
    })
    this.setupResizeHandler()
  }

  private setupResizeHandler() {
    this.cleanupResizeHandler()
    this.resizeHandler = () => {
      if (!this.container) return
      this.resize(this.container.offsetWidth, this.container.offsetHeight)
    }
    window.addEventListener('resize', this.resizeHandler)
  }

  private cleanupResizeHandler() {
    if (!this.resizeHandler) return
    window.removeEventListener('resize', this.resizeHandler)
    this.resizeHandler = null
  }

  protected run(action: Promise<unknown>) {
    void action.catch(() => undefined)
  }

  public hasGraph(): boolean {
    return this.graph !== null
  }

  public resize(width: number, height: number) {
    if (!this.graph || width <= 0 || height <= 0) return
    const [currentWidth, currentHeight] = this.graph.getSize()
    if (currentWidth === width && currentHeight === height) return
    this.graph.resize(width, height)
  }

  public fitView(_padding = 20) {
    if (this.graph) this.run(this.graph.fitView({ when: 'always' }, false))
  }

  public destroy() {
    this.cleanupResizeHandler()
    this.graph?.destroy()
    this.graph = null
    this.container = null
  }
}

/** 知识图谱实现：实体/关系配色、布局切换和图谱交互。 */
export class KnowledgeGraph extends BaseG6Graph {
  private currentLayoutType: LayoutType = 'force'
  private nodeClickHandler: ((nodeId: string) => void) | null = null
  private contextMenuHandler: ((event: MouseEvent) => void) | null = null
  private mouseDownHandler: ((event: MouseEvent) => void) | null = null
  private mouseMoveHandler: ((event: MouseEvent) => void) | null = null
  private mouseUpHandler: ((event: MouseEvent) => void) | null = null

  private getLayoutConfig(type: LayoutType, width: number, height: number) {
    const center: [number, number] = [width / 2, height / 2]

    if (type === 'circular') {
      return {
        type: 'circular' as const,
        center,
        radius: Math.min(width, height) * 0.35,
        startAngle: Math.PI / 2,
        endAngle: Math.PI * 2.5,
        ordering: 'degree' as const,
      }
    }

    return {
      type: 'force' as const,
      center,
      linkDistance: 280,
      nodeStrength: 1000,
      edgeStrength: 200,
      gravity: 10,
    }
  }

  private getColorByType(entityType?: string): string {
    const colors: Record<string, string> = {
      人物: '#ff4d4f',
      地点: '#52c41a',
      组织: '#1890ff',
      概念: '#faad14',
      事件: '#722ed1',
      entity: '#13c2c2',
    }
    return colors[entityType || 'entity'] || '#13c2c2'
  }

  private getColorByRelation(relationType?: string): string {
    const colors: Record<string, string> = {
      因果: '#e74c3c',
      所属: '#2ecc71',
      引用: '#3498db',
      相关: '#9b59b6',
    }
    return colors[relationType || '相关'] || '#9b59b6'
  }

  public init(options: GraphInitOptions, nodes: GraphNode[], edges: GraphEdge[]) {
    const width = options.width || options.container.offsetWidth
    const height = options.height || options.container.offsetHeight
    const data = this.processData(nodes, edges)

    this.currentLayoutType = 'force'
    this.createGraph(
      {
        data,
        animation: false,
        zoomRange: [0.1, 5],
        layout: this.getLayoutConfig('force', width, height),
        behaviors: [
          { type: 'zoom-canvas', sensitivity: 1 },
          { type: 'drag-element' },
          { type: 'hover-activate', degree: 1 },
          { type: 'click-select', degree: 1 },
        ],
        node: {
          type: 'circle',
          style: {
            cursor: 'pointer',
            labelPlacement: 'bottom',
            labelFill: '#000000',
            labelFontSize: 16,
            labelFontWeight: 'bold',
          },
          state: {
            active: { lineWidth: 3, shadowBlur: 12, shadowColor: '#40a9ff' },
            selected: { lineWidth: 4, stroke: '#ff4d4f' },
            inactive: { opacity: 0.25, labelOpacity: 0.35 },
          },
        },
        edge: {
          type: 'line',
          style: {
            cursor: 'pointer',
            endArrow: true,
            labelAutoRotate: true,
            labelFontSize: 12,
          },
          state: {
            active: { lineWidth: 3 },
            selected: { lineWidth: 3, stroke: '#ff4d4f' },
            inactive: { opacity: 0.2, labelOpacity: 0.2 },
          },
        },
      },
      options,
    )

    if (!this.graph) return
    this.nodeClickHandler = options.onNodeClick ?? null
    this.setupEvents()
    this.run(this.graph.render().then(() => this.scheduleFitView()))
  }

  public update(nodes: GraphNode[], edges: GraphEdge[]) {
    if (!this.graph) return
    this.graph.setData(this.processData(nodes, edges))
    this.run(this.graph.render().then(() => this.scheduleFitView()))
  }

  public resetLayout() {
    if (!this.graph) return

    const nodes = this.graph.getNodeData().map((node) => {
      const style = { ...node.style }
      delete style.x
      delete style.y
      return { ...node, style }
    })
    this.graph.setData({ nodes, edges: this.graph.getEdgeData() })
    this.graph.setLayout(this.getCurrentLayout())
    this.run(this.graph.layout().then(() => this.scheduleFitView()))
  }

  public switchLayout(type: LayoutType) {
    if (!this.graph || !this.container) return
    this.currentLayoutType = type
    this.graph.setLayout(this.getCurrentLayout())
    this.run(this.graph.layout().then(() => this.scheduleFitView()))
  }

  public getLayoutType(): LayoutType {
    return this.currentLayoutType
  }

  public focusNode(nodeId: string) {
    if (!this.graph || !this.graph.getNodeData().some(({ id }) => id === nodeId)) return
    this.run(this.graph.focusElement(nodeId, { duration: 500, easing: 'ease-in-out' }))
  }

  private getCurrentLayout() {
    const width = this.container?.offsetWidth || this.graph?.getSize()[0] || 0
    const height = this.container?.offsetHeight || this.graph?.getSize()[1] || 0
    return this.getLayoutConfig(this.currentLayoutType, width, height)
  }

  private processData(nodes: GraphNode[], edges: GraphEdge[]): {
    nodes: NodeData[]
    edges: EdgeData[]
  } {
    const degree: Record<string, number> = {}
    for (const edge of edges) {
      degree[edge.source] = (degree[edge.source] || 0) + 1
      degree[edge.target] = (degree[edge.target] || 0) + 1
    }

    return {
      nodes: nodes.map((node) => ({
        id: node.id,
        data: {
          ...node,
          label: node.label,
          entityType: node.type,
        },
        style: {
          x: node.x,
          y: node.y,
          size: node.size || Math.min(15 + (degree[node.id] || 0) * 3, 40),
          fill: node.style?.fill || this.getColorByType(node.type),
          stroke: node.style?.stroke || '#ffffff',
          lineWidth: node.style?.lineWidth || 2,
          labelText: node.label,
        },
      })),
      edges: edges.map((edge, index) => {
        const color = edge.style?.stroke || this.getColorByRelation(edge.relation_type)
        return {
          id: edge.id || `edge-${edge.source}-${edge.target}-${index}`,
          source: edge.source,
          target: edge.target,
          data: { label: edge.label, relationType: edge.relation_type },
          style: {
            stroke: color,
            lineWidth: edge.style?.lineWidth || 2,
            endArrowFill: color,
            labelText: edge.label,
            labelFill: color,
          },
        }
      }),
    }
  }

  private scheduleFitView() {
    const fit = () => {
      nextTick(() => {
        requestAnimationFrame(() => this.fitView(20))
      })
    }
    fit()
    window.setTimeout(fit, 300)
    window.setTimeout(fit, 1200)
  }

  private setupEvents() {
    if (!this.graph || !this.container) return
    const graph = this.graph

    graph.on(NodeEvent.CLICK, (event: IElementEvent) => {
      this.nodeClickHandler?.(event.target.id)
    })

    graph.on(NodeEvent.DRAG, (event: IElementDragEvent) => {
      const nodeId = event.target.id
      const factor = 0.3
      const updates = graph.getNeighborNodesData(nodeId).map((node) => ({
        id: node.id,
        style: {
          x: (node.style?.x || 0) + event.dx * factor,
          y: (node.style?.y || 0) + event.dy * factor,
        },
      }))
      if (updates.length === 0) return
      graph.updateNodeData(updates)
      this.run(graph.draw())
    })

    let isRightDragging = false
    let lastPoint = { x: 0, y: 0 }

    this.contextMenuHandler = (event) => event.preventDefault()
    this.mouseDownHandler = (event) => {
      if (event.button !== 2) return
      isRightDragging = true
      lastPoint = { x: event.clientX, y: event.clientY }
      this.container!.style.cursor = 'grabbing'
      event.preventDefault()
    }
    this.mouseMoveHandler = (event) => {
      if (!isRightDragging) return
      const offset: [number, number] = [event.clientX - lastPoint.x, event.clientY - lastPoint.y]
      lastPoint = { x: event.clientX, y: event.clientY }
      this.run(graph.translateBy(offset, false))
      event.preventDefault()
    }
    this.mouseUpHandler = (event) => {
      if (event.button !== 2 || !isRightDragging) return
      isRightDragging = false
      if (this.container) this.container.style.cursor = 'default'
    }

    this.container.addEventListener('contextmenu', this.contextMenuHandler)
    this.container.addEventListener('mousedown', this.mouseDownHandler)
    document.addEventListener('mousemove', this.mouseMoveHandler)
    document.addEventListener('mouseup', this.mouseUpHandler)
  }

  public override destroy() {
    if (this.container && this.contextMenuHandler) {
      this.container.removeEventListener('contextmenu', this.contextMenuHandler)
    }
    if (this.container && this.mouseDownHandler) {
      this.container.removeEventListener('mousedown', this.mouseDownHandler)
    }
    if (this.mouseMoveHandler) document.removeEventListener('mousemove', this.mouseMoveHandler)
    if (this.mouseUpHandler) document.removeEventListener('mouseup', this.mouseUpHandler)

    this.contextMenuHandler = null
    this.mouseDownHandler = null
    this.mouseMoveHandler = null
    this.mouseUpHandler = null
    this.nodeClickHandler = null
    super.destroy()
  }
}
