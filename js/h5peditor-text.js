var H5PEditor = H5PEditor || {};

H5PEditor.Text = (function ($, H5P) {

  /**
   * Create a text field for the form.
   *
   * @param {mixed} parent
   * @param {Object} field
   * @param {mixed} params
   * @param {function} setValue
   * @returns {ns.Text}
   */
  function WidgetText(parent, field, params, setValue) {
    this.field = field;
    this.value = params;
    this.setValue = setValue;
    this.changeCallbacks = [];
  };

  /**
   * Append field to wrapper.
   *
   * @param {type} $wrapper
   * @returns {undefined}
   */
  WidgetText.prototype.appendTo = function ($wrapper) {
    var that = this;

    this.$item = $(this.createHtml()).appendTo($wrapper);
    this.$input = this.$item.children('label').children('input');
    this.$errors = this.$item.children('.h5p-errors');

    this.$input.change(function () {
      // Validate
      var value = that.validate();

      if (value !== false) {
        // Set param
        if (H5P.trim(value) === '') {
          // Avoid storing empty strings. (will be valid if field is optional)
          delete that.value;
          that.setValue(that.field);
        }
        else {
          that.value = value;
          that.setValue(that.field, H5PEditor.htmlspecialchars(value));
        }

        for (var i = 0; i < that.changeCallbacks.length; i++) {
          that.changeCallbacks[i](value);
        }
      }
    });
  };

  /**
   * Run callback when value changes.
   *
   * @param {function} callback
   * @returns {Number|@pro;length@this.changeCallbacks}
   */
  WidgetText.prototype.change = function (callback) {
    this.changeCallbacks.push(callback);
    callback();

    return this.changeCallbacks.length - 1;
  };

  /**
   * Create HTML for the text field.
   */
  WidgetText.prototype.createHtml = function (callback) {
    var input = H5PEditor.createText(this.value, this.field.maxLength, this.field.placeholder);
    var label = H5PEditor.createLabel(this.field, input);

    return H5PEditor.createItem(this.field.type, label, this.field.description);
  };

  /**
   * Validate the current text field.
   */
  WidgetText.prototype.validate = function () {
    var that = this;

    var value = H5P.trim(this.$input.val());

    if ((that.field.optional === undefined || !that.field.optional) && !value.length) {
      this.$errors.append(H5PEditor.createError(H5PEditor.t('core', 'requiredProperty', {':property': 'text field'})));
    }
    else if (value.length > this.field.maxLength) {
      this.$errors.append(H5PEditor.createError(H5PEditor.t('core', 'tooLong', {':max': this.field.maxLength})));
    }
    else if (this.field.regexp !== undefined && value.length && !value.match(new RegExp(this.field.regexp.pattern, this.field.regexp.modifiers))) {
      this.$errors.append(H5PEditor.createError(H5PEditor.t('core', 'invalidFormat')));
    }

    return H5PEditor.checkErrors(this.$errors, this.$input, value);
  };

  /**
   * Remove this item.
   */
  WidgetText.prototype.remove = function () {
    this.$item.remove();
  };

}(jQuery, H5P));

// Tell the editor what widget we are.
H5PEditor.widgets.text = H5PEditor.Text;
