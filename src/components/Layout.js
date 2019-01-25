import Base from './Base'

export default class Layout extends Base {
  top = 0
  right = 0
  bottom = 0
  left = 0
  align = 'left'

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
    let yCursor = top
    let xCursor = left
    let newLineIndex = 0
    const breaks = []
    children.forEach((c, index) => {
      c.x = cursor.x
      c.y = cursor.y

      const { width, height } = c
      if (c.y + height > yCursor) {
        yCursor = c.y + height
      }

      cursor.x += width + spaceX

      xCursor = c.x + width
      if (xCursor > w || index === children.length - 1) {
        cursor.set(left, yCursor + spaceY)
        breaks.push({ from: newLineIndex, to: index + 1, left, right: xCursor })
        newLineIndex = index + 1
      }
    })

    this.updateAlign(breaks)
  }

  // FIXME child里如果有layout的话，需要child layout update完再次update
  updateAlign(breaks) {
    const { align, node: { children } } = this
    if (align === 'left') return

    const maxRight = breaks.reduce((m, v) => v.right > m ? v.right : m, 0)

    breaks.forEach(b => {
      const { from, to, left, right } = b
      const offset = align === 'center' ? (maxRight - right) / 2 : maxRight - right
      children.slice(from, to).forEach(item => item.x += offset)
    })
  }
}
