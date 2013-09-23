/*
# Fontana Datasources

There are three different types of Datasources:

 * Fontana.datasources.Static
 * Fontana.datasources.HTML
 * Fontana.datasources.TwitterSearch

Each datasource implements a `getMessages` method that takes a callback.
The callback is called with a list of messages in the following format:

``` javascript
{
    'id': 'unique-id',
    'created_at': new Date().toString(),
    'text': 'A fake Tweet, in a fake JSON response',
    'user': {
        'name': 'Tweet Fontana',
        'screen_name': 'tweetfontana',
        'profile_image_url': '/img/avatar.png'
    }
}
```

Note that this is the minimum set of keys, some implementations (most notabily
the Twitter datasource) will provide a richer set of keys.
*/


(function() {
  var _base,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  if (this.Fontana == null) {
    this.Fontana = {};
  }

  if ((_base = this.Fontana).datasources == null) {
    _base.datasources = {};
  }

  this.Fontana.datasources.Static = (function() {
    /*
    The Static datasource is constructed with a list of messages.
    * setMessages extendeds the list of messages.
    * getMessages will call a callback with the same list of messages.
    */

    function Static(messages) {
      this.messages = messages != null ? messages : [];
    }

    Static.prototype.setMessages = function(messages) {
      if (this.messages == null) {
        this.messages = [];
      }
      return this.mesages = messages.concat(this.mesages);
    };

    Static.prototype.getMessages = function(callback) {
      var _this = this;
      if (callback) {
        return setTimeout((function() {
          return callback(_this.messages);
        }), 0);
      }
    };

    return Static;

  })();

  this.Fontana.datasources.HTML = (function() {
    /*
    The HTML datasource should be initialized with a jQuery node.
    * extractMessages returns the messages found in the given node, it
      extracts the content from a specific HTML structure e.g.:
      ```
      <div id="unique-message-id" class="message">
          <img class="avatar" src="/img/avatar.png">
          <span class="name">Tweet Fontana</span>
          <span class="screen_name">@tweetfontana</span>
          <p class="text">This is a fake tweet</p>
      </div>
      ```
      Only the id and class names are important.
    * getMessages uses extractMessages to keep a running list of messages.
      It calls the callback with this list. Repeated calls to getMessages
      will extract new messages from the same node.
    */

    function HTML(container) {
      this.container = container;
      this.messages = [];
    }

    HTML.prototype.extractMessages = function() {
      var messages;
      messages = [];
      $('.message', this.container).each(function(i, message) {
        return messages.push({
          id: message.id,
          created_at: new Date().toString(),
          text: $('.text', message).text(),
          user: {
            name: $('.name', message).text(),
            screen_name: $('.screen_name', message).text().replace(/^@/, ''),
            profile_image_url: $('.avatar', message).attr('src')
          }
        });
      });
      return messages;
    };

    HTML.prototype.getMessages = function(callback) {
      var ids, m, messages,
        _this = this;
      ids = [
        (function() {
          var _i, _len, _ref, _results;
          _ref = this.messages;
          _results = [];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            m = _ref[_i];
            _results.push(m.id);
          }
          return _results;
        }).call(this)
      ];
      messages = [];
      this.extractMessages().forEach(function(message) {
        var _ref;
        if (_ref = message.id, __indexOf.call(ids, _ref) < 0) {
          return messages.push(message);
        }
      });
      this.messages = messages.concat(this.messages);
      if (callback) {
        return setTimeout((function() {
          return callback(_this.messages);
        }), 0);
      }
    };

    return HTML;

  })();

  this.Fontana.datasources.TwitterSearch = (function() {
    /*
    This datasource performs a search using the Twitter API and provides
    the callback with the results. Repeated calls to getMessages will
    expand the list of messages with new search results.
    
    Because of API limits the minimum time between actual searches
    is 5 seconds (180 searches in a 15 minute).
    */

    var min_interval;

    min_interval = 60000 * 15 / 180;

    function TwitterSearch(q) {
      this.q = q;
      this.params = {
        since_id: 1,
        q: this.q,
        result_type: 'recent'
      };
      this.lastCall = 0;
      this.messages = [];
    }

    TwitterSearch.prototype.getMessages = function(callback) {
      var now,
        _this = this;
      now = (new Date()).getTime();
      if (now - this.lastCall < min_interval) {
        if (callback) {
          return setTimeout((function() {
            return callback(_this.messages);
          }), 0);
        }
      } else {
        this.lastCall = (new Date()).getTime();
        return $.getJSON('/api/twitter/search/', this.params).success(function(data) {
          if (data.statuses.length) {
            _this.messages = data.statuses.concat(_this.messages);
            _this.params['since_id'] = _this.messages[0].id_str;
          }
          if (callback) {
            if (_this.messages.length) {
              return callback(_this.messages);
            } else {
              return callback([
                {
                  id: (new Date()).getTime(),
                  created_at: new Date().toString(),
                  text: 'Your search term returned no Tweets :(',
                  user: {
                    name: 'Twitter Fontana',
                    screen_name: 'twitterfontana',
                    profile_image_url: '/img/avatar.png'
                  }
                }
              ]);
            }
          }
        }).error(function() {
          if (callback) {
            return callback([
              {
                id: (new Date()).getTime(),
                created_at: new Date().toString(),
                text: 'Error fetching tweets :(',
                user: {
                  name: 'Twitter Fontana',
                  screen_name: 'twitterfontana',
                  profile_image_url: '/img/avatar.png'
                }
              }
            ]);
          }
        });
      }
    };

    return TwitterSearch;

  })();

}).call(this);

/*
# Fontana utils
*/


(function() {
  var monthNames, vendors, _base;

  if (this.Fontana == null) {
    this.Fontana = {};
  }

  if ((_base = this.Fontana).utils == null) {
    _base.utils = {};
  }

  monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  this.Fontana.utils.prettyDate = function(time) {
    var date, day_diff, diff, now;
    date = new Date(time);
    now = (new Date()).getTime();
    diff = (now - date.getTime()) / 1000;
    day_diff = Math.floor(diff / 86400);
    if (isNaN(date)) {
      return time;
    }
    if (isNaN(day_diff) || day_diff < 0 || day_diff >= 1) {
      if (day_diff <= 365) {
        return "" + (date.getDate()) + " " + monthNames[date.getMonth()];
      } else {
        return "" + (date.getDate()) + " " + monthNames[date.getMonth()] + " " + (date.getFullYear());
      }
    }
    if (!day_diff && diff < 10) {
      return "just now";
    }
    if (!day_diff && diff < 60) {
      return "" + (Math.floor(diff)) + "s";
    }
    if (!day_diff && diff < 3600) {
      return "" + (Math.floor(diff / 60)) + "m";
    }
    if (!day_diff && diff < 86400) {
      return "" + (Math.floor(diff / 3600)) + "h";
    }
  };

  vendors = ['webkit', 'moz', 'ms'];

  this.Fontana.utils.requestFullScreen = function(el) {
    var request;
    request = el.requestFullscreen || el.requestFullScreen;
    vendors.some(function(vendor) {
      if (request == null) {
        request = el[vendor + 'RequestFullScreen'];
      }
      return !!request;
    });
    if (request) {
      return request.call(el, Element.ALLOW_KEYBOARD_INPUT);
    }
  };

  this.Fontana.utils.cancelFullScreen = function() {
    var request;
    request = document.exitFullscreen || document.cancelFullScreen;
    vendors.some(function(vendor) {
      if (request == null) {
        request = document[vendor + 'CancelFullScreen'];
      }
      return !!request;
    });
    if (request) {
      return request.call(document);
    }
  };

  this.Fontana.utils.isFullScreen = function() {
    var request;
    request = document.fullScreen || document.isFullScreen;
    console.log(document.fullScreen, document.isFullScreen);
    vendors.some(function(vendor) {
      if (request == null) {
        request = document[vendor + 'FullScreen'] || document[vendor + 'IsFullScreen'];
      }
      return !!request;
    });
    return !!request;
  };

}).call(this);

/*
# Fontana feed visualizer.
*/


(function() {
  var messageTemplate, transitionEffects;

  if (this.Fontana == null) {
    this.Fontana = {};
  }

  messageTemplate = '<div id="{id}" class="message media well col-md-6 col-md-offset-3">\
    <figure class="pull-left media-object">\
        <img src="{user.profile_image_url}" width="64" height="64" alt="" class="avatar img-thumbnail">\
    </figure>\
    <div class="media-body">\
        <div class="media-heading">\
            <cite>\
                <span class="name">{user.name}</span>\
                <small class="text-muted">\
                    <span class="screen_name">@{user.screen_name}</span>\
                    <time class="time pull-right" data-time="{created_at}">{created_at}</time>\
                </small>\
            </cite>\
        </div>\
        <div class="text lead"><q>{text}</q></div>\
    </div>\
</div>';

  transitionEffects = ['compress', 'fade-in', 'hinge', 'lightspeed', 'scroll-up', 'scroll-down', 'slide', 'tilt-scroll', 'vertigo', 'zoom-in'];

  Fontana.Visualizer = (function() {
    function Visualizer(container, datasource) {
      this.container = container;
      this.datasource = datasource;
      this.paused = false;
      this.fetchMessagesTimer = -1;
      this.animationTimer = -1;
    }

    Visualizer.prototype.start = function(settings) {
      this.fetchMessages(true);
      this.container.empty();
      this.config(settings);
      return this.scheduleUpdateAllTimes();
    };

    Visualizer.prototype.config = function(settings) {
      var _this = this;
      transitionEffects.forEach(function(cls) {
        return _this.container.removeClass(cls);
      });
      if (settings && settings.transition && transitionEffects.indexOf(settings.transition) > -1) {
        return this.container.addClass(settings.transition);
      } else {
        return this.container.addClass(transitionEffects[0]);
      }
    };

    Visualizer.prototype.pause = function() {
      if (!this.paused) {
        clearTimeout(this.fetchMessagesTimer);
        clearTimeout(this.animationTimer);
        return this.paused = true;
      }
    };

    Visualizer.prototype.resume = function() {
      if (this.paused) {
        this.fetchMessages();
        this.animate();
        return this.paused = false;
      }
    };

    Visualizer.prototype.stop = function() {
      this.pause();
      return this.container.empty();
    };

    Visualizer.prototype.fetchMessages = function(initial) {
      var _this = this;
      if (initial == null) {
        initial = false;
      }
      return this.datasource.getMessages(function(data) {
        _this.renderMessages(data, initial);
        return _this.scheduleFetchMessages();
      });
    };

    Visualizer.prototype.renderMessages = function(messages, initial) {
      var _this = this;
      if (initial == null) {
        initial = false;
      }
      messages.reverse().forEach(function(message) {
        var messageNode;
        if (!$("#" + message.id).length) {
          if (message.entities) {
            message.text = twttr.txt.autoLinkWithJSON(message.text, message.entities, {
              targetBlank: true
            });
          } else {
            message.text = twttr.txt.autoLink(message.text, {
              targetBlank: true
            });
          }
          messageNode = $(nano(messageTemplate, message));
          _this.updateTime(messageNode);
          return _this.container.prepend(messageNode);
        }
      });
      if (initial) {
        return this.scheduleAnimation();
      }
    };

    Visualizer.prototype.animate = function() {
      var messages, next, prev;
      messages = $(".message", this.container);
      messages.removeClass("next next-one focus prev-one prev ");
      if (!this.current) {
        this.current = $(".message:first", this.container);
      } else {
        this.current = !this.current.next().length ? $(".message:first", this.container) : this.current.next();
      }
      next = this.current.next();
      if (!next.length) {
        next = $(".message:first", this.container);
      }
      this.current.addClass("focus");
      next.addClass("next-one");
      next.nextAll(":not(.focus)").addClass("next");
      prev = this.current.prev();
      if (!prev.length) {
        prev = $(".message:last", this.container);
      }
      prev.addClass("prev-one").removeClass("next");
      prev.prevAll(":not(.next-one):not(.next):not(.focus)").addClass("prev");
      return this.scheduleAnimation();
    };

    Visualizer.prototype.updateAllTimes = function() {
      var _this = this;
      $(".message", this.container).each(function(i, message) {
        return _this.updateTime(message);
      });
      return this.scheduleUpdateAllTimes();
    };

    Visualizer.prototype.updateTime = function(message) {
      var time;
      time = $(".time", message);
      return time.text(Fontana.utils.prettyDate(time.data("time")));
    };

    Visualizer.prototype.scheduleAnimation = function() {
      var delay,
        _this = this;
      delay = this.animationTimer === -1 ? 0 : 6000;
      return this.animationTimer = setTimeout((function() {
        return _this.animate();
      }), delay);
    };

    Visualizer.prototype.scheduleFetchMessages = function() {
      var _this = this;
      return this.fetchMessagesTimer = setTimeout((function() {
        return _this.fetchMessages();
      }), 30000);
    };

    Visualizer.prototype.scheduleUpdateAllTimes = function() {
      var _this = this;
      return setTimeout((function() {
        return _this.updateAllTimes();
      }), 10000);
    };

    return Visualizer;

  })();

  this.Fontana.Visualizer.transitionEffects = transitionEffects;

}).call(this);
