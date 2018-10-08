import director from './director'

export const AlignFlag = {
  TOP: 1<<0,
  RIGHT: 1<<1,
  BOTTOM: 1<<2,
  LEFT: 1<<3,
}

export const AlignMode = {
  ONCE: 1<<0,
  RESIZE: 1<<1,
  AWAYS: 1<<2,
}

class WidgetManager {
  widgets = []
  get defaultTarget() {
    return this.director.viewAdapter.visiableRect
  }

  constructor() {
    this.director = director
    director.on('resize', this.handleReize, this)
    PIXI.ticker.shared.add(this.handleTick, this)
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
