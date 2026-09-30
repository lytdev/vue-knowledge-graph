import { describe, expect, it } from 'vitest'
import { cloneGraph, parseGraphJson, presets } from './demoData'

describe('demo graph data', () => {
  it('clones presets before editing', () => {
    const graph = cloneGraph(presets.knowledge)
    graph.nodes[0].label = 'changed'
    expect(presets.knowledge.nodes[0].label).toBe('人工智能')
  })

  it('accepts valid nodes and edges', () => {
    expect(parseGraphJson('{"nodes":[{"id":"a","label":"A"}],"edges":[]}').nodes[0].id).toBe('a')
  })

  it('rejects duplicate nodes and dangling edges', () => {
    expect(() => parseGraphJson('{"nodes":[{"id":"a","label":"A"},{"id":"a","label":"B"}],"edges":[]}'))
      .toThrow('节点 id 重复')
    expect(() => parseGraphJson('{"nodes":[{"id":"a","label":"A"}],"edges":[{"source":"a","target":"missing"}]}'))
      .toThrow('引用了不存在的节点')
  })
})
