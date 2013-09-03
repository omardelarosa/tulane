/**
= FontanaGUI =

FontanaGUI is the main class responsible for displaying messages.

The constructor takes a datasource instance and a settings instance.

== Display methods ==

There are 3 methods to control the visualisation:

 * start
 * pause
 * resume
 * clear

`Start` takes a DOM node (selected with jQuery). This is DOM element
that the Fontana will animate in.

`Pause` will halt all animations and data retrieval.

`Resume` will continue a halted Fontana.

`Clear` will remove Fontana.
*/

var Fontana = window.Fontana || {};


Fontana.GUI = (function ($) {
    var GUI;

    GUI = function (datasource, settings) {
        var self = this;
        this.started = false;
        this.paused = false;
        this.datasource = datasource;
        this.datasourceListener = null;
        this.settings = settings;
        this.animateTimer = -1;
        this.animateScheduled = null;
        this.current = null;
        this.effect = null;
        this.style_settings = [ 'font_face', 'text_color', 'custom_css',
                                'special_color', 'bg_color',
                                'bg_image', 'box_bg'];
        this.settings.bind('change', function () {
            self.handleSettingsChange.apply(self, arguments);
        });
    };

    /**
     * Handle settings changes
     */
    GUI.prototype.handleSettingsChange = function (setting, old, value) {
        if (setting == 'twitter_search') {
            if (value) {
                this.destroyDatasourceListener();
                this.datasource.stop();
                this.datasource = new Fontana.datasources.Twitter(value);
                this.stopAnimation();
                this.container.empty();
                this.setupDatasourceListener();
                this.datasource.getMessages();
            }
        }
        if (setting == 'effect') {
            this.stopAnimation();
            this.effect.destroy();
            this.effect = null;
            this.scheduleAnimation();
        }
        if ($.inArray(setting, this.style_settings) > -1) {
            this.updateStyle();
        }
    };

    /* Setup datasource listener */
    GUI.prototype.setupDatasourceListener = function () {
        if (!this.datasourceListener) {
            var self = this;
            this.datasourceListener = function (messages) {
                self.handleMessages.call(self, messages);
            };
            this.datasource.bind('messages', this.datasourceListener);
        }
    };

    /* Destroy datasource listener */
    GUI.prototype.destroyDatasourceListener = function () {
        if (this.datasourceListener) {
            this.datasource.unbind('messages', this.datasourceListener);
            this.datasourceListener = null;
        }
    };

    /**
     * Handle the messages from the datasource
     */
    GUI.prototype.handleMessages = function (messages) {
        var self = this;
        var elements = $.map(messages, function (message) {
            return self.formatMessage(message)[0];
        });
        this.container.prepend(elements);
        this.current = null;
        if ($('.fontana-message:not(:hidden)', this.container).length == 0) {
            this.scheduleAnimation();
        }
    };

    /**
     * Purge messages in the DOM (if necessary)
     */
    GUI.prototype.purgeMessages = function (messages) {
        var all = $('.fontana-message:hidden', this.container);
        if (all.length >= 30) {
            if (all.index(this.current) < all.length / 2) {
                all.slice(Math.floor(all.length / 2)).remove();
            }
            else {
                this.current.nextAll('.fontana-message:hidden').remove();
            }
        }
    };

    /* display methods */

    /**
     * Create HTML from a datasource object
     */
    GUI.prototype.formatMessage = function (message) {
        if (!message.html && message.text) {
            message.html = twttr.txt.autoLink(message.text, {target: '_blank'});
        }
        return $.tmpl(this.settings.get('message_template'), message);
    };

    /**
     * Create CSS according to the current settings
     */
    GUI.prototype.updateStyle = function () {
        var self = this, options = {};
        $.each(this.style_settings, function (i, key) {
            options[key] = self.settings.get(key);
        });
        if (!this.container.attr('id')) {
            this.container.attr('id', 'fontana-' + new Date().getTime());
        }
        options['container_id'] = this.container.attr('id');
        if(this.style_tag) {
            this.style_tag.remove();
        }
        this.style_tag = $.tmpl("<style type='text/css'>" +
                this.settings.get('style_template') +
            "</style>", options).appendTo("head");
    };

    /**
     * Schedule the next animation
     */
    GUI.prototype.scheduleAnimation = function () {
        var self = this,
            nextInterval = this.settings.get('message_animate_interval');
        if (!this.animateScheduled || nextInterval < 0) {
            nextInterval = 0;
        }
        this.animateTimer = window.setTimeout(function () {
            self.animateMessages.call(self);
        }, nextInterval);
        this.animateScheduled = new Date();
    };


    /**
     * Stop scheduling animations
     */
    GUI.prototype.stopAnimation = function() {
        clearTimeout(this.animateTimer);
        this.animateScheduled = null;
    };

    /**
     * Transition from one message to the next one
     */
    GUI.prototype.animateMessages = function () {
        var self = this, next, effectName, nextTime;
        if (!this.effect) {
            effectName = this.settings.get('effect');
            this.effect = new Fontana.effects[effectName](this.container, '.fontana-message');
            this.settings.set('effect_inst', this.effect);
        }
        if (!this.current || !this.current.next().length) {
            next = $('.fontana-message:first', this.container);
        } else {
            next = this.current.next();
        }
        // update time
        nextTime = $('time', next);
        nextTime.text(Fontana.utils.prettyDate(nextTime.attr('title')));
        // transition
        this.effect.next(next, function () {
            // cleanup
            self.current = next;
            self.purgeMessages.call(self);
            if (!self.paused) {
                self.scheduleAnimation.call(self);
            }
        });
    };

    /* public control methods */

    /**
     * Start the fountain in the given container
     */
    GUI.prototype.start = function (node) {
        if (!this.started) {
            this.container = node;
            this.container.empty();
            this.updateStyle();
            this.setupDatasourceListener();
            this.datasource.getMessages();
            this.started = true;
        }
    };

    /**
     * Stop all running timers
     */
    GUI.prototype.pause = function () {
        if (this.started && !this.paused) {
            this.destroyDatasourceListener();
            this.stopAnimation();
            this.paused = true;
        }
    };

    /**
     * Restart all timers
     */
    GUI.prototype.resume = function () {
        if (this.paused) {
            this.paused = false;
            this.setupDatasourceListener();
            this.scheduleAnimation();
        }
    };

    /**
     * Reset the messages
     */
    GUI.prototype.clear = function () {
        if (this.started) {
            this.destroyDatasourceListener();
            this.datasource.stop();
            this.stopAnimation();
            this.container.empty();
            this.paused = false;
            this.started = false;
        }
    };

    return GUI;
}(window.jQuery));
