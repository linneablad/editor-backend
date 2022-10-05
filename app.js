require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const morgan = require('morgan');
const cors = require('cors');
const docs = require('./routes/docs');
const auth = require('./routes/auth');
const socketModel = require('./models/socketModel');
const authModel = require('./models/authModel');
const cookieParser = require('cookie-parser');
const { graphqlHTTP } = require('express-graphql');
const { GraphQLSchema } = require("graphql");
const RootQueryType = require("./graphql/root.js");

const app = express();
const port = process.env.PORT || 1337;
const httpServer = require("http").createServer(app);
const io = require("socket.io")(httpServer, {
    cors: {
        origin: "*"
    }
});

socketModel.connect(io);

app.use(cors({
    origin: "http://www.student.bth.se",
    credentials: true,
    //origin: "http://localhost:3000",
})); //Enable clients from other domains to fetch data from api

// don't show the log when it is test
if (process.env.NODE_ENV !== 'test') {
    // use morgan to log at command line
    app.use(morgan('combined')); // 'combined' outputs the Apache style LOGs
}

// This is middleware called for all routes.
// Middleware takes three parameters.
app.use((req, res, next) => {
    console.log(req.method);
    console.log(req.path);
    next();
});

//Middleware for handling parameters sent in Content-Type: application/json
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

app.use(cookieParser());

const visual = false;
const schema = new GraphQLSchema({
    query: RootQueryType
});

app.use('/graphql',
    (request, response, next) => authModel.checkToken(request, response, next),
    graphqlHTTP({
        schema: schema,
        graphiql: visual,
    })
);

app.use('/', docs);
app.use('/', auth);

// Add routes for 404 and error handling
// Catch 404 and forward to error handler
// Put this last
app.use((req, res, next) => {
    var err = new Error("Not Found");

    err.status = 404;
    //Send to the next middleware or default error handling to display error message if last
    next(err);
});

//My own error handler
app.use((err, req, res, next) => {
    if (res.headersSent) {
        return next(err);
    }

    res.status(err.status || 500).json({
        "errors": [
            {
                "status": err.status,
                "title":  err.message,
                "detail": err.message
            }
        ]
    });
});

// Start up server
const server = httpServer.listen(port, () => console.log(`Example API listening on port ${port}!`));

module.exports = server;
