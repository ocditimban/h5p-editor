var H5PEditor = H5PEditor || {};

/**
 * Construct a none from library semantics.
 */
H5PEditor.None = (function ($) {
  
  /**
   * Create a field without html
   * 
   * @param {mixed} parent
   * @param {object} field
   * @param {mixed} params
   * @param {function} setValue
   */
  function WidgetNone(parent, field, params, setValue) {
    this.parent = parent;
    this.field = field;
    this.params = params;
    this.setValue = setValue;
  };

  /**
   * Implementation of appendTo
   * 
   * None doesn't append anything
   * 
   * @param {jQuery} $wrapper
   */
  WidgetNone.prototype.appendTo = function ($wrapper) {
  };

  /**
   * Implementation of validate
   * 
   * None allways validates
   */
  WidgetNone.prototype.validate = function () {
    return true;
  };

  /**
   * Collect functions to execute once the tree is complete.
   * 
   * @param {function} ready
   */
  WidgetNone.prototype.ready = function (ready) {
    this.parent.ready(ready);
  };

  /**
   * Remove this item.
   */
  WidgetNone.prototype.remove = function () {
    removeChildren(this.children);
  };

  ns.widgets.none = WidgetNone;
});
