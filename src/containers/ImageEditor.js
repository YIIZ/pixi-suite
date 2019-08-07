import { Point, Sprite, NineSlicePlane } from 'pixi.js'
import loader from '@teambun/loader'

import Node from './Node'
import ImageEditorCtrl, { EditorCmd, EditorRemove, EditorRotate, EditorScale, EditorFlip } from '../components/ImageEditorCtrl'
import TouchScale from '../components/TouchScale'
import Widget from '../components/Widget'
import Layout from '../components/Layout'

export const sRemove = loader.add(require('../../assets/remove.png'))
export const sRotate = loader.add(require('../../assets/rotate.png'))
export const sScale = loader.add(require('../../assets/scale.png'))
export const sFlip = loader.add(require('../../assets/flip.png'))
export const sCircle = loader.add(require('../../assets/circle.png'))
export const sBoard = loader.add(require('../../assets/border.png'))

const center = new Point(0.5, 0.5)

export default class Editor extends Node {
  circleTint = 0x666666
  iconTint = 0xffffff
  borderTint = 0xffffff

  initChildren() {
    return (<>
      <Node name='body' />
      <NineSlicePlane name='border' tint={this.borderTint} args={[sBoard.texture, 8, 8, 8, 8]} />
    </>)
  }

  onCreate() {
    if (this.multiTouch) {
      console.log('multiTouch')
      this.addComponent(TouchScale)
    }

    const editorCtrl = this.addComponent(ImageEditorCtrl)
    const body = this.getChildByName('body')
    const border = this.getChildByName('border')
    editorCtrl.body = body
    editorCtrl.border = border

    const target = border
    const margin = -20
    const size = 50
    const mode = Widget.AWAYS
    const { TOP_LEFT, TOP_RIGHT, BOTTOM_LEFT, BOTTOM_RIGHT } = Widget
    const { removeable, rotateable, scaleable, flipable, fixRatio } = this.edit || {}

    if (removeable) {
      const remove = (
        <Node name='remove' x={-20} y={-20} widget={{ target, mode, flag: TOP_LEFT, left: margin, top: margin }} components={[EditorRemove, Widget]}>
          <Sprite width={size} height={size} tint={this.circleTint} texture={sCircle.texture} />
          <Sprite x={size/2} y={size/2} tint={this.iconTint} anchor={center} texture={sRemove.texture} />
        </Node>
      )
      remove.getComponent(EditorCmd).init(editorCtrl)
      this.addChild(remove)
    }

    if (rotateable) {
      const rotate = (
        <Node name='rotate' widget={{ target, mode, flag: TOP_RIGHT, right: margin, top: margin }} components={[EditorRotate, Widget]}>
          <Sprite width={size} height={size} tint={this.circleTint} texture={sCircle.texture} />
          <Sprite x={size/2} y={size/2} tint={this.iconTint} anchor={center} texture={sRotate.texture} />
        </Node>
      )
      rotate.getComponent(EditorCmd).init(editorCtrl)
      this.addChild(rotate)
    }

    if (scaleable) {
      const scale = (
        <Node name='scale' widget={{ target, mode, flag: BOTTOM_LEFT, left: margin, bottom: margin }} fixRatio={fixRatio} components={[EditorScale, Widget]}>
          <Sprite width={size} height={size} tint={this.circleTint} texture={sCircle.texture} />
          <Sprite x={size/2} y={size/2} tint={this.iconTint} anchor={center} texture={sScale.texture} />
        </Node>
      )
      scale.getComponent(EditorCmd).init(editorCtrl)
      this.addChild(scale)
    }

    if (flipable) {
      const flip = (
        <Node name='flip' widget={{ target, mode, flag: BOTTOM_RIGHT, right: margin, bottom: margin }} components={[EditorFlip, Widget]}>
          <Sprite width={size} height={size} tint={this.circleTint} texture={sCircle.texture} />
          <Sprite x={size/2} y={size/2} tint={this.iconTint} anchor={center} texture={sFlip.texture} />
        </Node>
      )
      flip.getComponent(EditorCmd).init(editorCtrl)
      this.addChild(flip)
    }
  }
}
