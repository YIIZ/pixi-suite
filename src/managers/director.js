import * as PIXI from 'pixi.js'
import EventEmitter from 'eventemitter3'
import ViewAdapter from '../components/ViewAdapter'

class Director extends EventEmitter {
  init(selector, options) {
    this.container = document.querySelector(selector)
    const app = new PIXI.Application(options)
    this.container.appendChild(app.view)
    this.app = app
    this.scenes = {}
    app.stage.isRoot = true

    this.updateView()
    window.addEventListener('resize', this.handleResize)
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
    //const { innerWidth, innerHeight, devicePixelRatio = 1 } = window
    const { devicePixelRatio = 1 } = window
    // innerWidth 在设备旋转后，值不正确，clientWidth会剔除掉scrollbar的宽度
    const {
      clientWidth: innerWidth,
      clientHeight: innerHeight,
    } = document.documentElement
    app.width = app.view.width = innerWidth * devicePixelRatio
    app.height = app.view.height = innerHeight * devicePixelRatio
    app.renderer.resize(app.width, app.height)
    this.devicePixelRatio = devicePixelRatio
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
