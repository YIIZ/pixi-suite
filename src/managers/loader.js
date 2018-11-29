import * as PIXI from 'pixi.js'
import { Deferred } from '../utils/obj'

const loader = PIXI.loader
export const preload = (key, url) => {
  if (loader.resources[key]) {
    return loader.resources[key]
  }
  loader.add(key, url)
  return loader.resources[key]
}

const lazyLoader = new PIXI.loaders.Loader()
const resolveLoadPromise = (res, next) => {
  if (res.deferred) {
    res.deferred.resolve(res)
  }
  next()
}

export const preloadAll = (ctx, filter) => {
  return ctx.keys().map((key) => {
    if (filter && !filter.test(key)) {
      ctx(key)
      return
    }
    return preload(ctx(key))
  })
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
loader.preloadAll = preloadAll
loader.load = load

export default loader
