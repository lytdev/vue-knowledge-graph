// 知识图谱数据类型定义

export interface GraphNode {
  id: string
  label: string
  type?: string
  size?: number
  style?: {
    fill?: string
    stroke?: string
    lineWidth?: number
  }
  x?: number
  y?: number
  /** 业务自定义属性，值可以是字符串、数字、对象等任意类型。 */
  [key: string]: unknown
}

export interface GraphEdge {
  id?: string
  source: string
  target: string
  label?: string
  relation_type?: string
  style?: {
    stroke?: string
    lineWidth?: number
  }
}

export interface GraphData {
  nodes: GraphNode[]
  edges: GraphEdge[]
}

export interface FileInfo {
  filename: string
  timestamp: string
  nodes_count: number
  edges_count: number
}

export interface GraphStats {
  total_nodes: number
  total_edges: number
  total_files: number
}

export interface GlobalGraphResponse {
  nodes: GraphNode[]
  edges: GraphEdge[]
  files: FileInfo[]
  stats: GraphStats
}

export interface GenerateGraphRequest {
  text: string
}

export interface GenerateGraphResponse {
  nodes: GraphNode[]
  edges: GraphEdge[]
}
