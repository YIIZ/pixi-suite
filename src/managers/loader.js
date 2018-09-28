import * as PIXI from 'pixi.js'
import { Deferred } from 'lib'

const loader = PIXI.loader
export const preload = (key) => {
  if (loader.resources[key]) {
    return loader.resources[key]
  }
  loader.add(key)
  return loader.resources[key]
}

const lazyLoader = new PIXI.loaders.Loader()
const resolveLoadPromise = (res, next) => {
  if (res.deferred) {
    res.deferred.resolve(res)
  }
  next()
}

lazyLoader.use(resolveLoadPromise)
export const load = (key) => {
  let item = loader.resources[key]
  if (item && item.isComplete) return item

  item = lazyLoader.resources[key]
  if (item) {
    return item
  }
  lazyLoader.add(key)
  item = lazyLoader.resources[key]
  item.deferred = new Deferred()
  lazyLoader.load()
  return item.deferred.promise
}

const run = loader.load
loader.run = run
loader.preload = preload
loader.load = load

export default loader
