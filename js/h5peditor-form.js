var H5PEditor = H5PEditor || {};

/**
  * Construct a form from library semantics.
  */
H5PEditor.Form = (function ($) {
  
  function WidgetForm() {
    var self = this;

    this.params = {};
    this.passReadies = false;
    this.commonFields = {};
    this.$form = $('<div class="h5peditor-form"><div class="tree"></div><div class="common collapsed hidden"><div class="h5peditor-label"><span class="icon"></span>' + H5PEditor.t('core', 'commonFields') + '</div><div class="fields"><p class="desc">' + H5PEditor.t('core', 'commonFieldsDescription') + '</p></div></div></div>');
    this.$common = this.$form.find('.common > .fields');
    this.library = '';

    this.$common.prev().click(function () {
      self.$common.parent().toggleClass('collapsed');
    });
  };
  
  /**
   * Replace the given element with our form.
   *
   * @param {jQuery} $element
   * @returns {undefined}
   */
  WidgetForm.prototype.replace = function ($element) {
    $element.replaceWith(this.$form);
    this.offset = this.$form.offset();
    // Prevent inputs and selects in an h5peditor form from submitting the main
    // framework form.
    this.$form.on('keydown', 'input,select', function (event) {
      if (event.keyCode === 13) {
        // Prevent enter key from submitting form.
        return false;
      }
    });
  };

  /**
   * Remove the current form.
   */
  WidgetForm.prototype.remove = function () {
    this.$form.remove();
  };

  /**
   * Wrapper for processing the semantics.
   *
   * @param {Array} semantics
   * @param {Object} defaultParams
   * @returns {undefined}
   */
  WidgetForm.prototype.processSemantics = function (semantics, defaultParams) {
    this.params = defaultParams;
    H5PEditor.processSemanticsChunk(semantics, this.params, this.$form.children('.tree'), this);
  };

  /**
   * Collect functions to execute once the tree is complete.
   *
   * @param {function} ready
   * @returns {undefined}
   */
  WidgetForm.prototype.ready = function (ready) {
    this.readies.push(ready);
  };
  
  return WidgetForm;
  
}(jQuery));



