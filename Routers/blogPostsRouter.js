const express = require('express'); //import express framework
const router = express.Router(); //desctruct router

const { BlogPosts } = require('../models');//import model


const initialBlogs = [
    {
        title: "life is amazing",
        author: "David Acosta",
        content: "wow, there is so much to see in the world. Let's go! We shouldn't wait any longer!"

    },
    {
        title: "How to Draw",
        author: "Bee space",
        content: "Fish cakes! I haven't had these in forever!"

    },
    {
        title: "Love yourself",
        author: "Lany Acosta",
        content: "The truth is in you. You don't need approval. leave it. pick yourself up, dust yourself off and walk. you are alive! :)"

    }
];

for (let i = 0; i < initialBlogs.length; i++) {
    const { title, author, content } = initialBlogs[i];
    BlogPosts.create(title, content, author);
};

router.get('/', (req, res) => {
    res.status(200).json(BlogPosts.get());
});
//-----------------------------------END of GET------------------------------------//


router.post('/', (req, res) => {
    const requiredFields = ["title", "author", "content"];
    for (let i = 0; i < requiredFields.length; i++) {
        if (!req.body[requiredFields[i]] || (req.body[requiredFields[i]].trim().length < 1)) {
            const errMsg = `Missing "${requiredFields[i]}" field in body`;
            console.error(errMsg);
            res.status(400).send(errMsg);
            res.end();
        };
    };

    const { title, author, content } = req.body;

    const post = BlogPosts.create(title, content, author, req.body.publishDate || null);
    res.status(201).json(post);
    res.end();
});
//-----------------------------------END of POST------------------------------------//


router.put('/:id', (req, res) => {
    const requiredFields = ["title", "content", "author", "publishDate", "id"];
    for (let i = 0; i < requiredFields.length; i++) {
        if (!req.body[requiredFields[i]]) {
            const errorMsg = `Missing "${requiredFields[i]}" field in body.`;
            console.error(errorMsg);
            res.status(400).send(errorMsg);
            res.end();
        }
    };

    //destruct req.body and urlId since they exist
    const { title, content, author, publishDate, id } = req.body;
    const urlId = req.params.id;
    //validate urlId and body id match
    if (urlId !== id) {
        const errorMsg = 'url id and req.body id do not match';
        console.error(errorMsg);
        res.status(400).send(errorMsg);
        res.end();
    };

    const updatedItem = BlogPosts.update({ title, content, author, publishDate, id });
    res.status(200).json(updatedItem);
    res.end();
});
//-----------------------------------END of PUT------------------------------------//


router.delete('/:id', (req, res) => {
    BlogPosts.delete(req.params.id);
    res.status(204).end();
});
//-----------------------------------END of DELETE------------------------------------//



module.exports = router;
