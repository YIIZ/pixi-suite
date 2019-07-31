import { Point, UPDATE_PRIORITY } from 'pixi.js'
import { tween } from 'popmotion'
import director from '../managers/director'

import Base from './Base'
import * as v2 from '../utils/v2'

const pointZero = { x: 0, y: 0 }

const { renderer } = director.app
const { interaction } = renderer.plugins

export default class Joystick extends Base {
  onEnable() {
    this.point = this.node.findChild('point')
    this.pane = this.node.findChild('pane')
    this.pane.interactive = true
    // FIXME 范围的计算
    //this.r = this.pane.width / 2 - this.point.width / 4
    this.r = this.pane.width / 2 - this.point.width
    this.pane.on('touchstart', this.handleDown, this)
  }

  onDisable() {
    director.ticker.remove(this.postControl, this)
    this.pane.off('touchstart', this.handleDown, this)
    this.pane = null
    this.point = null
  }

  handleDown(evt) {
    if (this.backAction) this.backAction.stop()
    this.isControling = true

    this.identifier = evt.data.identifier
    this.localPos = new Point()
    this.globalPos = new Point()
    this.pos = {}

    director.ticker.add(this.postControl, this, UPDATE_PRIORITY.INTERACTION)
    this.pane.on('touchmove', this.handleControl, this)
    this.pane.on('touchcancel', this.handleCancel, this)
    this.pane.on('touchendoutside', this.handleCancel, this)
    this.pane.on('touchend', this.handleCancel, this)

    this.handleControl(evt)
  }

  handleControl(evt) {
    const touches = evt.data.originalEvent.touches

    this.globalPos.copyFrom(evt.data.global)
    if (this.identifier !== evt.data.identifier) {
      const touch = touches.find(t => t.identifier === identifier)
      interaction.mapPositionToPoint(this.globalPos, touch.clientX, touch.clientY)
    }

    if (!this.isControling) return
    const pos = evt.data.getLocalPosition(this.node, this.localPos, this.globalPos)
    const r = this.r

    let dis = v2.distance(pos, pointZero)
    if (dis > r) {
      const rate = r / dis
      pos.set(pos.x * rate, pos.y * rate)
      dis = r
    }

    this.updatePosition(pos)
    this.pos.x =  pos.x / r
    this.pos.y = pos.y / r
    this.pos.dis = dis / r
  }

  postControl() {
    if (!this.isControling || !this.pos) return
    if (this.node.onControl) {
      this.node.onControl(this.pos)
    } else {
      const { x } = this.pos
      if (x > 0) this.node.input.right = true
      if (x < 0) this.node.input.left = true
    }
  }

  updatePosition = (p) => {
    if (this.node.direction === 'x') {
      this.point.position.x = p.x
    } else {
      this.point.position.copyFrom(p)
    }
  }

  handleCancel(evt) {
    this.isControling = false
    this.point.dis = null
    const from = { x: this.point.x, y: this.point.y }
    const to = { x: 0, y: 0 }
    this.backAction = tween({ from, to, duration: 400 })
    .start(this.updatePosition)

    director.ticker.remove(this.postControl, this)
    this.pane.off('touchmove', this.handleControl, this)
    this.pane.off('touchcancel', this.handleCancel, this)
    this.pane.off('touchendoutside', this.handleCancel, this)
    this.pane.off('touchend', this.handleClick, this)

    if (this.node.onLoose) this.node.onLoose()
  }

}

