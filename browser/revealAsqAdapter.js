'use strict';

	var debug = require('bows')('asqRevealAdapter');

	var initiator = require('./asq-reveal-initiator');

	var asqRevealAdapter = module.exports = function(asqSocket, slidesTree, standalone, offset, role) {
	  if ( insideRevealNote() ) {
	    return;
	  }

	  standalone = standalone || false;
	  offset = offset || 0;
	  slidesTree = slidesTree || getSlidesTree();

	  debug('asqRevealAdapter', slidesTree);

	  var steps = slidesTree.steps
	  var allSubsteps = slidesTree.allSubsteps;

	  var revealPatched = false;

	  var fingerprint = getFingerprint(role);

	  if (! standalone) {
	    // patch reveal.js when it's ready
	    patchReveal();
	  } else {
	    // TODO
	  }

	  asqSocket.onGoto(onAsqSocketGoto);
		asqSocket.onAddSlide(onAsqSocketAddSlide);
    asqSocket.onRemoveSlide(onAsqSocketRemoveSlide);

	  initiator(role, null);

	  return {
	    goto: goto
	  }


	  function getRandomString() {
	    return Math.floor((1 + Math.random()) * 0x100000000).toString(16);
	  }

	  function getFingerprint(role) {
	    return role + getRandomString() + window.location.pathname + window.location.search;
	  }

	  function insideRevealNote() {
	    return window.parent !== window.self;
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

	      debug("goto #" + id + ' ( ' + state.indexh + ', ' + state.indexv + ', ' + state.indexf + ' )');
	      asqSocket.emitGoto({
	        _flag: fingerprint,
	        id: id,
	        state: state,
	        isAutoSliding: Reveal.isAutoSliding()
	      });

	      return { id: id, state: state };
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
	    debug('@@ onAsqSocketGoto @@', data);
	    if("undefined" === typeof data || data === null){
	      debug("data is undefined or null");
	      return;
	    }
	    if ( data._flag === fingerprint ) {
	      return
	    }

	    if (data.hasOwnProperty('isAutoSliding')) {
	      if (data.isAutoSliding !== Reveal.isAutoSliding()) {
	        Reveal.toggleAutoSlide()
	      }
	    }

	    if (typeof Reveal.goto === 'function') {
	      if (data.hasOwnProperty('state')) {
	        Reveal.goto(data.state);
	      } else if (data.hasOwnProperty('step')) {
	        Reveal.goto(data.step);
	      }

	      var times = offset;
	      while (times-- >0 ){
	        Reveal.next();
	      }
	    }
	  };

		function onAsqSocketAddSlide(data) {
			addSlide(data);
		}

		function addSlide(data) {
      if (!document.getElementById(data.id)) {
        var dom = {};
        dom.slides = document.querySelector('.reveal .slides');
        var newSlide = document.createElement('section');
				newSlide.style.width = '960px';
				newSlide.style.height = '700px';

        if(data.index == document.querySelector('.reveal .slides').children.length) {
          // add slide at the end of the presentation
          newSlide.classList.add('future');
          dom.slides.appendChild(newSlide);
          document.querySelector('.navigate-right').classList.add('enabled');
        }
        else {
          // add slide at a given index
          newSlide.classList.add('future');
          dom.slides.insertBefore(newSlide,dom.slides.querySelector('section:nth-child('+(data.index+1)+')'));
        }
        newSlide.innerHTML = data.content;
        newSlide.id = data.id;
        if (!data.getSlides && !data.printing) {
          if (data.index == document.querySelector('.reveal .slides').children.length - 1) {
            while (!Reveal.isLastSlide()) Reveal.next();
          }
          else {
            Reveal.next();
          }
        }
      }
    }

    function onAsqSocketRemoveSlide(data) {
      var toRemove = document.getElementById(data.id);
      toRemove.parentNode.removeChild(toRemove);
      Reveal.prev();
    }

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


	  /**
	   * A wrapper function used to navigate the slde.
	   * The arguments can be either a ID of slide, indices
	   * or an indices object.
	   */
	  function goto ( ) {
	    var args = toArray(arguments);
	    if ( _.isEqual(Reveal.getState(), args[0]) ) return;
	    // use case 1: goto('an_id_of_a_slide_without_#')
	    if ( typeof args[0] === 'string' ) {
	      var steps = getSlidesTree().steps;
	      if ( steps.indexOf(args[0]) < 0 ) return;
	      var indices = window.Reveal.id2Indices(args[0]);
	      if ( indices == null ) return;
	      window.Reveal.slide(indices.indexh, indices.indexv, indices.indexf);
	    }
	    // use case 2: goto(h, v, f)
	    else if ( typeof args[0] === 'number' ) {
	      window.Reveal.slide(args[0], args[1], args[2]);
	    }
	    // use case 3: goto( state_object )
	    else if ( typeof args[0] === 'object' && typeof args[0].indexh == 'number' ) {
	      window.Reveal.setState(args[0]);
	    }
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
	      return undefined
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
