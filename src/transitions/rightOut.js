import { tween } from 'popmotion'

export default ($out, $in, option = {}) => {
  return new Promise((resolve, reject) => {
    const arg = Object.assign({ from: 0, to: 750, duration: 600 }, option)

    const stage = $out.parent
    const indexIn = stage.getChildIndex($in)
    const indexOut = stage.getChildIndex($out)
    if (indexIn > indexOut) stage.swapChildren($in, $out)

    tween(arg)
    .start({
      update: v => {
        $out.x = v
      },
      complete: resolve,
    })
  })
}

