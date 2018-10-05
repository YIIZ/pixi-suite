import Base from './Base'
import StatusSwitch from './StatusSwitch'

export default class Button extends Base {
  onEnable() {
    this.node.interactive = true
    this.node.on('touchstart', this.handleDown, this)
  }

  onDisable() {
    this.node.off('touchstart', this.handleDown, this)
  }

  handleDown() {
    const ss = this.node.getComponent(StatusSwitch)
    if (ss) ss.switch('on')

    this.node.on('touchcancel', this.handleCancel, this)
    this.node.on('touchendoutside', this.handleCancel, this)
    this.node.on('touchend', this.handleClick, this)
  }

  handleCancel(evt) {
    const ss = this.node.getComponent(StatusSwitch)
    if (ss) ss.switch('off')

    this.node.off('touchcancel', this.handleCancel, this)
    this.node.off('touchendoutside', this.handleCancel, this)
    this.node.off('touchend', this.handleClick, this)
  }

  handleClick(evt) {
    this.handleCancel(evt)
    if (this.node.onClick) this.node.onClick(evt)
  }
}

