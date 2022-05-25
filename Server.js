//TODO: 2. all routing to controllers
//TODO: 3. create database accessor
//TODO: 4. create email accessor
//TODO: 5. remove unnecessary fields in user data base
//TODO: 6. create function to extract ASIN ID from text
//TODO: 7. create function to generate amazon cart link by ASIN ID
//TODO: 8. find free email service to send emails with amazon cart link


//TODO: 9. handle response in weight update
//TODO: 10. make sure email is sent
//TODO: 11. deploy and check sign in sign up


var config = require('./config.json')
const express = require('express')
const { MongoClient, ServerApiVersion } = require('mongodb');
const bodyParser = require('body-parser');
const cors = require('cors');
var mandrill = require('node-mandrill')('c27c8bcdcb98e46fd74a93069a143ca0-us12');

const app = express();

const client = new MongoClient(config.uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

app.use(cors());
app.use(express.json());


app.get('/', async (req, res)=> {
    try{
        await client.connect();
        const database = client.db(config.db);
        const collection_users = database.collection(config.collection_users);
        const projection = { projection: { _id: 0, email: 1} };
        const users = await collection_users.find({}, projection).toArray();
        res.json(users);

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
        const collection_users = database.collection(config.collection_users);  // get reference to the collection
        const user = await collection_users.findOne({ email: req.query.email });

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
        const collection_users = database.collection(config.collection_users);
        const user = await collection_users.findOne({ email: req.body.email });

        if (user) {
            res.status(401).json({error: "User is already exist in the system"});
        } else{
            const addedUser = await collection_users.insertOne(credentials);
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
                          current_weight: req.body.current_weight };
    let box;
    try{
        await client.connect();
        let database = client.db(config.db);
        let collection_boxes = database.collection(config.collection_boxes);
        box = await collection_boxes.findOne({ box_id: req.body.box_id });

        if (box) { // box id exist in system
            await collection_boxes.update(  { box_id: req.body.box_id} , { $set: { current_weight : req.body.current_weight }});

           res.status(200).json({message: "User with box id: " + req.body.box_id
                                                     + " has updated his weight with box state: "
                                                     + req.body.box_current_weight});


        } else {
            res.status(401).json({error: "User with box id: " + req.body.box_id + " is not in the system"});
        }
    } catch (e){
        console.log(e);
    } finally {
        await client.close()
    }

    if (req.body.current_weight < (box.max_weight * (box.baseline / 100) )) {
        handleNotification(box.box_id);
    }
});

async function handleNotification(box_id, database) {

    try{
        await client.connect();
        let database = client.db(config.db);
        let collection_users = database.collection(config.collection_users);
        let user = await collection_users.findOne({ box_id: box_id });

        if (user) {
            mandrill('/messages/send', {
                message: {
                    to: [{email: user.email, name: 'Dear user'}],
                    from_email: 'smart_box@gmail.com',
                    subject: "Hey, looks like you product is run out",
                    text: `Please click the amazon link and your product will be added to cart\n${user.amazon_link}`
                }
            }, function(error, response) {
                if (error) console.log( JSON.stringify(error) );
                else console.log(response);
            });

        }
    } catch (e){
        console.log(e);

}}

app.post('/settingupdate', async (req, res) => {
    var amazon_asin = req.body.amazon_link.substring(
        req.body.amazon_link.indexOf("dp/") + 3,
        req.body.amazon_link.lastIndexOf("?")
    );
    var amazon_link = `https://www.amazon.com/gp/aws/cart/add.html?ASIN.1=${amazon_asin}&Quantity.1=1`

    const update_users = {
        box_id: req.body.box_id,
        amazon_link: amazon_link,
    };

    const update_boxes = {
        box_id: req.body.box_id,
        current_weight: req.body.current_weight,
        max_weight: req.body.current_weight,
        baseline:  req.body.baseline,
    };

    try{
        await client.connect();
        const database = client.db(config.db);
        const user_collection = database.collection(config.collection_users);
        const user = await user_collection.findOne({ email: req.body.email });
        const boxes_collection = database.collection(config.collection_boxes);

        if (user) {
            await user_collection.update(  { email: user.email} , { $set: update_users });
            await boxes_collection.insertOne(update_boxes);
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
        const collection_users = database.collection(config.collection_users);
        const user = await collection_users.findOne({ email: req.query.email });

        if (user) {
            if (user.password === req.query.password){

                const collection_boxes = database.collection(config.collection_boxes);
                const box = await collection_boxes.findOne({ box_id: user.box_id });

                res.status(200).json({ box_id: user.box_id,
                                                   amazon_link: user.amazon_link,
                                                   baseline: box.baseline,
                                                   current_weight: box.current_weight,
                                                   max_weight: box.max_weight });
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
