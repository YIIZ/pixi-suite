import { tween } from '@teambun/motion'

export default ($out, $in, option = {}) => {
  return new Promise((resolve, reject) => {
    const arg = Object.assign({ from: 0, to: 1, duration: 600 }, option)
    $in.alpha = 0
    const iIn = $in.parent.getChildIndex($in)
    const iOut = $in.parent.getChildIndex($out)
    if (iIn < iOut) {
      $in.parent.swapChildren($out, $in)
    }
    tween(arg)
      .onUpdate((v) => {
        $in.alpha = v
      })
      .onComplete(resolve)
      .start()
  })
}
