import * as PIXI from 'pixi.js'
import Node from './Node'
import ScrollBar from './ScrollBar.js'
import ScrollBarCtrl from '../components/ScrollBarCtrl'
import ScrollViewCtrl from '../components/ScrollViewCtrl'
import Widget from '../components/Widget'
import Layout from '../components/Layout'

export default class ScrollView extends Node {
  initChildren() {
    return (
      <>
        <ScrollBar name="bar" />
        <Node name="view">
          <Node name="content" components={[Layout]} />
        </Node>
      </>
    )
  }

  onInit() {
    const viewCtrl = this.addComponent(ScrollViewCtrl)
    const bar = this.getChildByName('bar')
    viewCtrl.view = this.getChildByName('view')
    viewCtrl.content = viewCtrl.view.getChildByName('content')
    viewCtrl.scroller = bar.getComponent(ScrollBarCtrl)
  }
}
