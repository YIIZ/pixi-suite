import Base from './Base'
import EventEmitter from 'eventemitter3'
import { Point } from 'pixi.js'
import director from '../managers/director'
import { updateDOMTransform } from '../utils/dom'
import { isAndroid, isWeibo, isQQ, isIOS } from '../utils/os'

export const shouldJSPlayer = isAndroid && !isWeibo && !location.search.match(/forcevideo/)
const defaultOption = { type: shouldJSPlayer ? 'js' : 'native', zIndex: 1, loop: false }

export default class VideoCtrl extends Base {
  static preload(op) {
    const option = Object.assign({}, defaultOption, op)
    const PlayerClass = players[option.type]
    if (!PlayerClass) {
      throw new Error('no the player of ' + option.type)
    }

    const player = new PlayerClass(option)
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

    if (player.prepared && player.option.autoPlay) {
      this.handleVideoStart()
    }
    director.on('resize', this.updateTransform, this)
    player.on('started', this.handleVideoStart, this)
    player.on('timeupdate', this.handleVideoUpdate, this)
    player.on('ended', this.handleVideoEnd, this)
  }

  onDisable() {
    const { player } = this.node

    director.off('resize', this.updateTransform, this)
    player.off('started', this.handleVideoStart, this)
    player.off('timeupdate', this.handleVideoUpdate, this)
    player.off('ended', this.handleVideoEnd, this)

    if (!player.option.reuse) {
      player.destroy()
    } else {
      player.removeAllListeners()
      player.stop()
      director.container.removeChild(player.elem)
    }
  }

  handleVideoStart() {
    this.updateTransform()
    this.node.player.setOpacity(1)
    if (this.node.handleVideoStart) {
      this.node.handleVideoStart()
    }
  }

  handleVideoUpdate = () => {
    if (this.node.handleVideoUpdate) {
      this.node.handleVideoUpdate()
    }
  }

  handleVideoEnd = () => {
    if (this.node.handleVideoEnd) {
      this.node.handleVideoEnd()
    }
  }

  updateTransform() {
    const { node } = this
    const { boundTarget, elem } = node.player
    updateDOMTransform(boundTarget || node, elem, director.visibleRect.scale, director.devicePixelRatio)
  }
}

export class BasePlayer extends EventEmitter {
  constructor(option) {
    super()
    this.option = option
  }

  get currentTime() {
    return this.video.currentTime
  }

  set zIndex(v) {
    if (!this.elem) return
    this.elem.style.zIndex = v
  }

  handleVideoUpdate = () => {
    if (!this.prepared) {
      this.prepared = true
    }
    if (!this.video.paused && !this.started) {
      this.started = true
      this.emit('started')
    }

    this.emit('timeupdate')
  }

  handleVideoEnd = () => {
    this.started = false
    this.video.currentTime = 0
    this.emit('ended')
  }

  async play() {
    await this.initPromise
    return this.video.play()
  }

  pause() {
    if (!this.video) return
    if (this.video.paused) return

    return this.video.pause()
  }

  stop() {
    if (!this.video) return

    this.video.pause()
    this.video.currentTime = 0
    return
  }

  setOpacity(v) {
    if (this.elem) this.elem.style.opacity = v
  }

  destroy() {
    this.removeAllListeners()
  }
}

class NativePlayer extends BasePlayer {
  constructor(option) {
    super(option)
    this.elem = this.video = NativePlayer.initElement(option)
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

  get duration() {
    return this.video.duration
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

    const event = isAndroid ? 'touchend' : 'touchstart'
    const unlock = async () => {
      const { paused } = video
      await video.play()
      if (paused) video.pause()
      document.body.removeEventListener(event, unlock)
    }
    document.body.addEventListener(event, unlock)
    return video
  }
}

const players = {
  native: NativePlayer,
}

export const registerPlayer = (name, PlayerClass) => {
  players[name] = PlayerClass
}
