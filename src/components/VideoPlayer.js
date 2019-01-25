import Base from './Base'
import { Point } from 'pixi.js'
import director from '../managers/director'
import { updateDOMTransform } from '../utils/dom'
import { isQQ, isIOS } from '../utils/os'

export default class VideoPlayer extends Base {
  src = ''
  autoPlay = true

  static initElement() {
    if (VideoPlayer.$video) return VideoPlayer.$video
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
    VideoPlayer.$video = video

    const unlock = () => {
      const { paused } = video
      video.play()
      if (paused) video.pause()
      window.removeEventListener('touchend', unlock)
    }
    window.addEventListener('touchend', unlock)

    director.container.appendChild(video)
    return video
  }
  static preload(src) {
    const video = VideoPlayer.initElement()
    video.src = src
    video.videoSrc = src
    VideoPlayer.video = video
  }

  onEnable() {
    this.initElement()
    if (this.video.orginSrc !== this.node.videoSrc) {
      this.video.src = this.node.videoSrc
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
    const { node, video } = this
    updateDOMTransform(node, video, director.devicePixelRatio)
  }

  initElement() {
    this.video = VideoPlayer.initElement()
    return this.video
  }

  removeElement() {
    if (!this.video) return
    director.container.removeChild(this.video)
    this.video = null
  }

  updateOpacity(v) {
    this.video.style.opacity = v
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
      this.updateTransform()
      this.node.emit('videostart')
      return
    }
    requestAnimationFrame(this.checkStart)
  }
}
