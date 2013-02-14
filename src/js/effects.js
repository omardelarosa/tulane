var Fontana = window.Fontana || {};

Fontana.effects = (function ($) {
    var Base, Fade, Slide, Zoom, Compress, TiltScroll;

    /**
     * Base effect class
     * @param   jQuery  container
     * @param   string  selector
     */
    Base = function (container, selector) {
        this.container = container;
        this.selector = selector;
        this.duration = 0;
        this.before_show_prop = {};
        this.show_prop = {};
        this.hide_prop = {};
        this.cur_element = null;

        var self = this;
    };

    Base.prototype.positionMiddle = function (element) {
        if(!element) {
            return;
        }

        element.css({
            top: Math.floor((this.container.height() - element.outerHeight()) / 2),
            left: Math.floor((this.container.width() - element.outerWidth()) / 2)
        });
    };

    Base.prototype.next = function (element, callback) {
        var self = this;
        this.positionMiddle(element);
        if (this.cur_element) {
            this.cur_element.animate(this.hide_prop, {
                'duration': this.duration,
                'complete': function () {
                    element.animate(self.before_show_prop, 0)
                        .animate(self.show_prop, {
                            'duration': this.duration,
                            'complete': callback
                        });
                }});
        } else {
            element.animate(this.before_show_prop, 0)
                .animate(this.show_prop, {
                    'duration': this.duration,
                    'complete': callback
                });
        }
        this.cur_element = element;
    };

    Base.prototype.destroy = function () {
        $(this.selector, this.container).stop().removeAttr('style').hide();
    };


    /**
     * fade effect
     */
    Fade = function (container, selector) {
        Base.call(this, container, selector);
        this.duration = 500;
        this.show_prop = {opacity: 'show'};
        this.hide_prop = {opacity: 'hide'};
    };
    $.extend(Fade.prototype, Base.prototype);


    /**
     * slide effect
     */
    Slide = function (container, selector) {
        Base.call(this, container, selector);
        this.duration = 500;
        this.before_show_prop = {marginLeft: -100};
        this.show_prop = {opacity: 'show', marginLeft: 0};
        this.hide_prop = {opacity: 'hide', marginLeft: 100};
    };
    $.extend(Slide.prototype, Base.prototype);


    /**
     * zoom effect
     */
    Zoom = function (container, selector) {
        Base.call(this, container, selector);
        this.duration = 500;
        this.before_show_prop = {scale: 0.5};
        this.show_prop = {opacity: 'show', scale: 1};
        this.hide_prop = {opacity: 'hide', scale: 5};
    };
    $.extend(Zoom.prototype, Base.prototype);


    /**
     * compress effect
     */
    Compress = function (container, selector) {
        Base.call(this, container, selector);
        this.duration = 500;
        this.before_show_prop = { rotateX: -2 };
        this.show_prop = {opacity: 'show', rotateX: 0 };
        this.hide_prop = {opacity: 'hide', rotateX: -2 };
    };
    $.extend(Compress.prototype, Base.prototype);


    /**
     * star wars effect
     */
    TiltScroll = function (container, selector) {
        Base.call(this, container, selector);
        this.duration = 500;
        this.elements = [];
    };
    $.extend(TiltScroll.prototype, Base.prototype);

    TiltScroll.prototype.next = function(element, callback) {
        var self = this;

        self.transforms = {
            from: {
                up_scale: 1.4,      up_zindex: 5,      up_pos: 66,      up_opacity: 0,       up_blur: 4,     // upcoming tweet
                main_scale: 1.2,    main_zindex: 10,   main_pos: 33,    main_opacity: 0.5,   main_blur: 2,   // main tweet
                prev_scale: 1,      prev_zindex: 5,    prev_pos: 0,     prev_opacity: 1,     prev_blur: 0,   // previous tweet
                prevold_scale: 0.8, prevold_zindex: 1, prevold_pos:-33, prevold_opacity: .5, prevold_blur: 2 // previous tweet
            },
            to: {
                up_scale: 1.2,      up_zindex: 5,      up_pos: 33,       up_opacity: 0.5,     up_blur: 2,     // upcoming tweet
                main_scale: 1,      main_zindex: 10,   main_pos: 0,      main_opacity: 1,     main_blur: 0,   // main tweet
                prev_scale: 0.8,    prev_zindex: 5,    prev_pos: -33,    prev_opacity: 0.5,   prev_blur: 2,   // previous tweet
                prevold_scale: 0.6, prevold_zindex: 1, prevold_pos: -66, prevold_opacity: .0, prevold_blur: 4 // previous tweet
            }
        };

        this.elements.unshift(element);
        if (this.elements.length > 4) {
            var old = this.elements.pop();
            old.hide();
        }
        self.positionMiddle(element);

        var elements = {
            up: self.elements[0],
            main: self.elements[1],
            prev: self.elements[2],
            prevold: self.elements[3]
        };

        function step(val, fx) {
            var match = fx.prop.match(/([a-z]+)_([a-z]+)/);
            var type = match[1];
            var prop = match[2];

            var el = elements[type];
            if(el) {
                el._animation = el._animation || { };
                el._animation[prop] = val;

                if(typeof el._animation.scale != 'undefined' && typeof el._animation.pos != 'undefined') {
                    el.css({
                        display: 'block',
                        opacity: el._animation.opacity,
                        zIndex: el._animation.zindex,
                        marginTop: el._animation.pos+'%',
                        transform: 'scale('+ el._animation.scale +')'
                    });
                }
            }
        }

        $(self.transforms.from).animate(self.transforms.to, {
            'step': step,
            'duration': self.duration,
            'ease': 'linear',
            'complete': function() {
                if(callback) {
                    callback.call();
                }
            }
        });

        this.cur_element = element;
    };

    TiltScroll.prototype.destroy = function () {
        $(this.selector, this.container).stop().removeAttr('style').hide();
    };

    /**
     * simple scroll effect
     */
    Scroll = function (container, selector) {
        Base.call(this, container, selector);
        this.duration = 500;
        this.show_prop = {opacity: 'show', top: 24};
        this.prev_elements = [];
    };
    $.extend(Scroll.prototype, Base.prototype);

    Scroll.prototype.next = function (element, callback) {
        var prev = this.prev_elements;
        this.positionMiddle(element);
        element.hide();
        element.css({top: -element.outerHeight()});
        if ($.inArray(element[0], prev) > -1) {
            prev.splice($.inArray(element[0], prev), 1);
        }
        function step(val, fx) {
            if (fx.prop == 'opacity') {
                $.each(prev, function () {
                    var $this = $(this);
                    if (val == 0) {
                        $this.data('top', parseInt($this.css('top')));
                    }
                    $this.css({'top': $this.data('top') + ((element.outerHeight() + 24) * val)});
                });
            }
        }
        element.animate(this.show_prop, {
            'step': step,
            'duration': this.duration,
            'complete': callback
        });
        prev.unshift(element[0]);
        if (prev.length > 12) {
            var old = prev.pop();
            $(old).hide();
        }
    };

    return {
        'Base': Base,
        'Fade': Fade,
        'Slide': Slide,
        'Zoom': Zoom,
        'Compress': Compress,
        'TiltScroll': TiltScroll,
        'Scroll': Scroll
    };
}(window.jQuery));
