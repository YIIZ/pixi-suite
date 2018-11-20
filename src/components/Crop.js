import { tween } from 'popmotion'
import { Point } from 'pixi.js'
import Base from './Base'
import * as v2 from '../utils/v2'
import director from '../managers/director'

const a45 = Math.PI * 0.25
const a90 = Math.PI * 0.5
const a180 = Math.PI

export default class Crop extends Base {
  target = this.node
  minRect = { x: 0, y: 0, w: 750, h: 750 }

  onEnable() {
    this.viewportRatio = 1 / director.app.stage.scale.x * director.devicePixelRatio
    this.node.interactive = true
    this.node.on('touchstart', this.handleTouchStart, this)
  }

  onDisable() {
    const { target, target: { cropValue } } = this
    if(this.action) this.action.stop()
    if (cropValue) {
      target.rotation = cropValue.rotation
      target.scale.set(cropValue.scale)
      target.position.set(cropValue.x, cropValue.y)
    }
    this.node.off('touchstart', this.handleTouchStart, this)
  }

  // FIXME 多指触控会有两次start, end
  handleTouchStart(evt) {
    console.log('start')
    if(this.action) this.action.stop()

    const { touches } = evt.data.originalEvent
    if (!touches) return
    const [t0, t1 = {}] = touches
    const isMulti = touches.length > 1

    const p0 = { x: t0.pageX, y: t0.pageY }
    const p1 = isMulti ? { x: t1.pageX, y: t1.pageY } : null
    const { target } = this

    this.startPosition = target.position.clone()
    this.startGravity = isMulti ? v2.gravity(p0, p1) : p0

    if (isMulti) {
      this.startScale = target.scale.x
      this.startDis = v2.distance(p0, p1)

      this.startRotation = target.rotation
      this.startVec = v2.subtract(p0, p1)
    }

    this.node.on('touchmove', this.handleTouchMove, this)
    this.node.on('touchend', this.handleTouchEnd, this)
    this.node.on('touchcancel', this.handleTouchEnd, this)
    this.node.on('touchendoutside', this.handleTouchEnd, this)
  }

  handleTouchMove(evt) {
    this.handleScale(evt)
    this.handleMove(evt)
    this.handleRotate(evt)
  }

  handleMove(evt) {
    const { touches } = evt.data.originalEvent
    if (!touches) return
    const [t0, t1] = touches
    const isMulti = touches.length > 1
    const { target } = this

    const p0 = { x: t0.pageX, y: t0.pageY }
    const p1 = isMulti ? { x: t1.pageX, y: t1.pageY } : null
    const gravity = p1 ? v2.gravity(p0, p1) : p0
    let offset = v2.subtract(gravity, this.startGravity)
    offset = v2.scale(offset, this.viewportRatio)
    target.position = v2.add(offset, this.startPosition)
    // FIXME reletive of target
  }

  handleScale(evt) {
    const { touches } = evt.data.originalEvent
    const isMulti = touches && (touches.length > 1)
    if (!isMulti) return

    const { target } = this
    const [t0, t1] = touches

    const p0 = { x: t0.pageX, y: t0.pageY }
    const p1 = { x: t1.pageX, y: t1.pageY }
    const dis = v2.distance(p0, p1)

    const offset = (dis - this.startDis) * 0.005
    const scale = this.startScale + offset
    // FIXME must same scale for x, y
    target.scale.set(scale, scale)
  }

  handleRotate(evt) {
    const { touches } = evt.data.originalEvent
    const isMulti = touches && (touches.length > 1)
    if (!isMulti) return

    const { target } = this
    const [t0, t1] = touches

    const p0 = { x: t0.pageX, y: t0.pageY }
    const p1 = { x: t1.pageX, y: t1.pageY }
    const vec = v2.subtract(p0, p1)
    const angle = v2.singleAngle(this.startVec, vec)
    target.rotation = this.startRotation + angle
  }

  handleAmend() {
    const { target } = this
    const rect = target.getLocalBounds()
    const { w, h } = this.minRect
    const { height, width } = rect
    const { x, y, rotation } = target
    const cropValue = { x, y, rotation: target.rotation, scale: target.scale.x }

    const a = rotation % a90
    cropValue.rotation -= a
    if (a > a45 || a < -a45) {
      cropValue.rotation += Math.sign(a) * a90
    }

    const isLandscape = Math.abs(cropValue.rotation % a180) > 0.01

    const minScale = isLandscape ? Math.max(w/height, h/width) : Math.max(w/width, h/height)
    if (target.scale.x < minScale) {
      cropValue.scale = minScale
    }

    const w1 = cropValue.scale * width
    const h1 = cropValue.scale * height
    if (isLandscape) {
      cropValue.x = Math.min((h1 - w) / 2, Math.abs(x)) * Math.sign(x)
      cropValue.y = Math.min((w1- h) / 2, Math.abs(y)) * Math.sign(y)
    } else {
      cropValue.x = Math.min((w1 - w) / 2, Math.abs(x)) * Math.sign(x)
      cropValue.y = Math.min((h1 - h) / 2, Math.abs(y)) * Math.sign(y)
    }
    target.cropValue = cropValue

    console.log(a / Math.PI, rotation/Math.PI, cropValue.rotation / Math.PI)
    this.action = tween({ from: { x, y, rotation, scale: target.scale.x }, to: cropValue, duration: 300 })
    .start(v => {
      target.scale.set(v.scale)
      target.rotation = v.rotation
      target.position.set(v.x, v.y)
    })
  }

  handleTouchEnd(evt) {
    this.node.off('touchmove', this.handleTouchMove, this)
    this.node.off('touchend', this.handleTouchEnd, this)
    this.node.off('touchcancel', this.handleTouchEnd, this)
    this.node.off('touchendoutside', this.handleTouchEnd, this)

    this.handleAmend()
  }
}

