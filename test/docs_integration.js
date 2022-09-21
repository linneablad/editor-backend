/* global it describe before */

process.env.NODE_ENV = 'test';

const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../app.js');
const { ObjectId } = require('mongodb');
const database = require("../db/database.js");

chai.should();
chai.use(chaiHttp);

let docId = "";

describe('Documents', () => {
    before(async () => {
        let db;

        try {
            db = await database.getDb();
            await db.collection.drop();
        } catch (e) {
            console.log(e);
        } finally {
            await db.client.close();
        }
    });

    describe('GET /', () => {
        it(`Should return status 200 and an array of documents with length 0`, (done) => {
            chai.request(server)
                .get("/")
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.an("object");
                    res.body.data.should.be.an("array");
                    res.body.data.should.have.lengthOf(0);
                    done();
                });
        });
    });
    describe('POST /', () => {
        it('Should return status 201 and an id of the created document', (done) => {
            const data = {
                name: "Test2",
                content: "Test2-text"
            };

            chai.request(server)
                .post("/")
                .send(data)
                .end((err, res) => {
                    res.should.have.status(201);
                    res.body.should.be.an("object");
                    res.body.data.should.be.an("object");
                    res.body.data.should.have.property("_id");
                    res.body.data._id.should.not.be.empty;
                    docId = res.body.data._id;
                    done();
                });
        });
        it(`Should return status 200 and an array of length 1, 
            where the document has the newly inserted values`, (done) => {
            chai.request(server)
                .get("/")
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.an("object");
                    res.body.data.should.be.an("array");
                    res.body.data.should.have.lengthOf(1);
                    res.body.data[0].should.have.property("_id");
                    res.body.data[0]._id.should.be.equal(docId);
                    res.body.data[0].should.have.property("name");
                    res.body.data[0].name.should.be.equal("Test2");
                    res.body.data[0].should.have.property("content");
                    res.body.data[0].content.should.be.equal("Test2-text");
                    done();
                });
        });
    });
    // describe('PUT /', () => {
    //     it('Should return status 204', (done) => {
    //         const data = {
    //             _id: ObjectId(docId),
    //             name: "Test2-changed",
    //             content: "Test2-text-changed"
    //         };

    //         chai.request(server)
    //             .put("/")
    //             .send(data)
    //             .end((err, res) => {
    //                 res.should.have.status(204);

    //                 done();
    //             });
    //     });
    //     it(`Should return status 200 and an array of length 1,
    //         where the document has the newly updated values`, (done) => {
    //         chai.request(server)
    //             .get("/")
    //             .end((err, res) => {
    //                 res.should.have.status(200);
    //                 res.body.should.be.an("object");
    //                 res.body.data.should.be.an("array");
    //                 res.body.data.should.have.lengthOf(1);
    //                 res.body.data[0].should.have.property("_id");
    //                 res.body.data[0]._id.should.be.equal(docId);
    //                 res.body.data[0].should.have.property("name");
    //                 res.body.data[0].name.should.be.equal("Test2-changed");
    //                 res.body.data[0].should.have.property("content");
    //                 res.body.data[0].content.should.be.equal("Test2-text-changed");
    //                 done();
    //             });
    //     });
    //     it('Should return status 500 and error message when no id is provided', (done) => {
    //         chai.request(server)
    //             .put("/")
    //             .end((err, res) => {
    //                 res.should.have.status(500);
    //                 res.body.should.be.an("object");
    //                 res.body.errors.should.be.an("object");
    //                 res.body.errors.should.have.property("status");
    //                 res.body.errors.should.have.property("source");
    //                 res.body.errors.should.have.property("title");
    //                 res.body.errors.should.have.property("detail");

    //                 done();
    //             });
    //     });
    // });
    describe('DELETE /', () => {
        it('Should return status 204', (done) => {
            const data = {
                _id: ObjectId(docId)
            };

            chai.request(server)
                .delete("/")
                .send(data)
                .end((err, res) => {
                    res.should.have.status(204);

                    done();
                });
        });
        it('Should return status 200 and an array of documents of length 0', (done) => {
            chai.request(server)
                .get("/")
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.an("object");
                    res.body.data.should.be.an("array");
                    res.body.data.should.have.lengthOf(0);
                    done();
                });
        });
        it('Should return status 500 and error message when no id is provided', (done) => {
            chai.request(server)
                .delete("/")
                .end((err, res) => {
                    res.should.have.status(500);
                    res.body.should.be.an("object");
                    res.body.errors.should.be.an("object");
                    res.body.errors.should.have.property("status");
                    res.body.errors.should.have.property("source");
                    res.body.errors.should.have.property("title");
                    res.body.errors.should.have.property("detail");

                    done();
                });
        });
    });
    describe('404', () => {
        it('Should return status 404 and error message when wrong route is requested', (done) => {
            chai.request(server)
                .get("/test")
                .end((err, res) => {
                    res.should.have.status(404);
                    res.body.should.be.an("object");
                    res.body.errors.should.be.an("array");
                    res.body.errors.length.should.be.above(0);
                    res.body.errors[0].should.have.property("status");
                    res.body.errors[0].should.have.property("title");
                    res.body.errors[0].should.have.property("detail");

                    done();
                });
        });
    });
});
