const express = require('express');
const bodyParser = require('body-parser');
const graphqlHttp = require('express-graphql');
const mongoose = require('mongoose');

const schema = require('./graphql/schema');
const resolvers = require('./graphql/resolvers');
const isAuth = require('./middleware/is-auth');

const app = express();

app.use(bodyParser.json());
app.use(isAuth);

app.use('/graphql', graphqlHttp({
  schema: schema,
  rootValue: resolvers,
  graphiql: true
}));

mongoose.connect('mongodb://localhost:27017/nodejs_graphql_academind', {useNewUrlParser: true})
  .then(() => app.listen(3000, () => console.log('server running at http://localhost:3000')))
  .catch(error => console.log('error when trying to connect to mongodb server: ' + err));