var H5PEditor = H5PEditor || {};

/**
  * Create a group of fields.
  *
  * @param {mixed} parent
  * @param {object} field
  * @param {mixed} params
  * @param {function} setValue
  * @returns {ns.Group}
  */
H5PEditor.Group = (function ($, H5P) {
  
  /**
   * Create a group of fields.
   *
   * @param {mixed} parent
   * @param {object} field
   * @param {mixed} params
   * @param {function} setValue
   * @returns {ns.Group}
   */
  function WidgetGroup(parent, field, params, setValue) {
    H5P.EventDispatcher.call(this);

    if (field.label === undefined) {
      field.label = field.name;
    }
    else if (field.label === 0) {
      field.label = '';
    }

    this.parent = parent;
    this.passReadies = true;
    this.params = params;
    this.setValue = setValue;
    this.library = parent.library + '/' + field.name;

    if (field.deprecated !== undefined && field.deprecated) {
      this.field = H5P.cloneObject(field, true);
      var empties = 0;
      for (var i = 0; i < this.field.fields.length; i++) {
        var f = this.field.fields[i];
        if (params !== undefined && params[f.name] === '') {
          delete params[f.name];
        }
        if (params === undefined || params[f.name] === undefined) {
          f.widget = 'none';
          empties++;
        }
      }
      if (i === empties) {
        this.field.fields = [];
      }
    }
    else {
      this.field = field;
    }

    if (this.field.optional === true) {
      // If this field is optional, make sure child fields are aswell
      for (var j = 0; j < this.field.fields.length; j++) {
        this.field.fields[j].optional = true;
      }
    }
  }

  // Extends the event dispatcher
  WidgetGroup.prototype = Object.create(H5P.EventDispatcher.prototype);
  WidgetGroup.prototype.constructor = WidgetGroup;
  
  /**
   * Append group to its wrapper.
   *
   * @param {jQuery} $wrapper
   * @returns {undefined}
   */
  WidgetGroup.prototype.appendTo = function ($wrapper) {
    var that = this;

    if (this.field.fields.length === 0) {
      // No fields or all are deprecated
      this.setValue(this.field);
      return;
    }

    // Add fieldset wrapper for group
    this.$group = $('<fieldset/>', {
      'class': 'field group',
      appendTo: $wrapper
    });

    // Add title expand/collapse button
    $('<div/>', {
      'class': 'title',
      title: H5PEditor.t('core', 'expandCollapse'),
      role: 'button',
      tabIndex: 0,
      on: {
        click: function () {
          that.toggle();
        },
        keypress: function (event) {
          if ((event.charCode || event.keyCode) === 32) {
            that.toggle();
          }
        }
      },
      appendTo: this.$group
    });

    // Add content container
    var $content = $('<div/>', {
      'class': 'content',
      appendTo: this.$group
    });

    if (this.field.fields.length === 1) {
      $content.addClass('h5peditor-single');
      this.children = [];
      var field = this.field.fields[0];
      var widget = field.widget === undefined ? field.type : field.widget;
      this.children[0] = new H5PEditor.widgets[widget](this, field, this.params, function (field, value) {
        that.setValue(that.field, value);
      });
      this.children[0].appendTo($content);
    }
    else {
      if (this.params === undefined) {
        this.params = {};
        this.setValue(this.field, this.params);
      }
      H5PEditor.processSemanticsChunk(this.field.fields, this.params, $content, this);
    }

    // Set summary
    this.findSummary();

    // Check if group should be expanded.
    // Default is to be collapsed unless explicity defined in semantics by optional attribute expanded
    if (this.field.expanded === true) {
      this.expand();
    }
  };

  /**
   * Toggle expand/collapse for the given group.
   */
  WidgetGroup.prototype.toggle = function () {
    if (this.$group.hasClass('expanded')) {
      this.collapse();
    }
    else {
      this.expand();
    }
  };

  /**
   * Expand the given group.
   */
  WidgetGroup.prototype.expand = function () {
    this.$group.addClass('expanded');
    this.trigger('expanded');
  };

  /**
   * Collapse the given group (if valid)
   */
  WidgetGroup.prototype.collapse = function () {
    // Do not collapse before valid!
    var valid = true;
    for (var i = 0; i < this.children.length; i++) {
      if (this.children[i].validate() === false) {
        valid = false;
      }
    }
    if (valid) {
      this.$group.removeClass('expanded');
      this.trigger('collapsed');
    }
  };

  /**
   * Find summary to display in group header.
   */
  WidgetGroup.prototype.findSummary = function () {
    var that = this;
    var summary;
    for (var j = 0; j < this.children.length; j++) {
      var child = this.children[j];
      if (child.field === undefined) {
        continue;
      }
      var params = this.field.fields.length === 1 ? this.params : this.params[child.field.name];
      var widget = H5PEditor.getWidgetName(child.field);

      if (widget === 'text') {
        if (params !== undefined && params !== '') {
          summary = params.replace(/(<([^>]+)>)/ig, "");
        }

        child.$input.change(function () {
          var params = that.field.fields.length === 1 ? that.params : that.params[child.field.name];
          if (params !== undefined && params !== '') {
            that.setSummary(params.replace(/(<([^>]+)>)/ig, ""));
          }
        });
        break;
      }
      else if (widget === 'library') {
        if (params !== undefined) {
          summary = child.$select.children(':selected').text();
        }
        child.change(function (library) {
          that.setSummary(library.title);
        });
        break;
      }
    }
    this.setSummary(summary);
  };

  /**
   * Set the given group summary.
   *
   * @param {string} summary
   * @returns {undefined}
   */
  WidgetGroup.prototype.setSummary = function (summary) {
    var summaryText;

    // Parse html
    var summaryTextNode = $.parseHTML(summary);

    if (summaryTextNode !== null) {
      summaryText = summaryTextNode[0].nodeValue;
    }

    if (summaryText !== undefined) {
      summaryText = this.field.label + ': ' + (summaryText.length > 48 ? summaryText.substr(0, 45) + '...' : summaryText);
    }
    else {
      summaryText = this.field.label;
    }

    this.$group.children('.title').html(summaryText);
  };

  /**
   * Validate all children.
   */
  WidgetGroup.prototype.validate = function () {
    var valid = true;

    if (this.children !== undefined) {
      for (var i = 0; i < this.children.length; i++) {
        if (this.children[i].validate() === false) {
          valid = false;
        }
      }
    }

    return valid;
  };

  /**
   * Allows ancestors and widgets to do stuff with our children.
   *
   * @public
   * @param {Function} task
   */
  WidgetGroup.prototype.forEachChild = function (task) {
    for (var i = 0; i < this.children.length; i++) {
      task(this.children[i], i);
    }
  };

  /**
   * Collect functions to execute once the tree is complete.
   *
   * @param {function} ready
   * @returns {undefined}
   */
  WidgetGroup.prototype.ready = function (ready) {
    this.parent.ready(ready);
  };

  /**
   * Remove this item.
   */
  WidgetGroup.prototype.remove = function () {
    if (this.$group !== undefined) {
      H5PEditor.removeChildren(this.children);
      this.$group.remove();
    }
  };
  
  return WidgetGroup;
  
}(jQuery, H5P));

H5PEditor.widgets.group = H5PEditor.Group;
