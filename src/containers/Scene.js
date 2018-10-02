import Node from './Node'
import ViewAdapter from '../components/ViewAdapter'

export default class Scene extends Node {
  constructor(director) {
    super()
    this.director = director
    this.view = director.view
  }

  handleCreate() {
    super.handleCreate()
    this.addComponent(ViewAdapter)
  }
}
