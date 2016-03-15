var H5PEditor = H5PEditor || {};

/**
  * Adds a dimensions field to the form.
  *
  * TODO: Make it possible to lock width/height ratio.
  *
  * @param {mixed} parent
  * @param {object} field
  * @param {mixed} params
  * @param {function} setValue
  * @returns {ns.Dimensions}
  */
H5PEditor.Dimensions = (function ($, H5P) {
  
  function WidgetDimensions(parent, field, params, setValue) {
    var that = this;

    this.parent = parent;
    this.field = field;
    this.changes = [];

    // Find image field to get max size from.
    H5PEditor.followField(parent, field.max, function (file) {
      that.setMax(file);
    });

    // Find image field to get default size from.
    H5PEditor.followField(parent, field['default'], function (file, index) {
      // Make sure we don't set size if we have one in the default params.
      if (params.width === undefined) {
        that.setSize(file);
      }
    });

    this.params = params;
    this.setValue = setValue;

    // Remove default field from params to avoid saving it.
    if (this.params.field) {
      this.params.field = undefined;
    }
  }
  
  /**
    * Set max dimensions.
    *
    * @param {Object} file
    * @returns {unresolved}
    */
  WidgetDimensions.prototype.setMax = function (file) {
    if (file === undefined) {
      return;
    }

    this.max = {
      width: parseInt(file.width),
      height: parseInt(file.height)
    };
  };

  /**
   * Set current dimensions.
   *
   * @param {string} width
   * @param {string} height
   * @returns {undefined}
   */
  WidgetDimensions.prototype.setSize = function (file) {
    if (file === undefined) {
      return;
    }

    this.params = {
      width: parseInt(file.width),
      height: parseInt(file.height)
    };
    this.setValue(this.field, this.params);

    this.$inputs.filter(':eq(0)').val(file.width).next().val(file.height);

    for (var i = 0; i < this.changes.length; i++) {
      this.changes[i](file.width, file.height);
    }
  };

  /**
   * Append the field to the given wrapper.
   *
   * @param {jQuery} $wrapper
   * @returns {undefined}
   */
  WidgetDimensions.prototype.appendTo = function ($wrapper) {
    var that = this;

    this.$item = $(this.createHtml()).appendTo($wrapper);
    this.$inputs = this.$item.find('input');
    this.$errors = this.$item.children('.h5p-errors');

    this.$inputs.change(function () {
      // Validate
      var value = that.validate();

      if (value) {
        // Set param
        that.params = value;
        that.setValue(that.field, value);

        for (var i = 0; i < that.changes.length; i++) {
          that.changes[i](value.width, value.height);
        }
      }
    }).click(function () {
      return false;
    });
  };

  /**
   * Create HTML for the field.
   */
  WidgetDimensions.prototype.createHtml = function () {
    var input = H5PEditor.createText(this.params !== undefined ? this.params.width : undefined, 15, 'Width') + ' x ' + H5PEditor.createText(this.params !== undefined ? this.params.height : undefined, 15, 'Height');
    var label = H5PEditor.createLabel(this.field, input);

    return H5PEditor.createItem(this.field.widget, label, this.field.description, this.field.description);
  };

  /**
   * Validate the current text field.
   */
  WidgetDimensions.prototype.validate = function () {
    var that = this;
    var size = {};

    this.$errors.html('');

    this.$inputs.each(function (i) {
      var $input = $(this);
      var value = H5P.trim($input.val());
      var property = i ? 'height' : 'width';

      if ((that.field.optional === undefined || !that.field.optional) && !value.length) {
        that.$errors.append(H5PEditor.createError(H5PEditor.t('core', 'requiredProperty', {':property': property})));
        return false;
      }
      else if (!value.match(new RegExp('^[0-9]+$'))) {
        that.$errors.append(H5PEditor.createError(H5PEditor.t('core', 'onlyNumbers', {':property': property})));
        return false;
      }

      value = parseInt(value);
      if (that.max !== undefined && value > that.max[property]) {
        that.$errors.append(H5PEditor.createError(H5PEditor.t('core', 'exceedsMax', {':property': property, ':max': that.max[property]})));
        return false;
      }

      size[property] = value;
    });

    return H5PEditor.checkErrors(this.$errors, this.$inputs, size);
  };

  /**
   * Remove this item.
   */
  WidgetDimensions.prototype.remove = function () {
    this.$item.remove();
  };
  
  return WidgetDimensions;
  
}(jQuery, H5P));

H5PEditor.widgets.dimensions = H5PEditor.Dimensions;
