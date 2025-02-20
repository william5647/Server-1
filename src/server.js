const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const port = 3001;
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');

let responseHead = `HTTP/1.1 200 OK
Content-Type: text/html; charset=UTF-8`;
let responseFile = '/exploit';
let responseBody = '<p>Hello, <strong>world</strong>!</p>';

app.get('/', (req, res) => {
  res.render('form', { responseHead, responseFile, responseBody });
});

app.set('view engine', 'pug');

app.use(express.static('public'));

app.use(bodyParser.urlencoded({ extended: true }));

var accessLogStream = fs.createWriteStream(path.join(__dirname, '/public/access.log'), { flags: 'a' });
app.use(morgan('combined', { stream: accessLogStream }));

app.get('/access-log', (req, res) => {
  res.render('access-log', { accessLog: fs.readFileSync(path.join(__dirname, '/public/access.log'), 'utf8') });
});

app.post('/', (req, res) => {
  responseHead = req.body.responseHead;
  responseFile = req.body.responseFile;
  responseBody = req.body.responseBody;
  formAction = req.body.formAction;
  if (formAction === 'ACCESS_LOG') {
    res.redirect(302, '/access-log');
    return;
  }
  if (formAction === 'VIEW_EXPLOIT') {
    res.redirect(302, responseFile);
    return;
  } else {
    res.redirect(302, '/');
    res.end();
  }
});

app.post('/clear-log', (req, res) => {
  formAction = req.body.formAction;
  if (formAction === 'CLEAR_LOG') {
    fs.createWriteStream(path.join(__dirname, '/public/access.log'), { flags: 'w' });
    res.redirect(302, '/access-log');
    return;
  }
});

// Get URI exploit
app.get('*', (req, res) => {
  if (req.path !== responseFile) {
    res.status(404).send();
    return;
  }

  const responseMessage = `${responseBody}`;

  // Set Content-Type header to plain text
  res.type('text').send(responseMessage);
});


app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
