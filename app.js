/*****************************************
Treehouse Fullstack Javascript Techdegree,
project #7: "Build a Twitter Interface"
- Express app using Twitter’s REST API
by Ole Petter Baugerød Stokke
www.olepetterstokke.no/treehouse/project7
******************************************
    
/*****************************************
    SETUP
    getting all we need set up
*****************************************/

//set up express
const express = require('express');
const app = express(); 

//set up Twit (using ./config.js for credencials)
const Twit = require('twit');
const twitConfig = require('./config.js');
const T = new Twit(twitConfig);

//set up static data (css, images)
app.use('/static', express.static('public'));

//set up the pug view engine (using default /views path)
app.set('view engine', 'pug');

//set up bodyparser (to get text from form)
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: false}));

//set up empty object to contain all data from Twitter
var twitterContainer = {};

//set up momentJS for timestamps
var moment = require('moment');

/*****************************************
    MIDDLEWARE
    collecting data from the API
*****************************************/

//get timeline
app.use((req, res, next) => {
    T.get('statuses/user_timeline', { 'count': 5 }, (err, data, response) => {
        if (!err) {
            twitterContainer.tweets = data; //add "tweets" property, populate with "data"

            twitterContainer.tweets.forEach(tweet => { //modify timestamp of each tweet, using moment
                tweet.created_at = moment(tweet.created_at).fromNow();
            });

            next();
            
        } else { //if the request fails
            console.log('Timeline failed: ' + err.message);
            next(err); //engage error handler with current error
        }
    });
});

//get followers ("friends")
app.use((req, res, next) => {
    T.get('friends/list', { 'count': 5 }, (err, data, response) => {
        if (!err) {
            twitterContainer.friends = data.users;
            next();
        } else {
            console.log('Friends failed: ' + err.message);
            next(err);
        }
    });
});

//get messages
app.use((req, res, next) => {
    T.get('direct_messages', { 'count': 5 }, (err, data, response) => {        
        if (!err) {
            twitterContainer.messages = data;

            twitterContainer.messages.forEach(message => {
                message.created_at = moment(message.created_at).fromNow();
            });

            next();
        } else {
            console.log('Messages failed: ' + err.message);
            next(err);
        }
    });
});

//get user account
app.use((req, res, next) => {
    T.get('account/verify_credentials', (err, data, response) => {
        if (!err) {
            twitterContainer.account = data;
            next();
        } else {
            console.log('Account failed: ' + err.message);
            next(err);
        }
    });
});

/*****************************************
    ROUTES
    rendering root & posting tweets
*****************************************/

//get request at root
app.get('/', (req, res) => {
    res.render('index', { //render index.pug with all Twitter data
        tweets: twitterContainer.tweets,
        friends: twitterContainer.friends,
        messages: twitterContainer.messages,
        account: twitterContainer.account
    });
});

//post request at root (triggered by form submit)
app.post('/', (req, res) => {
    const tweet = req.body.tweet; //get tweet from the textarea "tweet"

    T.post('statuses/update', {status: tweet}, (err, data, response) => { //post the tweet
        if (!err) {
            res.redirect('/'); //show new tweet by re-rendering root
        } else {
            console.log('Tweeting failed: ' + err.message);
            next(err);
        }            
    });
});

/*****************************************
    ERROR HANDLING
    making a 404 error & handling errors
*****************************************/

//404 error at unkown routes
app.use((req, res, next) => {
    const err = new Error ('Page not found.'); //generate the error
    next(err); //pass error to error handler
});

//our error handler middleware
app.use((err, req, res, next) => { //called by doing a next(err)
    res.render('error', { error : err }); //render error.pug with current "err" object
});

/*****************************************
    SERVER SETUP
    listen for incoming traffic
*****************************************/

//listen at port 3000, or env.PORT if app is deployed
app.listen(process.env.PORT || 3000, () => {
    console.log('Twitter Client is listening...');
});