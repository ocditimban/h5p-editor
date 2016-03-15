var H5PEditor = H5PEditor || {};

H5PEditor.Boolean = (function ($) {
  function WidgetBoolean (parent, field, params, setValue) {
    if (params === undefined) {
      this.value = false;
      setValue(field, this.value);
    }
    else {
      this.value = params;
    }

    this.field = field;
    this.setValue = setValue;
  };

  WidgetBoolean.prototype.createHtml = function () {
    var input = '<input type="checkbox"';
    if (this.value !== undefined && this.value) {
      input += ' checked="checked"';
    }
    input += '/>';

    var html = '<label class="h5peditor-label">' + input;
    if (this.field.label !== 0) {
      html += this.field.label === undefined ? this.field.name : this.field.label;
    }
    html += '</label>';

    return H5PEditor.createItem(this.field.type, html, this.field.description);
  };

  /**
   * "Validate" the current boolean field.
   */
  WidgetBoolean.prototype.validate = function () {
    return true;
  };

  /**
   * Append the boolean field to the given wrapper.
   *
   * @param {jQuery} $wrapper
   * @returns {undefined}
   */
  WidgetBoolean.prototype.appendTo = function ($wrapper) {
    var that = this;

    this.$item = $(this.createHtml()).appendTo($wrapper);
    this.$input = this.$item.children('label').children('input');
    this.$errors = this.$item.children('.h5p-errors');

    this.$input.change(function () {
      // Validate
      that.value = that.$input.is(':checked') ? true : false;
      that.setValue(that.field, that.value);
    });
  };

  /**
   * Remove this item.
   */
  WidgetBoolean.prototype.remove = function () {
    this.$item.remove();
  };

  return WidgetBoolean;
  
}(jQuery));

H5PEditor.widgets.boolean = H5PEditor.Boolean;
