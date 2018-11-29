import { Sprite, Texture, Point } from 'pixi.js'
import director from './director'
import { Deferred } from '../utils/obj'
import Node from '../containers/Node'
import { tween, easing } from 'popmotion'

class ModalManager {
  animationTime = 300
  modals = []
  background = null
  backgroundCount = 0
  backgroundAlpha = 0.6
  // !! scale alpha will be reset
  show(node, option = {}) {
    if (!this.container) this.initContainer()
    const { backdrop = true } = option
    if (backdrop) this.showBackground(node, backdrop)

    this.modals.push(node)
    node.scale.set(0)
    node.alpha = 0
    this.container.addChild(node)

    node.emit('modal.show')
    node.modalAction = tween({
      from: 0,
      to: 1,
      duration: this.animationTime,
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

    return node
  }

  hide(node) {
    const index = this.modals.findIndex(v => v === node)
    if (index <0) return
    if (node.modalAction) return

    node.emit('modal.hide')
    node.modalAction = tween({
      from: { y: node.y, alpha: node.alpha },
      to: { y: node.y - 200, alpha: 0 },
      duration: this.animationTime,
      ease: easing.easeOut,
    })
    .start({
      update: v => {
        node.y = v.y
        node.alpha = v.alpha
      },
      complete: v => {
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
    })
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

export default new ModalManager()
