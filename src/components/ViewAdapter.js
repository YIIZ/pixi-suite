import Base from './Base'
import { pick } from '../utils/obj'
import director from '../managers/director'

// only for Scene!!
export default class ViewAdapter extends Base {
  static Portrait = { width: 750, height: 1500, fix: 'width', mode: 'none', orientation: 'portrait' }
  static Landscape = { width: 1500, height: 750, fix: 'height', mode: 'none', orientation: 'landscape' }

  width = 750
  height = 1500
  fix = 'width'
  offsetX = 0
  offsetY = 0
  orientation = 'portrait' // auto, portrait, landscape
  mode = 'none' // TODO cover contain ?

  visibleRect = {}

  enable() {
    if (this.node.view) {
      const args = pick(this.node.view, ['width', 'height', 'offsetX', 'offsetY', 'fix', 'mode', 'orientation'])
      Object.assign(this, args)
    }
    this.updateView()
  }

  // call by director
  updateView = () => {
    if (this.node.getView) {
      const args = pick(this.node.getView(), ['width', 'height', 'offsetX', 'offsetY', 'fix', 'mode', 'orientation'])
      Object.assign(this, args)
    }
    const rect = this.handleOrientation(director)
    //if (this.fix === 'auto') this.handleFixAuto(director, rect)
    if (this.fix === 'width') this.handleFixWidth(director, rect)
    if (this.fix === 'height') this.handleFixHeight(director, rect)
  }

  handleOrientation(director) {
    const { width, height, offsetX, offsetY } = this
    const { width: w, height: h, stage } = director.app

    stage.pivot.set(width / 2, height / 2)
    stage.x = w / 2
    stage.y = h / 2

    if (this.orientation === 'landscape' && w < h
      || this.orientation === 'portrait' && w > h) {
      stage.rotation = Math.PI * 2 * 0.25
      return { w: h, h: w }
    } else {
      stage.rotation = 0
    }

    return { w, h }
  }

  handleFixAuto(director, rect) {
    const { maxWidth, maxHeight } = this
  }

  handleFixWidth(director, { w, h }) {
    const { stage } = director.app
    const { width, height, offsetX, offsetY } = this
    const scale = w / width
    stage.scale.set(scale, scale)

    this.node.y = offsetY
    this.node.x = offsetX

    const innerY = - (height - h / scale) / 2
    this.visibleRect = Object.assign(this.visibleRect, {
      x: 0,
      y: -innerY,
      offsetX,
      offsetY,
      scale,
      width: this.width,
      height: this.height + 2 * innerY,
    })
  }

  handleFixHeight(director, { w, h }) {
    const { stage } = director.app
    const { width, height, offsetX, offsetY } = this
    const scale = h / height
    stage.scale.set(scale, scale)

    this.node.y = offsetY
    this.node.x = offsetX

    const innerX = - (width - w / scale) / 2
    this.visibleRect = Object.assign(this.visibleRect, {
      x: -innerX,
      y: 0,
      offsetX,
      offsetY,
      scale,
      width: this.width + 2 * innerX,
      height: this.height,
    })
  }
}
