import {
  CanvasEvent,
  Graph,
  NodeEvent,
  type Canvas,
  type EdgeData,
  type GraphOptions,
  type IElementEvent,
  type IElementDragEvent,
  type IPointerEvent,
  type NodeData,
  type SingleLayoutOptions,
} from '@antv/g6'
import { nextTick } from 'vue'
import type { GraphEdge, GraphNode } from '../types'

export type LayoutType =
  | 'force'
  | 'circular'
  | 'concentric'
  | 'antv-dagre'
  | 'indented'
  | 'mindmap'

export type GraphLayoutCategory = 'network' | 'hierarchy'
export type GraphColorMap = Record<string, string>

export interface GraphLayoutOption {
  value: LayoutType
  label: string
  description: string
  category: GraphLayoutCategory
}

export const GRAPH_LAYOUT_OPTIONS: readonly GraphLayoutOption[] = [
  {
    value: 'force',
    label: '力导向',
    description: '通用网络布局，适合结构未知或关系密集的图谱',
    category: 'network',
  },
  {
    value: 'circular',
    label: '环形',
    description: '节点沿圆环排列，适合观察整体结构',
    category: 'network',
  },
  {
    value: 'concentric',
    label: '同心圆',
    description: '按连接度分层，突出核心节点和外围节点',
    category: 'network',
  },
  {
    value: 'antv-dagre',
    label: '有向层级',
    description: '按边的方向排列层级，适合 DAG 或流程数据',
    category: 'hierarchy',
  },
  {
    value: 'indented',
    label: '缩进树',
    description: '目录式层级布局，适合近树结构',
    category: 'hierarchy',
  },
  {
    value: 'mindmap',
    label: '思维导图',
    description: '从中心向两侧分支，适合近树结构',
    category: 'hierarchy',
  },
]

export interface GraphInitOptions {
  container: HTMLElement
  width?: number
  height?: number
  layoutType?: LayoutType
  onNodeClick?: (nodeId: string) => void
  nodeTypeColors?: GraphColorMap
  edgeLabelColors?: GraphColorMap
}

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
  private nodeTypeColors: GraphColorMap = {}
  private edgeLabelColors: GraphColorMap = {}
  private nodeClickHandler: ((nodeId: string) => void) | null = null
  private canvasElement: HTMLCanvasElement | null = null
  private canvasPointerDownHandler: ((event: IPointerEvent) => void) | null = null
  private canvasPointerMoveHandler: ((event: PointerEvent) => void) | null = null
  private canvasPointerUpHandler: ((event: PointerEvent) => void) | null = null
  private canvasPointerId: number | null = null
  private lastCanvasPoint = { x: 0, y: 0 }
  private isCanvasDragging = false
  private canvasDefaultCursor: NonNullable<ReturnType<Canvas['getConfig']>['cursor']> = 'default'

  private getLayoutConfig(
    type: LayoutType,
    width: number,
    height: number,
  ): SingleLayoutOptions {
    const center: [number, number] = [width / 2, height / 2]
    const getNodeWidth = (node: { label?: string }) =>
      Math.min(Math.max((node.label?.length ?? 4) * 14 + 28, 72), 220)
    const getNodeHeight = () => 42

    switch (type) {
      case 'circular':
        return {
          type,
          center,
          radius: Math.min(width, height) * 0.35,
          startAngle: Math.PI / 2,
          endAngle: Math.PI * 2.5,
          ordering: 'degree',
        }
      case 'concentric':
        return {
          type,
          center,
          preventOverlap: true,
          nodeSize: 42,
          sortBy: 'degree',
          equidistant: true,
        }
      case 'antv-dagre':
        return {
          type,
          rankdir: 'TB',
          align: 'UL',
          nodesep: 42,
          ranksep: 110,
        }
      case 'indented':
        return {
          type,
          direction: 'LR',
          indent: 36,
          getWidth: getNodeWidth,
          getHeight: getNodeHeight,
          getHGap: () => 18,
          getVGap: () => 12,
        }
      case 'mindmap':
        return {
          type,
          direction: 'H',
          preLayout: false,
          getWidth: getNodeWidth,
          getHeight: getNodeHeight,
          getHGap: () => 30,
          getVGap: () => 18,
        }
      case 'force':
      default:
        return {
          type: 'force',
          center,
          linkDistance: 280,
          nodeStrength: 1000,
          edgeStrength: 200,
          gravity: 10,
        }
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
    const type = entityType || 'entity'
    return this.nodeTypeColors[type] || colors[type] || '#13c2c2'
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

  public setColorMaps(
    nodeTypeColors: GraphColorMap = {},
    edgeLabelColors: GraphColorMap = {},
  ) {
    this.nodeTypeColors = { ...nodeTypeColors }
    this.edgeLabelColors = { ...edgeLabelColors }
  }

  public init(options: GraphInitOptions, nodes: GraphNode[], edges: GraphEdge[]) {
    const width = options.width || options.container.offsetWidth
    const height = options.height || options.container.offsetHeight
    this.setColorMaps(options.nodeTypeColors, options.edgeLabelColors)
    const data = this.processData(nodes, edges)

    this.currentLayoutType = options.layoutType ?? 'force'
    this.createGraph(
      {
        data,
        animation: false,
        zoomRange: [0.1, 5],
        layout: this.getLayoutConfig(this.currentLayoutType, width, height),
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
    this.run(this.graph.render().then(() => {
      this.setupCanvasDrag()
      this.scheduleFitView()
    }))
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
        const labelColor = edge.label ? this.edgeLabelColors[edge.label] : undefined
        const color = edge.style?.stroke || labelColor || this.getColorByRelation(edge.relation_type)
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
  }

  private setupCanvasDrag() {
    if (!this.graph) return
    const graph = this.graph
    const canvas = graph.getCanvas()
    const canvasElement = canvas.getContextService().getDomElement() as HTMLCanvasElement | null
    if (!canvasElement) return

    this.canvasElement = canvasElement
    this.canvasDefaultCursor = canvas.getConfig().cursor || 'default'
    this.canvasPointerDownHandler = (event) => {
      if (event.button !== 0 || this.canvasPointerId !== null) return

      this.canvasPointerId = event.pointerId
      this.isCanvasDragging = true
      this.lastCanvasPoint = { x: event.clientX, y: event.clientY }
      canvasElement.setPointerCapture(event.pointerId)
      canvas.setCursor('grabbing')
    }
    this.canvasPointerMoveHandler = (event) => {
      if (
        !this.isCanvasDragging ||
        (this.canvasPointerId !== null && event.pointerId !== this.canvasPointerId)
      ) {
        return
      }

      const offset: [number, number] = [
        event.clientX - this.lastCanvasPoint.x,
        event.clientY - this.lastCanvasPoint.y,
      ]
      this.lastCanvasPoint = { x: event.clientX, y: event.clientY }
      this.run(graph.translateBy(offset, false))
      event.preventDefault?.()
    }
    this.canvasPointerUpHandler = (event) => {
      if (this.canvasPointerId !== null && event.pointerId !== this.canvasPointerId) {
        return
      }

      const wasDragging = this.isCanvasDragging
      this.isCanvasDragging = false
      this.canvasPointerId = null
      if (wasDragging && canvasElement.hasPointerCapture?.(event.pointerId)) {
        canvasElement.releasePointerCapture(event.pointerId)
      }
      if (wasDragging) canvas.setCursor(this.canvasDefaultCursor)
    }

    graph.on(CanvasEvent.POINTER_DOWN, this.canvasPointerDownHandler)
    window.addEventListener('pointermove', this.canvasPointerMoveHandler, true)
    window.addEventListener('pointerup', this.canvasPointerUpHandler, true)
    window.addEventListener('pointercancel', this.canvasPointerUpHandler, true)
  }

  public override destroy() {
    if (this.graph && this.canvasPointerDownHandler) {
      this.graph.off(CanvasEvent.POINTER_DOWN, this.canvasPointerDownHandler)
    }
    if (this.canvasPointerMoveHandler) {
      window.removeEventListener('pointermove', this.canvasPointerMoveHandler, true)
    }
    if (this.canvasPointerUpHandler) {
      window.removeEventListener('pointerup', this.canvasPointerUpHandler, true)
      window.removeEventListener('pointercancel', this.canvasPointerUpHandler, true)
    }

    this.canvasElement = null
    this.canvasPointerDownHandler = null
    this.canvasPointerMoveHandler = null
    this.canvasPointerUpHandler = null
    this.canvasPointerId = null
    this.isCanvasDragging = false
    this.nodeClickHandler = null
    super.destroy()
  }
}
