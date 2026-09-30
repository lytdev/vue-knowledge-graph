import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import App from './App.vue'

vi.mock('../src/index', () => ({
  GraphVisualization: { template: '<div />' },
  GraphToolbar: { template: '<div />' },
}))

describe('graph demo relationships', () => {
  it('uses the chosen target, label, type and direction when adding a node', async () => {
    const wrapper = mount(App)
    await wrapper.get('#new-node-label').setValue('知识工程')
    await wrapper.get('#connect-to').setValue('ml')
    await wrapper.get('#new-relation-label').setValue('应用于')
    await wrapper.get('#new-relation-type').setValue('引用')
    await wrapper.get('#relation-direction').setValue('new-to-existing')
    await wrapper.get('.subsection .action-button').trigger('click')

    const data = JSON.parse((wrapper.get('textarea').element as HTMLTextAreaElement).value)
    expect(data.nodes).toContainEqual({ id: 'demo-1', label: '知识工程', type: '概念' })
    expect(data.edges).toContainEqual({
      source: 'demo-1', target: 'ml', label: '应用于', relation_type: '引用',
    })
  })

  it('adds another relationship between existing nodes', async () => {
    const wrapper = mount(App)
    await wrapper.get('#edge-target').setValue('ml')
    await wrapper.get('#edge-label').setValue('测试关系')
    await wrapper.get('#edge-type').setValue('因果')
    await wrapper.findAll('.subsection .action-button')[1].trigger('click')

    const data = JSON.parse((wrapper.get('textarea').element as HTMLTextAreaElement).value)
    expect(data.edges.at(-1)).toEqual({
      source: 'ai', target: 'ml', label: '测试关系', relation_type: '因果',
    })
  })
})
