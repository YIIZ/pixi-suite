import Base from './Base'

export default class Layout extends Base {
  top = 0
  right = 0
  bottom = 0
  left = 0

  spaceX = 15
  spaceY = 15

  width = 0
  height = 0

  onEnable() {
    if (this.node.layout) {
      Object.assign(this, this.node.layout)
    }
    this.update()
  }

  update() {
    // TODO custom direction
    const children = this.node.children
    const { spaceX, spaceY, top, right, bottom, left, width: w, height: h } = this
    const cursor = new PIXI.Point(left, top)
    let vCursor = null
    //let hCursor = null
    children.forEach(c => {
      c.x = cursor.x
      c.y = cursor.y

      const { width, height } = c
      if (!vCursor) vCursor = new PIXI.Point(cursor.x, cursor.y + height + spaceY)

      cursor.x += width + spaceX
      if (cursor.x + width > w) {
        cursor.set(vCursor.x, vCursor.y)
        vCursor.y += height + spaceY
      }
    })
  }
}
