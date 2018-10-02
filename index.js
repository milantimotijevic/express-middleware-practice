const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());
// imitation of authentication middleware
app.use(function(req, res, next) {
    if(req.query.name === 'pera') {
        req.authentication = 'this guy is totally fine';
    }
    next();
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

app.get('/products', function(req, res, next) {
    if(req.authentication !== 'this guy is totally fine') {
        return res.send('BE GONE, SPAWN OF DARKNESS!');
    }
    res.send({
        inStock: ['Flying Broom', 'Human Decency', 'Used Screw Driver', 'Fake Mustache', 'Half Life 3 - Ultimate Edition']
    });
});

app.use(function(err, req, res, next) {
    console.log('logging error');
    console.log(err);
    res.status(500).send('OMG this is the end of the world!');
});

app.listen(3000, function() {
    console.log('Prismatic Core: Online');
});