// Generated by uRequire v0.7.0-beta.33 target: 'umd' template: 'combined'
// Combined template optimized with RequireJS/r.js v2.2.0 & almond v0.3.3.
(function (global, window){
  
var __isAMD = !!(typeof define === 'function' && define.amd),
    __isNode = (typeof exports === 'object'),
    __isWeb = !__isNode;


  var __nodeRequire = (__isNode ? require : function(dep){
        throw new Error("uRequire: combined template 'umd', trying to load `node` dep `" + dep + "` in non-nodejs runtime (browser).")
      }),
      __throwMissing = function(dep, vars) {
        throw new Error("uRequire: combined template 'umd', detected missing dependency `" + dep + "` - all it's known binding variables `" + vars + "` were undefined")
      },
      __throwExcluded = function(dep, descr) {
        throw new Error("uRequire: combined template 'umd', trying to access unbound / excluded `" + descr + "` dependency `" + dep + "` on browser");
      };
var bundleFactory = function(bows) {
/**
 * @license almond 0.3.3 Copyright jQuery Foundation and other contributors.
 * Released under MIT license, http://github.com/requirejs/almond/LICENSE
 */
//Going sloppy to avoid 'use strict' string cost, but strict practices should
//be followed.
/*global setTimeout: false */

var requirejs, require, define;
(function (undef) {
    var main, req, makeMap, handlers,
        defined = {},
        waiting = {},
        config = {},
        defining = {},
        hasOwn = Object.prototype.hasOwnProperty,
        aps = [].slice,
        jsSuffixRegExp = /\.js$/;

    function hasProp(obj, prop) {
        return hasOwn.call(obj, prop);
    }

    /**
     * Given a relative module name, like ./something, normalize it to
     * a real name that can be mapped to a path.
     * @param {String} name the relative name
     * @param {String} baseName a real name that the name arg is relative
     * to.
     * @returns {String} normalized name
     */
    function normalize(name, baseName) {
        var nameParts, nameSegment, mapValue, foundMap, lastIndex,
            foundI, foundStarMap, starI, i, j, part, normalizedBaseParts,
            baseParts = baseName && baseName.split("/"),
            map = config.map,
            starMap = (map && map['*']) || {};

        //Adjust any relative paths.
        if (name) {
            name = name.split('/');
            lastIndex = name.length - 1;

            // If wanting node ID compatibility, strip .js from end
            // of IDs. Have to do this here, and not in nameToUrl
            // because node allows either .js or non .js to map
            // to same file.
            if (config.nodeIdCompat && jsSuffixRegExp.test(name[lastIndex])) {
                name[lastIndex] = name[lastIndex].replace(jsSuffixRegExp, '');
            }

            // Starts with a '.' so need the baseName
            if (name[0].charAt(0) === '.' && baseParts) {
                //Convert baseName to array, and lop off the last part,
                //so that . matches that 'directory' and not name of the baseName's
                //module. For instance, baseName of 'one/two/three', maps to
                //'one/two/three.js', but we want the directory, 'one/two' for
                //this normalization.
                normalizedBaseParts = baseParts.slice(0, baseParts.length - 1);
                name = normalizedBaseParts.concat(name);
            }

            //start trimDots
            for (i = 0; i < name.length; i++) {
                part = name[i];
                if (part === '.') {
                    name.splice(i, 1);
                    i -= 1;
                } else if (part === '..') {
                    // If at the start, or previous value is still ..,
                    // keep them so that when converted to a path it may
                    // still work when converted to a path, even though
                    // as an ID it is less than ideal. In larger point
                    // releases, may be better to just kick out an error.
                    if (i === 0 || (i === 1 && name[2] === '..') || name[i - 1] === '..') {
                        continue;
                    } else if (i > 0) {
                        name.splice(i - 1, 2);
                        i -= 2;
                    }
                }
            }
            //end trimDots

            name = name.join('/');
        }

        //Apply map config if available.
        if ((baseParts || starMap) && map) {
            nameParts = name.split('/');

            for (i = nameParts.length; i > 0; i -= 1) {
                nameSegment = nameParts.slice(0, i).join("/");

                if (baseParts) {
                    //Find the longest baseName segment match in the config.
                    //So, do joins on the biggest to smallest lengths of baseParts.
                    for (j = baseParts.length; j > 0; j -= 1) {
                        mapValue = map[baseParts.slice(0, j).join('/')];

                        //baseName segment has  config, find if it has one for
                        //this name.
                        if (mapValue) {
                            mapValue = mapValue[nameSegment];
                            if (mapValue) {
                                //Match, update name to the new value.
                                foundMap = mapValue;
                                foundI = i;
                                break;
                            }
                        }
                    }
                }

                if (foundMap) {
                    break;
                }

                //Check for a star map match, but just hold on to it,
                //if there is a shorter segment match later in a matching
                //config, then favor over this star map.
                if (!foundStarMap && starMap && starMap[nameSegment]) {
                    foundStarMap = starMap[nameSegment];
                    starI = i;
                }
            }

            if (!foundMap && foundStarMap) {
                foundMap = foundStarMap;
                foundI = starI;
            }

            if (foundMap) {
                nameParts.splice(0, foundI, foundMap);
                name = nameParts.join('/');
            }
        }

        return name;
    }

    function makeRequire(relName, forceSync) {
        return function () {
            //A version of a require function that passes a moduleName
            //value for items that may need to
            //look up paths relative to the moduleName
            var args = aps.call(arguments, 0);

            //If first arg is not require('string'), and there is only
            //one arg, it is the array form without a callback. Insert
            //a null so that the following concat is correct.
            if (typeof args[0] !== 'string' && args.length === 1) {
                args.push(null);
            }
            return req.apply(undef, args.concat([relName, forceSync]));
        };
    }

    function makeNormalize(relName) {
        return function (name) {
            return normalize(name, relName);
        };
    }

    function makeLoad(depName) {
        return function (value) {
            defined[depName] = value;
        };
    }

    function callDep(name) {
        if (hasProp(waiting, name)) {
            var args = waiting[name];
            delete waiting[name];
            defining[name] = true;
            main.apply(undef, args);
        }

        if (!hasProp(defined, name) && !hasProp(defining, name)) {
            throw new Error('No ' + name);
        }
        return defined[name];
    }

    //Turns a plugin!resource to [plugin, resource]
    //with the plugin being undefined if the name
    //did not have a plugin prefix.
    function splitPrefix(name) {
        var prefix,
            index = name ? name.indexOf('!') : -1;
        if (index > -1) {
            prefix = name.substring(0, index);
            name = name.substring(index + 1, name.length);
        }
        return [prefix, name];
    }

    //Creates a parts array for a relName where first part is plugin ID,
    //second part is resource ID. Assumes relName has already been normalized.
    function makeRelParts(relName) {
        return relName ? splitPrefix(relName) : [];
    }

    /**
     * Makes a name map, normalizing the name, and using a plugin
     * for normalization if necessary. Grabs a ref to plugin
     * too, as an optimization.
     */
    makeMap = function (name, relParts) {
        var plugin,
            parts = splitPrefix(name),
            prefix = parts[0],
            relResourceName = relParts[1];

        name = parts[1];

        if (prefix) {
            prefix = normalize(prefix, relResourceName);
            plugin = callDep(prefix);
        }

        //Normalize according
        if (prefix) {
            if (plugin && plugin.normalize) {
                name = plugin.normalize(name, makeNormalize(relResourceName));
            } else {
                name = normalize(name, relResourceName);
            }
        } else {
            name = normalize(name, relResourceName);
            parts = splitPrefix(name);
            prefix = parts[0];
            name = parts[1];
            if (prefix) {
                plugin = callDep(prefix);
            }
        }

        //Using ridiculous property names for space reasons
        return {
            f: prefix ? prefix + '!' + name : name, //fullName
            n: name,
            pr: prefix,
            p: plugin
        };
    };

    function makeConfig(name) {
        return function () {
            return (config && config.config && config.config[name]) || {};
        };
    }

    handlers = {
        require: function (name) {
            return makeRequire(name);
        },
        exports: function (name) {
            var e = defined[name];
            if (typeof e !== 'undefined') {
                return e;
            } else {
                return (defined[name] = {});
            }
        },
        module: function (name) {
            return {
                id: name,
                uri: '',
                exports: defined[name],
                config: makeConfig(name)
            };
        }
    };

    main = function (name, deps, callback, relName) {
        var cjsModule, depName, ret, map, i, relParts,
            args = [],
            callbackType = typeof callback,
            usingExports;

        //Use name if no relName
        relName = relName || name;
        relParts = makeRelParts(relName);

        //Call the callback to define the module, if necessary.
        if (callbackType === 'undefined' || callbackType === 'function') {
            //Pull out the defined dependencies and pass the ordered
            //values to the callback.
            //Default to [require, exports, module] if no deps
            deps = !deps.length && callback.length ? ['require', 'exports', 'module'] : deps;
            for (i = 0; i < deps.length; i += 1) {
                map = makeMap(deps[i], relParts);
                depName = map.f;

                //Fast path CommonJS standard dependencies.
                if (depName === "require") {
                    args[i] = handlers.require(name);
                } else if (depName === "exports") {
                    //CommonJS module spec 1.1
                    args[i] = handlers.exports(name);
                    usingExports = true;
                } else if (depName === "module") {
                    //CommonJS module spec 1.1
                    cjsModule = args[i] = handlers.module(name);
                } else if (hasProp(defined, depName) ||
                           hasProp(waiting, depName) ||
                           hasProp(defining, depName)) {
                    args[i] = callDep(depName);
                } else if (map.p) {
                    map.p.load(map.n, makeRequire(relName, true), makeLoad(depName), {});
                    args[i] = defined[depName];
                } else {
                    throw new Error(name + ' missing ' + depName);
                }
            }

            ret = callback ? callback.apply(defined[name], args) : undefined;

            if (name) {
                //If setting exports via "module" is in play,
                //favor that over return value and exports. After that,
                //favor a non-undefined return value over exports use.
                if (cjsModule && cjsModule.exports !== undef &&
                        cjsModule.exports !== defined[name]) {
                    defined[name] = cjsModule.exports;
                } else if (ret !== undef || !usingExports) {
                    //Use the return value from the function.
                    defined[name] = ret;
                }
            }
        } else if (name) {
            //May just be an object definition for the module. Only
            //worry about defining if have a module name.
            defined[name] = callback;
        }
    };

    requirejs = require = req = function (deps, callback, relName, forceSync, alt) {
        if (typeof deps === "string") {
            if (handlers[deps]) {
                //callback in this case is really relName
                return handlers[deps](callback);
            }
            //Just return the module wanted. In this scenario, the
            //deps arg is the module name, and second arg (if passed)
            //is just the relName.
            //Normalize module name, if it contains . or ..
            return callDep(makeMap(deps, makeRelParts(callback)).f);
        } else if (!deps.splice) {
            //deps is a config object, not an array.
            config = deps;
            if (config.deps) {
                req(config.deps, config.callback);
            }
            if (!callback) {
                return;
            }

            if (callback.splice) {
                //callback is an array, which means it is a dependency list.
                //Adjust args if there are dependencies
                deps = callback;
                callback = relName;
                relName = null;
            } else {
                deps = undef;
            }
        }

        //Support require(['a'])
        callback = callback || function () {};

        //If relName is a function, it is an errback handler,
        //so remove it.
        if (typeof relName === 'function') {
            relName = forceSync;
            forceSync = alt;
        }

        //Simulate async callback;
        if (forceSync) {
            main(undef, deps, callback, relName);
        } else {
            //Using a non-zero value because of concern for what old browsers
            //do, and latest browsers "upgrade" to 4 if lower value is used:
            //http://www.whatwg.org/specs/web-apps/current-work/multipage/timers.html#dom-windowtimers-settimeout:
            //If want a value immediately, use require('id') instead -- something
            //that works in almond on the global level, but not guaranteed and
            //unlikely to work in other AMD implementations.
            setTimeout(function () {
                main(undef, deps, callback, relName);
            }, 4);
        }

        return req;
    };

    /**
     * Just drops the config on the floor, but returns req in case
     * the config return value is used.
     */
    req.config = function (cfg) {
        return req(cfg);
    };

    /**
     * Expose module registry for debugging and tooling
     */
    requirejs._defined = defined;

    define = function (name, deps, callback) {
        if (typeof name !== 'string') {
            throw new Error('See almond README: incorrect module build, no module name');
        }

        //This module may not have dependencies
        if (!deps.splice) {
            //deps is not an array, so probably means
            //an object literal or factory function for
            //the value. Adjust args.
            callback = deps;
            deps = [];
        }

        if (!hasProp(defined, name) && !hasProp(waiting, name)) {
            waiting[name] = [name, deps, callback];
        }
    };

    define.amd = {
        jQuery: true
    };
}());

define("almond", function(){});

define('asq-reveal-initiator',['require', 'exports', 'module'], function (require, exports, module) {
  

"use strict";
function getParameterByName(name) {
  name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
  var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"), results = regex.exec(location.search);
  return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}
module.exports = function (role, params) {
  if (!role) {
    role = getParameterByName("role");
  }
  role = role ? role : "viewer";
  var revealjsPath = "reveal.js/";
  var transition = "slide";
  if (params) {
    transition = params["transition"] ? params["transition"] : "slide";
  }
  var dependencies = {
    "common": [
      {
        src: revealjsPath + "lib/js/classList.js",
        condition: function () {
          return !document.body.classList;
        }
      },
      {
        src: revealjsPath + "plugin/markdown/marked.js",
        condition: function () {
          return !!document.querySelector("[data-markdown]");
        }
      },
      {
        src: revealjsPath + "plugin/markdown/markdown.js",
        condition: function () {
          return !!document.querySelector("[data-markdown]");
        }
      },
      {
        src: revealjsPath + "plugin/highlight/highlight.js",
        async: false,
        callback: function () {
          hljs.initHighlightingOnLoad();
        }
      },
      {
        src: revealjsPath + "plugin/zoom-js/zoom.js",
        async: false
      }
    ],
    "presenter-only": [{
        src: revealjsPath + "plugin/notes/notes.js",
        async: false
      }],
    "viewer-only": []
  };
  var revealSettings = Object.create(null);
  revealSettings["presenter"] = {
    controls: true,
    progress: true,
    history: true,
    center: true,
    transition: transition,
    dependencies: dependencies["common"].concat(dependencies["presenter-only"])
  };
  revealSettings["viewer"] = {
    controls: false,
    progress: true,
    history: true,
    center: true,
    transition: transition,
    dependencies: dependencies["common"].concat(dependencies["viewer-only"]),
    keyboard: false
  };
  Reveal.initialize(revealSettings[role]);
  if (role !== "presenter") {
    Reveal.addEventListener("ready", function () {
      Reveal.removeEventListeners();
    });
  }
};

return module.exports;

});
define('bows',[],function () {
  if (__isNode) {
  return __nodeRequire('bows');
} else {
    return (typeof bows !== 'undefined') ? bows : __throwMissing('bows', 'bows')
}
});
define('revealAsqAdapter',['require', 'exports', 'module', './asq-reveal-initiator', 'bows'], function (require, exports, module) {
  

"use strict";
var debug = require("bows")("asqRevealAdapter");
var initiator = require("./asq-reveal-initiator");
var asqRevealAdapter = module.exports = function (asqSocket, slidesTree, standalone, offset, role) {
  if (insideRevealNote()) {
    return;
  }
  standalone = standalone || false;
  offset = offset || 0;
  slidesTree = slidesTree || getSlidesTree();
  debug("asqRevealAdapter", slidesTree);
  var steps = slidesTree.steps;
  var allSubsteps = slidesTree.allSubsteps;
  var revealPatched = false;
  var fingerprint = getFingerprint(role);
  if (!standalone) {
    patchReveal();
  } else {
  }
  asqSocket.onGoto(onAsqSocketGoto);
  initiator(role, null);
  return { goto: goto };
  function getRandomString() {
    return Math.floor((1 + Math.random()) * 4294967296).toString(16);
  }
  function getFingerprint(role) {
    return role + getRandomString() + window.location.pathname + window.location.search;
  }
  function insideRevealNote() {
    return window.parent !== window.self;
  }
  function patchReveal() {
    if (revealPatched)
      return;
    if (typeof window.Reveal === "undefined" || window.Reveal == null || typeof window.Reveal.isReady != "function" || !window.Reveal.isReady()) {
      document.addEventListener("ready", patchReveal);
      return;
    }
    var Reveal = window.Reveal;
    document.removeEventListener("ready", patchReveal);
    Reveal.goto = goto;
    Reveal.indices2Id = indices2Id;
    Reveal.id2Indices = id2Indices;
    var slideChangedHandler = function (evt) {
      var state = Reveal.getState();
      var id = Reveal.indices2Id(state.indexh, state.indexv, state.indexf);
      debug("goto #" + id + " ( " + state.indexh + ", " + state.indexv + ", " + state.indexf + " )");
      asqSocket.emitGoto({
        _flag: fingerprint,
        id: id,
        state: state,
        isAutoSliding: Reveal.isAutoSliding()
      });
      return {
        id: id,
        state: state
      };
    };
    if (window.location.search.indexOf("role=presenter") >= 0) {
      Reveal.addEventListener("slidechanged", slideChangedHandler);
      Reveal.addEventListener("fragmentshown", slideChangedHandler);
      Reveal.addEventListener("fragmenthidden", slideChangedHandler);
      Reveal.addEventListener("overviewhidden", slideChangedHandler);
      Reveal.addEventListener("overviewshown", slideChangedHandler);
      Reveal.addEventListener("paused", slideChangedHandler);
      Reveal.addEventListener("resumed", slideChangedHandler);
    }
    revealPatched = true;
  }
  function onAsqSocketGoto(data) {
    debug("@@ onAsqSocketGoto @@", data);
    if ("undefined" === typeof data || data === null) {
      debug("data is undefined or null");
      return;
    }
    if (data._flag === fingerprint) {
      return;
    }
    if (data.hasOwnProperty("isAutoSliding")) {
      if (data.isAutoSliding !== Reveal.isAutoSliding()) {
        Reveal.toggleAutoSlide();
      }
    }
    if (typeof Reveal.goto === "function") {
      if (data.hasOwnProperty("state")) {
        Reveal.goto(data.state);
      } else if (data.hasOwnProperty("step")) {
        Reveal.goto(data.step);
      }
      var times = offset;
      while (times-- > 0) {
        Reveal.next();
      }
    }
  }
  ;
  function getSlidesTree() {
    var slidesTree = {};
    slidesTree.allSubsteps = {};
    var sections = toArray(document.querySelectorAll(".reveal .slides > section"));
    var steps = [];
    sections.forEach(function (section, index) {
      if (section.querySelector("section")) {
        toArray(section.querySelectorAll("section")).forEach(function (slide) {
          steps.push(slide);
        });
      } else {
        steps.push(section);
      }
    });
    steps.forEach(function (slide, index) {
      if (typeof slide.id == "undefined" || slide.id.trim() == "") {
        slide.id = "step-" + (index + 1);
      }
      var elSubs = slidesTree.allSubsteps[slide.id] = Object.create(null);
      elSubs.substeps = getSubSteps(slide);
      elSubs.active = -1;
    });
    slidesTree.steps = steps.map(function (slide) {
      return slide.id;
    });
    return slidesTree;
  }
  function getSubSteps(el) {
    var substeps = toArray(el.querySelectorAll(".fragment"));
    return substeps.map(function () {
      return "";
    });
  }
  function toArray(o) {
    return Array.prototype.slice.call(o);
  }
  function goto() {
    var args = toArray(arguments);
    if (_.isEqual(Reveal.getState(), args[0]))
      return;
    if (typeof args[0] === "string") {
      var steps = getSlidesTree().steps;
      if (steps.indexOf(args[0]) < 0)
        return;
      var indices = window.Reveal.id2Indices(args[0]);
      if (indices == null)
        return;
      window.Reveal.slide(indices.indexh, indices.indexv, indices.indexf);
    } else if (typeof args[0] === "number") {
      window.Reveal.slide(args[0], args[1], args[2]);
    } else if (typeof args[0] === "object" && typeof args[0].indexh == "number") {
      window.Reveal.setState(args[0]);
    }
  }
  function indices2Id(h, v, f) {
    if (typeof h == "object") {
      f = h.indexf;
      v = h.inxexv;
      h = h.indexh;
    }
    v = typeof v == "undefined" ? 0 : v;
    var slide = Reveal.getSlide(h, v, f);
    if (typeof slide == "undefined" || slide == null) {
      return undefined;
    }
    return slide.id;
  }
  function id2Indices(id) {
    var slide = document.querySelector("#" + id);
    if (typeof slide == "undefined" || slide == null) {
      return undefined;
    }
    return Reveal.getIndices(slide);
  }
  function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"), results = regex.exec(location.search);
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
  }
};

return module.exports;

});
define('index',['require', 'exports', 'module', './revealAsqAdapter'], function (require, exports, module) {
  var __umodule__ = (function (require, exports, module) {
  

({ urequire: { rootExports: "RevealAsqAdapter" } });
module.exports = { adapter: require("./revealAsqAdapter") };

return module.exports;

}).call(this, require, exports, module);
if (!__isAMD && !__isNode) {window['RevealAsqAdapter'] = __umodule__;

}return __umodule__;
});
    return require('index');

};
if (__isAMD) {
  return define(['bows'], bundleFactory);
} else {
    if (__isNode) {
        return module.exports = bundleFactory(require('bows'));
    } else {
        return bundleFactory((typeof bows !== 'undefined') ? bows : __throwMissing('bows', 'bows'));
    }
}
}).call(this, (typeof exports === 'object' || typeof window === 'undefined' ? global : window),
              (typeof exports === 'object' || typeof window === 'undefined' ? global : window))
