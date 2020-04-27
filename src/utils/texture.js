import { Graphics, Texture, BaseTexture, resources } from 'pixi.js'

const { CanvasResource } = resources

export const createRoundRect = (width, height, radious, fill) => {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  ctx.fillStyle = fill || 'white'
  ctx.moveTo(0, radious)
  ctx.arcTo(0, 0, radious, 0, radious)
  ctx.lineTo(width - radious, 0)
  ctx.arcTo(width, 0, width, radious, radious)
  ctx.lineTo(width, height - radious)
  ctx.arcTo(width, height, width - radious, height, radious)
  ctx.lineTo(radious, height)
  ctx.arcTo(0, height, 0, height - radious, radious)
  ctx.lineTo(0, radious)
  ctx.fill()
  return new Texture(new BaseTexture(new CanvasResource(canvas)))
}

export const createCircleTexture = (radious = 100) => {
  const canvas = document.createElement('canvas')
  canvas.width = radious
  canvas.height = radious
  const ctx = canvas.getContext('2d')
  ctx.fillStyle = 'white'
  ctx.arc(radious / 2, radious / 2, radious / 2, 0, Math.PI * 2, true)
  ctx.fill()
  return new Texture(new BaseTexture(new CanvasResource(canvas)))
}

export const CIRCLE = createCircleTexture()
