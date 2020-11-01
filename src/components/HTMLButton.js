import { Sprite } from 'pixi.js'
import { pick } from '../utils/obj'
import Base from './Base'
import Button from './Button'
import director from '../managers/director'
import { updateDOMTransform } from '../utils/dom'

export default class HTMLButton extends Base {
  onEnable() {
    this.initElement()
    this.elem.addEventListener('touchstart', this.handleDown)
    this.elem.addEventListener('click', this.handleClick)
    //let sprite = this.node.children.find(v => v.btnImage)
    //if (!sprite) sprite = this.node.children.find(v => v instanceof Sprite)
    //sprite.alpha = 0
    //// v4
    //this.elem.style.backgroundImage = `url(${sprite.texture.baseTexture.source.src})`
    ////this.elem.style.backgroundImage = `url(${sprite.texture.baseTexture.resource.url})`
    this.updateTransform()
    director.on('resize', this.updateTransform, this)
  }

  onDisable() {
    if (this.elem) {
      this.elem.removeEventListener('touchstart', this.handleDown)
      this.elem.removeEventListener('click', this.handleClick)
      this.elem.removeEventListener('touchcancel', this.handleCancel)
      this.elem.removeEventListener('touchend', this.handleCancel)
    }
    if (this.elem && this.elem !== this.node.elem) {
      this.elem.parentNode.removeChild(this.elem)
    }
    this.elem = null
    director.off('resize', this.updateTransform, this)
  }

  hide() {
    this.elem.style.display = 'none'
  }

  show() {
    this.elem.style.display = 'block'
  }

  handleDown = (evt) => {
    const btn = this.node.getComponent(Button)
    if (btn) btn.handleSwitch('on')

    this.elem.addEventListener('touchcancel', this.handleCancel)
    this.elem.addEventListener('touchend', this.handleCancel)
  }

  handleCancel = (evt) => {
    const btn = this.node.getComponent(Button)
    if (btn) btn.handleSwitch('off')

    this.elem.removeEventListener('touchcancel', this.handleCancel)
    this.elem.removeEventListener('touchend', this.handleCancel)
  }

  handleClick = (evt) => {
    this.node.emit('btnclick')
    if (this.node.onClick) {
      this.node.onClick(evt)
    }
  }

  updateTransform() {
    const { node, elem } = this
    updateDOMTransform(node, elem, director.visibleRect.scale, director.devicePixelRatio)
  }

  initElement(style) {
    let elem = this.node.elem
    if (!elem) {
      elem = document.createElement('button')
      const { elemContainer = director.container } = this.node
      elemContainer.appendChild(elem)
    }

    Object.assign(
      elem.style,
      {
        zIndex: '4',
        border: 'none',
        webkitAppearance: 'none',
        background: 'transparent',
        backgroundSize: 'contain',
        outline: 0,
      },
      style
    )

    this.elem = elem
  }
}
