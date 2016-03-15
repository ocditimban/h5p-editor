var H5PEditor = H5PEditor || {};

/**
  * Adds a file upload field to the form.
  *
  * @param {mixed} parent
  * @param {object} field
  * @param {mixed} params
  * @param {function} setValue
  * @returns {ns.File}
  */
H5PEditor.File = (function ($, H5P) {
  
  function WidgetFile = function (parent, field, params, setValue) {
    var self = this;

    this.parent = parent;
    this.field = field;
    this.params = params;
    this.setValue = setValue;
    this.library = parent.library + '/' + field.name;

    if (params !== undefined) {
      this.copyright = params.copyright;
    }

    this.changes = [];
    this.passReadies = true;
    parent.ready(function () {
      self.passReadies = false;
    });
  };
  
  /**
   * Append field to the given wrapper.
   *
   * @param {jQuery} $wrapper
   * @returns {undefined}
   */
  WidgetFile.prototype.appendTo = function ($wrapper) {
    var self = this;
    this.addIframe();

    var label = '';
    if (this.field.label !== 0) {
      label = '<span class="h5peditor-label">' + (this.field.label === undefined ? this.field.name : this.field.label) + '</span>';
    }

    var html = H5PEditor.createItem(this.field.type, label + '<div class="file"></div><a class="h5p-copyright-button" href="#">' + H5PEditor.t('core', 'editCopyright') + '</a><div class="h5p-editor-dialog"><a href="#" class="h5p-close" title="' + H5PEditor.t('core', 'close') + '"></a></div>', this.field.description);

    var $container = $(html).appendTo($wrapper);
    this.$file = $container.find('.file');
    this.$errors = $container.find('.h5p-errors');
    this.addFile();

    var $dialog = $container.find('.h5p-editor-dialog');
    $container.find('.h5p-copyright-button').add($dialog.find('.h5p-close')).click(function () {
      $dialog.toggleClass('h5p-open');
      return false;
    });

    var group = new H5PEditor.widgets.group(self, H5PEditor.copyrightSemantics, self.copyright, function (field, value) {
      if (self.params !== undefined) {
        self.params.copyright = value;
      }
      self.copyright = value;
    });
    group.appendTo($dialog);
    group.expand();
    group.$group.find('.title').remove();
    this.children = [group];
  };


  /**
   * Sync copyright between all video files.
   *
   * @returns {undefined}
   */
  WidgetFile.prototype.setCopyright = function (value) {
    this.copyright = this.params.copyright = value;
  };


  /**
   * Creates thumbnail HTML and actions.
   *
   * @returns {Boolean}
   */
  WidgetFile.prototype.addFile = function () {
    var that = this;

    if (this.params === undefined) {
      this.$file.html('<a href="#" class="add" title="' + H5PEditor.t('core', 'addFile') + '"></a>').children('.add').click(function () {
        that.uploadFile();
        return false;
      });
      return;
    }

    var thumbnail;
    if (this.field.type === 'image') {
      thumbnail = {};
      thumbnail.path = H5P.getPath(this.params.path, H5PEditor.contentId),
      thumbnail.height = 100;
      if (this.params.width !== undefined) {
        thumbnail.width = thumbnail.height * (this.params.width / this.params.height);
      }
    }
    else {
      thumbnail = H5PEditor.fileIcon;
    }

    this.$file.html('<a href="#" title="' + H5PEditor.t('core', 'changeFile') + '" class="thumbnail"><img ' + (thumbnail.width === undefined ? '' : ' width="' + thumbnail.width + '"') + 'height="' + thumbnail.height + '" alt="' + (this.field.label === undefined ? '' : this.field.label) + '"/><a href="#" class="remove" title="' + H5PEditor.t('core', 'removeFile') + '"></a></a>').children(':eq(0)').click(function () {
      that.uploadFile();
      return false;
    }).children('img').attr('src', thumbnail.path).end().next().click(function (e) {
      if (!confirm(H5PEditor.t('core', 'confirmRemoval', {':type': 'file'}))) {
        return false;
      }
      delete that.params;
      that.setValue(that.field);
      that.addFile();

      for (var i = 0; i < that.changes.length; i++) {
        that.changes[i]();
      }

      return false;
    });
  };

  /**
   * Start a new upload.
   */
  WidgetFile.prototype.uploadFile = function () {
    var that = this;

    if (this.$file === 0) {
      return; // Wait for our turn :)
    }

    this.$errors.html('');

    this.changeCallback = function () {
      that.$file.html('<div class="h5peditor-uploading h5p-throbber">' + H5PEditor.t('core', 'uploading') + '</div>');
    };

    this.callback = function (err, result) {
      try {
        if (err) {
          throw err;
        }

        that.params = {
          path: result.path,
          mime: result.mime,
          copyright: that.copyright
        };
        if (that.field.type === 'image') {
          that.params.width = result.width;
          that.params.height = result.height;
        }

        that.setValue(that.field, that.params);

        for (var i = 0; i < that.changes.length; i++) {
          that.changes[i](that.params);
        }
      }
      catch (error) {
        that.$errors.append(H5PEditor.createError(error));
      }

      that.addFile();
    };

    if (this.field.mimes !== undefined) {
      var mimes = '';
      for (var i = 0; i < this.field.mimes.length; i++) {
        if (mimes !== '') {
          mimes += ',';
        }
        mimes += this.field.mimes[i];
      }
      this.$file.attr('accept', mimes);
    }
    else if (this.field.type === 'image') {
      this.$file.attr('accept', 'image/jpeg,image/png,image/gif');
    }

    this.$field.val(JSON.stringify(this.field));
    this.$file.click();
  };

  /**
   * Validate this item
   */
  WidgetFile.prototype.validate = function () {
    return true;
  };

  /**
   * Remove this item.
   */
  WidgetFile.prototype.remove = function () {
    // TODO: Check what happens when removed during upload.
    this.$file.parent().remove();
  };

  /**
   * Collect functions to execute once the tree is complete.
   *
   * @param {function} ready
   * @returns {undefined}
   */
  WidgetFile.prototype.ready = function (ready) {
    if (this.passReadies) {
      this.parent.ready(ready);
    }
    else {
      ready();
    }
  };

  /**
   * Add the iframe we use for uploads.
   */
  WidgetFile.prototype.addIframe = function () {
    if (this.iframeLoaded !== undefined) {
      return;
    }
    this.iframeLoaded = true;

    // Prevent trying to parse first load event.
    var initialized = false;

    // All editor uploads share this iframe to conserve valuable resources.
    $('<iframe id="h5peditor-uploader"></iframe>').load(function (data) {
      var $body = $(this).contents().find('body');

      if (initialized) {
        // Try to read response
        var response, error;
        try {
          response = JSON.parse($body.text());
          if (response.error) {
            error = response.error;
          }
        }
        catch (err) {
          H5P.error(err);
          error = H5PEditor.t('core', 'fileToLarge');
        }

        // Trigger callback if set.
        if (this.callback !== undefined) {
          if (error) {
            this.callback(H5PEditor.t('core', 'uploadError') + ': ' + error);
          }
          else {
            this.callback(undefined, response);
          }
        }
      }
      else {
        initialized = true;
      }

      $body.html('');
      var $form = $('<form method="post" enctype="multipart/form-data" action="' + H5PEditor.getAjaxUrl('files') + '"><input name="file" type="file"/><input name="field" type="hidden"/><input name="contentId" type="hidden" value="' + (H5PEditor.contentId === undefined ? 0 : H5PEditor.contentId) + '"/></form>').appendTo($body);

      this.$field = $form.children('input[name="field"]');
      this.$file = $form.children('input[name="file"]');

      this.$file.change(function () {
        if (this.changeCallback !== undefined) {
          this.changeCallback();
        }
        this.$field = 0;
        this.$file = 0;
        $form.submit();
      });

    }).appendTo('body');
  };
  
  return WidgetFile;
  
}(jQuery, H5P));

H5PEditor.widgets.file = H5PEditor.File;
H5PEditor.widgets.image = H5PEditor.File;
