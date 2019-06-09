import { Sprite } from 'pixi.js'
import { pick } from '../utils/obj'
import Base from './Base'
import director from '../managers/director'
import { updateDOMTransform } from '../utils/dom'

export default class HTMLButton extends Base {
  onEnable() {
    this.initElement()
    this.elem.addEventListener('click', this.handleClick)
    let sprite = this.node.children.find(v => v.btnImage)
    if (!sprite) sprite = this.node.children.find(v => v instanceof Sprite)
    sprite.alpha = 0
    // v4
    this.elem.style.backgroundImage = `url(${sprite.texture.baseTexture.source.src})`
    //this.elem.style.backgroundImage = `url(${sprite.texture.baseTexture.resource.url})`
    this.updateTransform()
    director.on('resize', this.updateTransform, this)
  }

  onDisable() {
    if (this.elem) {
      this.elem.parentNode.removeChild(this.elem)
      this.elem = null
    }
    director.off('resize', this.updateTransform, this)
  }

  hide() {
    this.elem.style.display = 'none'
  }

  show() {
    this.elem.style.display = 'block'
  }

  handleClick = (evt) => {
    if (this.node.onClick) {
      this.node.onClick(evt)
    }
  }

  updateTransform() {
    const { node, elem } = this
    updateDOMTransform(node, elem, director.visibleRect.scale, director.devicePixelRatio)
  }

  initElement(style) {
    const elem = document.createElement('div')
    Object.assign(elem.style, {
      display: 'none',
      zIndex: '4',
      border: 'none',
      webkitAppearance: 'none',
      background: 'transparent',
      backgroundSize: 'contain',
    }, style)
    director.container.appendChild(elem)
    this.elem = elem
  }
}

