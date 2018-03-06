/*****************************************
Treehouse Fullstack Javascript Techdegree,
project #7: "Build a Twitter Interface"
by Ole Petter Baugerød Stokke
www.olepetterstokke.no/treehouse/project7
******************************************
Express app using the Twitter’s REST API
to display the 5 last tweets, followers, 
and incoming messages from Twitter. Also 
let's you tweet. 
*****************************************/

/*****************************************
SETUP
getting all we need set up
*****************************************/

//set up express
const express = require('express');
const app = express(); 

//set up Twit (using config.js for credencials)
const Twit = require('twit');
const twitConfig = require('./config.js');
const T = new Twit(twitConfig.config);

//set up static data (css, images)
app.use('/static', express.static('public'));

//set up the pug view engine (using default \views-path)
app.set('view engine', 'pug');

//set up bodyparser (to get text from form)
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: false}));

//set up empty object to contain all info needed from Twitter
var twitterContainer = {};

//set up moment for timestamps
var moment = require('moment');

/*****************************************
MIDDLEWARE
filling our Twitter-object with data from the API
*****************************************/

//get messages
app.use((req, res, next) => {
    T.get('direct_messages', { 'count': 5 }, (err, data, response) => {        
        if (!err) {
            twitterContainer.messages = data;
            next();
        } else {
            console.log('Messages failed: ' + err.message);
            next(err);
        }
    });
});

//get friends
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

//get timeline
app.use((req, res, next) => {
    T.get('statuses/user_timeline', { 'count': 5 }, (err, data, response) => {
        if (!err) {
            twitterContainer.tweets = data;

            //change timestamp of each tweet, using moment
            twitterContainer.tweets.forEach(tweet => {
                tweet.created_at = moment(tweet.created_at).fromNow();
            });

            next();
            
        } else {
            console.log('Timeline failed: ' + err.message);
            next(err);
        }
    });
});

//ROUTES
//rendering root, posting tweets

//get request at root
app.get('/', (req, res) => {

    //render index with Twitter-data from twitterContainer
    res.render('index', {
        tweets: twitterContainer.tweets,
        friends: twitterContainer.friends,
        messages: twitterContainer.messages
    });
});

//post request at root - triggered from form, to post a tweet
app.post('/', (req, res) => {

    //tweet text from the tweet-textbox using bodyparser
    const tweet = req.body.tweet;

    T.post('statuses/update', {
        status: tweet
    });

    res.redirect('/'); //render site again to show new tweet
});

//routes for debug purposes
app.get('/json/timeline', (req, res) => {
    T.get('statuses/user_timeline', { 'count': 5 }, (err, data, response) => {        
        res.send(data);
    });
});

app.get('/json/messages', (req, res) => {
    T.get('direct_messages', { 'count': 5 }, (err, data, response) => {        
        res.send(data);
    });
});

app.get('/json/friends', (req, res) => {
    T.get('friends/list', { 'count': 5 }, (err, data, response) => {        
        res.send(data);
    });
});

app.get('/json/account', (req, res) => {
    T.get('account/verify_credentials', (err, data, response) => {        
        res.send(data);
    });
});

//////////////////
//ERROR HANDLING//
//////////////////

//404 error
app.use((req, res, next) => {
    const err = new Error ('404: Page not found.');
    next(err);
});

//render error page
app.use((err, req, res, next) => {
    res.render('error', { error : err }); 
});

////////////////
//SERVER SETUP//
////////////////

//listen for incoming traffic at port 3000, or env.PORT if deployed
app.listen(process.env.PORT || 3000, () => {
    console.log('Twitter Client is listening...');
});

/* 
TODO:
* ordne tidsgreia på tweets
* se over hva slags annen dummydata som ligger der
X fikse layouten
* sjekke om jeg bruker puggene riktig

moment
http://momentjs.com
*/