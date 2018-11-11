import { Sprite, Texture, Point } from 'pixi.js'
import Node from '../containers/Node'
import director from './director'
import { Deferred } from '../utils/obj'
import { tween, easing, delay } from 'popmotion'

import { LoadingToast } from '../containers/Toast'

const toasts = {
  loading: LoadingToast,
}

class ToastManager {
  backdropCount = 0

  show({ type, title, duration, backdrop }) {
    if (!this.container) this.initContainer()
    if (backdrop) {
      this.showBackdrop()
    }
    const Toast = toasts[type]
    const { width, height } = director.visibleRect
    const node = <Toast x={width/2} y={height/2} title={title} backdrop={true} />
    node.pivot = new Point(node.width / 2, node.height / 2)
    this.container.addChild(node)
    if (duration) {
      delay(duration).start({ complete: () => this.hide(node) })
    }
    return node
  }

  hide(node) {
    this.container.removeChild(node)
    if (node.backdrop) this.hideBackdrop()
    node.destroy({ children: true })
  }

  initContainer() {
    this.container = director.app.stage.addChild(<Node name='toasts' />)
  }

  showBackdrop() {
    this.backdropCount += 1
    if (this.backdrop) return

    const { x, y, width, height } = director.visibleRect
    const backdrop = new Sprite(Texture.WHITE)
    backdrop.width = width
    backdrop.height = height
    backdrop.x = x
    backdrop.y = y
    backdrop.tint = 0x000000
    backdrop.alpha = 0
    this.backdrop = backdrop

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