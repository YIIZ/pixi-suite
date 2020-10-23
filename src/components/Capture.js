import { RenderTexture } from 'pixi.js'
import Base from './Base'
import director from '../managers/director'
import { updateDOMTransform } from '../utils/dom'

export default class Capture extends Base {
  positionTarget = undefined
  scale = 1

  onEnable() {
    this.initCaptureElement()
  }

  onDisable() {
    if (this.img) {
      if (this.img.parentNode) this.img.parentNode.removeChild(this.img)
      this.img = null
    }
    director.off('resize', this.updateTransform, this)
  }

  capture({ width, height } = this.node) {
    const { node } = this
    const { scale, img } = this
    const { renderer } = director.app
    const texture = RenderTexture.create(width * scale, height * scale)

    const t1 = node.position.clone()
    const t2 = node.scale.clone()
    const t3 = node.pivot.clone()

    node.setTransform(0, 0, scale, scale)
    renderer.render(node, texture)
    node.setTransform(t1.x, t1.y, t2.x, t2.y, 0, 0, 0, t3.x, t3.y)

    img.src = renderer.extract.canvas(texture).toDataURL(this.format || 'image/jpeg')

    this.updateTransform()
    director.on('resize', this.updateTransform, this)
  }

  captureWx({ width, height } = this.node) {
    const { node } = this
    const { scale, img } = this
    const { renderer } = director.app
    const texture = RenderTexture.create(width * scale, height * scale)

    const t1 = node.position.clone()
    const t2 = node.scale.clone()
    const t3 = node.pivot.clone()

    node.setTransform(0, 0, scale, scale)
    renderer.render(node, texture)
    node.setTransform(t1.x, t1.y, t2.x, t2.y, 0, 0, 0, t3.x, t3.y)

    return new Promise((success, fail) => {
      renderer.extract.canvas(texture).toTempFilePath({ width, height, success, fail })
    })
  }

  updateTransform() {
    const { positionTarget, node, img } = this
    updateDOMTransform(positionTarget || node, img, director.visibleRect.scale, director.devicePixelRatio)
    img.style.display = 'block'
  }

  initCaptureElement() {
    if (this.img) return this.img

    const img = new Image()
    img.className = 'capture'
    img.style.position = 'absolute'
    img.style.top = '0'
    img.style.left = '0'
    img.style.transformOrigin = `0 0 0`
    img.style.webkitTransformOrigin = `0 0 0`
    img.style.display = 'none'
    img.style.zIndex = '3'
    img.style.opacity = '0.0001'

    const { elemContainer = director.container } = this.node
    elemContainer.appendChild(img)
    this.img = img
  }
}
