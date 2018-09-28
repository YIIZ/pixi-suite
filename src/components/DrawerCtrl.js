import * as PIXI from 'pixi.js'
import Base from './Base'
import StatusSwitch from './StatusSwitch'
import { tween, physics } from 'popmotion'

const { Sprite, Texture: { WHITE } } = PIXI

// FIXME Widget bug on resize
export default class DrawerCtrl extends Base {
  folded = false
  direction = 'left2right' // TODO support other direction

  set handler(v) {
    this._handler = v
    if (!v) {
      this._handler.off('tap', this.handleClick, this)
      return
    }
    this._handler.interactive = true
    this._handler.on('tap', this.handleClick, this)
    this.switcher = this._handler.getComponent(StatusSwitch)
  }
  get handler() {
    return this._handler
  }

  set content(v) {
    this._content = v
    if (!v) return
    if (!v.mask) {
      const m = new Sprite(WHITE)
      m.height = v.height
      m.width = v.width
      m.x = v.x
      m.x = v.y
      v.mask = m
      // FIXME set position relative of this.node
      this.node.addChild(m)
    }
    this.orginOffset = this.content.x
  }
  get content() {
    return this._content
  }

  onDisable() {
    this._handler.off('tap', this.handleClick, this)
    this._handler = null
    this._content = null
  }

  handleClick() {
    this.folded ? this.unfold() : this.fold()
  }

  fold() {
    if (this.folded) return
    this.folded = true
    this.switcher && this.switcher.switch('on')

    this.action = tween({
      from: this.orginOffset,
      // FIXME better calc position of to
      to: this._content.x + this._content.width - this.handler.width,
      duration: 500
    })
    .start(this.updateView)
  }

  unfold() {
    if (!this.folded) return
    this.folded = false
    this.switcher && this.switcher.switch('off')

    this.action = tween({
      from: this._content.x,
      to: this.orginOffset,
      duration: 500
    })
    .start(this.updateView)
  }

  updateView = (offset) => {
    this._content.x = offset
  }
}

