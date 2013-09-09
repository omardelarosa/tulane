import urllib
import urlparse
import requests
from requests_oauthlib import OAuth1

BASE_URL = 'https://api.twitter.com/'


class TwitterException(Exception):
    pass


def call_api(method, url, config, token=None, **kwargs):
    """
    Perform a request to the Twitter API
    """
    if token is None:
        auth = OAuth1(config['TWITTER'].get('consumer-key', ''),
                      config['TWITTER'].get('consumer-secret', ''))
    else:
        auth = OAuth1(config['TWITTER'].get('consumer-key', ''),
                      config['TWITTER'].get('consumer-secret', ''),
                      token['oauth_token'], token['oauth_token_secret'])
    return requests.request(method, urlparse.urljoin(BASE_URL, url),
                            auth=auth, **kwargs)


def request_token(config, callback_url):
    """
    Request an oauth token and returns the redirect url for Twitter
    sign in.

    This is step 1 and 2 of "Implementing Sign in with Twitter"
    https://dev.twitter.com/docs/auth/implementing-sign-twitter
    """
    response = call_api('post', 'oauth/request_token', config, data={
        'oauth_callback': callback_url
    })
    if response.status_code == 200:
        token = dict([(k, v[0]) for k,v in urlparse.parse_qs(response.text).items()])
        print token
        if token['oauth_callback_confirmed'] == 'true':
            return token
        else:
            raise TwitterException('oauth_callback_confirmed is not true')
    raise TwitterException(response.text)


def authenticate_url(token, callback_url):
    """
    Builds the authentication redirect url as described in
    step 2 of "Implementing Sign in with Twitter"
    https://dev.twitter.com/docs/auth/implementing-sign-twitter
    """
    params = {
        'oauth_token': token['oauth_token'],
        'oauth_callback': callback_url
    }
    qs = urllib.urlencode(params)
    return '%s%s?%s' % (BASE_URL, 'oauth/authenticate', qs)


def access_token(config, token):
    """
    Exchange a request token for an access token as described in step 3 of
    "Implementing Sign in with Twitter"
    https://dev.twitter.com/docs/auth/implementing-sign-twitter
    """
    response = call_api('post', 'oauth/access_token', config,
                        params={'oauth_token': token['oauth_token']},
                        data={'oauth_verifier': token['oauth_verifier']})
    return dict([(k, v[0]) for k,v in urlparse.parse_qs(response.text).items()])


def search(config, token, args):
    """
    Perform a search.
    """
    params = args.copy()
    params.update(token)
    response = call_api('get', '1.1/search/tweets.json', config, token, params=args)
    headers = {}
    for k, v in response.headers.items():
        if k in ['content-type', 'cache-control', 'pragma', 'expires'
                 'x-rate-limit-limit', 'x-rate-limit-remaining',
                 'x-rate-limit-reset']:
            headers[k] = v
    return (response.text, response.status_code, headers)
