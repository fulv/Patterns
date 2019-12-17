(function (root, factory) {
    // We use AMD (Asynchronous Module Definition) or browser globals to create
    // this module.
    if (typeof define === 'function' && define.amd) {
        define([
            'jquery',
            'pat-base',
            'pat-registry',
            'pat-utils',
            'pat-parser',
            'pat-markdown',
            'pat-logger',
            'tippy.js',
            'tippy-theme.css',
        ], function() {
            return factory.apply(this, arguments)
        })
    } else {
        // If require.js is not available, you'll need to make sure that these
        // global variables are available.
//        factory($, patterns.Base, patterns, patterns.Parser, patterns.logger, tippy, tippytheme)
        factory($, patterns.Base, patterns, patterns.utils, patterns.Parser, patterns.markdown, patterns.logger, tippy)
    }
//}(this, function($, Base, registry, Parser, logger, tippy, tippytheme) {
}(this, function($, Base, registry, utils, Parser, Markdown, logger, tippy) {
    'use strict'

    let start = 0
    const log = logger.getLogger('pat-tooltip-ng'),
          timelog = msg => { log.debug(`${Date.now() - start} ${msg}`) }

    log.setLevel(20)
    timelog('Initializing pat-tooltip-ng')

    /* For logging, you can call log.debug, log.info, log.warn, log.error and log.fatal.
     *
     * For more information on how to use the logger and how to view log messages, please read:
     * https://github.com/Patternslib/logging
     */

    const TippyOptions = (() => {
        return class extends Map {

            constructor($trigger, options) {
                super(Object.entries(options))
                this.$trigger = $trigger
            }

            get(key) {
                let value = super.get(key)
                if (key === 'content') {
                }
                return value
            }

            set(key, value) {
                if (key === 'content') {
                    const $close = $('<button/>', {'class': 'close-panel'})
                        .text('Close')

                    if (typeof value === 'string') {
                        value = $('<div/>').append($close)
                            .append($('<div/>').text(value))[0]
                    } else {
                        if (value[Symbol.toStringTag].startsWith('HTML')) {
                        ////    debugger
                            //// prepend with a button
                            ////value = $('<div/>')
                            ////    .append($close)
                            ////    .append($(value))
                            //// value = $close.insertBefore($(value).find('*:first'))
                            ////console.log(value)
                            ////$close.insertBefore($(value).find('*:first'))

                            value = $('<div/>').append($close)
                                .append($('<div/>').append(value))[0];
                        }
                    }
                }
                return super.set(key,value)
            }

            [Symbol.iterator]() {
                let orig = super[Symbol.iterator]()
                return orig
            }

            parse() {
            const notImplemented = (name) => { log.error(`${name} not implemented`) },

                placement = (pos) => {
                    const primary = (pos) => ({
                            t: 'bottom',
                            r: 'left',
                            b: 'top',
                            l: 'right',
                        }[pos])

                    const secondary = (pos) => ({
                            l: '-start',
                            r: '-end',
                            m: '',
                            t: '-start',
                            b: '-end',
                        }[pos])

                    return `${primary(pos[0])}${secondary(pos[1])}`
                },

                flipBehavior = (pos) => placement(`${pos[0]}m`),

                parsers = {
                    position() {
                        if (this.has('position')) {
                            const prefs = this.get('position').list
                            if (prefs.length > 0) {
                                const pos = prefs[0]
                                this.set('placement', placement(pos))

                                if (prefs.length > 1) {
                                    this.set('flipBehavior', prefs.map(flipBehavior))
                                    this.set('flip', true)
                                    this.set('flipOnUpdate', true)
                                }
                            }
                            if (this.get('position').policy === 'force') {
                                this.set('flip', false)
                                this.set('flipOnUpdate', false)
                            }
                            this.delete('position')
                        }
                    },

                    height: notImplemented,

                    trigger() {
                        if (this.get('trigger') === 'hover') {
                            this.set('trigger', 'mouseenter focus')
                        }
                    },

                    closing() {
                        if (this.has('closing')) {
                            const klass = this.get('closing'),
                                handler = tooltip._addClassHandler(klass)

                            this.$trigger.on('pat-tippy-mount', handler)
                            this.delete('closing')
                        }
                    },

                    source() {
                        if (this.has('source')) {
                            if (this.get('source') === 'title') {
                                this.set('content', this.$trigger.attr('title'))
                            }
                            if (this.get('source') === 'auto') {
                                const href = this.$trigger.attr('href')
                                if (typeof(href) !== 'string') {
                                    log.error(`href must be specified if 'source' is set to 'auto'`)
                                    return
                                }
                                if (href.indexOf('#') === 0) {
                                    tooltip._setSource(this, 'content')  // TODO why not: this.set('source', 'content')?
                                } else {
                                    tooltip._setSource(this, 'ajax')     // TODO why not: this.set('source', 'ajax')?
                                }
                            }
                            if (this.get('source') === 'content') {
                                const href = this.$trigger.attr('href'),
                                      is_string = typeof(href) === 'string',
                                      has_hash = href.indexOf('#') !== -1,
                                      has_more = href.length > 1
                                let $content

                                if (is_string && has_hash && has_more) {
                                    const $el = $('#'+href.split('#')[1])
                                    $content = $el.children().clone()
                                } else {
                                    $content = this.$trigger.children().clone()
                                    if (!$content.length) {
                                        const ttext = this.$trigger.text()
                                        $content = $('<p/>').text(ttext)
                                    }
                                }
                                this.set('content', $content[0])
                                registry.scan($content[0])
                            }
                            if (this.get('source') === 'ajax') {
                                const $p = $('<progress/>')[0]

                                this.set('content', $p)
                                this.set('onShow', tooltip._onAjax(this.$trigger))
                                this.set('onHidden', instance => {
                                    timelog('ONAJAXHIDDEN')
                                    instance.setContent($p)
                                    instance.state.ajax.canFetch = true
                                })
                            }
                            this.delete('source')
                        }
                    },

                    ajaxDataType() {
                        this.delete('ajaxDataType')
                    },

                    delay() {
                        if (this.has('delay')) {
                            this.set('delay', [utils.parseTime(this.get('delay')), 0])
                        }
                    },

                    markInactive() {
                        if (this.get('markInactive')) {
                            this.$trigger.addClass('inactive')
                        }
                        this.delete('markInactive')
                    },

                    'class': () => {
                        if (this.has('class')) {
                            const klass = this.get('class'),
                                  handler = tooltip._addClassHandler(klass)

                            this.$trigger.on('pat-tippy-mount', handler)
                            this.delete('class')
                        }
                    },

                    target() {
                        if (this.has('target')) {
                            if (this.get('target') === 'parent') {
                                this.set('appendTo', 'parent')
                            } else if (this.get('target') !== 'body') {
                                this.set('appendTo', $(this.get('target'))[0])
                            }
                            this.delete('target')
                        }
                    }
                }

            for (let arg of this.keys()) {
                switch (arg) {
                    case 'ajax-data-type':
                        arg = 'ajaxDataType'
                        break
                    case 'mark-inactive':
                        arg = 'markInactive'
                        break
                }
                if (!parsers.hasOwnProperty(arg)) {
                    continue
                }
                log.debug(arg)
                parsers[arg].call(this, arg)
            }

            if (this.$trigger.attr('title')) {
                this.$trigger.removeAttr('title')
            }

            //delete this.$trigger
            log.debug(Object.fromEntries(this))
            return Object.fromEntries(this)
            }
        }
    })()

    let parser = new Parser('tooltip-ng')
    /* If you'd like your pattern to be configurable via the
     * data-pat-tooltip-ng attribute, then you need to
     * specify the available arguments here, by calling parser.addArgument.
     *
     * The addArgument method takes the following parameters:
     *  - name: The required name of the pattern property which you want to make
     *      configurable.
     *  - default_value: An optional default string value of the property if the user
     *      doesn't provide one.
     *  - choices: An optional set (Array) of values that the property might take.
     *      If specified, values outside of this set will not be accepted.
     *  - multiple: An optional boolean value which specifies wether the
     *      property can be multivalued or not.
     *
     *  For example:
     *      parser.addArgument('color', 'blue', ['red', 'green', 'blue'], false)
     */
    const all_positions = ['tl', 'tm', 'tr',
                           'rt', 'rm', 'rb',
                           'br', 'bm', 'bl',
                           'lb', 'lm', 'lt']
    parser.addArgument('position-list', [], all_positions, true)
    parser.addArgument('position-policy', 'auto', ['auto', 'force'])
    parser.addArgument('trigger', 'click', ['click', 'hover'])
    parser.addArgument('closing', 'auto', ['auto', 'sticky', 'close-button'])
    parser.addArgument('source', 'title', ['auto', 'ajax', 'content', 'content-html', 'title'])
    parser.addArgument('ajax-data-type', 'html', ['html', 'markdown'])
    parser.addArgument('delay')
    parser.addArgument('mark-inactive', true)
    parser.addArgument('class')
    parser.addArgument('target', 'body')


    //return Base.extend({
    const tooltip = {
        /* The name is used to store the pattern in a registry and needs to be
         * unique.
         */
        name: 'tooltip-ng',
        /* The trigger specifies the selector (CSS or jQuery) which Patternslib
         * will scan for in order to identifiy and initialize this pattern.
         */
        trigger: '.pat-tooltip-ng',

        jquery_plugin: true,

        tippy: tippy.default,

        init($el, opts, debuglevel=20) {
            log.setLevel(debuglevel)

            return $el.each(function() {
                this.defaults = {
                    'allowHTML': true,
                    'animation': 'fade',
                    'arrow': true,
                    //'delay': [0, 1800],
                    //'duration': [325, 275],
                    'flipOnUpdate': true,
                    'ignoreAttributes': true,
                    'interactive': false,
                    'onHidden': tooltip._onHidden,
                    'onHide': tooltip._onHide,
                    'onMount': tooltip._onMount,
                    'onShow': tooltip._onShow,
                    'onShown': tooltip._onShown,
                    'onTrigger': tooltip._onTrigger,
                    'theme': 'light-border',
                    'trigger': 'click'
                }

                start = Date.now()
                const tippy = tooltip.tippy,
                      $trigger = $(this),
                      original_options = parser.parse($trigger, opts)

                let o = tooltip._mutateOptions(original_options)

                const tippyopts = new TippyOptions($trigger, o)

                /* o will now contain the configured pattern properties
                 * you've registered with the parser.addArgument method.
                 *
                 * If the user provided any values via the data-pat-tooltip-ng
                 * attribute, those values will already be set.
                 */

                $trigger.data('patterns.tooltip-ng', original_options)
                        .on('destroy.pat-tooltip-ng', tooltip._onDestroy)

                //o = tooltip.parseOptionsForTippy(o, $trigger)
                tippy.setDefaults(this.defaults)
                tippy($trigger[0], tippyopts.parse())

                tooltip.setupShowEvents($trigger)
            })
        },

        setupShowEvents($trigger) {
            $trigger.on('click.pat-tooltip-ng', tooltip.blockDefault)
        },

        removeShowEvents($trigger) {// jshint ignore:line
        },

        setupHideEvents($trigger) {
            $trigger.on('click.pat-tooltip-ng', tooltip.blockdefault)
        },

        removeHideEvents($trigger) {// jshint ignore:line
        },

        blockDefault(event) {
            if (event.preventDefault) {
                event.preventDefault()
            }
        },

        _mutateOptions(opts) {
            // shallow copy
            return Object.assign({}, opts)
        },

        _addClassHandler(klass) {
            return (event, tooltip) => { $(tooltip).addClass(klass) }
        },

        _setSource(opts, source) {
            opts.set('source', source)
            //opts.source = source
        },

        _setContent(content) {
            return content
        },

        _onDestroy(event) {
            timelog('ONDESTROY')
            const $trigger = event.target
            $trigger._tippy.destroy()
        },

        _onClick(instance, event) {
            timelog('ONCLICK')
            if (event.type === 'click') {
                timelog(`it's click`)
                event.stopPropagation()
                event.preventDefault()
            }
        },

        _onTrigger(instance, event) {// jshint ignore:line
            timelog('ONTRIGGER')
        },

        _onMount(instance) {
            timelog('ONMOUNT')
            const _tip = instance.popperChildren.tooltip
            $(instance.reference).trigger('pat-tippy-mount', _tip)
        },

        _onShow(instance) {// jshint ignore:line
            timelog('ONSHOW')
        },

        _onShown(instance) {
            timelog('ONSHOWN')
            const $trigger = $(instance.reference)
            const options = $trigger.data('patterns.tooltip-ng')
            tooltip.removeShowEvents($trigger)
            tooltip.setupHideEvents($trigger)
            if (options.markInactive) {
                $trigger.removeClass('inactive').addClass('active')
            }
        },

        _onHide(instance) {
            timelog('ONHIDE')
            const $trigger = $(instance.reference)
            tooltip.removeHideEvents($trigger)
            tooltip.setupShowEvents($trigger)
        },

        _onHidden(instance) { // jshint ignore:line
            timelog('ONHIDDEN')
            const $trigger = $(instance.reference)
            const options = $trigger.data('patterns.tooltip-ng')
            if (options.markInactive) {
                $trigger.removeClass('active').addClass('inactive')
            }
        },

        _onAjax($trigger) {
            timelog('OnAJAX')
            const source = $trigger.attr('href').split('#')
            return instance => {
                timelog('in ajax content function')
                timelog(`instance.state.ajax ${JSON.stringify(instance.state.ajax)}`)
                if (instance.state.ajax === undefined) {
                    instance.state.ajax = {
                        isFetching : false,
                        canFetch : true
                    }
                }

                if (instance.state.ajax.isFetching || !instance.state.ajax.canFetch) {
                    return tooltip._onAjaxBypass()
                }

                instance.state.ajax = {
                    isFetching: true,
                    canFetch: false
                }
                tooltip._onAjaxCallback(instance, source)
            }
        },

        _onAjaxCallback(instance, src) {
            timelog('AJAXCALLBACK')
            const $trigger = $(instance.reference),
                  options = $trigger.data('patterns.tooltip-ng'),
                  handler = tooltip._ajaxDataTypeHandlers[options.ajaxDataType]
            fetch(src[0]).then(response => {
                return response.text().then(text => {
                    const $content = $(handler(text, src))
                    $("<button/>", {"class": "close-panel"})
                        .text("Close")
                        .insertBefore($content.find("*:first"));
                    instance.setContent($content[0])
                }).finally(() => {
                    tooltip._onAjaxContentSet(instance)
                })
            })
        },

        _onAjaxBypass() {
            timelog('AJAX BYPASSED')
            return undefined
        },

        _onAjaxContentSet(instance) {
            timelog('AJAXCONTENTSET')
            instance.state.ajax.isFetching = false
        },

        _ajaxDataTypeHandlers: {
            html(text, src) {
                const $tmp = $('<div/>').append($.parseHTML(text))
                return $tmp.find(`#${src[1]}`)[0]
            },

            markdown(text, src) {
                const [url, source] = src,
                       cfg = { url, source: `#${source}` },
                       pat = Markdown.init($('<div/>'))
                return pat.renderForInjection(cfg, text)[0]
            }
        }
    }

    registry.register(tooltip)
    return tooltip
}))
/*global $, patterns, tippy */
