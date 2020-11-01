import { Sprite, Texture, Point } from 'pixi.js'
import EventEmitter from 'eventemitter3'
import director from './director'
import { Deferred } from '../utils/obj'
import Node from '../containers/Node'
import { tween, easing } from 'popmotion'

const defaultOption = { backdrop: true, animate: 'scaleInUpOut' }

class ModalManager extends EventEmitter {
  static animationTime = 300
  modals = []
  background = null
  backgroundAlpha = 0.6
  // !! scale alpha will be reset
  show(node, option) {
    if (!this.container) this.initContainer()
    option = Object.assign({}, defaultOption, option)
    node._modalOption = option
    const { backdrop, animate } = option
    if (backdrop) this.showBackground(node, backdrop)

    this.modals.push(node)
    this.container.addChild(node)

    node.interactive = true
    node.emit('modal.show')
    this.emit('modal.show', node)
    node.animate = node.animate || (typeof animate === 'string' ? animateTypes[animate] : animate)

    const handleComplete = () => {
      node.modalAction = null
      if (node.onShow) node.onShow()
      if (node.onActive) node.onActive()
      const underNode = this.modals[this.modals.length - 2]
      if (underNode && underNode.onUnactive) underNode.onUnactive()
      node.emit('modal.shown')
      this.emit('modal.shown', node)
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
    const isTopModal = index === this.modals.length - 1
    this.modals.splice(index, 1)

    node.emit('modal.hide')
    this.emit('modal.hide', node)

    const handleComplete = () => {
      if (isTopModal) {
        const underNode = this.modals[this.modals.length - 1]
        if (underNode && underNode.onActive) underNode.onActive()
      }
      this.sinkBackground()

      node.emit('modal.hidden')
      this.emit('modal.hidden', node)
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
      this.emit('modal.hide', node)

      modals.splice(i, 1)
      node.emit('modal.hidden')
      this.emit('modal.hidden', node)
      node.destroy({ children: true })
    }
    this.removeBackground()
  }

  initContainer() {
    this.container = director.app.stage.addChild(<Node name="modals" />)
    director.on('resize', this.handleResize)
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

  sinkBackground() {
    const { background, modals, container } = this
    if (!background) return

    if (modals.length === 0) return this.removeBackground()

    let node
    for (let i = modals.length - 1; i >= 0; i--) {
      if (!modals[i]._modalOption.backdrop) continue
      node = modals[i]
      break
    }

    if (!node) return this.removeBackground()

    const bIndex = container.getChildIndex(background)
    const index = container.getChildIndex(node)

    if (bIndex === index - 1) {
      return
    } else if (bIndex > index) {
      container.setChildIndex(background, index)
    } else {
      container.setChildIndex(background, index - 1)
    }
  }

  removeBackground() {
    const { background } = this
    if (!background) return
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
        background.destroy()
      },
    })
  }

  handleResize = () => {
    const { background } = this
    if (!background) return
    const { x, y, width, height, offsetX, offsetY } = director.visibleRect
    background.width = width
    background.height = height
    background.x = x
    background.y = y
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
      const scaleTo = node.scale.x
      const alphaTo = node.alpha
      node.scale.set(0)
      node.alpha = 0
      node.modalAction = tween({
        from: { scale: 0, alpha: 0 },
        to: { scale: scaleTo, alpha: alphaTo },
        duration: ModalManager.animationTime,
      }).start({
        update: (v) => {
          node.scale.set(v.scale)
          node.alpha = v.alpha
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
