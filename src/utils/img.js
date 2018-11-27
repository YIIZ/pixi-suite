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

function getStringFromDB(buffer, start, length) {
    let outstr = ''
    for (let n = start; n < start+length; n++) {
        outstr += String.fromCharCode(buffer.getUint8(n))
    }
    return outstr
}

const debug = process.env.NODE_ENV === 'development'

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
  while (idx < maxBytes - 2) {
    if (scanner.getUint8(idx) != 0xFF) {
      if (debug) console.log('Not a valid marker at idx ' + idx + ', found: ' + scanner.getUint8(idx))
      return DEGREES[0] // not a valid marker, something is wrong
    }
    let marker = scanner.getUint8(idx + 1)
    if (debug) console.log('marker', marker)
    // we could implement handling for other markers here,
    // but we're only looking for 0xFFE1 for EXIF data
    if (marker == 0xE1) {
      // Found 0xFFE1 marker, do next
      break
    } else {
      idx += 2 + scanner.getUint16(idx+2)
    }
  }

  idx += 4
  if (getStringFromDB(scanner, idx, 4) != 'Exif') {
    if (debug) console.log('Not valid EXIF data! ' + getStringFromDB(scanner, idx, 4))
    return DEGREES[0]
  }

  while(idx < maxBytes - 2) {
    const uint16 = scanner.getUint16(idx)
    idx += 2
    if (uint16 === 0x0112) {
      // Read the value, its 6 bytes further out
      // See page 102 at the following URL
      // http://www.kodak.com/global/plugins/acrobat/en/service/digCam/exifStandard2.pdf
      const value = scanner.getUint16(idx + 6, false)
      console.log('Orientation tag', value)
      return DEGREES[value]
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
  let deg = await pDeg || 0
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
  console.log('degree', deg, 'width', w, 'height', h)

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
