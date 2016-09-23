import test from 'ava'
import scroll from './../browser/index.js'


//Test that requestAnimation Frame polyfill is working correctly
test('prefixRAF', t => {
  window.requestAnimationFrame = false
  window.webkitRequestAnimationFrame = function(){}

  let raf = scroll(false,false,{base:true}).isSupported()
  t.true(!!raf, 'webkit prefix set')
});

//Ensure that the exported function is adding to the cue appropiately
test('Queue length', t => {
  scroll( () => true, false, {reset:true} )
  let queue = scroll( () => true ).queue
  t.true( queue.length == 2, 'Queue length')
})

//Ensure that enable is getting called only when singleton is assigned
test('Event handler trigger', t => {
  let handlers

  handlers = scroll( () => true, false, {reset:true} ).handlers
  t.true( handlers == 1, 'Event handler length (when assigned)')

  scroll( () => true )
  scroll( () => true )
  scroll( () => true )
  handlers = scroll( () => true ).handlers
  t.true( handlers == 1, 'Event handler length (after more callbacks are passed)')
})

//Ensure that tickId is assigned
test('TickId assignment', t => {
  let tickId, error

  tickId = scroll( () => true, false, {reset:true, enable:false} ).tickId
  t.false( tickId, 'Tickid not set when enable = false')

  tickId = scroll( () => true ).tickId
  t.true( tickId, 'Tickid not set when enable = true')

  scroll( () => true )
  scroll( () => true )
  scroll( () => true )
  error = scroll( () => true ).lastError
  t.false( error, 'Tickid is not overridden')

  error = scroll().tick()
  error = scroll( () => true ).lastError
  t.truthy( error, 'Tickid has been overridden')
})
