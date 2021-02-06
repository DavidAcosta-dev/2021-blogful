//imports
const express = require('express');
const morgan = require('morgan');

//create the express app
const app = express();

//import blogPosts router
const blogPostsRouter = require('./Routers/blogPostsRouter');



//apply middleware
app.use(morgan('common'));//log http layer
app.use(express.json())//parse incoming json from PUT or POST

app.use(express.static('public'));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/views/index.html');
});

app.use('/blog-posts', blogPostsRouter); //router middleware

let server;
//Starts our server and returns a Promise. 
//In our test code, we need a way of asynchronously starting our server, since we'll be dealing w/ promises there example: make http call, then after that's done check/expect it's an 'object', etc.. .
/* 
In this server.js module we actually don't care if the runServer is asynchronous because we are going to open the server to normal use and keep it open so this module can run in order from top to bottom (synchronously).
In testing however, we are constantly opening and closing the server to clear out the junk from each unit test so each unit test is run fairly with clean data.
So we need a way of making the tests run ONLY after the server is open. 
*/
//Since `app.listen` starts a new server but does NOT return a promise, we need to wrap it in one to make it async.
const runServer = () => {
    const port = process.env.PORT || 8080;
    return new Promise((resolve, reject) => {
        server = app
            .listen(port, () => {
                console.log(`Your app is listening on port ${port}`);
                resolve(server);
            }) //end of .listen() which created and ran a server.
            .on("error", err => {
                reject(err);
            })// end of .on() which is a more dynamic way of writing .catch()
    });//end of return new Promise
};
//----------------------End of RUNSERVER------------------------

// like `runServer`, this function also needs to return a promise.
// `server.close` does not return a promise on its own, so we manually
// create one.
const closeServer = () => {

    return new Promise((resolve, reject) => {
        console.log("CLOSING SERVER");
        server.close(err => {
            if (err) {
                console.error(err);
                console.log("Couldnt close")
                reject(err);
                return; //return so we don't call resolve as well
            };//end of if err

            //otherwise resolve since it closed fine without errors
            resolve();
        });//end of server.close
    });//--end of Promise
};
//-----------------------End of CLOSESERVER----------------------



//require.main is assigned to a module when that module is run directly from Node like when the npm start script auto-runs "node server.js".
//This is opposed to it being run from the testing module. We don’t want this to auto run when we import it/ require it in the shopping-list.TEST.js file which is what happens.

//So it's possible to determine if a file is run directly from node by testing if require.main === module      (module refers to the current module, this module)

if (require.main === module) {
    runServer()
        .catch(err => console.error(err));
};


module.exports = { app, runServer, closeServer };







