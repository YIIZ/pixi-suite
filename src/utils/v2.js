// https://github.com/cocos-creator/engine/blob/4f734a806d1fd7c4073fb064fddc961384fe67af/cocos2d/core/value-types/vec2.js#L526
import { Point } from 'pixi.js'

export function polar2cartesian(r, rad) {
  const x = r * Math.cos(rad)
  const y = r * Math.sin(rad)
  return new Point(x, y)
}

export function singleAngle(p1, p2) {
  const ag = angle(p1, p2)
  return cross(p1, p2) < 0 ? -ag : ag
}

export function magSqr(p) {
  return p.x * p.x + p.y * p.y
}

export function scale(p, r) {
  return new Point(p.x * r, p.y * r)
}

export function add(p1, p2) {
  return new Point(p1.x + p2.x, p1.y + p2.y)
}

export function subtract(p1, p2) {
  return new Point(p1.x - p2.x, p1.y - p2.y)
}

export function radianToDegree(r) {
  const d = (r / Math.PI) * 180
  if (d < 0) return 360 + d
  return d
}

export function angle(p1, p2) {
  const magSqr1 = magSqr(p1)
  const magSqr2 = magSqr(p2)

  if (magSqr1 === 0 || magSqr2 === 0) {
    console.warn("Can't get angle between zero vector")
    return 0.0
  }

  const dot = p1.x * p2.x + p1.y * p2.y
  let theta = dot / Math.sqrt(magSqr1 * magSqr2)
  theta = clampf(theta, -1.0, 1.0)
  return Math.acos(theta)
}

export function radian(p1, p2) {
  const d = distance(p1, p2)
  return Math.acos((p2.x - p1.x) / d)
}

export function cross(p1, p2) {
  return p1.x * p2.y - p1.y * p2.x
}

export function clampf(value, min_inclusive, max_inclusive) {
  if (min_inclusive > max_inclusive) {
    const temp = min_inclusive
    min_inclusive = max_inclusive
    max_inclusive = temp
  }
  return value < min_inclusive ? min_inclusive : value < max_inclusive ? value : max_inclusive
}

export function distance(p1, p2) {
  const x = p1.x - p2.x
  const y = p1.y - p2.y
  return Math.sqrt(x * x + y * y)
}

export function gravity(p1, p2) {
  return new Point((p1.x + p2.x) * 0.5, (p1.y + p2.y) * 0.5)
}

export function randInt(min, max) {
  return Math.floor(Math.random() * (max - min) + min)
}
