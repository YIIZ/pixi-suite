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
    this.handleSwitch('on')

    this.node.on('touchcancel', this.handleCancel, this)
    this.node.on('touchendoutside', this.handleCancel, this)
    this.node.on('touchend', this.handleClick, this)
  }

  handleCancel(evt) {
    this.handleSwitch('off')

    this.node.off('touchcancel', this.handleCancel, this)
    this.node.off('touchendoutside', this.handleCancel, this)
    this.node.off('touchend', this.handleClick, this)
  }

  handleSwitch(status) {
    const ss = this.node.getComponent(StatusSwitch)
    if (ss) {
      ss.switch(status)
    } else {
      this.node.alpha = status === 'on' ? 0.5 : 1
    }
  }

  handleClick(evt) {
    this.handleCancel(evt)
    if (this.node.onClick) this.node.onClick(evt)
  }
}
