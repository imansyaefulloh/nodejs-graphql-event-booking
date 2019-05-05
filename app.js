const express = require('express');
const bodyParser = require('body-parser');
const graphqlHttp = require('express-graphql');
const { buildSchema } = require('graphql');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const Event = require('./models/event');
const User = require('./models/user');

const app = express();

const events = [];

app.use(bodyParser.json());

app.use('/graphql', graphqlHttp({
  schema: buildSchema(`
    type Event {
      _id: ID!
      title: String!
      description: String!
      price: Float!
      date: String!
    }

    type User {
      _id: ID!
      email: String!
      password: String
    }

    input EventInput {
      title: String!
      description: String!
      price: Float!
      date: String!
    }

    input UserInput {
      email: String!
      password: String!
    }

    type RootQuery {
      events: [Event!]!
      users: [User!]!
    }

    type RootMutation {
      createEvent(eventInput: EventInput): Event
      createUser(userInput: UserInput): User
    }

    schema {
      query: RootQuery
      mutation: RootMutation
    }
  `),
  rootValue: {
    events: () => {
      return Event
        .find({})
        .then(events => {
          console.log(events);
          return events;
        })
        .catch(err => {
          console.log(err)
          throw err;
        });
    },
    users: () => {
      return User
        .find({})
        .then(users => {
          console.log(users);
          return { ...res._doc, password: null };
        })
        .catch(err => {
          console.log(err)
          throw err;
        });
    },
    createEvent: args => {
      const event = new Event({
        title: args.eventInput.title,
        description: args.eventInput.description,
        price: +args.eventInput.price,
        date: new Date(args.eventInput.date),
        creator: '5cced914dc97be1940795f64'
      });

      let createdEvent;
      
      return event
        .save()
        .then(res => {
          createdEvent = res;
          return User.findById('5cced914dc97be1940795f64')
        })
        .then(user => {
          if (!user) {
            throw new Error('User not found!');
          }
          user.createdEvents.push(event);
          return user.save();
        })
        .then(res => {
          return createdEvent;
        })
        .catch(err => {
          console.log(err)
          throw err;
        });
    },
    createUser: args => {
      return User.findOne({email: args.userInput.email})
        .then(user => {
          if (user) {
            throw new Error('User already exists!');
          }

          return bcrypt.hash(args.userInput.password, 12)
        })
        .then(hashedPassword => {
          const user = new User({
            email: args.userInput.email,
            password: hashedPassword
          });
          return user.save();
        })
        .then(res => {
          // return res;
          return { ...res._doc, password: null };
        })
        .catch(err => {
          console.log(err)
          throw err;
        });
    }
  },
  graphiql: true
}));

mongoose.connect('mongodb://localhost:27017/nodejs_graphql_academind', {useNewUrlParser: true})
  .then(() => app.listen(3000, () => console.log('server running at http://localhost:3000')))
  .catch(error => console.log('error when trying to connect to mongodb server: ' + err));