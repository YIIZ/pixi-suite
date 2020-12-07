import { Graphics, Sprite, Text, Point, Texture } from 'pixi.js'
import { tween } from '@teambun/motion'
import loader from '@teambun/loader'

import Node from './Node'

const { WHITE } = Texture

const loading = loader.add(require('../../assets/loading.png'))
const warning = loader.add(require('../../assets/warning.png'))
const center = new Point(0.5, 0.5)
const style = { fontSize: 24, fill: '#ffffff', align: 'center' }

export class TextToast extends Node {
  initChildren() {
    const text = <Text name="desc" y={30} anchor={center} text={this.title} style={style} />
    const w = text.width + 80
    const h = text.height + 40
    text.x = w / 2
    text.y = h / 2
    this.pivot = new Point(w / 2, h / 2)
    return (
      <>
        <BG name="bg" args={[w, h]} />
        {text}
      </>
    )
  }
}

export class WarningToast extends Node {
  icon = warning
  initChildren() {
    return (
      <>
        <BG name="bg" args={[300, 200]} />
        <Sprite name="icon" x={150} y={this.title ? 80 : 100} anchor={center} texture={this.icon.texture} />
        <Text name="desc" x={150} y={167} anchor={center} text={this.title} style={style} />
      </>
    )
  }

  onCreate() {
    this.pivot = new Point(150, 100)
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
      duration: 800,
    })
      .onUpdate((v) => {
        icon.rotation = v
      })
      .start()
  }

  onRemove() {
    this.action.stop()
  }
}

class BG extends Graphics {
  constructor(width = 300, height = 200) {
    super()
    const g = this
    g.lineStyle(0)
    g.beginFill(0x000000, 0.7)
    g.drawRoundedRect(0, 0, width, height, 10)
    g.endFill()
    return g
  }
}

export default {
  text: TextToast,
  warning: WarningToast,
  loading: LoadingToast,
}
