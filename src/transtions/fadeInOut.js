import { tween } from 'popmotion'

export const fadeInOut = ($out, $in, option = {}) => {
  return new Promise((resolve, reject) => {
    const arg = Object.assign({ from: 0, to: 1, duration: 800 }, option)
    tween(arg)
    .start({
      update: v => {
        $out.alpha = 1 - v
        $in.alpha = v
      },
      complete: () => {
        resolve()
      },
    })
  })
}

export default fadeInOut
