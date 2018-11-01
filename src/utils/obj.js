export const pick = (obj, keys) => {
  const val = {}
  const len = keys.length
  for (let i = 0; i < len; i++) {
    let key = keys[i]
    // only pick defined
    if (typeof obj[key] !== 'undefined') {
      val[key] = obj[key]
    }
  }
  return val
}

export class Deferred {
  constructor() {
    this.promise = new Promise((resolve, reject) => {
      this.resolve = resolve
      this.reject = reject
    })
  }
}
