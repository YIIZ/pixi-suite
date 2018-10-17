import Base from './Base'
import { tween, physics } from 'popmotion'


export default class ScrollBarCtrl extends Base {
  bg = null
  bar = null
  direction = 'vertical'

  maxOverstep = 100

  onEnable() {
  }

  onDisable() {
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
    if (this.direction !== 'vertical') {
      this.node.rotation =  Math.PI * -0.5
    }
    this.bg.height = visibleLen
    this.bar.height = visibleLen / len * visibleLen

    if (!this.node.mask) {
      const m = new PIXI.Sprite(PIXI.Texture.WHITE)
      this.node.mask = m
      this.node.addChild(m)
    }
    this.node.visible = this.scrollable
    this.node.mask.width = this.bg.width
    this.node.mask.height = this.bg.height
    this.relativeOffset = (this.minOffset - this.visibleLen) / this.visibleLen
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
  }

  handleMove(v, time) {
    if (!this.scrollable) return

    this.velocity = (v - this.last) / (time - this.lastTime)
    this.lastTime = time
    this.last = v

    const offset = this.offset = this.orignOffset + v - this.start
    this.offset = offset
    if (offset > this.maxOffset) {
      this.offset = this.maxOffset
    } else if (offset < this.minOffset) {
      this.offset = this.minOffset
    }
  }

  handleEnd(v, time) {
    if (!this.scrollable) return
    this.orignOffset = 0
    this.start = 0
    this.last = 0
    this.lastTime = 0

    this.handleOverstep()
    this.handleMomentum()
  }

  // 弹性
  handleOverstep() {
    const ov = this.overstep
    if (ov !== 0) {
      this.autoScroll(ov > 0 ? 0 : this.visibleLen - this.len)
    }
  }

  // 冲力
  handleMomentum() {
    if (Math.abs(this.velocity) < 0.3) return

    const v = this.velocity
    this.velocity = 0
    this.action = physics({
      from: this.offset,
      velocity: v * 2000,
      friction: 0.6
    })
    .while(v => v < this.maxOffset && v > this.minOffset)
    .start({
      update: this.setter,
      complete: () => this.handleOverstep(),
    })
  }

  autoScroll(to) {
    this.action = tween({
      from: this.offset,
      to,
      duration: 500
    })
    .start(this.setter)
  }

  scrollTo(percent, isAuto) {
    const { visibleLen, len, scrollable } = this
    const offset = -1 * (len - visibleLen) * percent
    if (isAuto) {
      this.autoScroll(offset)
    } else{
      this.setter(offset)
    }
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
