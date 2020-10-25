import { BasePlayer, registerPlayer } from '../components/VideoCtrl'

class JSPlayer extends BasePlayer {
  constructor(option) {
    super(option)
    this.option = option
    this.elem = JSPlayer.initElement(option)
    this.initPromise = this.init()
  }

  async init() {
    const {
      elem: canvas,
      option: { src, poster, loop },
    } = this

    // FIXME import的动态导入失效?
    const { JSMpeg } = await import(
      /* webpackChunkName: 'jsmpeg' */ 'exports-loader?exports=JSMpeg!pixi-suite/src/vendors/jsmpeg.min.js'
    )
    const video = new JSMpeg.Player(src, {
      canvas,
      poster,
      loop: !!loop, // JSMpeg use loop !== false
      videoBufferSize: 1024 * 1024 * 2,
      disableWebAssembly: false,
      onVideoDecode: this.handleVideoUpdate,
      onEnded: this.handleVideoEnd,
    })

    this.video = video
  }

  set muted(v) {
    this.video.volume = v ? 0 : 1
    this.emit('mutechange', this.muted)
  }

  get muted() {
    return this.video.volume === 0
  }

  get duration() {
    const { video } = this.video
    // FIXME timestamps数组长度仅限当前已载入的数据, 所以当video未载入完, duration不正确
    return video.timestamps.length / video.frameRate
  }

  destroy() {
    super.destroy()
    this.video.destroy()
    if (this.elem && this.elem.parentNode) {
      this.elem.parentNode.removeChild(this.elem)
    }
  }

  static initElement(option) {
    const { zIndex } = option
    const canvas = document.createElement('canvas')
    canvas.style.width = '1px'
    canvas.style.height = '1px'
    canvas.className = 'video'
    canvas.style.opacity = 0
    canvas.style.zIndex = zIndex
    return canvas
  }
}

registerPlayer('js', JSPlayer)
