/**
 * Patterns notification - Display (self-healing) notifications.
 *
 * Copyright 2013 Marko Durkovic
 */
define([
    "jquery",
    "../registry",
    "../core/logger",
    "../core/parser"
], function($, patterns, logger, Parser) {
    var log = logger.getLogger("notification"),
        parser = new Parser("notification");

    parser.add_argument("type", "static", ["static", "banner"]);
    parser.add_argument("healing", "5s");
    parser.add_argument("controls", "icons", ["icons", "buttons", "none"]);

    var _ = {
        name: "notification",
        trigger: ".pat-notification",

        // this is generic functionality and should be moved to lib
        parseUnit: function(value, unit) {
            var unitRe = new RegExp(unit+"$"),
                numericRe = new RegExp("^[0-9.]+");

            if (!(unitRe.test(value))) {
                throw "value " + value + "is not in unit " + unit;
            }

            var mod = value.replace(numericRe, "");
            mod = mod.replace(unitRe, "");

            value = parseFloat(value);
            if (!mod.length) {
                return value;
            }

            var factors = {
                M: 1000000,
                k: 1000,
                m: 0.001,
                u: 0.000001
            };

            return value * factors[mod];
        },

        parseUnitOrOption: function(value, unit, options) {
            if (options.indexOf(value) >= 0) {
                return value;
            }

            return _.parseUnit(value, unit);
        },

        count: 0,

        init: function($el, opts) {
            return $el.each(function() {
                _.count++;

                var options = parser.parse($el, opts);

                $el = $el.wrap("<div/>").parent()
                    .attr("id", "selfhealing-message-" + _.count)
                    .on("mouseenter.pat-notification", _.onMouseEnter)
                    .on("mouseleave.pat-notification", _.onMouseLeave);

                if (!Array.isArray(options.controls)) {
                    options.controls = [ options.controls ];
                }

                if (options.controls.indexOf("icons") >= 0) {
                    $el.append("<div class='dismiss-button'/>")
                        .on("click.pat-notification", _.onClick);
                } else if (options.controls.indexOf("buttons") >= 0) {
                    $el.append("<button class='dismiss-button'>Dismiss</button>")
                        .on("click.pat-notification", _.onClick);
                } else {
                    $el.on("click.pat-notification", _.onClick);
                }

                if (options.type === "banner") {
                    var $container = $("#selfhealing-messages");
                    if (!$container.length) {
                        $container = $("<div/>").attr("id", "selfhealing-messages").appendTo("body");
                    }
                    $container.append($el);
                }

                var healing = _.parseUnitOrOption(options.healing, "s", ["persistent"]);

                log.debug("Healing value is", healing);
                $el.data("healing", healing);

                $el.animate({"opacity": 1}, "fast", function() {
                    _.initRemoveTimer($el);
                });

                return $el;
            });
        },

        initRemoveTimer: function($el) {
            var healing = $el.data("healing");
            if (healing !== "persistent") {
                clearTimeout($el.data("timer"));
                $el.data("timer", setTimeout(function() {
                    _.remove($el);
                }, healing * 1000));
            }
        },

        onMouseEnter: function() {
            $(this).data("persistent", true);
        },

        onMouseLeave: function() {
            var $this = $(this);

            $this.data("persistent", false);
            _.initRemoveTimer($this);
        },

        onClick: function() {
            var $this = $(this);

            $this.data("persistent", false);
            _.remove($this);
        },

        remove: function($el) {
            if ($el.data("persistent") || $el.data("removing")) {
                return;
            }

            $el.data("removing", true);

            $el.stop(true).animate({"opacity": 0}, {
                step: function() {
                    if ($el.data("persistent")) {
                        // remove the timer and show notification
                        clearTimeout($el.data("timer"));
                        $el.stop(true).animate({"opacity": 1});
                        $el.data("removing", false);
                        return false;
                    }
                },

                complete: function() {
                    var $this = $(this);
                    $this.off(".pat-notification");
                    $this.slideUp("slow", function() {
                        $this.remove();
                    });
                }
            });
        }
    };

    patterns.register(_);
    return _;
});

// jshint indent: 4, browser: true, jquery: true, quotmark: double
// vim: sw=4 expandtab