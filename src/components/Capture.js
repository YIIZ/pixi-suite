import * as PIXI from 'pixi.js'
import Base from './Base'
import director from '../managers/director'
import { updateDOMTransform } from '../utils/dom'

export default class Capture extends Base {
  scale = 2

  onEnable() {
    this.initCaptureElement()
    director.on('resize', this.updateTransform, this)
  }

  onDisable() {
    this.img.style.display = 'none'
    director.off('resize', this.updateTransform, this)
  }

  capture() {
    const { width, height } = this.node
    const { scale, img } = this
    const { renderer } = director.app
    const texture = PIXI.RenderTexture.create(width * scale, height * scale)

    const t1 = this.node.position.clone()
    const t2 = this.node.scale.clone()
    const t3 = this.node.pivot.clone()

    this.node.setTransform(0, 0, scale, scale)
    renderer.render(this.node, texture)
    this.node.setTransform(t1.x, t1.y, t2.x, t2.y, 0, 0, 0, t3.x, t3.y)

    img.src = renderer.extract.base64(texture)

    this.updateTransform()
  }

  updateTransform() {
    const { node, img } = this
    updateDOMTransform(node, img, director.devicePixelRatio)
    img.style.display = 'block'
  }

  initCaptureElement() {
    let img = document.querySelector('.capture')
    if (!img) {
      img = new Image()
      director.container.appendChild(img)
    }
    img.className = 'capture'
    img.style.position = 'absolute'
    img.style.top = '0'
    img.style.left = '0'
    img.style.transformOrigin = `0 0 0`
    img.style.webkitTransformOrigin = `0 0 0`
    img.style.display = 'none'
    img.style.zIndex = '9'
    this.img = img
  }
}

