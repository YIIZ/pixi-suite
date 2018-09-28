import Base from './Base'

export default class Button extends Base {
  onEnable() {
    this.node.interactive = true
    this.node.on('tap', this.handleClick, this)
  }

  onDisable() {
    this.node.off('tap', this.handleClick, this)
  }

  handleClick() {
    if (this.onClick) this.onClick()
  }

}

