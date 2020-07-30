import { Container } from 'pixi.js'

export default class Node extends Container {
  static createChildren = createChildren

  _components = []
  constructor() {
    super()
    this.on('added', this.handleAdd, this)
    this.on('removed', this.handleRemove, this)
  }

  addComponent(Component) {
    // TODO check exist
    if (this.getComponent(Component)) return
    const c = new Component(this)
    this._components.push(c)
    if (this.inStage) c.onEnable()
    return c
  }

  removeComponent(Component) {
    const { _components } = this
    for (var i = _components.length - 1; i >= 0; i--) {
      const c = _components[i]
      if (c instanceof Component) {
        c.onDisable()
        _components.splice(i, 1)
      }
    }
  }

  getComponent(Component) {
    return this._components.find((c) => c instanceof Component)
  }

  get inStage() {
    let node = this
    while (node) {
      if (node.isRoot) return true
      node = node.parent
    }
  }

  handleCreate(cr) {
    if (this.inited) {
      throw new Error('this is inited')
    }
    this.onInit()
    this.inited = true
    const children = this.initChildren(cr)
    if (Array.isArray(children)) {
      const arr = children.flat(Infinity)
      if (arr.length > 0) this.addChild(...arr)
    } else if (children) {
      this.addChild(children)
    }
    this.onCreate()
  }

  onInit() {}

  initChildren(children) {
    return children
  }

  onCreate() {}

  // FIXME if node's parent is not a Node, handleAdd maybe not trigger
  handleAdd() {
    if (!this.inited) {
      throw new Error('not inited')
    }
    if (!this.inStage) return
    this.isAdded = true

    this._components.forEach((c) => {
      c.onEnable()
    })

    this.childrenHandleAdd()
    this.onAdd()
  }

  onAdd() {}

  childrenHandleAdd() {
    if (!this.children) return
    this.children.forEach((c) => {
      if (!c.handleAdd || c.isAdded) return
      c.handleAdd()
    })
  }

  handleRemove() {
    this.isAdded = false
    this._components.forEach((c) => {
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
    if (props.components) props._components = props.components.map((Comp) => new Comp(item))
    Object.assign(item, props)
    if (props.ref) props.ref(item)
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
