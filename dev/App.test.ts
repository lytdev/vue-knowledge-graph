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
    const connectTo = wrapper.get('#connect-to')
    const relatedId = (connectTo.element as HTMLSelectElement).options[1].value

    await wrapper.get('#new-node-label').setValue('知识工程')
    await connectTo.setValue(relatedId)
    await wrapper.get('#new-relation-label').setValue('应用于')
    await wrapper.get('#new-relation-type').setValue('引用')
    await wrapper.get('#relation-direction').setValue('new-to-existing')
    await wrapper.get('.subsection .action-button').trigger('click')

    const data = JSON.parse((wrapper.get('textarea').element as HTMLTextAreaElement).value)
    expect(data.nodes).toContainEqual({ id: 'demo-1', label: '知识工程', type: '概念' })
    expect(data.edges).toContainEqual({
      source: 'demo-1', target: relatedId, label: '应用于', relation_type: '引用',
    })
  })

  it('adds another relationship between existing nodes', async () => {
    const wrapper = mount(App)
    const nodeSelect = wrapper.get('#node-select')
    const sourceId = (nodeSelect.element as HTMLSelectElement).options[0].value
    await nodeSelect.setValue(sourceId)

    const edgeTarget = wrapper.get('#edge-target')
    const targetId = (edgeTarget.element as HTMLSelectElement).options[0].value
    await edgeTarget.setValue(targetId)
    await wrapper.get('#edge-label').setValue('测试关系')
    await wrapper.get('#edge-type').setValue('因果')
    await wrapper.findAll('.subsection .action-button')[1].trigger('click')

    const data = JSON.parse((wrapper.get('textarea').element as HTMLTextAreaElement).value)
    expect(data.edges.at(-1)).toEqual({
      source: sourceId, target: targetId, label: '测试关系', relation_type: '因果',
    })
  })
})
