export const updateDOMTransform = (node, elem, devicePixelRatio = 2) => {
  node._recursivePostUpdateTransform()

  const wt = node.transform.worldTransform.clone()
  wt.scale(1/devicePixelRatio, 1/devicePixelRatio)

  // TODO 真正理解运用
  // scale 会影响input的placeholder
  const matrix = `matrix(${wt.a}, ${wt.b}, ${wt.c}, ${wt.d}, ${wt.tx}, ${wt.ty})`
  const bd = node.getLocalBounds()

  Object.assign(elem.style, {
    position: 'absolute',
    top: '0',
    left: '0',
    width: `${bd.width}px`,
    height: `${bd.height}px`,
    webkitTransformOrigin: '0 0 0',
    transformOrigin: '0 0 0',
    webkitTransform: matrix,
    transform: matrix,
  })
}
