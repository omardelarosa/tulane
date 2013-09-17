(function() {
  var styles, transitions;

  styles = {
    Bootstrap: {
      stylesheet: "",
      description: "Default style"
    },
    Amelia: {
      stylesheet: "/bootswatch/amelia/bootstrap.min.css",
      description: "Sweet and cheery"
    },
    Cerulean: {
      stylesheet: "/bootswatch/cerulean/bootstrap.min.css",
      description: "A calm blue sky"
    },
    Cosmo: {
      stylesheet: "/bootswatch/cosmo/bootstrap.min.css",
      description: "An ode to Metro"
    },
    Cyborg: {
      stylesheet: "/bootswatch/cyborg/bootstrap.min.css",
      description: "Jet black and electric blue"
    },
    Flatly: {
      stylesheet: "/bootswatch/flatly/bootstrap.min.css",
      description: "Flat and modern"
    },
    Journal: {
      stylesheet: "/bootswatch/journal/bootstrap.min.css",
      description: "Crisp like a new sheet of paper"
    },
    Readable: {
      stylesheet: "/bootswatch/readable/bootstrap.min.css",
      description: "Optimized for legibility"
    },
    Simplex: {
      stylesheet: "/bootswatch/simplex/bootstrap.min.css",
      description: "Mini and minimalist"
    },
    Slate: {
      stylesheet: "/bootswatch/slate/bootstrap.min.css",
      description: "Shades of gunmetal gray"
    },
    Spacelab: {
      stylesheet: "/bootswatch/spacelab/bootstrap.min.css",
      description: "Silvery and sleek"
    },
    United: {
      stylesheet: "/bootswatch/united/bootstrap.min.css",
      description: "Ubuntu orange and unique font"
    }
  };

  transitions = {
    'Scroll-Down': 'scroll-down',
    'Scroll-Up': 'scroll-up',
    'Lightspeed': 'lightspeed',
    'Hinge': 'hinge'
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
          return $(document.head).append("<link rel='stylesheet' href='" + stylesheet + "' class='bootswatch'>");
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
      icon = $(".glyphicon", this);
      if (visualizer.paused) {
        icon.removeClass("glyphicon-play");
        icon.addClass("glyphicon-pause");
        return visualizer.resume();
      } else {
        icon.removeClass("glyphicon-pause");
        icon.addClass("glyphicon-play");
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
    return checkSession();
  });

}).call(this);
