const express = require('express')
const { MongoClient, ServerApiVersion } = require('mongodb');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express()
const uri = "mongodb+srv://smartBox:smartBox@cluster0.sgf80.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
app.use(cors())
app.use(express.json());

// OK
app.get('/', async (req, res)=> {
    try{
        await client.connect();
        const database = client.db("smart_box");
        const collection = database.collection("users");
        const projection = { projection: { _id: 0, email: 1} };

        const users = await collection.find({}, projection).toArray();

        res.json(users);
        console.log(users);
    } catch (e){
        console.log(e);
    } finally {
        await client.close()
    }
})

// TODO not working
app.post('/signup', async (req, res) => {
    const cred = {
                   email: req.body.email,
                   password : req.body.password
                 };

    try{
        await client.connect();
        const database = client.db("smart_box");
        const collection = database.collection("users");
        let query = { email: cred.email };

        const user = await collection.find(query).toArray(function(err, result) {

            console.log(result);
        });

    } catch (e){
        console.log(e);
    } finally {
        await client.close()
    }


})

app.listen(3000, ()=> {
    console.log('app is running on port 3000');
})

/*app.post('/signin', (req, res) => {
    db.select('email', 'hash').from('login')
        .where('email', '=', req.body.email)
        .then(data => {
            const isValid = bcrypt.compareSync(req.body.password, data[0].hash);
            if (isValid) {
                return db.select('*').from('users')
                    .where('email', '=', req.body.email)
                    .then(user => {
                        res.json(user[0])
                    })
                    .catch(err => res.status(400).json('unable to get user'))
            } else {
                res.status(400).json('wrong credentials')
            }
        })
        .catch(err => res.status(400).json('wrong credentials'))
})*/


/*app.get('/profile/:id', (req, res) => {
    const { id } = req.params;
    db.select('*').from('users').where({id})
        .then(user => {
            if (user.length) {
                res.json(user[0])
            } else {
                res.status(400).json('Not found')
            }
        })
        .catch(err => res.status(400).json('error getting user'))
})

app.put('/image', (req, res) => {
    const { id } = req.body;
    db('users').where('id', '=', id)
        .increment('entries', 1)
        .returning('entries')
        .then(entries => {
            // If you are using knex.js version 1.0.0 or higher this now returns an array of objects. Therefore, the code goes from:
            // entries[0] --> this used to return the entries
            // TO
            // entries[0].entries --> this now returns the entries
            res.json(entries[0].entries);
        })
        .catch(err => res.status(400).json('unable to get entries'))
})*/









/*
app.get('/', function (req, res) {

    getCollection();

})

async function getCollection(){
    try{
        await client.connect();
        let databaseList = await client.db().admin().listDatabases();
        console.log(databaseList);
    } catch (e){
        console.log(e);
    } finally {
        await client.close()
    }
}

app.listen(3000)*/
