const {
    GraphQLObjectType,
    GraphQLString,
    GraphQLList,
    GraphQLNonNull,
    GraphQLBoolean
} = require('graphql');
const UserType = require("./user.js");

const DocumentType = new GraphQLObjectType({
    name: 'Document',
    description: 'This represents a document',
    fields: () => ({
        _id: { type: new GraphQLNonNull(GraphQLString) },
        name: { type: new GraphQLNonNull(GraphQLString) },
        content: { type: GraphQLString },
        owner: { type: GraphQLString },
        code: { type: GraphQLBoolean },
        allowedUsers: { type: new GraphQLList(UserType) },
    })
});

module.exports = DocumentType;
