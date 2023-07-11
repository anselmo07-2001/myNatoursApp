const nodemailer = require("nodemailer")
const pug = require("pug")
const htmlToText = require("html-to-text")

module.exports = class Email {
    constructor(user, url) {

        this.to = user.email
        this.firstName = user.name.split(" ")[0]
        this.url = url
        this.from = process.env.EMAIL_FROM
    }

    createTransport() {
        if (process.env.NODE_ENV === "production") {
            //NOTE: There are services that are predefined na, like si sendGrid
            return nodemailer.createTransport({
                service: "SendGrid",
                auth: {
                    user: process.env.SENDGRID_USERNAME,
                    pass: process.env.SENDGRID_PASSWORD
                }
            });
        }

        return nodemailer.createTransport({
            host: "sandbox.smtp.mailtrap.io",
            port: 2525,
            auth: {
            user: "172d2a3394730b",
            pass: "34e4a37cd2f15f"
            }
        });
     }


     async send(template, subject) {
        const html = pug.renderFile(`${__dirname}/../views/emails/${template}.pug`, {
            firstName: this.firstName,
            url: this.url,
            subject
        })

        //defining an email option
        const mailOption = {
            from: this.from,
            to: this.to,
            subject: subject,
            text: htmlToText.fromString(html),
            html
        }


        // Using the transporter
        await this.createTransport().sendMail(mailOption)

     }

     async sendWelcome() {
        await this.send("welcome", "Welcome to Natours Family")
     }

     async sendPasswordReset() {
        await this.send("resetPassword", "Your password reset token (valid for only 10 minutes)")
     }
}





// const sendEmail = async(option) => {
//     // Create a transporter
//     const transport = nodemailer.createTransport({
//         host: "sandbox.smtp.mailtrap.io",
//         port: 2525,
//         auth: {
//           user: "172d2a3394730b",
//           pass: "34e4a37cd2f15f"
//         }
//     });

//     // Define an email options
//     const mailOption = {
//         from: "Jun Rivera <rjun170@gmail.com>",
//         to: option.email,
//         subject: option.subject,
//         text: option.message
//         // html:
//     }


//     // Send the email
//     await transport.sendMail(mailOption)
// }

// module.exports = sendEmail

