(function() {
  var styles, transitions;

  styles = {
    TwitterFontana: {
      stylesheet: "/css/fontana.css",
      description: "TwitterFontana's default style"
    },
    Bootstrap: {
      stylesheet: "",
      description: "Just plain bootstrap"
    },
    Amelia: {
      stylesheet: "/bootstrap/amelia/bootstrap.min.css",
      description: "Sweet and cheery"
    },
    Cerulean: {
      stylesheet: "/bootstrap/cerulean/bootstrap.min.css",
      description: "A calm blue sky"
    },
    Cosmo: {
      stylesheet: "/bootstrap/cosmo/bootstrap.min.css",
      description: "An ode to Metro"
    },
    Cyborg: {
      stylesheet: "/bootstrap/cyborg/bootstrap.min.css",
      description: "Jet black and electric blue"
    },
    Flatly: {
      stylesheet: "/bootstrap/flatly/bootstrap.min.css",
      description: "Flat and modern"
    },
    Journal: {
      stylesheet: "/bootstrap/journal/bootstrap.min.css",
      description: "Crisp like a new sheet of paper"
    },
    Readable: {
      stylesheet: "/bootstrap/readable/bootstrap.min.css",
      description: "Optimized for legibility"
    },
    Simplex: {
      stylesheet: "/bootstrap/simplex/bootstrap.min.css",
      description: "Mini and minimalist"
    },
    Slate: {
      stylesheet: "/bootstrap/slate/bootstrap.min.css",
      description: "Shades of gunmetal gray"
    },
    Spacelab: {
      stylesheet: "/bootstrap/spacelab/bootstrap.min.css",
      description: "Silvery and sleek"
    },
    United: {
      stylesheet: "/bootstrap/united/bootstrap.min.css",
      description: "Ubuntu orange and unique font"
    }
  };

  transitions = {
    "Compress": "compress",
    "Fade-In": "fade-in",
    "Hinge": "hinge",
    "Lightspeed": "lightspeed",
    "Scroll-Down": "scroll-down",
    "Scroll-Up": "scroll-up",
    "Slide": "slide",
    "Tilt-Scroll": "tilt-scroll",
    "Vertigo": "vertigo",
    "Zoom-In": "zoom-in"
  };

  $(function() {
    var HTMLFontana, auth, checkSession, container, controls, fetchSettings, isSignedIn, isSignedOut, rigSearchBox, rigStyleSwitch, rigTransitionSwitch, settings, signIn, signOut, toggleFullscreen, toggleSettings, toggleViz, twitterFontana, visualizer;
    controls = $("#controls");
    signIn = $("#signin");
    signOut = $("#signout");
    auth = new Fontana.TwitterAuth();
    container = $(".fontana");
    visualizer = null;
    settings = null;
    fetchSettings = function() {
      return $.get("/pop/settings.html", {
        now: (new Date()).getTime()
      }).success(function(data) {
        settings = $(data);
        settings.css({
          position: "absolute",
          top: "40px",
          left: 0
        });
        $('form', settings).submit(function(e) {
          e.preventDefault();
          return false;
        });
        $('.close', settings).click(function() {
          return settings.hide();
        });
        rigSearchBox(settings);
        rigStyleSwitch(settings);
        rigTransitionSwitch(settings);
        return settings.appendTo(document.body);
      });
    };
    rigSearchBox = function(settings) {
      var input;
      input = $("#search", settings);
      if ($(document.body).hasClass("signedIn")) {
        input.attr("disabled", false);
        input.keypress(function(e) {
          if (e.which === 13) {
            e.preventDefault();
            input.change();
            return false;
          }
        });
        return input.change(function() {
          var q;
          q = $("#search", settings).val();
          if (q && q !== visualizer.datasource.q) {
            return twitterFontana({
              transition: $("#transition", settings).val()
            }, $("#search", settings).val());
          }
        });
      } else {
        return input.attr("disabled", true);
      }
    };
    rigStyleSwitch = function(settings) {
      var select;
      select = $("#bootswatch", settings);
      Object.keys(styles).forEach(function(key) {
        var style;
        style = styles[key];
        return select.append("<option value='" + style.stylesheet + "'>" + key + " &mdash; " + style.description + "</option>");
      });
      return select.change(function(e) {
        var stylesheet;
        $("link.bootswatch", document.head).remove();
        stylesheet = $(e.target).val();
        if (stylesheet) {
          return $("<link rel='stylesheet' href='" + stylesheet + "' class='bootswatch'>").insertAfter($('link.bootstrap'));
        }
      });
    };
    rigTransitionSwitch = function(settings) {
      var select;
      select = $("#transition", settings);
      Object.keys(transitions).forEach(function(key) {
        var transition;
        transition = transitions[key];
        return select.append("<option value='" + transition + "'>" + key + "</option>");
      });
      return select.change(function(e) {
        var transition;
        transition = $(e.target).val();
        visualizer.pause();
        visualizer.config({
          transition: transition
        });
        return visualizer.resume();
      });
    };
    toggleSettings = function() {
      if (!settings) {
        return fetchSettings();
      } else {
        return settings.toggle();
      }
    };
    toggleViz = function() {
      var icon;
      icon = $("[class*='icon-']", this);
      if (visualizer.paused) {
        icon.removeClass("icon-play");
        icon.addClass("icon-pause");
        return visualizer.resume();
      } else {
        icon.removeClass("icon-pause");
        icon.addClass("icon-play");
        return visualizer.pause();
      }
    };
    toggleFullscreen = function() {
      if (Fontana.utils.isFullScreen()) {
        return Fontana.utils.cancelFullScreen();
      } else {
        return Fontana.utils.requestFullScreen(document.body);
      }
    };
    checkSession = function() {
      return auth.activeSession(function(data) {
        if (data) {
          return isSignedIn(data);
        } else {
          return isSignedOut();
        }
      });
    };
    isSignedIn = function(data) {
      var userText;
      $(document.body).addClass('signedIn');
      userText = $(".navbar-text", signOut);
      userText.html(nano(userText.data("text"), data));
      signIn.addClass("hidden");
      signOut.removeClass("hidden");
      if (settings) {
        rigSearchBox(settings);
        return twitterFontana({
          transition: $("#transition", settings).val()
        }, $("#search", settings).val());
      } else {
        return twitterFontana();
      }
    };
    isSignedOut = function() {
      $(document.body).removeClass('signedIn');
      signIn.removeClass("hidden");
      signOut.addClass("hidden");
      if (settings) {
        rigSearchBox(settings);
        return HTMLFontana({
          transition: $("#transition", settings).val()
        });
      } else {
        return HTMLFontana();
      }
    };
    twitterFontana = function(settings, q) {
      var datasource;
      if (settings == null) {
        settings = {};
      }
      if (q == null) {
        q = "TwitterFontana";
      }
      if (visualizer) {
        visualizer.stop();
      }
      datasource = new Fontana.datasources.TwitterSearch(q);
      visualizer = new Fontana.Visualizer(container, datasource);
      return visualizer.start(settings);
    };
    HTMLFontana = function(settings) {
      if (settings == null) {
        settings = {};
      }
      if (visualizer) {
        visualizer.stop();
      }
      visualizer = new Fontana.Visualizer(container, HTMLFontana.datasource);
      return visualizer.start(settings);
    };
    HTMLFontana.datasource = new Fontana.datasources.HTML(container);
    HTMLFontana.datasource.getMessages();
    $(".settings", controls).click(function() {
      return toggleSettings.call(this);
    });
    $(".pause-resume", controls).click(function() {
      return toggleViz.call(this);
    });
    $(".fullscreen", controls).click(function() {
      return toggleFullscreen.call(this);
    });
    $("button", signIn).click(function() {
      return auth.signIn(checkSession);
    });
    $("button", signOut).click(function() {
      return auth.signOut(checkSession);
    });
    $("#logos .close").click(function() {
      return $(this).parent().remove();
    });
    return checkSession();
  });

}).call(this);

/*
# Fontana Twitter authentication
*/


(function() {
  if (this.Fontana == null) {
    this.Fontana = {};
  }

  this.Fontana.TwitterAuth = (function() {
    function TwitterAuth() {}

    TwitterAuth.prototype.activeSession = function(callback) {
      return $.get('/api/twitter/session/').success(function(data) {
        return callback(data);
      }).error(function() {
        return callback(null);
      });
    };

    TwitterAuth.prototype.signIn = function(callback) {
      var funcName, height, left, top, url, width, windowFeatures, windowName;
      funcName = String.fromCharCode(Math.floor(Math.random() * 24) + 65) + (new Date()).getTime();
      window[funcName] = callback;
      width = 700;
      height = 700;
      left = (window.screen.width + width) / 2;
      top = (screen.height + height) / 2;
      url = "/api/twitter/session/new/?next=/pop/twitter_success.html" + encodeURIComponent("?callback=" + funcName);
      windowName = "twitterFontanaLogin";
      windowFeatures = "location=0,menubar=0,status=0,width=" + width + ",height=" + height + ",top=" + top + ",left=" + left;
      return window.open(url, windowName, windowFeatures).focus();
    };

    TwitterAuth.prototype.signOut = function(callback) {
      return $.post('/api/session/clear/').success(callback);
    };

    return TwitterAuth;

  })();

}).call(this);
