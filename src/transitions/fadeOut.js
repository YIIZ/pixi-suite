import { tween } from '@teambun/motion'

export default ($out, $in, option = {}) => {
  return new Promise((resolve, reject) => {
    const arg = Object.assign({ from: 1, to: 0, duration: 600 }, option)
    $out.alpha = arg.from
    tween(arg)
      .onUpdate((v) => {
        $out.alpha = v
      })
      .onComplete(resolve)
      .start()
  })
}
