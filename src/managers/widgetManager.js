import director from './director'

export const AlignFlag = {
  TOP: 1<<0,
  RIGHT: 1<<1,
  BOTTOM: 1<<2,
  LEFT: 1<<3,
}

AlignFlag.TOP_LEFT = AlignFlag.TOP | AlignFlag.LEFT
AlignFlag.TOP_RIGHT = AlignFlag.TOP | AlignFlag.RIGHT
AlignFlag.BOTTOM_LEFT = AlignFlag.BOTTOM | AlignFlag.LEFT
AlignFlag.BOTTOM_RIGHT = AlignFlag.BOTTOM | AlignFlag.RIGHT

export const AlignMode = {
  ONCE: 1<<0,
  RESIZE: 1<<1,
  AWAYS: 1<<2,
}

class WidgetManager {
  widgets = []
  get defaultTarget() {
    return director.viewAdapter.visibleRect
  }

  constructor() {
    director.on('resize', this.handleReize, this)
    director.ticker.add(this.handleTick, this)
  }

  add(w) {
    this.widgets.push(w)
  }

  remove(w) {
    const index = this.widgets.findIndex(v => w === v)
    if (index < 0) return
    this.widgets.splice(index, 1)
  }

  handleReize() {
    this.widgets
    .filter(v => v.alignMode & AlignMode.RESIZE)
    .forEach(v => {
      v.update()
    })
  }

  handleTick() {
    const ts = this.widgets
    .filter(v => v.alignMode & AlignMode.AWAYS)
    .forEach(v => {
      v.update()
    })
  }
}

const widgetManager = new WidgetManager()
export default widgetManager
