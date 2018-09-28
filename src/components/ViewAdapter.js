import Base from './Base'

// only for Scene!!
export default class ViewAdapter extends Base {
  name = 'ViewAdapter'

  width = 1500
  height = 750

  fix = 'height'

  mode = 'none' // TODO cover contain ?

  visiableRect = {}

  orientation = 'landscape' // auto, portrait, landscape

  // call by director
  updateView = (director) => {
    const rect = this.handleOrientation(director)
    if (this.fix === 'width') this.handleFixWidth(director, rect)
    if (this.fix === 'height') this.handleFixHeight(director, rect)
  }

  handleOrientation(director) {
    const { width, height } = this
    const { width: w, height: h, stage } = director.app

    stage.pivot.set(width / 2, height / 2)
    stage.x = w / 2
    stage.y = h / 2

    if (this.orientation === 'landscape' && w < h
      || this.orientation === 'portrait' && w > h) {
      console.log('rotation')
      stage.rotation = Math.PI * 2 * 0.25
      return { w: h, h: w }
    } else {
      stage.rotation = 0
    }

    return { w, h }
  }

  handleFixWidth(director, { w, h }) {
    console.log('fixWidth')
    const { stage } = director.app
    const { width, height } = this
    const scale = w / width
    stage.scale.set(scale, scale)

    const innerY = - (height - h / scale) / 2
    this.visiableRect = Object.assign(this.visiableRect, {
      x: 0,
      y: -innerY,
      width: this.width,
      height: this.height + 2 * innerY,
    })
  }

  handleFixHeight(director, { w, h }) {
    console.log('fixHeight')
    const { stage } = director.app
    const { width, height } = this
    const scale = h / height
    stage.scale.set(scale, scale)

    const innerX = - (width - w / scale) / 2
    this.visiableRect = Object.assign(this.visiableRect, {
      x: -innerX,
      y: 0,
      width: this.width + 2 * innerX,
      height: this.height,
    })
  }
}
