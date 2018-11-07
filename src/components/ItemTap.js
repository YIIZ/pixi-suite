import { Point } from 'pixi.js'
import Base from './Base'
import director from '../managers/director'

const { renderer } = director.app
const { interaction } = renderer.plugins

export default class ItemTap extends Base {
  startPoint = new Point(0, 0)
  handleItemTap = () => null


  onEnable() {
    if (this.node.onItemTap) this.handleItemTap = this.node.onItemTap
    this.node.interactive = true
    this.node.on('touchstart', this.handleTouchStart, this)
  }

  onDisable() {
    this.node.off('touchstart', this.handleTouchStart, this)
  }

  // 部分Android touchmove 在手指不动时也会触发touchmove
  isMove = (evt) => {
    const { global } = evt.data
    return global.x !== this.startPoint.x || global.y !== this.startPoint.y
  }

  handleTouchStart(evt) {
    this.startPoint.copy(evt.data.global)

    this.node.once('touchmove', this.handleTouchMove, this)
    this.node.once('touchend', this.handleTouchEnd, this)
  }

  handleTouchMove(evt) {
    if (!this.isMove(evt)) return
    this.node.off('touchmove', this.handleTouchMove)
    this.node.off('touchend', this.handleTouchEnd)
  }

  handleTouchEnd(evt) {
    this.node.off('touchmove', this.handleTouchMove)
    this.node.off('touchend', this.handleTouchEnd)
    if (!this.isMove(evt)) this.handleTap(evt)
  }

  handleTap(evt) {
    const { children } = this.node
    const obj = interaction.hitTest(evt.data.global, this.node)
    for (let i = children.length - 1; i >= 0; i--) {
      children[i].interactive = true
      const obj = interaction.hitTest(evt.data.global, children[i])
      if (obj) {
        this.handleItemTap(evt, obj)
        return
      }
    }
  }
}

