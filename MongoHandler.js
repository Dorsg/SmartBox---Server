const { MongoClient, ServerApiVersion } = require('mongodb');

const uri = "mongodb+srv://smartBox:smartBox@cluster0.sgf80.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
let isConnected = false;
let connection;

async function connectToMongo() {
    if(!isConnected){
        try{
            connection = await client.connect();
            isConnected = true;
            return connection;
        } catch (e){
            console.log(e);
        }
    }else{
        return connection;
    }
}


async function getCollection(collectionName, DBName) {
    try{
        let con = await connectToMongo();
        const database = con.db(DBName);
        const collection = database.collection(collectionName);

        return collection;

    } catch (e){
        console.log(e);
        return null;
    }
}

module.exports = { getCollection };