const functions = require('@google-cloud/functions-framework');

functions.http('helloWorld', (req, res) => {
  res.send(`Hello to you ${req.query.name || req.body.name || 'World'}!`);
});
