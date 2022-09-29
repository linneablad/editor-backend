/* global before it describe */

process.env.NODE_ENV = 'test';

const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../app.js');
const { ObjectId } = require('mongodb');
const database = require("../db/database.js");

chai.should();
chai.use(chaiHttp);

describe('Auth', () => {
    before(async () => {
        let db;

        try {
            db = await database.getDb();
            await db.collection.drop();
            const insertUser = {
                _id: ObjectId(),
                email: "test@test.se",
                password: "test",
                docs: []
            };

            await db.collection.insertOne(insertUser);
        } catch (e) {
            console.log(e);
        } finally {
            await db.client.close();
        }
    });
    describe('POST /register', () => {
        it('Should return status 201 and message "User successfully registered."', (done) => {
            const data = {
                email: "test2@test.se",
                password: "test"
            };

            chai.request(server)
                .post("/register")
                .send(data)
                .end((err, res) => {
                    res.should.have.status(201);
                    res.body.should.be.an("object");
                    res.body.data.should.be.an("object");
                    res.body.data.should.have.property("message");
                    res.body.data.message.should.be.equal("User successfully registered.");
                    done();
                });
        });
        it('Should return status 401 when no password is provided."', (done) => {
            const data = {
                email: "test2@test.se",
                password: ""
            };

            chai.request(server)
                .post("/register")
                .send(data)
                .end((err, res) => {
                    res.should.have.status(401);
                    res.body.should.be.an("object");
                    res.body.errors.should.be.an("object");
                    res.body.errors.should.have.property("detail");
                    res.body.errors.detail.should.be.equal("Email or password missing in request");
                    done();
                });
        });
        it('Should return status 401 when no email is provided."', (done) => {
            const data = {
                email: "",
                password: "test"
            };

            chai.request(server)
                .post("/register")
                .send(data)
                .end((err, res) => {
                    res.should.have.status(401);
                    res.body.should.be.an("object");
                    res.body.errors.should.be.an("object");
                    res.body.errors.should.have.property("detail");
                    res.body.errors.detail.should.be.equal("Email or password missing in request");
                    done();
                });
        });
    });
    describe('POST /login', () => {
        it(`Should return status 200, message "User logged in", 
            the users email and a cookie containing the token`, (done) => {
            const data = {
                email: "test2@test.se",
                password: "test"
            };

            chai.request(server)
                .post("/login")
                .send(data)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.an("object");
                    res.body.data.should.be.an("object");
                    res.body.data.should.have.property("message");
                    res.body.data.message.should.be.equal("User logged in");
                    res.body.data.should.have.property("user");
                    res.body.data.user.should.have.property("email");
                    res.body.data.user.email.should.be.equal("test2@test.se");
                    res.should.have.cookie('token');
                    done();
                });
        });
        it('Should return status 401 when no password is provided."', (done) => {
            const data = {
                email: "test2@test.se",
                password: ""
            };

            chai.request(server)
                .post("/login")
                .send(data)
                .end((err, res) => {
                    res.should.have.status(401);
                    res.body.should.be.an("object");
                    res.body.errors.should.be.an("object");
                    res.body.errors.should.have.property("detail");
                    res.body.errors.detail.should.be.equal("Email or password missing in request");
                    done();
                });
        });
        it('Should return status 401 when no email is provided."', (done) => {
            const data = {
                email: "",
                password: "test"
            };

            chai.request(server)
                .post("/login")
                .send(data)
                .end((err, res) => {
                    res.should.have.status(401);
                    res.body.should.be.an("object");
                    res.body.errors.should.be.an("object");
                    res.body.errors.should.have.property("detail");
                    res.body.errors.detail.should.be.equal("Email or password missing in request");
                    done();
                });
        });

        it(`Should return status 401 and message "User with provided email not found." 
            when the user is not registerd"`, (done) => {
            const data = {
                email: "test3@test.se",
                password: "test"
            };

            chai.request(server)
                .post("/login")
                .send(data)
                .end((err, res) => {
                    res.should.have.status(401);
                    res.body.should.be.an("object");
                    res.body.errors.should.be.an("object");
                    res.body.errors.should.have.property("detail");
                    res.body.errors.detail.should.be.equal("User with provided email not found.");
                    done();
                });
        });
        it(`Should return status 401 and message 'Password is incorrect.' 
            when the password doesn't match`, (done) => {
            const data = {
                email: "test2@test.se",
                password: "wrongpassword"
            };

            chai.request(server)
                .post("/login")
                .send(data)
                .end((err, res) => {
                    res.should.have.status(401);
                    res.body.should.be.an("object");
                    res.body.errors.should.be.an("object");
                    res.body.errors.should.have.property("detail");
                    res.body.errors.detail.should.be.equal("Password is incorrect.");
                    done();
                });
        });
    });
    describe('POST logout', () => {
        it('Should return status 200 and no cookie', (done) => {
            chai.request(server)
                .post("/logout")
                .end((err, res) => {
                    res.should.have.status(200);
                    res.should.not.have.cookie('token');
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
