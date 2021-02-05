const { expect } = require('chai');
const chai = require('chai');
const chaiHttp = require('chai-http');

const { app, runServer, closeServer } = require('../server');

chai.use(chaiHttp);


describe('BlogPosts', function () {

    before(function () {
        return runServer();
    });

    after(function () {
        return closeServer();
    });


    it('should list all blog post items on GET', function () {
        return chai.request(app)
            .get('/blog-posts')
            .then(function (res) {
                //check http res layer
                expect(res).to.have.status(200);
                expect(res).to.be.json;

                //check data res.body layer
                const expectedKeys = ["title", "author", "content", "id", "publishDate"];
                expect(res.body).to.be.an('array');
                expect(res.body).length.to.be.at.least(1);
                res.body.forEach(function (item) {
                    expect(item).to.be.an('object');
                    expect(item).to.include.keys(expectedKeys);
                });//end of forEach
            });
    });
    //----------------End of GET--------------------------------


    it('should add new blog post on POST', function () {
        const newItem = {
            "title": "History of Tomb Raider",
            "content": "The world is a beautiful place filled with mystery and discovery. There is so much to learn!",
            "author": "Laura Croft"
        };

        return chai.request(app)
            .post('/blog-posts')
            .send(newItem)
            .then(function (res) {
                expect(res).to.have.status(201);
                expect(res).to.be.json;
                //test res.body
                const newItemPlus = Object.assign(newItem, { publishDate: res.body.publishDate, id: res.body.id });
                const expectedKeys = ["title", "author", "content", "id", "publishDate"];
                expect(res.body).to.be.an('object');
                expect(res.body).to.include.keys(expectedKeys);
                expect(newItemPlus).to.deep.equal(res.body);
            });
    });
    //----------------End of POST--------------------------------



    it('should update blog post on PUT', function () {
        const updateData = {
            "title": "GOD is amazing",
            "content": "wow, there is so much to see in the world!!!!!!!!!!!!!!!!!! Let's go!!!!!!!!!!"
        };

        chai.request(app)
            .get('/blog-posts')
            .then(function (res) {
                updateData.author = res.body[0].author;
                updateData.publishDate = res.body[0].publishDate;
                updateData.id = res.body[0].id;
                return chai.request(app)
                    .put(`/blog-posts/${updateData.id}`)
                    .send(updateData);
            })
            .then(function (res) {
                //test the res
                expect(res).to.have.status(200);
                expect(res).to.be.json;

                //test the res.body
                const expectedKeys = ["title", "author", "content", "id", "publishDate"];
                expect(res.body).to.be.an('object');
                expect(res.body).to.include.keys(expectedKeys);
                expect(res.body).to.deep.equal(updateData);
            });

    });
    //----------------End of PUT--------------------------------


    it('should delete blog post item on DELETE', function () {


        let lengthBeforeDelete;
        return chai.request(app)
            .get('/blog-posts')
            .then(function (res) {
                lengthBeforeDelete = res.body.length;
                return chai.request(app)
                    .delete(`/blog-posts/${res.body[0].id}`);
            })
            .then(function (res) {
                expect(res).to.have.status(204);

                return chai.request(app)
                    .get('/blog-posts');
            })
            .then(function (res) {
                expect(res.body).length.to.be.lessThan(lengthBeforeDelete);
            });
    });
    //-------------End of DELETE ------------------------


});
//--------------End of describe '/BLOG-POSTS'---------------