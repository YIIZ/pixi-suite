import * as PIXI from 'pixi.js'
import loader from '@teambun/loader'

import Node from './Node'
import ScrollBarCtrl from '../components/ScrollBarCtrl'
import Widget from '../components/Widget'

const bg = loader.add(require('../../assets/scroll_v_bg.png'))
const bar = loader.add(require('../../assets/scroll_v_bar.png'))

const NineSlicePlane = PIXI.mesh.NineSlicePlane

export default class ScrollBar extends Node {
  initChildren() {
    return (<>
      <NineSlicePlane name='bg' args={[bg.texture, 3, 3, 6, 6]} >
      </NineSlicePlane>
      <NineSlicePlane name='bar' args={[bar.texture, 3, 3, 6, 6]} />
    </>)
  }

  onCreate() {
    const barCtrl = this.addComponent(ScrollBarCtrl)
    barCtrl.bg = this.findChild('bg')
    barCtrl.bar = this.findChild('bar')
  }
}
