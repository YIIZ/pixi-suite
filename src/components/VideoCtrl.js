import Base from './Base'
import EventEmitter from 'eventemitter3'
import { Point } from 'pixi.js'
import director from '../managers/director'
import { updateDOMTransform } from '../utils/dom'
import { isAndroid, isWeibo, isQQ, isIOS } from '../utils/os'

export const shouldJSPlayer = isAndroid && !isWeibo && !location.search.match(/forcevideo/)
const defaultOption = { type: shouldJSPlayer ? 'js' : 'navtive', zIndex: 1, loop: false }

export default class VideoCtrl extends Base {
  static preload(op) {
    const option = Object.assign({}, defaultOption, op)
    let player
    if (option.type === 'js') {
      player = new JSPlayer(option)
    } else {
      player = new NavtivePlayer(option)
    }
    return player
  }

  onEnable() {
    let { player, playerOption } = this.node

    if (!player && !playerOption) {
      return console.error('need player or playerOption')
    }

    if (!player) {
      player = this.node.player = VideoCtrl.preload(playerOption)
    }

    if (!player.elem.parentNode) {
      director.container.appendChild(player.elem)
    }

    player.once('started', this.handleVideoStart, this)
    director.on('resize', this.updateTransform, this)
  }

  onDisable() {
    const { player } = this.node

    director.off('resize', this.updateTransform, this)

    if (!player.reuse) {
      player.destroy()
    } else {
      player.removeAllListeners()
      player.stop()
      director.container.removeChild(player.elem)
    }
  }

 handleVideoStart() {
    this.node.player.setOpacity(1)
    this.updateTransform()
  }

  updateTransform() {
    const { node } = this
    const { boundTarget, elem } = node.player
    updateDOMTransform(boundTarget || node, elem, director.visibleRect.scale, director.devicePixelRatio)
  }
}

class BasePlayer extends EventEmitter {
  handleVideoUpdate = () => {
    if (!this.started) {
      this.started = true
      this.emit('started')
    }

    this.emit('timeupdate')
  }

  handleVideoEnd = () => {
    this.emit('ended')
  }

  async play() {
    if (this.playing) return
    this.playing = true

    await this.initPromise
    return this.video.play()
  }

  pause() {
    if (!this.video) return
    if (this.video.paused) return

    this.playing = false
    return this.video.pause()
  }

  stop() {
    if (!this.video) return

    this.playing = false
    return this.video.stop()
  }

  setOpacity(v) {
    if (this.elem) this.elem.style.opacity = v
  }

  destroy() {
    this.removeAllListeners()
  }
}

class NavtivePlayer extends BasePlayer {
  constructor(option) {
    super(option)
    this.elem = this.video = NavtivePlayer.initElement(option)
    if (option.x5 || (isQQ && isIOS)) {
      this.elem.setAttribute('x5-playsinline', 'true')
    }

    this.elem.addEventListener('timeupdate', this.handleVideoUpdate)
    this.elem.addEventListener('ended', this.handleVideoEnd)
  }

  set muted(v) {
    this.video.muted = v ? false : true
    this.emit('mutechange', this.muted)
  }

  get muted() {
    return this.video.muted
  }

  destroy() {
    super.destroy()
    if (this.elem && this.elem.parentNode) {
      this.elem.parentNode.removeChild(this.elem)
    }
    this.elem = null
  }

  static initElement(option) {
    const video = document.createElement('video')
    video.className = 'IIV'
    video.style.position = 'absolute'
    video.style.top = '0'
    video.style.left = '0'
    video.style.width = '1px'
    video.style.height = '1px'
    video.className = 'video'
    video.setAttribute('preload', 'auto')
    video.setAttribute('webkit-playsinline', '')
    video.setAttribute('playsinline', '')

    const { src, disableUnlock, poster = '', loop = false, zIndex = 1 } = option
    video.style.zIndex = zIndex
    video.loop = loop
    video.src = src
    video.poster = poster

    if (disableUnlock) return video

    const unlock = () => {
      const { paused } = video
      video.play()
      if (paused) video.pause()
      window.removeEventListener('touchend', unlock)
    }
    window.addEventListener('touchend', unlock)
    return video
  }
}

class JSPlayer extends BasePlayer {
  constructor(option) {
    super(option)
    this.option = option
    this.elem = JSPlayer.initElement(option)
    this.initPromise = this.init()
  }

  async init() {
    const { elem: canvas, option: { src, poster, loop } } = this

    const { default: JSMpeg } = await import(/* webpackChunkName: 'jsmpeg' */ 'exports-loader?JSMpeg!../vendors/jsmpeg.min.js')
    console.log('init')
    const video = new JSMpeg.Player(src, {
      canvas,
      poster,
      loop: !!loop, // JSMpeg use loop !== false
      videoBufferSize: 1024*1024*2,
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

