let requestFrame = window.requestAnimationFrame
let cancelFrame  = window.cancelAnimationFrame

let singleton, debounce, detectIdle, handleScroll

class Scroll{
  constructor(){
    this.queue = []
    this.tickId = false
    this.scrollChanged = false
    this.prevY = -1
    this.timeout = null
    this.handlers = 0
    this.lastError = false

    debounce = () => this.debounce()
    detectIdle = () => this.detectIdle()
    handleScroll = () => this.handleScroll()
  }

  /*
   * Add functions into an array.
   * These will be called in the RAF
   *
   * @param {function} cb function to call
   * @param {string} key key to reference the function (todo)
   */
  add(cb,key){
    this.queue.push(cb)
  }

  /* Tracks the event handlers attached via
   * this module
   */
  enable(){
    window.addEventListener('scroll', debounce)
    document.body.addEventListener('touchmove', debounce)
    this.handlers++
  }
  disable(){
    window.removeEventListener('scroll', debounce)
    document.body.removeEventListener('touchmove', debounce)
    this.handlers--
  }
  debounce(){
    if (this.tickId){
      return false
    } else {
      if (this.handlers > 0) this.disable()
      this.tick()
      return true
    }
  }
  tick(){
    if (this.tickId){
      this.error('requestFrame called when one exists already')
    } else {
      this.tickId = requestFrame(handleScroll) || true
    }
  }

  /* The nuts n' bolts. This is the RAF that
   * calls each function in the queue. Each function
   * is passed the current offset value and the last
   * recorded offset value (often the same depending)
   * on the speed of the scroll)
   */
  handleScroll(){
    let y = window.pageYOffset
    this.queue.forEach( fn => fn(y, this.prevY) )

    this.scrollChanged = false
    if (this.prevY != y){
      this.scrollChanged = true
      this.prevY = y
    }

    if (this.scrollChanged){
      clearTimeout(this.timeout)
      this.timeout = null
    } else if (!this.timeout){
      this.timeout = setTimeout(detectIdle, 200)
    }

    this.tickId = false
    this.tick()
  }

  /* If the user hasn't scrolled in a while
   * we want to exit out of the RAF requence
   * and re-attach event bindings
   */
  detectIdle(){
    cancelFrame(this.tickId)
    this.tickId = null
    this.enable()
  }
  error(msg){
    this.lastError = msg
    console.warn(msg)
  }

  /*
   * @static
   */
  static isSupported(){
    if (!requestFrame) {
      ['ms', 'moz', 'webkit', 'o'].every(prefix => {
        requestFrame = window[prefix + 'RequestAnimationFrame'];
        cancelFrame  = window[prefix + 'CancelAnimationFrame'] ||
                       window[prefix + 'CancelRequestAnimationFrame'];
        return !requestFrame;
      })

    }
    return requestFrame
  }
}

/*
 * This singleton pattern
 * allows us to unit test the module
 * by exposing all methods. The reset property
 * allows us to reset the state of the singleton
 * between tests.. May be useful outside of the 
 * testing context?
 *
 * @param {function} cb function to add to queue
 * @param {key} key key to reference the function in the queue
 * @param {bool} obj:base Return the base class or the singleton?
 * @param {bool} obj:reset Reset the singleton so that a new instance in created
 * @param {bool} obj:enable Enable the event handler and start the animation frame
 */
export default (cb=false,key=false,{base=false,reset=false,enable=true}={}) => { 
  if (reset) singleton = null

  if ( !Scroll.isSupported() ){
    console.warn('Request Animation Frame not supported')
    return false
  }

  if (!singleton) singleton = new Scroll()

  if (cb) singleton.add(cb,key)

  if (singleton.handlers < 1 && enable){
    singleton.debounce()
    singleton.enable()
  }

  return base ? Scroll : singleton
}
