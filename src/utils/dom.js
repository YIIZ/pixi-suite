export const updateDOMTransform = (node, elem, devicePixelRatio = 2) => {
    node._recursivePostUpdateTransform()

    const wt = node.transform.worldTransform.clone()
    wt.scale(1/devicePixelRatio, 1/devicePixelRatio)

    // FIXME when pivot is not 0
    const rect = wt.apply({ x: node.width, y: node.height })
    const pos = wt.apply({ x: 0, y: 0 })
    console.log(wt)

    Object.assign(elem.style, {
      width: `${rect.x - pos.x}px`,
      height: `${rect.y - pos.y}px`,
      position: 'absolute',
      top: `${pos.y}px`,
      left: `${pos.x}px`,
    })
}
