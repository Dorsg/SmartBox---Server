const config = require("../Config/config.json");
const {MongoClient, ServerApiVersion} = require('mongodb');

let connectionPromise;
let mongo;

function mongoConnect() {
    if (!mongo) {
        const client = new MongoClient(config.uri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverApi: ServerApiVersion.v1
        });

        try {
            connectionPromise = connectionPromise || client.connect().then(() => {
                mongo = client;
                return Promise.resolve(mongo);
            }).catch((e) => {
                console.log(e);
                connectionPromise = undefined;
                return Promise.resolve(null);
            });
            return connectionPromise;
        } catch (err) {
            connectionPromise = undefined;
            return Promise.resolve(null);
        }
    } else {
        return Promise.resolve(mongo);
    }
}

async function checkCred(credentials) {
    try {
        let client = await mongoConnect();
        const database = client.db(config.db);
        const collection_users = database.collection(config.collection_users);  // get reference to the collection
        const user = await collection_users.findOne({email: credentials.email});

        if (user) {
            if (user.password === credentials.password) {
                return 200;
            } else return 401;
        } else return 404;

    } catch (e) {
        console.log(e);
    }
}

async function insertUser(credentials) {
    try {
        let client = await mongoConnect();
        const database = client.db(config.db);
        const collection_users = database.collection(config.collection_users);
        const user = await collection_users.findOne({email: credentials.email});

        if (user) {
            return 401;
        } else {
            const addedUser = await collection_users.insertOne(credentials);
            if (addedUser) {
                return 200;
            } else {
                return 500;
            }
        }
    } catch (e) {
        console.log(e);
    }
}

async function insertBox(box) {
    try {
        let client = await mongoConnect();
        const database = client.db(config.db);
        const boxes_collection = database.collection(config.collection_boxes);
        await boxes_collection.insertOne(box);
        return 200
    } catch (e) {
        console.log(e);
        return 401;
    }
}

async function updateUserByEmail(toUpdate, email) {
    try {
        let client = await mongoConnect();
        const database = client.db(config.db);
        const user_collection = database.collection(config.collection_users);
        const user = await user_collection.findOne({email: email});

        if (user) {
            await user_collection.updateOne({email: email}, {$set: toUpdate});
            return 200;
        } else {
            return 401;
        }
    } catch (e) {
        console.log(e);
    }

}

async function getInfoOnUser(credentials) {
    try {
        let client = await mongoConnect();
        const database = client.db(config.db);
        const collection_users = database.collection(config.collection_users);
        const user = await collection_users.findOne({email: credentials.email});

        if (user) {
            if (user.password === credentials.password) {
                const collection_boxes = database.collection(config.collection_boxes);
                const box = await collection_boxes.findOne({box_id: user.box_id});

                return {
                    box_id: user.box_id,
                    amazon_link: user.amazon_link,
                    baseline: box.baseline,
                    current_weight: box.current_weight,
                    max_weight: box.max_weight
                };

            } else {
                return 401;
            }
        } else {
            return 404;
        }
    } catch (e) {
        console.log(e);
    }
}

async function updateWeight(details) {
    let box;
    try {
        let client = await mongoConnect();
        let database = client.db(config.db);
        let collection_boxes = database.collection(config.collection_boxes);
        box = await collection_boxes.findOne({box_id: details.box_id});

        if (box) { // box id exist in system
            await collection_boxes.updateOne({box_id: details.box_id}, {$set: details});
            return 200;
        } else {
            return 401;
        }
    } catch (e) {
        console.log(e);
    }
}

async function getBoxById(id) {
    try {
        let client = await mongoConnect();
        let database = client.db(config.db);
        let collection_boxes = database.collection(config.collection_boxes);
        return await collection_boxes.findOne({box_id: id});
    } catch (e) {
        console.log(e);
    }
}

async function getUserById(id) {
    try {
        let client = await mongoConnect();
        let database = client.db(config.db);
        let collection_users = database.collection(config.collection_users);
        return await collection_users.findOne({box_id: id});
    } catch (e) {
        console.log(e);
    }
}

module.exports = {
    checkCred, insertUser, getInfoOnUser, updateWeight, getBoxById, getUserById, updateUserByEmail, insertBox
}