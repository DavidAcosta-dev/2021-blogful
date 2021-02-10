"use strict";
//import mongoose. Going to use it's library to create schemas
const mongoose = require("mongoose");


//Declare BlogPosts schema.
//Describe the keys of what a blog post should look like. 
const blogPostSchema = mongoose.Schema({
    author: {
        firstName: String,
        lastName: String
    },
    title: { type: String, required: true },
    content: { type: String, required: true },
    created: { type: Date, default: Date.now }

});//end of schema declaration

//NOTE: Arrow functions DO NOT WORK with mongoose virtuals or instance methods.
//Virtual property that the model has access to because it gets created here.
blogPostSchema.virtual("authorFullName").get(function () {
    return `${this.author.firstName} ${this.author.lastName}`.trim();
});

// this is an *instance method* which will be available on all instances
// of the blog post object (not the model. It will not be available to BlogPost only to the blog object living in database). 
//This method will be used to return an object that only
// exposes *some* of the fields we want from the underlying data.
//***This should be used for easy to read API features. we don't
//want to give the client the author name as an object with the first and
//last name divided.
//(There is actually nothing special about instance methods. They are made
// pretty much the same way that class methods are made on class objects.)
blogPostSchema.methods.easyRead = function () {

    return {
        id: this._id,
        author: this.authorFullName,
        content: this.content,
        title: this.title,
        created: this.created
    }

};

const BlogPost = mongoose.model("BlogPost,", blogPostSchema, "blogPosts");

module.exports = { BlogPost };