const database = require("../db/database");
const { ObjectId } = require('mongodb');

const docsModel = {
    getDocs: async function (response) {
        let db;

        try {
            db = await database.getDb();
            const documents = await db.collection.find({}).toArray();

            return response.json({ data: documents });
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
        let db;

        try {
            db = await database.getDb();
            const res = await db.collection.insertOne({ name: name, content: content });
            const _id = res.insertedId;

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
    updateDoc: async function (_id, name, content) {
        let db;

        db = await database.getDb();
        await db.collection.updateOne({ _id: ObjectId(_id) }, {
            $set: {
                name: name,
                content: content
            }
        });
        await db.client.close();
        return;
    },
    deleteDoc: async function (request, response) {
        if (request.body._id) {
            const _id = ObjectId(request.body._id);
            let db;

            try {
                db = await database.getDb();
                await db.collection.deleteOne({ _id: _id });
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
