import Base from './Base'
import widgetManager, { AlignFlag, AlignMode } from '../managers/widgetManager'

const defaultConfig = {
  top: 0,
  right: 0,
  left: 0,
  bottom: 0,

  flag: 0,
  mode: AlignMode.RESIZE, // TODO support AWAYS

  target: undefined,
}

const anchorEdge = 'edge'

export default class Widget extends Base {
  static AlignFlag = AlignFlag
  static AlignMode = AlignMode

  onEnable() {
    if (!this.node.widget) {
      this.node.widget = { ...defaultConfig }
    } else {
      const { widget } = this.node
      Object.keys(defaultConfig).map((k) => {
        widget[k] = widget[k] || defaultConfig[k]
      })
      // compat for alignFlag, alignMode
      if (widget.alignFlag) widget.flag = widget.alignFlag
      if (widget.alignMode) widget.mode = widget.alignMode
    }

    widgetManager.add(this)
    this.update()
  }

  onDisable() {
    this.node.widget = null
    widgetManager.remove(this)
  }

  update() {
    // TODO update order
    // TODO position with parent
    const { flag, target = widgetManager.defaultTarget, top, bottom, left, right, anchor } = this.node.widget
    const rect = this.node.getLocalBounds()
    if (flag & AlignFlag.BOTTOM) {
      this.node.y = target.y + target.height - bottom
      if (anchor === anchorEdge) this.node.y -= rect.bottom
    }
    if (flag & AlignFlag.TOP) {
      this.node.y = target.y + top
      if (anchor === anchorEdge) this.node.y -= rect.top
    }
    if (flag & AlignFlag.RIGHT) {
      this.node.x = target.x + target.width - right - rect.right
      if (anchor === anchorEdge) this.node.x -= rect.right
    }
    if (flag & AlignFlag.LEFT) {
      this.node.x = target.x + left
      if (anchor === anchorEdge) this.node.x -= rect.left
    }
  }
}

Object.assign(Widget, AlignFlag, AlignMode)
