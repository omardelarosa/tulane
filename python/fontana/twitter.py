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
CONFIG_FILE = os.path.abspath(os.path.join(os.path.dirname(__file__),
                                           '../twitter-auth.conf'))

app = Flask('twitter')
conf = ConfigObj(CONFIG_FILE)
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
    app.debug = True
    app.run()
