import { NineSlicePlane } from 'pixi.js'
import loader from '@teambun/loader'

import Node from './Node'
import ScrollBarCtrl from '../components/ScrollBarCtrl'
import Widget from '../components/Widget'

const bg = loader.add(require('../../assets/scroll_v_bg.png'))
const bar = loader.add(require('../../assets/scroll_v_bar.png'))

export default class ScrollBar extends Node {
  scrollPart = 'bar'
  direction = 'vertical'

  initChildren() {
    return (
      <>
        <NineSlicePlane ref={(r) => (this.$$bg = r)} args={[bg.texture, 3, 3, 3, 3]}></NineSlicePlane>
        <NineSlicePlane ref={(r) => (this.$$bar = r)} args={[bar.texture, 3, 3, 3, 3]} />
      </>
    )
  }

  onCreate() {
    const barCtrl = this.addComponent(ScrollBarCtrl)
    barCtrl.direction = this.direction
    barCtrl.bg = this.$$bg
    barCtrl.bar = this.$$bar
    if (this.direction === 'horizontal') {
      this.rotation = Math.PI * -0.5
    }
  }
}
