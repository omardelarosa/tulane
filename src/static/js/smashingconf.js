/**
 * A Twitter Fontana with a settings panel and fullscreen option.
 */

$(function () {
    var settings, data, fontana, query;

    query = '#smashingconf OR @smashingconf OR #smashingconf2012 ' +
            'OR #smashingconf2013 OR smashingconf.com OR from:@smashingconf';

    // Create the settings and the settings panel
    settings = new Fontana.config.Settings();
    settings.update({
        effect: 'Scroll',
        font_face: "'Bree Serif', sans-serif",
        bg_color: '#4db7db',
        special_color: '#eb6933',
        text_color: '#333',
        box_bg: '#fff'
    });

    // Setup the actual fountain
    data = new Fontana.datasources.Twitter(query);
    data.search_url = '/api/smashingconf/?result_type=recent&callback=?';
    fontana = new Fontana.GUI(data, settings);
    fontana.start($('#twitter-fontana'));
});


/* Google Webfonts */
WebFontConfig = {
    google: { families: ['Bree+Serif::latin'] }
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
