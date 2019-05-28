export const updateDOMTransform = (node, elem, devicePixelRatio = 2) => {
  node._recursivePostUpdateTransform()

  const wt = node.transform.worldTransform.clone()
  // wt.scale(1/devicePixelRatio, 1/devicePixelRatio)
  // scale 会影响input的placeholder
  const matrix = `matrix(${wt.a}, ${wt.b}, ${wt.c}, ${wt.d}, ${wt.tx/devicePixelRatio}, ${wt.ty/devicePixelRatio})`
  const bd = node.getLocalBounds()

  Object.assign(elem.style, {
    position: 'absolute',
    top: '0',
    left: '0',
    width: `${bd.width/devicePixelRatio}px`,
    height: `${bd.height/devicePixelRatio}px`,
    webkitTransformOrigin: '0 0 0',
    transformOrigin: '0 0 0',
    webkitTransform: matrix,
    transform: matrix,
  })
}
