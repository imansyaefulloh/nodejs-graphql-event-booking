const express = require('express');
const bodyParser = require('body-parser');
const graphqlHttp = require('express-graphql');
const { buildSchema } = require('graphql');
const mongoose = require('mongoose');

const Event = require('./models/event');

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

    input EventInput {
      title: String!
      description: String!
      price: Float!
      date: String!
    }

    type RootQuery {
      events: [Event!]!
    }

    type RootMutation {
      createEvent(eventInput: EventInput): Event
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
    createEvent: args => {
      const event = new Event({
        title: args.eventInput.title,
        description: args.eventInput.description,
        price: +args.eventInput.price,
        date: new Date(args.eventInput.date)
      });
      
      return event
        .save()
        .then(res => {
          console.log(res)
          return { ...res._doc };
          // return res;
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