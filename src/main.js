let requestFrame = window.requestAnimationFrame
let cancelFrame  = window.cancelAnimationFrame
let scrollChanged, y, prevY = -1, idle = true, queue = [], timeout, tickId, init = false

if (!requestFrame) {
  ['ms', 'moz', 'webkit', 'o'].every(prefix => {
    requestFrame = window[prefix + 'RequestAnimationFrame'];
    cancelFrame  = window[prefix + 'CancelAnimationFrame'] ||
                   window[prefix + 'CancelRequestAnimationFrame'];
    return !requestFrame;
  })
}

const isSupported = !!requestFrame

const enable = () => {
  window.addEventListener('scroll', debounce)
  document.body.addEventListener('touchmove', debounce)
}

const disable = () => {
  window.removeEventListener('scroll', debounce)
  document.body.removeEventListener('touchmove', debounce)
}

const debounce = () => {
  if (!tickId){
    disable()
    tick()
  }
}

const tick = () => {
  tickId = requestFrame(handleScroll)
}

const handleScroll = () => {
  y = window.pageYOffset
  queue.forEach( fn => fn(y, prevY) )

  scrollChanged = false
  if (prevY != y){
    scrollChanged = true
    prevY = y
  }

  if (scrollChanged){
    clearTimeout(timeout)
    timeout = null
  } else if (!timeout){
    timeout = setTimeout(detectIdle, 200)
  }

  tick()
}

const detectIdle = () => {
  cancelFrame(tickId)
  tickId = null
  enable()
}

export default cb => {
  if (isSupported){
    queue.push(cb)
    if (!init){
      init = true
      debounce()
      enable()
    }
  } else {
    console.warn('Request Animation Frame not supported')
  }
}