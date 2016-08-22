tui.util.defineNamespace("fedoc.content", {});
fedoc.content["extensions_mark_viewOnlyMarkerHelper.js.html"] = "      <div id=\"main\" class=\"main\">\n\n\n\n    \n    <section>\n        <article>\n            <pre class=\"prettyprint source linenums\"><code>/**\n * @fileoverview Implements viewOnly marker helper for additional information\n * @author Sungho Kim(sungho-kim@nhnent.com) FE Development Team/NHN Ent.\n */\n\n'use strict';\n\nvar domUtils = require('../../domUtils');\n\nvar FIND_CRLF_RX = /(\\n)|(\\r\\n)|(\\r)/g;\n\n/**\n * ViewOnlyMarkerHelper\n * @exports ViewOnlyMarkerHelper\n * @constructor\n * @class\n * @param {Preview} preview preview instance\n */\nfunction ViewOnlyMarkerHelper(preview) {\n    this.preview = preview;\n}\n\n/**\n * getTextContent\n * Get text content of wysiwyg\n * @returns {string}\n */\nViewOnlyMarkerHelper.prototype.getTextContent = function() {\n    return this.preview.$el[0].textContent.replace(FIND_CRLF_RX, '');\n};\n\n/**\n * updateMarkerWithExtraInfo\n * Update marker with extra info of preview\n * @param {object} marker marker\n * @returns {object} marker\n */\nViewOnlyMarkerHelper.prototype.updateMarkerWithExtraInfo = function(marker) {\n    var foundNode, markerRange, info;\n\n    foundNode = this._findOffsetNode([marker.start, marker.end]);\n\n    markerRange = document.createRange();\n\n    markerRange.setStart(foundNode[0].container, foundNode[0].offsetInContainer);\n    markerRange.setEnd(foundNode[1].container, foundNode[1].offsetInContainer);\n\n    info = this._getExtraInfoOfRange(markerRange);\n\n    marker.text = info.text;\n    marker.top = info.top;\n    marker.left = info.left;\n    marker.height = info.height;\n\n    return marker;\n};\n\n/**\n * _getExtraInfoOfRange\n * Get extra info of range\n * @param {Range} range range\n * @returns {object} extra info\n */\nViewOnlyMarkerHelper.prototype._getExtraInfoOfRange = function(range) {\n    var text, top, left, rect, containerOffset, height, node, parentNode;\n\n    text = range.cloneContents().textContent.replace(FIND_CRLF_RX, '');\n\n    range.setStart(range.endContainer, range.endOffset);\n    range.collapse(true);\n\n    rect = range.getBoundingClientRect();\n\n    if (rect &amp;&amp; !rect.top) {\n        node = document.createElement('SPAN');\n        node.textContent = '\\u200B';\n        range.endContainer.parentNode.insertBefore(node, range.endContainer);\n        rect = node.getBoundingClientRect();\n        parentNode = node.parentNode;\n        parentNode.removeChild(node);\n    }\n\n    if (rect) {\n        containerOffset = this.preview.$el.offset();\n        top = rect.top + this.preview.$el.scrollTop() - containerOffset.top + $('body').scrollTop();\n        left = rect.left - containerOffset.left;\n        height = rect.height;\n    } else {\n        height = top = left = 0;\n    }\n\n    return {\n        text: text,\n        top: top,\n        left: left,\n        height: height\n    };\n};\n\n/**\n * getRange\n * get current range\n * @returns {Range}\n */\nfunction getRange() {\n    var selection = window.getSelection();\n    var range;\n\n    if (selection &amp;&amp; selection.rangeCount) {\n        range = selection.getRangeAt(0).cloneRange();\n    } else {\n        range = document.createRange();\n        range.selectNodeContents(this.preview.$el[0]);\n        range.collapse(true);\n    }\n\n    return range;\n}\n\n/**\n * getMarkerInfoOfCurrentSelection\n * Get marker info of current selection\n * @returns {object} marker\n */\nViewOnlyMarkerHelper.prototype.getMarkerInfoOfCurrentSelection = function() {\n    var range, beforeRange, start, end, info, isRangeInContent;\n\n    range = getRange();\n\n    isRangeInContent = $.contains(this.preview.$el[0], range.commonAncestorContainer);\n\n    if (isRangeInContent &amp;&amp; this._extendRangeToTextNodeIfHasNone(range)) {\n        beforeRange = range.cloneRange();\n        beforeRange.setStart(this.preview.$el[0], 0);\n        beforeRange.setEnd(range.startContainer, range.startOffset);\n\n        info = this._getExtraInfoOfRange(range);\n\n        start = beforeRange.cloneContents().textContent.length;\n        end = start + info.text.length;\n\n        return {\n            start: start,\n            end: end,\n            text: info.text,\n            top: info.top,\n            left: info.left,\n            height: info.height\n        };\n    }\n\n    return null;\n};\n\n/**\n * _extendRangeToTextNodeIfHasNone\n * Extend range to text node if start or end container have none\n * Containers of range should be text node\n * @param {Range} range range\n * @returns {boolean} success or fail\n */\nViewOnlyMarkerHelper.prototype._extendRangeToTextNodeIfHasNone = function(range) {\n    var endNode = domUtils.getChildNodeByOffset(range.endContainer, range.endOffset),\n        textNode;\n\n    if (!domUtils.isTextNode(range.endContainer)) {\n        if (domUtils.isTextNode(endNode)) {\n            range.setEnd(endNode, 0);\n        } else {\n            textNode = domUtils.getPrevTextNode(endNode);\n            if (textNode) {\n                range.setEnd(textNode, textNode.length);\n            } else {\n                return false;\n            }\n        }\n    }\n\n    return true;\n};\n\n/**\n * _findOffsetNode\n * Find offset nodes by given offset list\n * @param {Array.&lt;number>} offsetlist offset list\n * @returns {Array.&lt;object>} offset node informations\n */\nViewOnlyMarkerHelper.prototype._findOffsetNode = function(offsetlist) {\n    return domUtils.findOffsetNode(this.preview.$el[0], offsetlist, function(text) {\n        return text.replace(FIND_CRLF_RX, '');\n    });\n};\n\n/**\n * selectOffsetRange\n * Make selection with given offset range\n * @param {number} start start offset\n * @param {number} end end offset\n */\nViewOnlyMarkerHelper.prototype.selectOffsetRange = function(start, end) {\n    var foundNode = this._findOffsetNode([start, end]),\n        range = document.createRange(),\n        sel = window.getSelection();\n\n    range.setStart(foundNode[0].container, foundNode[0].offsetInContainer);\n    range.setEnd(foundNode[1].container, foundNode[1].offsetInContainer);\n\n    sel.removeAllRanges();\n    sel.addRange(range);\n};\n\n/**\n * clearSelect\n * Clear selection\n */\nViewOnlyMarkerHelper.prototype.clearSelect = function() {\n    window.getSelection().removeAllRanges();\n};\n\nmodule.exports = ViewOnlyMarkerHelper;\n</code></pre>\n        </article>\n    </section>\n\n\n\n</div>\n\n"