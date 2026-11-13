import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import GraphToolbar from './GraphToolbar.vue'

describe('GraphToolbar', () => {
  it('shows all supported layouts and emits the selected layout', async () => {
    const wrapper = mount(GraphToolbar)
    const buttons = wrapper.findAll('.kg-btn-group .kg-btn')
    const select = wrapper.get('.kg-layout-select')

    expect(buttons).toHaveLength(2)
    expect((select.element as HTMLSelectElement).value).toBe('force')
    expect(wrapper.findAll('.kg-layout-select option')).toHaveLength(6)

    await select.setValue('mindmap')

    expect(wrapper.emitted('switchLayout')).toEqual([['mindmap']])
  })

  it('keeps the selected layout controlled by props and preserves legacy events', async () => {
    const wrapper = mount(GraphToolbar, {
      props: {
        layoutType: 'force',
      },
    })
    const select = wrapper.get('.kg-layout-select')

    await select.setValue('circular')
    await wrapper.setProps({ layoutType: 'antv-dagre' })

    expect(wrapper.emitted('switchLayout')).toEqual([['circular']])
    expect(wrapper.emitted('switchToCircular')).toHaveLength(1)
    expect((select.element as HTMLSelectElement).value).toBe('antv-dagre')
  })

  it('emits viewport actions and supports collapsing', async () => {
    const wrapper = mount(GraphToolbar)
    const buttons = wrapper.findAll('.kg-btn-group .kg-btn')

    await buttons[0].trigger('click')
    await buttons[1].trigger('click')
    await wrapper.get('.kg-toggle').trigger('click')

    expect(wrapper.emitted('fitView')).toHaveLength(1)
    expect(wrapper.emitted('resetLayout')).toHaveLength(1)
    expect(wrapper.classes()).toContain('kg-collapsed')
    expect(wrapper.find('.kg-btn-group').isVisible()).toBe(false)
  })
})
