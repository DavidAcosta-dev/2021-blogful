"use strict";
//import mongoose. Going to use it's library to create schemas
const mongoose = require("mongoose");


//declare author schema
const authorSchema = mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    userName: { type: String, required: true, unique: true }
});

//Declare subdocument comments schema
const commentSchema = mongoose.Schema({
    content: { type: String },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'Author' },
    created: { type: Date, default: Date.now }
});


//Declare blog post schema.
//Describe the keys of what a blog post should look like. 
//NOTE:comments property is an array of "commentSchema" subdocument referencing commentSchema
/*NOTE: “author” points to a specific author id (which is a mongo ObjectId _id), 
        the ref is pointing to/referencing the 'Author' model we declared below which uses the authorSchema.
        The 'Author' model declaration below of course points to the "authors" db collection in it's 3rd argument.*/
const blogPostSchema = mongoose.Schema({
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'Author' },
    title: { type: String, required: true },
    content: { type: String, required: true },
    comments: [commentSchema],
    created: { type: Date, default: Date.now }

});//end of schema declaration


/*use a pre-hook Mongoose Query middleware when using BlogPost.findOne so we can pre-populate the 'author' key
  on the blogPost object, activating the reference we defined in the blogPostSchema. */
// findOne must go before find sice this is middleware and one is executed after the other, hence the "next()"...
blogPostSchema.pre('findOne', function (next) {
    this.populate(['author', 'comments.author']); //this populates both the blog author and all the comment author.
    //this.populate('author');
    // this.populate('comments.author');
    next();
});

blogPostSchema.pre('find', function (next) {
    this.populate(['author', 'comments.author']);
    //this.populate('author');
    // this.populate('comments.author');
    next();
});

//NOTE: Arrow functions DO NOT WORK with mongoose virtuals or instance methods.
//Virtual property that the model has access to because it gets created here.
blogPostSchema.virtual("authorFullName").get(function () {
    return `${this.author.firstName} ${this.author.lastName}`.trim();
});

commentSchema.virtual("authorFullName").get(function () {
    return `${this.author.firstName} ${this.author.lastName}`.trim();
});

//use this to save/update a document and return it populated.
// blogPostSchema.methods.saveAndPopulate = function (blog) {
//     return blog.save().then(blog => blog.populate('author').execPopulate());
// };

commentSchema.methods.easyRead = function () {
    return {
        id: this._id,
        content: this.content,
        author: this.authorFullName,
        created: this.created
    }
};

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
        title: this.title,
        author: this.authorFullName, //using virtual to represent the author property. NOTE: This authorFullName virtual depends on the "author" key already beng pre-populated!
        content: this.content,
        comments: this.comments.map(cmt => cmt.easyRead()), //Awesome way of using instance method that we created on the commentSchema
        created: this.created
    }

};

const BlogPost = mongoose.model("BlogPost,", blogPostSchema, "blogPosts");
const Author = mongoose.model("Author", authorSchema, "authors");
//creating model named Author, uses the 'authorSchema', and points to 'authors' db collection

module.exports = { BlogPost, Author };