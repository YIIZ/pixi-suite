import * as PIXI from 'pixi.js'
import EventEmitter from 'eventemitter3'
import ViewAdapter from '../components/ViewAdapter'

class Director extends EventEmitter {
  init(selector, options) {
    const app = new PIXI.Application(options)
    this.app = app

    this.container = document.querySelector(selector)
    this.container.appendChild(app.view)

    app.stage.isRoot = true

    this.updateView()
    window.addEventListener('resize', this.handleResize)

    this.scenes = {}
  }

  addScene(key, cls) {
    this.scenes[key] = cls
  }

  loadScene(name) {
    const { stage } = this.app
    const lastScene = this.scene

    const Scene = this.scenes[name]
    this.scene = new Scene(this)
    this.scene.handleCreate()
    this.viewAdapter = this.scene.getComponent(ViewAdapter)
    this.viewAdapter.updateView(this)
    stage.addChild(this.scene)

    if (lastScene) {
      lastScene.director = null
      stage.removeChild(lastScene)
      lastScene.destroy({ children: true })
    }
  }

  updateView() {
    const { app } = this

    const { devicePixelRatio = 1 } = window
    this.devicePixelRatio = devicePixelRatio
    const {
      clientWidth: innerWidth,
      clientHeight: innerHeight,
    } = document.documentElement

    app.width = app.view.width = innerWidth * devicePixelRatio
    app.height = app.view.height = innerHeight * devicePixelRatio
    app.renderer.autoResize = false
    app.renderer.resize(app.width, app.height)
  }

  handleResize = () => {
    this.updateView()

    if (!this.viewAdapter) return
    this.viewAdapter.updateView(this)
    this.emit('resize')
  }
}

const director = new Director()
export default director
