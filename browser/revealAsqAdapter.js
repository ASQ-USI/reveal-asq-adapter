'use strict';

var debug = require('bows')("asqRevealAdapter");

var initiator = require('./asq-reveal-initiator');

var asqRevealAdapter = module.exports = function(asqSocket, slidesTree, standalone, offset, role) {
  if ( insideRevealSpeakerNote() ) {
    // if it is inside the Reveal.js's speaker note，is should not be patched to avoid the bouncing events
    initiator(role, null);
    return;
  }
  standalone = standalone || false;
  offset = offset || 0;
  slidesTree = slidesTree || getSlidesTree();

  var steps = null;
  var allSubsteps = null;
  var activeStep = null;

  steps = slidesTree.steps;
  allSubsteps = slidesTree.allSubsteps;

  var revealPatched = false;

  var fingerprint = getFingerprint(standalone ? '_standalone_' : role );

  if (! standalone) {
    // patch reveal.js when it's ready
    patchReveal();
    initiator(role, null);
  } else {
    // TODO  
    var initStep = role;
    var firstStep = getElementFromHash() || initStep || steps[0];
    broadcast(firstStep);

    document.addEventListener('keyup', onKeyUp, false);
  }

  asqSocket.onGoto(onAsqSocketGoto);

  return {
    goto: goto,
    destroy: destroy,
  }

  function onKeyUp(){
    if(event.target == document.body){
      if ( event.keyCode === 9 || ( event.keyCode >= 32 && event.keyCode <= 34 ) || (event.keyCode >= 37 && event.keyCode <= 40) ) {

        event.preventDefault();

        switch( event.keyCode ) {
          case 33: // pg up
          case 37: // left
          case 38: // up
            prev();
            break;
          case 9:  // tab
          case 32: // space
          case 34: // pg down
          case 39: // right
          case 40: // down
            next();
            break;
        }
      }
    }
  }

  // broadcast the goto event from headless mode
  function broadcast(step, subIdx) {
    var id = null;
    if (step === null || typeof step === 'undefined' || 'string'!== typeof (id = getStep(step))) {
      if((subIdx === null || subIdx === undefined || isNaN(subIdx))){
        return null;
      }
    }

    activeStep = id || activeStep;
    allSubsteps[activeStep].active = (!isNaN(subIdx)) ? subIdx : -1;

    asqSocket.emitGoto({
      _flag: fingerprint,
      step: activeStep,
      substepIdx: allSubsteps[activeStep].active,
    });
    return activeStep;
  }

  function getStep(step) {
    if (typeof step === 'number') {
        step = step < 0 ? steps[ steps.length + step] : steps[ step ];
    } else if (typeof step === 'string') {
        step = (steps.indexOf(step) > -1) ? step: null
    }
    return step ? step : null;
  }

  // broadcast the goto event (next) from headless mode
  function next () {
    var subactive, substeps;
    
    substeps = allSubsteps[activeStep].substeps || [];

    // if we have substeps deal with them first
    if (substeps.length && ((subactive = allSubsteps[activeStep].active) !== (substeps.length - 1))) {
      if(isNaN(subactive) || (subactive==null)){
          subactive = -1;
      }
      return broadcast(null, ++subactive);
    }

    // no substeps or substeps are over. Go to the next step
    var next = steps.indexOf( activeStep ) + 1;
    next = next < steps.length ? steps[ next ] : steps[ 0 ];

    return broadcast(next, -1);
  };

  // broadcast the goto event (prev) from headless mode
  function prev() {
    var subactive, substeps;
    
    substeps = allSubsteps[activeStep].substeps || [];

    //if we have substeps deal with them first
    if (substeps.length && ((subactive = allSubsteps[activeStep].active) || (subactive === 0))) {
      if (subactive >=0) {
        --subactive; 
        return broadcast(null, subactive)
      }
    }

    //no substeps or we are at the first substep. Go to the previous step
    var prev = steps.indexOf( activeStep ) - 1;
    prev = prev >= 0 ? steps[ prev ] : steps[ steps.length-1 ];

    var prevSubsteps = allSubsteps[prev].substeps || [];
    return broadcast(prev, (prevSubsteps.length -1));
  };

  function destroy(){
    if(standalone){
      document.removeEventListener('keyup', onKeyUp);
    } else {
      Reveal.removeEventListener('slidechanged', slideChangedHandler);
      Reveal.removeEventListener('fragmentshown', slideChangedHandler);
      Reveal.removeEventListener('fragmenthidden', slideChangedHandler);
      Reveal.removeEventListener('overviewhidden', slideChangedHandler);
      Reveal.removeEventListener('overviewshown', slideChangedHandler);
      Reveal.removeEventListener('paused', slideChangedHandler);
      Reveal.removeEventListener('resumed', slideChangedHandler);
    }

    asqSocket.offGoto(onAsqSocketGoto);
  }

  // `getElementFromHash` returns an element located by id from hash part of
  // window location.
  function getElementFromHash() {
    // get id from url # by removing `#` or `#/` from the beginning,
    // so both "fallback" `#slide-id` and "enhanced" `#/slide-id` will work
    return window.location.hash.replace(/^#\/?/,"");
  };

  function getRandomString() {
    return Math.floor((1 + Math.random()) * 0x100000000).toString(16);
  }

  function getFingerprint(role) {
    return role + getRandomString() + window.location.pathname + window.location.search;
  }

  function insideRevealSpeakerNote() {
    // To determine if we're on a reveal.js speaker-notes window we test if the url contains
    // the search parameter 'receiver'
    // See https://github.com/ASQ-USI-Elements/examples/blob/master/SamplePresentation-reveal/reveal.js/plugin/notes/notes.html#L283

    return window.location.search.indexOf('receiver') >= 0;
  }

  // `patchReveal` patches the reveal.js api so that external scripts
  // that use goto to go through the adapter.
  function patchReveal(){
    if ( revealPatched ) return;
    
    // TODO reveal:ready
    if (typeof window.Reveal === 'undefined' || window.Reveal == null 
        || typeof window.Reveal.isReady != 'function' || !window.Reveal.isReady() ) {
      document.addEventListener("ready", patchReveal);
      return;
    }
    var Reveal = window.Reveal;

    document.removeEventListener("ready", patchReveal);

    Reveal.goto = goto;
    Reveal.indices2Id = indices2Id;
    Reveal.id2Indices = id2Indices;
    
    var slideChangedHandler = function(evt) {
      var state = Reveal.getState();
      
      var id = Reveal.indices2Id(state.indexh, state.indexv, state.indexf);

      activeStep = id;
      var substepIdx = Number.isInteger(state.indexf) ? state.indexf : -1;

      asqSocket.emitGoto({
        _flag: fingerprint,
        step: activeStep,
        substepIdx: substepIdx,
        isAutoSliding: Reveal.isAutoSliding(),
      });

      return activeStep;
    }

    if (window.location.search.indexOf('role=presenter') >= 0) {
      Reveal.addEventListener('slidechanged', slideChangedHandler);
      Reveal.addEventListener('fragmentshown', slideChangedHandler);
      Reveal.addEventListener('fragmenthidden', slideChangedHandler);
      Reveal.addEventListener('overviewhidden', slideChangedHandler);
      Reveal.addEventListener('overviewshown', slideChangedHandler);
      Reveal.addEventListener('paused', slideChangedHandler);
      Reveal.addEventListener('resumed', slideChangedHandler);
    }

    revealPatched = true;
  }

  function onAsqSocketGoto(data){
    if("undefined" === typeof data || data === null){
      return;
    }

    if ( data._flag === fingerprint ) {
      return
    }

    if (!standalone && data.hasOwnProperty('isAutoSliding')) {
      if (data.isAutoSliding !== Reveal.isAutoSliding()) {
        Reveal.toggleAutoSlide()
      }
    }

    if (!!window.Reveal && typeof window.Reveal.goto === 'function') {
      Reveal.goto(data.step, data.substepIdx);

      var times = offset;
      while (times-- >0 ) {
        Reveal.next();
      }
    } else if (!standalone) {
      // if the Reveal has not been patched yet, we will wait for 200ms and check again
      setTimeout(function() {
        onAsqSocketGoto(data);
      }, 200);
    } else {
      activeStep = data.step || activeStep;
      allSubsteps[activeStep].active = Number.isInteger(data.substepIdx) ? data.substepIdx : -1;
    } 
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
    return substeps.map(function(sub) {
        return sub.id;
    });
  }

  function toArray( o ) {
    return Array.prototype.slice.call( o );
  }

  /**
   * A wrapper function used to navigate the slde.
   * The arguments can be either a ID of slide, indices 
   * or an indices object.
   */
  function goto (step, substepIdx) {
    var indices = window.Reveal.id2Indices(step);

    if (indices === null) {
      return;
    }

    if (!standalone) {
      var currentState = window.Reveal.getState();
      if (_.isEqual(indices2Id(currentState), step) && substepIdx === currentState.indexf) {
        return;
      }
    } else {
      if (activeStep === step && allSubsteps[activeStep].active === substepIdx) {
        return;
      }
    }

    activeStep = step || activeStep;
    allSubsteps[activeStep].active = Number.isInteger(substepIdx) ? substepIdx : -1;

    indices.f = substepIdx;

    window.Reveal.slide(indices.h, indices.v, indices.f);
  }

  // Helper function that translates slides indices 
  // into ID.
  function indices2Id(h, v, f) {
    if ( typeof h == 'object' ) {
      f = h.indexf;
      v = h.inxexv;
      h = h.indexh;
    }

    v = typeof v == 'undefined' ? 0 : v;

    var slide = Reveal.getSlide(h, v, f);
    if ( typeof slide  == 'undefined' || slide == null ) {
      return undefined
    }

    return slide.id
  }

  function id2Indices(id) {
    var slide = document.querySelector('#'+id);
    if ( typeof slide  == 'undefined' || slide == null ) {
      return null;
    }
    return Reveal.getIndices(slide);
  }

  function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
      results = regex.exec(location.search);
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
  }
}
