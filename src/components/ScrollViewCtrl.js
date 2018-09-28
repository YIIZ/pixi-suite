import * as PIXI from 'pixi.js'
import Base from './Base'
import Layout from './Layout'

const { Texture: { WHITE } } = PIXI

export default class ScrollViewCtrl extends Base {
  content = null
  view = null
  direction = 'vertical'

  onEnable() {
    this.view.interactive = true
    this.view.on('touchstart', this.handleTouchStart, this)
    this.view.on('touchmove', this.handleTouchMove, this)
    this.view.on('touchend', this.handleTouchEnd, this)
    this.view.on('touchcancel', this.handleTouchEnd, this)
    this.view.on('touchendoutside', this.handleTouchEnd, this)

    const m = new PIXI.Sprite(WHITE)
    this.view.mask = m
    this.view.addChild(m)
  }

  onDisable() {
    this.view.off('touchstart', this.handleTouchStart, this)
    this.view.off('touchmove', this.handleTouchMove, this)
    this.view.off('touchend', this.handleTouchEnd, this)
    this.view.off('touchcancel', this.handleTouchEnd, this)
    this.view.off('touchendoutside', this.handleTouchEnd, this)
    this.view.removeChild(this.view.mask)
    this.view.mask = null
  }

  setContentSize(w, h) {
    this.view.mask.width = w
    this.view.mask.height = h
    const layout = this.content.getComponent(Layout)
    layout.width = w
    layout.height = h
    layout.update()

    // TODO only support one direction
    if (this.direction === 'vertical') {
      this.scroller.node.x = w - this.scroller.node.width
      this.scroller.updateParams({
        len: this.content.height,
        visibleLen: h,
        setter: v => this.content.y = v,
        getter: () => this.content.y,
      })
    } else {
      this.scroller.updateParams({
        len: this.content.width,
        visibleLen: w,
        setter: v => this.content.x = v,
        getter: () => this.content.x,
      })
    }
  }

  handleTouchStart(evt) {
    this.isScrolling = true

    const p = evt.data.getLocalPosition(this.view)
    this.scroller.handleStart(p.y, evt.data.originalEvent.timeStamp)
  }

  handleTouchMove(evt) {
    if (!this.isScrolling) return

    const p = evt.data.getLocalPosition(this.view)
    this.scroller.handleMove(p.y, evt.data.originalEvent.timeStamp)
  }

  handleTouchEnd(evt) {
    this.isScrolling = false
    this.scroller.handleEnd()
  }

}
