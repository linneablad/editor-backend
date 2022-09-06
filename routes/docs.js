const database = require("../db/database")
const { ObjectId } = require('mongodb');

const express = require('express');
const router = express.Router();

router.get("/", async (request, response) => {
    let db;
    try {
        db = await database.getDb();
        const res = await db.collection.find({}).toArray();

        return response.json({ data: res });
        
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
});

router.post("/", async (request, response) => {
    let db;
    try {
        db = await database.getDb();
        const name = request.body.name
        const content = request.body.content
        const res = await db.collection.insertOne({ name: name, content: content });

        const _id = res.insertedId
        return response.status(201).json({ data: { _id: _id }});
        
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
});

router.put("/", async (request, response) => {
    let db;
    if (request.body._id) {
        const _id = ObjectId(request.body._id)
        const name = request.body.name
        const content = request.body.content
        try {
            db = await database.getDb();
            await db.collection.updateOne({ _id: _id }, { $set: { name: name, content: content } });

            // PUT requests should return 204 No Content
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
    }
    else {
        return response.status(500).json({
            errors: {
                status: 500,
                source: "PUT / no id",
                title: "No id",
                detail: "No id provided"
            }
        });
    }
});

router.delete("/", async (request, response) => {
    let db;
    if (request.body._id) {
        const _id = ObjectId(request.body._id)
        try {
            db = await database.getDb();
            await db.collection.deleteOne({ _id: _id });
            
            // DELETE requests should return 204 No Content
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
    }
    else {
        return response.status(500).json({
            error: {
                status: 500,
                source: "DELETE / no id",
                title: "No id",
                detail: "No id provided"
            }
        });
    }
});

module.exports = router;