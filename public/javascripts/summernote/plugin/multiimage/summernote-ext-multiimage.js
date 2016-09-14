(function (factory) {
  /* global define */
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['jquery'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // Node/CommonJS
    module.exports = factory(require('jquery'));
  } else {
    // Browser globals
    factory(window.jQuery);
  }
}(function ($) {

  // Extends plugins for adding hello.
  //  - plugin is external module for customizing.
  $.extend($.summernote.plugins, {
    /**
     * @param {Object} context - context object has status of editor.
     */
    'multiimage': function (context) {
      var self = this;

      // ui has renders to build ui elements.
      //  - you can create a button with `ui.button`
      var ui = $.summernote.ui;

      // add hello button
      context.memo('button.multiimage', function () {
        // create button
        var button = ui.button({
          contents: '<i class="fa fa-child"/> Images',
          tooltip: 'multi images upload',
          click: function () {

              KindEditor.ready(function(K) {
				var editor = K.editor({
					allowFileManager : true
				});
				editor.loadPlugin('multiimage', function() {
						editor.plugin.multiImageDialog({
							clickFn : function(urlList) {
								$.each(urlList, function(i, data) {
                                    context.invoke('editor.insertText', '<img src="' + data.url + '">');
								});
								editor.hideDialog();
							}
						});
					});
			});
            // invoke insertText method with 'hello' on editor module.
            
          }
        });

        // create jQuery object from button instance.
        var $multiimage = button.render();
        return $multiimage;
      });

      // This events will be attached when editor is initialized.
      this.events = {
        // This will be called after modules are initialized.
        'summernote.init': function (we, e) {
          console.log('summernote initialized', we, e);
        },
        // This will be called when user releases a key on editable.
        'summernote.keyup': function (we, e) {
          console.log('summernote keyup', we, e);
        }
      };

      // This method will be called when editor is initialized by $('..').summernote();
      // You can create elements for plugin
      this.initialize = function () {
      };

      // This methods will be called when editor is destroyed by $('..').summernote('destroy');
      // You should remove elements on `initialize`.
      this.destroy = function () {
      };
    }
  });
}));
