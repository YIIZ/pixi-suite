import { Point } from 'pixi.js'
import Base from './Base'
import * as v2 from '../utils/v2'
import director from '../managers/director'

export default class Crop extends Base {
  target = this.node
  minScale = 0.1

  onEnable() {
    this.viewportRatio = 1 / director.app.stage.scale.x * director.devicePixelRatio
    this.node.interactive = true
    this.node.on('touchstart', this.handleTouchStart, this)
  }

  onDisable() {
    this.node.off('touchstart', this.handleTouchStart, this)
  }

  handleTouchStart(evt) {
    const { touches } = evt.data.originalEvent
    const [t0, t1 = {}] = touches
    const isMulti = touches.length > 1

    const p0 = { x: t0.pageX, y: t0.pageY }
    const p1 = isMulti ? { x: t1.pageX, y: t1.pageY } : null

    this.startPosition = this.target.position.clone()
    this.startGravity = isMulti ? v2.gravity(p0, p1) : p0
    this.startScale = this.target.scale.x

    if (isMulti) {
      this.startDis = v2.distance(p0, p1)
    }

    this.node.on('touchmove', this.handleTouchMove, this)
    this.node.on('touchend', this.handleTouchEnd, this)
    this.node.on('touchcancel', this.handleTouchEnd, this)
    this.node.on('touchendoutside', this.handleTouchEnd, this)
  }

  handleTouchMove(evt) {
    this.handleMove(evt)
    this.handleScale(evt)
  }

  handleMove(evt) {
    const { touches } = evt.data.originalEvent
    const [t0, t1] = touches
    const isMulti = touches.length > 1

    const p0 = { x: t0.pageX, y: t0.pageY }
    const p1 = isMulti ? { x: t1.pageX, y: t1.pageY } : null
    const gravity = p1 ? v2.gravity(p0, p1) : p0
    let offset = v2.subtract(gravity, this.startGravity)
    offset = v2.scale(offset, this.viewportRatio)
    this.target.position = v2.add(offset, this.startPosition)

    const { x, y } = this.target.position
    this.target.position.x = Math.min((this.target.width - 750) / 2, Math.abs(x)) * Math.sign(x)
    this.target.position.y = Math.min((this.target.height - 1000) / 2, Math.abs(y)) * Math.sign(y)
    //const scale = Math.max(this.startScale + offset.x * 0.001, this.minScale)
    //console.log(offset.x, scale)
    //this.target.scale.set(scale, scale)

    // FIXME reletive of target
  }

  handleScale(evt) {
    const { touches } = evt.data.originalEvent
    const isMulti = touches.length > 1
    if (!isMulti) return

    const [t0, t1] = touches

    const p0 = { x: t0.pageX, y: t0.pageY }
    const p1 = { x: t1.pageX, y: t1.pageY }
    const dis = v2.distance(p0, p1)

    const offset = (dis - this.startDis) * 0.01
    const scale = Math.max(this.startScale + offset, this.minScale)
    // FIXME must same scale for x, y
    this.target.scale.set(scale, scale)
  }

  handleTouchEnd(evt) {
    this.node.off('touchmove', this.handleTouchMove, this)
    this.node.off('touchend', this.handleTouchEnd, this)
    this.node.off('touchcancel', this.handleTouchEnd, this)
    this.node.off('touchendoutside', this.handleTouchEnd, this)
  }
}

