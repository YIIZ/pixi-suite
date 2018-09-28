export const updateDOMTransform = (node, elem, devicePixelRatio = 2) => {
    node._recursivePostUpdateTransform()

    const wt = node.transform.worldTransform.clone()
    wt.scale(1/devicePixelRatio, 1/devicePixelRatio)

    elem.style.width = `${node.width}px`
    elem.style.height = `${node.height}px`
    // FIXME when pivot is not 0
    elem.style.webkitTransform = elem.style.transform = `matrix(${wt.a}, ${wt.b}, ${wt.c}, ${wt.d}, ${wt.tx}, ${wt.ty})`
    elem.style.transformOrigin = `0 0 0`
    elem.style.webkitTransformOrigin = `0 0 0`
}
