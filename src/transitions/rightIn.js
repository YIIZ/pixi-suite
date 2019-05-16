import { tween } from 'popmotion'

export default ($out, $in, option = {}) => {
  return new Promise((resolve, reject) => {
    const arg = Object.assign({ from: 750, to: 0, duration: 600 }, option)
    $in.x = arg.from

    const stage = $out.parent
    const indexIn = stage.getChildIndex($in)
    const indexOut = stage.getChildIndex($out)
    if (indexIn < indexOut) stage.swapChildren($in, $out)

    tween(arg)
    .start({
      update: v => {
        $in.x = v
      },
      complete: resolve,
    })
  })
}

