/**
= Fontana Datasources =

There are three different types of Datasources:

 * Fontana.datasources.Static
 * Fontana.datasources.Twitter
 * Fontana.datasources.HTML

The datasource interface consist of the constructor taking one parameter.
This parameter differs per implementation.

The datastore provides an instance method `getMessages` that will trigger
a 'messages' event every time there are new messages.

Consumers can listen to the `messages` event by binding a callable that
takes one parameter: an array of messages.

Each datasource has a `stop` method. Calling this method will stop
the datasource from refreshing. This methods is a no-op for the Static
and HTML datasource, since they don't refresh anyway.

Calling `getMessags` will restart a stopped datasource.

== Static ==

A static datasource simply takes a hardcoded array of messages.

The messages themselves are javascript objects modeled after the JSON
response objects returned by http://search.twitter.com/search.json.

The following object describes a bare bones message:

    {
       'created_at': new Date().toString(),
       'text': 'A fake Tweet, in a fake JSON response',
       'from_user': 'tweetfontana',
       'profile_image_url': 'http://api.twitter.com/1/users/profile_image/tweetfontana'
   }

The static datasource will only trigger the `messages` event after
calling `getMessages`. Updating the set of messages is not supported.

== Twitter ==

The Twitter datasource takes a query that's used for
http://search.twitter.com/search.json.

Repeated calls to the datasource will return the most recent set of
tweets for the configured query.

After calling `getMessages` this datasource will poll Twitter for
new messages, triggering the `messages` event each time there are new
messages.

== HTML ==

Given a HTML node this datasource will try to find messages 
by looking for the following HTML:

    div class="fontana-message">
        <q>This is not a real Tweet, but it sure looks like one.</q>
        <cite>tweetfontana</cite>
    </div>

This is only done once on initialisation, this means that the HTML
datasource triggers the `messages` event each time `getMessages`
is called but will not detect any new messages added to the container.

== CrowdConvergence ==

This datasource will get messages from a given Crowd Convergence JSON feed URL.

This is only done once on initialisation!
*/


var Fontana = window.Fontana || {};


Fontana.datasources = (function ($) {
    var Static, Twitter, HTML, CrowdConvergence;

    /**
     * Static datasource.
     *
     * Constructor takes an array of message objects.
     */
    Static = function (data) {
        this.data = data;
    };

    Static.prototype.getMessages = function () {
        this.trigger('messages', this.data);
    };

    Static.prototype.stop = function () {};

    window.MicroEvent.mixin(Static);


    /**
     * Twitter datasource
     *
     * Constructor takes a query for Twitter's search API.
     */
    Twitter = function (q) {
        this.params = {
            'since_id': 1
        }
        this.search_url = '/api/twitter-search/?result_type=recent&callback=?';
        this.params.q = q;
        this.refreshTimeout = null;
    };

    Twitter.prototype.getMessages = function () {
        var self = this;
        $.getJSON(this.search_url, this.params, function (data, status) {
            var results;
            if (status === 'success') {
                results = self.transformMessages(data.statuses);
                if (results && results.length) {
                    self.updateSinceId(results);
                    self.trigger('messages', results);
                }
                else if (self.refreshTimeout == null) {
                    // Notify if there are no messages on the first try.
                    self.trigger('messages', [{
                        'created_at': new Date().toString(),
                        'text': 'Sorry, Twitter found no tweets matching your search&nbsp;terms.',
                        'from_user': 'tweetfontana',
                        'profile_image_url': '/img/twitterfontana.png'
                    }]);
                }
            }
            else {
                self.trigger('messages', [{
                    'created_at': new Date().toString(),
                    'text': 'Sorry, an error occurred while fetching&nbsp;tweets.',
                    'from_user': 'tweetfontana',
                    'profile_image_url': '/img/twitterfontana.png'
                }]);
            }
            self.refreshTimeout = window.setTimeout(function () {
                self.getMessages.call(self)
            }, 30 * 1000);
        });
    };

    /**
     * Covert the messages objects from the Twitter API response
     * to the Twitter Search response format.
     */
    Twitter.prototype.transformMessages = function (messages) {
        return $.map(messages, function (message) {
            var returnValue = $.extend({}, message);
            returnValue.from_user = message.user.screen_name;
            returnValue.profile_image_url = message.user.profile_image_url;
            return returnValue;
        });
    };

    Twitter.prototype.stop = function () {
        window.clearTimeout(this.refreshTimeout);
    };

    Twitter.prototype.updateSinceId = function (messages) {
        this.params.since_id = messages[0].id_str;
    };

    window.MicroEvent.mixin(Twitter);


    /**
    * HTML datasource
    *
    * Constructor takes a html node with "Tweets".
    */
    HTML = function (node) {
        this.node = node;
        this.data = [];
        this.parseMessages();
    };

    HTML.prototype.parseMessages = function () {
        var self = this;
        $('.fontana-message', this.node).each(function () {
            self.data.push({
                'created_at': new Date().toString(),
                'text': $(this).find('q').text(),
                'from_user': $(this).find('cite').text(),
                'profile_image_url': $(this).find('cite').data('profile-image-url')
            });
        });
    };

    HTML.prototype.getMessages = function () {
        this.trigger('messages', this.data);
    };

    HTML.prototype.stop = function () {};

    window.MicroEvent.mixin(HTML);


    /**
     * CrowdConvergence datasource
     *
     * Constructor takes a Crowd Convergence JSON feed URL.
     */
    CrowdConvergence = function (url) {
        this.url = url;
        this.params = {
            'since': Math.floor((new Date().getTime() - (24*60*60*1000)) / 1000)
        };
    };

    CrowdConvergence.url_re = /^https\:\/\/secure\.crowdconvergence\.com\/output\/json\/([\w-]+)\/([0-9]+)\/?$/;

    CrowdConvergence.prototype.validateUrl = function () {
        return CrowdConvergence.url_re.test(this.url);
    };

    /**
     * Covert the messages objects from the CrowdConvergence response
     * to the Twitter Search response format.
     */
    CrowdConvergence.prototype.transformMessages = function (messages) {
        return $.map(messages, function (message) {
            var returnValue = $.extend({}, message);
            returnValue.from_user = message.user_screen_name;
            returnValue.created_at = message.date_unix ? message.date_timestamp : new Date().toString();
            returnValue.html = message.text;
            returnValue.profile_image_url = message.profile_image_url || 'http://api.twitter.com/1/users/profile_image/CrowdConverge';
            return returnValue;
        });
    };

    CrowdConvergence.prototype.getMessages = function () {
        var self = this;
        if (self.validateUrl()) {
            $.ajax({
                url: this.url + '?callback=?',
                dataType: "jsonp",
                timeout: 60000,
                data: this.params
            })
            .success(function (data) {
                if (data.length) {
                    self.trigger('messages', self.transformMessages(data));
                    self.updateSince(data);
                }
                else {
                    // Notify if there are no messages on the first try.
                    self.trigger('messages', [{
                        'created_at': new Date().toString(),
                        'text': 'Sorry, there are no messages.',
                        'from_user': 'tweetfontana',
                        'profile_image_url': 'http://api.twitter.com/1/users/profile_image/tweetfontana'
                    }]);
                }
            })
            .error(function() {
                self.trigger('messages', [{
                    'created_at': new Date().toString(),
                    'text': 'Sorry, an error occurred while fetching&nbsp;messages.',
                    'from_user': 'tweetfontana',
                    'profile_image_url': 'http://api.twitter.com/1/users/profile_image/tweetfontana'
                }]);
            });
        }
        else {
            self.trigger('messages', [{
                'created_at': new Date().toString(),
                'text': 'Invalid Crowd Convergence feed url',
                'from_user': 'tweetfontana',
                'profile_image_url': 'http://api.twitter.com/1/users/profile_image/tweetfontana'
            }]);
        }
        self.refreshTimeout = window.setTimeout(function () {
            self.getMessages.call(self)
        }, 120 * 1000);
    };

    CrowdConvergence.prototype.stop = function () {
        window.clearTimeout(this.refreshTimeout);
    };

    CrowdConvergence.prototype.updateSince = function (messages) {
        var self = this;
        messages.map(function (message) {
            self.params.since = Math.max(self.params.since, message.date_unix);
        });
    };

    window.MicroEvent.mixin(CrowdConvergence);

    return {
        'Static': Static,
        'Twitter': Twitter,
        'HTML': HTML,
        'CrowdConvergence': CrowdConvergence
    };

}(window.jQuery));
