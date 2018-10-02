const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/middlewarepracticedb');
mongoose.connection.on('open', function() {
    console.log('Connection with DB established');
});