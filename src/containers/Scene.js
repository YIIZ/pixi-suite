import * as PIXI from 'pixi.js'
import Node from './Node'
import ViewAdapter from '../components/ViewAdapter'

export default class Scene extends Node {
  constructor() {
    super()
    this.addComponent(ViewAdapter)
  }
}
