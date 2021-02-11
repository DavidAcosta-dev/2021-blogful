const { Router } = require('express');
const express = require('express');
const router = express.Router();

//importing BlogPost model in here as well since we will be performing actions that require us to use it for the sake of the author. example: get the author's entire works or his latest entry.
const { Author, BlogPost } = require('../models');


// Get authors
router.get('/', (req, res) => {
    Author.find()
        .then(authors => {
            res.status(200).json(authors).end();
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
//--------------------------------END of GET-----------------------------------//


// Post author
router.post('/', (req, res) => {
    //field validation:
    const requiredFields = ["firstName", "lastName", "userName"];
    const missingFields = [];
    for (let i = 0; i < requiredFields.length; i++) {
        if (!(req.body[requiredFields[i]])) {
            missingFields.push(requiredFields[i]);
            console.log(`missing field: ${requiredFields[i]}`);
        }
    }//end of for loop

    //if any fields are missing, send error message and end.
    if (missingFields.length < 0) {
        const errMsg = `looks like your missing the required fields to post: ${missingFields}`;
        console.error(errMsg);
        return res.status(400).send(errMsg).end();
    };

    //desctruct now that we know all fields exist
    const { firstName, lastName, userName } = req.body;

    Author
        .create({ firstName, lastName, userName })
        .then(athr => {
            res.status(201).json(athr).end();
        })
        .catch(err => {
            const errMsg = {
                message: "Author creation failed. check below for details",
                error: err
            };
            console.error(errMsg);
            res.status(400).json(errMsg).end();
        });

});
//--------------------------------END of POST-----------------------------------//


router.put('/:id', (req, res) => {
    //validate ids exist and match
    if (!(req.params.id || req.body.id) || (req.params.id !== req.body.id)) {
        const errMsg = "Please check that your id in the url matches the id in the request body.";
        console.error(errMsg);
        res.status(400).json(errMsg).end();
    };

    const newItem = {};
    const updateableFields = ["firstName", "lastName", "userName"];
    updateableFields.forEach(field => {
        if (field in req.body) {
            newItem[field] = req.body[field];
        };
    });//end of forEach

    Author.findOne({ userName: newItem.userName || "", _id: { $ne: req.params.id } })
        .then(athr => {
            if (athr) {
                const message = `Whoops, looks like ${newItem.userName} is already taken`;
                console.error(message);
                return res.status(400).send(message).end();
            }
            else {
                Author.findByIdAndUpdate(req.params.id, { $set: newItem }, { new: true })
                    .then(updatedAthr => {
                        res.status(200).json(updatedAthr).end();
                    })
                    .catch(err => {
                        const errMsg = 'Something went wrong here with findByIdAndUpdate';
                        console.error(err);
                        res.status(500).json({ message: errMsg, error: err });
                    });//end of catch
            }
        })
        .catch(err => {
            const errMsg = 'Something went wrong here with findOne';
            console.error(err);
            res.status(500).json({ message: errMsg, error: err });
        })//end of catch

});
//--------------------------------END of PUT-----------------------------------//


router.delete('/:id', (req, res) => {
    BlogPost.remove({ author: req.params.id })
        .then(() => {
            Author.findByIdAndRemove(req.params.id)
                .then(() => {
                    const message = `Deleted author with id of ${req.params.id}.\n Deleted all blog posts by author with id: ${req.params.id}.`;
                    console.log(message);
                    res.status(204).end();
                })
                .catch(err => {
                    const errMsg = 'Something went wrong here with Author.findByIdAndRemove';
                    console.error(err);
                    res.status(500).json({ message: errMsg, error: err });
                });//end of catch
        })
        .catch(err => {
            const errMsg = 'Something went wrong here with BlogPost.remove';
            console.error(err);
            res.status(500).json({ message: errMsg, error: err });
        });//end of catch
});
//--------------------------------END of DELETE-----------------------------------//


module.exports = router;