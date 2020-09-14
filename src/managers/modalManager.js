import { Sprite, Texture, Point } from 'pixi.js'
import director from './director'
import { Deferred } from '../utils/obj'
import Node from '../containers/Node'
import { tween, easing } from 'popmotion'

class ModalManager {
  static animationTime = 300
  modals = []
  background = null
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
    node.animate = node.animate || (typeof animate === 'string' ? animateTypes[animate] : animate)

    const handleComplete = () => {
      node.modalAction = null
      if (node.onShow) node.onShow()
      if (node.onActive) node.onActive()
      const underNode = this.modals[this.modals.length - 2]
      if (underNode && underNode.onUnactive) underNode.onUnactive()
      node.emit('modal.shown')
    }

    if (node.animate && node.animate.show) {
      node.animate.show(node, handleComplete)
    } else {
      handleComplete()
    }

    return node
  }

  hide(node) {
    const index = this.modals.findIndex((v) => v === node)
    if (index < 0) return
    if (node.modalAction) {
      node.modalAction.stop()
      node.modalAction = null
    }

    node.emit('modal.hide')

    const handleComplete = () => {
      const index = this.modals.findIndex((v) => v === node)
      if (index < 0) {
        throw new Error('has removed')
      }
      const underNode = this.modals[this.modals.length - 2]
      if (underNode && underNode.onActive) underNode.onActive()

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

  hideAll() {
    const { modals } = this
    for (let i = modals.length - 1; i >= 0; i--) {
      const node = modals[i]
      if (node.modalAction) {
        node.modalAction.stop()
        node.modalAction = null
      }
      node.emit('modal.hide')

      const underNode = this.modals[i - 1]
      if (underNode && underNode.onActive) underNode.onActive()
      modals.splice(i, 1)

      node.modalAction = null
      node.parent.removeChild(node)
      this.hideBackground()
      node.emit('modal.hidden')
      node.destroy({ children: true })
    }
  }

  initContainer() {
    this.container = director.app.stage.addChild(<Node name="modals" />)
  }

  showBackground(node, arg) {
    let { background } = this

    const config = { alpha: this.backgroundAlpha, static: false }
    if (typeof arg === 'string') {
      config[arg] = true
    } else if (typeof arg === 'object') {
      Object.assign(config, arg)
    }

    if (!background) {
      const { x, y, width, height, offsetX, offsetY } = director.visibleRect
      background = new Sprite(Texture.WHITE)
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
      this.container.addChild(background)
    } else {
      this.container.setChildIndex(background, this.container.children.length - 1)
    }

    if (!config.static) {
      background.on('tap', (evt) => {
        if (this.modals[this.modals.length - 1] !== node) return
        node.emit('modal.close')
        this.hide(node)
      })
    }

    tween({
      from: Math.max(0, config.alpha),
      to: Math.max(config.alpha, config.alpha),
      duration: 300,
    }).start((v) => (background.alpha = v))
  }

  hideBackground() {
    const { background, modals } = this
    if (!background) return

    modals.length === 0 ? this.removeBackground() : this.sinkBackground()
  }

  removeBackground() {
    const { background } = this
    this.background = null

    tween({
      from: background.alpha,
      to: 0,
      duration: 200,
    }).start({
      update: (v) => {
        background.alpha = v
      },
      complete: () => {
        this.container.removeChild(background)
        background.destroy()
      },
    })
  }

  sinkBackground() {
    const { background, container } = this
    const index = container.getChildIndex(background)
    if (index < 0) return

    const len = container.children.length
    if (index === len - 1) {
      container.setChildIndex(background, Math.max(0, len - 2))
    }
  }
}

const animateTypes = {
  bottomUpDown: {
    show: (node, complete) => {
      const { height, y } = node
      node.alpha = 0
      node.y = y + height
      node.modalAction = tween({
        from: 0,
        to: 1,
        duration: ModalManager.animationTime,
      }).start({
        update: (v) => {
          node.y = y + (1 - v) * height
          node.alpha = v
        },
        complete,
      })
    },
    hide: (node, complete) => {
      const { height } = node
      node.modalAction = tween({
        from: { y: node.y, alpha: node.alpha },
        to: { y: node.y + height, alpha: 0 },
        duration: ModalManager.animationTime,
        ease: easing.easeOut,
      }).start({
        update: (v) => {
          node.y = v.y
          node.alpha = v.alpha
        },
        complete,
      })
    },
  },
  rightUpDown: {
    show: (node, complete) => {
      const { width, x } = node
      node.alpha = 0
      node.x = x + width
      node.modalAction = tween({
        from: 0,
        to: 1,
        duration: ModalManager.animationTime,
      }).start({
        update: (v) => {
          node.x = x + (1 - v) * width
          node.alpha = v
        },
        complete,
      })
    },
    hide: (node, complete) => {
      const { width } = node
      node.modalAction = tween({
        from: { x: node.x, alpha: node.alpha },
        to: { x: node.x + width, alpha: 0 },
        duration: ModalManager.animationTime,
        ease: easing.easeOut,
      }).start({
        update: (v) => {
          node.x = v.x
          node.alpha = v.alpha
        },
        complete,
      })
    },
  },
  scaleInUpOut: {
    show: (node, complete) => {
      node.scale.set(0)
      node.alpha = 0
      node.modalAction = tween({
        from: 0,
        to: 1,
        duration: ModalManager.animationTime,
      }).start({
        update: (v) => {
          node.scale.set(v)
          node.alpha = v
        },
        complete,
      })
    },
    hide: (node, complete) => {
      node.modalAction = tween({
        from: { y: node.y, alpha: node.alpha },
        to: { y: node.y - 200, alpha: 0 },
        duration: ModalManager.animationTime,
        ease: easing.easeOut,
      }).start({
        update: (v) => {
          node.y = v.y
          node.alpha = v.alpha
        },
        complete,
      })
    },
  },
  fadeInOut: {
    show: (node, complete) => {
      node.alpha = 0
      node.modalAction = tween({
        from: 0,
        to: 1,
        duration: ModalManager.animationTime,
      }).start({
        update: (v) => {
          node.alpha = v
        },
        complete,
      })
    },
    hide: (node, complete) => {
      node.modalAction = tween({
        from: node.alpha,
        to: 0,
        duration: ModalManager.animationTime,
        ease: easing.easeOut,
      }).start({
        update: (v) => {
          node.alpha = v
        },
        complete,
      })
    },
  },
}

ModalManager.animateTypes = animateTypes
export default new ModalManager()
