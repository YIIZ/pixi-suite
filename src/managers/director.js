import * as PIXI from 'pixi.js'
import EventEmitter from 'eventemitter3'
import ViewAdapter from '../components/ViewAdapter'

class Director extends EventEmitter {
  init(container, params, devicePixelRatio=(window.devicePixelRatio || 1)) {
    this.container = container
    const view = container.querySelector('canvas')
    const _params = Object.assign({ view }, params)
    const app = new PIXI.Application(_params)
    this.app = app
    this.scenes = {}
    this.devicePixelRatio = devicePixelRatio
    app.stage.isRoot = true

    this.updateView()
    window.addEventListener('resize', this.handleResize)
  }

  get visibleRect() {
    return this.viewAdapter.visibleRect
  }
  get isRotated() {
    return this.app.stage.rotation != 0
  }

  addScene(key, cls) {
    this.scenes[key] = cls
  }

  async loadScene(name, transfor) {
    const { stage } = this.app
    const lastScene = this.scene

    const Scene = this.scenes[name]
    this.scene = new Scene(this)
    this.viewAdapter = this.scene.getComponent(ViewAdapter)
    this.scene.handleCreate()
    stage.addChild(this.scene)

    if (transfor) {
      await transfor(lastScene, this.scene)
    }

    if (!lastScene) return
    lastScene.director = null
    stage.removeChild(lastScene)
    lastScene.destroy({ children: true })
  }

   updateView() {
     const { app } = this
     //const { innerWidth, innerHeight, devicePixelRatio = 1 } = window
     const { devicePixelRatio } = this
     // innerWidth 在设备旋转后，值不正确，clientWidth会剔除掉scrollbar的宽度
     const { clientWidth: innerWidth, clientHeight: innerHeight } = document.documentElement
     app.width = app.view.width = innerWidth * devicePixelRatio
     app.height = app.view.height = innerHeight * devicePixelRatio
     app.renderer.resize(app.width, app.height)
  }

  handleResize = () => {
    this.updateView()

    if (!this.viewAdapter) return
    this.viewAdapter.updateView(this)
    this.emit('resize')
  }

  resizeTo(width, height) {
    const { app } = this
     app.width = app.view.width = width
     app.height = app.view.height = height
     app.renderer.resize(app.width, app.height)
    this.viewAdapter.updateView(this)
    this.emit('resize')
  }
}

const director = new Director()
export default director
