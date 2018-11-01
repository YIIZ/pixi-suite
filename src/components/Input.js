import * as PIXI from 'pixi.js'
import { pick } from '../utils/obj'
import Base from './Base'
import director from '../managers/director'
import { updateDOMTransform } from '../utils/dom'

export default class Input extends Base {
  type = 'file'
  style = {}
  onChange = () => false

  onEnable() {
    if (this.node.input) {
      const args = pick(this.node.input, ['type', 'style', 'onChange'])
      Object.assign(this, args)
    }
    const { style, type, onChange } = this
    this.initElement(style)
    this.elem.setAttribute('type', type)
    this.elem.addEventListener('change', onChange)
    this.updateTransform()
    director.on('resize', this.updateTransform, this)
  }

  onDisable() {
    this.elem.parentNode.removeChild(this.elem)
    director.off('resize', this.updateTransform, this)
  }

  updateTransform() {
    const { node, elem } = this
    updateDOMTransform(node, elem, director.devicePixelRatio)
  }

  initElement(style) {
    const elem = document.createElement('input')
    Object.assign(elem.style, {
      opacity: '0.0001',
      zIndex: '3',
      border: 'none',
      webkitAppearance: 'none',
      background: 'transparent',
    }, style)
    director.container.appendChild(elem)
    this.elem = elem
  }
}

