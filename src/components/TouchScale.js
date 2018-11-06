import { Point } from 'pixi.js'
import Base from './Base'
import * as v2 from '../utils/v2'
import director from '../managers/director'

export default class TouchScale extends Base {
  target = this.node
  minScale = 0.1

  getter = () => this.target.scale.x
  setter = (scale) => this.target.scale.set(scale)

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
    const isMulti = touches.length > 1
    this.isDoing = isMulti
    if (!isMulti) return

    const [t0, t1 = {}] = touches

    const p0 = { x: t0.pageX, y: t0.pageY }
    const p1 = { x: t1.pageX, y: t1.pageY }

    this.startScale = this.getter()
    this.startDis = v2.distance(p0, p1)

    this.node.on('touchmove', this.handleTouchMove, this)
    this.node.on('touchend', this.handleTouchEnd, this)
    this.node.on('touchcancel', this.handleTouchEnd, this)
    this.node.on('touchendoutside', this.handleTouchEnd, this)
  }

  handleTouchMove(evt) {
    const { touches } = evt.data.originalEvent
    const isMulti = touches.length > 1
    if (!isMulti) return

    const [t0, t1] = touches

    const p0 = { x: t0.pageX, y: t0.pageY }
    const p1 = { x: t1.pageX, y: t1.pageY }
    const dis = v2.distance(p0, p1)

    const offset = (dis - this.startDis) * 0.01
    const scale = Math.max(this.startScale + offset, this.minScale)
    this.setter(scale)
  }

  handleTouchEnd(evt) {
    this.isDoing = false
    this.node.off('touchmove', this.handleTouchMove, this)
    this.node.off('touchend', this.handleTouchEnd, this)
    this.node.off('touchcancel', this.handleTouchEnd, this)
    this.node.off('touchendoutside', this.handleTouchEnd, this)
  }
}

