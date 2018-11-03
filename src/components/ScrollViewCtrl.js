import * as PIXI from 'pixi.js'
import Base from './Base'
import Layout from './Layout'

const { Texture: { WHITE } } = PIXI

export default class ScrollViewCtrl extends Base {
  content = null
  view = null
  direction = 'vertical' // horizontal

  onEnable() {
    this.view.interactive = true
    this.view.on('touchstart', this.handleTouchStart, this)

    const m = new PIXI.Sprite(WHITE)
    this.view.mask = m
    this.view.addChild(m)
  }

  onDisable() {
    this.view.off('touchstart', this.handleTouchStart, this)
    this.view.removeChild(this.view.mask)
    this.view.mask = null
  }

  setContentSize(w, h) {
    const layout = this.content.getComponent(Layout)
    layout.width = w
    layout.height = h
    layout.update()
  }

  setSize(w, h) {
    this.view.mask.width = w
    this.view.mask.height = h

    // TODO only support one direction
    if (this.direction === 'vertical') {
      this.scroller.updateParams({
        len: this.content.height,
        visibleLen: h,
        setter: v => this.content.y = v,
        getter: () => this.content.y,
      })
      this.scroller.node.x = w - this.scroller.node.width
    } else {
      this.scroller.updateParams({
        // FIXME width 数值不对, 需要在加某些值
        len: this.content.width + 60,
        visibleLen: w,
        setter: v => this.content.x = v,
        getter: () => this.content.x,
      })
      this.scroller.node.y = h + this.scroller.node.width + 5
    }
  }

  handleTouchStart = (evt) => {
    this.isScrolling = true

    const p = evt.data.getLocalPosition(this.view)
    this.scroller.handleStart(this.direction === 'vertical' ? p.y : p.x, evt.data.originalEvent.timeStamp)

    this.view.on('touchmove', this.handleTouchMove, this)
    this.view.on('touchend', this.handleTouchEnd, this)
    this.view.on('touchcancel', this.handleTouchEnd, this)
    this.view.on('touchendoutside', this.handleTouchEnd, this)
  }

  handleTouchMove = (evt) => {
    if (!this.isScrolling) return

    const p = evt.data.getLocalPosition(this.view)
    this.scroller.handleMove(this.direction === 'vertical' ? p.y : p.x, evt.data.originalEvent.timeStamp)
  }

  handleTouchEnd = (evt) => {
    this.isScrolling = false
    this.scroller.handleEnd()

    this.view.off('touchmove', this.handleTouchMove, this)
    this.view.off('touchend', this.handleTouchEnd, this)
    this.view.off('touchcancel', this.handleTouchEnd, this)
    this.view.off('touchendoutside', this.handleTouchEnd, this)
  }
}
