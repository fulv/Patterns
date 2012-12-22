/*
  Parsley.js allows you to verify your form inputs frontend side, without writing a line of javascript. Or so..

  author: Guillaume Potier - @guillaumepotier
*/

!function ($) {

  "use strict";

  /* VALIDATORS FUNCTIONS DEFINITION
  * ========================= */
  var ValidatorsFn = function ( options ) {
    this.init( options );
  }

  ValidatorsFn.prototype = {

    constructor: ValidatorsFn

    , messages: {
        defaultMessage: "This value seems to be invalid."
      , type: {
            email:      "This value should be a valid email."
          , url:        "This value should be a valid url."
          , number:     "This value should be a valid number."
          , digits:     "This value should be digits."
          , dateIso:    "This value should be a valid date (YYYY-MM-DD)."
          , alphanum:   "This value should be alphanumeric."
        }
      , notnull:        "This value should not be null."
      , notblank:       "This value should not be blank."
      , required:       "This value is required."
      , regexp:         "This value seems to be invalid."
      , min:            "This value should be greater than %s."
      , max:            "This value should be lower than %s."
      , range:          "This value should be between %s and %s."
      , minlength:      "This value is too short. It should have %s characters or more."
      , maxlength:      "This value is too long. It should have %s characters or less."
      , rangelength:    "This value length is invalid. It should be between %s and %s characters long."
    }

    , init: function ( options ) {
      var customValidators = options.customValidators
        , customMessages = options.messages;

      for ( var i in customValidators ) {
        this[ i ] = customValidators[ i ];
      }

      for ( var i in customMessages ) {
        this.messages[ i ] = customMessages[ i ];
      }
    }

    , formatMesssage: function ( message, args ) {

      if ( 'object' === typeof args ) {
        for ( var i in args ) {
          message = this.formatMesssage( message, args[ i ] );
        }

        return message;
      }

      return message.replace(new RegExp("%s", "i"), args);
    }

    , notnull: function ( val ) {
      return val.length > 0;
    }

    , notblank: function ( val ) {
      return '' !== val.replace( /^\s+/g, '' ).replace( /\s+$/g, '' );
    }

    , required: function ( val ) {
      return this.notnull( val ) && this.notblank( val );
    }

    , type: function ( val, type ) {
      var regExp;

      switch ( type ) {
        case "number":
          regExp = /^-?(?:\d+|\d{1,3}(?:,\d{3})+)?(?:\.\d+)?$/;
          break;
        case "digits":
          regExp = /^\d+$/;
          break;
        case "alphanum":
          regExp = /^\w+$/;
          break;
        case "email":
          regExp = /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))$/i;
          break;
        case "url":
          regExp = /^(https?|s?ftp):\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i;
          break;
        case "dateIso":
          regExp = /^\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2}$/;
          break;
        default:
          return false;
          break;
      }

      return regExp.test( val );
    }

    , regexp: function ( val, regExp ) {
      return new RegExp( regExp, 'i' ).test( val );
    }

    , minlength: function ( val, min ) {
      return val.length >= min;
    }

    , maxlength: function ( val, max ) {
      return val.length <= max;
    }

    , rangelength: function ( val, arrayRange ) {
      return this.minlength( val, arrayRange[ 0 ] ) && this.maxlength( val, arrayRange[ 1 ] );
    }

    , min: function ( val, min ) {
      return val >= min;
    }

    , max: function ( val, max ) {
      return val <= max;
    }

    , range: function ( val, arrayRange ) {
      return val >= arrayRange[ 0 ] && val <= arrayRange[ 1 ];
    }
}

 /* PARSLEYITEMS PUBLIC CLASS DEFINITION
  * =================================== */
  var ParsleyItem = function ( element, options ) {
    this.init( 'parsleyItem', element, new ValidatorsFn( options ), options );
  }

  ParsleyItem.prototype = {

    constructor: ParsleyItem

    /*
    * init data, bind jQuery on() actions
    */
    , init: function ( type, element, validatorsFn, options ) {
      this.type = type;
      this.hash = this.generateHash();
      this.$element = $( element );
      this.isRequired = false;
      this.validatorsFn = validatorsFn;
      this.registeredValidators = this.errors = new Array();
      this.options = $.extend( {}, $.fn[ 'parsley' ].defaults, options, this.$element.data() );
      this.parentForm = this.$element.closest( 'form' );

      if ( 'undefined' !== typeof this.options[ 'required' ] ) {
        this.isRequired = true;
      }

      // bind parsley validators functions for item
      for ( var method in this.options ) {
        method.toLowerCase();

        if ( 'function' === typeof validatorsFn[ method ] ) {
          this.registeredValidators.push( {
              method: method
            , params: this.options[ method ]
          } );
        }
      }

      // if there are validators for this field, bind verification events
      if ( this.registeredValidators.length ) {
        this.$element.addClass( 'parsley-validated' );
        this.$element.on( this.options.triggers.join( '.' + this.type + ' ') , false, $.proxy( this.validate, this ) );
      }
    }

    /*
    * Hash management. Used for ul error
    * Generate a 5 digits hash
    */
    , generateHash: function () {
        var text = ''
          , possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

        for ( var i = 0; i < 5; i++ ) {
          text += possible.charAt( Math.floor( Math.random() * possible.length ) );
        }

        return text;
    }

    /*
    * Get hash
    */
    , getHash: function() {
      return this.hash;
    }

    /*
    * Called by ParsleyForm.onSubmitValidate when form is validated
    * Not affected by charstovalidate
    */
    , onSubmitValidate: function () {
      if ( false === this.validate( true ) ) {
        return false;
      }

      return true;
    }

    /*
    * Fired on every field change evenement
    */
    , validate: function ( onSubmit ) {
      var isValid = true
        , val = this.$element.val();

      // do not validate if a specific trigger event is specified and this is not this one here
      if ( false !== this.options.validationTrigger && 'undefined' !== typeof onSubmit.type && onSubmit.type !== this.options.validationTrigger ) {
        return;
      }

      // do validation process if field has enough chars and was not previously validated
      if ( true !== onSubmit && val.length < this.options.charstovalidate && !this.$element.hasClass( 'parsley-error' ) ) {
          return;
      }

      // if some binded events are redundant (keyup & keypress for example) and except for onSubmit, validate only once by field value change
      if ( true !== onSubmit && this.val === val ) {
        return this.isValid;
      }

      this.val = val;

      // if field is emptied and not required, remove all errors
      if ( !this.isRequired && '' === val ) {
        this.removeErrors();
        this.$element.removeClass( 'parsley-error' ).addClass( 'parsley-success' );
        return this.isValid = true;
      }

      // apply all field's validations rules
      for ( var i in this.registeredValidators ) {
        var method = this.registeredValidators[ i ].method
          , requirements = this.registeredValidators[ i ].params;

        if ( !this.validatorsFn[ method ]( val, requirements ) ) {
          isValid = this.manageErrors( method, requirements );
        } else {
          this.removeError( method );
        }
      }

      isValid ? this.$element.removeClass( 'parsley-error' ).addClass( 'parsley-success' ) : this.$element.removeClass( 'parsley-success' ).addClass( 'parsley-error' );

      return this.isValid = isValid;
    }

    /*
    * Called on every field error
    */
    , manageErrors: function ( method, requirements ) {

      if ( false === this.options.addError( this.$element, method, requirements ) ) {
         return false;
       }

      this.addError( method, requirements );

      return false;
    }

    /*
    * Remove li / ul error
    */
    , removeError: function ( method ) {
      var ulError = 'ul#' + this.hash
        , liError = ulError + ' li.' + method;

      // remove li error, and ul error if no more li inside
      if ( $( liError ).remove() && $( ulError + ' li' ).length === 0 ) {
        $( ulError ).remove();
      }
    }

    /*
    * Remove all ul error
    */
    , removeErrors: function () {
      $( 'ul#' + this.hash ).remove();
    }
    /*
    * Add li / ul error
    */
    , addError: function ( method, requirements ) {
      var ulError = 'ul#' + this.hash
        , liError = ulError + ' li.' + method
        , message = method === 'type' ?
            this.validatorsFn.messages[ method ][ requirements ] : ( 'undefined' === typeof this.validatorsFn.messages[ method ] ?
              this.validatorsFn.messages.defaultMessage : this.validatorsFn.formatMesssage( this.validatorsFn.messages[ method ], requirements ) );

      if ( $( ulError ).length === 0 ) {
        this.$element.after( '<ul id="' + this.hash + '"></ul>' );
      }

      if ( $( liError ).length === 0 ) {
        $( ulError ).append( '<li class="' + method + '">' + message + '</li>');
      }
    }
  }

  /* PARSLEYFORM PUBLIC CLASS DEFINITION
   * ================================== */
  var ParsleyForm = function ( element, options ) {
    this.init( 'parsleyForm', element, options );
  }

  ParsleyForm.prototype = {

    constructor: ParsleyForm

    /* init data, bind jQuery on() actions */
    , init: function ( type, element, options ) {
      this.type = type;
      this.items = new Array();
      this.$element = $( element );
      this.options = $.extend( {}, $.fn[ 'parsley' ].defaults, options, this.$element.data() );
      var self = this;

      this.$element.find( options.inputs ).each( function () {
        $( this ).parsley( options );
        self.items.push( $( this) );
      });

      this.$element.on( 'submit' , false, $.proxy( this.onSubmitValidate, this ) );
    }

    /*
    * Fired once when form is submited
    */
    , onSubmitValidate: function ( event ) {
      var isValid = true;

      for ( var item in this.items ) {
        if ( !this.items[ item ].parsley( 'onSubmitValidate' ) ) {
          isValid = false;
        }
      }

      this.options.onSubmit( isValid, event );

      return isValid;
    }
  }

  /* PARSLEY PLUGIN DEFINITION
  * ========================= */
  $.fn.parsley = function ( option, fn ) {
    var options = $.extend(true, {}, $.fn.parsley.defaults, option, this.data() )
      , returnValue = false;

    function bind ( self, type ) {
      var $this = $( self )
        , data = $this.data( type )
        , fieldOptions = $.extend( {}, options, $this.data() );

      // if data never binded, bind it right now!
      if ( !data ) {
        switch ( type ) {
          case 'parsleyForm':
            data = new ParsleyForm( self, fieldOptions );
            break;
          case 'parsleyField':
            data = new ParsleyItem( self, fieldOptions );
            break;
          default:
            return;
        }

        $this.data( type, data );
      }

      // here is our parsley public function accessor, currently does not support args
      if ( 'string' === typeof option && 'function' === typeof data[ option ] ) {
        return data[ option ]( fn );
      }
    }

    // loop through every elemt we want to parsley
    this.each(function () {
      // if a form elem is given, bind all its input children
      if ( $( this ).is( 'form' ) ) {
        returnValue = bind ( $( this ), 'parsleyForm' );

      // if it is a Parsley supported single element, bind it too
      // add here a return instance, cuz' we could call public methods on single elems with data[ option ]() above
      } else if ( $( this ).is( options.inputs ) ) {
        returnValue = bind( $( this ), 'parsleyField' );
      }
    });

    return 'function' === typeof fn ? fn() : returnValue;
  }

  /* PARSLEY CONFIGS & OPTIONS
  * ========================= */
  $.fn.parsley.Constructor = ParsleyForm;

  $.fn.parsley.defaults = {
    inputs: 'input, textarea, select'                                             // Default supported inputs.
    , triggers: [ 'change', 'keyup', 'paste' ]                                    // Events list that trigger a validation
    , validationTrigger: false                                                    // Limit to one specific trigger event from above list
    , charstovalidate: 4                                                          // Trigger validators if value >= charstovalidate
    , onSubmit: function ( isFormValid, event ) {}                                // Executed once on form validation
    , addError: function ( elem, validator, requirements ) { return true; }       // Override custom error function by returning false
    , customValidators: {}                                                        // Add here your custom validators functions
    , messages: {}                                                                // Add your own error messages here
  }

  /* PARSLEY DATA-API
  * =============== */
  $( window ).on( 'load', function () {
    $( '[data-validate="parsley"]' ).each( function () {
      $(this).parsley();
    })
  });

// This plugin works with jQuery or Zepto (with data extension builded for Zepto.)
}(window.jQuery || window.Zepto);