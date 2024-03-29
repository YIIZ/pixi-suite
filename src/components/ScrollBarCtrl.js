import { Sprite, Texture } from 'pixi.js'
import Base from './Base'
import { tween } from '@teambun/motion'
import { Deferred } from '../utils/obj.js'

export default class ScrollBarCtrl extends Base {
  bg = null
  bar = null
  direction = 'vertical'

  maxOverstep = 100

  onEnable() {}

  onDisable() {
    if (this.action) this.action.stop()
  }

  updateParams({ visibleLen, len, setter, getter }) {
    this.scrollable = visibleLen < len

    this.visibleLen = visibleLen
    this.len = len
    this.maxOffset = this.maxOverstep
    this.minOffset = this.visibleLen - this.len - this.maxOverstep
    this.setter = (v) => {
      setter(v)
      this.updateBar()
    }
    this.getter = getter
    Object.defineProperty(this, 'offset', {
      enumerable: true,
      configurable: true,
      set: this.setter,
      get: this.getter,
    })
    this.updateView()
  }

  // TODO where to update view ?
  updateView() {
    const { visibleLen, len, scrollable } = this
    this.bg.height = visibleLen
    this.bar.height = (visibleLen / len) * visibleLen

    if (!this.node.mask) {
      const m = new Sprite(Texture.WHITE)
      this.node.mask = m
      this.node.addChild(m)
    }
    this.node.visible = this.scrollable
    this.node.mask.width = this.bg.width
    this.node.mask.height = this.bg.height
    this.relativeOffset = -this.len / this.visibleLen
    this.offset = Math.min(0, Math.max(this.minOffset, this.offset))
    this.bar.y = Math.max(0, Math.min(this.minOffset / this.relativeOffset, this.bar.y))
  }

  updateBar() {
    if (!this.scrollable) return
    this.bar.y = this.offset / this.relativeOffset
  }

  handleStart(v, time) {
    if (!this.scrollable) return
    if (this.action) this.action.stop()

    this.orignOffset = this.offset
    this.start = v
    this.last = v
    this.lastTime = time

    this.node.emit('scrollstart')
  }

  handleMove(v, time) {
    if (!this.scrollable) return

    this.velocity = (v - this.last) / (time - this.lastTime)
    this.lastTime = time
    this.last = v

    const offset = (this.offset = this.orignOffset + v - this.start)
    this.offset = offset
    if (offset > this.maxOffset) {
      this.offset = this.maxOffset
    } else if (offset < this.minOffset) {
      this.offset = this.minOffset
    }
    this.node.emit('scrollmove', this.offset)
  }

  async handleEnd(v, time) {
    if (!this.scrollable) return
    this.orignOffset = 0
    this.start = 0
    this.last = 0
    this.lastTime = 0

    await this.handleMomentum()
    await this.handleOverstep()

    this.node.emit('scrollend', this.offset)
  }

  // 弹性
  handleOverstep() {
    const ov = this.overstep
    if (ov !== 0) {
      return this.autoScroll(ov > 0 ? 0 : this.visibleLen - this.len)
    }
  }

  // 冲力
  handleMomentum() {
    if (Math.abs(this.velocity) < 0.3) return
    const deferred = new Deferred()

    const velocity = this.velocity * 10
    this.velocity = 0
    const action = tween({
      from: velocity,
      to: 0,
      duration: Math.abs(velocity) * 20,
    })
      .onUpdate((v) => {
        v = this.offset + v
        if (v < this.maxOffset && v > this.minOffset) {
          this.setter(v)
        } else {
          action?.stop()
          deferred.resolve()
        }
      })
      .onComplete(deferred.resolve)
      .start()

    this.action = action
    return deferred.promise
  }

  autoScroll(to) {
    const deferred = new Deferred()

    const dis = this.offset - to
    const duration = Math.abs(dis * 0.8) + 200

    this.action = tween({
      from: this.offset,
      to,
      duration,
    })
      .onUpdate(this.setter)
      .onComplete(() => {
        deferred.resolve()
      })
      .start()

    return deferred.promise
  }

  scrollTo(offset, isAuto) {
    if (isAuto) {
      this.autoScroll(offset)
    } else {
      this.setter(offset)
    }
  }

  scrollPercent(percent, isAuto) {
    const { visibleLen, len, scrollable } = this
    const offset = -1 * (len - visibleLen) * percent
    this.scrollTo(offset, isAuto)
  }

  reset() {
    if (this.action) this.action.stop()
    this.setter(0)
  }

  get overstep() {
    const { offset, len, visibleLen } = this
    if (offset > 0) return offset
    if (offset < visibleLen - len) {
      return offset - (visibleLen - len)
    }
    return 0
  }
}
