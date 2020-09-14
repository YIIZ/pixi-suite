import { pick } from '../utils/obj'
import Base from './Base'
import director from '../managers/director'
import { updateDOMTransform } from '../utils/dom'
import { isIOS } from '../utils/os.js'

export default class HTMLSelect extends Base {
  style = {}

  onEnable() {
    if (this.node.selectOption) {
      const args = pick(this.node.selectOption, ['className', 'style'])
      Object.assign(this, args)
    }
    const { style, className } = this
    if (this.node.elem) {
      this.elem = this.node.elem
    } else {
      this.initElement(style)
    }
    if (className) this.elem.setAttribute('class', className)
    this.elem.addEventListener('change', this.handleChange)
    this.elem.addEventListener('input', this.handleInput)
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
    this.options = null
    director.off('resize', this.updateTransform, this)
  }

  handleChange = (evt) => {
    if (this.node.onChange) {
      const value = this.elem.value
      this.node.onChange(
        evt,
        value,
        this.options.find((v) => v.id == value)
      )
    }
  }

  handleInput = (evt) => {
    if (this.node.onInput) {
      const value = this.elem.value
      this.node.onInput(
        evt,
        value,
        this.options.find((v) => v.id == value)
      )
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

  setOptions(data) {
    this.options = data
    this.elem.innerHTML = data.map((v) => `<option value="${v.id}">${v.name}</option>`).join('')
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
    updateDOMTransform(node, elem, director.visibleRect.scale, director.devicePixelRatio)
  }

  initElement(style) {
    const elem = document.createElement('select')
    Object.assign(
      elem.style,
      {
        opacity: '0.0001',
        zIndex: '4',
        border: 'none',
        webkitAppearance: 'none',
        background: 'transparent',
      },
      style
    )
    const { elemContainer = director.container } = this.node
    elemContainer.appendChild(elem)
    this.elem = elem
  }
}
