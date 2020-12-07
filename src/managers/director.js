import { Application, Ticker } from 'pixi.js'
import EventEmitter from 'eventemitter3'
import ViewAdapter from '../components/ViewAdapter'
import { isIOS } from '../utils/os'

class Director extends EventEmitter {
  ticker = Ticker.shared

  init(container, params, devicePixelRatio = window.devicePixelRatio || 1) {
    this.container = container
    this.devicePixelRatio = Math.min(2, devicePixelRatio)

    const view = container.querySelector('canvas')
    const _params = Object.assign({ view }, params)
    const app = new Application(_params)
    this.app = app
    this.scenes = {}
    app.stage.isRoot = true

    this.detectVisibility()
    this.updateView()
    //window.addEventListener('resize', this.handleResize)
    this.ticker.add(this.tick)
  }

  tick = () => {
    const { size } = this
    if (!size) return
    const { clientWidth, clientHeight } = document.documentElement
    if (size.width != clientWidth || size.height != clientHeight) {
      this.handleResize()
    }
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

  async loadScene(name, transfer, option) {
    const { stage } = this.app
    const lastScene = this.scene
    this.lastScene = lastScene
    if (lastScene) {
      lastScene.removing = true
      lastScene.beforeRemove(name)
    }

    const Scene = this.scenes[name]
    const scene = new Scene(this, option)
    this.sceneName = name
    this.scene = scene
    this.viewAdapter = this.scene.getComponent(ViewAdapter)
    this.viewAdapter.enable()
    this.scene.handleCreate()
    stage.addChildAt(this.scene, 0)

    if (transfer) {
      await transfer(lastScene, this.scene, option)
    }
    // FIXME 当上一个transfer未完成, 就执行loadScene, 导致冲突
    if (this.scene === scene) this.scene.onShow('scene')

    if (!lastScene) return
    stage.removeChild(lastScene)
    lastScene.destroy({ children: true })
  }

  updateView(size) {
    const { app, container } = this
    //const { innerWidth, innerHeight  } = window
    const { devicePixelRatio } = this
    // innerWidth 在设备旋转后，值不正确，clientWidth会剔除掉scrollbar的宽度
    if (!size) {
      const { clientWidth, clientHeight } = document.documentElement
      size = { width: clientWidth, height: clientHeight }
    }
    this.size = size
    const { width, height } = size
    container.style.width = app.view.style.width = width + 'px'
    container.style.height = app.view.style.height = height + 'px'
    app.width = app.view.width = width * devicePixelRatio
    app.height = app.view.height = height * devicePixelRatio
    app.renderer.resize(app.width, app.height)
    console.log('updateView', width, height)
  }

  handleResize = async (size) => {
    if (this.disableResize) return

    this.updateView(size)

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

  detectVisibility() {
    let hiddenField = 'hidden'
    let visibilityEvent

    if (typeof document.hidden !== 'undefined') {
      // Opera 12.10 and Firefox 18 and later support
      hiddenField = 'hidden'
      visibilityEvent = 'visibilitychange'
    } else if (typeof document.webkitHidden !== 'undefined') {
      hiddenField = 'webkitHidden'
      visibilityEvent = 'webkitvisibilitychange'
    }

    this.hidden = document[hiddenField]
    const handleVisibilityChange = () => {
      this.hidden = document[hiddenField]
      this.emit('visibilitychange', this.hidden)
    }
    document.addEventListener(visibilityEvent, handleVisibilityChange, false)
  }
}

const director = new Director()
export default director
