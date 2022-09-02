const config = require("../Config/config.json");
const DBAccessor = require('../DBAccessor/MongoAccessor');
const mailService = require('../Services/mailService')

async function rootFunction(req, res) {
    res.status(200).json({message: "SmartBox is running :)"});
}

async function signIn(req, res) {
    const credentials = {
        email: req.query.email,
        password: req.query.password
    };
    try {
        const status = await DBAccessor.checkCred(credentials);
        switch (status) {
            case 200:
                res.status(200).json({message: "User credentials are valid"});
                break;
            case 401:
                res.status(401).json({error: "User password is not valid"});
                break;
            default:
                res.status(404).json({error: "User mail is not exists"});
                break;
        }
    } catch (e) {
        console.log("couldn't signe you in due to a DB error", e);
    }
}

async function signUp(req, res) {
    const credentials = {
        email: req.body.email,
        password: req.body.password
    };

    try {
        const status = await DBAccessor.insertUser(credentials);
        switch (status) {
            case 401:
                res.status(401).json({error: "User is already exist in the system"});
                break;
            case 200:
                res.status(200).json({message: "User and password has been successfully added to the system"});
                break;
            default:
                res.status(500).json({error: "User credentials were OK but an error has occurred on the server"});
                break;
        }
    } catch (e) {
        console.log("couldn't sign up due to a DB error", e);
    }
}

async function getInfo(req, res) {
    const credentials = {
        email: req.query.email, password: req.query.password
    };
    try {
        const response = await DBAccessor.getInfoOnUser(credentials);
        switch (response) {
            case 401:
                res.status(401).json({error: "User password is not valid"});
                break;
            case 404:
                res.status(404).json({error: "User mail is not exists"});
                break;
            default:
                res.status(200).json(response);
                break;
        }
    } catch (e) {
        console.log(e);
    }
}

async function updateWeight(req, res) {
    const details = req.body;
    try {
        const status = await DBAccessor.updateWeight(details);
        switch (status) {
            case 200:
                res.status(200).json({message: "Box id: " + details.box_id + " was updated to new weight of: " + details.current_weight});
                await handleNotification(details.box_id);
                break;
            case 401:
                res.status(401).json({error: "User with box id: " + details.box_id + " is not in the system"});
                break;
            default:
                res.status(500).json({error: "User credentials were OK but an error has occurred on the server"});
                break;
        }
    } catch (e) {
        console.log(e);
    }
}

async function handleNotification(box_id) {
    try {
        const box = await DBAccessor.getBoxById(box_id);

        if (box.current_weight < (box.max_weight * (box.baseline / 100))) {
            const user = await DBAccessor.getUserById(box_id);
            if (user) await mailService.sendAddToCartMail(user.amazon_link, user.email);
        }
    } catch (e) {
        console.log(e);

    }
}


async function updateSettings(req, res) {
    let amazon_asin = req.body.amazon_link.substring(req.body.amazon_link.indexOf("dp/") + 3, req.body.amazon_link.lastIndexOf("?"));
    let amazon_link = `https://www.amazon.com/gp/aws/cart/add.html?ASIN.1=${amazon_asin}&Quantity.1=1`

    const update_users = {
        box_id: req.body.box_id,
        amazon_link: amazon_link,
    };

    const update_boxes = {
        box_id: req.body.box_id,
        current_weight: req.body.current_weight,
        max_weight: req.body.current_weight,
        baseline: req.body.baseline,
    };

    try {
        const status = await DBAccessor.updateAmazonLinkAndInsertBox(update_users, update_boxes, req.body.email);
        switch (status) {
            case 200:
                res.status(200).json({message: "User with email: " + req.body.email + " has updated his setting details"});
                break;
            default:
                res.status(401).json({error: "User with email: " + req.body.email + " is not in the system"});
                break;
        }
    } catch (e) {
        console.log(e);
    }
}


module.exports = {
    rootFunction, signIn, signUp, updateSettings, getInfo, updateWeight
};

