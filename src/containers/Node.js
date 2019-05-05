import * as PIXI from 'pixi.js'

export default class Node extends PIXI.Container {
  static createChildren = createChildren

  components = []
  constructor() {
    super()
    this.on('added', this.handleAdd, this)
    this.on('removed', this.handleRemove, this)
  }

  addComponent(Component) {
    // TODO check exist
    const c = new Component(this)
    this.components.push(c)
    if (this.inStage) c.onEnable()
    return c
  }

  removeComponent(Component) {
    const c = this.getComponent(Component)
    if (!c) return
    c.onDisable()
    const index = this.components.indexOf(c)
    this.components.splice(index, 1)
    return c
  }

  getComponent(Component) {
    return this.components.find(c => c instanceof Component)
  }

  get inStage() {
    let node = this
    while(node) {
      if (node.isRoot) return true
      node = node.parent
    }
  }

  handleCreate(cr) {
    if (this.inited) {
      throw new Error('this is inited')
    }
    this.inited = true
    const children = this.initChildren(cr)
    if (Array.isArray(children)) {
      if (Array.isArray(children[0])) {
        if (children[0].length > 0) this.addChild(...children[0])
      } else if (children.length > 0) {
        this.addChild(...children)
      }
    } else if (children) {
      this.addChild(children)
    }
    this.onCreate()
  }

  initChildren(children) { return children }

  onCreate() {}

  // FIXME if node's parent is not a Node, handleAdd maybe not trigger
  handleAdd() {
    if (!this.inited) {
      throw new Error('not inited')
    }
    if (!this.inStage) return
    this.isAdded = true

    this.components.forEach((c) => {
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
    this.components.forEach((c) => {
      c.onDisable()
    })
    this.components.length = 0
    this.onRemove()
  }

  onRemove() {}

  findChild(namePath) {
    const names =  namePath.split('/')
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
    if (props.components) props.components = props.components.map(Comp => new Comp(item))
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
