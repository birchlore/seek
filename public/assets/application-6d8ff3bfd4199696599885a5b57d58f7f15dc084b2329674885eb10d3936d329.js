(function($, undefined) {

/**
 * Unobtrusive scripting adapter for jQuery
 * https://github.com/rails/jquery-ujs
 *
 * Requires jQuery 1.8.0 or later.
 *
 * Released under the MIT license
 *
 */

  // Cut down on the number of issues from people inadvertently including jquery_ujs twice
  // by detecting and raising an error when it happens.
  'use strict';

  if ( $.rails !== undefined ) {
    $.error('jquery-ujs has already been loaded!');
  }

  // Shorthand to make it a little easier to call public rails functions from within rails.js
  var rails;
  var $document = $(document);

  $.rails = rails = {
    // Link elements bound by jquery-ujs
    linkClickSelector: 'a[data-confirm], a[data-method], a[data-remote], a[data-disable-with], a[data-disable]',

    // Button elements bound by jquery-ujs
    buttonClickSelector: 'button[data-remote]:not(form button), button[data-confirm]:not(form button)',

    // Select elements bound by jquery-ujs
    inputChangeSelector: 'select[data-remote], input[data-remote], textarea[data-remote]',

    // Form elements bound by jquery-ujs
    formSubmitSelector: 'form',

    // Form input elements bound by jquery-ujs
    formInputClickSelector: 'form input[type=submit], form input[type=image], form button[type=submit], form button:not([type]), input[type=submit][form], input[type=image][form], button[type=submit][form], button[form]:not([type])',

    // Form input elements disabled during form submission
    disableSelector: 'input[data-disable-with]:enabled, button[data-disable-with]:enabled, textarea[data-disable-with]:enabled, input[data-disable]:enabled, button[data-disable]:enabled, textarea[data-disable]:enabled',

    // Form input elements re-enabled after form submission
    enableSelector: 'input[data-disable-with]:disabled, button[data-disable-with]:disabled, textarea[data-disable-with]:disabled, input[data-disable]:disabled, button[data-disable]:disabled, textarea[data-disable]:disabled',

    // Form required input elements
    requiredInputSelector: 'input[name][required]:not([disabled]),textarea[name][required]:not([disabled])',

    // Form file input elements
    fileInputSelector: 'input[type=file]:not([disabled])',

    // Link onClick disable selector with possible reenable after remote submission
    linkDisableSelector: 'a[data-disable-with], a[data-disable]',

    // Button onClick disable selector with possible reenable after remote submission
    buttonDisableSelector: 'button[data-remote][data-disable-with], button[data-remote][data-disable]',

    // Up-to-date Cross-Site Request Forgery token
    csrfToken: function() {
     return $('meta[name=csrf-token]').attr('content');
    },

    // URL param that must contain the CSRF token
    csrfParam: function() {
     return $('meta[name=csrf-param]').attr('content');
    },

    // Make sure that every Ajax request sends the CSRF token
    CSRFProtection: function(xhr) {
      var token = rails.csrfToken();
      if (token) xhr.setRequestHeader('X-CSRF-Token', token);
    },

    // making sure that all forms have actual up-to-date token(cached forms contain old one)
    refreshCSRFTokens: function(){
      $('form input[name="' + rails.csrfParam() + '"]').val(rails.csrfToken());
    },

    // Triggers an event on an element and returns false if the event result is false
    fire: function(obj, name, data) {
      var event = $.Event(name);
      obj.trigger(event, data);
      return event.result !== false;
    },

    // Default confirm dialog, may be overridden with custom confirm dialog in $.rails.confirm
    confirm: function(message) {
      return confirm(message);
    },

    // Default ajax function, may be overridden with custom function in $.rails.ajax
    ajax: function(options) {
      return $.ajax(options);
    },

    // Default way to get an element's href. May be overridden at $.rails.href.
    href: function(element) {
      return element[0].href;
    },

    // Checks "data-remote" if true to handle the request through a XHR request.
    isRemote: function(element) {
      return element.data('remote') !== undefined && element.data('remote') !== false;
    },

    // Submits "remote" forms and links with ajax
    handleRemote: function(element) {
      var method, url, data, withCredentials, dataType, options;

      if (rails.fire(element, 'ajax:before')) {
        withCredentials = element.data('with-credentials') || null;
        dataType = element.data('type') || ($.ajaxSettings && $.ajaxSettings.dataType);

        if (element.is('form')) {
          method = element.attr('method');
          url = element.attr('action');
          data = element.serializeArray();
          // memoized value from clicked submit button
          var button = element.data('ujs:submit-button');
          if (button) {
            data.push(button);
            element.data('ujs:submit-button', null);
          }
        } else if (element.is(rails.inputChangeSelector)) {
          method = element.data('method');
          url = element.data('url');
          data = element.serialize();
          if (element.data('params')) data = data + '&' + element.data('params');
        } else if (element.is(rails.buttonClickSelector)) {
          method = element.data('method') || 'get';
          url = element.data('url');
          data = element.serialize();
          if (element.data('params')) data = data + '&' + element.data('params');
        } else {
          method = element.data('method');
          url = rails.href(element);
          data = element.data('params') || null;
        }

        options = {
          type: method || 'GET', data: data, dataType: dataType,
          // stopping the "ajax:beforeSend" event will cancel the ajax request
          beforeSend: function(xhr, settings) {
            if (settings.dataType === undefined) {
              xhr.setRequestHeader('accept', '*/*;q=0.5, ' + settings.accepts.script);
            }
            if (rails.fire(element, 'ajax:beforeSend', [xhr, settings])) {
              element.trigger('ajax:send', xhr);
            } else {
              return false;
            }
          },
          success: function(data, status, xhr) {
            element.trigger('ajax:success', [data, status, xhr]);
          },
          complete: function(xhr, status) {
            element.trigger('ajax:complete', [xhr, status]);
          },
          error: function(xhr, status, error) {
            element.trigger('ajax:error', [xhr, status, error]);
          },
          crossDomain: rails.isCrossDomain(url)
        };

        // There is no withCredentials for IE6-8 when
        // "Enable native XMLHTTP support" is disabled
        if (withCredentials) {
          options.xhrFields = {
            withCredentials: withCredentials
          };
        }

        // Only pass url to `ajax` options if not blank
        if (url) { options.url = url; }

        return rails.ajax(options);
      } else {
        return false;
      }
    },

    // Determines if the request is a cross domain request.
    isCrossDomain: function(url) {
      var originAnchor = document.createElement('a');
      originAnchor.href = location.href;
      var urlAnchor = document.createElement('a');

      try {
        urlAnchor.href = url;
        // This is a workaround to a IE bug.
        urlAnchor.href = urlAnchor.href;

        // If URL protocol is false or is a string containing a single colon
        // *and* host are false, assume it is not a cross-domain request
        // (should only be the case for IE7 and IE compatibility mode).
        // Otherwise, evaluate protocol and host of the URL against the origin
        // protocol and host.
        return !(((!urlAnchor.protocol || urlAnchor.protocol === ':') && !urlAnchor.host) ||
          (originAnchor.protocol + '//' + originAnchor.host ===
            urlAnchor.protocol + '//' + urlAnchor.host));
      } catch (e) {
        // If there is an error parsing the URL, assume it is crossDomain.
        return true;
      }
    },

    // Handles "data-method" on links such as:
    // <a href="/users/5" data-method="delete" rel="nofollow" data-confirm="Are you sure?">Delete</a>
    handleMethod: function(link) {
      var href = rails.href(link),
        method = link.data('method'),
        target = link.attr('target'),
        csrfToken = rails.csrfToken(),
        csrfParam = rails.csrfParam(),
        form = $('<form method="post" action="' + href + '"></form>'),
        metadataInput = '<input name="_method" value="' + method + '" type="hidden" />';

      if (csrfParam !== undefined && csrfToken !== undefined && !rails.isCrossDomain(href)) {
        metadataInput += '<input name="' + csrfParam + '" value="' + csrfToken + '" type="hidden" />';
      }

      if (target) { form.attr('target', target); }

      form.hide().append(metadataInput).appendTo('body');
      form.submit();
    },

    // Helper function that returns form elements that match the specified CSS selector
    // If form is actually a "form" element this will return associated elements outside the from that have
    // the html form attribute set
    formElements: function(form, selector) {
      return form.is('form') ? $(form[0].elements).filter(selector) : form.find(selector);
    },

    /* Disables form elements:
      - Caches element value in 'ujs:enable-with' data store
      - Replaces element text with value of 'data-disable-with' attribute
      - Sets disabled property to true
    */
    disableFormElements: function(form) {
      rails.formElements(form, rails.disableSelector).each(function() {
        rails.disableFormElement($(this));
      });
    },

    disableFormElement: function(element) {
      var method, replacement;

      method = element.is('button') ? 'html' : 'val';
      replacement = element.data('disable-with');

      element.data('ujs:enable-with', element[method]());
      if (replacement !== undefined) {
        element[method](replacement);
      }

      element.prop('disabled', true);
    },

    /* Re-enables disabled form elements:
      - Replaces element text with cached value from 'ujs:enable-with' data store (created in `disableFormElements`)
      - Sets disabled property to false
    */
    enableFormElements: function(form) {
      rails.formElements(form, rails.enableSelector).each(function() {
        rails.enableFormElement($(this));
      });
    },

    enableFormElement: function(element) {
      var method = element.is('button') ? 'html' : 'val';
      if (typeof element.data('ujs:enable-with') !== 'undefined') element[method](element.data('ujs:enable-with'));
      element.prop('disabled', false);
    },

   /* For 'data-confirm' attribute:
      - Fires `confirm` event
      - Shows the confirmation dialog
      - Fires the `confirm:complete` event

      Returns `true` if no function stops the chain and user chose yes; `false` otherwise.
      Attaching a handler to the element's `confirm` event that returns a `falsy` value cancels the confirmation dialog.
      Attaching a handler to the element's `confirm:complete` event that returns a `falsy` value makes this function
      return false. The `confirm:complete` event is fired whether or not the user answered true or false to the dialog.
   */
    allowAction: function(element) {
      var message = element.data('confirm'),
          answer = false, callback;
      if (!message) { return true; }

      if (rails.fire(element, 'confirm')) {
        try {
          answer = rails.confirm(message);
        } catch (e) {
          (console.error || console.log).call(console, e.stack || e);
        }
        callback = rails.fire(element, 'confirm:complete', [answer]);
      }
      return answer && callback;
    },

    // Helper function which checks for blank inputs in a form that match the specified CSS selector
    blankInputs: function(form, specifiedSelector, nonBlank) {
      var inputs = $(), input, valueToCheck,
          selector = specifiedSelector || 'input,textarea',
          allInputs = form.find(selector);

      allInputs.each(function() {
        input = $(this);
        valueToCheck = input.is('input[type=checkbox],input[type=radio]') ? input.is(':checked') : !!input.val();
        if (valueToCheck === nonBlank) {

          // Don't count unchecked required radio if other radio with same name is checked
          if (input.is('input[type=radio]') && allInputs.filter('input[type=radio]:checked[name="' + input.attr('name') + '"]').length) {
            return true; // Skip to next input
          }

          inputs = inputs.add(input);
        }
      });
      return inputs.length ? inputs : false;
    },

    // Helper function which checks for non-blank inputs in a form that match the specified CSS selector
    nonBlankInputs: function(form, specifiedSelector) {
      return rails.blankInputs(form, specifiedSelector, true); // true specifies nonBlank
    },

    // Helper function, needed to provide consistent behavior in IE
    stopEverything: function(e) {
      $(e.target).trigger('ujs:everythingStopped');
      e.stopImmediatePropagation();
      return false;
    },

    //  replace element's html with the 'data-disable-with' after storing original html
    //  and prevent clicking on it
    disableElement: function(element) {
      var replacement = element.data('disable-with');

      element.data('ujs:enable-with', element.html()); // store enabled state
      if (replacement !== undefined) {
        element.html(replacement);
      }

      element.bind('click.railsDisable', function(e) { // prevent further clicking
        return rails.stopEverything(e);
      });
    },

    // restore element to its original state which was disabled by 'disableElement' above
    enableElement: function(element) {
      if (element.data('ujs:enable-with') !== undefined) {
        element.html(element.data('ujs:enable-with')); // set to old enabled state
        element.removeData('ujs:enable-with'); // clean up cache
      }
      element.unbind('click.railsDisable'); // enable element
    }
  };

  if (rails.fire($document, 'rails:attachBindings')) {

    $.ajaxPrefilter(function(options, originalOptions, xhr){ if ( !options.crossDomain ) { rails.CSRFProtection(xhr); }});

    // This event works the same as the load event, except that it fires every
    // time the page is loaded.
    //
    // See https://github.com/rails/jquery-ujs/issues/357
    // See https://developer.mozilla.org/en-US/docs/Using_Firefox_1.5_caching
    $(window).on('pageshow.rails', function () {
      $($.rails.enableSelector).each(function () {
        var element = $(this);

        if (element.data('ujs:enable-with')) {
          $.rails.enableFormElement(element);
        }
      });

      $($.rails.linkDisableSelector).each(function () {
        var element = $(this);

        if (element.data('ujs:enable-with')) {
          $.rails.enableElement(element);
        }
      });
    });

    $document.delegate(rails.linkDisableSelector, 'ajax:complete', function() {
        rails.enableElement($(this));
    });

    $document.delegate(rails.buttonDisableSelector, 'ajax:complete', function() {
        rails.enableFormElement($(this));
    });

    $document.delegate(rails.linkClickSelector, 'click.rails', function(e) {
      var link = $(this), method = link.data('method'), data = link.data('params'), metaClick = e.metaKey || e.ctrlKey;
      if (!rails.allowAction(link)) return rails.stopEverything(e);

      if (!metaClick && link.is(rails.linkDisableSelector)) rails.disableElement(link);

      if (rails.isRemote(link)) {
        if (metaClick && (!method || method === 'GET') && !data) { return true; }

        var handleRemote = rails.handleRemote(link);
        // response from rails.handleRemote() will either be false or a deferred object promise.
        if (handleRemote === false) {
          rails.enableElement(link);
        } else {
          handleRemote.fail( function() { rails.enableElement(link); } );
        }
        return false;

      } else if (method) {
        rails.handleMethod(link);
        return false;
      }
    });

    $document.delegate(rails.buttonClickSelector, 'click.rails', function(e) {
      var button = $(this);

      if (!rails.allowAction(button) || !rails.isRemote(button)) return rails.stopEverything(e);

      if (button.is(rails.buttonDisableSelector)) rails.disableFormElement(button);

      var handleRemote = rails.handleRemote(button);
      // response from rails.handleRemote() will either be false or a deferred object promise.
      if (handleRemote === false) {
        rails.enableFormElement(button);
      } else {
        handleRemote.fail( function() { rails.enableFormElement(button); } );
      }
      return false;
    });

    $document.delegate(rails.inputChangeSelector, 'change.rails', function(e) {
      var link = $(this);
      if (!rails.allowAction(link) || !rails.isRemote(link)) return rails.stopEverything(e);

      rails.handleRemote(link);
      return false;
    });

    $document.delegate(rails.formSubmitSelector, 'submit.rails', function(e) {
      var form = $(this),
        remote = rails.isRemote(form),
        blankRequiredInputs,
        nonBlankFileInputs;

      if (!rails.allowAction(form)) return rails.stopEverything(e);

      // skip other logic when required values are missing or file upload is present
      if (form.attr('novalidate') === undefined) {
        blankRequiredInputs = rails.blankInputs(form, rails.requiredInputSelector, false);
        if (blankRequiredInputs && rails.fire(form, 'ajax:aborted:required', [blankRequiredInputs])) {
          return rails.stopEverything(e);
        }
      }

      if (remote) {
        nonBlankFileInputs = rails.nonBlankInputs(form, rails.fileInputSelector);
        if (nonBlankFileInputs) {
          // slight timeout so that the submit button gets properly serialized
          // (make it easy for event handler to serialize form without disabled values)
          setTimeout(function(){ rails.disableFormElements(form); }, 13);
          var aborted = rails.fire(form, 'ajax:aborted:file', [nonBlankFileInputs]);

          // re-enable form elements if event bindings return false (canceling normal form submission)
          if (!aborted) { setTimeout(function(){ rails.enableFormElements(form); }, 13); }

          return aborted;
        }

        rails.handleRemote(form);
        return false;

      } else {
        // slight timeout so that the submit button gets properly serialized
        setTimeout(function(){ rails.disableFormElements(form); }, 13);
      }
    });

    $document.delegate(rails.formInputClickSelector, 'click.rails', function(event) {
      var button = $(this);

      if (!rails.allowAction(button)) return rails.stopEverything(event);

      // register the pressed submit button
      var name = button.attr('name'),
        data = name ? {name:name, value:button.val()} : null;

      button.closest('form').data('ujs:submit-button', data);
    });

    $document.delegate(rails.formSubmitSelector, 'ajax:send.rails', function(event) {
      if (this === event.target) rails.disableFormElements($(this));
    });

    $document.delegate(rails.formSubmitSelector, 'ajax:complete.rails', function(event) {
      if (this === event.target) rails.enableFormElements($(this));
    });

    $(function(){
      rails.refreshCSRFTokens();
    });
  }

})( jQuery );
(function() {


}).call(this);
(function() {


}).call(this);
(function() {


}).call(this);
/**
 * jQuery iframe click tracking plugin
 *
 * @author Vincent Paré (www.finalclap.com)
 * @copyright © 2013-2015 Vincent Paré
 * @license http://opensource.org/licenses/Apache-2.0
 * @version 1.1.0
 */

(function($){
	// Tracking handler manager
	$.fn.iframeTracker = function(handler){
		var target = this.get();
		if (handler === null || handler === false) {
			$.iframeTracker.untrack(target);
		} else if (typeof handler == "object") {
			$.iframeTracker.track(target, handler);
		} else {
			throw new Error("Wrong handler type (must be an object, or null|false to untrack)");
		}
	};
	
	// Iframe tracker common object
	$.iframeTracker = {
		// State
		focusRetriever: null,  // Element used for restoring focus on window (element)
		focusRetrieved: false, // Says if the focus was retrived on the current page (bool)
		handlersList: [],      // Store a list of every trakers (created by calling $(selector).iframeTracker...)
		isIE8AndOlder: false,  // true for Internet Explorer 8 and older
		
		// Init (called once on document ready)
		init: function(){
			// Determine browser version (IE8-) ($.browser.msie is deprecated since jQuery 1.9)
			try {
				if ($.browser.msie == true && $.browser.version < 9) {
					this.isIE8AndOlder = true;
				}
			} catch(ex) {
				try {
					var matches = navigator.userAgent.match(/(msie) ([\w.]+)/i);
					if (matches[2] < 9) {
						this.isIE8AndOlder = true;
					}
				} catch(ex2) {}
			}
			
			// Listening window blur
			$(window).focus();
			$(window).blur(function(e){
				$.iframeTracker.windowLoseFocus(e);
			});
			
			// Focus retriever (get the focus back to the page, on mouse move)
			$('body').append('<div style="position:fixed; top:0; left:0; overflow:hidden;"><input style="position:absolute; left:-300px;" type="text" value="" id="focus_retriever" readonly="true" /></div>');
			this.focusRetriever = $('#focus_retriever');
			this.focusRetrieved = false;
			$(document).mousemove(function(e){
				if (document.activeElement && document.activeElement.tagName == 'IFRAME') {
					$.iframeTracker.focusRetriever.focus();
					$.iframeTracker.focusRetrieved = true;
				}
			});
			
			// Special processing to make it work with my old friend IE8 (and older) ;)
			if (this.isIE8AndOlder) {
				// Blur doesn't works correctly on IE8-, so we need to trigger it manually
				this.focusRetriever.blur(function(e){
					e.stopPropagation();
					e.preventDefault();
					$.iframeTracker.windowLoseFocus(e);
				});
				
				// Keep focus on window (fix bug IE8-, focusable elements)
				$('body').click(function(e){ $(window).focus(); });
				$('form').click(function(e){ e.stopPropagation(); });
				
				// Same thing for "post-DOMready" created forms (issue #6)
				try {
					$('body').on('click', 'form', function(e){ e.stopPropagation(); });
				} catch(ex) {
					console.log("[iframeTracker] Please update jQuery to 1.7 or newer. (exception: " + ex.message + ")");
				}
			}
		},
		
		
		// Add tracker to target using handler (bind boundary listener + register handler)
		// target: Array of target elements (native DOM elements)
		// handler: User handler object
		track: function(target, handler){
			// Adding target elements references into handler
			handler.target = target;
			
			// Storing the new handler into handler list
			$.iframeTracker.handlersList.push(handler);
			
			// Binding boundary listener
			$(target)
				.bind('mouseover', {handler: handler}, $.iframeTracker.mouseoverListener)
				.bind('mouseout',  {handler: handler}, $.iframeTracker.mouseoutListener);
		},
		
		// Remove tracking on target elements
		// target: Array of target elements (native DOM elements)
		untrack: function(target){
			if (typeof Array.prototype.filter != "function") {
				console.log("Your browser doesn't support Array filter, untrack disabled");
				return;
			}
			
			// Unbinding boundary listener
			$(target).each(function(index){
				$(this)
					.unbind('mouseover', $.iframeTracker.mouseoverListener)
					.unbind('mouseout', $.iframeTracker.mouseoutListener);
			});
			
			// Handler garbage collector
			var nullFilter = function(value){
				return value === null ? false : true;
			};
			for (var i in this.handlersList) {
				// Prune target
				for (var j in this.handlersList[i].target) {
					if ($.inArray(this.handlersList[i].target[j], target) !== -1) {
						this.handlersList[i].target[j] = null;
					}
				}
				this.handlersList[i].target = this.handlersList[i].target.filter(nullFilter);
				
				// Delete handler if unused
				if (this.handlersList[i].target.length == 0) {
					this.handlersList[i] = null;
				}
			}
			this.handlersList = this.handlersList.filter(nullFilter);
		},
		
		// Target mouseover event listener
		mouseoverListener: function(e){
			e.data.handler.over = true;
			try {e.data.handler.overCallback(this);} catch(ex) {}
		},
		
		// Target mouseout event listener
		mouseoutListener: function(e){
			e.data.handler.over = false;
			$.iframeTracker.focusRetriever.focus();
			try {e.data.handler.outCallback(this);} catch(ex) {}
		},
		
		// Calls blurCallback for every handler with over=true on window blur
		windowLoseFocus: function(event){
			for (var i in this.handlersList) {
				if (this.handlersList[i].over == true) {
					try {this.handlersList[i].blurCallback();} catch(ex) {}
				}
			}
		}
	};
	
	// Init the iframeTracker on document ready
	$(document).ready(function(){
		$.iframeTracker.init();
	});
})(jQuery);
(function() {


}).call(this);
(function() {


}).call(this);
function initializeMovies() {

  console.log('initializing movies!')
  // hides a movie on dashboard when user clicks 'seen'

  $('.seen').on('click', function(){ 
    $(this).closest('.movie').hide()
    $.ajax({
              url: '/dashboard/matches',
              type: "post",
              async:true,
              success: function() {
                // hourly = data.hourly_rate;
                console.log ("matches updated")
              },
              error: function(){
                console.log ("error with ajax")
              }
          
          });
  });

  // populates modal data with whichever user is clicked and updates analytics

  $('.circle-avatar').on('click', function(){

    console.log('modal clicked')

    // get clicked on user data 
    var data = $(this).closest('.modal-link').find('.hidden-user-data');
    var image = data.find('.user-image').text();
    var name = data.find('.user-name').text();
    var id = data.find('.user-id').text();
    var wants_to_see = data.find('.user-wants-to-see').text();

    // populate that data in modal

    var modal = $('#myModal')

    modal.find('#modal-image').find('img').attr('src', image);
    modal.find('#modal-name').text(name);
    modal.find('#receiver').val(id.trim());
    modal.find('#modal-wants-to-see').text(wants_to_see); 


    $.ajax({
        url: '/analytics/users',
        type: "post",
        async:true,
        dataType: "html",
        success: function() {
          // hourly = data.hourly_rate;
          console.log ("modal opened")
        },
        error: function(){
          console.log ("error with ajax")
        }
    
    });


  });

// Tracks trailer views via youtube iframe clicks

$('body').delegate('.videoWrapper iframe').iframeTracker({
      blurCallback: function increaseYoutubeViews() {
           $.ajax({
              url: '/analytics/trailers',
              type: "post",
              async:true,
              dataType: "html",
              success: function() {
                // hourly = data.hourly_rate;
                console.log ("trailer watched")
              },
              error: function(){
                console.log ("error with ajax")
              }
          
          });
      }
});




// submits data when modal submitted

  $('.modal').on('submit', '#new-message', function(event){
    console.log(event);
    event.preventDefault();

     var id = $('#receiver').val();
     var message = $('#message').val();
     var subject = $('#subject').val();


    $.ajax({
      url: '/messages',
      type: "post",
      async:false,
      dataType: "html",
      data: {
        message: message,
        receiver: id,
        subject: subject
      },
      success: function(data) {
        // hourly = data.hourly_rate;
        console.log ("message sent")
        $('#myModal').hide();
        window.location = "/conversations"
      },
      error: function(data){
        console.log ("nooope messages")
        console.log(data)
      }
  
    });

  });
}


$(document).ready(initializeMovies);
(function() {


}).call(this);
(function() {


}).call(this);
(function() {


}).call(this);
function initializeUsers() {
console.log('initialized users!')
  $('.avatar').on('click', function(){
    
    $('#uploadAvatar').click();

    $("#uploadAvatar").change(function(){
      readURL(this);
    });

  });

}

function readURL(input) {
      if (input.files && input.files[0]) {
          var reader = new FileReader();

          reader.onload = function (e) {
            var result = $('.avatar').attr('src', e.target.result);
            $('.edit_user').submit();
          }

          reader.readAsDataURL(input.files[0]);
      }
  }


$(document).ready(initializeUsers);
// This is a manifest file that'll be compiled into application.js, which will include all the files
// listed below.
//
// Any JavaScript/Coffee file within this directory, lib/assets/javascripts, vendor/assets/javascripts,
// or any plugin's vendor/assets/javascripts directory can be referenced here using a relative path.
//
// It's not advisable to add code directly here, but if you do, it'll appear at the bottom of the
// compiled file.
//
// Read Sprockets README (https://github.com/rails/sprockets#sprockets-directives) for details
// about supported directives.
//


