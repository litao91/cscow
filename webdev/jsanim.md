# Animation Theory The basics

##How does it work
A number of DOM elements (`<img />`, `<div>`) are move around the page
according to some sort of pattern determined by a logical equation or
function.

To achieve, elements must be **moved at a given interval or frame
rate**.From a programming perspective, the simplest way to do this is to
set up an animation loop with a delay.

## Basic Animation
Let's say we have an obj called `foo` which refer to a `<div>`; we are
going to move this with function that is called every 20 msec via
`setTimeout`, this object is within a function called `doMove`

```javascript
function doMove() {
    foo.style.left = (foo.style.left + 10) + 'px';
    setTimeout(doMove, 20); //call doMove() in 20s
}
```

## Smooth Animation
Web browsers weren't really developed with DOM-based animation in mind;
repositioning and re-rendering an image or `<div>` means that a certain
amount of "reflow" has to happen, where the browser re-draw and
recalculate the positions.

The primary CPU drain stems from the browser's reflow/redaw response to
dynamic changes in the DOM.

## Creating Motion Tweens
Objects can be animated or morphed between one state and the next over a
period of time. This is where the term `Tween` comes in.

### A Simple Motion Tween

```javascript
var points = {
  // moving a box "from" and "to", eg. on the X coordinate
  'from': 200,
  'to': 300
}
var frameCount = 20; // move from X to Y over 20 frames
var frames = []; // array of coordinates we'll compute
// "dumb" tween: "move X pixels every frame"
var tweenAmount = (points.to - points.from)/frameCount;
for (var i=0; i<frameCount; i++) {
  // calculate the points to animate
  frames[i] = points.from+(tweenAmount*i); 
}
```

