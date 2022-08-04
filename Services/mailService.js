const config = require("../Config/config.json");
const nodeMailer = require("nodemailer");
const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_API_KEY)

async function sendAddToCartMail(amazonLink, emailAddress) {
    try {
        let transporter = nodeMailer.createTransport({
            host: 'smtp.gmail.com', port: 465, secure: true, auth: {
                user: config.smart_box_mail, pass: config.smart_box_mail_password
            }
        });
        let mailOptions = {
            from: 'Smart Box', to: emailAddress, subject: 'add to cart', html: amazonLink

        };
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                return console.log(error);
            }
            console.log('Message %s sent: %s', info.messageId, info.response);
        });
    } catch (e) {
        console.log(e);
    }
}

module.exports = {
    sendAddToCartMail
}