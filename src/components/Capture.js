import * as PIXI from 'pixi.js'
import Base from './Base'
import director from '../managers/director'
import { updateDOMTransform } from '../utils/dom'

export default class Capture extends Base {
  target = undefined
  scale = 2

  onEnable() {
    this.initCaptureElement()
  }

  onDisable() {
    this.img.style.display = 'none'
    director.off('resize', this.updateTransform, this)
  }

  capture({ width, height } = this.node) {
    const { node } = this
    const { scale, img } = this
    const { renderer } = director.app
    const texture = PIXI.RenderTexture.create(width * scale, height * scale)

    const t1 = node.position.clone()
    const t2 = node.scale.clone()
    const t3 = node.pivot.clone()

    node.setTransform(0, 0, scale, scale)
    renderer.render(node, texture)
    node.setTransform(t1.x, t1.y, t2.x, t2.y, 0, 0, 0, t3.x, t3.y)

    img.src = renderer.extract.base64(texture)

    this.updateTransform()
    director.on('resize', this.updateTransform, this)
  }

  updateTransform() {
    const { target, node, img } = this
    console.log(target)
    updateDOMTransform(target || node, img, director.devicePixelRatio)
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
    img.style.opacity = '0.0001'
    this.img = img
  }
}

