import { Sprite, Texture, Point } from 'pixi.js'
import director from './director'
import { Deferred } from '../utils/obj'
import { tween, easing } from 'popmotion'

class ModalManager {
  modals = []
  background = null
  guard = null
  // !! scale alpha will be reset
  show(node, option = {}) {
    if (this.guard) {
      throw new Error('another modal action is in progress')
    }
    this.guard = new Deferred()
    const { backdrop = true } = option
    if (backdrop) this.showBackground(backdrop)

    this.modals.push(node)
    node.scale.set(0)
    node.alpha = 0
    director.app.stage.addChild(node)

    node.interactive = true
    node.on('tap', evt => {
      evt.stopPropagation()
    })

    node.emit('modal.show')
    tween({
      from: 0,
      to: 1,
      duration: 500,
    })
    .start({
      update: v => {
        node.scale.set(v)
        node.alpha = v
      },
      complete: v => {
        this.guard.resolve()
        this.guard = null
        node.emit('modal.shown')
      }
    })

    return node
  }

  hide(node) {
    const index = this.modals.findIndex(v => v === node)
    if (index <0) return

    node.emit('modal.hide')
    tween({
      from: { y: node.y, alpha: node.alpha },
      to: { y: node.y - 200, alpha: 0 },
      duration: 300,
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
        node.parent.removeChild(node)
        this.hideBackground()
        node.emit('modal.hidden')
        node.destroy({ children: true })
      }
    })
  }

  showBackground(backdrop) {
    if (this.background) return

    const { x, y, width, height } = director.visibleRect
    const background = new Sprite(Texture.WHITE)
    background.width = width
    background.height = height
    background.x = x
    background.y = y
    background.tint = 0x000000
    background.alpha = 0
    this.background = background

    if (backdrop && backdrop !== 'static') {
      background.interactive = true
      background.on('tap', (evt) => {
        const node = this.modals[this.modals.length - 1]
        node.emit('modal.close')
        this.hide(node)
      })
    }
    director.app.stage.addChild(background)

    tween({
      from: 0,
      to: 0.5,
      duration: 300,
    })
    .start((v) => background.alpha = v)
  }

  hideBackground() {
    if (this.modals.length > 0) return
    if (!this.background) return

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
        background.destroy()
      }
    })

  }
}

export default new ModalManager()
