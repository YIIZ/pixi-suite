import * as PIXI from 'pixi.js'
import { tween, easing } from 'popmotion'
import Node from './Node'
import { preload } from '../managers/loader'

const { Sprite, Text, Point, Texture: { WHITE } } = PIXI

const loading = preload(require('../../assets/loading.png'))
const warning = preload(require('../../assets/warning.png'))
const center = new Point(0.5, 0.5)
const style = { fontSize: 24, fill: '#ffffff' }

export class TextToast extends Node {
  initChildren() {
    return (<>
      <Sprite name='bg' texture={smBG} />
      <Text x={75} y={50} anchor={center} text={this.title} style={style} />
    </>)
  }
}

export class WarningToast extends Node {
  icon = warning
  initChildren() {
    return (<>
      <Sprite name='bg' texture={mdBG} />
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
  constructor(width = 300, height = 200) {
    const g = new PIXI.Graphics()
    g.lineStyle(0)
    g.beginFill(0x000000, 0.7)
    g.drawRoundedRect(0, 0, width, height, 10)
    g.endFill()
    return g.generateCanvasTexture()
  }
}

const smBG = new BG(150, 100)
const mdBG = new BG(300, 200)

export default {
  text: TextToast,
  warning: WarningToast,
  loading: LoadingToast,
}
