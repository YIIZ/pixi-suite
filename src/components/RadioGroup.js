import Base from './Base'
import StatusSwitch from './StatusSwitch'

export default class RadioGroup extends Base {
  onEnable() {
    this.node.interactive = true
    this.node.on('tap', this.handleClick, this)
  }

  onDisable() {
    this.node.off('tap', this.handleClick, this)
  }

  handleClick(evt) {
    const p = evt.data.getLocalPosition(this.node)
    const node = this.node.children.find(c =>
      c.x < p.x && c.width + c.x > p.x
      && c.y < p.y && c.height + c.y > p.y
    )

    this.changeTo(node)
  }

  changeTo(node) {
    if (!node || this.current === node) return
    if (this.current) {
      const s1 = this.current.getComponent(StatusSwitch)
      s1 && s1.switch('off')
    }
    const s2 = node.getComponent(StatusSwitch)
    s2 && s2.switch('on')
    this.current = node
    this.onChange(node)
  }

  onChange() {}
}

