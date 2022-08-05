const DBAccessor = require('../DBAccessor/MongoAccessor');
const mailService = require('../Services/mailService')
const amazonService = require('../Services/amazonService')

async function rootFunction(req, res) {
    res.status(200).json({message: "SmartBox is running :)"});
}

async function signIn(req, res) {
    const credentials = {
        email: req.query.email, password: req.query.password
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
        email: req.body.email, password: req.body.password
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
    try {
        // update user with amazon link
        let amazonAddToCartLink = amazonService.createAddToCartLink(req.body.amazon_link);
        const toUpdateUser = {
            box_id: req.body.box_id,
            amazon_link: amazonAddToCartLink
        };
        const userUpdateStatus = await DBAccessor.updateUserByEmail(toUpdateUser, req.body.email)

        // update box with all properties
        const boxToInsert = {
            box_id: req.body.box_id,
            current_weight: req.body.current_weight,
            max_weight: req.body.current_weight,
            baseline: req.body.baseline,
        };
        const insertBoxStatus = await DBAccessor.insertBox(boxToInsert);

        // check status
        if (userUpdateStatus === 200 && insertBoxStatus === 200)
            res.status(200).json({message: "User with email: " + req.body.email + " has updated his setting details"});
        else
            res.status(401).json({error: "User with email: " + req.body.email + " did not updated (or partly) setting from some reason"});

    } catch (e) {
        console.log(e);
    }
}


module.exports = {
    rootFunction, signIn, signUp, updateSettings, getInfo, updateWeight
};

