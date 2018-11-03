import * as PIXI from 'pixi.js'
import Node from './Node'
import { preload } from '../managers/loader'
import ScrollBarCtrl from '../components/ScrollBarCtrl'
import Widget from '../components/Widget'

const bg = preload(require('../../assets/scroll_v_bg.png'))
const bar = preload(require('../../assets/scroll_v_bar.png'))

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
