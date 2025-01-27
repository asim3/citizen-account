/*!***************************************************
 * mark.js v8.11.0
 * https://github.com/julmot/mark.js
 * Copyright (c) 2014–2017, Julian Motz
 * Released under the MIT license https://git.io/vwTVl
 *****************************************************/ "use strict";
var _extends =
  Object.assign ||
  function(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];
      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }
    return target;
  };
var _createClass = (function() {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }
  return function(Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
})();
var _typeof =
  typeof Symbol === "function" && typeof Symbol.iterator === "symbol"
    ? function(obj) {
        return typeof obj;
      }
    : function(obj) {
        return obj &&
          typeof Symbol === "function" &&
          obj.constructor === Symbol &&
          obj !== Symbol.prototype
          ? "symbol"
          : typeof obj;
      };
function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}
(function(factory, window, document) {
  if (typeof define === "function" && define.amd) {
    define(["jquery"], function(jQuery) {
      return factory(window, document, jQuery);
    });
  } else if (
    (typeof module === "undefined" ? "undefined" : _typeof(module)) ===
      "object" &&
    module.exports
  ) {
    module.exports = factory(window, document, require("jquery"));
  } else {
    factory(window, document, jQuery);
  }
})(
  function(window, document, $) {
    var Mark = (function() {
      function Mark(ctx) {
        _classCallCheck(this, Mark);
        this.ctx = ctx;
        this.ie = false;
        var ua = window.navigator.userAgent;
        if (ua.indexOf("MSIE") > -1 || ua.indexOf("Trident") > -1) {
          this.ie = true;
        }
      }
      _createClass(Mark, [
        {
          key: "log",
          value: function log(msg) {
            var level =
              arguments.length > 1 && arguments[1] !== undefined
                ? arguments[1]
                : "debug";
            var log = this.opt.log;
            if (!this.opt.debug) {
              return;
            }
            if (
              (typeof log === "undefined" ? "undefined" : _typeof(log)) ===
                "object" &&
              typeof log[level] === "function"
            ) {
              log[level]("mark.js: " + msg);
            }
          }
        },
        {
          key: "escapeStr",
          value: function escapeStr(str) {
            return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
          }
        },
        {
          key: "createRegExp",
          value: function createRegExp(str) {
            if (this.opt.wildcards !== "disabled") {
              str = this.setupWildcardsRegExp(str);
            }
            str = this.escapeStr(str);
            if (Object.keys(this.opt.synonyms).length) {
              str = this.createSynonymsRegExp(str);
            }
            if (this.opt.ignoreJoiners || this.opt.ignorePunctuation.length) {
              str = this.setupIgnoreJoinersRegExp(str);
            }
            if (this.opt.diacritics) {
              str = this.createDiacriticsRegExp(str);
            }
            str = this.createMergedBlanksRegExp(str);
            if (this.opt.ignoreJoiners || this.opt.ignorePunctuation.length) {
              str = this.createJoinersRegExp(str);
            }
            if (this.opt.wildcards !== "disabled") {
              str = this.createWildcardsRegExp(str);
            }
            str = this.createAccuracyRegExp(str);
            return str;
          }
        },
        {
          key: "createSynonymsRegExp",
          value: function createSynonymsRegExp(str) {
            var syn = this.opt.synonyms,
              sens = this.opt.caseSensitive ? "" : "i",
              joinerPlaceholder =
                this.opt.ignoreJoiners || this.opt.ignorePunctuation.length
                  ? "\0"
                  : "";
            for (var index in syn) {
              if (syn.hasOwnProperty(index)) {
                var value = syn[index],
                  k1 =
                    this.opt.wildcards !== "disabled"
                      ? this.setupWildcardsRegExp(index)
                      : this.escapeStr(index),
                  k2 =
                    this.opt.wildcards !== "disabled"
                      ? this.setupWildcardsRegExp(value)
                      : this.escapeStr(value);
                if (k1 !== "" && k2 !== "") {
                  str = str.replace(
                    new RegExp("(" + k1 + "|" + k2 + ")", "gm" + sens),
                    joinerPlaceholder +
                      ("(" + this.processSynomyms(k1) + "|") +
                      (this.processSynomyms(k2) + ")") +
                      joinerPlaceholder
                  );
                }
              }
            }
            return str;
          }
        },
        {
          key: "processSynomyms",
          value: function processSynomyms(str) {
            if (this.opt.ignoreJoiners || this.opt.ignorePunctuation.length) {
              str = this.setupIgnoreJoinersRegExp(str);
            }
            return str;
          }
        },
        {
          key: "setupWildcardsRegExp",
          value: function setupWildcardsRegExp(str) {
            str = str.replace(/(?:\\)*\?/g, function(val) {
              return val.charAt(0) === "\\" ? "?" : "\x01";
            });
            return str.replace(/(?:\\)*\*/g, function(val) {
              return val.charAt(0) === "\\" ? "*" : "\x02";
            });
          }
        },
        {
          key: "createWildcardsRegExp",
          value: function createWildcardsRegExp(str) {
            var spaces = this.opt.wildcards === "withSpaces";
            return str
              .replace(/\u0001/g, spaces ? "[\\S\\s]?" : "\\S?")
              .replace(/\u0002/g, spaces ? "[\\S\\s]*?" : "\\S*");
          }
        },
        {
          key: "setupIgnoreJoinersRegExp",
          value: function setupIgnoreJoinersRegExp(str) {
            return str.replace(/[^(|)\\]/g, function(val, indx, original) {
              var nextChar = original.charAt(indx + 1);
              if (/[(|)\\]/.test(nextChar) || nextChar === "") {
                return val;
              } else {
                return val + "\0";
              }
            });
          }
        },
        {
          key: "createJoinersRegExp",
          value: function createJoinersRegExp(str) {
            var joiner = [];
            var ignorePunctuation = this.opt.ignorePunctuation;
            if (Array.isArray(ignorePunctuation) && ignorePunctuation.length) {
              joiner.push(this.escapeStr(ignorePunctuation.join("")));
            }
            if (this.opt.ignoreJoiners) {
              joiner.push("\\u00ad\\u200b\\u200c\\u200d");
            }
            return joiner.length
              ? str.split(/\u0000+/).join("[" + joiner.join("") + "]*")
              : str;
          }
        },
        {
          key: "createDiacriticsRegExp",
          value: function createDiacriticsRegExp(str) {
            var sens = this.opt.caseSensitive ? "" : "i",
              dct = this.opt.caseSensitive
                ? [
                    "aàáảãạăằắẳẵặâầấẩẫậäåāą",
                    "AÀÁẢÃẠĂẰẮẲẴẶÂẦẤẨẪẬÄÅĀĄ",
                    "cçćč",
                    "CÇĆČ",
                    "dđď",
                    "DĐĎ",
                    "eèéẻẽẹêềếểễệëěēę",
                    "EÈÉẺẼẸÊỀẾỂỄỆËĚĒĘ",
                    "iìíỉĩịîïī",
                    "IÌÍỈĨỊÎÏĪ",
                    "lł",
                    "LŁ",
                    "nñňń",
                    "NÑŇŃ",
                    "oòóỏõọôồốổỗộơởỡớờợöøō",
                    "OÒÓỎÕỌÔỒỐỔỖỘƠỞỠỚỜỢÖØŌ",
                    "rř",
                    "RŘ",
                    "sšśșş",
                    "SŠŚȘŞ",
                    "tťțţ",
                    "TŤȚŢ",
                    "uùúủũụưừứửữựûüůū",
                    "UÙÚỦŨỤƯỪỨỬỮỰÛÜŮŪ",
                    "yýỳỷỹỵÿ",
                    "YÝỲỶỸỴŸ",
                    "zžżź",
                    "ZŽŻŹ"
                  ]
                : [
                    "aàáảãạăằắẳẵặâầấẩẫậäåāąAÀÁẢÃẠĂẰẮẲẴẶÂẦẤẨẪẬÄÅĀĄ",
                    "cçćčCÇĆČ",
                    "dđďDĐĎ",
                    "eèéẻẽẹêềếểễệëěēęEÈÉẺẼẸÊỀẾỂỄỆËĚĒĘ",
                    "iìíỉĩịîïīIÌÍỈĨỊÎÏĪ",
                    "lłLŁ",
                    "nñňńNÑŇŃ",
                    "oòóỏõọôồốổỗộơởỡớờợöøōOÒÓỎÕỌÔỒỐỔỖỘƠỞỠỚỜỢÖØŌ",
                    "rřRŘ",
                    "sšśșşSŠŚȘŞ",
                    "tťțţTŤȚŢ",
                    "uùúủũụưừứửữựûüůūUÙÚỦŨỤƯỪỨỬỮỰÛÜŮŪ",
                    "yýỳỷỹỵÿYÝỲỶỸỴŸ",
                    "zžżźZŽŻŹ"
                  ];
            var handled = [];
            str.split("").forEach(function(ch) {
              dct.every(function(dct) {
                if (dct.indexOf(ch) !== -1) {
                  if (handled.indexOf(dct) > -1) {
                    return false;
                  }
                  str = str.replace(
                    new RegExp("[" + dct + "]", "gm" + sens),
                    "[" + dct + "]"
                  );
                  handled.push(dct);
                }
                return true;
              });
            });
            return str;
          }
        },
        {
          key: "createMergedBlanksRegExp",
          value: function createMergedBlanksRegExp(str) {
            return str.replace(/[\s]+/gim, "[\\s]+");
          }
        },
        {
          key: "createAccuracyRegExp",
          value: function createAccuracyRegExp(str) {
            var _this = this;
            var chars = "!\"#$%&'()*+,-./:;<=>?@[\\]^_`{|}~\xA1\xBF";
            var acc = this.opt.accuracy,
              val = typeof acc === "string" ? acc : acc.value,
              ls = typeof acc === "string" ? [] : acc.limiters,
              lsJoin = "";
            ls.forEach(function(limiter) {
              lsJoin += "|" + _this.escapeStr(limiter);
            });
            switch (val) {
              case "partially":
              default:
                return "()(" + str + ")";
              case "complementary":
                lsJoin = "\\s" + (lsJoin ? lsJoin : this.escapeStr(chars));
                return "()([^" + lsJoin + "]*" + str + "[^" + lsJoin + "]*)";
              case "exactly":
                return (
                  "(^|\\s" + lsJoin + ")(" + str + ")(?=$|\\s" + lsJoin + ")"
                );
            }
          }
        },
        {
          key: "getSeparatedKeywords",
          value: function getSeparatedKeywords(sv) {
            var _this2 = this;
            var stack = [];
            sv.forEach(function(kw) {
              if (!_this2.opt.separateWordSearch) {
                if (kw.trim() && stack.indexOf(kw) === -1) {
                  stack.push(kw);
                }
              } else {
                kw.split(" ").forEach(function(kwSplitted) {
                  if (kwSplitted.trim() && stack.indexOf(kwSplitted) === -1) {
                    stack.push(kwSplitted);
                  }
                });
              }
            });
            return {
              keywords: stack.sort(function(a, b) {
                return b.length - a.length;
              }),
              length: stack.length
            };
          }
        },
        {
          key: "isNumeric",
          value: function isNumeric(value) {
            return Number(parseFloat(value)) == value;
          }
        },
        {
          key: "checkRanges",
          value: function checkRanges(array) {
            var _this3 = this;
            if (
              !Array.isArray(array) ||
              Object.prototype.toString.call(array[0]) !== "[object Object]"
            ) {
              this.log("markRanges() will only accept an array of objects");
              this.opt.noMatch(array);
              return [];
            }
            var stack = [];
            var last = 0;
            array
              .sort(function(a, b) {
                return a.start - b.start;
              })
              .forEach(function(item) {
                var _callNoMatchOnInvalid = _this3.callNoMatchOnInvalidRanges(
                    item,
                    last
                  ),
                  start = _callNoMatchOnInvalid.start,
                  end = _callNoMatchOnInvalid.end,
                  valid = _callNoMatchOnInvalid.valid;
                if (valid) {
                  item.start = start;
                  item.length = end - start;
                  stack.push(item);
                  last = end;
                }
              });
            return stack;
          }
        },
        {
          key: "callNoMatchOnInvalidRanges",
          value: function callNoMatchOnInvalidRanges(range, last) {
            var start = void 0,
              end = void 0,
              valid = false;
            if (range && typeof range.start !== "undefined") {
              start = parseInt(range.start, 10);
              end = start + parseInt(range.length, 10);
              if (
                this.isNumeric(range.start) &&
                this.isNumeric(range.length) &&
                end - last > 0 &&
                end - start > 0
              ) {
                valid = true;
              } else {
                this.log(
                  "Ignoring invalid or overlapping range: " +
                    ("" + JSON.stringify(range))
                );
                this.opt.noMatch(range);
              }
            } else {
              this.log("Ignoring invalid range: " + JSON.stringify(range));
              this.opt.noMatch(range);
            }
            return { start: start, end: end, valid: valid };
          }
        },
        {
          key: "checkWhitespaceRanges",
          value: function checkWhitespaceRanges(range, originalLength, string) {
            var end = void 0,
              valid = true,
              max = string.length,
              offset = originalLength - max,
              start = parseInt(range.start, 10) - offset;
            start = start > max ? max : start;
            end = start + parseInt(range.length, 10);
            if (end > max) {
              end = max;
              this.log(
                "End range automatically set to the max value of " + max
              );
            }
            if (start < 0 || end - start < 0 || start > max || end > max) {
              valid = false;
              this.log("Invalid range: " + JSON.stringify(range));
              this.opt.noMatch(range);
            } else if (
              string.substring(start, end).replace(/\s+/g, "") === ""
            ) {
              valid = false;
              this.log(
                "Skipping whitespace only range: " + JSON.stringify(range)
              );
              this.opt.noMatch(range);
            }
            return { start: start, end: end, valid: valid };
          }
        },
        {
          key: "getTextNodes",
          value: function getTextNodes(cb) {
            var _this4 = this;
            var val = "",
              nodes = [];
            this.iterator.forEachNode(
              NodeFilter.SHOW_TEXT,
              function(node) {
                nodes.push({
                  start: val.length,
                  end: (val += node.textContent).length,
                  node: node
                });
              },
              function(node) {
                if (_this4.matchesExclude(node.parentNode)) {
                  return NodeFilter.FILTER_REJECT;
                } else {
                  return NodeFilter.FILTER_ACCEPT;
                }
              },
              function() {
                cb({ value: val, nodes: nodes });
              }
            );
          }
        },
        {
          key: "matchesExclude",
          value: function matchesExclude(el) {
            return DOMIterator.matches(
              el,
              this.opt.exclude.concat([
                "script",
                "style",
                "title",
                "head",
                "html"
              ])
            );
          }
        },
        {
          key: "wrapRangeInTextNode",
          value: function wrapRangeInTextNode(node, start, end) {
            var hEl = !this.opt.element ? "mark" : this.opt.element,
              startNode = node.splitText(start),
              ret = startNode.splitText(end - start);
            var repl = document.createElement(hEl);
            repl.setAttribute("data-markjs", "true");
            if (this.opt.className) {
              repl.setAttribute("class", this.opt.className);
            }
            repl.textContent = startNode.textContent;
            startNode.parentNode.replaceChild(repl, startNode);
            return ret;
          }
        },
        {
          key: "wrapRangeInMappedTextNode",
          value: function wrapRangeInMappedTextNode(
            dict,
            start,
            end,
            filterCb,
            eachCb
          ) {
            var _this5 = this;
            dict.nodes.every(function(n, i) {
              var sibl = dict.nodes[i + 1];
              if (typeof sibl === "undefined" || sibl.start > start) {
                if (!filterCb(n.node)) {
                  return false;
                }
                var s = start - n.start,
                  e = (end > n.end ? n.end : end) - n.start,
                  startStr = dict.value.substr(0, n.start),
                  endStr = dict.value.substr(e + n.start);
                n.node = _this5.wrapRangeInTextNode(n.node, s, e);
                dict.value = startStr + endStr;
                dict.nodes.forEach(function(k, j) {
                  if (j >= i) {
                    if (dict.nodes[j].start > 0 && j !== i) {
                      dict.nodes[j].start -= e;
                    }
                    dict.nodes[j].end -= e;
                  }
                });
                end -= e;
                eachCb(n.node.previousSibling, n.start);
                if (end > n.end) {
                  start = n.end;
                } else {
                  return false;
                }
              }
              return true;
            });
          }
        },
        {
          key: "wrapMatches",
          value: function wrapMatches(
            regex,
            ignoreGroups,
            filterCb,
            eachCb,
            endCb
          ) {
            var _this6 = this;
            var matchIdx = ignoreGroups === 0 ? 0 : ignoreGroups + 1;
            this.getTextNodes(function(dict) {
              dict.nodes.forEach(function(node) {
                node = node.node;
                var match = void 0;
                while (
                  (match = regex.exec(node.textContent)) !== null &&
                  match[matchIdx] !== ""
                ) {
                  if (!filterCb(match[matchIdx], node)) {
                    continue;
                  }
                  var pos = match.index;
                  if (matchIdx !== 0) {
                    for (var i = 1; i < matchIdx; i++) {
                      pos += match[i].length;
                    }
                  }
                  node = _this6.wrapRangeInTextNode(
                    node,
                    pos,
                    pos + match[matchIdx].length
                  );
                  eachCb(node.previousSibling);
                  regex.lastIndex = 0;
                }
              });
              endCb();
            });
          }
        },
        {
          key: "wrapMatchesAcrossElements",
          value: function wrapMatchesAcrossElements(
            regex,
            ignoreGroups,
            filterCb,
            eachCb,
            endCb
          ) {
            var _this7 = this;
            var matchIdx = ignoreGroups === 0 ? 0 : ignoreGroups + 1;
            this.getTextNodes(function(dict) {
              var match = void 0;
              while (
                (match = regex.exec(dict.value)) !== null &&
                match[matchIdx] !== ""
              ) {
                var start = match.index;
                if (matchIdx !== 0) {
                  for (var i = 1; i < matchIdx; i++) {
                    start += match[i].length;
                  }
                }
                var end = start + match[matchIdx].length;
                _this7.wrapRangeInMappedTextNode(
                  dict,
                  start,
                  end,
                  function(node) {
                    return filterCb(match[matchIdx], node);
                  },
                  function(node, lastIndex) {
                    regex.lastIndex = lastIndex;
                    eachCb(node);
                  }
                );
              }
              endCb();
            });
          }
        },
        {
          key: "wrapRangeFromIndex",
          value: function wrapRangeFromIndex(ranges, filterCb, eachCb, endCb) {
            var _this8 = this;
            this.getTextNodes(function(dict) {
              var originalLength = dict.value.length;
              ranges.forEach(function(range, counter) {
                var _checkWhitespaceRange = _this8.checkWhitespaceRanges(
                    range,
                    originalLength,
                    dict.value
                  ),
                  start = _checkWhitespaceRange.start,
                  end = _checkWhitespaceRange.end,
                  valid = _checkWhitespaceRange.valid;
                if (valid) {
                  _this8.wrapRangeInMappedTextNode(
                    dict,
                    start,
                    end,
                    function(node) {
                      return filterCb(
                        node,
                        range,
                        dict.value.substring(start, end),
                        counter
                      );
                    },
                    function(node) {
                      eachCb(node, range);
                    }
                  );
                }
              });
              endCb();
            });
          }
        },
        {
          key: "unwrapMatches",
          value: function unwrapMatches(node) {
            var parent = node.parentNode;
            var docFrag = document.createDocumentFragment();
            while (node.firstChild) {
              docFrag.appendChild(node.removeChild(node.firstChild));
            }
            parent.replaceChild(docFrag, node);
            if (!this.ie) {
              parent.normalize();
            } else {
              this.normalizeTextNode(parent);
            }
          }
        },
        {
          key: "normalizeTextNode",
          value: function normalizeTextNode(node) {
            if (!node) {
              return;
            }
            if (node.nodeType === 3) {
              while (node.nextSibling && node.nextSibling.nodeType === 3) {
                node.nodeValue += node.nextSibling.nodeValue;
                node.parentNode.removeChild(node.nextSibling);
              }
            } else {
              this.normalizeTextNode(node.firstChild);
            }
            this.normalizeTextNode(node.nextSibling);
          }
        },
        {
          key: "markRegExp",
          value: function markRegExp(regexp, opt) {
            var _this9 = this;
            this.opt = opt;
            this.log('Searching with expression "' + regexp + '"');
            var totalMatches = 0,
              fn = "wrapMatches";
            var eachCb = function eachCb(element) {
              totalMatches++;
              _this9.opt.each(element);
            };
            if (this.opt.acrossElements) {
              fn = "wrapMatchesAcrossElements";
            }
            this[fn](
              regexp,
              this.opt.ignoreGroups,
              function(match, node) {
                return _this9.opt.filter(node, match, totalMatches);
              },
              eachCb,
              function() {
                if (totalMatches === 0) {
                  _this9.opt.noMatch(regexp);
                }
                _this9.opt.done(totalMatches);
              }
            );
          }
        },
        {
          key: "mark",
          value: function mark(sv, opt) {
            var _this10 = this;
            this.opt = opt;
            var totalMatches = 0,
              fn = "wrapMatches";
            var _getSeparatedKeywords = this.getSeparatedKeywords(
                typeof sv === "string" ? [sv] : sv
              ),
              kwArr = _getSeparatedKeywords.keywords,
              kwArrLen = _getSeparatedKeywords.length,
              sens = this.opt.caseSensitive ? "" : "i",
              handler = function handler(kw) {
                var regex = new RegExp(_this10.createRegExp(kw), "gm" + sens),
                  matches = 0;
                _this10.log('Searching with expression "' + regex + '"');
                _this10[fn](
                  regex,
                  1,
                  function(term, node) {
                    return _this10.opt.filter(node, kw, totalMatches, matches);
                  },
                  function(element) {
                    matches++;
                    totalMatches++;
                    _this10.opt.each(element);
                  },
                  function() {
                    if (matches === 0) {
                      _this10.opt.noMatch(kw);
                    }
                    if (kwArr[kwArrLen - 1] === kw) {
                      _this10.opt.done(totalMatches);
                    } else {
                      handler(kwArr[kwArr.indexOf(kw) + 1]);
                    }
                  }
                );
              };
            if (this.opt.acrossElements) {
              fn = "wrapMatchesAcrossElements";
            }
            if (kwArrLen === 0) {
              this.opt.done(totalMatches);
            } else {
              handler(kwArr[0]);
            }
          }
        },
        {
          key: "markRanges",
          value: function markRanges(rawRanges, opt) {
            var _this11 = this;
            this.opt = opt;
            var totalMatches = 0,
              ranges = this.checkRanges(rawRanges);
            if (ranges && ranges.length) {
              this.log(
                "Starting to mark with the following ranges: " +
                  JSON.stringify(ranges)
              );
              this.wrapRangeFromIndex(
                ranges,
                function(node, range, match, counter) {
                  return _this11.opt.filter(node, range, match, counter);
                },
                function(element, range) {
                  totalMatches++;
                  _this11.opt.each(element, range);
                },
                function() {
                  _this11.opt.done(totalMatches);
                }
              );
            } else {
              this.opt.done(totalMatches);
            }
          }
        },
        {
          key: "unmark",
          value: function unmark(opt) {
            var _this12 = this;
            this.opt = opt;
            var sel = this.opt.element ? this.opt.element : "*";
            sel += "[data-markjs]";
            if (this.opt.className) {
              sel += "." + this.opt.className;
            }
            this.log('Removal selector "' + sel + '"');
            this.iterator.forEachNode(
              NodeFilter.SHOW_ELEMENT,
              function(node) {
                _this12.unwrapMatches(node);
              },
              function(node) {
                var matchesSel = DOMIterator.matches(node, sel),
                  matchesExclude = _this12.matchesExclude(node);
                if (!matchesSel || matchesExclude) {
                  return NodeFilter.FILTER_REJECT;
                } else {
                  return NodeFilter.FILTER_ACCEPT;
                }
              },
              this.opt.done
            );
          }
        },
        {
          key: "opt",
          set: function set(val) {
            this._opt = _extends(
              {},
              {
                element: "",
                className: "",
                exclude: [],
                iframes: false,
                iframesTimeout: 5000,
                separateWordSearch: true,
                diacritics: true,
                synonyms: {},
                accuracy: "partially",
                acrossElements: false,
                caseSensitive: false,
                ignoreJoiners: false,
                ignoreGroups: 0,
                ignorePunctuation: [],
                wildcards: "disabled",
                each: function each() {},
                noMatch: function noMatch() {},
                filter: function filter() {
                  return true;
                },
                done: function done() {},
                debug: false,
                log: window.console
              },
              val
            );
          },
          get: function get() {
            return this._opt;
          }
        },
        {
          key: "iterator",
          get: function get() {
            return new DOMIterator(
              this.ctx,
              this.opt.iframes,
              this.opt.exclude,
              this.opt.iframesTimeout
            );
          }
        }
      ]);
      return Mark;
    })();
    var DOMIterator = (function() {
      function DOMIterator(ctx) {
        var iframes =
          arguments.length > 1 && arguments[1] !== undefined
            ? arguments[1]
            : true;
        var exclude =
          arguments.length > 2 && arguments[2] !== undefined
            ? arguments[2]
            : [];
        var iframesTimeout =
          arguments.length > 3 && arguments[3] !== undefined
            ? arguments[3]
            : 5000;
        _classCallCheck(this, DOMIterator);
        this.ctx = ctx;
        this.iframes = iframes;
        this.exclude = exclude;
        this.iframesTimeout = iframesTimeout;
      }
      _createClass(
        DOMIterator,
        [
          {
            key: "getContexts",
            value: function getContexts() {
              var ctx = void 0,
                filteredCtx = [];
              if (typeof this.ctx === "undefined" || !this.ctx) {
                ctx = [];
              } else if (NodeList.prototype.isPrototypeOf(this.ctx)) {
                ctx = Array.prototype.slice.call(this.ctx);
              } else if (Array.isArray(this.ctx)) {
                ctx = this.ctx;
              } else if (typeof this.ctx === "string") {
                ctx = Array.prototype.slice.call(
                  document.querySelectorAll(this.ctx)
                );
              } else {
                ctx = [this.ctx];
              }
              ctx.forEach(function(ctx) {
                var isDescendant =
                  filteredCtx.filter(function(contexts) {
                    return contexts.contains(ctx);
                  }).length > 0;
                if (filteredCtx.indexOf(ctx) === -1 && !isDescendant) {
                  filteredCtx.push(ctx);
                }
              });
              return filteredCtx;
            }
          },
          {
            key: "getIframeContents",
            value: function getIframeContents(ifr, successFn) {
              var errorFn =
                arguments.length > 2 && arguments[2] !== undefined
                  ? arguments[2]
                  : function() {};
              var doc = void 0;
              try {
                var ifrWin = ifr.contentWindow;
                doc = ifrWin.document;
                if (!ifrWin || !doc) {
                  throw new Error("iframe inaccessible");
                }
              } catch (e) {
                errorFn();
              }
              if (doc) {
                successFn(doc);
              }
            }
          },
          {
            key: "isIframeBlank",
            value: function isIframeBlank(ifr) {
              var bl = "about:blank",
                src = ifr.getAttribute("src").trim(),
                href = ifr.contentWindow.location.href;
              return href === bl && src !== bl && src;
            }
          },
          {
            key: "observeIframeLoad",
            value: function observeIframeLoad(ifr, successFn, errorFn) {
              var _this13 = this;
              var called = false,
                tout = null;
              var listener = function listener() {
                if (called) {
                  return;
                }
                called = true;
                clearTimeout(tout);
                try {
                  if (!_this13.isIframeBlank(ifr)) {
                    ifr.removeEventListener("load", listener);
                    _this13.getIframeContents(ifr, successFn, errorFn);
                  }
                } catch (e) {
                  errorFn();
                }
              };
              ifr.addEventListener("load", listener);
              tout = setTimeout(listener, this.iframesTimeout);
            }
          },
          {
            key: "onIframeReady",
            value: function onIframeReady(ifr, successFn, errorFn) {
              try {
                if (ifr.contentWindow.document.readyState === "complete") {
                  if (this.isIframeBlank(ifr)) {
                    this.observeIframeLoad(ifr, successFn, errorFn);
                  } else {
                    this.getIframeContents(ifr, successFn, errorFn);
                  }
                } else {
                  this.observeIframeLoad(ifr, successFn, errorFn);
                }
              } catch (e) {
                errorFn();
              }
            }
          },
          {
            key: "waitForIframes",
            value: function waitForIframes(ctx, done) {
              var _this14 = this;
              var eachCalled = 0;
              this.forEachIframe(
                ctx,
                function() {
                  return true;
                },
                function(ifr) {
                  eachCalled++;
                  _this14.waitForIframes(ifr.querySelector("html"), function() {
                    if (!--eachCalled) {
                      done();
                    }
                  });
                },
                function(handled) {
                  if (!handled) {
                    done();
                  }
                }
              );
            }
          },
          {
            key: "forEachIframe",
            value: function forEachIframe(ctx, filter, each) {
              var _this15 = this;
              var end =
                arguments.length > 3 && arguments[3] !== undefined
                  ? arguments[3]
                  : function() {};
              var ifr = ctx.querySelectorAll("iframe"),
                open = ifr.length,
                handled = 0;
              ifr = Array.prototype.slice.call(ifr);
              var checkEnd = function checkEnd() {
                if (--open <= 0) {
                  end(handled);
                }
              };
              if (!open) {
                checkEnd();
              }
              ifr.forEach(function(ifr) {
                if (DOMIterator.matches(ifr, _this15.exclude)) {
                  checkEnd();
                } else {
                  _this15.onIframeReady(
                    ifr,
                    function(con) {
                      if (filter(ifr)) {
                        handled++;
                        each(con);
                      }
                      checkEnd();
                    },
                    checkEnd
                  );
                }
              });
            }
          },
          {
            key: "createIterator",
            value: function createIterator(ctx, whatToShow, filter) {
              return document.createNodeIterator(
                ctx,
                whatToShow,
                filter,
                false
              );
            }
          },
          {
            key: "createInstanceOnIframe",
            value: function createInstanceOnIframe(contents) {
              return new DOMIterator(
                contents.querySelector("html"),
                this.iframes
              );
            }
          },
          {
            key: "compareNodeIframe",
            value: function compareNodeIframe(node, prevNode, ifr) {
              var compCurr = node.compareDocumentPosition(ifr),
                prev = Node.DOCUMENT_POSITION_PRECEDING;
              if (compCurr & prev) {
                if (prevNode !== null) {
                  var compPrev = prevNode.compareDocumentPosition(ifr),
                    after = Node.DOCUMENT_POSITION_FOLLOWING;
                  if (compPrev & after) {
                    return true;
                  }
                } else {
                  return true;
                }
              }
              return false;
            }
          },
          {
            key: "getIteratorNode",
            value: function getIteratorNode(itr) {
              var prevNode = itr.previousNode();
              var node = void 0;
              if (prevNode === null) {
                node = itr.nextNode();
              } else {
                node = itr.nextNode() && itr.nextNode();
              }
              return { prevNode: prevNode, node: node };
            }
          },
          {
            key: "checkIframeFilter",
            value: function checkIframeFilter(node, prevNode, currIfr, ifr) {
              var key = false,
                handled = false;
              ifr.forEach(function(ifrDict, i) {
                if (ifrDict.val === currIfr) {
                  key = i;
                  handled = ifrDict.handled;
                }
              });
              if (this.compareNodeIframe(node, prevNode, currIfr)) {
                if (key === false && !handled) {
                  ifr.push({ val: currIfr, handled: true });
                } else if (key !== false && !handled) {
                  ifr[key].handled = true;
                }
                return true;
              }
              if (key === false) {
                ifr.push({ val: currIfr, handled: false });
              }
              return false;
            }
          },
          {
            key: "handleOpenIframes",
            value: function handleOpenIframes(ifr, whatToShow, eCb, fCb) {
              var _this16 = this;
              ifr.forEach(function(ifrDict) {
                if (!ifrDict.handled) {
                  _this16.getIframeContents(ifrDict.val, function(con) {
                    _this16
                      .createInstanceOnIframe(con)
                      .forEachNode(whatToShow, eCb, fCb);
                  });
                }
              });
            }
          },
          {
            key: "iterateThroughNodes",
            value: function iterateThroughNodes(
              whatToShow,
              ctx,
              eachCb,
              filterCb,
              doneCb
            ) {
              var _this17 = this;
              var itr = this.createIterator(ctx, whatToShow, filterCb);
              var ifr = [],
                elements = [],
                node = void 0,
                prevNode = void 0,
                retrieveNodes = function retrieveNodes() {
                  var _getIteratorNode = _this17.getIteratorNode(itr);
                  prevNode = _getIteratorNode.prevNode;
                  node = _getIteratorNode.node;
                  return node;
                };
              while (retrieveNodes()) {
                if (this.iframes) {
                  this.forEachIframe(
                    ctx,
                    function(currIfr) {
                      return _this17.checkIframeFilter(
                        node,
                        prevNode,
                        currIfr,
                        ifr
                      );
                    },
                    function(con) {
                      _this17.createInstanceOnIframe(con).forEachNode(
                        whatToShow,
                        function(ifrNode) {
                          return elements.push(ifrNode);
                        },
                        filterCb
                      );
                    }
                  );
                }
                elements.push(node);
              }
              elements.forEach(function(node) {
                eachCb(node);
              });
              if (this.iframes) {
                this.handleOpenIframes(ifr, whatToShow, eachCb, filterCb);
              }
              doneCb();
            }
          },
          {
            key: "forEachNode",
            value: function forEachNode(whatToShow, each, filter) {
              var _this18 = this;
              var done =
                arguments.length > 3 && arguments[3] !== undefined
                  ? arguments[3]
                  : function() {};
              var contexts = this.getContexts();
              var open = contexts.length;
              if (!open) {
                done();
              }
              contexts.forEach(function(ctx) {
                var ready = function ready() {
                  _this18.iterateThroughNodes(
                    whatToShow,
                    ctx,
                    each,
                    filter,
                    function() {
                      if (--open <= 0) {
                        done();
                      }
                    }
                  );
                };
                if (_this18.iframes) {
                  _this18.waitForIframes(ctx, ready);
                } else {
                  ready();
                }
              });
            }
          }
        ],
        [
          {
            key: "matches",
            value: function matches(element, selector) {
              var selectors =
                  typeof selector === "string" ? [selector] : selector,
                fn =
                  element.matches ||
                  element.matchesSelector ||
                  element.msMatchesSelector ||
                  element.mozMatchesSelector ||
                  element.oMatchesSelector ||
                  element.webkitMatchesSelector;
              if (fn) {
                var match = false;
                selectors.every(function(sel) {
                  if (fn.call(element, sel)) {
                    match = true;
                    return false;
                  }
                  return true;
                });
                return match;
              } else {
                return false;
              }
            }
          }
        ]
      );
      return DOMIterator;
    })();
    $.fn.mark = function(sv, opt) {
      new Mark(this.get()).mark(sv, opt);
      return this;
    };
    $.fn.markRegExp = function(regexp, opt) {
      new Mark(this.get()).markRegExp(regexp, opt);
      return this;
    };
    $.fn.markRanges = function(ranges, opt) {
      new Mark(this.get()).markRanges(ranges, opt);
      return this;
    };
    $.fn.unmark = function(opt) {
      new Mark(this.get()).unmark(opt);
      return this;
    };
    return $;
  },
  window,
  document
);
/*!***************************************************
 * mark.js v8.11.0
 * https://github.com/julmot/mark.js
 * Copyright (c) 2014–2017, Julian Motz
 * Released under the MIT license https://git.io/vwTVl
 *****************************************************/ ("use strict");
var _extends =
  Object.assign ||
  function(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];
      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }
    return target;
  };
var _createClass = (function() {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }
  return function(Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
})();
var _typeof =
  typeof Symbol === "function" && typeof Symbol.iterator === "symbol"
    ? function(obj) {
        return typeof obj;
      }
    : function(obj) {
        return obj &&
          typeof Symbol === "function" &&
          obj.constructor === Symbol &&
          obj !== Symbol.prototype
          ? "symbol"
          : typeof obj;
      };
function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}
(function(factory, window, document) {
  if (typeof define === "function" && define.amd) {
    define([], function() {
      return factory(window, document);
    });
  } else if (
    (typeof module === "undefined" ? "undefined" : _typeof(module)) ===
      "object" &&
    module.exports
  ) {
    module.exports = factory(window, document);
  } else {
    factory(window, document);
  }
})(
  function(window, document) {
    var Mark = (function() {
      function Mark(ctx) {
        _classCallCheck(this, Mark);
        this.ctx = ctx;
        this.ie = false;
        var ua = window.navigator.userAgent;
        if (ua.indexOf("MSIE") > -1 || ua.indexOf("Trident") > -1) {
          this.ie = true;
        }
      }
      _createClass(Mark, [
        {
          key: "log",
          value: function log(msg) {
            var level =
              arguments.length > 1 && arguments[1] !== undefined
                ? arguments[1]
                : "debug";
            var log = this.opt.log;
            if (!this.opt.debug) {
              return;
            }
            if (
              (typeof log === "undefined" ? "undefined" : _typeof(log)) ===
                "object" &&
              typeof log[level] === "function"
            ) {
              log[level]("mark.js: " + msg);
            }
          }
        },
        {
          key: "escapeStr",
          value: function escapeStr(str) {
            return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
          }
        },
        {
          key: "createRegExp",
          value: function createRegExp(str) {
            if (this.opt.wildcards !== "disabled") {
              str = this.setupWildcardsRegExp(str);
            }
            str = this.escapeStr(str);
            if (Object.keys(this.opt.synonyms).length) {
              str = this.createSynonymsRegExp(str);
            }
            if (this.opt.ignoreJoiners || this.opt.ignorePunctuation.length) {
              str = this.setupIgnoreJoinersRegExp(str);
            }
            if (this.opt.diacritics) {
              str = this.createDiacriticsRegExp(str);
            }
            str = this.createMergedBlanksRegExp(str);
            if (this.opt.ignoreJoiners || this.opt.ignorePunctuation.length) {
              str = this.createJoinersRegExp(str);
            }
            if (this.opt.wildcards !== "disabled") {
              str = this.createWildcardsRegExp(str);
            }
            str = this.createAccuracyRegExp(str);
            return str;
          }
        },
        {
          key: "createSynonymsRegExp",
          value: function createSynonymsRegExp(str) {
            var syn = this.opt.synonyms,
              sens = this.opt.caseSensitive ? "" : "i",
              joinerPlaceholder =
                this.opt.ignoreJoiners || this.opt.ignorePunctuation.length
                  ? "\0"
                  : "";
            for (var index in syn) {
              if (syn.hasOwnProperty(index)) {
                var value = syn[index],
                  k1 =
                    this.opt.wildcards !== "disabled"
                      ? this.setupWildcardsRegExp(index)
                      : this.escapeStr(index),
                  k2 =
                    this.opt.wildcards !== "disabled"
                      ? this.setupWildcardsRegExp(value)
                      : this.escapeStr(value);
                if (k1 !== "" && k2 !== "") {
                  str = str.replace(
                    new RegExp("(" + k1 + "|" + k2 + ")", "gm" + sens),
                    joinerPlaceholder +
                      ("(" + this.processSynomyms(k1) + "|") +
                      (this.processSynomyms(k2) + ")") +
                      joinerPlaceholder
                  );
                }
              }
            }
            return str;
          }
        },
        {
          key: "processSynomyms",
          value: function processSynomyms(str) {
            if (this.opt.ignoreJoiners || this.opt.ignorePunctuation.length) {
              str = this.setupIgnoreJoinersRegExp(str);
            }
            return str;
          }
        },
        {
          key: "setupWildcardsRegExp",
          value: function setupWildcardsRegExp(str) {
            str = str.replace(/(?:\\)*\?/g, function(val) {
              return val.charAt(0) === "\\" ? "?" : "\x01";
            });
            return str.replace(/(?:\\)*\*/g, function(val) {
              return val.charAt(0) === "\\" ? "*" : "\x02";
            });
          }
        },
        {
          key: "createWildcardsRegExp",
          value: function createWildcardsRegExp(str) {
            var spaces = this.opt.wildcards === "withSpaces";
            return str
              .replace(/\u0001/g, spaces ? "[\\S\\s]?" : "\\S?")
              .replace(/\u0002/g, spaces ? "[\\S\\s]*?" : "\\S*");
          }
        },
        {
          key: "setupIgnoreJoinersRegExp",
          value: function setupIgnoreJoinersRegExp(str) {
            return str.replace(/[^(|)\\]/g, function(val, indx, original) {
              var nextChar = original.charAt(indx + 1);
              if (/[(|)\\]/.test(nextChar) || nextChar === "") {
                return val;
              } else {
                return val + "\0";
              }
            });
          }
        },
        {
          key: "createJoinersRegExp",
          value: function createJoinersRegExp(str) {
            var joiner = [];
            var ignorePunctuation = this.opt.ignorePunctuation;
            if (Array.isArray(ignorePunctuation) && ignorePunctuation.length) {
              joiner.push(this.escapeStr(ignorePunctuation.join("")));
            }
            if (this.opt.ignoreJoiners) {
              joiner.push("\\u00ad\\u200b\\u200c\\u200d");
            }
            return joiner.length
              ? str.split(/\u0000+/).join("[" + joiner.join("") + "]*")
              : str;
          }
        },
        {
          key: "createDiacriticsRegExp",
          value: function createDiacriticsRegExp(str) {
            var sens = this.opt.caseSensitive ? "" : "i",
              dct = this.opt.caseSensitive
                ? [
                    "aàáảãạăằắẳẵặâầấẩẫậäåāą",
                    "AÀÁẢÃẠĂẰẮẲẴẶÂẦẤẨẪẬÄÅĀĄ",
                    "cçćč",
                    "CÇĆČ",
                    "dđď",
                    "DĐĎ",
                    "eèéẻẽẹêềếểễệëěēę",
                    "EÈÉẺẼẸÊỀẾỂỄỆËĚĒĘ",
                    "iìíỉĩịîïī",
                    "IÌÍỈĨỊÎÏĪ",
                    "lł",
                    "LŁ",
                    "nñňń",
                    "NÑŇŃ",
                    "oòóỏõọôồốổỗộơởỡớờợöøō",
                    "OÒÓỎÕỌÔỒỐỔỖỘƠỞỠỚỜỢÖØŌ",
                    "rř",
                    "RŘ",
                    "sšśșş",
                    "SŠŚȘŞ",
                    "tťțţ",
                    "TŤȚŢ",
                    "uùúủũụưừứửữựûüůū",
                    "UÙÚỦŨỤƯỪỨỬỮỰÛÜŮŪ",
                    "yýỳỷỹỵÿ",
                    "YÝỲỶỸỴŸ",
                    "zžżź",
                    "ZŽŻŹ"
                  ]
                : [
                    "aàáảãạăằắẳẵặâầấẩẫậäåāąAÀÁẢÃẠĂẰẮẲẴẶÂẦẤẨẪẬÄÅĀĄ",
                    "cçćčCÇĆČ",
                    "dđďDĐĎ",
                    "eèéẻẽẹêềếểễệëěēęEÈÉẺẼẸÊỀẾỂỄỆËĚĒĘ",
                    "iìíỉĩịîïīIÌÍỈĨỊÎÏĪ",
                    "lłLŁ",
                    "nñňńNÑŇŃ",
                    "oòóỏõọôồốổỗộơởỡớờợöøōOÒÓỎÕỌÔỒỐỔỖỘƠỞỠỚỜỢÖØŌ",
                    "rřRŘ",
                    "sšśșşSŠŚȘŞ",
                    "tťțţTŤȚŢ",
                    "uùúủũụưừứửữựûüůūUÙÚỦŨỤƯỪỨỬỮỰÛÜŮŪ",
                    "yýỳỷỹỵÿYÝỲỶỸỴŸ",
                    "zžżźZŽŻŹ"
                  ];
            var handled = [];
            str.split("").forEach(function(ch) {
              dct.every(function(dct) {
                if (dct.indexOf(ch) !== -1) {
                  if (handled.indexOf(dct) > -1) {
                    return false;
                  }
                  str = str.replace(
                    new RegExp("[" + dct + "]", "gm" + sens),
                    "[" + dct + "]"
                  );
                  handled.push(dct);
                }
                return true;
              });
            });
            return str;
          }
        },
        {
          key: "createMergedBlanksRegExp",
          value: function createMergedBlanksRegExp(str) {
            return str.replace(/[\s]+/gim, "[\\s]+");
          }
        },
        {
          key: "createAccuracyRegExp",
          value: function createAccuracyRegExp(str) {
            var _this = this;
            var chars = "!\"#$%&'()*+,-./:;<=>?@[\\]^_`{|}~\xA1\xBF";
            var acc = this.opt.accuracy,
              val = typeof acc === "string" ? acc : acc.value,
              ls = typeof acc === "string" ? [] : acc.limiters,
              lsJoin = "";
            ls.forEach(function(limiter) {
              lsJoin += "|" + _this.escapeStr(limiter);
            });
            switch (val) {
              case "partially":
              default:
                return "()(" + str + ")";
              case "complementary":
                lsJoin = "\\s" + (lsJoin ? lsJoin : this.escapeStr(chars));
                return "()([^" + lsJoin + "]*" + str + "[^" + lsJoin + "]*)";
              case "exactly":
                return (
                  "(^|\\s" + lsJoin + ")(" + str + ")(?=$|\\s" + lsJoin + ")"
                );
            }
          }
        },
        {
          key: "getSeparatedKeywords",
          value: function getSeparatedKeywords(sv) {
            var _this2 = this;
            var stack = [];
            sv.forEach(function(kw) {
              if (!_this2.opt.separateWordSearch) {
                if (kw.trim() && stack.indexOf(kw) === -1) {
                  stack.push(kw);
                }
              } else {
                kw.split(" ").forEach(function(kwSplitted) {
                  if (kwSplitted.trim() && stack.indexOf(kwSplitted) === -1) {
                    stack.push(kwSplitted);
                  }
                });
              }
            });
            return {
              keywords: stack.sort(function(a, b) {
                return b.length - a.length;
              }),
              length: stack.length
            };
          }
        },
        {
          key: "isNumeric",
          value: function isNumeric(value) {
            return Number(parseFloat(value)) == value;
          }
        },
        {
          key: "checkRanges",
          value: function checkRanges(array) {
            var _this3 = this;
            if (
              !Array.isArray(array) ||
              Object.prototype.toString.call(array[0]) !== "[object Object]"
            ) {
              this.log("markRanges() will only accept an array of objects");
              this.opt.noMatch(array);
              return [];
            }
            var stack = [];
            var last = 0;
            array
              .sort(function(a, b) {
                return a.start - b.start;
              })
              .forEach(function(item) {
                var _callNoMatchOnInvalid = _this3.callNoMatchOnInvalidRanges(
                    item,
                    last
                  ),
                  start = _callNoMatchOnInvalid.start,
                  end = _callNoMatchOnInvalid.end,
                  valid = _callNoMatchOnInvalid.valid;
                if (valid) {
                  item.start = start;
                  item.length = end - start;
                  stack.push(item);
                  last = end;
                }
              });
            return stack;
          }
        },
        {
          key: "callNoMatchOnInvalidRanges",
          value: function callNoMatchOnInvalidRanges(range, last) {
            var start = void 0,
              end = void 0,
              valid = false;
            if (range && typeof range.start !== "undefined") {
              start = parseInt(range.start, 10);
              end = start + parseInt(range.length, 10);
              if (
                this.isNumeric(range.start) &&
                this.isNumeric(range.length) &&
                end - last > 0 &&
                end - start > 0
              ) {
                valid = true;
              } else {
                this.log(
                  "Ignoring invalid or overlapping range: " +
                    ("" + JSON.stringify(range))
                );
                this.opt.noMatch(range);
              }
            } else {
              this.log("Ignoring invalid range: " + JSON.stringify(range));
              this.opt.noMatch(range);
            }
            return { start: start, end: end, valid: valid };
          }
        },
        {
          key: "checkWhitespaceRanges",
          value: function checkWhitespaceRanges(range, originalLength, string) {
            var end = void 0,
              valid = true,
              max = string.length,
              offset = originalLength - max,
              start = parseInt(range.start, 10) - offset;
            start = start > max ? max : start;
            end = start + parseInt(range.length, 10);
            if (end > max) {
              end = max;
              this.log(
                "End range automatically set to the max value of " + max
              );
            }
            if (start < 0 || end - start < 0 || start > max || end > max) {
              valid = false;
              this.log("Invalid range: " + JSON.stringify(range));
              this.opt.noMatch(range);
            } else if (
              string.substring(start, end).replace(/\s+/g, "") === ""
            ) {
              valid = false;
              this.log(
                "Skipping whitespace only range: " + JSON.stringify(range)
              );
              this.opt.noMatch(range);
            }
            return { start: start, end: end, valid: valid };
          }
        },
        {
          key: "getTextNodes",
          value: function getTextNodes(cb) {
            var _this4 = this;
            var val = "",
              nodes = [];
            this.iterator.forEachNode(
              NodeFilter.SHOW_TEXT,
              function(node) {
                nodes.push({
                  start: val.length,
                  end: (val += node.textContent).length,
                  node: node
                });
              },
              function(node) {
                if (_this4.matchesExclude(node.parentNode)) {
                  return NodeFilter.FILTER_REJECT;
                } else {
                  return NodeFilter.FILTER_ACCEPT;
                }
              },
              function() {
                cb({ value: val, nodes: nodes });
              }
            );
          }
        },
        {
          key: "matchesExclude",
          value: function matchesExclude(el) {
            return DOMIterator.matches(
              el,
              this.opt.exclude.concat([
                "script",
                "style",
                "title",
                "head",
                "html"
              ])
            );
          }
        },
        {
          key: "wrapRangeInTextNode",
          value: function wrapRangeInTextNode(node, start, end) {
            var hEl = !this.opt.element ? "mark" : this.opt.element,
              startNode = node.splitText(start),
              ret = startNode.splitText(end - start);
            var repl = document.createElement(hEl);
            repl.setAttribute("data-markjs", "true");
            if (this.opt.className) {
              repl.setAttribute("class", this.opt.className);
            }
            repl.textContent = startNode.textContent;
            startNode.parentNode.replaceChild(repl, startNode);
            return ret;
          }
        },
        {
          key: "wrapRangeInMappedTextNode",
          value: function wrapRangeInMappedTextNode(
            dict,
            start,
            end,
            filterCb,
            eachCb
          ) {
            var _this5 = this;
            dict.nodes.every(function(n, i) {
              var sibl = dict.nodes[i + 1];
              if (typeof sibl === "undefined" || sibl.start > start) {
                if (!filterCb(n.node)) {
                  return false;
                }
                var s = start - n.start,
                  e = (end > n.end ? n.end : end) - n.start,
                  startStr = dict.value.substr(0, n.start),
                  endStr = dict.value.substr(e + n.start);
                n.node = _this5.wrapRangeInTextNode(n.node, s, e);
                dict.value = startStr + endStr;
                dict.nodes.forEach(function(k, j) {
                  if (j >= i) {
                    if (dict.nodes[j].start > 0 && j !== i) {
                      dict.nodes[j].start -= e;
                    }
                    dict.nodes[j].end -= e;
                  }
                });
                end -= e;
                eachCb(n.node.previousSibling, n.start);
                if (end > n.end) {
                  start = n.end;
                } else {
                  return false;
                }
              }
              return true;
            });
          }
        },
        {
          key: "wrapMatches",
          value: function wrapMatches(
            regex,
            ignoreGroups,
            filterCb,
            eachCb,
            endCb
          ) {
            var _this6 = this;
            var matchIdx = ignoreGroups === 0 ? 0 : ignoreGroups + 1;
            this.getTextNodes(function(dict) {
              dict.nodes.forEach(function(node) {
                node = node.node;
                var match = void 0;
                while (
                  (match = regex.exec(node.textContent)) !== null &&
                  match[matchIdx] !== ""
                ) {
                  if (!filterCb(match[matchIdx], node)) {
                    continue;
                  }
                  var pos = match.index;
                  if (matchIdx !== 0) {
                    for (var i = 1; i < matchIdx; i++) {
                      pos += match[i].length;
                    }
                  }
                  node = _this6.wrapRangeInTextNode(
                    node,
                    pos,
                    pos + match[matchIdx].length
                  );
                  eachCb(node.previousSibling);
                  regex.lastIndex = 0;
                }
              });
              endCb();
            });
          }
        },
        {
          key: "wrapMatchesAcrossElements",
          value: function wrapMatchesAcrossElements(
            regex,
            ignoreGroups,
            filterCb,
            eachCb,
            endCb
          ) {
            var _this7 = this;
            var matchIdx = ignoreGroups === 0 ? 0 : ignoreGroups + 1;
            this.getTextNodes(function(dict) {
              var match = void 0;
              while (
                (match = regex.exec(dict.value)) !== null &&
                match[matchIdx] !== ""
              ) {
                var start = match.index;
                if (matchIdx !== 0) {
                  for (var i = 1; i < matchIdx; i++) {
                    start += match[i].length;
                  }
                }
                var end = start + match[matchIdx].length;
                _this7.wrapRangeInMappedTextNode(
                  dict,
                  start,
                  end,
                  function(node) {
                    return filterCb(match[matchIdx], node);
                  },
                  function(node, lastIndex) {
                    regex.lastIndex = lastIndex;
                    eachCb(node);
                  }
                );
              }
              endCb();
            });
          }
        },
        {
          key: "wrapRangeFromIndex",
          value: function wrapRangeFromIndex(ranges, filterCb, eachCb, endCb) {
            var _this8 = this;
            this.getTextNodes(function(dict) {
              var originalLength = dict.value.length;
              ranges.forEach(function(range, counter) {
                var _checkWhitespaceRange = _this8.checkWhitespaceRanges(
                    range,
                    originalLength,
                    dict.value
                  ),
                  start = _checkWhitespaceRange.start,
                  end = _checkWhitespaceRange.end,
                  valid = _checkWhitespaceRange.valid;
                if (valid) {
                  _this8.wrapRangeInMappedTextNode(
                    dict,
                    start,
                    end,
                    function(node) {
                      return filterCb(
                        node,
                        range,
                        dict.value.substring(start, end),
                        counter
                      );
                    },
                    function(node) {
                      eachCb(node, range);
                    }
                  );
                }
              });
              endCb();
            });
          }
        },
        {
          key: "unwrapMatches",
          value: function unwrapMatches(node) {
            var parent = node.parentNode;
            var docFrag = document.createDocumentFragment();
            while (node.firstChild) {
              docFrag.appendChild(node.removeChild(node.firstChild));
            }
            parent.replaceChild(docFrag, node);
            if (!this.ie) {
              parent.normalize();
            } else {
              this.normalizeTextNode(parent);
            }
          }
        },
        {
          key: "normalizeTextNode",
          value: function normalizeTextNode(node) {
            if (!node) {
              return;
            }
            if (node.nodeType === 3) {
              while (node.nextSibling && node.nextSibling.nodeType === 3) {
                node.nodeValue += node.nextSibling.nodeValue;
                node.parentNode.removeChild(node.nextSibling);
              }
            } else {
              this.normalizeTextNode(node.firstChild);
            }
            this.normalizeTextNode(node.nextSibling);
          }
        },
        {
          key: "markRegExp",
          value: function markRegExp(regexp, opt) {
            var _this9 = this;
            this.opt = opt;
            this.log('Searching with expression "' + regexp + '"');
            var totalMatches = 0,
              fn = "wrapMatches";
            var eachCb = function eachCb(element) {
              totalMatches++;
              _this9.opt.each(element);
            };
            if (this.opt.acrossElements) {
              fn = "wrapMatchesAcrossElements";
            }
            this[fn](
              regexp,
              this.opt.ignoreGroups,
              function(match, node) {
                return _this9.opt.filter(node, match, totalMatches);
              },
              eachCb,
              function() {
                if (totalMatches === 0) {
                  _this9.opt.noMatch(regexp);
                }
                _this9.opt.done(totalMatches);
              }
            );
          }
        },
        {
          key: "mark",
          value: function mark(sv, opt) {
            var _this10 = this;
            this.opt = opt;
            var totalMatches = 0,
              fn = "wrapMatches";
            var _getSeparatedKeywords = this.getSeparatedKeywords(
                typeof sv === "string" ? [sv] : sv
              ),
              kwArr = _getSeparatedKeywords.keywords,
              kwArrLen = _getSeparatedKeywords.length,
              sens = this.opt.caseSensitive ? "" : "i",
              handler = function handler(kw) {
                var regex = new RegExp(_this10.createRegExp(kw), "gm" + sens),
                  matches = 0;
                _this10.log('Searching with expression "' + regex + '"');
                _this10[fn](
                  regex,
                  1,
                  function(term, node) {
                    return _this10.opt.filter(node, kw, totalMatches, matches);
                  },
                  function(element) {
                    matches++;
                    totalMatches++;
                    _this10.opt.each(element);
                  },
                  function() {
                    if (matches === 0) {
                      _this10.opt.noMatch(kw);
                    }
                    if (kwArr[kwArrLen - 1] === kw) {
                      _this10.opt.done(totalMatches);
                    } else {
                      handler(kwArr[kwArr.indexOf(kw) + 1]);
                    }
                  }
                );
              };
            if (this.opt.acrossElements) {
              fn = "wrapMatchesAcrossElements";
            }
            if (kwArrLen === 0) {
              this.opt.done(totalMatches);
            } else {
              handler(kwArr[0]);
            }
          }
        },
        {
          key: "markRanges",
          value: function markRanges(rawRanges, opt) {
            var _this11 = this;
            this.opt = opt;
            var totalMatches = 0,
              ranges = this.checkRanges(rawRanges);
            if (ranges && ranges.length) {
              this.log(
                "Starting to mark with the following ranges: " +
                  JSON.stringify(ranges)
              );
              this.wrapRangeFromIndex(
                ranges,
                function(node, range, match, counter) {
                  return _this11.opt.filter(node, range, match, counter);
                },
                function(element, range) {
                  totalMatches++;
                  _this11.opt.each(element, range);
                },
                function() {
                  _this11.opt.done(totalMatches);
                }
              );
            } else {
              this.opt.done(totalMatches);
            }
          }
        },
        {
          key: "unmark",
          value: function unmark(opt) {
            var _this12 = this;
            this.opt = opt;
            var sel = this.opt.element ? this.opt.element : "*";
            sel += "[data-markjs]";
            if (this.opt.className) {
              sel += "." + this.opt.className;
            }
            this.log('Removal selector "' + sel + '"');
            this.iterator.forEachNode(
              NodeFilter.SHOW_ELEMENT,
              function(node) {
                _this12.unwrapMatches(node);
              },
              function(node) {
                var matchesSel = DOMIterator.matches(node, sel),
                  matchesExclude = _this12.matchesExclude(node);
                if (!matchesSel || matchesExclude) {
                  return NodeFilter.FILTER_REJECT;
                } else {
                  return NodeFilter.FILTER_ACCEPT;
                }
              },
              this.opt.done
            );
          }
        },
        {
          key: "opt",
          set: function set(val) {
            this._opt = _extends(
              {},
              {
                element: "",
                className: "",
                exclude: [],
                iframes: false,
                iframesTimeout: 5000,
                separateWordSearch: true,
                diacritics: true,
                synonyms: {},
                accuracy: "partially",
                acrossElements: false,
                caseSensitive: false,
                ignoreJoiners: false,
                ignoreGroups: 0,
                ignorePunctuation: [],
                wildcards: "disabled",
                each: function each() {},
                noMatch: function noMatch() {},
                filter: function filter() {
                  return true;
                },
                done: function done() {},
                debug: false,
                log: window.console
              },
              val
            );
          },
          get: function get() {
            return this._opt;
          }
        },
        {
          key: "iterator",
          get: function get() {
            return new DOMIterator(
              this.ctx,
              this.opt.iframes,
              this.opt.exclude,
              this.opt.iframesTimeout
            );
          }
        }
      ]);
      return Mark;
    })();
    var DOMIterator = (function() {
      function DOMIterator(ctx) {
        var iframes =
          arguments.length > 1 && arguments[1] !== undefined
            ? arguments[1]
            : true;
        var exclude =
          arguments.length > 2 && arguments[2] !== undefined
            ? arguments[2]
            : [];
        var iframesTimeout =
          arguments.length > 3 && arguments[3] !== undefined
            ? arguments[3]
            : 5000;
        _classCallCheck(this, DOMIterator);
        this.ctx = ctx;
        this.iframes = iframes;
        this.exclude = exclude;
        this.iframesTimeout = iframesTimeout;
      }
      _createClass(
        DOMIterator,
        [
          {
            key: "getContexts",
            value: function getContexts() {
              var ctx = void 0,
                filteredCtx = [];
              if (typeof this.ctx === "undefined" || !this.ctx) {
                ctx = [];
              } else if (NodeList.prototype.isPrototypeOf(this.ctx)) {
                ctx = Array.prototype.slice.call(this.ctx);
              } else if (Array.isArray(this.ctx)) {
                ctx = this.ctx;
              } else if (typeof this.ctx === "string") {
                ctx = Array.prototype.slice.call(
                  document.querySelectorAll(this.ctx)
                );
              } else {
                ctx = [this.ctx];
              }
              ctx.forEach(function(ctx) {
                var isDescendant =
                  filteredCtx.filter(function(contexts) {
                    return contexts.contains(ctx);
                  }).length > 0;
                if (filteredCtx.indexOf(ctx) === -1 && !isDescendant) {
                  filteredCtx.push(ctx);
                }
              });
              return filteredCtx;
            }
          },
          {
            key: "getIframeContents",
            value: function getIframeContents(ifr, successFn) {
              var errorFn =
                arguments.length > 2 && arguments[2] !== undefined
                  ? arguments[2]
                  : function() {};
              var doc = void 0;
              try {
                var ifrWin = ifr.contentWindow;
                doc = ifrWin.document;
                if (!ifrWin || !doc) {
                  throw new Error("iframe inaccessible");
                }
              } catch (e) {
                errorFn();
              }
              if (doc) {
                successFn(doc);
              }
            }
          },
          {
            key: "isIframeBlank",
            value: function isIframeBlank(ifr) {
              var bl = "about:blank",
                src = ifr.getAttribute("src").trim(),
                href = ifr.contentWindow.location.href;
              return href === bl && src !== bl && src;
            }
          },
          {
            key: "observeIframeLoad",
            value: function observeIframeLoad(ifr, successFn, errorFn) {
              var _this13 = this;
              var called = false,
                tout = null;
              var listener = function listener() {
                if (called) {
                  return;
                }
                called = true;
                clearTimeout(tout);
                try {
                  if (!_this13.isIframeBlank(ifr)) {
                    ifr.removeEventListener("load", listener);
                    _this13.getIframeContents(ifr, successFn, errorFn);
                  }
                } catch (e) {
                  errorFn();
                }
              };
              ifr.addEventListener("load", listener);
              tout = setTimeout(listener, this.iframesTimeout);
            }
          },
          {
            key: "onIframeReady",
            value: function onIframeReady(ifr, successFn, errorFn) {
              try {
                if (ifr.contentWindow.document.readyState === "complete") {
                  if (this.isIframeBlank(ifr)) {
                    this.observeIframeLoad(ifr, successFn, errorFn);
                  } else {
                    this.getIframeContents(ifr, successFn, errorFn);
                  }
                } else {
                  this.observeIframeLoad(ifr, successFn, errorFn);
                }
              } catch (e) {
                errorFn();
              }
            }
          },
          {
            key: "waitForIframes",
            value: function waitForIframes(ctx, done) {
              var _this14 = this;
              var eachCalled = 0;
              this.forEachIframe(
                ctx,
                function() {
                  return true;
                },
                function(ifr) {
                  eachCalled++;
                  _this14.waitForIframes(ifr.querySelector("html"), function() {
                    if (!--eachCalled) {
                      done();
                    }
                  });
                },
                function(handled) {
                  if (!handled) {
                    done();
                  }
                }
              );
            }
          },
          {
            key: "forEachIframe",
            value: function forEachIframe(ctx, filter, each) {
              var _this15 = this;
              var end =
                arguments.length > 3 && arguments[3] !== undefined
                  ? arguments[3]
                  : function() {};
              var ifr = ctx.querySelectorAll("iframe"),
                open = ifr.length,
                handled = 0;
              ifr = Array.prototype.slice.call(ifr);
              var checkEnd = function checkEnd() {
                if (--open <= 0) {
                  end(handled);
                }
              };
              if (!open) {
                checkEnd();
              }
              ifr.forEach(function(ifr) {
                if (DOMIterator.matches(ifr, _this15.exclude)) {
                  checkEnd();
                } else {
                  _this15.onIframeReady(
                    ifr,
                    function(con) {
                      if (filter(ifr)) {
                        handled++;
                        each(con);
                      }
                      checkEnd();
                    },
                    checkEnd
                  );
                }
              });
            }
          },
          {
            key: "createIterator",
            value: function createIterator(ctx, whatToShow, filter) {
              return document.createNodeIterator(
                ctx,
                whatToShow,
                filter,
                false
              );
            }
          },
          {
            key: "createInstanceOnIframe",
            value: function createInstanceOnIframe(contents) {
              return new DOMIterator(
                contents.querySelector("html"),
                this.iframes
              );
            }
          },
          {
            key: "compareNodeIframe",
            value: function compareNodeIframe(node, prevNode, ifr) {
              var compCurr = node.compareDocumentPosition(ifr),
                prev = Node.DOCUMENT_POSITION_PRECEDING;
              if (compCurr & prev) {
                if (prevNode !== null) {
                  var compPrev = prevNode.compareDocumentPosition(ifr),
                    after = Node.DOCUMENT_POSITION_FOLLOWING;
                  if (compPrev & after) {
                    return true;
                  }
                } else {
                  return true;
                }
              }
              return false;
            }
          },
          {
            key: "getIteratorNode",
            value: function getIteratorNode(itr) {
              var prevNode = itr.previousNode();
              var node = void 0;
              if (prevNode === null) {
                node = itr.nextNode();
              } else {
                node = itr.nextNode() && itr.nextNode();
              }
              return { prevNode: prevNode, node: node };
            }
          },
          {
            key: "checkIframeFilter",
            value: function checkIframeFilter(node, prevNode, currIfr, ifr) {
              var key = false,
                handled = false;
              ifr.forEach(function(ifrDict, i) {
                if (ifrDict.val === currIfr) {
                  key = i;
                  handled = ifrDict.handled;
                }
              });
              if (this.compareNodeIframe(node, prevNode, currIfr)) {
                if (key === false && !handled) {
                  ifr.push({ val: currIfr, handled: true });
                } else if (key !== false && !handled) {
                  ifr[key].handled = true;
                }
                return true;
              }
              if (key === false) {
                ifr.push({ val: currIfr, handled: false });
              }
              return false;
            }
          },
          {
            key: "handleOpenIframes",
            value: function handleOpenIframes(ifr, whatToShow, eCb, fCb) {
              var _this16 = this;
              ifr.forEach(function(ifrDict) {
                if (!ifrDict.handled) {
                  _this16.getIframeContents(ifrDict.val, function(con) {
                    _this16
                      .createInstanceOnIframe(con)
                      .forEachNode(whatToShow, eCb, fCb);
                  });
                }
              });
            }
          },
          {
            key: "iterateThroughNodes",
            value: function iterateThroughNodes(
              whatToShow,
              ctx,
              eachCb,
              filterCb,
              doneCb
            ) {
              var _this17 = this;
              var itr = this.createIterator(ctx, whatToShow, filterCb);
              var ifr = [],
                elements = [],
                node = void 0,
                prevNode = void 0,
                retrieveNodes = function retrieveNodes() {
                  var _getIteratorNode = _this17.getIteratorNode(itr);
                  prevNode = _getIteratorNode.prevNode;
                  node = _getIteratorNode.node;
                  return node;
                };
              while (retrieveNodes()) {
                if (this.iframes) {
                  this.forEachIframe(
                    ctx,
                    function(currIfr) {
                      return _this17.checkIframeFilter(
                        node,
                        prevNode,
                        currIfr,
                        ifr
                      );
                    },
                    function(con) {
                      _this17.createInstanceOnIframe(con).forEachNode(
                        whatToShow,
                        function(ifrNode) {
                          return elements.push(ifrNode);
                        },
                        filterCb
                      );
                    }
                  );
                }
                elements.push(node);
              }
              elements.forEach(function(node) {
                eachCb(node);
              });
              if (this.iframes) {
                this.handleOpenIframes(ifr, whatToShow, eachCb, filterCb);
              }
              doneCb();
            }
          },
          {
            key: "forEachNode",
            value: function forEachNode(whatToShow, each, filter) {
              var _this18 = this;
              var done =
                arguments.length > 3 && arguments[3] !== undefined
                  ? arguments[3]
                  : function() {};
              var contexts = this.getContexts();
              var open = contexts.length;
              if (!open) {
                done();
              }
              contexts.forEach(function(ctx) {
                var ready = function ready() {
                  _this18.iterateThroughNodes(
                    whatToShow,
                    ctx,
                    each,
                    filter,
                    function() {
                      if (--open <= 0) {
                        done();
                      }
                    }
                  );
                };
                if (_this18.iframes) {
                  _this18.waitForIframes(ctx, ready);
                } else {
                  ready();
                }
              });
            }
          }
        ],
        [
          {
            key: "matches",
            value: function matches(element, selector) {
              var selectors =
                  typeof selector === "string" ? [selector] : selector,
                fn =
                  element.matches ||
                  element.matchesSelector ||
                  element.msMatchesSelector ||
                  element.mozMatchesSelector ||
                  element.oMatchesSelector ||
                  element.webkitMatchesSelector;
              if (fn) {
                var match = false;
                selectors.every(function(sel) {
                  if (fn.call(element, sel)) {
                    match = true;
                    return false;
                  }
                  return true;
                });
                return match;
              } else {
                return false;
              }
            }
          }
        ]
      );
      return DOMIterator;
    })();
    window.Mark = function(ctx) {
      var _this19 = this;
      var instance = new Mark(ctx);
      this.mark = function(sv, opt) {
        instance.mark(sv, opt);
        return _this19;
      };
      this.markRegExp = function(sv, opt) {
        instance.markRegExp(sv, opt);
        return _this19;
      };
      this.markRanges = function(sv, opt) {
        instance.markRanges(sv, opt);
        return _this19;
      };
      this.unmark = function(opt) {
        instance.unmark(opt);
        return _this19;
      };
      return this;
    };
    return window.Mark;
  },
  window,
  document
);
/*! WOW - v1.1.2 - 2015-08-19
 * Copyright (c) 2015 Matthieu Aussaguel; Licensed MIT */ (function() {
  var a,
    b,
    c,
    d,
    e,
    f = function(a, b) {
      return function() {
        return a.apply(b, arguments);
      };
    },
    g =
      [].indexOf ||
      function(a) {
        for (var b = 0, c = this.length; c > b; b++)
          if (b in this && this[b] === a) return b;
        return -1;
      };
  (b = (function() {
    function a() {}
    return (
      (a.prototype.extend = function(a, b) {
        var c, d;
        for (c in b) (d = b[c]), null == a[c] && (a[c] = d);
        return a;
      }),
      (a.prototype.isMobile = function(a) {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          a
        );
      }),
      (a.prototype.createEvent = function(a, b, c, d) {
        var e;
        return (
          null == b && (b = !1),
          null == c && (c = !1),
          null == d && (d = null),
          null != document.createEvent
            ? ((e = document.createEvent("CustomEvent")),
              e.initCustomEvent(a, b, c, d))
            : null != document.createEventObject
            ? ((e = document.createEventObject()), (e.eventType = a))
            : (e.eventName = a),
          e
        );
      }),
      (a.prototype.emitEvent = function(a, b) {
        return null != a.dispatchEvent
          ? a.dispatchEvent(b)
          : b in (null != a)
          ? a[b]()
          : "on" + b in (null != a)
          ? a["on" + b]()
          : void 0;
      }),
      (a.prototype.addEvent = function(a, b, c) {
        return null != a.addEventListener
          ? a.addEventListener(b, c, !1)
          : null != a.attachEvent
          ? a.attachEvent("on" + b, c)
          : (a[b] = c);
      }),
      (a.prototype.removeEvent = function(a, b, c) {
        return null != a.removeEventListener
          ? a.removeEventListener(b, c, !1)
          : null != a.detachEvent
          ? a.detachEvent("on" + b, c)
          : delete a[b];
      }),
      (a.prototype.innerHeight = function() {
        return "innerHeight" in window
          ? window.innerHeight
          : document.documentElement.clientHeight;
      }),
      a
    );
  })()),
    (c =
      this.WeakMap ||
      this.MozWeakMap ||
      (c = (function() {
        function a() {
          (this.keys = []), (this.values = []);
        }
        return (
          (a.prototype.get = function(a) {
            var b, c, d, e, f;
            for (f = this.keys, b = d = 0, e = f.length; e > d; b = ++d)
              if (((c = f[b]), c === a)) return this.values[b];
          }),
          (a.prototype.set = function(a, b) {
            var c, d, e, f, g;
            for (g = this.keys, c = e = 0, f = g.length; f > e; c = ++e)
              if (((d = g[c]), d === a)) return void (this.values[c] = b);
            return this.keys.push(a), this.values.push(b);
          }),
          a
        );
      })())),
    (a =
      this.MutationObserver ||
      this.WebkitMutationObserver ||
      this.MozMutationObserver ||
      (a = (function() {
        function a() {
          "undefined" != typeof console &&
            null !== console &&
            console.warn("MutationObserver is not supported by your browser."),
            "undefined" != typeof console &&
              null !== console &&
              console.warn(
                "WOW.js cannot detect dom mutations, please call .sync() after loading new content."
              );
        }
        return (a.notSupported = !0), (a.prototype.observe = function() {}), a;
      })())),
    (d =
      this.getComputedStyle ||
      function(a) {
        return (
          (this.getPropertyValue = function(b) {
            var c;
            return (
              "float" === b && (b = "styleFloat"),
              e.test(b) &&
                b.replace(e, function(a, b) {
                  return b.toUpperCase();
                }),
              (null != (c = a.currentStyle) ? c[b] : void 0) || null
            );
          }),
          this
        );
      }),
    (e = /(\-([a-z]){1})/g),
    (this.WOW = (function() {
      function e(a) {
        null == a && (a = {}),
          (this.scrollCallback = f(this.scrollCallback, this)),
          (this.scrollHandler = f(this.scrollHandler, this)),
          (this.resetAnimation = f(this.resetAnimation, this)),
          (this.start = f(this.start, this)),
          (this.scrolled = !0),
          (this.config = this.util().extend(a, this.defaults)),
          null != a.scrollContainer &&
            (this.config.scrollContainer = document.querySelector(
              a.scrollContainer
            )),
          (this.animationNameCache = new c()),
          (this.wowEvent = this.util().createEvent(this.config.boxClass));
      }
      return (
        (e.prototype.defaults = {
          boxClass: "wow",
          animateClass: "animated",
          offset: 0,
          mobile: !0,
          live: !0,
          callback: null,
          scrollContainer: null
        }),
        (e.prototype.init = function() {
          var a;
          return (
            (this.element = window.document.documentElement),
            "interactive" === (a = document.readyState) || "complete" === a
              ? this.start()
              : this.util().addEvent(document, "DOMContentLoaded", this.start),
            (this.finished = [])
          );
        }),
        (e.prototype.start = function() {
          var b, c, d, e;
          if (
            ((this.stopped = !1),
            (this.boxes = function() {
              var a, c, d, e;
              for (
                d = this.element.querySelectorAll("." + this.config.boxClass),
                  e = [],
                  a = 0,
                  c = d.length;
                c > a;
                a++
              )
                (b = d[a]), e.push(b);
              return e;
            }.call(this)),
            (this.all = function() {
              var a, c, d, e;
              for (d = this.boxes, e = [], a = 0, c = d.length; c > a; a++)
                (b = d[a]), e.push(b);
              return e;
            }.call(this)),
            this.boxes.length)
          )
            if (this.disabled()) this.resetStyle();
            else
              for (e = this.boxes, c = 0, d = e.length; d > c; c++)
                (b = e[c]), this.applyStyle(b, !0);
          return (
            this.disabled() ||
              (this.util().addEvent(
                this.config.scrollContainer || window,
                "scroll",
                this.scrollHandler
              ),
              this.util().addEvent(window, "resize", this.scrollHandler),
              (this.interval = setInterval(this.scrollCallback, 50))),
            this.config.live
              ? new a(
                  (function(a) {
                    return function(b) {
                      var c, d, e, f, g;
                      for (g = [], c = 0, d = b.length; d > c; c++)
                        (f = b[c]),
                          g.push(
                            function() {
                              var a, b, c, d;
                              for (
                                c = f.addedNodes || [],
                                  d = [],
                                  a = 0,
                                  b = c.length;
                                b > a;
                                a++
                              )
                                (e = c[a]), d.push(this.doSync(e));
                              return d;
                            }.call(a)
                          );
                      return g;
                    };
                  })(this)
                ).observe(document.body, { childList: !0, subtree: !0 })
              : void 0
          );
        }),
        (e.prototype.stop = function() {
          return (
            (this.stopped = !0),
            this.util().removeEvent(
              this.config.scrollContainer || window,
              "scroll",
              this.scrollHandler
            ),
            this.util().removeEvent(window, "resize", this.scrollHandler),
            null != this.interval ? clearInterval(this.interval) : void 0
          );
        }),
        (e.prototype.sync = function() {
          return a.notSupported ? this.doSync(this.element) : void 0;
        }),
        (e.prototype.doSync = function(a) {
          var b, c, d, e, f;
          if ((null == a && (a = this.element), 1 === a.nodeType)) {
            for (
              a = a.parentNode || a,
                e = a.querySelectorAll("." + this.config.boxClass),
                f = [],
                c = 0,
                d = e.length;
              d > c;
              c++
            )
              (b = e[c]),
                g.call(this.all, b) < 0
                  ? (this.boxes.push(b),
                    this.all.push(b),
                    this.stopped || this.disabled()
                      ? this.resetStyle()
                      : this.applyStyle(b, !0),
                    f.push((this.scrolled = !0)))
                  : f.push(void 0);
            return f;
          }
        }),
        (e.prototype.show = function(a) {
          return (
            this.applyStyle(a),
            (a.className = a.className + " " + this.config.animateClass),
            null != this.config.callback && this.config.callback(a),
            this.util().emitEvent(a, this.wowEvent),
            this.util().addEvent(a, "animationend", this.resetAnimation),
            this.util().addEvent(a, "oanimationend", this.resetAnimation),
            this.util().addEvent(a, "webkitAnimationEnd", this.resetAnimation),
            this.util().addEvent(a, "MSAnimationEnd", this.resetAnimation),
            a
          );
        }),
        (e.prototype.applyStyle = function(a, b) {
          var c, d, e;
          return (
            (d = a.getAttribute("data-wow-duration")),
            (c = a.getAttribute("data-wow-delay")),
            (e = a.getAttribute("data-wow-iteration")),
            this.animate(
              (function(f) {
                return function() {
                  return f.customStyle(a, b, d, c, e);
                };
              })(this)
            )
          );
        }),
        (e.prototype.animate = (function() {
          return "requestAnimationFrame" in window
            ? function(a) {
                return window.requestAnimationFrame(a);
              }
            : function(a) {
                return a();
              };
        })()),
        (e.prototype.resetStyle = function() {
          var a, b, c, d, e;
          for (d = this.boxes, e = [], b = 0, c = d.length; c > b; b++)
            (a = d[b]), e.push((a.style.visibility = "visible"));
          return e;
        }),
        (e.prototype.resetAnimation = function(a) {
          var b;
          return a.type.toLowerCase().indexOf("animationend") >= 0
            ? ((b = a.target || a.srcElement),
              (b.className = b.className
                .replace(this.config.animateClass, "")
                .trim()))
            : void 0;
        }),
        (e.prototype.customStyle = function(a, b, c, d, e) {
          return (
            b && this.cacheAnimationName(a),
            (a.style.visibility = b ? "hidden" : "visible"),
            c && this.vendorSet(a.style, { animationDuration: c }),
            d && this.vendorSet(a.style, { animationDelay: d }),
            e && this.vendorSet(a.style, { animationIterationCount: e }),
            this.vendorSet(a.style, {
              animationName: b ? "none" : this.cachedAnimationName(a)
            }),
            a
          );
        }),
        (e.prototype.vendors = ["moz", "webkit"]),
        (e.prototype.vendorSet = function(a, b) {
          var c, d, e, f;
          d = [];
          for (c in b)
            (e = b[c]),
              (a["" + c] = e),
              d.push(
                function() {
                  var b, d, g, h;
                  for (
                    g = this.vendors, h = [], b = 0, d = g.length;
                    d > b;
                    b++
                  )
                    (f = g[b]),
                      h.push(
                        (a[
                          "" + f + c.charAt(0).toUpperCase() + c.substr(1)
                        ] = e)
                      );
                  return h;
                }.call(this)
              );
          return d;
        }),
        (e.prototype.vendorCSS = function(a, b) {
          var c, e, f, g, h, i;
          for (
            h = d(a),
              g = h.getPropertyCSSValue(b),
              f = this.vendors,
              c = 0,
              e = f.length;
            e > c;
            c++
          )
            (i = f[c]), (g = g || h.getPropertyCSSValue("-" + i + "-" + b));
          return g;
        }),
        (e.prototype.animationName = function(a) {
          var b;
          try {
            b = this.vendorCSS(a, "animation-name").cssText;
          } catch (c) {
            b = d(a).getPropertyValue("animation-name");
          }
          return "none" === b ? "" : b;
        }),
        (e.prototype.cacheAnimationName = function(a) {
          return this.animationNameCache.set(a, this.animationName(a));
        }),
        (e.prototype.cachedAnimationName = function(a) {
          return this.animationNameCache.get(a);
        }),
        (e.prototype.scrollHandler = function() {
          return (this.scrolled = !0);
        }),
        (e.prototype.scrollCallback = function() {
          var a;
          return !this.scrolled ||
            ((this.scrolled = !1),
            (this.boxes = function() {
              var b, c, d, e;
              for (d = this.boxes, e = [], b = 0, c = d.length; c > b; b++)
                (a = d[b]), a && (this.isVisible(a) ? this.show(a) : e.push(a));
              return e;
            }.call(this)),
            this.boxes.length || this.config.live)
            ? void 0
            : this.stop();
        }),
        (e.prototype.offsetTop = function(a) {
          for (var b; void 0 === a.offsetTop; ) a = a.parentNode;
          for (b = a.offsetTop; (a = a.offsetParent); ) b += a.offsetTop;
          return b;
        }),
        (e.prototype.isVisible = function(a) {
          var b, c, d, e, f;
          return (
            (c = a.getAttribute("data-wow-offset") || this.config.offset),
            (f =
              (this.config.scrollContainer &&
                this.config.scrollContainer.scrollTop) ||
              window.pageYOffset),
            (e =
              f +
              Math.min(this.element.clientHeight, this.util().innerHeight()) -
              c),
            (d = this.offsetTop(a)),
            (b = d + a.clientHeight),
            e >= d && b >= f
          );
        }),
        (e.prototype.util = function() {
          return null != this._util ? this._util : (this._util = new b());
        }),
        (e.prototype.disabled = function() {
          return (
            !this.config.mobile && this.util().isMobile(navigator.userAgent)
          );
        }),
        e
      );
    })());
}.call(this));
!(function() {
  "use strict";
  function e(e) {
    e.fn.swiper = function(a) {
      var r;
      return (
        e(this).each(function() {
          var e = new t(this, a);
          r || (r = e);
        }),
        r
      );
    };
  }
  var a,
    t = function(e, i) {
      function s(e) {
        return Math.floor(e);
      }
      function n() {
        b.autoplayTimeoutId = setTimeout(function() {
          b.params.loop
            ? (b.fixLoop(), b._slideNext(), b.emit("onAutoplay", b))
            : b.isEnd
            ? i.autoplayStopOnLast
              ? b.stopAutoplay()
              : (b._slideTo(0), b.emit("onAutoplay", b))
            : (b._slideNext(), b.emit("onAutoplay", b));
        }, b.params.autoplay);
      }
      function o(e, t) {
        var r = a(e.target);
        if (!r.is(t))
          if ("string" == typeof t) r = r.parents(t);
          else if (t.nodeType) {
            var i;
            return (
              r.parents().each(function(e, a) {
                a === t && (i = t);
              }),
              i ? t : void 0
            );
          }
        if (0 !== r.length) return r[0];
      }
      function l(e, a) {
        a = a || {};
        var t = window.MutationObserver || window.WebkitMutationObserver,
          r = new t(function(e) {
            e.forEach(function(e) {
              b.onResize(!0), b.emit("onObserverUpdate", b, e);
            });
          });
        r.observe(e, {
          attributes: "undefined" == typeof a.attributes ? !0 : a.attributes,
          childList: "undefined" == typeof a.childList ? !0 : a.childList,
          characterData:
            "undefined" == typeof a.characterData ? !0 : a.characterData
        }),
          b.observers.push(r);
      }
      function p(e) {
        e.originalEvent && (e = e.originalEvent);
        var a = e.keyCode || e.charCode;
        if (
          !b.params.allowSwipeToNext &&
          ((b.isHorizontal() && 39 === a) || (!b.isHorizontal() && 40 === a))
        )
          return !1;
        if (
          !b.params.allowSwipeToPrev &&
          ((b.isHorizontal() && 37 === a) || (!b.isHorizontal() && 38 === a))
        )
          return !1;
        if (
          !(
            e.shiftKey ||
            e.altKey ||
            e.ctrlKey ||
            e.metaKey ||
            (document.activeElement &&
              document.activeElement.nodeName &&
              ("input" === document.activeElement.nodeName.toLowerCase() ||
                "textarea" === document.activeElement.nodeName.toLowerCase()))
          )
        ) {
          if (37 === a || 39 === a || 38 === a || 40 === a) {
            var t = !1;
            if (
              b.container.parents(".swiper-slide").length > 0 &&
              0 === b.container.parents(".swiper-slide-active").length
            )
              return;
            var r = { left: window.pageXOffset, top: window.pageYOffset },
              i = window.innerWidth,
              s = window.innerHeight,
              n = b.container.offset();
            b.rtl && (n.left = n.left - b.container[0].scrollLeft);
            for (
              var o = [
                  [n.left, n.top],
                  [n.left + b.width, n.top],
                  [n.left, n.top + b.height],
                  [n.left + b.width, n.top + b.height]
                ],
                l = 0;
              l < o.length;
              l++
            ) {
              var p = o[l];
              p[0] >= r.left &&
                p[0] <= r.left + i &&
                p[1] >= r.top &&
                p[1] <= r.top + s &&
                (t = !0);
            }
            if (!t) return;
          }
          b.isHorizontal()
            ? ((37 === a || 39 === a) &&
                (e.preventDefault ? e.preventDefault() : (e.returnValue = !1)),
              ((39 === a && !b.rtl) || (37 === a && b.rtl)) && b.slideNext(),
              ((37 === a && !b.rtl) || (39 === a && b.rtl)) && b.slidePrev())
            : ((38 === a || 40 === a) &&
                (e.preventDefault ? e.preventDefault() : (e.returnValue = !1)),
              40 === a && b.slideNext(),
              38 === a && b.slidePrev());
        }
      }
      function d(e) {
        e.originalEvent && (e = e.originalEvent);
        var a = b.mousewheel.event,
          t = 0,
          r = b.rtl ? -1 : 1;
        if ("mousewheel" === a)
          if (b.params.mousewheelForceToAxis)
            if (b.isHorizontal()) {
              if (!(Math.abs(e.wheelDeltaX) > Math.abs(e.wheelDeltaY))) return;
              t = e.wheelDeltaX * r;
            } else {
              if (!(Math.abs(e.wheelDeltaY) > Math.abs(e.wheelDeltaX))) return;
              t = e.wheelDeltaY;
            }
          else
            t =
              Math.abs(e.wheelDeltaX) > Math.abs(e.wheelDeltaY)
                ? -e.wheelDeltaX * r
                : -e.wheelDeltaY;
        else if ("DOMMouseScroll" === a) t = -e.detail;
        else if ("wheel" === a)
          if (b.params.mousewheelForceToAxis)
            if (b.isHorizontal()) {
              if (!(Math.abs(e.deltaX) > Math.abs(e.deltaY))) return;
              t = -e.deltaX * r;
            } else {
              if (!(Math.abs(e.deltaY) > Math.abs(e.deltaX))) return;
              t = -e.deltaY;
            }
          else
            t =
              Math.abs(e.deltaX) > Math.abs(e.deltaY)
                ? -e.deltaX * r
                : -e.deltaY;
        if (0 !== t) {
          if ((b.params.mousewheelInvert && (t = -t), b.params.freeMode)) {
            var i =
                b.getWrapperTranslate() + t * b.params.mousewheelSensitivity,
              s = b.isBeginning,
              n = b.isEnd;
            if (
              (i >= b.minTranslate() && (i = b.minTranslate()),
              i <= b.maxTranslate() && (i = b.maxTranslate()),
              b.setWrapperTransition(0),
              b.setWrapperTranslate(i),
              b.updateProgress(),
              b.updateActiveIndex(),
              ((!s && b.isBeginning) || (!n && b.isEnd)) && b.updateClasses(),
              b.params.freeModeSticky
                ? (clearTimeout(b.mousewheel.timeout),
                  (b.mousewheel.timeout = setTimeout(function() {
                    b.slideReset();
                  }, 300)))
                : b.params.lazyLoading && b.lazy && b.lazy.load(),
              0 === i || i === b.maxTranslate())
            )
              return;
          } else {
            if (new window.Date().getTime() - b.mousewheel.lastScrollTime > 60)
              if (0 > t)
                if ((b.isEnd && !b.params.loop) || b.animating) {
                  if (b.params.mousewheelReleaseOnEdges) return !0;
                } else b.slideNext();
              else if ((b.isBeginning && !b.params.loop) || b.animating) {
                if (b.params.mousewheelReleaseOnEdges) return !0;
              } else b.slidePrev();
            b.mousewheel.lastScrollTime = new window.Date().getTime();
          }
          return (
            b.params.autoplay && b.stopAutoplay(),
            e.preventDefault ? e.preventDefault() : (e.returnValue = !1),
            !1
          );
        }
      }
      function u(e, t) {
        e = a(e);
        var r,
          i,
          s,
          n = b.rtl ? -1 : 1;
        (r = e.attr("data-swiper-parallax") || "0"),
          (i = e.attr("data-swiper-parallax-x")),
          (s = e.attr("data-swiper-parallax-y")),
          i || s
            ? ((i = i || "0"), (s = s || "0"))
            : b.isHorizontal()
            ? ((i = r), (s = "0"))
            : ((s = r), (i = "0")),
          (i =
            i.indexOf("%") >= 0
              ? parseInt(i, 10) * t * n + "%"
              : i * t * n + "px"),
          (s = s.indexOf("%") >= 0 ? parseInt(s, 10) * t + "%" : s * t + "px"),
          e.transform("translate3d(" + i + ", " + s + ",0px)");
      }
      function c(e) {
        return (
          0 !== e.indexOf("on") &&
            (e =
              e[0] !== e[0].toUpperCase()
                ? "on" + e[0].toUpperCase() + e.substring(1)
                : "on" + e),
          e
        );
      }
      if (!(this instanceof t)) return new t(e, i);
      var m = {
          direction: "horizontal",
          touchEventsTarget: "container",
          initialSlide: 0,
          speed: 300,
          autoplay: !1,
          autoplayDisableOnInteraction: !0,
          autoplayStopOnLast: !1,
          iOSEdgeSwipeDetection: !1,
          iOSEdgeSwipeThreshold: 20,
          freeMode: !1,
          freeModeMomentum: !0,
          freeModeMomentumRatio: 1,
          freeModeMomentumBounce: !0,
          freeModeMomentumBounceRatio: 1,
          freeModeSticky: !1,
          freeModeMinimumVelocity: 0.02,
          autoHeight: !1,
          setWrapperSize: !1,
          virtualTranslate: !1,
          effect: "slide",
          coverflow: {
            rotate: 50,
            stretch: 0,
            depth: 100,
            modifier: 1,
            slideShadows: !0
          },
          flip: { slideShadows: !0, limitRotation: !0 },
          cube: {
            slideShadows: !0,
            shadow: !0,
            shadowOffset: 20,
            shadowScale: 0.94
          },
          fade: { crossFade: !1 },
          parallax: !1,
          scrollbar: null,
          scrollbarHide: !0,
          scrollbarDraggable: !1,
          scrollbarSnapOnRelease: !1,
          keyboardControl: !1,
          mousewheelControl: !1,
          mousewheelReleaseOnEdges: !1,
          mousewheelInvert: !1,
          mousewheelForceToAxis: !1,
          mousewheelSensitivity: 1,
          hashnav: !1,
          breakpoints: void 0,
          spaceBetween: 0,
          slidesPerView: 1,
          slidesPerColumn: 1,
          slidesPerColumnFill: "column",
          slidesPerGroup: 1,
          centeredSlides: !1,
          slidesOffsetBefore: 0,
          slidesOffsetAfter: 0,
          roundLengths: !1,
          touchRatio: 1,
          touchAngle: 45,
          simulateTouch: !0,
          shortSwipes: !0,
          longSwipes: !0,
          longSwipesRatio: 0.5,
          longSwipesMs: 300,
          followFinger: !0,
          onlyExternal: !1,
          threshold: 0,
          touchMoveStopPropagation: !0,
          uniqueNavElements: !0,
          pagination: null,
          paginationElement: "span",
          paginationClickable: !1,
          paginationHide: !1,
          paginationBulletRender: null,
          paginationProgressRender: null,
          paginationFractionRender: null,
          paginationCustomRender: null,
          paginationType: "bullets",
          resistance: !0,
          resistanceRatio: 0.85,
          nextButton: null,
          prevButton: null,
          watchSlidesProgress: !1,
          watchSlidesVisibility: !1,
          grabCursor: !1,
          preventClicks: !0,
          preventClicksPropagation: !0,
          slideToClickedSlide: !1,
          lazyLoading: !1,
          lazyLoadingInPrevNext: !1,
          lazyLoadingInPrevNextAmount: 1,
          lazyLoadingOnTransitionStart: !1,
          preloadImages: !0,
          updateOnImagesReady: !0,
          loop: !1,
          loopAdditionalSlides: 0,
          loopedSlides: null,
          control: void 0,
          controlInverse: !1,
          controlBy: "slide",
          allowSwipeToPrev: !0,
          allowSwipeToNext: !0,
          swipeHandler: null,
          noSwiping: !0,
          noSwipingClass: "swiper-no-swiping",
          slideClass: "swiper-slide",
          slideActiveClass: "swiper-slide-active",
          slideVisibleClass: "swiper-slide-visible",
          slideDuplicateClass: "swiper-slide-duplicate",
          slideNextClass: "swiper-slide-next",
          slidePrevClass: "swiper-slide-prev",
          wrapperClass: "swiper-wrapper",
          bulletClass: "swiper-pagination-bullet",
          bulletActiveClass: "swiper-pagination-bullet-active",
          buttonDisabledClass: "swiper-button-disabled",
          paginationCurrentClass: "swiper-pagination-current",
          paginationTotalClass: "swiper-pagination-total",
          paginationHiddenClass: "swiper-pagination-hidden",
          paginationProgressbarClass: "swiper-pagination-progressbar",
          observer: !1,
          observeParents: !1,
          a11y: !1,
          prevSlideMessage: "Previous slide",
          nextSlideMessage: "Next slide",
          firstSlideMessage: "This is the first slide",
          lastSlideMessage: "This is the last slide",
          paginationBulletMessage: "Go to slide {{index}}",
          runCallbacksOnInit: !0
        },
        h = i && i.virtualTranslate;
      i = i || {};
      var f = {};
      for (var g in i)
        if (
          "object" != typeof i[g] ||
          null === i[g] ||
          i[g].nodeType ||
          i[g] === window ||
          i[g] === document ||
          ("undefined" != typeof r && i[g] instanceof r) ||
          ("undefined" != typeof jQuery && i[g] instanceof jQuery)
        )
          f[g] = i[g];
        else {
          f[g] = {};
          for (var v in i[g]) f[g][v] = i[g][v];
        }
      for (var w in m)
        if ("undefined" == typeof i[w]) i[w] = m[w];
        else if ("object" == typeof i[w])
          for (var y in m[w])
            "undefined" == typeof i[w][y] && (i[w][y] = m[w][y]);
      var b = this;
      if (
        ((b.params = i),
        (b.originalParams = f),
        (b.classNames = []),
        "undefined" != typeof a && "undefined" != typeof r && (a = r),
        ("undefined" != typeof a ||
          (a =
            "undefined" == typeof r
              ? window.Dom7 || window.Zepto || window.jQuery
              : r)) &&
          ((b.$ = a),
          (b.currentBreakpoint = void 0),
          (b.getActiveBreakpoint = function() {
            if (!b.params.breakpoints) return !1;
            var e,
              a = !1,
              t = [];
            for (e in b.params.breakpoints)
              b.params.breakpoints.hasOwnProperty(e) && t.push(e);
            t.sort(function(e, a) {
              return parseInt(e, 10) > parseInt(a, 10);
            });
            for (var r = 0; r < t.length; r++)
              (e = t[r]), e >= window.innerWidth && !a && (a = e);
            return a || "max";
          }),
          (b.setBreakpoint = function() {
            var e = b.getActiveBreakpoint();
            if (e && b.currentBreakpoint !== e) {
              var a =
                  e in b.params.breakpoints
                    ? b.params.breakpoints[e]
                    : b.originalParams,
                t = b.params.loop && a.slidesPerView !== b.params.slidesPerView;
              for (var r in a) b.params[r] = a[r];
              (b.currentBreakpoint = e), t && b.destroyLoop && b.reLoop(!0);
            }
          }),
          b.params.breakpoints && b.setBreakpoint(),
          (b.container = a(e)),
          0 !== b.container.length))
      ) {
        if (b.container.length > 1) {
          var x = [];
          return (
            b.container.each(function() {
              x.push(new t(this, i));
            }),
            x
          );
        }
        (b.container[0].swiper = b),
          b.container.data("swiper", b),
          b.classNames.push("swiper-container-" + b.params.direction),
          b.params.freeMode && b.classNames.push("swiper-container-free-mode"),
          b.support.flexbox ||
            (b.classNames.push("swiper-container-no-flexbox"),
            (b.params.slidesPerColumn = 1)),
          b.params.autoHeight &&
            b.classNames.push("swiper-container-autoheight"),
          (b.params.parallax || b.params.watchSlidesVisibility) &&
            (b.params.watchSlidesProgress = !0),
          ["cube", "coverflow", "flip"].indexOf(b.params.effect) >= 0 &&
            (b.support.transforms3d
              ? ((b.params.watchSlidesProgress = !0),
                b.classNames.push("swiper-container-3d"))
              : (b.params.effect = "slide")),
          "slide" !== b.params.effect &&
            b.classNames.push("swiper-container-" + b.params.effect),
          "cube" === b.params.effect &&
            ((b.params.resistanceRatio = 0),
            (b.params.slidesPerView = 1),
            (b.params.slidesPerColumn = 1),
            (b.params.slidesPerGroup = 1),
            (b.params.centeredSlides = !1),
            (b.params.spaceBetween = 0),
            (b.params.virtualTranslate = !0),
            (b.params.setWrapperSize = !1)),
          ("fade" === b.params.effect || "flip" === b.params.effect) &&
            ((b.params.slidesPerView = 1),
            (b.params.slidesPerColumn = 1),
            (b.params.slidesPerGroup = 1),
            (b.params.watchSlidesProgress = !0),
            (b.params.spaceBetween = 0),
            (b.params.setWrapperSize = !1),
            "undefined" == typeof h && (b.params.virtualTranslate = !0)),
          b.params.grabCursor && b.support.touch && (b.params.grabCursor = !1),
          (b.wrapper = b.container.children("." + b.params.wrapperClass)),
          b.params.pagination &&
            ((b.paginationContainer = a(b.params.pagination)),
            b.params.uniqueNavElements &&
              "string" == typeof b.params.pagination &&
              b.paginationContainer.length > 1 &&
              1 === b.container.find(b.params.pagination).length &&
              (b.paginationContainer = b.container.find(b.params.pagination)),
            "bullets" === b.params.paginationType &&
            b.params.paginationClickable
              ? b.paginationContainer.addClass("swiper-pagination-clickable")
              : (b.params.paginationClickable = !1),
            b.paginationContainer.addClass(
              "swiper-pagination-" + b.params.paginationType
            )),
          (b.params.nextButton || b.params.prevButton) &&
            (b.params.nextButton &&
              ((b.nextButton = a(b.params.nextButton)),
              b.params.uniqueNavElements &&
                "string" == typeof b.params.nextButton &&
                b.nextButton.length > 1 &&
                1 === b.container.find(b.params.nextButton).length &&
                (b.nextButton = b.container.find(b.params.nextButton))),
            b.params.prevButton &&
              ((b.prevButton = a(b.params.prevButton)),
              b.params.uniqueNavElements &&
                "string" == typeof b.params.prevButton &&
                b.prevButton.length > 1 &&
                1 === b.container.find(b.params.prevButton).length &&
                (b.prevButton = b.container.find(b.params.prevButton)))),
          (b.isHorizontal = function() {
            return "horizontal" === b.params.direction;
          }),
          (b.rtl =
            b.isHorizontal() &&
            ("rtl" === b.container[0].dir.toLowerCase() ||
              "rtl" === b.container.css("direction"))),
          b.rtl && b.classNames.push("swiper-container-rtl"),
          b.rtl && (b.wrongRTL = "-webkit-box" === b.wrapper.css("display")),
          b.params.slidesPerColumn > 1 &&
            b.classNames.push("swiper-container-multirow"),
          b.device.android && b.classNames.push("swiper-container-android"),
          b.container.addClass(b.classNames.join(" ")),
          (b.translate = 0),
          (b.progress = 0),
          (b.velocity = 0),
          (b.lockSwipeToNext = function() {
            b.params.allowSwipeToNext = !1;
          }),
          (b.lockSwipeToPrev = function() {
            b.params.allowSwipeToPrev = !1;
          }),
          (b.lockSwipes = function() {
            b.params.allowSwipeToNext = b.params.allowSwipeToPrev = !1;
          }),
          (b.unlockSwipeToNext = function() {
            b.params.allowSwipeToNext = !0;
          }),
          (b.unlockSwipeToPrev = function() {
            b.params.allowSwipeToPrev = !0;
          }),
          (b.unlockSwipes = function() {
            b.params.allowSwipeToNext = b.params.allowSwipeToPrev = !0;
          }),
          b.params.grabCursor &&
            ((b.container[0].style.cursor = "move"),
            (b.container[0].style.cursor = "-webkit-grab"),
            (b.container[0].style.cursor = "-moz-grab"),
            (b.container[0].style.cursor = "grab")),
          (b.imagesToLoad = []),
          (b.imagesLoaded = 0),
          (b.loadImage = function(e, a, t, r, i) {
            function s() {
              i && i();
            }
            var n;
            e.complete && r
              ? s()
              : a
              ? ((n = new window.Image()),
                (n.onload = s),
                (n.onerror = s),
                t && (n.srcset = t),
                a && (n.src = a))
              : s();
          }),
          (b.preloadImages = function() {
            function e() {
              "undefined" != typeof b &&
                null !== b &&
                (void 0 !== b.imagesLoaded && b.imagesLoaded++,
                b.imagesLoaded === b.imagesToLoad.length &&
                  (b.params.updateOnImagesReady && b.update(),
                  b.emit("onImagesReady", b)));
            }
            b.imagesToLoad = b.container.find("img");
            for (var a = 0; a < b.imagesToLoad.length; a++)
              b.loadImage(
                b.imagesToLoad[a],
                b.imagesToLoad[a].currentSrc ||
                  b.imagesToLoad[a].getAttribute("src"),
                b.imagesToLoad[a].srcset ||
                  b.imagesToLoad[a].getAttribute("srcset"),
                !0,
                e
              );
          }),
          (b.autoplayTimeoutId = void 0),
          (b.autoplaying = !1),
          (b.autoplayPaused = !1),
          (b.startAutoplay = function() {
            return "undefined" != typeof b.autoplayTimeoutId
              ? !1
              : b.params.autoplay
              ? b.autoplaying
                ? !1
                : ((b.autoplaying = !0), b.emit("onAutoplayStart", b), void n())
              : !1;
          }),
          (b.stopAutoplay = function(e) {
            b.autoplayTimeoutId &&
              (b.autoplayTimeoutId && clearTimeout(b.autoplayTimeoutId),
              (b.autoplaying = !1),
              (b.autoplayTimeoutId = void 0),
              b.emit("onAutoplayStop", b));
          }),
          (b.pauseAutoplay = function(e) {
            b.autoplayPaused ||
              (b.autoplayTimeoutId && clearTimeout(b.autoplayTimeoutId),
              (b.autoplayPaused = !0),
              0 === e
                ? ((b.autoplayPaused = !1), n())
                : b.wrapper.transitionEnd(function() {
                    b &&
                      ((b.autoplayPaused = !1),
                      b.autoplaying ? n() : b.stopAutoplay());
                  }));
          }),
          (b.minTranslate = function() {
            return -b.snapGrid[0];
          }),
          (b.maxTranslate = function() {
            return -b.snapGrid[b.snapGrid.length - 1];
          }),
          (b.updateAutoHeight = function() {
            var e = b.slides.eq(b.activeIndex)[0];
            if ("undefined" != typeof e) {
              var a = e.offsetHeight;
              a && b.wrapper.css("height", a + "px");
            }
          }),
          (b.updateContainerSize = function() {
            var e, a;
            (e =
              "undefined" != typeof b.params.width
                ? b.params.width
                : b.container[0].clientWidth),
              (a =
                "undefined" != typeof b.params.height
                  ? b.params.height
                  : b.container[0].clientHeight),
              (0 === e && b.isHorizontal()) ||
                (0 === a && !b.isHorizontal()) ||
                ((e =
                  e -
                  parseInt(b.container.css("padding-left"), 10) -
                  parseInt(b.container.css("padding-right"), 10)),
                (a =
                  a -
                  parseInt(b.container.css("padding-top"), 10) -
                  parseInt(b.container.css("padding-bottom"), 10)),
                (b.width = e),
                (b.height = a),
                (b.size = b.isHorizontal() ? b.width : b.height));
          }),
          (b.updateSlidesSize = function() {
            (b.slides = b.wrapper.children("." + b.params.slideClass)),
              (b.snapGrid = []),
              (b.slidesGrid = []),
              (b.slidesSizesGrid = []);
            var e,
              a = b.params.spaceBetween,
              t = -b.params.slidesOffsetBefore,
              r = 0,
              i = 0;
            if ("undefined" != typeof b.size) {
              "string" == typeof a &&
                a.indexOf("%") >= 0 &&
                (a = (parseFloat(a.replace("%", "")) / 100) * b.size),
                (b.virtualSize = -a),
                b.rtl
                  ? b.slides.css({ marginLeft: "", marginTop: "" })
                  : b.slides.css({ marginRight: "", marginBottom: "" });
              var n;
              b.params.slidesPerColumn > 1 &&
                ((n =
                  Math.floor(b.slides.length / b.params.slidesPerColumn) ===
                  b.slides.length / b.params.slidesPerColumn
                    ? b.slides.length
                    : Math.ceil(b.slides.length / b.params.slidesPerColumn) *
                      b.params.slidesPerColumn),
                "auto" !== b.params.slidesPerView &&
                  "row" === b.params.slidesPerColumnFill &&
                  (n = Math.max(
                    n,
                    b.params.slidesPerView * b.params.slidesPerColumn
                  )));
              var o,
                l = b.params.slidesPerColumn,
                p = n / l,
                d = p - (b.params.slidesPerColumn * p - b.slides.length);
              for (e = 0; e < b.slides.length; e++) {
                o = 0;
                var u = b.slides.eq(e);
                if (b.params.slidesPerColumn > 1) {
                  var c, m, h;
                  "column" === b.params.slidesPerColumnFill
                    ? ((m = Math.floor(e / l)),
                      (h = e - m * l),
                      (m > d || (m === d && h === l - 1)) &&
                        ++h >= l &&
                        ((h = 0), m++),
                      (c = m + (h * n) / l),
                      u.css({
                        "-webkit-box-ordinal-group": c,
                        "-moz-box-ordinal-group": c,
                        "-ms-flex-order": c,
                        "-webkit-order": c,
                        order: c
                      }))
                    : ((h = Math.floor(e / p)), (m = e - h * p)),
                    u
                      .css({
                        "margin-top":
                          0 !== h &&
                          b.params.spaceBetween &&
                          b.params.spaceBetween + "px"
                      })
                      .attr("data-swiper-column", m)
                      .attr("data-swiper-row", h);
                }
                "none" !== u.css("display") &&
                  ("auto" === b.params.slidesPerView
                    ? ((o = b.isHorizontal()
                        ? u.outerWidth(!0)
                        : u.outerHeight(!0)),
                      b.params.roundLengths && (o = s(o)))
                    : ((o =
                        (b.size - (b.params.slidesPerView - 1) * a) /
                        b.params.slidesPerView),
                      b.params.roundLengths && (o = s(o)),
                      b.isHorizontal()
                        ? (b.slides[e].style.width = o + "px")
                        : (b.slides[e].style.height = o + "px")),
                  (b.slides[e].swiperSlideSize = o),
                  b.slidesSizesGrid.push(o),
                  b.params.centeredSlides
                    ? ((t = t + o / 2 + r / 2 + a),
                      0 === e && (t = t - b.size / 2 - a),
                      Math.abs(t) < 0.001 && (t = 0),
                      i % b.params.slidesPerGroup === 0 && b.snapGrid.push(t),
                      b.slidesGrid.push(t))
                    : (i % b.params.slidesPerGroup === 0 && b.snapGrid.push(t),
                      b.slidesGrid.push(t),
                      (t = t + o + a)),
                  (b.virtualSize += o + a),
                  (r = o),
                  i++);
              }
              b.virtualSize =
                Math.max(b.virtualSize, b.size) + b.params.slidesOffsetAfter;
              var f;
              if (
                (b.rtl &&
                  b.wrongRTL &&
                  ("slide" === b.params.effect ||
                    "coverflow" === b.params.effect) &&
                  b.wrapper.css({
                    width: b.virtualSize + b.params.spaceBetween + "px"
                  }),
                (!b.support.flexbox || b.params.setWrapperSize) &&
                  (b.isHorizontal()
                    ? b.wrapper.css({
                        width: b.virtualSize + b.params.spaceBetween + "px"
                      })
                    : b.wrapper.css({
                        height: b.virtualSize + b.params.spaceBetween + "px"
                      })),
                b.params.slidesPerColumn > 1 &&
                  ((b.virtualSize = (o + b.params.spaceBetween) * n),
                  (b.virtualSize =
                    Math.ceil(b.virtualSize / b.params.slidesPerColumn) -
                    b.params.spaceBetween),
                  b.wrapper.css({
                    width: b.virtualSize + b.params.spaceBetween + "px"
                  }),
                  b.params.centeredSlides))
              ) {
                for (f = [], e = 0; e < b.snapGrid.length; e++)
                  b.snapGrid[e] < b.virtualSize + b.snapGrid[0] &&
                    f.push(b.snapGrid[e]);
                b.snapGrid = f;
              }
              if (!b.params.centeredSlides) {
                for (f = [], e = 0; e < b.snapGrid.length; e++)
                  b.snapGrid[e] <= b.virtualSize - b.size &&
                    f.push(b.snapGrid[e]);
                (b.snapGrid = f),
                  Math.floor(b.virtualSize - b.size) -
                    Math.floor(b.snapGrid[b.snapGrid.length - 1]) >
                    1 && b.snapGrid.push(b.virtualSize - b.size);
              }
              0 === b.snapGrid.length && (b.snapGrid = [0]),
                0 !== b.params.spaceBetween &&
                  (b.isHorizontal()
                    ? b.rtl
                      ? b.slides.css({ marginLeft: a + "px" })
                      : b.slides.css({ marginRight: a + "px" })
                    : b.slides.css({ marginBottom: a + "px" })),
                b.params.watchSlidesProgress && b.updateSlidesOffset();
            }
          }),
          (b.updateSlidesOffset = function() {
            for (var e = 0; e < b.slides.length; e++)
              b.slides[e].swiperSlideOffset = b.isHorizontal()
                ? b.slides[e].offsetLeft
                : b.slides[e].offsetTop;
          }),
          (b.updateSlidesProgress = function(e) {
            if (
              ("undefined" == typeof e && (e = b.translate || 0),
              0 !== b.slides.length)
            ) {
              "undefined" == typeof b.slides[0].swiperSlideOffset &&
                b.updateSlidesOffset();
              var a = -e;
              b.rtl && (a = e),
                b.slides.removeClass(b.params.slideVisibleClass);
              for (var t = 0; t < b.slides.length; t++) {
                var r = b.slides[t],
                  i =
                    (a - r.swiperSlideOffset) /
                    (r.swiperSlideSize + b.params.spaceBetween);
                if (b.params.watchSlidesVisibility) {
                  var s = -(a - r.swiperSlideOffset),
                    n = s + b.slidesSizesGrid[t],
                    o =
                      (s >= 0 && s < b.size) ||
                      (n > 0 && n <= b.size) ||
                      (0 >= s && n >= b.size);
                  o && b.slides.eq(t).addClass(b.params.slideVisibleClass);
                }
                r.progress = b.rtl ? -i : i;
              }
            }
          }),
          (b.updateProgress = function(e) {
            "undefined" == typeof e && (e = b.translate || 0);
            var a = b.maxTranslate() - b.minTranslate(),
              t = b.isBeginning,
              r = b.isEnd;
            0 === a
              ? ((b.progress = 0), (b.isBeginning = b.isEnd = !0))
              : ((b.progress = (e - b.minTranslate()) / a),
                (b.isBeginning = b.progress <= 0),
                (b.isEnd = b.progress >= 1)),
              b.isBeginning && !t && b.emit("onReachBeginning", b),
              b.isEnd && !r && b.emit("onReachEnd", b),
              b.params.watchSlidesProgress && b.updateSlidesProgress(e),
              b.emit("onProgress", b, b.progress);
          }),
          (b.updateActiveIndex = function() {
            var e,
              a,
              t,
              r = b.rtl ? b.translate : -b.translate;
            for (a = 0; a < b.slidesGrid.length; a++)
              "undefined" != typeof b.slidesGrid[a + 1]
                ? r >= b.slidesGrid[a] &&
                  r <
                    b.slidesGrid[a + 1] -
                      (b.slidesGrid[a + 1] - b.slidesGrid[a]) / 2
                  ? (e = a)
                  : r >= b.slidesGrid[a] &&
                    r < b.slidesGrid[a + 1] &&
                    (e = a + 1)
                : r >= b.slidesGrid[a] && (e = a);
            (0 > e || "undefined" == typeof e) && (e = 0),
              (t = Math.floor(e / b.params.slidesPerGroup)),
              t >= b.snapGrid.length && (t = b.snapGrid.length - 1),
              e !== b.activeIndex &&
                ((b.snapIndex = t),
                (b.previousIndex = b.activeIndex),
                (b.activeIndex = e),
                b.updateClasses());
          }),
          (b.updateClasses = function() {
            b.slides.removeClass(
              b.params.slideActiveClass +
                " " +
                b.params.slideNextClass +
                " " +
                b.params.slidePrevClass
            );
            var e = b.slides.eq(b.activeIndex);
            e.addClass(b.params.slideActiveClass);
            var t = e
              .next("." + b.params.slideClass)
              .addClass(b.params.slideNextClass);
            b.params.loop &&
              0 === t.length &&
              b.slides.eq(0).addClass(b.params.slideNextClass);
            var r = e
              .prev("." + b.params.slideClass)
              .addClass(b.params.slidePrevClass);
            if (
              (b.params.loop &&
                0 === r.length &&
                b.slides.eq(-1).addClass(b.params.slidePrevClass),
              b.paginationContainer && b.paginationContainer.length > 0)
            ) {
              var i,
                s = b.params.loop
                  ? Math.ceil(
                      (b.slides.length - 2 * b.loopedSlides) /
                        b.params.slidesPerGroup
                    )
                  : b.snapGrid.length;
              if (
                (b.params.loop
                  ? ((i = Math.ceil(
                      (b.activeIndex - b.loopedSlides) / b.params.slidesPerGroup
                    )),
                    i > b.slides.length - 1 - 2 * b.loopedSlides &&
                      (i -= b.slides.length - 2 * b.loopedSlides),
                    i > s - 1 && (i -= s),
                    0 > i &&
                      "bullets" !== b.params.paginationType &&
                      (i = s + i))
                  : (i =
                      "undefined" != typeof b.snapIndex
                        ? b.snapIndex
                        : b.activeIndex || 0),
                "bullets" === b.params.paginationType &&
                  b.bullets &&
                  b.bullets.length > 0 &&
                  (b.bullets.removeClass(b.params.bulletActiveClass),
                  b.paginationContainer.length > 1
                    ? b.bullets.each(function() {
                        a(this).index() === i &&
                          a(this).addClass(b.params.bulletActiveClass);
                      })
                    : b.bullets.eq(i).addClass(b.params.bulletActiveClass)),
                "fraction" === b.params.paginationType &&
                  (b.paginationContainer
                    .find("." + b.params.paginationCurrentClass)
                    .text(i + 1),
                  b.paginationContainer
                    .find("." + b.params.paginationTotalClass)
                    .text(s)),
                "progress" === b.params.paginationType)
              ) {
                var n = (i + 1) / s,
                  o = n,
                  l = 1;
                b.isHorizontal() || ((l = n), (o = 1)),
                  b.paginationContainer
                    .find("." + b.params.paginationProgressbarClass)
                    .transform(
                      "translate3d(0,0,0) scaleX(" + o + ") scaleY(" + l + ")"
                    )
                    .transition(b.params.speed);
              }
              "custom" === b.params.paginationType &&
                b.params.paginationCustomRender &&
                (b.paginationContainer.html(
                  b.params.paginationCustomRender(b, i + 1, s)
                ),
                b.emit("onPaginationRendered", b, b.paginationContainer[0]));
            }
            b.params.loop ||
              (b.params.prevButton &&
                b.prevButton &&
                b.prevButton.length > 0 &&
                (b.isBeginning
                  ? (b.prevButton.addClass(b.params.buttonDisabledClass),
                    b.params.a11y && b.a11y && b.a11y.disable(b.prevButton))
                  : (b.prevButton.removeClass(b.params.buttonDisabledClass),
                    b.params.a11y && b.a11y && b.a11y.enable(b.prevButton))),
              b.params.nextButton &&
                b.nextButton &&
                b.nextButton.length > 0 &&
                (b.isEnd
                  ? (b.nextButton.addClass(b.params.buttonDisabledClass),
                    b.params.a11y && b.a11y && b.a11y.disable(b.nextButton))
                  : (b.nextButton.removeClass(b.params.buttonDisabledClass),
                    b.params.a11y && b.a11y && b.a11y.enable(b.nextButton))));
          }),
          (b.updatePagination = function() {
            if (
              b.params.pagination &&
              b.paginationContainer &&
              b.paginationContainer.length > 0
            ) {
              var e = "";
              if ("bullets" === b.params.paginationType) {
                for (
                  var a = b.params.loop
                      ? Math.ceil(
                          (b.slides.length - 2 * b.loopedSlides) /
                            b.params.slidesPerGroup
                        )
                      : b.snapGrid.length,
                    t = 0;
                  a > t;
                  t++
                )
                  e += b.params.paginationBulletRender
                    ? b.params.paginationBulletRender(t, b.params.bulletClass)
                    : "<" +
                      b.params.paginationElement +
                      ' class="' +
                      b.params.bulletClass +
                      '"></' +
                      b.params.paginationElement +
                      ">";
                b.paginationContainer.html(e),
                  (b.bullets = b.paginationContainer.find(
                    "." + b.params.bulletClass
                  )),
                  b.params.paginationClickable &&
                    b.params.a11y &&
                    b.a11y &&
                    b.a11y.initPagination();
              }
              "fraction" === b.params.paginationType &&
                ((e = b.params.paginationFractionRender
                  ? b.params.paginationFractionRender(
                      b,
                      b.params.paginationCurrentClass,
                      b.params.paginationTotalClass
                    )
                  : '<span class="' +
                    b.params.paginationCurrentClass +
                    '"></span> / <span class="' +
                    b.params.paginationTotalClass +
                    '"></span>'),
                b.paginationContainer.html(e)),
                "progress" === b.params.paginationType &&
                  ((e = b.params.paginationProgressRender
                    ? b.params.paginationProgressRender(
                        b,
                        b.params.paginationProgressbarClass
                      )
                    : '<span class="' +
                      b.params.paginationProgressbarClass +
                      '"></span>'),
                  b.paginationContainer.html(e)),
                "custom" !== b.params.paginationType &&
                  b.emit("onPaginationRendered", b, b.paginationContainer[0]);
            }
          }),
          (b.update = function(e) {
            function a() {
              (r = Math.min(
                Math.max(b.translate, b.maxTranslate()),
                b.minTranslate()
              )),
                b.setWrapperTranslate(r),
                b.updateActiveIndex(),
                b.updateClasses();
            }
            if (
              (b.updateContainerSize(),
              b.updateSlidesSize(),
              b.updateProgress(),
              b.updatePagination(),
              b.updateClasses(),
              b.params.scrollbar && b.scrollbar && b.scrollbar.set(),
              e)
            ) {
              var t, r;
              b.controller &&
                b.controller.spline &&
                (b.controller.spline = void 0),
                b.params.freeMode
                  ? (a(), b.params.autoHeight && b.updateAutoHeight())
                  : ((t =
                      ("auto" === b.params.slidesPerView ||
                        b.params.slidesPerView > 1) &&
                      b.isEnd &&
                      !b.params.centeredSlides
                        ? b.slideTo(b.slides.length - 1, 0, !1, !0)
                        : b.slideTo(b.activeIndex, 0, !1, !0)),
                    t || a());
            } else b.params.autoHeight && b.updateAutoHeight();
          }),
          (b.onResize = function(e) {
            b.params.breakpoints && b.setBreakpoint();
            var a = b.params.allowSwipeToPrev,
              t = b.params.allowSwipeToNext;
            (b.params.allowSwipeToPrev = b.params.allowSwipeToNext = !0),
              b.updateContainerSize(),
              b.updateSlidesSize(),
              ("auto" === b.params.slidesPerView || b.params.freeMode || e) &&
                b.updatePagination(),
              b.params.scrollbar && b.scrollbar && b.scrollbar.set(),
              b.controller &&
                b.controller.spline &&
                (b.controller.spline = void 0);
            var r = !1;
            if (b.params.freeMode) {
              var i = Math.min(
                Math.max(b.translate, b.maxTranslate()),
                b.minTranslate()
              );
              b.setWrapperTranslate(i),
                b.updateActiveIndex(),
                b.updateClasses(),
                b.params.autoHeight && b.updateAutoHeight();
            } else
              b.updateClasses(),
                (r =
                  ("auto" === b.params.slidesPerView ||
                    b.params.slidesPerView > 1) &&
                  b.isEnd &&
                  !b.params.centeredSlides
                    ? b.slideTo(b.slides.length - 1, 0, !1, !0)
                    : b.slideTo(b.activeIndex, 0, !1, !0));
            b.params.lazyLoading && !r && b.lazy && b.lazy.load(),
              (b.params.allowSwipeToPrev = a),
              (b.params.allowSwipeToNext = t);
          });
        var T = ["mousedown", "mousemove", "mouseup"];
        window.navigator.pointerEnabled
          ? (T = ["pointerdown", "pointermove", "pointerup"])
          : window.navigator.msPointerEnabled &&
            (T = ["MSPointerDown", "MSPointerMove", "MSPointerUp"]),
          (b.touchEvents = {
            start:
              b.support.touch || !b.params.simulateTouch ? "touchstart" : T[0],
            move:
              b.support.touch || !b.params.simulateTouch ? "touchmove" : T[1],
            end: b.support.touch || !b.params.simulateTouch ? "touchend" : T[2]
          }),
          (window.navigator.pointerEnabled ||
            window.navigator.msPointerEnabled) &&
            ("container" === b.params.touchEventsTarget
              ? b.container
              : b.wrapper
            ).addClass("swiper-wp8-" + b.params.direction),
          (b.initEvents = function(e) {
            var a = e ? "off" : "on",
              t = e ? "removeEventListener" : "addEventListener",
              r =
                "container" === b.params.touchEventsTarget
                  ? b.container[0]
                  : b.wrapper[0],
              s = b.support.touch ? r : document,
              n = b.params.nested ? !0 : !1;
            b.browser.ie
              ? (r[t](b.touchEvents.start, b.onTouchStart, !1),
                s[t](b.touchEvents.move, b.onTouchMove, n),
                s[t](b.touchEvents.end, b.onTouchEnd, !1))
              : (b.support.touch &&
                  (r[t](b.touchEvents.start, b.onTouchStart, !1),
                  r[t](b.touchEvents.move, b.onTouchMove, n),
                  r[t](b.touchEvents.end, b.onTouchEnd, !1)),
                !i.simulateTouch ||
                  b.device.ios ||
                  b.device.android ||
                  (r[t]("mousedown", b.onTouchStart, !1),
                  document[t]("mousemove", b.onTouchMove, n),
                  document[t]("mouseup", b.onTouchEnd, !1))),
              window[t]("resize", b.onResize),
              b.params.nextButton &&
                b.nextButton &&
                b.nextButton.length > 0 &&
                (b.nextButton[a]("click", b.onClickNext),
                b.params.a11y &&
                  b.a11y &&
                  b.nextButton[a]("keydown", b.a11y.onEnterKey)),
              b.params.prevButton &&
                b.prevButton &&
                b.prevButton.length > 0 &&
                (b.prevButton[a]("click", b.onClickPrev),
                b.params.a11y &&
                  b.a11y &&
                  b.prevButton[a]("keydown", b.a11y.onEnterKey)),
              b.params.pagination &&
                b.params.paginationClickable &&
                (b.paginationContainer[a](
                  "click",
                  "." + b.params.bulletClass,
                  b.onClickIndex
                ),
                b.params.a11y &&
                  b.a11y &&
                  b.paginationContainer[a](
                    "keydown",
                    "." + b.params.bulletClass,
                    b.a11y.onEnterKey
                  )),
              (b.params.preventClicks || b.params.preventClicksPropagation) &&
                r[t]("click", b.preventClicks, !0);
          }),
          (b.attachEvents = function() {
            b.initEvents();
          }),
          (b.detachEvents = function() {
            b.initEvents(!0);
          }),
          (b.allowClick = !0),
          (b.preventClicks = function(e) {
            b.allowClick ||
              (b.params.preventClicks && e.preventDefault(),
              b.params.preventClicksPropagation &&
                b.animating &&
                (e.stopPropagation(), e.stopImmediatePropagation()));
          }),
          (b.onClickNext = function(e) {
            e.preventDefault(), (!b.isEnd || b.params.loop) && b.slideNext();
          }),
          (b.onClickPrev = function(e) {
            e.preventDefault(),
              (!b.isBeginning || b.params.loop) && b.slidePrev();
          }),
          (b.onClickIndex = function(e) {
            e.preventDefault();
            var t = a(this).index() * b.params.slidesPerGroup;
            b.params.loop && (t += b.loopedSlides), b.slideTo(t);
          }),
          (b.updateClickedSlide = function(e) {
            var t = o(e, "." + b.params.slideClass),
              r = !1;
            if (t)
              for (var i = 0; i < b.slides.length; i++)
                b.slides[i] === t && (r = !0);
            if (!t || !r)
              return (b.clickedSlide = void 0), void (b.clickedIndex = void 0);
            if (
              ((b.clickedSlide = t),
              (b.clickedIndex = a(t).index()),
              b.params.slideToClickedSlide &&
                void 0 !== b.clickedIndex &&
                b.clickedIndex !== b.activeIndex)
            ) {
              var s,
                n = b.clickedIndex;
              if (b.params.loop) {
                if (b.animating) return;
                (s = a(b.clickedSlide).attr("data-swiper-slide-index")),
                  b.params.centeredSlides
                    ? n < b.loopedSlides - b.params.slidesPerView / 2 ||
                      n >
                        b.slides.length -
                          b.loopedSlides +
                          b.params.slidesPerView / 2
                      ? (b.fixLoop(),
                        (n = b.wrapper
                          .children(
                            "." +
                              b.params.slideClass +
                              '[data-swiper-slide-index="' +
                              s +
                              '"]:not(.swiper-slide-duplicate)'
                          )
                          .eq(0)
                          .index()),
                        setTimeout(function() {
                          b.slideTo(n);
                        }, 0))
                      : b.slideTo(n)
                    : n > b.slides.length - b.params.slidesPerView
                    ? (b.fixLoop(),
                      (n = b.wrapper
                        .children(
                          "." +
                            b.params.slideClass +
                            '[data-swiper-slide-index="' +
                            s +
                            '"]:not(.swiper-slide-duplicate)'
                        )
                        .eq(0)
                        .index()),
                      setTimeout(function() {
                        b.slideTo(n);
                      }, 0))
                    : b.slideTo(n);
              } else b.slideTo(n);
            }
          });
        var S,
          C,
          z,
          M,
          E,
          P,
          k,
          I,
          L,
          B,
          D = "input, select, textarea, button",
          H = Date.now(),
          A = [];
        (b.animating = !1),
          (b.touches = {
            startX: 0,
            startY: 0,
            currentX: 0,
            currentY: 0,
            diff: 0
          });
        var G, O;
        if (
          ((b.onTouchStart = function(e) {
            if (
              (e.originalEvent && (e = e.originalEvent),
              (G = "touchstart" === e.type),
              G || !("which" in e) || 3 !== e.which)
            ) {
              if (b.params.noSwiping && o(e, "." + b.params.noSwipingClass))
                return void (b.allowClick = !0);
              if (!b.params.swipeHandler || o(e, b.params.swipeHandler)) {
                var t = (b.touches.currentX =
                    "touchstart" === e.type
                      ? e.targetTouches[0].pageX
                      : e.pageX),
                  r = (b.touches.currentY =
                    "touchstart" === e.type
                      ? e.targetTouches[0].pageY
                      : e.pageY);
                if (
                  !(
                    b.device.ios &&
                    b.params.iOSEdgeSwipeDetection &&
                    t <= b.params.iOSEdgeSwipeThreshold
                  )
                ) {
                  if (
                    ((S = !0),
                    (C = !1),
                    (z = !0),
                    (E = void 0),
                    (O = void 0),
                    (b.touches.startX = t),
                    (b.touches.startY = r),
                    (M = Date.now()),
                    (b.allowClick = !0),
                    b.updateContainerSize(),
                    (b.swipeDirection = void 0),
                    b.params.threshold > 0 && (I = !1),
                    "touchstart" !== e.type)
                  ) {
                    var i = !0;
                    a(e.target).is(D) && (i = !1),
                      document.activeElement &&
                        a(document.activeElement).is(D) &&
                        document.activeElement.blur(),
                      i && e.preventDefault();
                  }
                  b.emit("onTouchStart", b, e);
                }
              }
            }
          }),
          (b.onTouchMove = function(e) {
            if (
              (e.originalEvent && (e = e.originalEvent),
              !G || "mousemove" !== e.type)
            ) {
              if (e.preventedByNestedSwiper)
                return (
                  (b.touches.startX =
                    "touchmove" === e.type
                      ? e.targetTouches[0].pageX
                      : e.pageX),
                  void (b.touches.startY =
                    "touchmove" === e.type ? e.targetTouches[0].pageY : e.pageY)
                );
              if (b.params.onlyExternal)
                return (
                  (b.allowClick = !1),
                  void (
                    S &&
                    ((b.touches.startX = b.touches.currentX =
                      "touchmove" === e.type
                        ? e.targetTouches[0].pageX
                        : e.pageX),
                    (b.touches.startY = b.touches.currentY =
                      "touchmove" === e.type
                        ? e.targetTouches[0].pageY
                        : e.pageY),
                    (M = Date.now()))
                  )
                );
              if (
                G &&
                document.activeElement &&
                e.target === document.activeElement &&
                a(e.target).is(D)
              )
                return (C = !0), void (b.allowClick = !1);
              if (
                (z && b.emit("onTouchMove", b, e),
                !(e.targetTouches && e.targetTouches.length > 1))
              ) {
                if (
                  ((b.touches.currentX =
                    "touchmove" === e.type
                      ? e.targetTouches[0].pageX
                      : e.pageX),
                  (b.touches.currentY =
                    "touchmove" === e.type
                      ? e.targetTouches[0].pageY
                      : e.pageY),
                  "undefined" == typeof E)
                ) {
                  var t =
                    (180 *
                      Math.atan2(
                        Math.abs(b.touches.currentY - b.touches.startY),
                        Math.abs(b.touches.currentX - b.touches.startX)
                      )) /
                    Math.PI;
                  E = b.isHorizontal()
                    ? t > b.params.touchAngle
                    : 90 - t > b.params.touchAngle;
                }
                if (
                  (E && b.emit("onTouchMoveOpposite", b, e),
                  "undefined" == typeof O &&
                    b.browser.ieTouch &&
                    (b.touches.currentX !== b.touches.startX ||
                      b.touches.currentY !== b.touches.startY) &&
                    (O = !0),
                  S)
                ) {
                  if (E) return void (S = !1);
                  if (O || !b.browser.ieTouch) {
                    (b.allowClick = !1),
                      b.emit("onSliderMove", b, e),
                      e.preventDefault(),
                      b.params.touchMoveStopPropagation &&
                        !b.params.nested &&
                        e.stopPropagation(),
                      C ||
                        (i.loop && b.fixLoop(),
                        (k = b.getWrapperTranslate()),
                        b.setWrapperTransition(0),
                        b.animating &&
                          b.wrapper.trigger(
                            "webkitTransitionEnd transitionend oTransitionEnd MSTransitionEnd msTransitionEnd"
                          ),
                        b.params.autoplay &&
                          b.autoplaying &&
                          (b.params.autoplayDisableOnInteraction
                            ? b.stopAutoplay()
                            : b.pauseAutoplay()),
                        (B = !1),
                        b.params.grabCursor &&
                          ((b.container[0].style.cursor = "move"),
                          (b.container[0].style.cursor = "-webkit-grabbing"),
                          (b.container[0].style.cursor = "-moz-grabbin"),
                          (b.container[0].style.cursor = "grabbing"))),
                      (C = !0);
                    var r = (b.touches.diff = b.isHorizontal()
                      ? b.touches.currentX - b.touches.startX
                      : b.touches.currentY - b.touches.startY);
                    (r *= b.params.touchRatio),
                      b.rtl && (r = -r),
                      (b.swipeDirection = r > 0 ? "prev" : "next"),
                      (P = r + k);
                    var s = !0;
                    if (
                      (r > 0 && P > b.minTranslate()
                        ? ((s = !1),
                          b.params.resistance &&
                            (P =
                              b.minTranslate() -
                              1 +
                              Math.pow(
                                -b.minTranslate() + k + r,
                                b.params.resistanceRatio
                              )))
                        : 0 > r &&
                          P < b.maxTranslate() &&
                          ((s = !1),
                          b.params.resistance &&
                            (P =
                              b.maxTranslate() +
                              1 -
                              Math.pow(
                                b.maxTranslate() - k - r,
                                b.params.resistanceRatio
                              ))),
                      s && (e.preventedByNestedSwiper = !0),
                      !b.params.allowSwipeToNext &&
                        "next" === b.swipeDirection &&
                        k > P &&
                        (P = k),
                      !b.params.allowSwipeToPrev &&
                        "prev" === b.swipeDirection &&
                        P > k &&
                        (P = k),
                      b.params.followFinger)
                    ) {
                      if (b.params.threshold > 0) {
                        if (!(Math.abs(r) > b.params.threshold || I))
                          return void (P = k);
                        if (!I)
                          return (
                            (I = !0),
                            (b.touches.startX = b.touches.currentX),
                            (b.touches.startY = b.touches.currentY),
                            (P = k),
                            void (b.touches.diff = b.isHorizontal()
                              ? b.touches.currentX - b.touches.startX
                              : b.touches.currentY - b.touches.startY)
                          );
                      }
                      (b.params.freeMode || b.params.watchSlidesProgress) &&
                        b.updateActiveIndex(),
                        b.params.freeMode &&
                          (0 === A.length &&
                            A.push({
                              position:
                                b.touches[
                                  b.isHorizontal() ? "startX" : "startY"
                                ],
                              time: M
                            }),
                          A.push({
                            position:
                              b.touches[
                                b.isHorizontal() ? "currentX" : "currentY"
                              ],
                            time: new window.Date().getTime()
                          })),
                        b.updateProgress(P),
                        b.setWrapperTranslate(P);
                    }
                  }
                }
              }
            }
          }),
          (b.onTouchEnd = function(e) {
            if (
              (e.originalEvent && (e = e.originalEvent),
              z && b.emit("onTouchEnd", b, e),
              (z = !1),
              S)
            ) {
              b.params.grabCursor &&
                C &&
                S &&
                ((b.container[0].style.cursor = "move"),
                (b.container[0].style.cursor = "-webkit-grab"),
                (b.container[0].style.cursor = "-moz-grab"),
                (b.container[0].style.cursor = "grab"));
              var t = Date.now(),
                r = t - M;
              if (
                (b.allowClick &&
                  (b.updateClickedSlide(e),
                  b.emit("onTap", b, e),
                  300 > r &&
                    t - H > 300 &&
                    (L && clearTimeout(L),
                    (L = setTimeout(function() {
                      b &&
                        (b.params.paginationHide &&
                          b.paginationContainer.length > 0 &&
                          !a(e.target).hasClass(b.params.bulletClass) &&
                          b.paginationContainer.toggleClass(
                            b.params.paginationHiddenClass
                          ),
                        b.emit("onClick", b, e));
                    }, 300))),
                  300 > r &&
                    300 > t - H &&
                    (L && clearTimeout(L), b.emit("onDoubleTap", b, e))),
                (H = Date.now()),
                setTimeout(function() {
                  b && (b.allowClick = !0);
                }, 0),
                !S ||
                  !C ||
                  !b.swipeDirection ||
                  0 === b.touches.diff ||
                  P === k)
              )
                return void (S = C = !1);
              S = C = !1;
              var i;
              if (
                ((i = b.params.followFinger
                  ? b.rtl
                    ? b.translate
                    : -b.translate
                  : -P),
                b.params.freeMode)
              ) {
                if (i < -b.minTranslate()) return void b.slideTo(b.activeIndex);
                if (i > -b.maxTranslate())
                  return void (b.slides.length < b.snapGrid.length
                    ? b.slideTo(b.snapGrid.length - 1)
                    : b.slideTo(b.slides.length - 1));
                if (b.params.freeModeMomentum) {
                  if (A.length > 1) {
                    var s = A.pop(),
                      n = A.pop(),
                      o = s.position - n.position,
                      l = s.time - n.time;
                    (b.velocity = o / l),
                      (b.velocity = b.velocity / 2),
                      Math.abs(b.velocity) < b.params.freeModeMinimumVelocity &&
                        (b.velocity = 0),
                      (l > 150 || new window.Date().getTime() - s.time > 300) &&
                        (b.velocity = 0);
                  } else b.velocity = 0;
                  A.length = 0;
                  var p = 1e3 * b.params.freeModeMomentumRatio,
                    d = b.velocity * p,
                    u = b.translate + d;
                  b.rtl && (u = -u);
                  var c,
                    m = !1,
                    h =
                      20 *
                      Math.abs(b.velocity) *
                      b.params.freeModeMomentumBounceRatio;
                  if (u < b.maxTranslate())
                    b.params.freeModeMomentumBounce
                      ? (u + b.maxTranslate() < -h &&
                          (u = b.maxTranslate() - h),
                        (c = b.maxTranslate()),
                        (m = !0),
                        (B = !0))
                      : (u = b.maxTranslate());
                  else if (u > b.minTranslate())
                    b.params.freeModeMomentumBounce
                      ? (u - b.minTranslate() > h && (u = b.minTranslate() + h),
                        (c = b.minTranslate()),
                        (m = !0),
                        (B = !0))
                      : (u = b.minTranslate());
                  else if (b.params.freeModeSticky) {
                    var f,
                      g = 0;
                    for (g = 0; g < b.snapGrid.length; g += 1)
                      if (b.snapGrid[g] > -u) {
                        f = g;
                        break;
                      }
                    (u =
                      Math.abs(b.snapGrid[f] - u) <
                        Math.abs(b.snapGrid[f - 1] - u) ||
                      "next" === b.swipeDirection
                        ? b.snapGrid[f]
                        : b.snapGrid[f - 1]),
                      b.rtl || (u = -u);
                  }
                  if (0 !== b.velocity)
                    p = b.rtl
                      ? Math.abs((-u - b.translate) / b.velocity)
                      : Math.abs((u - b.translate) / b.velocity);
                  else if (b.params.freeModeSticky) return void b.slideReset();
                  b.params.freeModeMomentumBounce && m
                    ? (b.updateProgress(c),
                      b.setWrapperTransition(p),
                      b.setWrapperTranslate(u),
                      b.onTransitionStart(),
                      (b.animating = !0),
                      b.wrapper.transitionEnd(function() {
                        b &&
                          B &&
                          (b.emit("onMomentumBounce", b),
                          b.setWrapperTransition(b.params.speed),
                          b.setWrapperTranslate(c),
                          b.wrapper.transitionEnd(function() {
                            b && b.onTransitionEnd();
                          }));
                      }))
                    : b.velocity
                    ? (b.updateProgress(u),
                      b.setWrapperTransition(p),
                      b.setWrapperTranslate(u),
                      b.onTransitionStart(),
                      b.animating ||
                        ((b.animating = !0),
                        b.wrapper.transitionEnd(function() {
                          b && b.onTransitionEnd();
                        })))
                    : b.updateProgress(u),
                    b.updateActiveIndex();
                }
                return void (
                  (!b.params.freeModeMomentum || r >= b.params.longSwipesMs) &&
                  (b.updateProgress(), b.updateActiveIndex())
                );
              }
              var v,
                w = 0,
                y = b.slidesSizesGrid[0];
              for (v = 0; v < b.slidesGrid.length; v += b.params.slidesPerGroup)
                "undefined" != typeof b.slidesGrid[v + b.params.slidesPerGroup]
                  ? i >= b.slidesGrid[v] &&
                    i < b.slidesGrid[v + b.params.slidesPerGroup] &&
                    ((w = v),
                    (y =
                      b.slidesGrid[v + b.params.slidesPerGroup] -
                      b.slidesGrid[v]))
                  : i >= b.slidesGrid[v] &&
                    ((w = v),
                    (y =
                      b.slidesGrid[b.slidesGrid.length - 1] -
                      b.slidesGrid[b.slidesGrid.length - 2]));
              var x = (i - b.slidesGrid[w]) / y;
              if (r > b.params.longSwipesMs) {
                if (!b.params.longSwipes) return void b.slideTo(b.activeIndex);
                "next" === b.swipeDirection &&
                  (x >= b.params.longSwipesRatio
                    ? b.slideTo(w + b.params.slidesPerGroup)
                    : b.slideTo(w)),
                  "prev" === b.swipeDirection &&
                    (x > 1 - b.params.longSwipesRatio
                      ? b.slideTo(w + b.params.slidesPerGroup)
                      : b.slideTo(w));
              } else {
                if (!b.params.shortSwipes) return void b.slideTo(b.activeIndex);
                "next" === b.swipeDirection &&
                  b.slideTo(w + b.params.slidesPerGroup),
                  "prev" === b.swipeDirection && b.slideTo(w);
              }
            }
          }),
          (b._slideTo = function(e, a) {
            return b.slideTo(e, a, !0, !0);
          }),
          (b.slideTo = function(e, a, t, r) {
            "undefined" == typeof t && (t = !0),
              "undefined" == typeof e && (e = 0),
              0 > e && (e = 0),
              (b.snapIndex = Math.floor(e / b.params.slidesPerGroup)),
              b.snapIndex >= b.snapGrid.length &&
                (b.snapIndex = b.snapGrid.length - 1);
            var i = -b.snapGrid[b.snapIndex];
            b.params.autoplay &&
              b.autoplaying &&
              (r || !b.params.autoplayDisableOnInteraction
                ? b.pauseAutoplay(a)
                : b.stopAutoplay()),
              b.updateProgress(i);
            for (var s = 0; s < b.slidesGrid.length; s++)
              -Math.floor(100 * i) >= Math.floor(100 * b.slidesGrid[s]) &&
                (e = s);
            return !b.params.allowSwipeToNext &&
              i < b.translate &&
              i < b.minTranslate()
              ? !1
              : !b.params.allowSwipeToPrev &&
                i > b.translate &&
                i > b.maxTranslate() &&
                (b.activeIndex || 0) !== e
              ? !1
              : ("undefined" == typeof a && (a = b.params.speed),
                (b.previousIndex = b.activeIndex || 0),
                (b.activeIndex = e),
                (b.rtl && -i === b.translate) || (!b.rtl && i === b.translate)
                  ? (b.params.autoHeight && b.updateAutoHeight(),
                    b.updateClasses(),
                    "slide" !== b.params.effect && b.setWrapperTranslate(i),
                    !1)
                  : (b.updateClasses(),
                    b.onTransitionStart(t),
                    0 === a
                      ? (b.setWrapperTranslate(i),
                        b.setWrapperTransition(0),
                        b.onTransitionEnd(t))
                      : (b.setWrapperTranslate(i),
                        b.setWrapperTransition(a),
                        b.animating ||
                          ((b.animating = !0),
                          b.wrapper.transitionEnd(function() {
                            b && b.onTransitionEnd(t);
                          }))),
                    !0));
          }),
          (b.onTransitionStart = function(e) {
            "undefined" == typeof e && (e = !0),
              b.params.autoHeight && b.updateAutoHeight(),
              b.lazy && b.lazy.onTransitionStart(),
              e &&
                (b.emit("onTransitionStart", b),
                b.activeIndex !== b.previousIndex &&
                  (b.emit("onSlideChangeStart", b),
                  b.activeIndex > b.previousIndex
                    ? b.emit("onSlideNextStart", b)
                    : b.emit("onSlidePrevStart", b)));
          }),
          (b.onTransitionEnd = function(e) {
            (b.animating = !1),
              b.setWrapperTransition(0),
              "undefined" == typeof e && (e = !0),
              b.lazy && b.lazy.onTransitionEnd(),
              e &&
                (b.emit("onTransitionEnd", b),
                b.activeIndex !== b.previousIndex &&
                  (b.emit("onSlideChangeEnd", b),
                  b.activeIndex > b.previousIndex
                    ? b.emit("onSlideNextEnd", b)
                    : b.emit("onSlidePrevEnd", b))),
              b.params.hashnav && b.hashnav && b.hashnav.setHash();
          }),
          (b.slideNext = function(e, a, t) {
            if (b.params.loop) {
              if (b.animating) return !1;
              b.fixLoop();
              b.container[0].clientLeft;
              return b.slideTo(
                b.activeIndex + b.params.slidesPerGroup,
                a,
                e,
                t
              );
            }
            return b.slideTo(b.activeIndex + b.params.slidesPerGroup, a, e, t);
          }),
          (b._slideNext = function(e) {
            return b.slideNext(!0, e, !0);
          }),
          (b.slidePrev = function(e, a, t) {
            if (b.params.loop) {
              if (b.animating) return !1;
              b.fixLoop();
              b.container[0].clientLeft;
              return b.slideTo(b.activeIndex - 1, a, e, t);
            }
            return b.slideTo(b.activeIndex - 1, a, e, t);
          }),
          (b._slidePrev = function(e) {
            return b.slidePrev(!0, e, !0);
          }),
          (b.slideReset = function(e, a, t) {
            return b.slideTo(b.activeIndex, a, e);
          }),
          (b.setWrapperTransition = function(e, a) {
            b.wrapper.transition(e),
              "slide" !== b.params.effect &&
                b.effects[b.params.effect] &&
                b.effects[b.params.effect].setTransition(e),
              b.params.parallax && b.parallax && b.parallax.setTransition(e),
              b.params.scrollbar && b.scrollbar && b.scrollbar.setTransition(e),
              b.params.control &&
                b.controller &&
                b.controller.setTransition(e, a),
              b.emit("onSetTransition", b, e);
          }),
          (b.setWrapperTranslate = function(e, a, t) {
            var r = 0,
              i = 0,
              n = 0;
            b.isHorizontal() ? (r = b.rtl ? -e : e) : (i = e),
              b.params.roundLengths && ((r = s(r)), (i = s(i))),
              b.params.virtualTranslate ||
                (b.support.transforms3d
                  ? b.wrapper.transform(
                      "translate3d(" + r + "px, " + i + "px, " + n + "px)"
                    )
                  : b.wrapper.transform("translate(" + r + "px, " + i + "px)")),
              (b.translate = b.isHorizontal() ? r : i);
            var o,
              l = b.maxTranslate() - b.minTranslate();
            (o = 0 === l ? 0 : (e - b.minTranslate()) / l),
              o !== b.progress && b.updateProgress(e),
              a && b.updateActiveIndex(),
              "slide" !== b.params.effect &&
                b.effects[b.params.effect] &&
                b.effects[b.params.effect].setTranslate(b.translate),
              b.params.parallax &&
                b.parallax &&
                b.parallax.setTranslate(b.translate),
              b.params.scrollbar &&
                b.scrollbar &&
                b.scrollbar.setTranslate(b.translate),
              b.params.control &&
                b.controller &&
                b.controller.setTranslate(b.translate, t),
              b.emit("onSetTranslate", b, b.translate);
          }),
          (b.getTranslate = function(e, a) {
            var t, r, i, s;
            return (
              "undefined" == typeof a && (a = "x"),
              b.params.virtualTranslate
                ? b.rtl
                  ? -b.translate
                  : b.translate
                : ((i = window.getComputedStyle(e, null)),
                  window.WebKitCSSMatrix
                    ? ((r = i.transform || i.webkitTransform),
                      r.split(",").length > 6 &&
                        (r = r
                          .split(", ")
                          .map(function(e) {
                            return e.replace(",", ".");
                          })
                          .join(", ")),
                      (s = new window.WebKitCSSMatrix("none" === r ? "" : r)))
                    : ((s =
                        i.MozTransform ||
                        i.OTransform ||
                        i.MsTransform ||
                        i.msTransform ||
                        i.transform ||
                        i
                          .getPropertyValue("transform")
                          .replace("translate(", "matrix(1, 0, 0, 1,")),
                      (t = s.toString().split(","))),
                  "x" === a &&
                    (r = window.WebKitCSSMatrix
                      ? s.m41
                      : 16 === t.length
                      ? parseFloat(t[12])
                      : parseFloat(t[4])),
                  "y" === a &&
                    (r = window.WebKitCSSMatrix
                      ? s.m42
                      : 16 === t.length
                      ? parseFloat(t[13])
                      : parseFloat(t[5])),
                  b.rtl && r && (r = -r),
                  r || 0)
            );
          }),
          (b.getWrapperTranslate = function(e) {
            return (
              "undefined" == typeof e && (e = b.isHorizontal() ? "x" : "y"),
              b.getTranslate(b.wrapper[0], e)
            );
          }),
          (b.observers = []),
          (b.initObservers = function() {
            if (b.params.observeParents)
              for (var e = b.container.parents(), a = 0; a < e.length; a++)
                l(e[a]);
            l(b.container[0], { childList: !1 }),
              l(b.wrapper[0], { attributes: !1 });
          }),
          (b.disconnectObservers = function() {
            for (var e = 0; e < b.observers.length; e++)
              b.observers[e].disconnect();
            b.observers = [];
          }),
          (b.createLoop = function() {
            b.wrapper
              .children(
                "." + b.params.slideClass + "." + b.params.slideDuplicateClass
              )
              .remove();
            var e = b.wrapper.children("." + b.params.slideClass);
            "auto" !== b.params.slidesPerView ||
              b.params.loopedSlides ||
              (b.params.loopedSlides = e.length),
              (b.loopedSlides = parseInt(
                b.params.loopedSlides || b.params.slidesPerView,
                10
              )),
              (b.loopedSlides = b.loopedSlides + b.params.loopAdditionalSlides),
              b.loopedSlides > e.length && (b.loopedSlides = e.length);
            var t,
              r = [],
              i = [];
            for (
              e.each(function(t, s) {
                var n = a(this);
                t < b.loopedSlides && i.push(s),
                  t < e.length && t >= e.length - b.loopedSlides && r.push(s),
                  n.attr("data-swiper-slide-index", t);
              }),
                t = 0;
              t < i.length;
              t++
            )
              b.wrapper.append(
                a(i[t].cloneNode(!0)).addClass(b.params.slideDuplicateClass)
              );
            for (t = r.length - 1; t >= 0; t--)
              b.wrapper.prepend(
                a(r[t].cloneNode(!0)).addClass(b.params.slideDuplicateClass)
              );
          }),
          (b.destroyLoop = function() {
            b.wrapper
              .children(
                "." + b.params.slideClass + "." + b.params.slideDuplicateClass
              )
              .remove(),
              b.slides.removeAttr("data-swiper-slide-index");
          }),
          (b.reLoop = function(e) {
            var a = b.activeIndex - b.loopedSlides;
            b.destroyLoop(),
              b.createLoop(),
              b.updateSlidesSize(),
              e && b.slideTo(a + b.loopedSlides, 0, !1);
          }),
          (b.fixLoop = function() {
            var e;
            b.activeIndex < b.loopedSlides
              ? ((e = b.slides.length - 3 * b.loopedSlides + b.activeIndex),
                (e += b.loopedSlides),
                b.slideTo(e, 0, !1, !0))
              : (("auto" === b.params.slidesPerView &&
                  b.activeIndex >= 2 * b.loopedSlides) ||
                  b.activeIndex >
                    b.slides.length - 2 * b.params.slidesPerView) &&
                ((e = -b.slides.length + b.activeIndex + b.loopedSlides),
                (e += b.loopedSlides),
                b.slideTo(e, 0, !1, !0));
          }),
          (b.appendSlide = function(e) {
            if (
              (b.params.loop && b.destroyLoop(),
              "object" == typeof e && e.length)
            )
              for (var a = 0; a < e.length; a++) e[a] && b.wrapper.append(e[a]);
            else b.wrapper.append(e);
            b.params.loop && b.createLoop(),
              (b.params.observer && b.support.observer) || b.update(!0);
          }),
          (b.prependSlide = function(e) {
            b.params.loop && b.destroyLoop();
            var a = b.activeIndex + 1;
            if ("object" == typeof e && e.length) {
              for (var t = 0; t < e.length; t++)
                e[t] && b.wrapper.prepend(e[t]);
              a = b.activeIndex + e.length;
            } else b.wrapper.prepend(e);
            b.params.loop && b.createLoop(),
              (b.params.observer && b.support.observer) || b.update(!0),
              b.slideTo(a, 0, !1);
          }),
          (b.removeSlide = function(e) {
            b.params.loop &&
              (b.destroyLoop(),
              (b.slides = b.wrapper.children("." + b.params.slideClass)));
            var a,
              t = b.activeIndex;
            if ("object" == typeof e && e.length) {
              for (var r = 0; r < e.length; r++)
                (a = e[r]),
                  b.slides[a] && b.slides.eq(a).remove(),
                  t > a && t--;
              t = Math.max(t, 0);
            } else
              (a = e),
                b.slides[a] && b.slides.eq(a).remove(),
                t > a && t--,
                (t = Math.max(t, 0));
            b.params.loop && b.createLoop(),
              (b.params.observer && b.support.observer) || b.update(!0),
              b.params.loop
                ? b.slideTo(t + b.loopedSlides, 0, !1)
                : b.slideTo(t, 0, !1);
          }),
          (b.removeAllSlides = function() {
            for (var e = [], a = 0; a < b.slides.length; a++) e.push(a);
            b.removeSlide(e);
          }),
          (b.effects = {
            fade: {
              setTranslate: function() {
                for (var e = 0; e < b.slides.length; e++) {
                  var a = b.slides.eq(e),
                    t = a[0].swiperSlideOffset,
                    r = -t;
                  b.params.virtualTranslate || (r -= b.translate);
                  var i = 0;
                  b.isHorizontal() || ((i = r), (r = 0));
                  var s = b.params.fade.crossFade
                    ? Math.max(1 - Math.abs(a[0].progress), 0)
                    : 1 + Math.min(Math.max(a[0].progress, -1), 0);
                  a.css({ opacity: s }).transform(
                    "translate3d(" + r + "px, " + i + "px, 0px)"
                  );
                }
              },
              setTransition: function(e) {
                if (
                  (b.slides.transition(e), b.params.virtualTranslate && 0 !== e)
                ) {
                  var a = !1;
                  b.slides.transitionEnd(function() {
                    if (!a && b) {
                      (a = !0), (b.animating = !1);
                      for (
                        var e = [
                            "webkitTransitionEnd",
                            "transitionend",
                            "oTransitionEnd",
                            "MSTransitionEnd",
                            "msTransitionEnd"
                          ],
                          t = 0;
                        t < e.length;
                        t++
                      )
                        b.wrapper.trigger(e[t]);
                    }
                  });
                }
              }
            },
            flip: {
              setTranslate: function() {
                for (var e = 0; e < b.slides.length; e++) {
                  var t = b.slides.eq(e),
                    r = t[0].progress;
                  b.params.flip.limitRotation &&
                    (r = Math.max(Math.min(t[0].progress, 1), -1));
                  var i = t[0].swiperSlideOffset,
                    s = -180 * r,
                    n = s,
                    o = 0,
                    l = -i,
                    p = 0;
                  if (
                    (b.isHorizontal()
                      ? b.rtl && (n = -n)
                      : ((p = l), (l = 0), (o = -n), (n = 0)),
                    (t[0].style.zIndex =
                      -Math.abs(Math.round(r)) + b.slides.length),
                    b.params.flip.slideShadows)
                  ) {
                    var d = b.isHorizontal()
                        ? t.find(".swiper-slide-shadow-left")
                        : t.find(".swiper-slide-shadow-top"),
                      u = b.isHorizontal()
                        ? t.find(".swiper-slide-shadow-right")
                        : t.find(".swiper-slide-shadow-bottom");
                    0 === d.length &&
                      ((d = a(
                        '<div class="swiper-slide-shadow-' +
                          (b.isHorizontal() ? "left" : "top") +
                          '"></div>'
                      )),
                      t.append(d)),
                      0 === u.length &&
                        ((u = a(
                          '<div class="swiper-slide-shadow-' +
                            (b.isHorizontal() ? "right" : "bottom") +
                            '"></div>'
                        )),
                        t.append(u)),
                      d.length && (d[0].style.opacity = Math.max(-r, 0)),
                      u.length && (u[0].style.opacity = Math.max(r, 0));
                  }
                  t.transform(
                    "translate3d(" +
                      l +
                      "px, " +
                      p +
                      "px, 0px) rotateX(" +
                      o +
                      "deg) rotateY(" +
                      n +
                      "deg)"
                  );
                }
              },
              setTransition: function(e) {
                if (
                  (b.slides
                    .transition(e)
                    .find(
                      ".swiper-slide-shadow-top, .swiper-slide-shadow-right, .swiper-slide-shadow-bottom, .swiper-slide-shadow-left"
                    )
                    .transition(e),
                  b.params.virtualTranslate && 0 !== e)
                ) {
                  var t = !1;
                  b.slides.eq(b.activeIndex).transitionEnd(function() {
                    if (
                      !t &&
                      b &&
                      a(this).hasClass(b.params.slideActiveClass)
                    ) {
                      (t = !0), (b.animating = !1);
                      for (
                        var e = [
                            "webkitTransitionEnd",
                            "transitionend",
                            "oTransitionEnd",
                            "MSTransitionEnd",
                            "msTransitionEnd"
                          ],
                          r = 0;
                        r < e.length;
                        r++
                      )
                        b.wrapper.trigger(e[r]);
                    }
                  });
                }
              }
            },
            cube: {
              setTranslate: function() {
                var e,
                  t = 0;
                b.params.cube.shadow &&
                  (b.isHorizontal()
                    ? ((e = b.wrapper.find(".swiper-cube-shadow")),
                      0 === e.length &&
                        ((e = a('<div class="swiper-cube-shadow"></div>')),
                        b.wrapper.append(e)),
                      e.css({ height: b.width + "px" }))
                    : ((e = b.container.find(".swiper-cube-shadow")),
                      0 === e.length &&
                        ((e = a('<div class="swiper-cube-shadow"></div>')),
                        b.container.append(e))));
                for (var r = 0; r < b.slides.length; r++) {
                  var i = b.slides.eq(r),
                    s = 90 * r,
                    n = Math.floor(s / 360);
                  b.rtl && ((s = -s), (n = Math.floor(-s / 360)));
                  var o = Math.max(Math.min(i[0].progress, 1), -1),
                    l = 0,
                    p = 0,
                    d = 0;
                  r % 4 === 0
                    ? ((l = 4 * -n * b.size), (d = 0))
                    : (r - 1) % 4 === 0
                    ? ((l = 0), (d = 4 * -n * b.size))
                    : (r - 2) % 4 === 0
                    ? ((l = b.size + 4 * n * b.size), (d = b.size))
                    : (r - 3) % 4 === 0 &&
                      ((l = -b.size), (d = 3 * b.size + 4 * b.size * n)),
                    b.rtl && (l = -l),
                    b.isHorizontal() || ((p = l), (l = 0));
                  var u =
                    "rotateX(" +
                    (b.isHorizontal() ? 0 : -s) +
                    "deg) rotateY(" +
                    (b.isHorizontal() ? s : 0) +
                    "deg) translate3d(" +
                    l +
                    "px, " +
                    p +
                    "px, " +
                    d +
                    "px)";
                  if (
                    (1 >= o &&
                      o > -1 &&
                      ((t = 90 * r + 90 * o), b.rtl && (t = 90 * -r - 90 * o)),
                    i.transform(u),
                    b.params.cube.slideShadows)
                  ) {
                    var c = b.isHorizontal()
                        ? i.find(".swiper-slide-shadow-left")
                        : i.find(".swiper-slide-shadow-top"),
                      m = b.isHorizontal()
                        ? i.find(".swiper-slide-shadow-right")
                        : i.find(".swiper-slide-shadow-bottom");
                    0 === c.length &&
                      ((c = a(
                        '<div class="swiper-slide-shadow-' +
                          (b.isHorizontal() ? "left" : "top") +
                          '"></div>'
                      )),
                      i.append(c)),
                      0 === m.length &&
                        ((m = a(
                          '<div class="swiper-slide-shadow-' +
                            (b.isHorizontal() ? "right" : "bottom") +
                            '"></div>'
                        )),
                        i.append(m)),
                      c.length && (c[0].style.opacity = Math.max(-o, 0)),
                      m.length && (m[0].style.opacity = Math.max(o, 0));
                  }
                }
                if (
                  (b.wrapper.css({
                    "-webkit-transform-origin": "50% 50% -" + b.size / 2 + "px",
                    "-moz-transform-origin": "50% 50% -" + b.size / 2 + "px",
                    "-ms-transform-origin": "50% 50% -" + b.size / 2 + "px",
                    "transform-origin": "50% 50% -" + b.size / 2 + "px"
                  }),
                  b.params.cube.shadow)
                )
                  if (b.isHorizontal())
                    e.transform(
                      "translate3d(0px, " +
                        (b.width / 2 + b.params.cube.shadowOffset) +
                        "px, " +
                        -b.width / 2 +
                        "px) rotateX(90deg) rotateZ(0deg) scale(" +
                        b.params.cube.shadowScale +
                        ")"
                    );
                  else {
                    var h = Math.abs(t) - 90 * Math.floor(Math.abs(t) / 90),
                      f =
                        1.5 -
                        (Math.sin((2 * h * Math.PI) / 360) / 2 +
                          Math.cos((2 * h * Math.PI) / 360) / 2),
                      g = b.params.cube.shadowScale,
                      v = b.params.cube.shadowScale / f,
                      w = b.params.cube.shadowOffset;
                    e.transform(
                      "scale3d(" +
                        g +
                        ", 1, " +
                        v +
                        ") translate3d(0px, " +
                        (b.height / 2 + w) +
                        "px, " +
                        -b.height / 2 / v +
                        "px) rotateX(-90deg)"
                    );
                  }
                var y = b.isSafari || b.isUiWebView ? -b.size / 2 : 0;
                b.wrapper.transform(
                  "translate3d(0px,0," +
                    y +
                    "px) rotateX(" +
                    (b.isHorizontal() ? 0 : t) +
                    "deg) rotateY(" +
                    (b.isHorizontal() ? -t : 0) +
                    "deg)"
                );
              },
              setTransition: function(e) {
                b.slides
                  .transition(e)
                  .find(
                    ".swiper-slide-shadow-top, .swiper-slide-shadow-right, .swiper-slide-shadow-bottom, .swiper-slide-shadow-left"
                  )
                  .transition(e),
                  b.params.cube.shadow &&
                    !b.isHorizontal() &&
                    b.container.find(".swiper-cube-shadow").transition(e);
              }
            },
            coverflow: {
              setTranslate: function() {
                for (
                  var e = b.translate,
                    t = b.isHorizontal() ? -e + b.width / 2 : -e + b.height / 2,
                    r = b.isHorizontal()
                      ? b.params.coverflow.rotate
                      : -b.params.coverflow.rotate,
                    i = b.params.coverflow.depth,
                    s = 0,
                    n = b.slides.length;
                  n > s;
                  s++
                ) {
                  var o = b.slides.eq(s),
                    l = b.slidesSizesGrid[s],
                    p = o[0].swiperSlideOffset,
                    d = ((t - p - l / 2) / l) * b.params.coverflow.modifier,
                    u = b.isHorizontal() ? r * d : 0,
                    c = b.isHorizontal() ? 0 : r * d,
                    m = -i * Math.abs(d),
                    h = b.isHorizontal() ? 0 : b.params.coverflow.stretch * d,
                    f = b.isHorizontal() ? b.params.coverflow.stretch * d : 0;
                  Math.abs(f) < 0.001 && (f = 0),
                    Math.abs(h) < 0.001 && (h = 0),
                    Math.abs(m) < 0.001 && (m = 0),
                    Math.abs(u) < 0.001 && (u = 0),
                    Math.abs(c) < 0.001 && (c = 0);
                  var g =
                    "translate3d(" +
                    f +
                    "px," +
                    h +
                    "px," +
                    m +
                    "px)  rotateX(" +
                    c +
                    "deg) rotateY(" +
                    u +
                    "deg)";
                  if (
                    (o.transform(g),
                    (o[0].style.zIndex = -Math.abs(Math.round(d)) + 1),
                    b.params.coverflow.slideShadows)
                  ) {
                    var v = b.isHorizontal()
                        ? o.find(".swiper-slide-shadow-left")
                        : o.find(".swiper-slide-shadow-top"),
                      w = b.isHorizontal()
                        ? o.find(".swiper-slide-shadow-right")
                        : o.find(".swiper-slide-shadow-bottom");
                    0 === v.length &&
                      ((v = a(
                        '<div class="swiper-slide-shadow-' +
                          (b.isHorizontal() ? "left" : "top") +
                          '"></div>'
                      )),
                      o.append(v)),
                      0 === w.length &&
                        ((w = a(
                          '<div class="swiper-slide-shadow-' +
                            (b.isHorizontal() ? "right" : "bottom") +
                            '"></div>'
                        )),
                        o.append(w)),
                      v.length && (v[0].style.opacity = d > 0 ? d : 0),
                      w.length && (w[0].style.opacity = -d > 0 ? -d : 0);
                  }
                }
                if (b.browser.ie) {
                  var y = b.wrapper[0].style;
                  y.perspectiveOrigin = t + "px 50%";
                }
              },
              setTransition: function(e) {
                b.slides
                  .transition(e)
                  .find(
                    ".swiper-slide-shadow-top, .swiper-slide-shadow-right, .swiper-slide-shadow-bottom, .swiper-slide-shadow-left"
                  )
                  .transition(e);
              }
            }
          }),
          (b.lazy = {
            initialImageLoaded: !1,
            loadImageInSlide: function(e, t) {
              if (
                "undefined" != typeof e &&
                ("undefined" == typeof t && (t = !0), 0 !== b.slides.length)
              ) {
                var r = b.slides.eq(e),
                  i = r.find(
                    ".swiper-lazy:not(.swiper-lazy-loaded):not(.swiper-lazy-loading)"
                  );
                !r.hasClass("swiper-lazy") ||
                  r.hasClass("swiper-lazy-loaded") ||
                  r.hasClass("swiper-lazy-loading") ||
                  (i = i.add(r[0])),
                  0 !== i.length &&
                    i.each(function() {
                      var e = a(this);
                      e.addClass("swiper-lazy-loading");
                      var i = e.attr("data-background"),
                        s = e.attr("data-src"),
                        n = e.attr("data-srcset");
                      b.loadImage(e[0], s || i, n, !1, function() {
                        if (
                          (i
                            ? (e.css("background-image", 'url("' + i + '")'),
                              e.removeAttr("data-background"))
                            : (n &&
                                (e.attr("srcset", n),
                                e.removeAttr("data-srcset")),
                              s &&
                                (e.attr("src", s), e.removeAttr("data-src"))),
                          e
                            .addClass("swiper-lazy-loaded")
                            .removeClass("swiper-lazy-loading"),
                          r.find(".swiper-lazy-preloader, .preloader").remove(),
                          b.params.loop && t)
                        ) {
                          var a = r.attr("data-swiper-slide-index");
                          if (r.hasClass(b.params.slideDuplicateClass)) {
                            var o = b.wrapper.children(
                              '[data-swiper-slide-index="' +
                                a +
                                '"]:not(.' +
                                b.params.slideDuplicateClass +
                                ")"
                            );
                            b.lazy.loadImageInSlide(o.index(), !1);
                          } else {
                            var l = b.wrapper.children(
                              "." +
                                b.params.slideDuplicateClass +
                                '[data-swiper-slide-index="' +
                                a +
                                '"]'
                            );
                            b.lazy.loadImageInSlide(l.index(), !1);
                          }
                        }
                        b.emit("onLazyImageReady", b, r[0], e[0]);
                      }),
                        b.emit("onLazyImageLoad", b, r[0], e[0]);
                    });
              }
            },
            load: function() {
              var e;
              if (b.params.watchSlidesVisibility)
                b.wrapper
                  .children("." + b.params.slideVisibleClass)
                  .each(function() {
                    b.lazy.loadImageInSlide(a(this).index());
                  });
              else if (b.params.slidesPerView > 1)
                for (
                  e = b.activeIndex;
                  e < b.activeIndex + b.params.slidesPerView;
                  e++
                )
                  b.slides[e] && b.lazy.loadImageInSlide(e);
              else b.lazy.loadImageInSlide(b.activeIndex);
              if (b.params.lazyLoadingInPrevNext)
                if (
                  b.params.slidesPerView > 1 ||
                  (b.params.lazyLoadingInPrevNextAmount &&
                    b.params.lazyLoadingInPrevNextAmount > 1)
                ) {
                  var t = b.params.lazyLoadingInPrevNextAmount,
                    r = b.params.slidesPerView,
                    i = Math.min(
                      b.activeIndex + r + Math.max(t, r),
                      b.slides.length
                    ),
                    s = Math.max(b.activeIndex - Math.max(r, t), 0);
                  for (e = b.activeIndex + b.params.slidesPerView; i > e; e++)
                    b.slides[e] && b.lazy.loadImageInSlide(e);
                  for (e = s; e < b.activeIndex; e++)
                    b.slides[e] && b.lazy.loadImageInSlide(e);
                } else {
                  var n = b.wrapper.children("." + b.params.slideNextClass);
                  n.length > 0 && b.lazy.loadImageInSlide(n.index());
                  var o = b.wrapper.children("." + b.params.slidePrevClass);
                  o.length > 0 && b.lazy.loadImageInSlide(o.index());
                }
            },
            onTransitionStart: function() {
              b.params.lazyLoading &&
                (b.params.lazyLoadingOnTransitionStart ||
                  (!b.params.lazyLoadingOnTransitionStart &&
                    !b.lazy.initialImageLoaded)) &&
                b.lazy.load();
            },
            onTransitionEnd: function() {
              b.params.lazyLoading &&
                !b.params.lazyLoadingOnTransitionStart &&
                b.lazy.load();
            }
          }),
          (b.scrollbar = {
            isTouched: !1,
            setDragPosition: function(e) {
              var a = b.scrollbar,
                t = b.isHorizontal()
                  ? "touchstart" === e.type || "touchmove" === e.type
                    ? e.targetTouches[0].pageX
                    : e.pageX || e.clientX
                  : "touchstart" === e.type || "touchmove" === e.type
                  ? e.targetTouches[0].pageY
                  : e.pageY || e.clientY,
                r =
                  t -
                  a.track.offset()[b.isHorizontal() ? "left" : "top"] -
                  a.dragSize / 2,
                i = -b.minTranslate() * a.moveDivider,
                s = -b.maxTranslate() * a.moveDivider;
              i > r ? (r = i) : r > s && (r = s),
                (r = -r / a.moveDivider),
                b.updateProgress(r),
                b.setWrapperTranslate(r, !0);
            },
            dragStart: function(e) {
              var a = b.scrollbar;
              (a.isTouched = !0),
                e.preventDefault(),
                e.stopPropagation(),
                a.setDragPosition(e),
                clearTimeout(a.dragTimeout),
                a.track.transition(0),
                b.params.scrollbarHide && a.track.css("opacity", 1),
                b.wrapper.transition(100),
                a.drag.transition(100),
                b.emit("onScrollbarDragStart", b);
            },
            dragMove: function(e) {
              var a = b.scrollbar;
              a.isTouched &&
                (e.preventDefault ? e.preventDefault() : (e.returnValue = !1),
                a.setDragPosition(e),
                b.wrapper.transition(0),
                a.track.transition(0),
                a.drag.transition(0),
                b.emit("onScrollbarDragMove", b));
            },
            dragEnd: function(e) {
              var a = b.scrollbar;
              a.isTouched &&
                ((a.isTouched = !1),
                b.params.scrollbarHide &&
                  (clearTimeout(a.dragTimeout),
                  (a.dragTimeout = setTimeout(function() {
                    a.track.css("opacity", 0), a.track.transition(400);
                  }, 1e3))),
                b.emit("onScrollbarDragEnd", b),
                b.params.scrollbarSnapOnRelease && b.slideReset());
            },
            enableDraggable: function() {
              var e = b.scrollbar,
                t = b.support.touch ? e.track : document;
              a(e.track).on(b.touchEvents.start, e.dragStart),
                a(t).on(b.touchEvents.move, e.dragMove),
                a(t).on(b.touchEvents.end, e.dragEnd);
            },
            disableDraggable: function() {
              var e = b.scrollbar,
                t = b.support.touch ? e.track : document;
              a(e.track).off(b.touchEvents.start, e.dragStart),
                a(t).off(b.touchEvents.move, e.dragMove),
                a(t).off(b.touchEvents.end, e.dragEnd);
            },
            set: function() {
              if (b.params.scrollbar) {
                var e = b.scrollbar;
                (e.track = a(b.params.scrollbar)),
                  b.params.uniqueNavElements &&
                    "string" == typeof b.params.scrollbar &&
                    e.track.length > 1 &&
                    1 === b.container.find(b.params.scrollbar).length &&
                    (e.track = b.container.find(b.params.scrollbar)),
                  (e.drag = e.track.find(".swiper-scrollbar-drag")),
                  0 === e.drag.length &&
                    ((e.drag = a('<div class="swiper-scrollbar-drag"></div>')),
                    e.track.append(e.drag)),
                  (e.drag[0].style.width = ""),
                  (e.drag[0].style.height = ""),
                  (e.trackSize = b.isHorizontal()
                    ? e.track[0].offsetWidth
                    : e.track[0].offsetHeight),
                  (e.divider = b.size / b.virtualSize),
                  (e.moveDivider = e.divider * (e.trackSize / b.size)),
                  (e.dragSize = e.trackSize * e.divider),
                  b.isHorizontal()
                    ? (e.drag[0].style.width = e.dragSize + "px")
                    : (e.drag[0].style.height = e.dragSize + "px"),
                  e.divider >= 1
                    ? (e.track[0].style.display = "none")
                    : (e.track[0].style.display = ""),
                  b.params.scrollbarHide && (e.track[0].style.opacity = 0);
              }
            },
            setTranslate: function() {
              if (b.params.scrollbar) {
                var e,
                  a = b.scrollbar,
                  t = (b.translate || 0, a.dragSize);
                (e = (a.trackSize - a.dragSize) * b.progress),
                  b.rtl && b.isHorizontal()
                    ? ((e = -e),
                      e > 0
                        ? ((t = a.dragSize - e), (e = 0))
                        : -e + a.dragSize > a.trackSize &&
                          (t = a.trackSize + e))
                    : 0 > e
                    ? ((t = a.dragSize + e), (e = 0))
                    : e + a.dragSize > a.trackSize && (t = a.trackSize - e),
                  b.isHorizontal()
                    ? (b.support.transforms3d
                        ? a.drag.transform("translate3d(" + e + "px, 0, 0)")
                        : a.drag.transform("translateX(" + e + "px)"),
                      (a.drag[0].style.width = t + "px"))
                    : (b.support.transforms3d
                        ? a.drag.transform("translate3d(0px, " + e + "px, 0)")
                        : a.drag.transform("translateY(" + e + "px)"),
                      (a.drag[0].style.height = t + "px")),
                  b.params.scrollbarHide &&
                    (clearTimeout(a.timeout),
                    (a.track[0].style.opacity = 1),
                    (a.timeout = setTimeout(function() {
                      (a.track[0].style.opacity = 0), a.track.transition(400);
                    }, 1e3)));
              }
            },
            setTransition: function(e) {
              b.params.scrollbar && b.scrollbar.drag.transition(e);
            }
          }),
          (b.controller = {
            LinearSpline: function(e, a) {
              (this.x = e), (this.y = a), (this.lastIndex = e.length - 1);
              var t, r;
              this.x.length;
              this.interpolate = function(e) {
                return e
                  ? ((r = i(this.x, e)),
                    (t = r - 1),
                    ((e - this.x[t]) * (this.y[r] - this.y[t])) /
                      (this.x[r] - this.x[t]) +
                      this.y[t])
                  : 0;
              };
              var i = (function() {
                var e, a, t;
                return function(r, i) {
                  for (a = -1, e = r.length; e - a > 1; )
                    r[(t = (e + a) >> 1)] <= i ? (a = t) : (e = t);
                  return e;
                };
              })();
            },
            getInterpolateFunction: function(e) {
              b.controller.spline ||
                (b.controller.spline = b.params.loop
                  ? new b.controller.LinearSpline(b.slidesGrid, e.slidesGrid)
                  : new b.controller.LinearSpline(b.snapGrid, e.snapGrid));
            },
            setTranslate: function(e, a) {
              function r(a) {
                (e =
                  a.rtl && "horizontal" === a.params.direction
                    ? -b.translate
                    : b.translate),
                  "slide" === b.params.controlBy &&
                    (b.controller.getInterpolateFunction(a),
                    (s = -b.controller.spline.interpolate(-e))),
                  (s && "container" !== b.params.controlBy) ||
                    ((i =
                      (a.maxTranslate() - a.minTranslate()) /
                      (b.maxTranslate() - b.minTranslate())),
                    (s = (e - b.minTranslate()) * i + a.minTranslate())),
                  b.params.controlInverse && (s = a.maxTranslate() - s),
                  a.updateProgress(s),
                  a.setWrapperTranslate(s, !1, b),
                  a.updateActiveIndex();
              }
              var i,
                s,
                n = b.params.control;
              if (b.isArray(n))
                for (var o = 0; o < n.length; o++)
                  n[o] !== a && n[o] instanceof t && r(n[o]);
              else n instanceof t && a !== n && r(n);
            },
            setTransition: function(e, a) {
              function r(a) {
                a.setWrapperTransition(e, b),
                  0 !== e &&
                    (a.onTransitionStart(),
                    a.wrapper.transitionEnd(function() {
                      s &&
                        (a.params.loop &&
                          "slide" === b.params.controlBy &&
                          a.fixLoop(),
                        a.onTransitionEnd());
                    }));
              }
              var i,
                s = b.params.control;
              if (b.isArray(s))
                for (i = 0; i < s.length; i++)
                  s[i] !== a && s[i] instanceof t && r(s[i]);
              else s instanceof t && a !== s && r(s);
            }
          }),
          (b.hashnav = {
            init: function() {
              if (b.params.hashnav) {
                b.hashnav.initialized = !0;
                var e = document.location.hash.replace("#", "");
                if (e)
                  for (var a = 0, t = 0, r = b.slides.length; r > t; t++) {
                    var i = b.slides.eq(t),
                      s = i.attr("data-hash");
                    if (s === e && !i.hasClass(b.params.slideDuplicateClass)) {
                      var n = i.index();
                      b.slideTo(n, a, b.params.runCallbacksOnInit, !0);
                    }
                  }
              }
            },
            setHash: function() {
              b.hashnav.initialized &&
                b.params.hashnav &&
                (document.location.hash =
                  b.slides.eq(b.activeIndex).attr("data-hash") || "");
            }
          }),
          (b.disableKeyboardControl = function() {
            (b.params.keyboardControl = !1), a(document).off("keydown", p);
          }),
          (b.enableKeyboardControl = function() {
            (b.params.keyboardControl = !0), a(document).on("keydown", p);
          }),
          (b.mousewheel = {
            event: !1,
            lastScrollTime: new window.Date().getTime()
          }),
          b.params.mousewheelControl)
        ) {
          try {
            new window.WheelEvent("wheel"), (b.mousewheel.event = "wheel");
          } catch (N) {
            (window.WheelEvent ||
              (b.container[0] && "wheel" in b.container[0])) &&
              (b.mousewheel.event = "wheel");
          }
          !b.mousewheel.event && window.WheelEvent,
            b.mousewheel.event ||
              void 0 === document.onmousewheel ||
              (b.mousewheel.event = "mousewheel"),
            b.mousewheel.event || (b.mousewheel.event = "DOMMouseScroll");
        }
        (b.disableMousewheelControl = function() {
          return b.mousewheel.event
            ? (b.container.off(b.mousewheel.event, d), !0)
            : !1;
        }),
          (b.enableMousewheelControl = function() {
            return b.mousewheel.event
              ? (b.container.on(b.mousewheel.event, d), !0)
              : !1;
          }),
          (b.parallax = {
            setTranslate: function() {
              b.container
                .children(
                  "[data-swiper-parallax], [data-swiper-parallax-x], [data-swiper-parallax-y]"
                )
                .each(function() {
                  u(this, b.progress);
                }),
                b.slides.each(function() {
                  var e = a(this);
                  e.find(
                    "[data-swiper-parallax], [data-swiper-parallax-x], [data-swiper-parallax-y]"
                  ).each(function() {
                    var a = Math.min(Math.max(e[0].progress, -1), 1);
                    u(this, a);
                  });
                });
            },
            setTransition: function(e) {
              "undefined" == typeof e && (e = b.params.speed),
                b.container
                  .find(
                    "[data-swiper-parallax], [data-swiper-parallax-x], [data-swiper-parallax-y]"
                  )
                  .each(function() {
                    var t = a(this),
                      r =
                        parseInt(t.attr("data-swiper-parallax-duration"), 10) ||
                        e;
                    0 === e && (r = 0), t.transition(r);
                  });
            }
          }),
          (b._plugins = []);
        for (var R in b.plugins) {
          var W = b.plugins[R](b, b.params[R]);
          W && b._plugins.push(W);
        }
        return (
          (b.callPlugins = function(e) {
            for (var a = 0; a < b._plugins.length; a++)
              e in b._plugins[a] &&
                b._plugins[a][e](
                  arguments[1],
                  arguments[2],
                  arguments[3],
                  arguments[4],
                  arguments[5]
                );
          }),
          (b.emitterEventListeners = {}),
          (b.emit = function(e) {
            b.params[e] &&
              b.params[e](
                arguments[1],
                arguments[2],
                arguments[3],
                arguments[4],
                arguments[5]
              );
            var a;
            if (b.emitterEventListeners[e])
              for (a = 0; a < b.emitterEventListeners[e].length; a++)
                b.emitterEventListeners[e][a](
                  arguments[1],
                  arguments[2],
                  arguments[3],
                  arguments[4],
                  arguments[5]
                );
            b.callPlugins &&
              b.callPlugins(
                e,
                arguments[1],
                arguments[2],
                arguments[3],
                arguments[4],
                arguments[5]
              );
          }),
          (b.on = function(e, a) {
            return (
              (e = c(e)),
              b.emitterEventListeners[e] || (b.emitterEventListeners[e] = []),
              b.emitterEventListeners[e].push(a),
              b
            );
          }),
          (b.off = function(e, a) {
            var t;
            if (((e = c(e)), "undefined" == typeof a))
              return (b.emitterEventListeners[e] = []), b;
            if (
              b.emitterEventListeners[e] &&
              0 !== b.emitterEventListeners[e].length
            ) {
              for (t = 0; t < b.emitterEventListeners[e].length; t++)
                b.emitterEventListeners[e][t] === a &&
                  b.emitterEventListeners[e].splice(t, 1);
              return b;
            }
          }),
          (b.once = function(e, a) {
            e = c(e);
            var t = function() {
              a(
                arguments[0],
                arguments[1],
                arguments[2],
                arguments[3],
                arguments[4]
              ),
                b.off(e, t);
            };
            return b.on(e, t), b;
          }),
          (b.a11y = {
            makeFocusable: function(e) {
              return e.attr("tabIndex", "0"), e;
            },
            addRole: function(e, a) {
              return e.attr("role", a), e;
            },
            addLabel: function(e, a) {
              return e.attr("aria-label", a), e;
            },
            disable: function(e) {
              return e.attr("aria-disabled", !0), e;
            },
            enable: function(e) {
              return e.attr("aria-disabled", !1), e;
            },
            onEnterKey: function(e) {
              13 === e.keyCode &&
                (a(e.target).is(b.params.nextButton)
                  ? (b.onClickNext(e),
                    b.isEnd
                      ? b.a11y.notify(b.params.lastSlideMessage)
                      : b.a11y.notify(b.params.nextSlideMessage))
                  : a(e.target).is(b.params.prevButton) &&
                    (b.onClickPrev(e),
                    b.isBeginning
                      ? b.a11y.notify(b.params.firstSlideMessage)
                      : b.a11y.notify(b.params.prevSlideMessage)),
                a(e.target).is("." + b.params.bulletClass) &&
                  a(e.target)[0].click());
            },
            liveRegion: a(
              '<span class="swiper-notification" aria-live="assertive" aria-atomic="true"></span>'
            ),
            notify: function(e) {
              var a = b.a11y.liveRegion;
              0 !== a.length && (a.html(""), a.html(e));
            },
            init: function() {
              b.params.nextButton &&
                b.nextButton &&
                b.nextButton.length > 0 &&
                (b.a11y.makeFocusable(b.nextButton),
                b.a11y.addRole(b.nextButton, "button"),
                b.a11y.addLabel(b.nextButton, b.params.nextSlideMessage)),
                b.params.prevButton &&
                  b.prevButton &&
                  b.prevButton.length > 0 &&
                  (b.a11y.makeFocusable(b.prevButton),
                  b.a11y.addRole(b.prevButton, "button"),
                  b.a11y.addLabel(b.prevButton, b.params.prevSlideMessage)),
                a(b.container).append(b.a11y.liveRegion);
            },
            initPagination: function() {
              b.params.pagination &&
                b.params.paginationClickable &&
                b.bullets &&
                b.bullets.length &&
                b.bullets.each(function() {
                  var e = a(this);
                  b.a11y.makeFocusable(e),
                    b.a11y.addRole(e, "button"),
                    b.a11y.addLabel(
                      e,
                      b.params.paginationBulletMessage.replace(
                        /{{index}}/,
                        e.index() + 1
                      )
                    );
                });
            },
            destroy: function() {
              b.a11y.liveRegion &&
                b.a11y.liveRegion.length > 0 &&
                b.a11y.liveRegion.remove();
            }
          }),
          (b.init = function() {
            b.params.loop && b.createLoop(),
              b.updateContainerSize(),
              b.updateSlidesSize(),
              b.updatePagination(),
              b.params.scrollbar &&
                b.scrollbar &&
                (b.scrollbar.set(),
                b.params.scrollbarDraggable && b.scrollbar.enableDraggable()),
              "slide" !== b.params.effect &&
                b.effects[b.params.effect] &&
                (b.params.loop || b.updateProgress(),
                b.effects[b.params.effect].setTranslate()),
              b.params.loop
                ? b.slideTo(
                    b.params.initialSlide + b.loopedSlides,
                    0,
                    b.params.runCallbacksOnInit
                  )
                : (b.slideTo(
                    b.params.initialSlide,
                    0,
                    b.params.runCallbacksOnInit
                  ),
                  0 === b.params.initialSlide &&
                    (b.parallax &&
                      b.params.parallax &&
                      b.parallax.setTranslate(),
                    b.lazy &&
                      b.params.lazyLoading &&
                      (b.lazy.load(), (b.lazy.initialImageLoaded = !0)))),
              b.attachEvents(),
              b.params.observer && b.support.observer && b.initObservers(),
              b.params.preloadImages &&
                !b.params.lazyLoading &&
                b.preloadImages(),
              b.params.autoplay && b.startAutoplay(),
              b.params.keyboardControl &&
                b.enableKeyboardControl &&
                b.enableKeyboardControl(),
              b.params.mousewheelControl &&
                b.enableMousewheelControl &&
                b.enableMousewheelControl(),
              b.params.hashnav && b.hashnav && b.hashnav.init(),
              b.params.a11y && b.a11y && b.a11y.init(),
              b.emit("onInit", b);
          }),
          (b.cleanupStyles = function() {
            b.container.removeClass(b.classNames.join(" ")).removeAttr("style"),
              b.wrapper.removeAttr("style"),
              b.slides &&
                b.slides.length &&
                b.slides
                  .removeClass(
                    [
                      b.params.slideVisibleClass,
                      b.params.slideActiveClass,
                      b.params.slideNextClass,
                      b.params.slidePrevClass
                    ].join(" ")
                  )
                  .removeAttr("style")
                  .removeAttr("data-swiper-column")
                  .removeAttr("data-swiper-row"),
              b.paginationContainer &&
                b.paginationContainer.length &&
                b.paginationContainer.removeClass(
                  b.params.paginationHiddenClass
                ),
              b.bullets &&
                b.bullets.length &&
                b.bullets.removeClass(b.params.bulletActiveClass),
              b.params.prevButton &&
                a(b.params.prevButton).removeClass(
                  b.params.buttonDisabledClass
                ),
              b.params.nextButton &&
                a(b.params.nextButton).removeClass(
                  b.params.buttonDisabledClass
                ),
              b.params.scrollbar &&
                b.scrollbar &&
                (b.scrollbar.track &&
                  b.scrollbar.track.length &&
                  b.scrollbar.track.removeAttr("style"),
                b.scrollbar.drag &&
                  b.scrollbar.drag.length &&
                  b.scrollbar.drag.removeAttr("style"));
          }),
          (b.destroy = function(e, a) {
            b.detachEvents(),
              b.stopAutoplay(),
              b.params.scrollbar &&
                b.scrollbar &&
                b.params.scrollbarDraggable &&
                b.scrollbar.disableDraggable(),
              b.params.loop && b.destroyLoop(),
              a && b.cleanupStyles(),
              b.disconnectObservers(),
              b.params.keyboardControl &&
                b.disableKeyboardControl &&
                b.disableKeyboardControl(),
              b.params.mousewheelControl &&
                b.disableMousewheelControl &&
                b.disableMousewheelControl(),
              b.params.a11y && b.a11y && b.a11y.destroy(),
              b.emit("onDestroy"),
              e !== !1 && (b = null);
          }),
          b.init(),
          b
        );
      }
    };
  t.prototype = {
    isSafari: (function() {
      var e = navigator.userAgent.toLowerCase();
      return (
        e.indexOf("safari") >= 0 &&
        e.indexOf("chrome") < 0 &&
        e.indexOf("android") < 0
      );
    })(),
    isUiWebView: /(iPhone|iPod|iPad).*AppleWebKit(?!.*Safari)/i.test(
      navigator.userAgent
    ),
    isArray: function(e) {
      return "[object Array]" === Object.prototype.toString.apply(e);
    },
    browser: {
      ie: window.navigator.pointerEnabled || window.navigator.msPointerEnabled,
      ieTouch:
        (window.navigator.msPointerEnabled &&
          window.navigator.msMaxTouchPoints > 1) ||
        (window.navigator.pointerEnabled && window.navigator.maxTouchPoints > 1)
    },
    device: (function() {
      var e = navigator.userAgent,
        a = e.match(/(Android);?[\s\/]+([\d.]+)?/),
        t = e.match(/(iPad).*OS\s([\d_]+)/),
        r = e.match(/(iPod)(.*OS\s([\d_]+))?/),
        i = !t && e.match(/(iPhone\sOS)\s([\d_]+)/);
      return { ios: t || i || r, android: a };
    })(),
    support: {
      touch:
        (window.Modernizr && Modernizr.touch === !0) ||
        (function() {
          return !!(
            "ontouchstart" in window ||
            (window.DocumentTouch && document instanceof DocumentTouch)
          );
        })(),
      transforms3d:
        (window.Modernizr && Modernizr.csstransforms3d === !0) ||
        (function() {
          var e = document.createElement("div").style;
          return (
            "webkitPerspective" in e ||
            "MozPerspective" in e ||
            "OPerspective" in e ||
            "MsPerspective" in e ||
            "perspective" in e
          );
        })(),
      flexbox: (function() {
        for (
          var e = document.createElement("div").style,
            a = "alignItems webkitAlignItems webkitBoxAlign msFlexAlign mozBoxAlign webkitFlexDirection msFlexDirection mozBoxDirection mozBoxOrient webkitBoxDirection webkitBoxOrient".split(
              " "
            ),
            t = 0;
          t < a.length;
          t++
        )
          if (a[t] in e) return !0;
      })(),
      observer: (function() {
        return (
          "MutationObserver" in window || "WebkitMutationObserver" in window
        );
      })()
    },
    plugins: {}
  };
  for (
    var r = (function() {
        var e = function(e) {
            var a = this,
              t = 0;
            for (t = 0; t < e.length; t++) a[t] = e[t];
            return (a.length = e.length), this;
          },
          a = function(a, t) {
            var r = [],
              i = 0;
            if (a && !t && a instanceof e) return a;
            if (a)
              if ("string" == typeof a) {
                var s,
                  n,
                  o = a.trim();
                if (o.indexOf("<") >= 0 && o.indexOf(">") >= 0) {
                  var l = "div";
                  for (
                    0 === o.indexOf("<li") && (l = "ul"),
                      0 === o.indexOf("<tr") && (l = "tbody"),
                      (0 === o.indexOf("<td") || 0 === o.indexOf("<th")) &&
                        (l = "tr"),
                      0 === o.indexOf("<tbody") && (l = "table"),
                      0 === o.indexOf("<option") && (l = "select"),
                      n = document.createElement(l),
                      n.innerHTML = a,
                      i = 0;
                    i < n.childNodes.length;
                    i++
                  )
                    r.push(n.childNodes[i]);
                } else
                  for (
                    s =
                      t || "#" !== a[0] || a.match(/[ .<>:~]/)
                        ? (t || document).querySelectorAll(a)
                        : [document.getElementById(a.split("#")[1])],
                      i = 0;
                    i < s.length;
                    i++
                  )
                    s[i] && r.push(s[i]);
              } else if (a.nodeType || a === window || a === document)
                r.push(a);
              else if (a.length > 0 && a[0].nodeType)
                for (i = 0; i < a.length; i++) r.push(a[i]);
            return new e(r);
          };
        return (
          (e.prototype = {
            addClass: function(e) {
              if ("undefined" == typeof e) return this;
              for (var a = e.split(" "), t = 0; t < a.length; t++)
                for (var r = 0; r < this.length; r++)
                  this[r].classList.add(a[t]);
              return this;
            },
            removeClass: function(e) {
              for (var a = e.split(" "), t = 0; t < a.length; t++)
                for (var r = 0; r < this.length; r++)
                  this[r].classList.remove(a[t]);
              return this;
            },
            hasClass: function(e) {
              return this[0] ? this[0].classList.contains(e) : !1;
            },
            toggleClass: function(e) {
              for (var a = e.split(" "), t = 0; t < a.length; t++)
                for (var r = 0; r < this.length; r++)
                  this[r].classList.toggle(a[t]);
              return this;
            },
            attr: function(e, a) {
              if (1 === arguments.length && "string" == typeof e)
                return this[0] ? this[0].getAttribute(e) : void 0;
              for (var t = 0; t < this.length; t++)
                if (2 === arguments.length) this[t].setAttribute(e, a);
                else
                  for (var r in e)
                    (this[t][r] = e[r]), this[t].setAttribute(r, e[r]);
              return this;
            },
            removeAttr: function(e) {
              for (var a = 0; a < this.length; a++) this[a].removeAttribute(e);
              return this;
            },
            data: function(e, a) {
              if ("undefined" != typeof a) {
                for (var t = 0; t < this.length; t++) {
                  var r = this[t];
                  r.dom7ElementDataStorage || (r.dom7ElementDataStorage = {}),
                    (r.dom7ElementDataStorage[e] = a);
                }
                return this;
              }
              if (this[0]) {
                var i = this[0].getAttribute("data-" + e);
                return i
                  ? i
                  : this[0].dom7ElementDataStorage &&
                    (e in this[0].dom7ElementDataStorage)
                  ? this[0].dom7ElementDataStorage[e]
                  : void 0;
              }
            },
            transform: function(e) {
              for (var a = 0; a < this.length; a++) {
                var t = this[a].style;
                t.webkitTransform = t.MsTransform = t.msTransform = t.MozTransform = t.OTransform = t.transform = e;
              }
              return this;
            },
            transition: function(e) {
              "string" != typeof e && (e += "ms");
              for (var a = 0; a < this.length; a++) {
                var t = this[a].style;
                t.webkitTransitionDuration = t.MsTransitionDuration = t.msTransitionDuration = t.MozTransitionDuration = t.OTransitionDuration = t.transitionDuration = e;
              }
              return this;
            },
            on: function(e, t, r, i) {
              function s(e) {
                var i = e.target;
                if (a(i).is(t)) r.call(i, e);
                else
                  for (var s = a(i).parents(), n = 0; n < s.length; n++)
                    a(s[n]).is(t) && r.call(s[n], e);
              }
              var n,
                o,
                l = e.split(" ");
              for (n = 0; n < this.length; n++)
                if ("function" == typeof t || t === !1)
                  for (
                    "function" == typeof t &&
                      ((r = arguments[1]), (i = arguments[2] || !1)),
                      o = 0;
                    o < l.length;
                    o++
                  )
                    this[n].addEventListener(l[o], r, i);
                else
                  for (o = 0; o < l.length; o++)
                    this[n].dom7LiveListeners ||
                      (this[n].dom7LiveListeners = []),
                      this[n].dom7LiveListeners.push({
                        listener: r,
                        liveListener: s
                      }),
                      this[n].addEventListener(l[o], s, i);
              return this;
            },
            off: function(e, a, t, r) {
              for (var i = e.split(" "), s = 0; s < i.length; s++)
                for (var n = 0; n < this.length; n++)
                  if ("function" == typeof a || a === !1)
                    "function" == typeof a &&
                      ((t = arguments[1]), (r = arguments[2] || !1)),
                      this[n].removeEventListener(i[s], t, r);
                  else if (this[n].dom7LiveListeners)
                    for (var o = 0; o < this[n].dom7LiveListeners.length; o++)
                      this[n].dom7LiveListeners[o].listener === t &&
                        this[n].removeEventListener(
                          i[s],
                          this[n].dom7LiveListeners[o].liveListener,
                          r
                        );
              return this;
            },
            once: function(e, a, t, r) {
              function i(n) {
                t(n), s.off(e, a, i, r);
              }
              var s = this;
              "function" == typeof a &&
                ((a = !1), (t = arguments[1]), (r = arguments[2])),
                s.on(e, a, i, r);
            },
            trigger: function(e, a) {
              for (var t = 0; t < this.length; t++) {
                var r;
                try {
                  r = new window.CustomEvent(e, {
                    detail: a,
                    bubbles: !0,
                    cancelable: !0
                  });
                } catch (i) {
                  (r = document.createEvent("Event")),
                    r.initEvent(e, !0, !0),
                    (r.detail = a);
                }
                this[t].dispatchEvent(r);
              }
              return this;
            },
            transitionEnd: function(e) {
              function a(s) {
                if (s.target === this)
                  for (e.call(this, s), t = 0; t < r.length; t++)
                    i.off(r[t], a);
              }
              var t,
                r = [
                  "webkitTransitionEnd",
                  "transitionend",
                  "oTransitionEnd",
                  "MSTransitionEnd",
                  "msTransitionEnd"
                ],
                i = this;
              if (e) for (t = 0; t < r.length; t++) i.on(r[t], a);
              return this;
            },
            width: function() {
              return this[0] === window
                ? window.innerWidth
                : this.length > 0
                ? parseFloat(this.css("width"))
                : null;
            },
            outerWidth: function(e) {
              return this.length > 0
                ? e
                  ? this[0].offsetWidth +
                    parseFloat(this.css("margin-right")) +
                    parseFloat(this.css("margin-left"))
                  : this[0].offsetWidth
                : null;
            },
            height: function() {
              return this[0] === window
                ? window.innerHeight
                : this.length > 0
                ? parseFloat(this.css("height"))
                : null;
            },
            outerHeight: function(e) {
              return this.length > 0
                ? e
                  ? this[0].offsetHeight +
                    parseFloat(this.css("margin-top")) +
                    parseFloat(this.css("margin-bottom"))
                  : this[0].offsetHeight
                : null;
            },
            offset: function() {
              if (this.length > 0) {
                var e = this[0],
                  a = e.getBoundingClientRect(),
                  t = document.body,
                  r = e.clientTop || t.clientTop || 0,
                  i = e.clientLeft || t.clientLeft || 0,
                  s = window.pageYOffset || e.scrollTop,
                  n = window.pageXOffset || e.scrollLeft;
                return { top: a.top + s - r, left: a.left + n - i };
              }
              return null;
            },
            css: function(e, a) {
              var t;
              if (1 === arguments.length) {
                if ("string" != typeof e) {
                  for (t = 0; t < this.length; t++)
                    for (var r in e) this[t].style[r] = e[r];
                  return this;
                }
                if (this[0])
                  return window
                    .getComputedStyle(this[0], null)
                    .getPropertyValue(e);
              }
              if (2 === arguments.length && "string" == typeof e) {
                for (t = 0; t < this.length; t++) this[t].style[e] = a;
                return this;
              }
              return this;
            },
            each: function(e) {
              for (var a = 0; a < this.length; a++) e.call(this[a], a, this[a]);
              return this;
            },
            html: function(e) {
              if ("undefined" == typeof e)
                return this[0] ? this[0].innerHTML : void 0;
              for (var a = 0; a < this.length; a++) this[a].innerHTML = e;
              return this;
            },
            text: function(e) {
              if ("undefined" == typeof e)
                return this[0] ? this[0].textContent.trim() : null;
              for (var a = 0; a < this.length; a++) this[a].textContent = e;
              return this;
            },
            is: function(t) {
              if (!this[0]) return !1;
              var r, i;
              if ("string" == typeof t) {
                var s = this[0];
                if (s === document) return t === document;
                if (s === window) return t === window;
                if (s.matches) return s.matches(t);
                if (s.webkitMatchesSelector) return s.webkitMatchesSelector(t);
                if (s.mozMatchesSelector) return s.mozMatchesSelector(t);
                if (s.msMatchesSelector) return s.msMatchesSelector(t);
                for (r = a(t), i = 0; i < r.length; i++)
                  if (r[i] === this[0]) return !0;
                return !1;
              }
              if (t === document) return this[0] === document;
              if (t === window) return this[0] === window;
              if (t.nodeType || t instanceof e) {
                for (r = t.nodeType ? [t] : t, i = 0; i < r.length; i++)
                  if (r[i] === this[0]) return !0;
                return !1;
              }
              return !1;
            },
            index: function() {
              if (this[0]) {
                for (var e = this[0], a = 0; null !== (e = e.previousSibling); )
                  1 === e.nodeType && a++;
                return a;
              }
            },
            eq: function(a) {
              if ("undefined" == typeof a) return this;
              var t,
                r = this.length;
              return a > r - 1
                ? new e([])
                : 0 > a
                ? ((t = r + a), new e(0 > t ? [] : [this[t]]))
                : new e([this[a]]);
            },
            append: function(a) {
              var t, r;
              for (t = 0; t < this.length; t++)
                if ("string" == typeof a) {
                  var i = document.createElement("div");
                  for (i.innerHTML = a; i.firstChild; )
                    this[t].appendChild(i.firstChild);
                } else if (a instanceof e)
                  for (r = 0; r < a.length; r++) this[t].appendChild(a[r]);
                else this[t].appendChild(a);
              return this;
            },
            prepend: function(a) {
              var t, r;
              for (t = 0; t < this.length; t++)
                if ("string" == typeof a) {
                  var i = document.createElement("div");
                  for (
                    i.innerHTML = a, r = i.childNodes.length - 1;
                    r >= 0;
                    r--
                  )
                    this[t].insertBefore(
                      i.childNodes[r],
                      this[t].childNodes[0]
                    );
                } else if (a instanceof e)
                  for (r = 0; r < a.length; r++)
                    this[t].insertBefore(a[r], this[t].childNodes[0]);
                else this[t].insertBefore(a, this[t].childNodes[0]);
              return this;
            },
            insertBefore: function(e) {
              for (var t = a(e), r = 0; r < this.length; r++)
                if (1 === t.length) t[0].parentNode.insertBefore(this[r], t[0]);
                else if (t.length > 1)
                  for (var i = 0; i < t.length; i++)
                    t[i].parentNode.insertBefore(this[r].cloneNode(!0), t[i]);
            },
            insertAfter: function(e) {
              for (var t = a(e), r = 0; r < this.length; r++)
                if (1 === t.length)
                  t[0].parentNode.insertBefore(this[r], t[0].nextSibling);
                else if (t.length > 1)
                  for (var i = 0; i < t.length; i++)
                    t[i].parentNode.insertBefore(
                      this[r].cloneNode(!0),
                      t[i].nextSibling
                    );
            },
            next: function(t) {
              return new e(
                this.length > 0
                  ? t
                    ? this[0].nextElementSibling &&
                      a(this[0].nextElementSibling).is(t)
                      ? [this[0].nextElementSibling]
                      : []
                    : this[0].nextElementSibling
                    ? [this[0].nextElementSibling]
                    : []
                  : []
              );
            },
            nextAll: function(t) {
              var r = [],
                i = this[0];
              if (!i) return new e([]);
              for (; i.nextElementSibling; ) {
                var s = i.nextElementSibling;
                t ? a(s).is(t) && r.push(s) : r.push(s), (i = s);
              }
              return new e(r);
            },
            prev: function(t) {
              return new e(
                this.length > 0
                  ? t
                    ? this[0].previousElementSibling &&
                      a(this[0].previousElementSibling).is(t)
                      ? [this[0].previousElementSibling]
                      : []
                    : this[0].previousElementSibling
                    ? [this[0].previousElementSibling]
                    : []
                  : []
              );
            },
            prevAll: function(t) {
              var r = [],
                i = this[0];
              if (!i) return new e([]);
              for (; i.previousElementSibling; ) {
                var s = i.previousElementSibling;
                t ? a(s).is(t) && r.push(s) : r.push(s), (i = s);
              }
              return new e(r);
            },
            parent: function(e) {
              for (var t = [], r = 0; r < this.length; r++)
                e
                  ? a(this[r].parentNode).is(e) && t.push(this[r].parentNode)
                  : t.push(this[r].parentNode);
              return a(a.unique(t));
            },
            parents: function(e) {
              for (var t = [], r = 0; r < this.length; r++)
                for (var i = this[r].parentNode; i; )
                  e ? a(i).is(e) && t.push(i) : t.push(i), (i = i.parentNode);
              return a(a.unique(t));
            },
            find: function(a) {
              for (var t = [], r = 0; r < this.length; r++)
                for (
                  var i = this[r].querySelectorAll(a), s = 0;
                  s < i.length;
                  s++
                )
                  t.push(i[s]);
              return new e(t);
            },
            children: function(t) {
              for (var r = [], i = 0; i < this.length; i++)
                for (var s = this[i].childNodes, n = 0; n < s.length; n++)
                  t
                    ? 1 === s[n].nodeType && a(s[n]).is(t) && r.push(s[n])
                    : 1 === s[n].nodeType && r.push(s[n]);
              return new e(a.unique(r));
            },
            remove: function() {
              for (var e = 0; e < this.length; e++)
                this[e].parentNode && this[e].parentNode.removeChild(this[e]);
              return this;
            },
            add: function() {
              var e,
                t,
                r = this;
              for (e = 0; e < arguments.length; e++) {
                var i = a(arguments[e]);
                for (t = 0; t < i.length; t++) (r[r.length] = i[t]), r.length++;
              }
              return r;
            }
          }),
          (a.fn = e.prototype),
          (a.unique = function(e) {
            for (var a = [], t = 0; t < e.length; t++)
              -1 === a.indexOf(e[t]) && a.push(e[t]);
            return a;
          }),
          a
        );
      })(),
      i = ["jQuery", "Zepto", "Dom7"],
      s = 0;
    s < i.length;
    s++
  )
    window[i[s]] && e(window[i[s]]);
  var n;
  (n =
    "undefined" == typeof r ? window.Dom7 || window.Zepto || window.jQuery : r),
    n &&
      ("transitionEnd" in n.fn ||
        (n.fn.transitionEnd = function(e) {
          function a(s) {
            if (s.target === this)
              for (e.call(this, s), t = 0; t < r.length; t++) i.off(r[t], a);
          }
          var t,
            r = [
              "webkitTransitionEnd",
              "transitionend",
              "oTransitionEnd",
              "MSTransitionEnd",
              "msTransitionEnd"
            ],
            i = this;
          if (e) for (t = 0; t < r.length; t++) i.on(r[t], a);
          return this;
        }),
      "transform" in n.fn ||
        (n.fn.transform = function(e) {
          for (var a = 0; a < this.length; a++) {
            var t = this[a].style;
            t.webkitTransform = t.MsTransform = t.msTransform = t.MozTransform = t.OTransform = t.transform = e;
          }
          return this;
        }),
      "transition" in n.fn ||
        (n.fn.transition = function(e) {
          "string" != typeof e && (e += "ms");
          for (var a = 0; a < this.length; a++) {
            var t = this[a].style;
            t.webkitTransitionDuration = t.MsTransitionDuration = t.msTransitionDuration = t.MozTransitionDuration = t.OTransitionDuration = t.transitionDuration = e;
          }
          return this;
        })),
    (window.Swiper = t);
})(),
  "undefined" != typeof module
    ? (module.exports = window.Swiper)
    : "function" == typeof define &&
      define.amd &&
      define([], function() {
        "use strict";
        return window.Swiper;
      });
$(document).ready(function() {
  jQuery(".front .Tabs .board .nav li:last").addClass("active");
  jQuery(".front .Tabs .board .nav li:last a").attr("aria-expanded", "true");
  jQuery(".front .Tabs .active.about").removeClass("active");
  jQuery(".front .Tabs .tab-pane.in.active").removeClass("active in");
  jQuery(".front .Tabs #home").addClass("active in");
  jQuery("#thunder-calculater-form").hide();
  var reged_check = jQuery("input[name=citizen_reg]").prop("checked");
  var single_check = jQuery("input[name=citizen_type]").prop("checked");
  jQuery(".display_form").change(function() {
    var reg_yes = jQuery("#reg_yes").prop("checked");
    var reg_no = jQuery("#reg_no").prop("checked");
    var type_single = jQuery("#type_single").prop("checked");
    var type_parent = jQuery("#type_parent").prop("checked");
    if ((reg_yes || reg_no) && (type_single || type_parent)) {
      jQuery("#thunder-calculater-form").show();
    }
  });
  jQuery("input[name=citizen_reg]").change(function() {
    var optreg = jQuery(this).val();
    console.log(optreg);
    if (optreg == "yes") {
      jQuery(".form-item-terms").show();
      jQuery("#edit-terms-1")
        .prop("checked", false)
        .change();
      jQuery("#edit-terms-2")
        .prop("checked", false)
        .change();
    } else {
      jQuery(".form-item-terms").hide();
      jQuery("#edit-terms-1")
        .prop("checked", true)
        .change();
      jQuery("#edit-terms-2")
        .prop("checked", true)
        .change();
    }
  });
  jQuery("input[name=citizen_type]").change(function() {
    var opt = jQuery(this).val();
    console.log(opt);
    if (opt == "single") {
      jQuery("#type_single_tip").show();
      jQuery("#type_parent_tip").hide();
      jQuery(".form-item-income label")
        .text("أدخل مجموع دخلك")
        .append(
          ' <span class="form-required" title="هذا الحقل ضروري.">*</span>'
        );
      jQuery("#hh_income").prop("placeholder", "");
      jQuery(".form-item-adults-dependents").hide();
      jQuery(".form-item-adults-dependents input").val(0);
      jQuery(".form-item-non-adults").hide();
      jQuery(".form-item-non-adults input").val(0);
    } else {
      jQuery("#type_single_tip").hide();
      jQuery("#type_parent_tip").show();
      jQuery(".form-item-income label")
        .text("أدخل مجموع دخل الأسرة")
        .append(
          ' <span class="form-required" title="هذا الحقل ضروري.">*</span>'
        );
      jQuery("#hh_income").prop(
        "placeholder",
        "يشمل الدخل الخاص برب الأسرة والزوجة والأبناء"
      );
      jQuery(".form-item-adults-dependents").show();
      jQuery(".form-item-adults-dependents input").val(null);
      jQuery(".form-item-non-adults").show();
      jQuery(".form-item-non-adults input").val(null);
    }
  });
  jQuery("#edit-terms-1, #edit-terms-2").change(function() {
    if (
      jQuery("#edit-terms-1").prop("checked") &&
      jQuery("#edit-terms-2").prop("checked")
    ) {
      jQuery("button.btn-calculate").prop("disabled", false);
    } else {
      jQuery("button.btn-calculate").prop("disabled", true);
    }
  });
  jQuery("#calculate_happiness").click(function() {
    var adults = parseInt(jQuery(".form-item-adults-dependents input").val());
    var nonadults = parseInt(jQuery(".form-item-non-adults input").val());
    var sum = adults + nonadults + 1;
    jQuery("#edit-famsize").val(sum);
  });
  jQuery(".ContactSite #SerachBlock").click(function() {
    jQuery(".searchForm").slideToggle();
  });
  var HomeSlider = new Swiper(".HomeSlider .swiper-container", {
    nextButton: ".HomeSlider .swiper-button-next",
    prevButton: ".HomeSlider .swiper-button-prev",
    parallax: true,
    autoplay: 5000,
    speed: 1500,
    watchSlidesProgress: true,
    watchVisibility: true
  });
  var mediaImages = new Swiper(".mediaImages .swiper-container", {
    slidesPerView: 1,
    paginationClickable: true,
    nextButton: ".mediaImages .swiper-button-prev",
    prevButton: ".mediaImages .swiper-button-next",
    speed: 700
  });
  var mediaInfograph2 = new Swiper(".mediaInfograph2 .swiper-container", {
    slidesPerView: 1,
    paginationClickable: true,
    nextButton: ".mediaInfograph2 .swiper-button-prev",
    prevButton: ".mediaInfograph2 .swiper-button-next",
    speed: 700
  });
  var mediaInfograph1 = new Swiper(".mediaInfograph1 .swiper-container", {
    slidesPerView: 2,
    paginationClickable: true,
    nextButton: ".mediaInfograph1 .swiper-button-prev",
    prevButton: ".mediaInfograph1 .swiper-button-next",
    speed: 700
  });
  var mediaVedio = new Swiper(".mediaVedio .swiper-container", {
    slidesPerView: 2,
    paginationClickable: true,
    spaceBetween: 20,
    nextButton: ".mediaVedio .swiper-button-prev",
    prevButton: ".mediaVedio .swiper-button-next",
    breakpoints: {
      640: { slidesPerView: 1, spaceBetweenSlides: 30 },
      1200: { slidesPerView: 2, spaceBetweenSlides: 30 }
    }
  });
  new WOW().init();
  jQuery(function(jQuery) {
    jQuery.fn.fontResize = function(options) {
      var increaseCount = 0;
      var self = this;
      var changeFont = function(element, amount) {
        var baseFontSize = parseInt(element.css("font-size"), 10);
        var baseLineHeight = parseInt(element.css("line-height"), 10);
        element.css("font-size", baseFontSize + amount + "px");
        element.css("line-height", baseLineHeight + amount + "px");
      };
      options.increaseBtn.on("click", function(e) {
        e.preventDefault();
        if (increaseCount === 5) {
          return;
        }
        self.each(function(index, element) {
          changeFont(jQuery(element), 2);
        });
        increaseCount++;
      });
      options.decreaseBtn.on("click", function(e) {
        e.preventDefault();
        if (increaseCount === 0) {
          return;
        }
        self.each(function(index, element) {
          changeFont(jQuery(element), -2);
        });
        increaseCount--;
      });
    };
  });
  jQuery(function() {
    jQuery(".box-body").fontResize({
      increaseBtn: jQuery("#text_resize_increase"),
      decreaseBtn: jQuery("#text_resize_decrease")
    });
  });
  jQuery("#bookmark-this").click(function(e) {
    var bookmarkURL = window.location.href;
    var bookmarkTitle = document.title;
    var triggerDefault = false;
    if (window.sidebar && window.sidebar.addPanel) {
      window.sidebar.addPanel(bookmarkTitle, bookmarkURL, "");
    } else if (
      (window.sidebar &&
        navigator.userAgent.toLowerCase().indexOf("firefox") > -1) ||
      (window.opera && window.print)
    ) {
      var $this = jQuery(this);
      $this.attr("href", bookmarkURL);
      $this.attr("title", bookmarkTitle);
      $this.attr("rel", "sidebar");
      $this.off(e);
      triggerDefault = true;
    } else if (window.external && "AddFavorite" in window.external) {
      window.external.AddFavorite(bookmarkURL, bookmarkTitle);
    } else {
      alert(
        "Press " +
          (navigator.userAgent.toLowerCase().indexOf("mac") != -1
            ? "Cmd"
            : "Ctrl") +
          "+D to bookmark this page."
      );
    }
    return triggerDefault;
  });
});
("use strict");
function numberWithCommas(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
function HappinessCalculator(ad, nad, hhi) {
  this.adults_dependents = ad;
  this.non_adults_dependents = nad;
  this.hh_income = hhi;
  this.getData = function(pro) {
    if (this.hasOwnProperty(pro)) {
      return this[pro];
    }
    return false;
  };
  this.setData = function(pro, val) {
    if (this.hasOwnProperty(pro)) {
      this[pro] = val;
    }
  };
  this.get_hh_ent_equ_factor = function() {
    return (
      HapCalConfig.ent_equ_hoh_scale_factor +
      HapCalConfig.ent_equ_adult_dependent_scale_factor *
        this.adults_dependents +
      HapCalConfig.ent_equ_non_adult_dependent_scale_factor *
        this.non_adults_dependents
    ).toFixed(2);
  };
  this.get_hh_thr_equ_factor = function() {
    return (
      HapCalConfig.thr_equ_hoh_scale_factor +
      HapCalConfig.thr_equ_adult_dependent_scale_factor *
        this.adults_dependents +
      HapCalConfig.thr_equ_non_adult_dependent_scale_factor *
        this.non_adults_dependents
    ).toFixed(2);
  };
  this.get_full_ent_hh_size = function() {
    return HapCalConfig.ent_core_value * this.get_hh_ent_equ_factor();
  };
  this.get_tapering_thr_hh_size = function() {
    return HapCalConfig.ent_tapering_threshold * this.get_hh_thr_equ_factor();
  };
  this.get_taper_rate_hh_size = function() {
    return parseFloat(
      HapCalConfig.ent_core_value /
        (HapCalConfig.ent_zero_entitlement_threshold -
          HapCalConfig.ent_tapering_threshold)
    ).toFixed(14);
  };
  this.get_min_ent_hh_size = function() {
    return HapCalConfig.ent_minimum_entitlement;
  };
  this.get_max_ent_hh_size = function() {
    return HapCalConfig.ent_maximum_entitlement;
  };
  this.get_exc_income_above_thr = function() {
    return this.hh_income - this.get_tapering_thr_hh_size();
  };
  this.get_entitlment_amount = function() {
    var result = 0;
    result =
      Math.round(
        this.get_exc_income_above_thr() <= 0
          ? Math.min(this.get_full_ent_hh_size(), this.get_max_ent_hh_size())
          : this.get_exc_income_above_thr() * this.get_taper_rate_hh_size() >
            this.get_full_ent_hh_size()
          ? 0
          : this.get_full_ent_hh_size() -
              this.get_exc_income_above_thr() * this.get_taper_rate_hh_size() <
            this.get_min_ent_hh_size()
          ? this.get_min_ent_hh_size()
          : Math.min(
              this.get_full_ent_hh_size() -
                this.get_exc_income_above_thr() * this.get_taper_rate_hh_size(),
              this.get_max_ent_hh_size()
            )
      ) === 0
        ? 0
        : Math.max(
            Math.round(
              this.get_exc_income_above_thr() <= 0
                ? Math.min(
                    this.get_max_ent_hh_size(),
                    this.get_full_ent_hh_size()
                  )
                : this.get_exc_income_above_thr() *
                    this.get_taper_rate_hh_size() >
                  this.get_full_ent_hh_size()
                ? 0
                : this.get_full_ent_hh_size() -
                    this.get_exc_income_above_thr() *
                      this.get_taper_rate_hh_size() <
                  this.get_min_ent_hh_size()
                ? this.get_min_ent_hh_size()
                : Math.min(
                    this.get_full_ent_hh_size() -
                      this.get_exc_income_above_thr() *
                        this.get_taper_rate_hh_size(),
                    this.get_max_ent_hh_size()
                  )
            ),
            300
          );
    return result;
  };
}
function HappinessCalculatorDep(ad, nad) {
  this.adults_dependents = ad;
  this.non_adults_dependents = nad;
  this.getData = function(pro) {
    if (this.hasOwnProperty(pro)) {
      return this[pro];
    }
    return false;
  };
  this.setData = function(pro, val) {
    if (this.hasOwnProperty(pro)) {
      this[pro] = val;
    }
  };
  var get_hh_ent_equ_factor = (
    HapCalConfig.ent_equ_hoh_scale_factor +
    HapCalConfig.ent_equ_adult_dependent_scale_factor * this.adults_dependents +
    HapCalConfig.ent_equ_non_adult_dependent_scale_factor *
      this.non_adults_dependents
  ).toFixed(2);
  var get_hh_thr_equ_factor = (
    HapCalConfig.thr_equ_hoh_scale_factor +
    HapCalConfig.thr_equ_adult_dependent_scale_factor * this.adults_dependents +
    HapCalConfig.thr_equ_non_adult_dependent_scale_factor *
      this.non_adults_dependents
  ).toFixed(2);
  var get_full_ent_hh_size =
    HapCalConfig.ent_core_value * get_hh_ent_equ_factor;
  var get_tapering_thr_hh_size =
    HapCalConfig.ent_tapering_threshold * get_hh_thr_equ_factor;
  var get_taper_rate_hh_size = parseFloat(
    HapCalConfig.ent_core_value /
      (HapCalConfig.ent_zero_entitlement_threshold -
        HapCalConfig.ent_tapering_threshold)
  ).toFixed(14);
  var get_hh_thr_equ_factor = (
    HapCalConfig.thr_equ_hoh_scale_factor +
    HapCalConfig.thr_equ_adult_dependent_scale_factor * this.adults_dependents +
    HapCalConfig.thr_equ_non_adult_dependent_scale_factor *
      this.non_adults_dependents
  ).toFixed(2);
  var get_max = HapCalConfig.ent_tapering_threshold * get_hh_thr_equ_factor;
  this.get_max = function() {
    return HapCalConfig.ent_tapering_threshold * get_hh_thr_equ_factor;
  };
  this.get_limit = function() {
    return Math.round(
      parseFloat(get_full_ent_hh_size / get_taper_rate_hh_size) + get_max - 2
    );
  };
}
jQuery(document).ready(function($) {
  $("#calculation-input-form").on("submit", function(e) {
    e.preventDefault();
    return false;
  });
  function calculateHappiness() {
    var adults_dependents = $("#adults_dependents").val();
    var non_adults_dependents = $("#non_adults_dependents").val();
    var hh_income = $("#hh_income").val();
    if (!adults_dependents || !non_adults_dependents || !hh_income) {
      $("#calculation-input-form .form-error").slideDown();
      return;
    }
    $("#calculation-input-form .form-error").slideUp();
    var HaCal = new HappinessCalculator(
      adults_dependents,
      non_adults_dependents,
      hh_income
    );
    $("#get_hh_ent_equ_factor").html(HaCal.get_hh_ent_equ_factor());
    $("#get_hh_thr_equ_factor").html(HaCal.get_hh_thr_equ_factor());
    $("#get_full_ent_hh_size").html(
      numberWithCommas(HaCal.get_full_ent_hh_size())
    );
    $("#get_tapering_thr_hh_size").html(
      numberWithCommas(HaCal.get_tapering_thr_hh_size())
    );
    $("#get_taper_rate_hh_size").html(
      Math.round(HaCal.get_taper_rate_hh_size()) + "%"
    );
    $("#get_min_ent_hh_size").html(HaCal.get_min_ent_hh_size());
    $("#get_max_ent_hh_size").html(
      numberWithCommas(HaCal.get_max_ent_hh_size())
    );
    $("#get_exc_income_above_thr").html(
      numberWithCommas(HaCal.get_exc_income_above_thr())
    );
    $("#get_entitlment_amount").html(
      numberWithCommas(HaCal.get_entitlment_amount())
    );
    var income = jQuery("#get_exc_income_above_thr").text();
    var amount = jQuery("#get_entitlment_amount").text();
    var newIncome = income.replace(",", "");
    var newAmount = amount.replace(",", "");
    var postfix = "";
    jQuery("#edit-total").val(amount + " ريال");
  }
  function calculateHappinessDep() {
    var adults_dependents = $("#adults_dependents").val();
    var non_adults_dependents = $("#non_adults_dependents").val();
    if (!adults_dependents || !non_adults_dependents) {
      $("#calculation-input-form .form-error").slideDown();
      return;
    }
    $("#calculation-input-form .form-error").slideUp();
    var HaCalDep = new HappinessCalculatorDep(
      adults_dependents,
      non_adults_dependents
    );
    $("#edit-get-max").val(HaCalDep.get_max());
    $("#edit-get-limit").val(HaCalDep.get_limit());
  }
  $(document).on(
    "click",
    "#calculation-input-form #calculate_happiness",
    function(e) {
      e.preventDefault();
      e.stopPropagation();
      calculateHappiness();
      calculateHappinessDep();
      if (
        jQuery("#adults_dependents").val() == "" ||
        jQuery("#adults_dependents").val() < 0
      ) {
        jQuery("#adults_dependents").addClass("warning");
        jQuery(".form-error").removeClass("hidden");
      } else {
        jQuery("#adults_dependents").removeClass("warning");
      }
      if (
        jQuery("#non_adults_dependents").val() == "" ||
        jQuery("#non_adults_dependents").val() < 0
      ) {
        jQuery("#non_adults_dependents").addClass("warning");
        jQuery(".form-error").removeClass("hidden");
      } else {
        jQuery("#non_adults_dependents").removeClass("warning");
      }
      if (jQuery("#hh_income").val() == "" || jQuery("#hh_income").val() < 0) {
        jQuery("#hh_income").addClass("warning");
        jQuery(".form-error").removeClass("hidden");
      } else {
        jQuery("#hh_income").removeClass("warning");
      }
      if (
        jQuery("#hh_income").val() != "" &&
        jQuery("#adults_dependents").val() != "" &&
        jQuery("#non_adults_dependents").val() != ""
      ) {
        jQuery(".form-error").addClass("hidden");
      }
    }
  );
});
jQuery(document).ready(function() {
  jQuery("#adults_dependents , #non_adults_dependents").on(
    "change keyup paste",
    function() {
      if (jQuery("#adults_dependents").val().length > 2) {
        jQuery("#adults_dependents").val(
          jQuery("#adults_dependents")
            .val()
            .substr(0, 2)
        );
      }
      if (jQuery("#non_adults_dependents").val().length > 2) {
        jQuery("#non_adults_dependents").val(
          jQuery("#non_adults_dependents")
            .val()
            .substr(0, 2)
        );
      }
    }
  );
  jQuery("#hh_income").on("change keyup paste", function() {
    if (jQuery("#hh_income").val().length > 6) {
      jQuery("#hh_income").val(
        jQuery("#hh_income")
          .val()
          .substr(0, 6)
      );
    }
  });
});
(function($) {
  $.fn.menumaker = function(options) {
    var cssmenu = $(this),
      settings = $.extend(
        { title: "القائمة الرئيسية", format: "dropdown", sticky: false },
        options
      );
    return this.each(function() {
      cssmenu.prepend('<div id="menu-button">' + settings.title + "</div>");
      $(this)
        .find("#menu-button")
        .on("click", function() {
          $(this).toggleClass("menu-opened");
          var mainmenu = $(this).next("ul");
          if (mainmenu.hasClass("open")) {
            mainmenu.hide().removeClass("open");
          } else {
            mainmenu.show().addClass("open");
            if (settings.format === "dropdown") {
              mainmenu.find("ul").show();
            }
          }
        });
      cssmenu
        .find("li ul")
        .parent()
        .addClass("has-sub");
      var multiTg;
      multiTg = function() {
        cssmenu
          .find(".has-sub")
          .prepend('<span class="submenu-button"></span>');
        cssmenu.find(".submenu-button").on("click", function() {
          $(this).toggleClass("submenu-opened");
          if (
            $(this)
              .siblings("ul")
              .hasClass("open")
          ) {
            $(this)
              .siblings("ul")
              .removeClass("open")
              .hide();
          } else {
            $(this)
              .siblings("ul")
              .addClass("open")
              .show();
          }
        });
      };
      if (settings.format === "multitoggle") multiTg();
      else cssmenu.addClass("dropdown");
      if (settings.sticky === true) cssmenu.css("position", "fixed");
      var resizeFix;
      resizeFix = function() {
        if ($(window).width() > 768) {
          cssmenu.find("ul").show();
        }
        if ($(window).width() <= 768) {
          cssmenu
            .find("ul")
            .hide()
            .removeClass("open");
        }
      };
      resizeFix();
      return $(window).on("resize", resizeFix);
    });
  };
})(jQuery);
(function($) {
  $(document).ready(function() {
    $("#cssmenu").menumaker({ title: "القائمة", format: "multitoggle" });
  });
})(jQuery);
/*!
 * jQuery Cookie Plugin v1.4.1
 * https://github.com/carhartl/jquery-cookie
 *
 * Copyright 2006, 2014 Klaus Hartl
 * Released under the MIT license
 */ (function(factory) {
  if (typeof define === "function" && define.amd) {
    define(["jquery"], factory);
  } else if (typeof exports === "object") {
    module.exports = factory(require("jquery"));
  } else {
    factory(jQuery);
  }
})(function($) {
  var pluses = /\+/g;
  function encode(s) {
    return config.raw ? s : encodeURIComponent(s);
  }
  function decode(s) {
    return config.raw ? s : decodeURIComponent(s);
  }
  function stringifyCookieValue(value) {
    return encode(config.json ? JSON.stringify(value) : String(value));
  }
  function parseCookieValue(s) {
    if (s.indexOf('"') === 0) {
      s = s
        .slice(1, -1)
        .replace(/\\"/g, '"')
        .replace(/\\\\/g, "\\");
    }
    try {
      s = decodeURIComponent(s.replace(pluses, " "));
      return config.json ? JSON.parse(s) : s;
    } catch (e) {}
  }
  function read(s, converter) {
    var value = config.raw ? s : parseCookieValue(s);
    return $.isFunction(converter) ? converter(value) : value;
  }
  var config = ($.cookie = function(key, value, options) {
    if (arguments.length > 1 && !$.isFunction(value)) {
      options = $.extend({}, config.defaults, options);
      if (typeof options.expires === "number") {
        var days = options.expires,
          t = (options.expires = new Date());
        t.setMilliseconds(t.getMilliseconds() + days * 864e5);
      }
      return (document.cookie = [
        encode(key),
        "=",
        stringifyCookieValue(value),
        options.expires ? "; expires=" + options.expires.toUTCString() : "",
        options.path ? "; path=" + options.path : "",
        options.domain ? "; domain=" + options.domain : "",
        options.secure ? "; secure" : ""
      ].join(""));
    }
    var result = key ? undefined : {},
      cookies = document.cookie ? document.cookie.split("; ") : [],
      i = 0,
      l = cookies.length;
    for (; i < l; i++) {
      var parts = cookies[i].split("="),
        name = decode(parts.shift()),
        cookie = parts.join("=");
      if (key === name) {
        result = read(cookie, value);
        break;
      }
      if (!key && (cookie = read(cookie)) !== undefined) {
        result[name] = cookie;
      }
    }
    return result;
  });
  config.defaults = {};
  $.removeCookie = function(key, options) {
    $.cookie(key, "", $.extend({}, options, { expires: -1 }));
    return !$.cookie(key);
  };
});
