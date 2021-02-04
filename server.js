//imports
const express = require('express');
const morgan = require('morgan');

//import blogPosts router
const blogPostsRouter = require('./Routers/blogPostsRouter');

//create the express app
const app = express();

//apply middleware
app.use(morgan('common'));//log http layer
app.use(express.json())//parse incoming json from PUT or POST

app.use(express.static('public'));
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/views/index.html');
});

app.use('/blog-posts', blogPostsRouter); //router middleware

app.listen(process.env.PORT || 8080, () => {
    console.log(`Your app is listnening on port ${process.env.PORT || 8080}`);
})