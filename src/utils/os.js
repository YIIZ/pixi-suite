const ua = window.navigator.userAgent.toLowerCase()

function detectAndroid() {
  return /android/i.test(ua)
}

function detectIOS() {
  return /iphone|ipod|ipad/i.test(ua)
}

function detectWechat() {
  return /MicroMessenger/i.test(ua)
}

function detectWeibo() {
  return /WeiBo/i.test(ua)
}

function detectQQ() {
  const REGEXP_IOS_QQ = new RegExp('(iPad|iPhone|iPod).*? (IPad)?QQ\\/([\\d\\.]+)')
  const REGEXP_ANDROID_QQ = new RegExp('\\bV1_AND_SQI?_([\\d\\.]+)(.*? QQ\\/([\\d\\.]+))?', 'ig')
  return REGEXP_IOS_QQ.test(ua) || REGEXP_ANDROID_QQ.test(ua)
}

export const isAndroid = detectAndroid()
export const isIOS = detectIOS()

export const isWechat = detectWechat()
export const isQQ = detectQQ()
export const isWeibo = detectWeibo()

export default {
  isQQ,
  isWechat,
  isWeibo,
  isAndroid,
  isIOS,
}
