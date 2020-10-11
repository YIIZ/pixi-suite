import Node from './Node'
import ViewAdapter from '../components/ViewAdapter'

export default class Scene extends Node {
  constructor(director, option) {
    super()
    this.option = option
    this.addComponent(ViewAdapter)
  }

  onShow(type) {}
  beforeRemove(nextSceneName) {}
}
