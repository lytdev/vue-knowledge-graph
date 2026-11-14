import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
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
    const toggle = wrapper.get('.kg-toggle')

    expect(toggle.text()).toBe('▶')
    expect(toggle.attributes('aria-label')).toBe('收起工具栏')

    await buttons[0].trigger('click')
    await buttons[1].trigger('click')
    await toggle.trigger('click')

    expect(wrapper.emitted('fitView')).toHaveLength(1)
    expect(wrapper.emitted('resetLayout')).toHaveLength(1)
    expect(wrapper.classes()).toContain('kg-collapsed')
    expect(wrapper.find('.kg-btn-group').isVisible()).toBe(false)
    expect(toggle.text()).toBe('◀')
    expect(toggle.attributes('aria-label')).toBe('展开工具栏')
  })

  it('can be dragged within its positioned container', async () => {
    const wrapper = mount(GraphToolbar, {
      attachTo: document.body,
    })
    const toolbar = wrapper.get('.kg-toolbar')
    const toolbarElement = toolbar.element as HTMLElement
    const parent = document.createElement('div')
    parent.getBoundingClientRect = () => ({
      x: 0,
      y: 0,
      left: 0,
      top: 0,
      right: 800,
      bottom: 600,
      width: 800,
      height: 600,
      toJSON: () => ({}),
    })
    Object.defineProperties(parent, {
      clientWidth: { value: 800 },
      clientHeight: { value: 600 },
    })
    let toolbarWidth = 180
    Object.defineProperties(toolbarElement, {
      offsetParent: { value: parent },
      offsetWidth: { get: () => toolbarWidth },
      offsetHeight: { value: 50 },
    })
    toolbarElement.getBoundingClientRect = () => ({
      x: 600,
      y: 16,
      left: 600,
      top: 16,
      right: 780,
      bottom: 66,
      width: 180,
      height: 50,
      toJSON: () => ({}),
    })
    toolbarElement.setPointerCapture = vi.fn()
    toolbarElement.hasPointerCapture = vi.fn(() => true)
    toolbarElement.releasePointerCapture = vi.fn()

    const pointerDown = new MouseEvent('pointerdown', {
      bubbles: true,
      button: 0,
      clientX: 610,
      clientY: 20,
    })
    Object.defineProperty(pointerDown, 'pointerId', { value: 1 })
    toolbarElement.dispatchEvent(pointerDown)

    const pointerMove = new MouseEvent('pointermove', {
      bubbles: true,
      clientX: 620,
      clientY: 100,
    })
    Object.defineProperty(pointerMove, 'pointerId', { value: 1 })
    toolbarElement.dispatchEvent(pointerMove)
    const pointerUp = new MouseEvent('pointerup', {
      bubbles: true,
      clientX: 620,
      clientY: 100,
    })
    Object.defineProperty(pointerUp, 'pointerId', { value: 1 })
    toolbarElement.dispatchEvent(pointerUp)
    await wrapper.vm.$nextTick()

    expect(toolbarElement.style.left).toBe('610px')
    expect(toolbarElement.style.top).toBe('96px')
    expect(toolbarElement.style.right).toBe('auto')

    toolbarWidth = 50
    await wrapper.get('.kg-toggle').trigger('click')
    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()
    toolbarWidth = 438
    await wrapper.get('.kg-toggle').trigger('click')
    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()

    expect(toolbarElement.style.left).toBe('362px')

    wrapper.unmount()
  })
})
