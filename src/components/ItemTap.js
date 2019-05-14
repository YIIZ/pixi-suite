import { Point } from 'pixi.js'
import Base from './Base'
import director from '../managers/director'
import ScrollViewCtrl from './ScrollViewCtrl'

export default class ItemTap extends Base {
  startPoint = new Point(0, 0)
  handleItemTap = () => null


  onEnable() {
    if (this.node.onItemTap) this.handleItemTap = this.node.onItemTap
    this.scrollViewCtrl = this.node.getComponent(ScrollViewCtrl)
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
    this.startPoint.copyFrom(evt.data.global)

    this.node.on('touchmove', this.handleTouchMove, this)
    this.node.on('touchend', this.handleTouchEnd, this)
  }

  handleTouchMove(evt) {
    if (!this.isMove(evt)) return
    this.node.off('touchmove', this.handleTouchMove)
    this.node.off('touchend', this.handleTouchEnd)
  }

  handleTouchEnd(evt) {
    this.handleTap(evt)
    this.node.off('touchmove', this.handleTouchMove)
    this.node.off('touchend', this.handleTouchEnd)
  }

  getChildren() {
    if (this.scrollViewCtrl) {
      return this.scrollViewCtrl.content.children
    }
    return this.node.children
  }

  handleTap(evt) {
    const { renderer } = director.app
    const { interaction } = renderer.plugins

    const children = this.getChildren()
    for (let i = children.length - 1; i >= 0; i--) {
      children[i].interactive = true
      const obj = interaction.hitTest(evt.data.global, children[i])
      if (obj) {
        this.handleItemTap(evt, obj, i)
        return
      }
    }
  }
}

