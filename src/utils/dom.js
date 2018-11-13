export const updateDOMTransform = (node, elem, devicePixelRatio = 2) => {
  node._recursivePostUpdateTransform()

  const wt = node.transform.worldTransform.clone()
  wt.scale(1/devicePixelRatio, 1/devicePixelRatio)

  // FIXME when pivot is not 0
  // TODO 真正理解运用
  // scale 会影响input的placeholder
  const rect = wt.apply({ x: node.width, y: node.height })
  const pos = wt.apply({ x: 0, y: 0 })
  const sign = Math.sign(wt.c + 0.0001)
  const w = (sign > 0) ? (rect.x - pos.x) : (rect.y - pos.y)
  const h = (sign > 0) ? (rect.y - pos.y) : -(rect.x - pos.x)
  wt.translate(-pos.x, -pos.y)
  wt.scale(node.width / w, node.height / h)
  const matrix = `matrix(${wt.a}, ${wt.b}, ${wt.c}, ${wt.d}, ${wt.tx}, ${wt.ty})`

  Object.assign(elem.style, {
    position: 'absolute',
    top: `${pos.y}px`,
    left: `${pos.x}px`,
    width: `${w}px`,
    height: `${h}px`,
    //top: `0`,
    //left: `0`,
    //width: `${node.width}px`,
    //height: `${node.height}px`,
    webkitTransformOrigin: '0 0 0',
    transformOrigin: '0 0 0',
    webkitTransform: matrix,
    transform: matrix,
  })
}
