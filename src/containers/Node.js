import * as PIXI from 'pixi.js'

export default class Node extends PIXI.Container {
  static Fragment = Symbol('NODE_FRAGMENT')

  static createChildren(DisplayObject, props, ...children) {
    if (DisplayObject === Node.Fragment) {
      return children
    }

    let displayObject

    if (props) {
      if (props.args) {
        displayObject = new DisplayObject(...props.args)
        delete props.args
      } else {
        displayObject = new DisplayObject()
      }

      if (props.components) {
        props.components = props.components.map(
          Component => new Component(displayObject)
        )
      }
      Object.assign(displayObject, props)
    } else {
      displayObject = new DisplayObject()
    }

    if (displayObject.isSuite) {
      displayObject.handleCreate(children)
    } else if (Array.isArray(children) && children.length > 0) {
      displayObject.addChild(...children)
    }

    return displayObject
  }

  constructor() {
    super()
    // indicate that current displayObject is created by pixi-suite
    this.isSuite = true
    this.initialized = true
    this.components = []
    this.on('added', this.handleAdd, this)
    this.on('removed', this.handleRemove, this)
  }

  initChildren(children) {
    return children
  }

  addComponent(Component) {
    // TODO check exist
    const c = new Component(this)
    this.components.push(c)
    return c
  }

  getComponent(Component) {
    return this.components.find(c => c instanceof Component)
  }

  get inStage() {
    let node = this
    while (node) {
      if (node.isRoot) return true
      node = node.parent
    }

    return false
  }

  handleCreate(children) {
    const $children = this.initChildren(children)
    if (Array.isArray($children) && $children.length > 0) {
      this.addChild(...$children)
    }

    this.onInit()
  }

  onInit() {}

  // FIXME if node's parent is not a Node, handleAdd maybe not trigger
  handleAdd() {
    if (!this.initialized) {
      throw new Error("Current container hasn't been initialized.")
    }
    if (!this.inStage) return
    this.isAdded = true

    this.components.forEach(c => {
      c.onEnable()
    })

    this.childrenHandleAdd()
    this.onAdd()
  }

  onAdd() {}

  childrenHandleAdd() {
    if (!this.children) return
    this.children.forEach(c => {
      if (!c.handleAdd || c.isAdded) return
      c.handleAdd()
    })
  }

  handleRemove() {
    this.isAdded = false
    this.components.forEach(c => {
      c.onDisable()
    })
    this.onRemove()
  }

  onRemove() {}

  findChild(namePath) {
    const names = namePath.split('/')
    let item = null
    let children = this.children
    let name = ''
    while (names.length > 0) {
      name = names.shift()
      item = null
      for (let i = 0; i < children.length; i++) {
        if (name === children[i].name) {
          item = children[i]
          children = children[i].children
          break
        }
      }
      if (!item) return null
    }
    return item
  }
}
