import { Sprite, Texture, Point } from 'pixi.js'
import director from './director'
import { Deferred } from '../utils/obj'
import { tween } from 'popmotion'

class ModalManager {
  modals = []
  background = null
  guard = null
  // !! scale alpha will be reset
  show(node) {
    if (this.guard) {
      throw new Error('another modal action is in progress')
    }
    this.guard = new Deferred()
    this.showBackground()

    this.modals.push(node)
    node.scale.set(0)
    node.alpha = 0
    director.scene.addChild(node)

    node.interactive = true
    node.on('tap', evt => {
      console.log('node tap')
      evt.stopPropagation()
    })

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
      }
    })

    return () => {
      this.hide(node)
    }
  }

  hide(node) {
    if (this.guard) {
      throw new Error('another modal action is in progress')
    }
    const index = this.modals.findIndex(v => v === node)
    if (index <0) return

    this.guard = new Deferred()

    tween({
      from: { y: node.y, alpha: node.alpha },
      to: { y: node.y - 200, alpha: 0 },
      duration: 300,
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
        this.hideBackground()
        this.guard.resolve()
        this.guard = null
        node.destroy({ children: true })
      }
    })
  }

  showBackground() {
    if (this.background) return

    const { width, height } = director.scene
    const background = new Sprite(Texture.WHITE)
    background.width = width
    background.height = height
    background.tint = 0x000000
    background.alpha = 0
    this.background = background

    background.interactive = true
    background.on('tap', (evt) => {
      console.log('background tap')
      this.hide(this.modals[this.modals.length - 1])
    })
    director.scene.addChild(background)

    tween({
      from: 0,
      to: 0.5,
      duration: 300,
    })
    .start((v) => background.alpha = v)
  }

  hideBackground() {
    if (this.modals.length > 0) return

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
