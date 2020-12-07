import { NineSlicePlane } from 'pixi.js'
import loader from '@teambun/loader'

import Node from './Node'
import ScrollBarCtrl from '../components/ScrollBarCtrl'
import Widget from '../components/Widget'
import { createRoundRect } from '../utils/texture'

let bg = null

export default class ScrollBar extends Node {
  scrollPart = 'bar'
  direction = 'vertical'

  initChildren() {
    if (!bg) bg = createRoundRect(8, 64, 4)
    return (
      <>
        <NineSlicePlane ref={(r) => (this.$$bg = r)} args={[bg, 3, 3, 3, 3]} visible={false}></NineSlicePlane>
        <NineSlicePlane ref={(r) => (this.$$bar = r)} args={[bg, 3, 3, 3, 3]} tint={0} alpha={0.5} />
      </>
    )
  }

  onCreate() {
    const barCtrl = this.addComponent(ScrollBarCtrl)
    barCtrl.direction = this.direction
    barCtrl.bg = this.$$bg
    barCtrl.bar = this.$$bar
    this.barCtrl = barCtrl
    if (this.direction === 'horizontal') {
      this.rotation = Math.PI * -0.5
    }
  }
}
