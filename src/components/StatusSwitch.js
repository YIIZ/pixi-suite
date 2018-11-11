import Base from './Base'

export default class StatusSwitch extends Base {
  onEnable() {
    this.off = this.node.children.find(c => c.status === 'off')
    this.on = this.node.children.find(c => c.status === 'on')
    this.switch(this.node.defaultStatus || 'off')
  }

  switch(status) {
    if (!status) status = this.status === 'off' ? 'on' : 'off'
    if (status === 'on') {
      this.off.visible = false
      this.on.visible = true
      this.status = 'on'
    } else {
      this.off.visible = true
      this.on.visible = false
      this.status = 'off'
    }
  }
}

