const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const port = process.env.PORT || 3001;
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');

let responseHead = `HTTP/1.1 200 OK
Content-Type: text/html; charset=UTF-8`; // Change content type to text/html
let responseFile = '/exploit';
let responseBody = 'Hello, <strong>world!</strong>'; // Example HTML content

// index
app.get('/', (req, res) => {
  res.render('form', { responseHead, responseFile, responseBody });
});

app.set('view engine', 'pug');

// public static file
app.use(express.static('public'));

// for parsing application/xwww-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

// create access-log
var accessLogStream = fs.createWriteStream(path.join(__dirname, '/public/access.log'), { flags: 'a' });
app.use(morgan('combined', { stream: accessLogStream }));

// view access-log
app.get('/access-log', (req, res) => {
  res.render('access-log', { accessLog: fs.readFileSync(path.join(__dirname, '/public/access.log'), 'utf8') });
});

app.post('/', function (req, res) {
  responseHead = req.body.responseHead;
  responseFile = req.body.responseFile;
  responseBody = escapeHtml(req.body.responseBody); // Escape HTML characters
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

// Clear log
app.post('/clear-log', function (req, res) {
  formAction = req.body.formAction;
  if (formAction === 'CLEAR_LOG') {
    fs.writeFileSync(path.join(__dirname, '/public/access.log'), '', 'utf8'); // Clear the log
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

  // Send the response body without including responseHead
  res.send(responseBody);
});

function escapeHtml(unsafe) {
  return unsafe.replace(/[<>&]/g, function (match) {
    return {
      '<': '&lt;',
      '>': '&gt;',
      '&': '&amp;',
    }[match];
  });
}

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
