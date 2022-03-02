const express = require('express')
const { MongoClient, ServerApiVersion } = require('mongodb');

const app = express()
const uri = "mongodb+srv://smartBox:smartBox@cluster0.sgf80.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


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

app.listen(3000)