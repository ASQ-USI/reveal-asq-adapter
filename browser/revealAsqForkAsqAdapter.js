'use strict';

var debug = require('bows')("asqImpressAdapter");

var asqRevealAdapter = module.exports = function(asqSocket, slidesTree, standalone, offset) {
  standalone = standalone || false;
  offset = offset || 0;
  slidesTree = slidesTree || getSlidesTree();

  steps = slidesTree.steps
  allSubsteps = slidesTree.allSubsteps;

  if (! standalone) {
    // patch reveal.js when it's ready
    patchReveal();
  } else {
    var firstStep = getStep(getElementFromHash()) || steps[0];
    goto(firstStep, null, 0);
  }

  asqSocket.onGoto(onAsqSocketGoto);

  return {
    goto: goto
  }
}

// `patchReveal` patches the reveal.js api so that external scripts
// that use goto, next and prev go through the adapter.
function patchReveal(){
  if ( revealPatched ) return;
  
  // TODO reveal:ready
  if (typeof window.Reveal === 'undefined' || window.Reveal == null 
      || typeof window.Reveal.isReady != 'function' || !window.Reveal.isReady() ) {
    document.addEventListener("ready", patchReveal);
    return;
  }

  document.removeEventListener("ready", patchReveal);

  debug("reveal patched");

  var _revealOrig = window._revealOrig = window.Reveal;

  window.Reveal = {
    prev : prev,
    next : next,
    left : left,
    right: right,
    up   : up,
    down : down,
    goto : slide,

    prevFragment: previousFragment,
    nextFragment: nextFragment,

    prevOrig : _revealOrig.prev,
    nextOrig : _revealOrig.next,
    leftOrig : _revealOrig.left,
    rightOrig: _revealOrig.right,
    upOrig   : _revealOrig.up,
    downOrig : _revealOrig.down,
    gotoOrig : _revealOrig.slide,

    prevFragmentOrig: _revealOrig.previousFragment,
    nextFragmentOrig: _revealOrig.nextFragment,


  }

  revealPatched = true;

  goto(0, 0, 0)
}

function onAsqSocketGoto(data){

};

function getSlidesTree() {
  var slidesTree = {};
  slidesTree.allSubsteps={};

  var sections = toArray(document.querySelectorAll('.reveal .slides > section'));
  var steps = [];

  // original steps array
  sections.forEach(function(section, index){
      if ( section.querySelector('section') ) {
          toArray(section.querySelectorAll('section')).forEach(function(slide){
              steps.push(slide)
          });
      } else {
          steps.push(section)
      }
  });

  
  steps.forEach(function(slide, index){
      if ( typeof slide.id == 'undefined' || slide.id.trim() == '') {
          slide.id = 'step-' + (index + 1)
      }

      // generate substeps Object
      var elSubs = slidesTree.allSubsteps[slide.id] = Object.create(null);
      elSubs.substeps = getSubSteps(slide);
      elSubs.active = -1;
  });


  slidesTree.steps = steps.map(function(slide) {
      return slide.id
  });

  return slidesTree;
}

function getSubSteps(el) {
  var substeps = toArray(el.querySelectorAll('.fragment'));
  return substeps.map(function() {
      return ''
  });
}

function toArray( o ) {
  return Array.prototype.slice.call( o );
}

// `goto` function that moves to step given with `el` parameter (ONLY id),
// moves to substep given with subIdx (by index),
// with a transition `duration` optionally given as second parameter.
function goto ( h, v, f ) {

  debug("goto ( "+ h + ', ' + v + ', ' + f + ' )');
  asqSocket.emitGoto({h: h, v: v, f: f})
  return {h: h, v: v, f: f};
}

function prev() {

}

function next () {
  
}

function left() {

}

function right() {

}

function up() {

}

function down() {

}