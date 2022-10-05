const {
    GraphQLObjectType,
    GraphQLString
} = require('graphql');

const UserType = new GraphQLObjectType({
    name: 'User',
    description: 'This represents a user',
    fields: () => ({
        email: { type: GraphQLString }
    })
});

module.exports = UserType;
