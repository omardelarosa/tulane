# TwitterFontana

TwitterFontana is a backchannel visualisation solution for the Twitter
Search API v1.1.

The Twitter API connection backend is written in Python & Flask and the
Fontana visualisation frontend is written in HTML & CSS and
Javascript & jQuery.

## Getting started

Alright, so there's some initial preparation and setup to perform to get
the backend part working.

### Prepare

First of all, your development machine should be equipped with Python 2.6+
and preferably [virtualenv] and [virtualenvwrapper]. This should be no
problem on most Linux distributions, fairly easy on OS X and might be
somewhat challenging on Windows (I have no experience with Python on Windows).

Then, in order to use the Twitter API v1.1 you will need to create a
"application" at https://dev.twitter.com/.

Also load up a browser tab with http://randomkeygen.com/, we are going to need
a random secret key soon.

### Setup

With that out of the way, you can now "install" the backend in a virtualenv:

``` shell
$ mkvirtualenv twitterfontana
$ workon twitterfontana
$ pip install -r backend/requirements.txt
```

Then you'll need to create a config file, let's save it as
`backend/var/conf/fontana.conf`.

In this file, enter the credentials for the Twitter application you've created
and one of the random "Ft. Knox Passwords":

``` python
TWITTER = {
    'consumer-key': 'mYc0nsUm3rK3y',
    'consumer-secret': 'xtH1s1sSuP3rs3cREtX'
}

SECRET_KEY = '%S#cR3T$(~4re>Aws0me{;?='
```

### Verify

Now everything should be set up and configured. We can confirm this
by trying to sign in with Twitter.

First start the development server:

``` shell
$ python backend/src/fontana.py backend/var/conf/fontana.conf
> * Running on http://127.0.0.1:5000/
```

Now go to `http://localhost:5000/api/twitter/session/new/`.

If everything is working correctly you will be redirected to twitter.com
and asked to "Authorize your application to use your account".

After confirming access you will be redirected back to a page on
the development server with the plain text string "OK".

## Develop

Cool, you got the initial set up out of the way. Luckily you don't need to
do all of this each time you want to work on TwitterFontana. From now on just
run these commands to get a development server:

``` shell
$ workon twitterfontana
$ python backend/src/fontana.py backend/var/conf/fontana.conf
> * Running on http://127.0.0.1:5000/
```

Go to `http://127.0.0.1:5000/` in your favorite browser and check if
everything works.

[virtualenv]: http://www.virtualenv.org/
[virtualenvwrapper]: http://virtualenvwrapper.readthedocs.org/
