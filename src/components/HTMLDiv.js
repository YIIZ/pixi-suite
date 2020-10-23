import { Sprite } from 'pixi.js'
import { pick } from '../utils/obj'
import Base from './Base'
import Button from './Button'
import director from '../managers/director'
import { updateDOMTransform } from '../utils/dom'

export default class HTMLDiv extends Base {
  onEnable() {
    this.initElement(this.node.htmlStyle)
    this.elem.addEventListener('click', this.handleClick)
    this.updateTransform()
    director.on('resize', this.updateTransform, this)
  }

  onDisable() {
    if (this.elem) {
      this.elem.removeEventListener('click', this.handleClick)
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

  updateTransform() {
    const { node, elem } = this
    updateDOMTransform(node, elem, director.visibleRect.scale, director.devicePixelRatio)
  }

  handleClick = (evt) => {
    if (this.node.onClick) {
      this.node.onClick(evt)
    }
  }

  initElement(style) {
    let elem = this.node.elem
    if (!elem) {
      elem = document.createElement('div')
      const { elemContainer = director.container } = this.node
      elemContainer.appendChild(elem)
    }

    Object.assign(
      elem.style,
      {
        zIndex: '3',
        border: 'none',
        webkitAppearance: 'none',
        background: 'transparent',
        backgroundSize: 'contain',
        outline: 0,
      },
      style
    )

    this.elem = elem
    const sp = this.node.children[0]
    if (sp && sp instanceof Sprite && sp.texture) {
      this.elem.style.backgroundImage = `url(${sp.texture.baseTexture.resource.source.src})`
    }
  }
}
