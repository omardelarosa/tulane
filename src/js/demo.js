(function () {
	var data = new Fontana.datasources.HTML($('#twitter-fontana'));
    var settings = new Fontana.config.Settings()
    var effect = [
        'Slide', 'Fade', 'Zoom', 'Compress', 'Scroll'
    ][Math.floor(Math.random() * 5)];
    settings.update({effect: effect, message_animate_interval: 3 * 1000});
	var staticFontana = new Fontana.GUI(data, settings);
	staticFontana.start($('#twitter-fontana'));

    // Make pause button work
    $('.pause').click(function (e) {
        e.preventDefault();
        if (staticFontana.paused) {
            staticFontana.resume();
            $(this).removeClass('paused');
        }
        else {
            staticFontana.pause();
            $(this).addClass('paused');
        }
    });

    // Make fullscreen buttons work
    $('.fullscreen').click(function (e) {
        e.preventDefault();
        Fontana.utils.requestFullscreen(document.getElementById('twitter-fontana'));
    });
}());


/* Twitter Tweet button */
!function(d,s,id){
    var js,fjs=d.getElementsByTagName(s)[0];
    if(!d.getElementById(id)){
        js=d.createElement(s);
        js.id=id;
        js.src="//platform.twitter.com/widgets.js";
        fjs.parentNode.insertBefore(js,fjs);
    }
}(document,"script","twitter-wjs");


/* Google Webfonts */
WebFontConfig = {
    google: { families: ['Open+Sans:400,600:latin,latin-ext'] }
};
(function() {
    var wf = document.createElement('script');
    wf.src = 'http://ajax.googleapis.com/ajax/libs/webfont/1/webfont.js';
    wf.type = 'text/javascript';
    wf.async = 'true';
    var s = document.getElementsByTagName('script')[0];
    s.parentNode.insertBefore(wf, s);
}());


/* Google Analytics*/
var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-30289566-2']);
_gaq.push(['_setDomainName', 'twitterfontana.com']);
_gaq.push(['_trackPageview']);

(function() {
    var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
    ga.src = 'http://www.google-analytics.com/ga.js';
    var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
})();


var _gauges = _gauges || [];
(function() {
    var t   = document.createElement('script');
    t.type  = 'text/javascript';
    t.async = true;
    t.id    = 'gauges-tracker';
    t.setAttribute('data-site-id', '4ffc0f6ff5a1f54c9f00003c');
    t.src = '//secure.gaug.es/track.js';
    var s = document.getElementsByTagName('script')[0];
    s.parentNode.insertBefore(t, s);
})();

