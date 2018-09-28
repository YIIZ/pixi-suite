import Base from './Base'
import * as v2 from '../utils/v2'

export default class ImageEditorCtrl extends Base {
  body = null
  container = null
  editType = 'move'

  onEnable() {
    window.editor = this
    this.node.visible = false
    this.node.interactive = true
    this.node.on('touchstart', this.handleTouchStart, this)
    this.node.on('touchmove', this.handleTouchMove, this)
    this.node.on('touchend', this.handleTouchEnd, this)
    this.node.on('touchcancel', this.handleTouchEnd, this)
    this.node.on('touchendoutside', this.handleTouchEnd, this)
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
    } else {
      const p = this.node.parent.toLocal(evt.data.global)
      this.node.position.set(this.originPoint.x + p.x - this.startPoint.x, this.originPoint.y + p.y - this.startPoint.y)
    }
  }

  handleTouchEnd(evt) {
    this.touching = false
    this.editorType = 'move'
    this.editorHandle = null
  }

  editItem(item) {
    if (this.current) {
      this.putbackItem()
    }
    this.current = item
    item.interactive = false
    item.off('touchstart', this.handleSelect, this)

    const { node, current, body } = this
    body.addChildAt(item, 0)

    node.visible = true
    node.rotation = item.rotation
    node.position.copy(item.position)
    node.pivot.set(item.width/2, item.height/2)

    const rect = item.getLocalBounds()
    item.rotation = 0
    item.pivot.set(rect.width/2, rect.height/2)
    item.position.copy(node.pivot)
  }

  putbackItem() {
    const { container, node, current: item } = this
    this.current = null

    item.rotation = node.rotation
    item.position.copy(node.position)
    //item.pivot.copy(node.pivot)

    item.interactive = true
    item.on('touchstart', this.handleSelect, this)
    container.addChild(item)
  }

  removeItem() {
    this.body.removeChild(this.current)
    this.current = null
    this.node.visible = false
  }

  handleSelect(evt) {
    const item = evt.currentTarget
    this.editItem(item)
    this.handleTouchStart(evt)
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
  center = new PIXI.Point()
  scale = new PIXI.Point()

  handleTouchStart(evt) {
    super.handleTouchStart(evt)
    const { current, body } = this.editor
    this.scale.copy(current.scale)
    this.center.copy(current.toGlobal(current.pivot))
    const p = evt.data.global
    this.startOffset = v2.distance(this.center, p)
  }

  handleChange(evt) {
    const p = evt.data.global
    const offset = v2.distance(this.center, p)
    const { current, body, node } = this.editor
    current.scale.set(this.scale.x * offset / this.startOffset, this.scale.y * offset / this.startOffset)
    current.position.set(current.width / 2, current.height / 2)
    node.pivot.copy(current.position)
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
