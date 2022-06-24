const { gql } = require('apollo-server');
const axios = require('axios');
const Redis = require("ioredis");
const redis = new Redis()

const baseUrl = 'http://localhost:5000/'
const userUrl = 'http://localhost:3000/users/'

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

  type Company {
    id : ID
    name : String
    companyLogo : String
    location : String
    email : String
    description : String
  }

  type Job {
    id : ID
    title : String,
    description : String
    jobType  : String
    Company : Company
    User : User
    authorId : String
    companyId : Int

  }

  type Query {
    jobs: [Job]
    job(id : ID) : Job
  }

  type Message {
    id : String
    title : String
  }

  type Mutation {
    createJob (title : String, descriptionJob : String, jobType: String, name : String, companyLogo : String, location : String, email : String, descriptionCompany : String) : Message
    deleteJob (id : ID) : Message
  }

`;

const resolvers = {
  Query : {
    jobs : async () => {
      try {
      const checkCacheUser = await redis.get("jobsKeyGraphql")
        if(!checkCacheUser){
          const jobs = await axios({
            url : baseUrl+'jobs',
            method : 'GET'
          })
          console.log(jobs.data)
          const userResult = await axios({
            url : `${userUrl}`,
            method : 'GET'
          })
  
          //proses include data jobs beserta users
          jobs.data.data.forEach((el) => {
            userResult.data.data.forEach(e => {
              if(el.authorId === e._id){
                el.User = e
              }
            })
          })//isi dari jobs.data.data sudah terupdate dikarenakan ada proses 'el.User' > menambahkan key baru dengan nilai e
          console.log('tanpa redis')
          redis.set("jobsKeyGraphql", JSON.stringify(jobs.data.data))
          return jobs.data.data

        }else{
          console.log('pakai redis')
          return JSON.parse(checkCacheUser)
        }
      } catch (error) {
        console.log(error)
      }
    },
    job : async (_, args) => {
      try {
        const job = await axios({
          url : baseUrl+'jobs/'+args.id,
          method : 'GET'
        })
        const user = await axios({
          url : `${userUrl}${job.data.data.authorId}`,
          method : 'GET'
        })
        console.log(user.data.data)

        //untuk menambahkan key User kedalam job.data.data
        job.data.data.User = user.data.data
        
        return job.data.data
      } catch (error) {
        console.log(error)
      }
    }
  },
  Mutation : {
    createJob : async (_, args, context) => {
      try {
        const {title, descriptionJob, jobType, name, companyLogo, location, email, descriptionCompany} = args
        // console.log(title, descriptionJob, jobType, name, companyLogo, location, email, descriptionCompany)
        console.log(context.req.headers.access_token, 'ini context')
        const user = await axios({
          url : baseUrl+'jobs',
          method : 'POST',
          headers : {
            access_token : context.req.headers.access_token
          },
          data : {title, descriptionJob, jobType, name, companyLogo, location, email, descriptionCompany}
        })
        await redis.del("jobsKeyGraphql")
        console.log('redis dihapus')
        return user.data.data
      } catch (error) {
        console.log(error.response)
      }
    },
    deleteJob : async (_,args, context) => {
      try {
        const user = await axios({
          url : baseUrl+'jobs/'+args.id,
          method : 'DELETE',
          headers : {
            access_token : context.req.headers.access_token
          }
        })
        await redis.del("jobsKeyGraphql")
        console.log('redis dihapus')
        return user.data
      } catch (error) {
        return error.response.data
      }
    }
  }
}

module.exports = {
  typeDefs,
  resolvers
}