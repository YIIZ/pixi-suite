import * as PIXI from 'pixi.js'
import Node from './Node'
import ImageEditorCtrl, {
  EditorCmd,
  EditorRemove,
  EditorRotate,
  EditorScale,
  EditorFlip,
} from '../components/ImageEditorCtrl'
import Widget from '../components/Widget'
import Layout from '../components/Layout'

const {
  Sprite,
  Text,
  Point,
  Texture: { WHITE },
} = PIXI

export default class Editor extends Node {
  initChildren() {
    return (
      <>
        <Node name="body" />
        <Node name="remove" x={-20} y={-20} components={[EditorRemove]}>
          <Sprite width={40} height={40} texture={WHITE} />
        </Node>
        <Node name="rotate" components={[EditorRotate]}>
          <Sprite width={40} height={40} tint={0xff0000} texture={WHITE} />
        </Node>
        <Node name="scale" components={[EditorScale]}>
          <Sprite width={40} height={40} tint={0x00ff00} texture={WHITE} />
        </Node>
        <Node name="flip" components={[EditorFlip]}>
          <Sprite width={40} height={40} tint={0x0000ff} texture={WHITE} />
        </Node>
      </>
    )
  }

  onInit() {
    const editorCtrl = this.addComponent(ImageEditorCtrl)
    const body = this.getChildByName('body')
    editorCtrl.body = body

    const remove = this.getChildByName('remove')
    const rotate = this.getChildByName('rotate')
    const scale = this.getChildByName('scale')
    const flip = this.getChildByName('flip')

    const wr = rotate.addComponent(Widget)
    wr.alignFlag = Widget.AlignFlag.RIGHT | Widget.AlignFlag.TOP
    wr.right = wr.top = -20
    const ws = scale.addComponent(Widget)
    ws.alignFlag = Widget.AlignFlag.RIGHT | Widget.AlignFlag.BOTTOM
    ws.right = ws.bottom = -20
    const wf = flip.addComponent(Widget)
    wf.alignFlag = Widget.AlignFlag.LEFT | Widget.AlignFlag.BOTTOM
    wf.left = wf.bottom = -20

    wr.target = body
    ws.target = body
    wf.target = body
    wr.alignMode = Widget.AlignMode.AWAYS
    ws.alignMode = Widget.AlignMode.AWAYS
    wf.alignMode = Widget.AlignMode.AWAYS

    remove.getComponent(EditorCmd).init(editorCtrl)
    scale.getComponent(EditorCmd).init(editorCtrl)
    rotate.getComponent(EditorCmd).init(editorCtrl)
    flip.getComponent(EditorCmd).init(editorCtrl)
  }
}
