const database = require("../db/database.js");
const { ObjectId } = require('mongodb');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemon = require("nodemon");

const jwtSecret = process.env.JWT_SECRET;

const authModel = {
    login: async function (request, response) {
        const email = request.body.email;
        const password = request.body.password;

        if (!email || !password) {
            return response.status(401).json({
                errors: {
                    status: 401,
                    source: "/login",
                    title: "Email or password missing",
                    detail: "Email or password missing in request"
                }
            });
        }

        let db;

        try {
            db = await database.getDb();
            const filter = {
                email: email
            };
            const res = await db.collection.findOne(filter);

            if (res) {
                return authModel.comparePasswords(
                    response,
                    password,
                    res,
                );
            } else {
                return response.status(401).json({
                    errors: {
                        status: 401,
                        source: "/login",
                        title: "User not found",
                        detail: "User with provided email not found."
                    }
                });
            }
        } catch (e) {
            return response.status(500).json({
                errors: {
                    status: 500,
                    source: "/login",
                    title: "Database error",
                    detail: e.message
                }
            });
        } finally {
            await db.client.close();
        }
    },

    comparePasswords: function (response, password, user) {
        bcrypt.compare(password, user.password, (err, result) => {
            if (err) {
                return response.status(500).json({
                    errors: {
                        status: 500,
                        source: "/login",
                        title: "bcrypt error",
                        detail: "bcrypt error"
                    }
                });
            }

            if (result) {
                let payload = { email: user.email };
                let jwtToken = jwt.sign(payload, jwtSecret, { expiresIn: '24h' });

                response.cookie('token', jwtToken, { httpOnly: true, secure: true, sameSite: 'none', maxAge: 24 * 60 * 60 * 1000});
                return response.json({
                    data: {
                        type: "success",
                        message: "User logged in",
                        user: payload,
                        token: jwtToken
                    }
                });
            }

            return response.status(401).json({
                errors: {
                    status: 401,
                    source: "/login",
                    title: "Wrong password",
                    detail: "Password is incorrect."
                }
            });
        });
    },
    register: async function (request, response) {
        const email = request.body.email;
        const password = request.body.password;

        if (!email || !password) {
            return response.status(401).json({
                errors: {
                    status: 401,
                    source: "/register",
                    title: "Email or password missing",
                    detail: "Email or password missing in request"
                }
            });
        }

        bcrypt.hash(password, 10, async function (err, hash) {
            if (err) {
                return response.status(500).json({
                    errors: {
                        status: 500,
                        source: "/register",
                        title: "bcrypt error",
                        detail: "bcrypt error"
                    }
                });
            }

            let db;

            try {
                db = await database.getDb();
                const _id = ObjectId();
                const insertUser = {
                    _id: _id,
                    email: email,
                    password: hash,
                    docs: []
                };

                await db.collection.insertOne(insertUser);

                return response.status(201).json({
                    data: {
                        message: "User successfully registered."
                    }
                });
            } catch (e) {
                return response.status(500).json({
                    errors: {
                        status: 500,
                        source: "/register",
                        title: "Database error",
                        detail: e.message
                    }
                });
            } finally {
                await db.client.close();
            }
        });
    },

    checkToken: function (request, response, next) {
        let token = request.cookies.token;

        if (token) {
            jwt.verify(token, jwtSecret, function (err, decoded) {
                if (err) {
                    return response.status(500).json({
                        errors: {
                            status: 500,
                            source: request.path,
                            title: "Failed authentication",
                            detail: err.message
                        }
                    });
                }

                request.user = {};
                request.user.email = decoded.email;

                return next();
            });
        } else {
            return response.status(401).json({
                errors: {
                    status: 401,
                    source: request.path,
                    title: "No token",
                    detail: "No token provided in request headers"
                }
            });
        }
    },
    logout: function (response) {
        response.clearCookie('token');
        return response.json({
            data: {
                type: "success",
                message: "User logged out"
            }
        });
    }
};

module.exports = authModel;
