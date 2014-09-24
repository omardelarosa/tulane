import flask
import json
import os
import sys
from fontana import twitter

app = flask.Flask('fontana')


def twitter_authorisation_begin():
    """
    Step 1 and 2 of the Twitter oAuth flow.
    """
    callback = absolute_url('twitter_signin')
    if 'next' in flask.request.args:
        callback = '%s?next=%s' % (callback, flask.request.args['next'])
    try:
        token = twitter.request_token(app.config, callback)
        flask.session['twitter_oauth_token'] = token['oauth_token']
        flask.session['twitter_oauth_token_secret'] = token['oauth_token_secret']
        return flask.redirect(twitter.authenticate_url(token, callback))
    except twitter.TwitterException, e:
        return flask.abort(403, str(e))


def twitter_authorisation_done():
    """
    Step 3 of the Twitter oAuth flow.
    """
    if 'oauth_token' in flask.request.args:
        token = flask.request.args
        if flask.session['twitter_oauth_token'] != token['oauth_token']:
            return flask.abort(403, 'oauth_token mismatch!')
        auth = twitter.access_token(app.config, token)
        flask.session['twitter_oauth_token'] = auth['oauth_token']
        flask.session['twitter_oauth_token_secret'] = auth['oauth_token_secret']
        flask.session['twitter_user_id'] = auth['user_id']
        flask.session['twitter_screen_name'] = auth['screen_name']
        if 'next' in flask.request.args:
            return flask.redirect(flask.request.args['next'])
        else:
            return 'OK'
    elif 'denied' in  flask.request.args:
        return flask.abort(403, 'oauth denied')
    else:
        return flask.abort(403, 'unknown sign in failure')


@app.route('/api/twitter/session/new/')
def twitter_signin():
    """
    Handles the Twitter oAuth flow.
    """
    args = flask.request.args
    if not args or (len(args) == 1 and 'next' in args):
        return twitter_authorisation_begin()
    else:
        return twitter_authorisation_done()


@app.route('/api/twitter/session/')
def twitter_session():
    """
    Check for an active Twitter session. Returns a JSON response with the
    active sceen name or a 403 if there is no active session.
    """
    if not flask.session.get('twitter_user_id'):
        return flask.abort(403, 'no active session')
    return (json.dumps({
                'screen_name': flask.session['twitter_screen_name']
            }), 200, {'content-type': 'application/json'})


@app.route('/api/twitter/search/')
def twitter_search():
    """
    Perform a Twitter search
    """
    if not flask.session.get('twitter_user_id'):
        return flask.abort(403, 'no active session')
    token = {
        'oauth_token': flask.session['twitter_oauth_token'],
        'oauth_token_secret': flask.session['twitter_oauth_token_secret']
    }
    return twitter.search(app.config, token, flask.request.args)


@app.route('/api/session/clear/', methods=['POST'])
def signout():
    """
    Perform a sign out, clears the user's session.
    """
    flask.session.clear()
    return 'OK'


def absolute_url(name):
    """
    Flask's url_for with added SERVER_NAME
    """
    host = app.config['SERVER_NAME'] or 'localhost:5001'
    url = flask.url_for(name)
    return 'http://%s%s' % (host, url)


def devserver(extra_conf=None):
    """
    Start a development server
    """
    from werkzeug.wsgi import SharedDataMiddleware
    # Load the "example" conf
    root = app.root_path.split(os.path.dirname(__file__))[0]
    conf = os.path.join(root, 'backend', 'var', 'conf', 'fontana-example.conf')
    app.config.from_pyfile(conf)
    if extra_conf:
        app.config.from_pyfile(os.path.join(root, extra_conf))
    # Serve the frontend files
    app.wsgi_app = SharedDataMiddleware(app.wsgi_app, {
        '/': app.config['STATIC_DIR']
    })
    # Setup a index.html redirect for convenience sake.
    app.route('/')(lambda: flask.redirect('index.html'))
    # Run the development server
    app.run(port=5001)


if __name__ == "__main__":
    # This will get invoked when you run `python backend/src/fontana.py`
    if len(sys.argv) == 2:
        devserver(sys.argv[1])
    else:
        devserver()
