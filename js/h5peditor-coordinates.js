var H5PEditor = H5PEditor || {};

/**
 * Creates a coordinates picker for the form.
 *
 * @param {mixed} parent
 * @param {object} field
 * @param {mixed} params
 * @param {function} setValue
 * @returns {ns.Coordinates}
 */
H5PEditor.Coordinates = (function ($, H5P) {
  
  function WidgetCoordinates(parent, field, params, setValue) {
    var that = this;

    this.parent = parent;
    this.field = H5P.cloneObject(field, true); // TODO: Cloning is a quick fix, make sure this field doesn't change semantics!

    // Find image field to get max size from.
    // TODO: Use followField?
    this.findImageField('max', function (field) {
      if (field instanceof H5PEditor.File) {
        if (field.params !== undefined) {
          that.setMax(field.params.width, field.params.height);
        }

        field.changes.push(function (file) {
          if (file === undefined) {
            return;
          }
          // TODO: This callback should be removed when this item is removed.
          that.setMax(file.params.width, file.params.height);
        });
      }
      else if (field instanceof H5PEditor.Dimensions) {
        if (field.params !== undefined) {
          that.setMax(field.params.width, field.params.height);
        }

        field.changes.push(function (width, height) {
          // TODO: This callback should be removed when this item is removed.
          that.setMax(width, height);
        });
      }
    });

    this.params = params;
    this.setValue = setValue;
  }
  
  WidgetCoordinates.prototype.setMax = function (x, y) {
    this.field.max = {
      x: parseInt(x),
      y: parseInt(y)
    };
    if (this.params !== undefined) {
      this.$errors.html('');
      this.validate();
    }
  };

  /**
   * Find the image field for the given property and then run the callback.
   *
   * @param {string} property
   * @param {function} callback
   * @returns {unresolved}
   */
  WidgetCoordinates.prototype.findImageField = function (property, callback) {
    var that = this;
    var str = 'string';

    if (typeof this.field[property] !== str) {
      return;
    }

    // Find field when tree is ready.
    this.parent.ready(function () {
      if (typeof that.field[property] !== str) {
        if (that.field[property] !== undefined) {
          callback(that.field[property]);
        }
        return; // We've already found this field before.
      }
      var path = that.field[property];

      that.field[property] = H5PEditor.findField(that.field[property], that.parent);
      if (!that.field[property]) {
        throw H5PEditor.t('core', 'unknownFieldPath', {':path': path});
      }
      if (that.field[property].field.type !== 'image' && that.field[property].field.widget !== 'dimensions') {
        throw H5PEditor.t('core', 'notImageOrDimensionsField', {':path': path});
      }

      callback(that.field[property]);
    });
  };

  /**
   * Append the field to the wrapper.
   *
   * @param {jQuery} $wrapper
   * @returns {undefined}
   */
  WidgetCoordinates.prototype.appendTo = function ($wrapper) {
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
      }
    }).click(function () {
      return false;
    }).click(function () {
      return false;
    });
  };

  /**
   * Create HTML for the coordinates picker.
   */
  WidgetCoordinates.prototype.createHtml = function () {
    var input = H5PEditor.createText(this.params !== undefined ? this.params.x : undefined, 15, 'X') + ' , ' + H5PEditor.createText(this.params !== undefined ? this.params.y : undefined, 15, 'Y');
    var label = H5PEditor.createLabel(this.field, input);

    return H5PEditor.createItem(this.field.widget, label, this.field.description);
  };

  /**
   * Validate the current values.
   */
  WidgetCoordinates.prototype.validate = function () {
    var that = this;
    var coordinates = {};

    this.$inputs.each(function (i) {
      var $input = $(this);
      var value = H5P.trim($input.val());
      var property = i ? 'y' : 'x';

      if (that.field.optional && !value.length) {
        return true;
      }

      if ((that.field.optional === undefined || !that.field.optional) && !value.length) {
        that.$errors.append(H5PEditor.createError(H5PEditor.t('core', 'requiredProperty', {':property': property})));
        return false;
      }

      if (value.length && !value.match(new RegExp('^[0-9]+$'))) {
        that.$errors.append(H5PEditor.createError(H5PEditor.t('core', 'onlyNumbers', {':property': property})));
        return false;
      }

      value = parseInt(value);
      if (that.field.max !== undefined && value > that.field.max[property]) {
        that.$errors.append(H5PEditor.createError(H5PEditor.t('core', 'exceedsMax', {':property': property, ':max': that.field.max[property]})));
        return false;
      }

      coordinates[property] = value;
    });

    return H5PEditor.checkErrors(this.$errors, this.$inputs, coordinates);
  };

  /**
   * Remove this item.
   */
  WidgetCoordinates.prototype.remove = function () {
    this.$item.remove();
  };
  
  return WidgetCoordinates;
  
}(jQuery, H5P));

H5PEditor.widgets.coordinates = H5PEditor.Coordinates;
