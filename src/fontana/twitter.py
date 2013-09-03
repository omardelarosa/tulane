import requests
import os.path
from configobj import ConfigObj
from flask import Flask, request
from requests_oauthlib import OAuth1

# The request url and the response headers we want to keep
URL = 'https://api.twitter.com/1.1/search/tweets.json'
RESPONSE_HEADERS = ['content-type', 'cache-control', 'pragma', 'expires'
                    'x-rate-limit-limit', 'x-rate-limit-remaining',
                    'x-rate-limit-reset']
BASE_DIR = os.path.dirname(__file__)

p = lambda d: os.path.abspath(os.path.join(BASE_DIR, d))
app = Flask('twitter')
conf = {
    'fontana': ConfigObj(p('../twitter-auth.conf')),
    'smashingconf':  ConfigObj(p('../smashingconf-auth.conf')),
}
conf_auth = lambda key: OAuth1(conf[key].get('consumer-key', ''),
                               conf[key].get('consumer-secret', ''),
                               conf[key].get('access-token', ''),
                               conf[key].get('access-secret', ''))
auth = {
    'fontana': conf_auth('fontana'),
    'smashingconf': conf_auth('smashingconf'),
}


def twitter_search(auth, args):
    response = requests.get(URL, auth=auth, params=args)
    headers = {}
    for k, v in response.headers.items():
        if k in RESPONSE_HEADERS:
            headers[k] = v
    return (response.text, response.status_code, headers)


@app.route('/api/twitter-search/')
def fontana():
    return twitter_search(auth['fontana'], request.args)


@app.route('/api/smashingconf/')
def smashingconf():
    return twitter_search(auth['smashingconf'], request.args)


if __name__ == "__main__":
    from werkzeug.wsgi import SharedDataMiddleware
    app.debug = True
    app.wsgi_app = SharedDataMiddleware(app.wsgi_app, {
        '/': p('../static/')
    })
    app.run()
