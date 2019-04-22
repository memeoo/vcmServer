var express = require('express');
var app = express();

app.get('/', function (req, res) {
  res.send('Hello VCM_Server !!');
});

app.listen(1900, function () {
  console.log('Example app listening on port 1900!');
});

