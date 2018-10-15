import Base from './Base'
import StatusSwitch from './StatusSwitch'

export default class Toggle extends Base {
  onEnable() {
    this.node.interactive = true
    this.node.on('touchend', this.handleEnd, this)
  }

  onDisable() {
    this.node.off('touchend', this.handleEnd, this)
  }

  handleEnd() {
    const ss = this.node.getComponent(StatusSwitch)
    this.toggle(ss.status !== 'on')
  }

  toggle(v) {
    const ss = this.node.getComponent(StatusSwitch)
    if (ss) ss.switch(v ? 'on' : 'off')
    if (this.node.onToggle) this.node.onToggle(ss.status)
  }
}

