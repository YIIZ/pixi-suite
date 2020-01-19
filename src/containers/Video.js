import { Sprite, Text, Point, Texture } from 'pixi.js'

import loader from '@teambun/loader'

import { Node, Scene } from '../containers'
import { director, toaster } from '../managers'
import { isAndroid, isIOS, isWeibo } from '../utils/os'
import VideoCtrl from '../components/VideoCtrl'
import { Layout, Widget, Button, Toggle, StatusSwitch } from '../components'

const { WHITE } = Texture
const center = new Point(0.5, 0.5)

const btnSkip = loader.add(require('../../assets/btn_skip.png'))
const btnAudioOn = loader.add(require('../../assets/audio_on.png'))
const btnAudioOff = loader.add(require('../../assets/audio_off.png'))

export { shouldJSPlayer } from '../components/VideoCtrl'

export default class Video extends Node {
  name = 'video'
  initChildren(children) {
    const { muteable, skipable } = this
    const audioOffTexture = this.audioOffTexture || btnAudioOff.texture
    const audioOnTexture = this.audioOnTexture || btnAudioOn.texture
    const skipTexture = this.skipTexture || btnSkip.texture
    return (
      <>
        <Node name="poster">{children}</Node>
        <Node
          name="btn_audio"
          onToggle={this.handleMuteChange}
          defaultStatus={this.audio || 'on'}
          widget={{ flag: Widget.AlignFlag.TOP_RIGHT, top: 40, right: 40 }}
          components={[Widget, Toggle, StatusSwitch]}
          renderable={muteable}
        >
          <Sprite status="off" texture={audioOffTexture} />
          <Sprite status="on" texture={audioOnTexture} />
        </Node>
        <Node
          name="btn_skip"
          onClick={this.handleSkip}
          renderable={skipable}
          alpha={0}
          widget={{ alignFlag: Widget.AlignFlag.TOP_LEFT, top: 40, left: 40 }}
          components={[Widget, Button]}
        >
          <Sprite texture={skipTexture} />
        </Node>
      </>
    )
  }

  onCreate() {
    this.addComponent(VideoCtrl)
    this.poster = this.findChild('poster')
    this.btnSkip = this.findChild('btn_skip')
    this.player.boundTarget = this.poster
  }

  onAdd() {
    const { player } = this

    //if (isIOS && player.type === 'navtive') enableInlineVideo(player.elem)

    if (player.started) {
      this.handleVideoStart()
    } else {
      player.once('started', this.handleVideoStart, this)
    }
    player.on('ended', this.handleVideoEnd, this)
    //if (useJSPlayer) vp.video.duration = 135.99

    if (!this.disableLoading) {
      setTimeout(() => {
        if (player.started) return
        this.toast = toaster.show({ type: 'loading' })
        this.toast.findChild('bg').alpha = 0
      }, 500)
    }

    player.play()
    director.on('visibilitychange', this.handleVisibilityChange, this)
  }

  onRemove() {
    const { player } = this
    player.off('started', this.handleVideoStart, this)
    player.off('ended', this.handleVideoEnd, this)

    director.ticker.remove(this.handleTick, this)
    director.off('visibilitychange', this.handleVisibilityChange, this)

    this.player = null
  }

  handleVisibilityChange(hidden) {
    if (hidden) {
      this.player.pause()
    } else {
      this.player.play()
    }
  }

  handleVideoStart() {
    const { toast, skipable, poster, btnSkip } = this

    poster.alpha = 0
    if (toast) toaster.hide(toast)

    //this.vp.video.currentTime = 25 // debug
    if (skipable) {
      btnSkip.alpha = 1
    }

    if (this.onVideoStart) {
      this.onVideoStart()
    }
  }

  handleMuteChange = v => {
    this.player.muted = v === 'off'
    this.audio = v

    if (this.onMuteChange) {
      this.onMuteChange(v)
    }
  }

  handleSkip = () => {
    if (this.isSkiped) return
    this.isSkiped = true
    this.player.pause()

    if (this.onVideoSkip) {
      this.onVideoSkip()
    }
  }

  handleVideoEnd = () => {
    if (this.onVideoEnd) {
      this.onVideoEnd()
    }
  }

  handleTick() {}
}
