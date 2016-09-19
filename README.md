A simple, performance optimized replacement for ```window.addEventListener('scroll', function(e) {...```

The premiss for this module is to utilize animation frames to trigger scroll callbacks in the appropriate render pipeline location of each frame.

Usage: 
```
import scroll from './../<location>'

scroll( (y, prevY) => {
}
```

The callback passed to the scroll function will get passed the current scrollY value (param 1) and the previous scrollY value (param 2). From this you will be able to ascertain scroll direction. 