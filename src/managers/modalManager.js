import { Sprite, Texture, Point } from 'pixi.js'
import director from './director'
import { Deferred } from '../utils/obj'
import Node from '../containers/Node'
import { tween, easing } from 'popmotion'

class ModalManager {
  static animationTime = 300
  modals = []
  background = null
  backgroundCount = 0
  backgroundAlpha = 0.6
  // !! scale alpha will be reset
  show(node, option = {}) {
    if (!this.container) this.initContainer()
    const { backdrop = true, animate = 'scaleInUpOut' } = option
    if (backdrop) this.showBackground(node, backdrop)

    this.modals.push(node)
    this.container.addChild(node)

    node.interactive = true
    node.emit('modal.show')
    node.animate = typeof animate === 'string' ? animateTypes[animate] : animate

    if (node.animate && node.animate.show) {
      node.animate.show(node)
    }

    return node
  }

  hide(node, option = {}) {
    const index = this.modals.findIndex(v => v === node)
    if (index <0) return
    if (node.modalAction) return

    const { animate } = option
    node.emit('modal.hide')

    const handleComplete = () => {
      const index = this.modals.findIndex(v => v === node)
      if (index < 0) {
        throw new Error('has removed')
      }
      this.modals.splice(index, 1)

      node.modalAction = null
      node.parent.removeChild(node)
      this.hideBackground()
      node.emit('modal.hidden')
      node.destroy({ children: true })
    }

    if (node.animate && node.animate.hide) {
      node.animate.hide(node, handleComplete)
    } else {
      handleComplete()
    }
  }

  initContainer() {
    this.container = director.app.stage.addChild(<Node name='modals' />)
  }

  showBackground(node, backdrop) {
    this.backgroundCount += 1
    if (this.background) return

    const { x, y, width, height } = director.visibleRect
    const background = new Sprite(Texture.WHITE)
    background.width = width
    background.height = height
    background.x = x
    background.y = y
    background.tint = 0x000000
    background.alpha = 0
    background.interactive = true
    background.on('tap', (evt) => {
      evt.stopPropagation()
    })
    this.background = background

    if (backdrop !== 'static') {
      background.on('tap', (evt) => {
        node.emit('modal.close')
        this.hide(node)
      })
    }
    this.container.addChildAt(background, 0)

    tween({
      from: 0,
      to: this.backgroundAlpha,
      duration: 300,
    })
    .start((v) => background.alpha = v)
  }

  hideBackground() {
    this.backgroundCount -= 1
    if (this.backgroundCount > 0 || !this.background) return

    const { background } = this
    this.background = null

    tween({
      from: background.alpha,
      to: 0,
      duration: 200,
    })
    .start({
      update: v => {
        background.alpha = v
      },
      complete: () => {
        this.container.removeChild(background)
        background.destroy()
      }
    })

  }
}

const animateTypes = {
  bottomUpDown: {
    show: (node) => {
      const { height, y } = node
      node.alpha = 0
      node.y = y + height
      node.modalAction = tween({
        from: 0,
        to: 1,
        duration: ModalManager.animationTime,
      })
      .start({
        update: v => {
          node.y = y + (1 - v) * height
          node.alpha = v
        },
        complete: v => {
          node.modalAction = null
          node.emit('modal.shown')
        }
      })
    },
    hide: (node, complete) => {
      node.modalAction = tween({
        from: { y: node.y, alpha: node.alpha },
        to: { y: node.y + 200, alpha: 0 },
        duration: ModalManager.animationTime,
        ease: easing.easeOut,
      })
      .start({
        update: v => {
          node.y = v.y
          node.alpha = v.alpha
        },
        complete,
      })
    }
  },
  scaleInUpOut: {
    show: (node) => {
      node.scale.set(0)
      node.alpha = 0
      node.modalAction = tween({
        from: 0,
        to: 1,
        duration: ModalManager.animationTime,
      })
      .start({
        update: v => {
          node.scale.set(v)
          node.alpha = v
        },
        complete: v => {
          node.modalAction = null
          node.emit('modal.shown')
        }
      })
    },
    hide: (node, complete) => {
      node.modalAction = tween({
        from: { y: node.y, alpha: node.alpha },
        to: { y: node.y - 200, alpha: 0 },
        duration: ModalManager.animationTime,
        ease: easing.easeOut,
      })
      .start({
        update: v => {
          node.y = v.y
          node.alpha = v.alpha
        },
        complete,
      })
    }
  },
}


export default new ModalManager()
