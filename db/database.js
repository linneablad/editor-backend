const mongo = require("mongodb").MongoClient;
let dbName = "editor";
const collectionName = "docs";

const database = {
    getDb: async function getDb() {
        const usern = process.env.ATLAS_USERNAME;
        const passw = process.env.ATLAS_PASSWORD;
        let dsn =
        `mongodb+srv://${usern}:${passw}@cluster0.53mc4an.mongodb.net/?retryWrites=true&w=majority`;

        if (process.env.NODE_ENV === 'test') {
            dsn = "mongodb://localhost:27017";
            dbName = "test";
        }

        const client  = await mongo.connect(dsn, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        const db = await client.db(dbName);
        const collection = await db.collection(collectionName);

        return {
            collection: collection,
            client: client,
        };
    }
};

module.exports = database;
