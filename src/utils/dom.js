export const updateDOMTransform = (node, elem, scale, devicePixelRatio = 2) => {
  node._recursivePostUpdateTransform()

  const wt = node.transform.worldTransform.clone()
  wt.scale(1 / scale, 1 / scale)
  // scale 会影响input的placeholder
  const domScale = scale / devicePixelRatio
  const matrix = `matrix(${wt.a}, ${wt.b}, ${wt.c}, ${wt.d}, ${wt.tx * domScale}, ${wt.ty * domScale})`
  // FIXME 当child里用了anchor时， localBounds计算不正确
  const bd = node.getLocalBounds()

  Object.assign(elem.style, {
    position: 'absolute',
    top: `${bd.y * domScale}px`,
    left: `${bd.x * domScale}px`,
    width: `${bd.width * domScale}px`,
    height: `${bd.height * domScale}px`,
    webkitTransformOrigin: '0 0 0',
    transformOrigin: '0 0 0',
    webkitTransform: matrix,
    transform: matrix,
  })
}

export const toScreenBounds = (node, devicePixelRatio = 2) => {
  const { width, height, left, top } = node.getBounds()
  return {
    top: top / devicePixelRatio,
    left: left / devicePixelRatio,
    width: width / devicePixelRatio,
    height: height / devicePixelRatio,
  }
}
