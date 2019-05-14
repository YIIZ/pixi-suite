import * as PIXI from 'pixi.js'
import { pick } from '../utils/obj'
import Base from './Base'
import director from '../managers/director'
import { updateDOMTransform } from '../utils/dom'

export default class HTMLInput extends Base {
  type = 'text'
  style = {}

  onEnable() {
    if (this.node.input) {
      const args = pick(this.node.input, ['type', 'className', 'style', 'placeholder'])
      Object.assign(this, args)
    }
    const { style, type, className, placeholder } = this
    this.initElement(style)
    this.elem.setAttribute('type', type)
    this.elem.setAttribute('class', className)
    this.elem.setAttribute('placeholder', placeholder)
    this.elem.addEventListener('input', this.handleInput)
    this.elem.addEventListener('change', this.handleChange)
    this.elem.addEventListener('focus', this.handleFocus)
    this.elem.addEventListener('blur', this.handleBlur)
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

  handleChange = (evt) => {
    if (this.node.onChange) {
      this.node.onChange(evt)
    }
  }

  handleInput = (evt) => {
    if (this.node.onInput) {
      this.node.onInput(evt)
    }
  }

  handleFocus = (evt) => {
    if (this.node.onFocus) {
      this.node.onFocus(evt)
    }
  }

  handleBlur = (evt) => {
    if (this.node.onBlur) {
      this.node.onBlur(evt)
    }
  }

  readyonly(v) {
    if (v) {
      this.elem.setAttribute('readonly', '')
    } else {
      this.elem.removeAttribute('readonly')
    }
  }

  updateTransform() {
    const { node, elem } = this
    updateDOMTransform(node, elem, director.devicePixelRatio)
  }

  initElement(style) {
    const elem = document.createElement('input')
    Object.assign(elem.style, {
      opacity: '0.0001',
      zIndex: '4',
      border: 'none',
      webkitAppearance: 'none',
      background: 'transparent',
    }, style)
    director.container.appendChild(elem)
    this.elem = elem
  }
}

