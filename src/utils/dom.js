export const updateDOMTransform = (node, elem, devicePixelRatio = 2) => {
    node._recursivePostUpdateTransform()

    const wt = node.transform.worldTransform.clone()
    wt.scale(1/devicePixelRatio, 1/devicePixelRatio)

    // FIXME when pivot is not 0
    const matrix = `matrix(${wt.a}, ${wt.b}, ${wt.c}, ${wt.d}, ${wt.tx}, ${wt.ty})`
    Object.assign(elem.style, {
      width: `${node.width}px`,
      height: `${node.height}px`,
      position: 'absolute',
      top: '0',
      left: '0',
      webkitTransformOrigin: `0 0 0`,
      transformOrigin: `0 0 0`,
      webkitTransform: matrix,
      transform: matrix,
    })
}
