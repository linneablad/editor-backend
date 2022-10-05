const {
    GraphQLObjectType,
    GraphQLString,
    GraphQLList
} = require('graphql');

const DocumentType = require("./document.js");

const docsModel = require("../models/docsModel.js");

const RootQueryType = new GraphQLObjectType({
    name: 'Query',
    description: 'Root Query',
    fields: () => ({
        document: {
            type: DocumentType,
            description: 'A single document',
            args: {
                docId: { type: GraphQLString }
            },
            resolve: async function(parent, args, context) {
                let documentArray = await docsModel.getDocs(context);

                return documentArray.find(document => document._id.toString() === args.docId);
            }
        },
        documents: {
            type: new GraphQLList(DocumentType),
            description: 'List of all documents',
            resolve: async function(parent, args, context) {
                return await docsModel.getDocs(context);
            }
        },
    })
});

module.exports = RootQueryType;
