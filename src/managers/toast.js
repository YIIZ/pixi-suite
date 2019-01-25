import { Sprite, Texture, Point } from 'pixi.js'
import Node from '../containers/Node'
import director from './director'
import { Deferred } from '../utils/obj'
import { tween, easing, delay } from 'popmotion'

import toasts from '../containers/Toast'

class ToastManager {
  backdropCount = 0
  offset = { x: 0, y: 0 }

  show({ type, title, duration, backdrop }) {
    if (!this.container) this.initContainer()
    const Toast = toasts[type]
    const { x, y, width, height } = director.visibleRect
    const node = <Toast x={x + width/2 + this.offset.x} y={y + height/2 + this.offset.y} title={title} backdrop={true} />
    node.pivot = new Point(node.width / 2, node.height / 2)
    if (backdrop) {
      this.showBackdrop(node, backdrop)
    }
    this.container.addChild(node)
    node.deferred = new Deferred()
    if (duration) {
      delay(duration).start({ complete: () => this.hide(node) })
    }
    return node
  }

  hide(node) {
    const removed = this.container.removeChild(node)
    if (!removed) return
    if (node.backdrop) this.hideBackdrop()
    if (node.deferred) node.deferred.resolve()
    node.destroy({ children: true })
  }

  initContainer() {
    this.container = director.app.stage.addChild(<Node name='toasts' />)
  }

  showBackdrop(node, backdropType) {
    this.backdropCount += 1

    if (!this.backdrop) {
      const { x, y, width, height } = director.visibleRect
      const backdrop = new Sprite(Texture.WHITE)
      backdrop.width = width
      backdrop.height = height
      backdrop.x = x
      backdrop.y = y
      backdrop.tint = 0x000000
      backdrop.alpha = 0

      backdrop.interactive = true
      backdrop.on('tap', (evt) => {
        evt.stopPropagation()
      })

      this.container.addChildAt(backdrop, 0)
      tween({
        from: 0,
        to: 0.5,
        duration: 300,
      })
      .start((v) => backdrop.alpha = v)
      this.backdrop = backdrop
    }

    if (backdropType !== 'static') {
      this.backdrop.on('tap', (evt) => {
        this.hide(node)
      })
    }
  }

  hideBackdrop() {
    this.backdropCount -= 1
    if (!this.backdrop || this.backdropCount > 0) return

    const { backdrop } = this
    this.backdrop = null

    tween({
      from: backdrop.alpha,
      to: 0,
      duration: 200,
    })
    .start({
      update: v => {
        backdrop.alpha = v
      },
      complete: () => {
        backdrop.destroy()
      }
    })
  }
}

export default new ToastManager()
