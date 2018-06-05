'use strict';

function getParameterByName(name) {
  name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
  var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
    results = regex.exec(location.search);
  return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

module.exports = function(role, params) {
  if (!role) {
    role = getParameterByName('role');
  }

  role = role ? role : 'viewer';
  
  var revealjsPath = 'reveal.js/';

  var transition = 'slide';
  if (params) {
    transition = params['transition'] ? params['transition'] : 'slide';
  }
  

  var dependencies = {
    'common': [
      { src: revealjsPath + 'lib/js/classList.js', condition: function() { return !document.body.classList; } },
      { src: revealjsPath + 'plugin/markdown/marked.js', condition: function() { return !!document.querySelector( '[data-markdown]' ); } },
      { src: revealjsPath + 'plugin/markdown/markdown.js', condition: function() { return !!document.querySelector( '[data-markdown]' ); } },
      { src: revealjsPath + 'plugin/highlight/highlight.js', async: false, callback: function() { hljs.initHighlightingOnLoad(); } },
      { src: revealjsPath + 'plugin/zoom-js/zoom.js', async: false },
    ],
    'presenter-only': [ 
    // { src: revealjsPath + 'plugin/notes/notes.js', async: false } 
    ],
    'viewer-only': []
  };

  var revealSettings = Object.create(null);

  revealSettings['presenter'] = {
    controls: true,
    progress: true,
    history: true,
    center: true,

    transition:  transition, // none/fade/slide/convex/concave/zoom

    dependencies: dependencies['common'].concat(dependencies['presenter-only'])
  };
  
  revealSettings['viewer'] = {
    controls: false,
    progress: true,
    history: true,
    center: true,

    transition: transition, // none/fade/slide/convex/concave/zoom

    dependencies: dependencies['common'].concat(dependencies['viewer-only']),

    keyboard: false
  }
  Reveal.initialize(revealSettings[role]);

  // prevent the viewers from viewing an unauthorized slide by changing the hash
  if (role !== 'presenter') {
    Reveal.addEventListener('ready', function() {
      Reveal.removeEventListeners();
    });
  }
}