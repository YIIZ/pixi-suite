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

  onCreate() {
    this.addComponent(VideoCtrl)
    this.poster = this.children[0]
    this.player.boundTarget = this.poster

    this.addSkipBtn()
  }

  onAdd() {
    if (this.player.option.autoPlay) this.start()
  }

  start() {
    const { player } = this

    if (player.prepared) {
      this.handleVideoStart()
    } else {
      player.once('started', this.handleVideoStart, this)
    }
    player.on('timeupdate', this.handleVideoUpdate, this)
    player.on('ended', this.handleVideoEnd, this)

    if (this.loadingAnimation) {
      setTimeout(() => {
        // 再次尝试播放? 是否因为unlock的pause暂停了?
        // 另外pause也会触发timeupdate, 可能导致prepared为true, 所以在判断前执行
        player.play()

        if (player.prepared) return
        this.toast = toaster.show({ type: 'loading' })
        this.toast.findChild('bg').alpha = 0
      }, this.loadingDelay || 100)
    }

    player.play()
    director.on('visibilitychange', this.handleVisibilityChange, this)
  }

  onRemove() {
    const { player } = this
    player.off('started', this.handleVideoStart, this)
    player.off('ended', this.handleVideoEnd, this)

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

  handleMuteChange = (v) => {
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

  handleVideoUpdate = () => {
    if (this.onVideoUpdate) {
      this.onVideoUpdate()
    }
  }

  addSkipBtn() {
    const { skipable, skipTexture, skipWidget } = this
    if (!skipable) return

    const texture = skipTexture || btnSkip.texture
    const widget = skipWidget || { alignFlag: Widget.AlignFlag.TOP_RIGHT, top: 65, right: 40 }
    const btn = (
      <Node
        name="btn_skip"
        onClick={this.handleSkip}
        renderable={skipable}
        alpha={0}
        widget={widget}
        components={[Widget, Button]}
      >
        <Sprite texture={texture} />
      </Node>
    )
    this.btnSkip = btn
    this.addChild(btn)
  }

  addAudioToggle() {
    const { muteable } = this
    if (!muteable) return

    const btn = (
      <Node
        name="btn_audio"
        onToggle={this.handleMuteChange}
        defaultStatus={this.audio || 'on'}
        widget={{ flag: Widget.AlignFlag.TOP_LEFT, top: 40, left: 40 }}
        components={[Widget, Toggle, StatusSwitch]}
        renderable={muteable}
      >
        <Sprite status="off" texture={audioOffTexture} />
        <Sprite status="on" texture={audioOnTexture} />
      </Node>
    )
    const audioOffTexture = this.audioOffTexture || btnAudioOff.texture
    const audioOnTexture = this.audioOnTexture || btnAudioOn.texture
  }
}
