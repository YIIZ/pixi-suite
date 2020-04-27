import Base from './Base'
import StatusSwitch from './StatusSwitch'
import director from '../managers/director'

export default class RadioGroup extends Base {
  onEnable() {
    this.node.interactive = true
    this.node.on('tap', this.handleClick, this)

    const { defaultValue } = this.node
    if (typeof defaultValue !== 'undefined') {
      const index = this.node.children.findIndex(n => n.value === defaultValue)
      this.changeTo(index)
    }
  }

  onDisable() {
    this.node.off('tap', this.handleClick, this)
  }

  handleClick(evt) {
    const { node } = this
    if (node.disable) return

    const { children } = this.node
    const { renderer } = director.app
    const { interaction } = renderer.plugins

    for (let i = children.length - 1; i >= 0; i--) {
      children[i].interactive = true
      const obj = interaction.hitTest(evt.data.global, children[i])
      if (obj) return this.changeTo(i)
    }
  }

  changeTo(index) {
    const node = this.node.children[index]
    if (!node || this.current === node) return
    if (this.current) {
      const s1 = this.current.getComponent(StatusSwitch)
      s1 && s1.switch('off')
    }
    const s2 = node.getComponent(StatusSwitch)
    s2 && s2.switch('on')
    this.current = node
    this.onChange(node, index)
  }

  onChange(node, index) {
    if (this.node.onChange) this.node.onChange(node, index)
  }
}
