import Base from './Base'
import widgetManager, { AlignFlag, AlignMode } from '../managers/widgetManager'

export default class Widget extends Base {
  static AlignFlag = AlignFlag
  static AlignMode = AlignMode

  top = 0
  right = 0
  left = 0
  bottom = 0

  alignFlag = 0
  alignMode = AlignMode.RESIZE // TODO support AWAYS

  target = null

  onEnable() {
    if (!this.target) this.target = widgetManager.defaultTarget
    if (this.node.widget) {
      Object.assign(this, this.node.widget)
    }
    widgetManager.add(this)
    this.update()
  }

  onDisable() {
    this.target = null
    widgetManager.remove(this)
  }

  update() {
    // TODO update order
    // TODO position with parent
    // TODO handle anchor, pivot
    const { target } = this
    if (this.alignFlag & AlignFlag.BOTTOM) {
      this.node.y = target.y + target.height - this.bottom - this.node.height
    }
    if (this.alignFlag & AlignFlag.TOP) {
      this.node.y = target.y + this.top
    }
    if (this.alignFlag & AlignFlag.RIGHT) {
      this.node.x = target.x + target.width - this.right - this.node.width
    }
    if (this.alignFlag & AlignFlag.LEFT) {
      this.node.x = target.x + this.left
    }
  }
}
