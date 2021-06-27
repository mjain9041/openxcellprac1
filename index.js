require('dotenv').config()
const express = require('express');
const bodyParser = require('body-parser');
const db = require("./app/models");
const fileUpload = require('express-fileupload');

var app = express();
app.use(bodyParser.json())
app.use(fileUpload());
app.use(express.static('uploads'));
app.use('/uploads', express.static('uploads'));

const port = process.env.PORT || 8080

require("./app/routes/properties.route")(app);

app.get('/', function (req, res) {
    res.send('hello world')
})

app.use(function (err, req, res, next) {
    console.error(err.stack)
    res.status(500).send('Something broke!')
})


app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});