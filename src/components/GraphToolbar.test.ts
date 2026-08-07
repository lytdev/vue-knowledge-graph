import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import GraphToolbar from './GraphToolbar.vue'

describe('GraphToolbar', () => {
  it('uses the force layout by default and switches to circular', async () => {
    const wrapper = mount(GraphToolbar)
    const buttons = wrapper.findAll('.kg-btn-group .kg-btn')

    expect(buttons).toHaveLength(4)
    expect(buttons[2].classes()).toContain('kg-active')

    await buttons[3].trigger('click')

    expect(wrapper.emitted('switchToCircular')).toHaveLength(1)
    expect(buttons[3].classes()).toContain('kg-active')
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
