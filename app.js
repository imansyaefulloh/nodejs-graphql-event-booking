const express = require('express');
const bodyParser = require('body-parser');
const graphqlHttp = require('express-graphql');
const mongoose = require('mongoose');

const schema = require('./graphql/schema');
const resolvers = require('./graphql/resolvers');
const isAuth = require('./middleware/is-auth');

const app = express();

app.use(bodyParser.json());

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

app.use(isAuth);

app.use('/graphql', graphqlHttp({
  schema: schema,
  rootValue: resolvers,
  graphiql: true
}));

mongoose.connect('mongodb://localhost:27017/nodejs_graphql_academind', {useNewUrlParser: true})
  .then(() => app.listen(5000, () => console.log('server running at http://localhost:5000')))
  .catch(error => console.log('error when trying to connect to mongodb server: ' + err));