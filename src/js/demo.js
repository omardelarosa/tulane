(function () {
	var data = new Fontana.datasources.HTML($('#twitter-fontana'));
	var staticFontana = new Fontana.GUI(data, new Fontana.config.Settings());
	staticFontana.start($('#twitter-fontana'));

    // Make fullscreen buttons work
    $('.fullscreen').click(function (e) {
        e.preventDefault();
        Fontana.utils.requestFullscreen(document.getElementById('twitter-fontana'));
    });
}());

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

var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-30289566-2']);
_gaq.push(['_setDomainName', 'twitterfontana.com']);
_gaq.push(['_trackPageview']);

(function() {
    var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
    ga.src = 'http://www.google-analytics.com/ga.js';
    var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
})();
