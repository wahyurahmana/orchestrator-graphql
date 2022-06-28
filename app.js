require('dotenv').config()
const { ApolloServer } = require('apollo-server');
const userSchema = require('./schemas/UserSchema')
const jobSchema = require('./schemas/JobSchema')

const server = new ApolloServer({
  typeDefs : [userSchema.typeDefs, jobSchema.typeDefs],
  resolvers : [userSchema.resolvers, jobSchema.resolvers],
  context: ({ req, res }) => {
    return { req, res };
  }
});

server.listen().then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
});