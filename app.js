//setting up express
const express = require('express');
const app = express(); 

//setting up Twit, using config.js for credencials
const Twit = require('twit');
const twitConfig = require('./config.js');
const T = new Twit(twitConfig.config);
const count = 5; //number of items to get for each category

//setting up static data (css, images)
app.use('/static', express.static('public'));

//setting up the pug view engine
app.set('view engine', 'pug');

//getting twitter data
app.use((res, req, next) => {
    T.get('statuses/user_timeline', { 'count':count }, (err, data, response) => {
        console.log(data[0].text);
    });
    next();
});

//root route render
app.get('/', (req, res) => {
    res.render('index');
});

// Each rendered result must include all of the information seen in the sample layout:
// *tweets -message content -# of retweets -# of likes -date tweeted
// *friends -profile image -real name -screenname
// *messages -message body -date the message was sent -time the message was sent

// Your 5 most recent tweets.
// Your 5 most recent friends.
// Your 5 most recent private messages.


//listen for incoming traffic
app.listen(3000, () => {
    console.log('Twitter Interface is listening.');
});