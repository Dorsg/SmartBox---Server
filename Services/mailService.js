const config = require("../Config/config.json");
const sendgrid = require('@sendgrid/mail');
const SENDGRID_API_KEY = "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";
sendgrid.setApiKey(SENDGRID_API_KEY)

async function sendAddToCartMail(amazonLink, emailAddress) {
    try {
        const msg = {
            to: emailAddress,
            from: config.smart_box_mail,
            subject: config.mail_subject,
            html: amazonLink
        }
        sendgrid
            .send(msg)
            .then((resp) => {
                console.log('Email sent\n', resp)
            })
            .catch((error) => {
                console.error(error)
            })
    } catch (e) {
        console.log(e);
    }
}

module.exports = {
    sendAddToCartMail
}