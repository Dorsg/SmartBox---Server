// TODO: make update setting with DB accessor
// TODO: move all config paramters to config file
// TODO: split config file
// TODO: design html in mail
// TODO: understand routes and controllers

const bodyParser = require('body-parser');
const config = require('./Config/config.json');
const express = require('express')
const cors = require('cors');
const smartBoxController = require('./Controller/smartBoxRoute')

const app = express();
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(cors());
app.use(express.json());

app.get('/', smartBoxController.rootFunction);

app.get('/signin', smartBoxController.signIn);

app.get('/getinfo', smartBoxController.getInfo);

app.post('/signup', smartBoxController.signUp);

app.post('/settingupdate', smartBoxController.updateSettings);

app.post('/weightupdate', smartBoxController.updateWeight);

app.listen(process.env.PORT || config.port_app, () => {
    console.log('SmartBox server is running :)');
});





