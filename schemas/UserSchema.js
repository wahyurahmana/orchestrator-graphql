const { gql } = require('apollo-server');
const axios = require('axios');
// const Redis = require("ioredis");
// const redis = new Redis()

const baseUrl = 'http://localhost:3000/users/'

const typeDefs = gql`
  type User {
    _id: ID
    username: String
    email : String
    password : String
    role : String
    phoneNumber :String
    address : String
  }

  type Query {
    users: [User]
    user(_id: ID!): User
  }

  type Message {
    status : Boolean
    message : String
    access_token : String
  }

  type Mutation {
    createUser (username : String, email : String, password : String, role : String, phoneNumber : String, address : String) : Message
    loginUser (email : String, password : String) : Message
  }


`;

const resolvers = {
  Query: {
    users: async () => {
      try {
        const users = await axios({
          url : baseUrl,
          method : 'GET'
        })
        console.log(users.data.data)
        return users.data.data
      } catch (error) {
        console.log(error)
      }
    },
    user : async (_, args) => {
      try {
        const user = await axios({
          url : baseUrl+args._id,
          method : 'GET'
        })
        console.log(user.data.data)
        return user.data.data
      } catch (error) {
        console.log(error)
      }
    }
  },
  Mutation : {
    createUser : async (_, args) => {
      try {
        const {username, email, password, role, phoneNumber, address} = args
        console.log(args)
        const user = await axios({
          url : baseUrl,
          method : 'POST',
          data : {username, email, password, role, phoneNumber, address}
        })
        console.log(user.data)
        return user.data
      } catch (error) {
        console.log(error)
      }
    },
    loginUser : async (_, args) => {
      try {
        const {email, password} = args
        console.log(args)
        const user = await axios({
          url : baseUrl+'login',
          method : 'POST',
          data : {email, password}
        })
        console.log(user.data)
        return user.data.data
      } catch (error) {
        console.log(error)
      }
    }
  }
};

module.exports = {
  typeDefs,
  resolvers
}