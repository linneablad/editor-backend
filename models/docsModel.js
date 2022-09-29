const database = require("../db/database");
const { ObjectId } = require('mongodb');

const docsModel = {
    getDocs: async function (request, response) {
        const email = request.user.email;
        let db;

        try {
            db = await database.getDb();
            let filter = {
                email: email
            };
            let res = await db.collection.findOne(filter);
            const documents = res.docs;

            documents.forEach(element => {
                element.owner = email;
            });
            const cursor = db.collection.aggregate([
                {
                    "$unwind": "$docs",
                },
                {
                    "$unwind": "$docs.allowedUsers",
                },
                {
                    "$match": {
                        "docs.allowedUsers.email": email
                    }
                },
            ]);
            let doc = {};

            await cursor.forEach(function (element) {
                if (element) {
                    doc = {
                        owner: element.email,
                        _id: element.docs._id,
                        name: element.docs.name,
                        content: element.docs.content,
                    };
                    documents.push(doc);
                }
            });
            return response.json({ data: { documents: documents } });
        } catch (e) {
            return response.status(500).json({
                errors: {
                    status: 500,
                    source: "/",
                    title: "Database error",
                    detail: e.message
                }
            });
        } finally {
            await db.client.close();
        }
    },
    newDoc: async function (request, response) {
        const name = request.body.name;
        const content = request.body.content;
        const email = request.user.email;
        let db;

        try {
            db = await database.getDb();
            const filter = { email: email };
            const _id = ObjectId();
            const insertDoc = {
                $push: {
                    docs: {
                        _id: _id,
                        name: name,
                        content: content,
                        allowedUsers: []
                    }
                }
            };

            await db.collection.updateOne(filter, insertDoc);
            return response.status(201).json({ data: { _id: _id } });
        } catch (e) {
            return response.status(500).json({
                errors: {
                    status: 500,
                    source: "/",
                    title: "Database error",
                    detail: e.message
                }
            });
        } finally {
            await db.client.close();
        }
    },
    allowUser: async function (request, response) {
        const _id = request.body._id;
        const email = request.body.email;
        const userEmail = request.user.email;
        let db;

        try {
            db = await database.getDb();
            const filter = {
                "email": userEmail,
                "docs": {
                    $elemMatch: {
                        _id: ObjectId(_id)
                    }
                }
            };
            const insertUser = {
                $push: {
                    'docs.$.allowedUsers': {
                        email: email
                    }
                }
            };

            await db.collection.updateOne(filter, insertUser);
            return response.status(200).json({
                data: {
                    message: "The user is now allowed to edit the document"
                }
            });
        } catch (e) {
            return response.status(500).json({
                errors: {
                    status: 500,
                    source: "/",
                    title: "Database error",
                    detail: e.message
                }
            });
        } finally {
            await db.client.close();
        }
    },
    updateDoc: async function (_id, name, content) {
        let db = await database.getDb();
        const filter = {
            "docs": {
                $elemMatch: {
                    _id: ObjectId(_id)
                }
            }
        };
        const updateDoc = {
            $set: {
                'docs.$.name': name,
                'docs.$.content': content
            }
        };

        await db.collection.updateOne(filter, updateDoc);
        await db.client.close();
        return;
    },
    deleteDoc: async function (request, response) {
        const userEmail = request.user.email;
        const _id = request.body._id;
        let db;

        if (_id) {
            try {
                const filter = {
                    "email": userEmail
                };
                const updateDoc = {
                    $pull: {
                        docs: {
                            _id: ObjectId(_id),
                        }
                    }
                };

                db = await database.getDb();
                await db.collection.updateOne(filter, updateDoc);
                return response.status(204).send();
            } catch (e) {
                return response.status(500).json({
                    errors: {
                        status: 500,
                        source: "/",
                        title: "Database error",
                        detail: e.message
                    }
                });
            } finally {
                await db.client.close();
            }
        } else {
            return response.status(500).json({
                errors: {
                    status: 500,
                    source: "DELETE / no id",
                    title: "No id",
                    detail: "No id provided"
                }
            });
        }
    },
};

module.exports = docsModel;
