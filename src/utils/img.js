import * as PIXI from 'pixi.js'

// https://stackoverflow.com/questions/26015497/how-to-resize-then-crop-an-image-with-canvas
// https://stackoverflow.com/questions/17411991/html5-canvas-rotate-image
// https://stackoverflow.com/a/20285053/1793548

// https://gist.github.com/runeb/c11f864cd7ead969a5f0
const DEGREES = {
  1: 0,
  3: 180,
  6: 90,
  8: 270,
}

export const imageDegree = async (file) => {
  const fileReader = new FileReader
  fileReader.readAsArrayBuffer(file)
  // TODO onerror?
  await new Promise(resolve => { fileReader.onloadend = resolve })

  const scanner = new DataView(fileReader.result)
  let idx = 0
  if (fileReader.result.length < 2 || scanner.getUint16(idx) !== 0xFFD8) {
    return DEGREES[1]
  }

  idx += 2
  let maxBytes = scanner.byteLength
  while(idx < maxBytes - 2) {
    const uint16 = scanner.getUint16(idx)
    idx += 2
    switch(uint16) {
      case 0xFFE1: // Start of EXIF
        const exifLength = scanner.getUint16(idx)
        maxBytes = exifLength - idx
        idx += 2
        break
      case 0x0112: // Orientation tag
        // Read the value, its 6 bytes further out
        // See page 102 at the following URL
        // http://www.kodak.com/global/plugins/acrobat/en/service/digCam/exifStandard2.pdf
        const value = scanner.getUint16(idx + 6, false)
        maxBytes = 0 // Stop scanning
        return DEGREES[value]
        break
    }
  }
  return DEGREES[1]
}

// rotate image and scale fit
export const normalizeImage = async (file,
  maxWidth /*default img.naturalWidth*/,
  maxHeight /*default img.naturalHeight*/
) => {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')

  const pImg = new Promise(resolve => {
    const img = new Image
    // TODO onerror
    img.onload = () => resolve(img)
    img.src = URL.createObjectURL(file)
  })
  const pDeg = imageDegree(file)

  // parallel
  let deg = await pDeg
  const img = await pImg

  const { naturalWidth: w, naturalHeight: h } = img
  const scale = Math.min(1, maxWidth / w, maxHeight / h)
  if (deg % 180 === 0) {
    canvas.width = w * scale
    canvas.height = h * scale
  } else {
    canvas.width = h * scale
    canvas.height = w * scale
  }

  ctx.save()
  ctx.translate(canvas.width * 0.5, canvas.height * 0.5)
  ctx.rotate(deg * Math.PI / 180)
  ctx.drawImage(img, w * -0.5 * scale, h * -0.5 * scale, w * scale, h * scale)
  ctx.restore()

  return canvas
}

export const createRoundRect = (width, height, radious) => {
  const g = new PIXI.Graphics()
  g.lineStyle(0)
  g.beginFill(0xffffff, 1)
  g.drawRoundedRect(0, 0, width, height, radious)
  g.endFill()
  return g
}
