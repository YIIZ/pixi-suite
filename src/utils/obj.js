export const pick = (obj, keys, onlyDefined) => {
  const val = {}
  const len = keys.length
  for (let i = 0; i < len; i++) {
    let key = keys[i]
    if (!onlyDefined || (typeof obj[key] !== 'undefined')) {
      val[key] = obj[key]
    }
  }
  return val
}
