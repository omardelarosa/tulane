# TwitterFontana

TwitterFontana is a backchannel visualisation solution for the Twitter
Search API v1.1.

The Twitter API connection backend is written in [Python] & [Flask] and the
Fontana visualisation frontend is written in [Jade], [SASS] and [CoffeeScript].

## Getting started

Alright, so there's some initial preparation and setup to perform to get
the project working and ready for development.

### Software

First of all, your development machine should be equipped with Python 2.6+
and preferably [virtualenv] and [virtualenvwrapper]. This should be no
problem on most Linux distributions, fairly easy on OS X and might be
somewhat challenging on Windows (I have no experience with Python on Windows).

For frontend development this project needs [nodejs + npm], [Grunt],
[CoffeeScript] and [SASS] to be available.

### Prepare

In order to use the Twitter API v1.1 you will need to create a
"application" at https://dev.twitter.com/.

Also load up a browser tab with http://randomkeygen.com/, we are going to need
a random secret key soon.

### Setup

With that out of the way, you can now "install" the project in a virtualenv:

``` shell
$ mkvirtualenv twitterfontana
$ workon twitterfontana
$ pip install -r requirements.txt
$ npm install
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

To verify if the frontend development part is working just run grunt,
if everything is working you should see this output:

``` shell
$ grunt
> Running "watch" task
> Waiting...
```

## Develop

Cool, you got the initial set up out of the way. Luckily you don't need to
do all of this each time you want to work on TwitterFontana. From now on just
run these commands to get a development server:

``` shell
$ workon twitterfontana
$ python backend/src/fontana.py backend/var/conf/fontana.conf
> * Running on http://127.0.0.1:5000/
```

And in another terminal window you can keep running Grunt:

``` shell
$ grunt
> Running "watch" task
> Waiting...
```



[Python]: http://www.python.org/
[Flask]: http://flask.pocoo.org/
[virtualenv]: http://www.virtualenv.org/
[virtualenvwrapper]: http://virtualenvwrapper.readthedocs.org/
[nodejs + npm]: http://nodejs.org/
[Grunt]: http://gruntjs.com/
[CoffeeScript]: http://coffeescript.org/
[SASS]: http://sass-lang.com/
[Jade]: http://jade-lang.com/
