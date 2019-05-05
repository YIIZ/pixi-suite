import { Point, Sprite, NineSlicePlane } from 'pixi.js'
import loader from '@teambun/loader'

import Node from './Node'
import ImageEditorCtrl, { EditorCmd, EditorRemove, EditorRotate, EditorScale, EditorFlip } from '../components/ImageEditorCtrl'
import TouchScale from '../components/TouchScale'
import Widget from '../components/Widget'
import Layout from '../components/Layout'

const sRemove = loader.add(require('../../assets/remove.png'))
const sRotate = loader.add(require('../../assets/rotate.png'))
const sScale = loader.add(require('../../assets/scale.png'))
const sFlip = loader.add(require('../../assets/flip.png'))
const sCircle = loader.add(require('../../assets/circle.png'))
const sBoard = loader.add(require('../../assets/border.png'))

export default class Editor extends Node {
  circleTint = 0xffffff
  iconTint = 0xffffff
  borderTint = 0xffffff

  initChildren() {
    const center = new Point(0.5, 0.5)
    const size = 50
    return (<>
      <Node name='body' />
      <NineSlicePlane name='border' tint={this.borderTint} args={[sBoard.texture, 8, 8, 8, 8]} />
      <Node name='remove' x={-20} y={-20} components={[EditorRemove]}>
        <Sprite width={size} height={size} tint={this.circleTint} texture={sCircle.texture} />
        <Sprite x={size/2} y={size/2} tint={this.iconTint} anchor={center} texture={sRemove.texture} />
      </Node>
      <Node name='rotate' components={[EditorRotate]}>
        <Sprite width={size} height={size} tint={this.circleTint} texture={sCircle.texture} />
        <Sprite x={size/2} y={size/2} tint={this.iconTint} anchor={center} texture={sRotate.texture} />
      </Node>
      <Node name='scale' components={[EditorScale]}>
        <Sprite width={size} height={size} tint={this.circleTint} texture={sCircle.texture} />
        <Sprite x={size/2} y={size/2} tint={this.iconTint} anchor={center} texture={sScale.texture} />
      </Node>
      <Node name='flip' components={[EditorFlip]}>
        <Sprite width={size} height={size} tint={this.circleTint} texture={sCircle.texture} />
        <Sprite x={size/2} y={size/2} tint={this.iconTint} anchor={center} texture={sFlip.texture} />
      </Node>
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

    const remove = this.getChildByName('remove')
    const rotate = this.getChildByName('rotate')
    const scale = this.getChildByName('scale')
    const flip = this.getChildByName('flip')

    const wrm = remove.addComponent(Widget)
    wrm.alignFlag = Widget.AlignFlag.LEFT | Widget.AlignFlag.TOP
    wrm.left = wrm.top = -20
    const wr = rotate.addComponent(Widget)
    wr.alignFlag = Widget.AlignFlag.RIGHT | Widget.AlignFlag.TOP
    wr.right = wr.top = -20
    const ws = scale.addComponent(Widget)
    ws.alignFlag = Widget.AlignFlag.RIGHT | Widget.AlignFlag.BOTTOM
    ws.right = ws.bottom = -20
    const wf = flip.addComponent(Widget)
    wf.alignFlag = Widget.AlignFlag.LEFT | Widget.AlignFlag.BOTTOM
    wf.left = wf.bottom = -20

    wrm.target = border
    wr.target = border
    ws.target = border
    wf.target = border
    wrm.alignMode = Widget.AlignMode.AWAYS
    wr.alignMode = Widget.AlignMode.AWAYS
    ws.alignMode = Widget.AlignMode.AWAYS
    wf.alignMode = Widget.AlignMode.AWAYS

    remove.getComponent(EditorCmd).init(editorCtrl)
    scale.getComponent(EditorCmd).init(editorCtrl)
    rotate.getComponent(EditorCmd).init(editorCtrl)
    flip.getComponent(EditorCmd).init(editorCtrl)
  }
}
