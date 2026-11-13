import { describe, expect, it } from 'vitest'
import packageJson from '../package.json'
import KnowledgeGraphPlugin, { GRAPH_LAYOUT_OPTIONS } from './index'

describe('KnowledgeGraph plugin', () => {
  it('uses the package version', () => {
    expect(KnowledgeGraphPlugin.version).toBe(packageJson.version)
  })

  it('exports the shared layout catalog', () => {
    expect(GRAPH_LAYOUT_OPTIONS.map(({ value }) => value)).toEqual([
      'force',
      'circular',
      'concentric',
      'antv-dagre',
      'indented',
      'mindmap',
    ])
  })
})
