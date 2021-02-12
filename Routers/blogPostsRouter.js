const express = require('express'); //import express framework
const router = express.Router(); //desctruct router

const { BlogPost, Author } = require('../models');

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
    //you can query by "author" by querying the author id# or title by using the blog title ...for example:       http://localhost:8080/blog-posts/?author=5af50c84c082f1e92f834209  < -- this will find all blog posts by that author

    queryableFields.forEach(field => {
        if (req.query[field]) {
            filters[field] = req.query[field]
        }
    });

    console.log(filters);
    //Now query the database with the "filters" query object.
    BlogPost.find(filters)
        .then(posts => {
            console.log(posts);
            return res.status(200).json(posts.map(pst => pst.easyRead()));
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




/*To post you must include an object in the request body in the following json format:
{
    "title": "Temp jobs are kinda interesting",
    "author_id": "5af50c84c082f1e92f83420a", //important: need the author's id
    "content": "Blahh blahh. The blahhh blaa thing that bllaahhhhh in the blahhh blahhhh forest and blaah lake blahhh"
}
*/
router.post('/', (req, res) => {
    const requiredFields = ["title", "author_id", "content"];
    for (let i = 0; i < requiredFields.length; i++) {
        if (!(req.body[requiredFields[i]])) {
            const errMsg = `Missing "${requiredFields[i]}" field in body`;
            console.error(errMsg);
            res.status(400).send(errMsg);
            res.end();
        };
    };

    const { title, author_id, content } = req.body;

    // Check if the author exists before
    Author.findById(author_id)
        .then(athr => {
            console.log(athr);
            if (!athr) {
                res.status(400).send("Looks like that author doesn't exist.")
                return res.end();
            } else {
                return
            }
        })
        .catch(err => {
            const errMsg = {
                message: `Something's gone wrong during Authur check, sorry`,
                error: err
            };
            console.error(errMsg);
            res.status(500).json(errMsg);
        });//end of author check

    //Post now that we know author exists...
    BlogPost.create({ title, author: author_id, content, })
        .then(pst => {
            //create() returns the new blog with an "unpopulated" "author" key so we have to query it so that it sets off our mongoose.pre hook and populates our author.
            BlogPost.findById(pst.id)
                .then(populatedPost => {
                    console.log(populatedPost);
                    res.status(201).json(populatedPost.easyRead()).end();
                })
                .catch(err => {
                    const errMsg = {
                        message: `Something's gone wrong When qurying the newly created object to return to you, sorry`,
                        error: err
                    };
                    console.error(errMsg);
                    res.status(500).json(errMsg);
                });
        })
        .catch(err => {
            const errMsg = {
                message: `Something went wrong during creation of new blog post, sorry`,
                error: err
            };
            console.error(errMsg);
            res.status(500).json(errMsg);
        });

});
//-----------------------------------END of POST------------------------------------//



router.put('/comments/:postId', (req, res) => {
    //ensure body id and url id match
    if (req.params.postId !== req.body.id) {
        const errMsg = "Please ensure the req.body.id and url param postId match. Must include both.";
        console.error(errMsg);
        res.status(400).send(errMsg).end();
    };
    //make new object out of all valid fields in updateableFields.
    const requiredFields = ["author_id", "content"];
    const newComment = {};
    requiredFields.forEach(field => {
        if (field in req.body) {
            newComment[field] = req.body[field];
        };
    });

    console.log(newComment);

    BlogPost.findById(req.params.postId)
        .then(pst => {
            console.log(pst.comments);
            pst.comments.push({ author: newComment.author_id, content: newComment.content });
            pst.save()
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
//-----------------------------------END of PUT/comments------------------------------------//



router.put('/:id', (req, res) => {
    //ensure body id and url id match
    if (req.params.id !== req.body.id) {
        const errMsg = "Please ensure the req.body.id and url param id match. Must include both.";
        console.error(errMsg);
        res.status(400).send(errMsg).end();
    };

    //make new object out of all valid fields in updateableFields.
    const updateableFields = ["title", "content"];
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
