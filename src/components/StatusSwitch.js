import Base from './Base'

export default class StatusSwitch extends Base {
  onEnable() {
    this.off = this.node.children.find(c => c.status === 'off')
    this.on = this.node.children.find(c => c.status === 'on')
    this.switch(this.node.defaultStatus || 'off')
  }

  onDisable() {
    this.on = null
    this.off = null
  }

  switch(status) {
    const { off, on } = this
    if (!status) status = this.status === 'off' ? 'on' : 'off'
    if (status === 'on') {
      if (off) off.visible = false
      if (on) on.visible = true
      this.status = 'on'
    } else {
      if (off) off.visible = true
      if (on) on.visible = false
      this.status = 'off'
    }
  }
}
