const express = require('express');
const bodyParser = require('body-parser');
const randomstring = require("randomstring");
require('./db-handler');
const User = require('./model/User');

const app = express();
app.use(bodyParser.json());
// error handler
app.use(function(err, req, res, next) {
    console.log('logging error');
    console.log(err);
    res.status(500).send('OMG this is the end of the world!');
});

// // imitation of authentication middleware
// app.use(function(req, res, next) {
//     if(req.query.name === 'pera') {
//         req.authentication = 'this guy is totally fine';
//     }
//     next();
// });

app.post('/register', function(req, res, next) {
    const user = req.body;
    if(!user || !user.email || !user.password) {
        return res.status(400).send('I BEG TO DIFFER!');
    }
    const newUser = new User(user);
    newUser.save(function(err, result) {
        if(err) throw err;
        res.send('Registration successful :))))))');
    });
});

app.post('/login', function(req, res, next) {
    const token = randomstring.generate();
    const tokenExpiration = new Date();
    tokenExpiration.setMinutes(tokenExpiration.getMinutes() + 1);
    User.findOneAndUpdate({email: req.body.email, password: req.body.password}, {$set: {token: token, tokenExpiration: tokenExpiration}, }, {new: true}, function(err, result) {
        if(err) throw err;
        if(!result) {
            return res.status(400).send('HA! Nice try, Mr. Hacker!');
        }
        res.set('token', result.token);
        res.send('All good, check headers for access token :))))');
    });
});

// another imitation of authentication middleware
app.use(function(req, res, next) {
    User.findOne({token: req.headers.token}, function(err, result) {
        if(err) throw err;
        const now = new Date();
        if(!result || !result.tokenExpiration || now > result.tokenExpiration) {
            return res.status(400).send('YOUUUUUUUU SHALL NOOOOOOT...... PAAAAAAAAAAASSSSS!!!');
        }
        req.user = result;
        next();
    });
});


app.get('/stuff', function(req, res, next) {
    console.log('logging from /stuff');
    const name = req.query.name;
    if(name === 'pera') {
        return res.send('greetings!');
    }
    // just calling next() with no args moves onto another handler function (see below example for multiple handle functions associated with a single route); passing anything other than 'route' causes express to seek first available error handling middleware (arg will be treated as err); passing 'route' means 'skip all handlers associated with this endpoint and look for another matching endpoint'
    next({errorType: 'User messed up big time...'});
});

app.get('/whatever', function(req, res, next) {
    console.log('logging from 1st handler function');
    next();
}, function(req, res, next) {
    console.log('logging from 2nd handler function');
    next();
}, function(req, res, next) {
    console.log('logging from 3rd handler function');
    next('route');
}, function(req, res, next) {
    console.log('logging from 4th handler function');
    res.send('The circle is now complete');
});

app.get('/whatever', function(req, res, next) {
    console.log('logging from post whatever');
    res.send('To bear a Ring of Power is to be alone.');
});

// used with first imitation of authentication middleware
app.get('/products', function(req, res, next) {
    if(req.authentication !== 'this guy is totally fine') {
        return res.send('BE GONE, SPAWN OF DARKNESS!');
    }
    res.send({
        inStock: ['Flying Broom', 'Human Decency', 'Used Screw Driver', 'Fake Mustache', 'Half Life 3 - Ultimate Edition']
    });
});

app.get('/employees', function(req, res, next) {
    res.send({
        employees: ['Pera Peric', 'Mika Mikic', 'Your Mom']
    });
    refreshToken(req.user);
});

function refreshToken(user) {
    const tokenExpiration = new Date();
    tokenExpiration.setMinutes(tokenExpiration.getMinutes() + 1);
    user.tokenExpiration = tokenExpiration;
    user.save(function(err, result) {
        if(err) throw err;
        // token updated
    });
}

app.listen(3000, function() {
    console.log('Prismatic Core: Online');
});