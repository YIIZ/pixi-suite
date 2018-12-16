import * as PIXI from 'pixi.js'
import { tween } from 'popmotion'

import Base from './Base'
import * as v2 from '../utils/v2'

const ticker = PIXI.ticker.shared
const pointZero = { x: 0, y: 0 }

export default class Joystick extends Base {
  onEnable() {
    this.point = this.node.findChild('point')
    this.pane = this.node.findChild('pane')
    this.pane.interactive = true
    // FIXME 范围的计算
    //this.r = this.pane.width / 2 - this.point.width / 4
    this.r = this.pane.width / 2 - this.point.width / 2
    this.pane.on('touchstart', this.handleDown, this)
  }

  onDisable() {
    ticker.remove(this.postControl, this)
    this.pane.off('touchstart', this.handleDown, this)
    this.pane = null
    this.point = null
  }

  handleDown() {
    if (this.backAction) this.backAction.stop()
    this.isControling = true

    ticker.add(this.postControl, this)
    this.pane.on('touchmove', this.handleControl, this)
    this.pane.on('touchcancel', this.handleCancel, this)
    this.pane.on('touchendoutside', this.handleCancel, this)
    this.pane.on('touchend', this.handleCancel, this)
  }

  handleControl(evt) {
    if (!this.isControling) return
    const pos = evt.data.getLocalPosition(this.node)

    const dis = v2.distance(pos, pointZero)
    if (dis > this.r) {
      const rate = this.r / dis
      this.point.position.set(pos.x * rate, pos.y * rate)
      this.point.dis = this.r
      return
    }

    this.point.dis = dis
    this.point.position.copy(pos)
  }

  postControl() {
    if (!this.isControling || !this.node.onControl || !this.point.dis) return
    this.node.onControl({ x: this.point.x / this.r, y: this.point.y / this.r, dis: this.point.dis / this.r })
  }

  handleCancel(evt) {
    this.isControling = false
    this.point.dis = null
    const from = { x: this.point.x, y: this.point.y }
    const to = { x: 0, y: 0 }
    this.backAction = tween({ from, to, duration: 400 })
    .start(v => this.point.position.copy(v))

    ticker.remove(this.postControl, this)
    this.pane.off('touchmove', this.handleControl, this)
    this.pane.off('touchcancel', this.handleCancel, this)
    this.pane.off('touchendoutside', this.handleCancel, this)
    this.pane.off('touchend', this.handleClick, this)

    if (this.node.onLoose) this.node.onLoose()
  }

}

