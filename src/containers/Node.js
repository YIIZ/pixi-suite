import * as PIXI from 'pixi.js'

export default class Node extends PIXI.Container {
  static createChildren = createChildren

  constructor() {
    super()
    this.components = []
    this.on('added', this.handleAdd, this)
    this.on('removed', this.handleRemove, this)
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

  handleCreate(cr) {
    if (this.initialized) {
      throw new Error('Current container has been initialized.')
    }
    this.initialized = true
    const children = this.initChildren(cr)
    if (Array.isArray(children) && children.length > 0) {
      this.addChild(...children)
    } else if (children) {
      this.addChild(children)
    }

    this.onCreate()
  }

  initChildren(children) {
    return children
  }

  onCreate() {}

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

function createChildren(Item, props, ...children) {
  if (!Item) return children

  let item
  if (props) {
    item = props.args ? new Item(...props.args) : new Item()
    delete props.args
    if (props.components) {
      props.components = props.components.map(Comp => new Comp(item))
    }

    Object.assign(item, props)
  } else {
    item = new Item()
  }

  if (item.handleCreate) {
    item.handleCreate(children)
  } else if (children && children.length > 0) {
    item.addChild(...children)
  }

  return item
}
