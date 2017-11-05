module.exports.getSlideFromGotoData = function(data){
  if("undefined" !== typeof data && "undefined" !== typeof data.step){
    return data.step;
  }
  return null;
}

module.exports.getSlidesTree = function(html) {
  if("undefined" == typeof html){
    throw new Error ('html should be defined')
  }

  var slidesTree = {};
  slidesTree.allSubsteps={};

  var $ = require('cheerio').load(html, {
    decodeEntities: false,
    lowerCaseAttributeNames:false,
    lowerCaseTags:false,
    recognizeSelfClosing: true
  });
  
  var sections = $('.reveal .slides > section');
  var steps = [];

  // original steps array
  sections.each(function(idx, el){
    $el = $(el);
    $el.find('section').map

    if ( $el.find('> section').length > 0 ) {
      $el.find('> section').each(function(idx, slide){
        steps.push(slide)
      });
    } else {
      steps.push(el)
    }
  });

  
  steps.forEach(function(slide, idx){
    var $slide = $(slide);
    if ( typeof $slide.attr('id') == 'undefined' || $slide.attr('id').trim() == '') {
      $slide.attr('id', 'step-' + (idx + 1));
    }

    // generate substeps Object
    var elSubs = slidesTree.allSubsteps[$slide.attr('id')] = Object.create(null);
    elSubs.substeps = getSubSteps($, $slide);
    elSubs.active = -1;
  });


  slidesTree.steps = steps.map(function(slide) {
    return $(slide).attr('id')
  });

  return slidesTree;

  function getSubSteps($, $el) {
    var substeps = $el.find('> .fragment').toArray();
    return substeps.map(function(sub) {
      return $(sub).attr('id');
    });
  }

}
