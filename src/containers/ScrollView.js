import Node from './Node'
import ScrollBar from './ScrollBar.js'
import ScrollBarCtrl from '../components/ScrollBarCtrl'
import ScrollViewCtrl from '../components/ScrollViewCtrl'
import Widget from '../components/Widget'
import Layout from '../components/Layout'

export default class ScrollView extends Node {
  initChildren(children) {
    return (<>
      <Node name='view' scrollPart='view'>
        <Node name='content' scrollPart='content' >
          {children}
        </Node>
      </Node>
      <ScrollBar name='bar' scrollPart='bar' />
    </>)
  }

  onCreate() {
    this.view = this.findChild('view')
    this.content = this.findChild('view/content')
    this.bar = this.findChild('bar')

    const viewCtrl = this.addComponent(ScrollViewCtrl)
    this.viewCtrl = viewCtrl
    viewCtrl.view = this.view
    viewCtrl.content = this.content
    viewCtrl.scroller = this.bar.getComponent(ScrollBarCtrl)
  }

  onAdd() {
    if (this.layout) {
      this.content.layout = this.layout
      this.$layout = this.content.addComponent(Layout)
    }
    this.updateView()
  }

  updateView() {
    if (this.$layout) {
      this.$layout.update()
    }

    const { w, h } = this.viewCtrl
    this.viewCtrl.setSize(w, h)
  }

  clearItems() {
    this.content.removeChildren()
  }

  addItems(items) {
    this.content.addChild(...items)
    this.updateView()
  }

  hideBar() {
    this.bar.visible = false
    this.bar.renderable = false
  }
}
