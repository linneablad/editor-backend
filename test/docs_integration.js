/* global before it describe */

process.env.NODE_ENV = 'test';

const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../app.js');
const database = require("../db/database.js");

chai.should();
chai.use(chaiHttp);

let docId = "";
const user1 = {
    email: "test@test.se",
    password: "test"
};
const user2 = {
    email: "test2@test.se",
    password: "test"
};

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
        it(`Register user`, (done) => {
            chai.request(server)
                .post("/register")
                .send(user1)
                .end((err, res) => {
                    res.should.have.status(201);
                    done();
                });
        });
        it(`Register second user`, (done) => {
            chai.request(server)
                .post("/register")
                .send(user2)
                .end((err, res) => {
                    res.should.have.status(201);
                    done();
                });
        });
        it(`Should return status 200 and an array of documents with length 0`, (done) => {
            const agent = chai.request.agent(server);
            const query = {
                query: `{
                    documents {
                        _id,
                        name,
                        owner,
                        content,
                        allowedUsers {
                            email
                            }
                        }
                    }`
            };

            agent
                .post("/login") // to get jwtToken
                .send(user2)
                .then((res) => {
                    res.should.have.cookie('token');
                    return agent
                        .post("/graphql")
                        .send(query)
                        .then((res) => {
                            res.should.have.status(200);
                            res.body.should.be.an("object");
                            res.body.data.should.be.an("object");
                            res.body.data.should.have.property("documents");
                            res.body.data.documents.should.be.an("array");
                            res.body.data.documents.should.have.lengthOf(0);
                            agent.close();
                        }).then(done, done);
                })
                .catch(function (err) {
                    throw err;
                });
        });
    });
    describe('POST /', () => {
        it('Should return status 201 and an id of the created document', (done) => {
            const agent = chai.request.agent(server);
            const data = {
                name: "Testdoc",
                content: "Test-text",
                allowedUsers: []
            };

            agent
                .post("/login") // to get jwtToken
                .send(user2)
                .then((res) => {
                    res.should.have.cookie('token');
                    return agent
                        .post("/")
                        .send(data)
                        .then((res) => {
                            res.should.have.status(201);
                            res.body.should.be.an("object");
                            res.body.data.should.be.an("object");
                            res.body.data.should.have.property("_id");
                            res.body.data._id.should.not.be.empty;
                            docId = res.body.data._id;
                            agent.close();
                        }).then(done, done);
                })
                .catch(function (err) {
                    throw err;
                });
        });
        it(`Should return status 200 and one array with length 1
            which contains the new document`, (done) => {
            const agent = chai.request.agent(server);
            const query = {
                query: `{
                    documents {
                        _id,
                        name,
                        owner,
                        content,
                        allowedUsers {
                            email
                            }
                        }
                    }`
            };

            agent
                .post("/login") // to get jwtToken
                .send(user2)
                .then((res) => {
                    res.should.have.cookie('token');
                    return agent
                        .post("/graphql")
                        .send(query)
                        .then((res) => {
                            res.should.have.status(200);
                            res.body.data.documents.should.have.lengthOf(1);
                            res.body.data.documents[0].should.have.property("_id");
                            res.body.data.documents[0]._id.should.be.equal(docId);
                            res.body.data.documents[0].should.have.property("name");
                            res.body.data.documents[0].name.should.be.equal("Testdoc");
                            res.body.data.documents[0].should.have.property("owner");
                            res.body.data.documents[0].owner.should.be.equal(user2.email);
                            res.body.data.documents[0].should.have.property("content");
                            res.body.data.documents[0].content.should.be.equal("Test-text");
                            res.body.data.documents[0].should.have.property("allowedUsers");
                            agent.close();
                        }).then(done, done);
                })
                .catch(function (err) {
                    throw err;
                });
        });
    });
    describe('PUT /allow', () => {
        it(`Should return status 200 and message 
            "The user is now allowed to edit the document"`, (done) => {
            const agent = chai.request.agent(server);
            const data = {
                _id: docId,
                email: "test@test.se",
            };

            agent
                .post("/login") // to get jwtToken
                .send(user2)
                .then((res) => {
                    res.should.have.cookie('token');
                    return agent
                        .put("/allow")
                        .send(data)
                        .then((res) => {
                            res.should.have.status(200);
                            res.body.should.be.an("object");
                            res.body.data.should.be.an("object");
                            const data = res.body.data;

                            data.should.have.property("message");
                            data.message.should.be.equal(
                                "The user is now allowed to edit the document"
                            );
                            agent.close();
                        }).then(done, done);
                })
                .catch(function (err) {
                    throw err;
                });
        });
        it(`Should return status 200 and one array with length 1 
            which contains the document with the newly updated values`, (done) => {
            const agent = chai.request.agent(server);
            const query = {
                query: `{
                    documents {
                        allowedUsers {
                            email
                            }
                        }
                    }`
            };

            agent
                .post("/login") // to get jwtToken
                .send(user2)
                .then((res) => {
                    res.should.have.cookie('token');
                    return agent
                        .post("/graphql")
                        .send(query)
                        .then((res) => {
                            res.should.have.status(200);
                            const data = res.body.data;

                            data.documents.should.have.lengthOf(1);
                            data.documents[0].should.have.property("allowedUsers");
                            data.documents[0].allowedUsers[0].email.should.be.equal("test@test.se");
                            agent.close();
                        }).then(done, done);
                })
                .catch(function (err) {
                    throw err;
                });
        });
        it('Add one more document for second user', (done) => {
            const agent = chai.request.agent(server);
            const data = {
                name: "Testdoc2",
                content: "Test-text",
                allowedUsers: []
            };

            agent
                .post("/login") // to get jwtToken
                .send(user2)
                .then((res) => {
                    res.should.have.cookie('token');
                    return agent
                        .post("/")
                        .send(data)
                        .then((res) => {
                            res.should.have.status(201);
                            agent.close();
                        }).then(done, done);
                })
                .catch(function (err) {
                    throw err;
                });
        });
        it(`Should return status 200 and one array with length 1 
        and contains the document the user now has access to`, (done) => {
            const agent = chai.request.agent(server);
            const query = {
                query: `{
                documents {
                    _id
                }
            }`
            };

            agent
                .post("/login") // to get jwtToken
                .send(user1)
                .then((res) => {
                    res.should.have.cookie('token');
                    return agent
                        .post("/graphql")
                        .send(query)
                        .then((res) => {
                            res.should.have.status(200);
                            res.body.data.documents.should.have.lengthOf(1);
                            res.body.data.documents[0]._id.should.be.equal(docId);
                            agent.close();
                        }).then(done, done);
                })
                .catch(function (err) {
                    throw err;
                });
        });
    });
    describe('DELETE /', () => {
        it('Should return status 204', (done) => {
            const agent = chai.request.agent(server);
            const data = {
                _id: docId
            };

            agent
                .post("/login") // to get jwtToken
                .send(user2)
                .then((res) => {
                    res.should.have.cookie('token');
                    return agent
                        .delete("/")
                        .send(data)
                        .then((res) => {
                            res.should.have.status(204);
                            agent.close();
                        }).then(done, done);
                })
                .catch(function (err) {
                    throw err;
                });
        });
        it(`Should return status 200 and one array with length 1`, (done) => {
            const agent = chai.request.agent(server);
            const query = {
                query: `{
                    documents {
                        _id
                    }
                }`
            };

            agent
                .post("/login") // to get jwtToken
                .send(user2)
                .then((res) => {
                    res.should.have.cookie('token');
                    return agent
                        .post("/graphql")
                        .send(query)
                        .then((res) => {
                            res.should.have.status(200);
                            res.body.data.documents.should.have.lengthOf(1);
                            agent.close();
                        }).then(done, done);
                })
                .catch(function (err) {
                    throw err;
                });
        });
        it('Should return status 500 and error message when no id is provided', (done) => {
            const agent = chai.request.agent(server);

            agent
                .post("/login") // to get jwtToken
                .send(user2)
                .then((res) => {
                    res.should.have.cookie('token');
                    return agent
                        .delete("/")
                        .then((res) => {
                            res.should.have.status(500);
                            res.body.should.be.an("object");
                            res.body.errors.should.be.an("object");
                            res.body.errors.should.have.property("status");
                            res.body.errors.should.have.property("source");
                            res.body.errors.should.have.property("title");
                            res.body.errors.should.have.property("detail");
                            agent.close();
                        }).then(done, done);
                })
                .catch(function (err) {
                    throw err;
                });
        });
    });
});
