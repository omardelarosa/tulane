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

p = lambda d:  os.path.abspath(os.path.join(BASE_DIR, d))
app = Flask('twitter')
conf = ConfigObj(p('../twitter-auth.conf'))
auth = OAuth1(conf.get('consumer-key', ''), conf.get('consumer-secret', ''),
              conf.get('access-token', ''), conf.get('access-secret', ''))


@app.route('/api/twitter-search/')
def hello():
    response = requests.get(URL, auth=auth, params=request.args)
    headers = {}
    for k, v in response.headers.items():
        if k in RESPONSE_HEADERS:
            headers[k] = v
    return (response.text, response.status_code, headers)


if __name__ == "__main__":
    from werkzeug.wsgi import SharedDataMiddleware
    app.debug = True
    app.wsgi_app = SharedDataMiddleware(app.wsgi_app, {
        '/': p('../static/')
    })
    app.run()
