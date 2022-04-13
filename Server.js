const express = require('express')
const { MongoClient, ServerApiVersion } = require('mongodb');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const uri = "mongodb+srv://smartBox:smartBox@cluster0.sgf80.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

app.use(cors());
app.use(express.json());

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

app.get('/signin', async (req, res) => {
    try{
        await client.connect();
        const database = client.db("smart_box");
        const collection = database.collection("users");  // get reference to the collection
        const user = await collection.findOne({ email: req.body.email });

        if (user) {
            const password = await collection.findOne({ password: req.body.password });
            if (password){
                res.status(200).send("User credentials are valid");
            } else{
                res.status(401).send("User password is not valid");
            }
        } else{
            res.status(404).send("User mail is not exists");
        }

    } catch (e){
        console.log(e);
    } finally {
        await client.close()
    }
});

app.post('/signup', async (req, res) => {
    const credentials = { email: req.body.email,
                          password: req.body.password  };

    try{
        await client.connect();
        const database = client.db("smart_box");
        const collection = database.collection("users");  // get reference to the collection
        const user = await collection.findOne({ email: req.body.email });

        if (user) {
            res.status(401).send("User is already exist in the system");
        } else{
            const addedUser = await collection.insertOne(credentials);
            if(addedUser) {
                res.status(200).send("User and password has been successfully added to the system");
            } else{
                res.status(500).send("User credentials were OK but an error has occurred on the server");
            }
        }
    } catch (e){
        console.log(e);
    } finally {
        await client.close()
    }
});

app.listen(3000, ()=> {
    console.log('app is running on port 3000');
});
