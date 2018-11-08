import Base from './Base'
import * as v2 from '../utils/v2'
import TouchScale from './TouchScale'

export default class ImageEditorCtrl extends Base {
  body = null
  container = null
  editType = 'move'
  padding = 50

  onEnable() {
    window.editor = this
    this.node.visible = false
    this.node.interactive = true
    this.node.on('touchstart', this.handleTouchStart, this)
    this.node.on('touchmove', this.handleTouchMove, this)
    this.node.on('touchend', this.handleTouchEnd, this)
    this.node.on('touchcancel', this.handleTouchEnd, this)
    this.node.on('touchendoutside', this.handleTouchEnd, this)

    this.touchScale = this.node.getComponent(TouchScale)
    if (this.touchScale) {
      this.touchScale.getter = () => this.current?.scale.x
      this.touchScale.setter = this.handleMultiTouchScale
    }

    //this.container.interactive = true
    //this.container.on('tap', this.putbackItem, this)
  }

  onDisable() {
    this.node.off('touchstart', this.handleTouchStart, this)
    this.node.off('touchmove', this.handleTouchMove, this)
    this.node.off('touchend', this.handleTouchEnd, this)
    this.node.off('touchcancel', this.handleTouchEnd, this)
    this.node.off('touchendoutside', this.handleTouchEnd, this)
    //this.container.off('tap', this.putbackItem, this)
  }

  handleTouchStart(evt) {
    this.touching = true
    this.originPoint = this.node.position.clone()
    this.startPoint = this.node.parent.toLocal(evt.data.global)
  }

  handleTouchMove(evt) {
    if (!this.touching) return
    if (this.editorHandle) {
      this.editorHandle(evt)
      this.updateBorder()
    } else if (this.touchScale && this.touchScale.isDoing) {
      // null
    } else {
      const p = this.node.parent.toLocal(evt.data.global)
      this.node.position.set(this.originPoint.x + p.x - this.startPoint.x, this.originPoint.y + p.y - this.startPoint.y)
    }
    this.node.emit('editor.change', evt)
  }

  handleTouchEnd(evt) {
    this.touching = false
    this.editorType = 'move'
    this.editorHandle = null
  }

  handleMultiTouchScale = (scale) => {
    if (this.editorHandle) return
    EditorScale.edit(this.current, scale, this.node)
    this.updateBorder()
  }

  updateBorder() {
    const { current } = this
    const rect = current.getLocalBounds()
    const height = current.scale.y * rect.height
    const width = current.scale.x * rect.width;
    this.border.width = Math.abs(width + this.padding)
    this.border.height = Math.abs(height + this.padding)
  }

  editItem(item) {
    if (this.current) {
      this.putbackItem()
    }
    this.current = item

    const { node, current, body } = this
    body.addChildAt(item, 0)

    node.visible = true
    node.rotation = item.rotation
    node.position.copy(item.position)

    const rect = item.getLocalBounds()
    const height = item.scale.y * rect.height
    const width = item.scale.x * rect.width;
    item.rotation = 0
    item.pivot.set(rect.width / 2, rect.height / 2)
    item.position.set(Math.abs(width) / 2, height / 2)
    node.pivot.copy(item.position)

    this.updateBorder()
  }

  putbackItem() {
    const { container, node, current: item } = this
    this.current = null
    if (!item) return

    item.rotation = node.rotation
    item.position.copy(node.position)

    container.addChild(item)
    node.visible = false
  }

  removeItem() {
    this.body.removeChild(this.current)
    this.current = null
    this.node.visible = false
  }
}

export class EditorCmd extends Base {
  init(editor) {
    this.node.interactive = true
    this.node.on('touchstart', this.handleTouchStart, this)
    this.editor = editor
    if (this.handleChange) {
      this.handleChange = this.handleChange.bind(this)
    }
  }

  handleTouchStart() {
    this.editor.editorType = this.node.name
    this.editor.editorHandle = this.handleChange
  }
}

export class EditorRemove extends EditorCmd {
  handleTouchStart() {
    super.handleTouchStart()
    this.editor.removeItem()
    this.editor.handleTouchEnd()
  }
}

export class EditorRotate extends EditorCmd {
  center = new PIXI.Point()
  startVec = new PIXI.Point()
  currentVec = new PIXI.Point()

  handleTouchStart(evt) {
    super.handleTouchStart(evt)
    const { current, body } = this.editor
    const center = this.editor.body.toGlobal(current.position)
    this.center.copy(center)

    const p = evt.data.global
    this.startVec.set(p.x - center.x, p.y - center.y)
    this.startRotation = this.editor.node.rotation
  }

  handleChange(evt) {
    const p = evt.data.global
    this.currentVec.set(p.x - this.center.x, p.y - this.center.y)
    this.editor.node.rotation = this.startRotation + v2.singleAngle(this.startVec, this.currentVec)
  }
}

export class EditorScale extends EditorCmd {
  static edit(item, newScale, node) {
    const rect = item.getLocalBounds()
    const oldScale = item.scale.y
    const height = newScale * rect.height
    const width = newScale * rect.width;
    if (Math.abs(width) < 60 && newScale < oldScale) return
    if (Math.abs(height) < 60 && newScale < oldScale) return
    item.scale.set(newScale * Math.sign(item.scale.x), newScale)
    item.position.set(Math.abs(width) / 2, height / 2)
    item.pivot.set(rect.width / 2, rect.height / 2)
    node.pivot.copy(item.position)
  }

  center = new PIXI.Point()
  scale = new PIXI.Point()

  handleTouchStart(evt) {
    super.handleTouchStart(evt)
    const { current } = this.editor
    this.center.copy(current.toGlobal(current.pivot))
    const p = evt.data.global
    this.startOffset = v2.distance(this.center, p)
    this.startScale = current.scale.y
  }

  handleChange(evt) {
    const { current, node } = this.editor
    const p = evt.data.global
    const offset = v2.distance(this.center, p)

    const rect = current.getLocalBounds()

    const newScale = this.startScale * offset / this.startOffset
    EditorScale.edit(current, newScale, node)
  }

}

export class EditorFlip extends EditorCmd {
  handleTouchStart() {
    super.handleTouchStart()
    const scale = this.editor.current.scale
    this.editor.current.scale.set(-scale.x, scale.y)
    this.editor.handleTouchEnd()
  }
}
