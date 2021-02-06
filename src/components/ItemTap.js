import { Point } from 'pixi.js'
import Base from './Base'
import director from '../managers/director'
import ScrollViewCtrl from './ScrollViewCtrl'

export default class ItemTap extends Base {
  startPoint = new Point(0, 0)

  onEnable() {
    this.scrollViewCtrl = this.node.getComponent(ScrollViewCtrl)
    this.node.interactive = true
    this.node.on('touchstart', this.handleTouchStart, this)
    this.reduplicative = this.node.reduplicative
  }

  onDisable() {
    this.node.off('touchstart', this.handleTouchStart, this)
  }

  // 部分Android touchmove 在手指不动时也会触发touchmove
  isMove = (evt) => {
    const { global } = evt.data
    const dx = Math.abs(global.x - this.startPoint.x)
    const dy = Math.abs(global.y - this.startPoint.y)
    return dx > 5 || dy > 5
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
      if (children[i].disable) continue
      children[i].interactive = true
      const obj = interaction.hitTest(evt.data.global, children[i])
      if (obj) {
        this.handleItemTap(evt, children[i], i)
        return
      }
    }
  }

  tapItem(i) {
    const children = this.getChildren()
    this.handleItemTap(null, children[i], i)
  }

  changeItem(i) {
    const { current } = this
    const children = this.getChildren()
    const item = children[i]

    if (item === current) return

    if (item.select) {
      if (this.node.multiple) {
        item.selected ? item.unselect() : item.select()
      } else {
        if (current) current.unselect()
        item.select()
      }
    }

    this.current = item
  }

  // item  need select and unselect func
  handleItemTap = (evt, item, index) => {
    if (!item || item.disable) return

    this.changeItem(index)

    if (this.node.onItemTap) this.node.onItemTap(evt, item, index)
  }
}
