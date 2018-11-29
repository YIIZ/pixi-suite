import { tween } from 'popmotion'

export default ($out, $in, option = {}) => {
  return new Promise((resolve, reject) => {
    const arg = Object.assign({ from: 1, to: 0, duration: 600 }, option)
    $out.alpha = arg.from
    tween(arg)
    .start({
      update: v => {
        $out.alpha = v
      },
      complete: resolve,
    })
  })
}

