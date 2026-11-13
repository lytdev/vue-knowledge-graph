import { describe, expect, it } from 'vitest'
import packageJson from '../package.json'
import KnowledgeGraphPlugin from './index'

describe('KnowledgeGraph plugin', () => {
  it('uses the package version', () => {
    expect(KnowledgeGraphPlugin.version).toBe(packageJson.version)
  })
})
