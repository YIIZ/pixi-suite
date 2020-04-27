import { tween } from 'popmotion'

export default ($out, $in, option = {}) => {
  return new Promise((resolve, reject) => {
    const arg = Object.assign({ from: 0, to: 1, duration: 600 }, option)
    $in.alpha = 0
    $in.parent.swapChildren($out, $in)
    tween(arg).start({
      update: v => {
        $in.alpha = v
      },
      complete: resolve,
    })
  })
}
