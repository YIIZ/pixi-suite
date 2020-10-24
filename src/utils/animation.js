import { tween, easing } from 'popmotion'

export const fadeIn = (node, option) => {
  node.alpha = 0
  const action = tween({ from: 0, to: 1, duration: 400 }).start((v) => {
    if (node._destroyed) return action.stop()
    node.alpha = v
  })
}

export const fadeOut = (node, option, handler) => {
  const action = tween({ from: node.alpha, to: 0, duration: 300 }).start({
    update: (v) => {
      if (node._destroyed) return action.stop()
      node.alpha = v
    },
    complete: () => {
      if (node._destroyed) return
      if (typeof handler === 'function') {
        handler(node)
      } else if (handler === 'remove') {
        if (node.parent) node.parent.removeChild(node)
      } else {
        node.destroy({ children: true })
      }
    },
  })
}
