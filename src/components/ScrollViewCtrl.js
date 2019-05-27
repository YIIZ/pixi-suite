import * as PIXI from 'pixi.js'
import Base from './Base'
import Layout from './Layout'
import ScrollBarCtrl from './ScrollBarCtrl.js'

const { Texture: { WHITE } } = PIXI

export default class ScrollViewCtrl extends Base {
  content = null
  view = null
  direction = 'vertical' // horizontal
  freezing = false

  onEnable() {
    if (!this.view) this.view = this.node.children.find(n => n.scrollPart === 'view')
    if (!this.scroller) this.scroller = this.node.children.find(n => n.scrollPart === 'bar').getComponent(ScrollBarCtrl)
    if (!this.content) this.content = this.view.children.find(n => n.scrollPart === 'content')

    this.view.interactive = true
    this.view.on('touchstart', this.handleTouchStart, this)

    const m = new PIXI.Sprite(WHITE)
    this.view.mask = m
    this.view.addChildAt(m, 0)

    const { viewSize, layout } = this.node
    if (layout) this.setLayout(layout.w, layout.h)
    if (viewSize) this.setSize(viewSize.w, viewSize.h)
  }

  onDisable() {
    this.view.off('touchstart', this.handleTouchStart, this)
    this.view.removeChild(this.view.mask)
    this.view.mask = null
  }

  setLayout(options) {
    const layout = this.content.getComponent(Layout)
    if (!layout) return
    Object.assign(layout, options)
    layout.update()
  }

  get paddingX() {
    const layout = this.content.getComponent(Layout)
    if (!layout) return 0
    return layout.left + layout.right
  }

  get paddingY() {
    const layout = this.content.getComponent(Layout)
    if (!layout) return 0
    return layout.top + layout.bottom
  }

  setSize(w, h) {
    this.w = w
    this.h = h
    this.view.mask.width = w
    this.view.mask.height = h

    // TODO only support one direction
    if (this.direction === 'vertical') {
      this.scroller.updateParams({
        len: this.content.height + this.paddingY,
        visibleLen: h,
        setter: v => this.content.y = v,
        getter: () => this.content.y,
      })
      this.scroller.node.x = w - this.scroller.node.width
    } else {
      this.scroller.updateParams({
        // FIXME width 数值不对, 需要在加某些值
        len: this.content.width + this.paddingY,
        visibleLen: w,
        setter: v => this.content.x = v,
        getter: () => this.content.x,
      })
      this.scroller.node.y = h + this.scroller.node.width + 5
    }
  }

  handleTouchStart = (evt) => {
    if (this.freezing) return
    this.isScrolling = true

    const p = evt.data.getLocalPosition(this.view)
    this.scroller.handleStart(this.direction === 'vertical' ? p.y : p.x, evt.data.originalEvent.timeStamp)

    this.view.on('touchmove', this.handleTouchMove, this)
    this.view.on('touchend', this.handleTouchEnd, this)
    this.view.on('touchcancel', this.handleTouchEnd, this)
    this.view.on('touchendoutside', this.handleTouchEnd, this)
  }

  handleTouchMove = (evt) => {
    if (this.freezing) return
    if (!this.isScrolling) return

    const p = evt.data.getLocalPosition(this.view)
    this.scroller.handleMove(this.direction === 'vertical' ? p.y : p.x, evt.data.originalEvent.timeStamp)
  }

  handleTouchEnd = (evt) => {
    if (this.freezing) return
    if (!this.isScrolling) return
    this.isScrolling = false
    this.scroller.handleEnd()

    this.view.off('touchmove', this.handleTouchMove, this)
    this.view.off('touchend', this.handleTouchEnd, this)
    this.view.off('touchcancel', this.handleTouchEnd, this)
    this.view.off('touchendoutside', this.handleTouchEnd, this)
  }

  freeze() {
    this.freezing = true
    this.view.off('touchmove', this.handleTouchMove, this)
    this.view.off('touchend', this.handleTouchEnd, this)
    this.view.off('touchcancel', this.handleTouchEnd, this)
    this.view.off('touchendoutside', this.handleTouchEnd, this)
  }
  unfreeze() {
    this.freezing = false
  }
}
