import Base from './Base'
import { Point } from 'pixi.js'
import director from '../managers/director'
import { updateDOMTransform } from '../utils/dom'
import { isQQ, isIOS } from '../utils/os'

export default class VideoPlayer extends Base {
  src = ''
  autoPlay = true
  opacity = 1

  static preload(option) {
    const video = VideoPlayer.initElement(option)
    director.container.appendChild(video)
    return { option, video }
  }

  onEnable() {
    let { player } = this.node
    if (!player) {
      const option = this.node.video || { src: this.node.videoSrc }
      player = { video: VideoPlayer.initElement(option) }
    }

    this.video = player.video
    if (!this.video.parentNode) {
      director.container.appendChild(this.video)
    }

    this.video.addEventListener('ended', this.handleEnded)
    if (this.node.x5 || (isQQ && isIOS)) {
      this.video.setAttribute('x5-playsinline', '')
    }
    director.on('resize', this.updateTransform, this)
  }

  onDisable() {
    this.video.removeEventListener('ended', this.handleEnded)
    this.removeElement()
    director.off('resize', this.updateTransform, this)
  }

  updateTransform() {
    const { boundTarget, node, video } = this
    updateDOMTransform(boundTarget || node, video, director.visibleRect.scale, director.devicePixelRatio)
  }

  removeElement() {
    if (!this.video) return
    director.container.removeChild(this.video)
    this.video = null
  }

  updateOpacity(v) {
    this.opacity = v
    if (this.video) this.video.style.opacity = v
  }

  play() {
    if (!this.video.src) return
    if (!this.started && !this.inCheck) this.checkStart()
    this.video.play()
  }

  pause() {
    this.video.pause()
  }

  handleEnded = () => {
    this.node.emit('videoend')
  }

  checkStart = () => {
    this.inCheck = true
    if (this.video.currentTime > 0) {
      this.started = true
      this.updateOpacity(this.opacity)
      this.updateTransform()
      this.node.emit('videostart')
      return
    }
    requestAnimationFrame(this.checkStart)
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
