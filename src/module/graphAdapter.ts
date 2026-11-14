import type { GraphEdge, GraphNode } from '../types'

export interface NodeFieldMap {
  id?: string
  label?: string
  type?: string
}

export interface EdgeFieldMap {
  id?: string
  source?: string
  target?: string
  label?: string
  relationType?: string
}

const DEFAULT_NODE_FIELD_MAP: Required<NodeFieldMap> = {
  id: 'id',
  label: 'label',
  type: 'type',
}

const DEFAULT_EDGE_FIELD_MAP: Required<EdgeFieldMap> = {
  id: 'id',
  source: 'source',
  target: 'target',
  label: 'label',
  relationType: 'relation_type',
}

const asRecord = (value: object): Record<string, unknown> => value as Record<string, unknown>

const toStringValue = (value: unknown): string | undefined => {
  if (value === null || value === undefined) return undefined
  return String(value)
}

export function normalizeGraphNode(node: object, fieldMap?: NodeFieldMap): GraphNode {
  const source = asRecord(node)
  const mapping = { ...DEFAULT_NODE_FIELD_MAP, ...fieldMap }
  const id = toStringValue(source[mapping.id])
  const label = toStringValue(source[mapping.label]) ?? id ?? ''
  const type = toStringValue(source[mapping.type])

  return {
    ...source,
    id: id ?? '',
    label,
    type,
  }
}

export function normalizeGraphEdge(edge: object, fieldMap?: EdgeFieldMap): GraphEdge {
  const source = asRecord(edge)
  const mapping = { ...DEFAULT_EDGE_FIELD_MAP, ...fieldMap }
  const id = toStringValue(source[mapping.id])
  const label = toStringValue(source[mapping.label])
  const relationType = toStringValue(source[mapping.relationType])

  return {
    ...source,
    id,
    source: toStringValue(source[mapping.source]) ?? '',
    target: toStringValue(source[mapping.target]) ?? '',
    label,
    relation_type: relationType,
  }
}
