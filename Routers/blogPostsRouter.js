const express = require('express'); //import express framework
const router = express.Router(); //desctruct router
const { BlogPost } = require('../models');

const mongoose = require('mongoose');//import mongoose (Do we use mongoose in here?)
mongoose.Promise = global.Promise;// i don't think we're using this here....

//Get by :id
router.get("/:id", (req, res) => {
    BlogPost.findById(req.params.id)
        .then(pst => {
            return res.status(200).json(pst.easyRead());
        })
        .catch(err => {
            const errMsg = {
                message: `Internal Server Error, whoops, sorry!`,
                error: err
            }
            console.error(errMsg);
            res.status(500).send(errMsg);
        })//end of catch
});
//--------------------------------END of GET/:id-----------------------------------//


router.get('/', (req, res) => {
    //if search req.query object is empty, just return all posts
    if (Object.keys(req.query).length < 1) {
        console.log("no query specified. Getting ALL blogs");
        BlogPost.find()
            .then(posts => {
                return res.status(200).json(posts.map(post => post.easyRead()));
            });
    };

    console.log(req.query);

    const filters = {};
    const queryableFields = ["title", "author"];

    queryableFields.forEach(field => {
        if (req.query[field]) {
            filters[field] = req.query[field]
        }
    });

    //Now query the database with the "filters" query object.
    BlogPost.find(filters)
        .then(posts => {
            return res.status(200).json(posts.map(post => post.easyRead()));
        })
        .catch(err => {
            const errMsg = {
                message: `Something's gone wrong on our end, sorry`,
                error: err
            };
            console.error(errMsg);
            res.status(500).json(errMsg);
        });
});
//-----------------------------------END of GET------------------------------------//


router.post('/', (req, res) => {
    const requiredFields = ["title", "author", "content"];
    for (let i = 0; i < requiredFields.length; i++) {
        if (!(req.body[requiredFields[i]])) {
            const errMsg = `Missing "${requiredFields[i]}" field in body`;
            console.error(errMsg);
            res.status(400).send(errMsg);
            res.end();
        };
    };

    const { title, author, content } = req.body;
    BlogPost.create({ title, author, content, })
        .then(post => {
            return res.status(201).json(post.easyRead())
        })
        .catch(err => {
            const errMsg = {
                message: `Something's gone wrong on our end, sorry`,
                error: err
            };
            console.error(errMsg);
            res.status(500).json(errMsg);
        })
});
//-----------------------------------END of POST------------------------------------//


router.put('/:id', (req, res) => {
    //ensure body id and url id match
    if (req.params.id !== req.body.id) {
        const errMsg = "Please ensure the req.body.id and url param id match. Must include both.";
        console.error(errMsg);
        res.status(400).send(errMsg).end();
    };

    //make new object out of all valid fields in updateableFields.
    const updateableFields = ["title", "author", "content"];
    const newBody = {};
    updateableFields.forEach(field => {
        if (field in req.body) {
            newBody[field] = req.body[field];
        };
    });

    console.log(newBody);

    BlogPost.findByIdAndUpdate(req.params.id, { $set: newBody }, { new: true })
        .then(pst => {
            res.status(200).json(pst).end();
        })
        .catch(err => {
            const errMsg = {
                message: "Whoops, Internal Server error",
                error: err
            };
            console.error(errMsg);
            res.status(500).json(errMsg).end();
        });
});
//-----------------------------------END of PUT------------------------------------//


router.delete('/:id', (req, res) => {
    BlogPost.findByIdAndRemove(req.params.id)
        .then(() => {
            console.log(`Successfully deleted blog post with id of ${req.params.id}`);
            res.status(204).end();
        })
        .catch(err => {
            const errMsg = {
                message: "Whoops, Internal Server error",
                error: err
            };
            console.error(errMsg);
            res.status(500).json(errMsg).end();
        });
});
//-----------------------------------END of DELETE------------------------------------//



module.exports = router;
