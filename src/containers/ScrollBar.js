import { mesh, extras } from 'pixi.js'
import loader from '@teambun/loader'

import Node from './Node'
import ScrollBarCtrl from '../components/ScrollBarCtrl'
import Widget from '../components/Widget'

const { NineSlicePlane } = mesh
const bg = loader.add(require('../../assets/scroll_v_bg.png'))
const bar = loader.add(require('../../assets/scroll_v_bar.png'))

export default class ScrollBar extends Node {
  scrollPart = 'bar'

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
