import * as PIXI from 'pixi.js'
import { tween, easing } from 'popmotion'
import Node from './Node'
import { preload } from '../managers/loader'

const { Sprite, Text, Point, Texture: { WHITE } } = PIXI

const loading = preload(require('../../assets/loading.png'))
const warning = preload(require('../../assets/warning.png'))
const center = new Point(0.5, 0.5)

export class WarningToast extends Node {
  icon = warning
  initChildren() {
    const style = { fontSize: 24, fill: '#ffffff' }
    return (<>
      <Sprite name='bg' texture={new BG()} />
      <Sprite name='icon' x={150} y={this.title ? 80 : 100} anchor={center} texture={this.icon.texture} />
      <Text x={150} y={160} anchor={center} text={this.title} style={style} />
    </>)
  }
}

export class LoadingToast extends WarningToast {
  icon = loading
  onAdd() {
    const icon = this.findChild('icon')
    this.action = tween({
      from: 0,
      to: Math.PI * 2,
      loop: Infinity,
      ease: (v) => Math.floor(v * 8) / 8, // stepped
      duration: 800
    })
    .start(v => {
      icon.rotation = v
    })
  }

  onRemove() {
    this.action.stop()
  }
}

class BG {
  static cache = null
  constructor() {
    if (BG.cache) return BG.cache
    const g = new PIXI.Graphics()
    g.lineStyle(0)
    g.beginFill(0x000000, 0.7)
    g.drawRoundedRect(0, 0, 300, 200, 10)
    g.endFill()
    return g.generateCanvasTexture()
  }
}

export default {
  warning: WarningToast,
  loading: LoadingToast,
}
