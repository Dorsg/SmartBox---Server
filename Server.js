//TODO: 2. all routing to controllers
//TODO: 3. create database accessor
//TODO: 4. create email accessor
//TODO: 5. remove unnecessary fields in user data base
//TODO: 6. create function to extract ASIN ID from text
//TODO: 7. create function to generate amazon cart link by ASIN ID
//TODO: 8. find free email service to send emails with amazon cart link
var config = require('config')
const express = require('express')
const { MongoClient, ServerApiVersion } = require('mongodb');
const bodyParser = require('body-parser');
const cors = require('cors');


const app = express();

const client = new MongoClient(config.uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
//const MongoHandler = require('MongoHandler');
app.use(cors());
app.use(express.json());


app.get('/', async (req, res)=> {
    try{
        await client.connect();
        const database = client.db(config.db);
        const collection = database.collection(config.collection);
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

app.get('/signin', async (req, res) => {
    try{
        await client.connect();
        const database = client.db(config.db);
        const collection = database.collection(config.collection);  // get reference to the collection
        const user = await collection.findOne({ email: req.query.email });

        if (user) {
            if (user.password === req.query.password){
                res.status(200).json({message: "User credentials are valid"});
            } else{
                res.status(401).json({error: "User password is not valid"});
            }
        } else{
            res.status(404).json({error: "User mail is not exists"});
        }

    } catch (e){
        console.log(e);
    } finally {
        await client.close()
    // }
}});

app.post('/signup', async (req, res) => {
    const credentials = { email: req.body.email,
                          password: req.body.password  };

    try{
        await client.connect();
        const database = client.db(config.db);
        const collection = database.collection(config.collection);  // get reference to the collection
        const user = await collection.findOne({ email: req.body.email });

        if (user) {
            res.status(401).json({error: "User is already exist in the system"});
        } else{
            const addedUser = await collection.insertOne(credentials);
            if(addedUser) {
                res.status(200).json({message: "User and password has been successfully added to the system"});
            } else{
                res.status(500).json({error: "User credentials were OK but an error has occurred on the server"});
            }
        }
    } catch (e){
        console.log(e);
    } finally {
        await client.close()
    }
});

app.post('/weightupdate', async (req, res) => {
    const details = { box_id: req.body.box_id,
                          box_state: req.body.box_state };

    try{
        await client.connect();
        const database = client.db(config.db);
        const collection = database.collection(config.collection);
        const user = await collection.findOne({ box_id: req.body.box_id });

        if (user) {
            await collection.update(  { email: user.email} , { $set: { box_state : req.body.box_state  } });
            res.status(200).json({message: "User with box id: " + req.body.box_id
                                                     + " has updated his weight with box state: "
                                                     + req.body.box_state});
        } else{
            res.status(401).json({error: "User with box id: " + req.body.box_id + " is not in the system"});
        }
    } catch (e){
        console.log(e);
    } finally {
        await client.close()
    }
});

app.post('/settingupdate', async (req, res) => {
    const details = {
        box_id: req.body.box_id,
        box_state: req.body.box_state,
        ebay_connection: req.body.ebay_connection,
        box_baseline:  req.body.box_baseline};

    try{
        await client.connect();
        const database = client.db(config.db);
        const collection = database.collection(config.collection);
        const user = await collection.findOne({ email: req.body.email });

        if (user) {
            console.log(user.email);
            await collection.update(  { email: user.email} , { $set: details });
            res.status(200).json({message: "User with email: " + req.body.email + " has updated his setting details"});
        } else{
            res.status(401).json({error: "User with email: " + req.body.email + " is not in the system"});
        }
    } catch (e){
        console.log(e);
    } finally {
        await client.close()
    }
});

app.get('/getinfo', async (req, res) => {
    try{
        await client.connect();
        const database = client.db(config.db);
        const collection = database.collection(config.collection);
        const user = await collection.findOne({ email: req.query.email });

        if (user) {
            if (user.password === req.query.password){
                res.status(200).json({box_id: user.box_id,
                                                  ebay_connection: user.ebay_connection,
                                                  box_state: user.box_state,
                                                  box_baseline: user.box_baseline});
            } else{
                res.status(401).json({error: "User password is not valid"});
            }
        } else{
            res.status(404).json({error: "User mail is not exists"});
        }

    } catch (e){
        console.log(e);
    } finally {
        await client.close()
    }
});


app.listen(process.env.PORT || config.port_app, ()=> {
    console.log('SmartBox server is running');
});
