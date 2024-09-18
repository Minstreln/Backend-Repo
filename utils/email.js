const nodemailer = require('nodemailer');

const sendMail = async (options) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USERNAME, 
      pass: process.env.EMAIL_PASSWORD, 
    },
    tls: {
      rejectUnauthorized: false, 
    },
  });

  // Define the email options
  const mailOptions = {
    from: 'LysterPro <lysterpro@gmail.com>', 
    to: options.to, 
    subject: options.subject, 
    html: options.html, 
  };

  // Send the email
  try {
    await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${options.to}`);
  } catch (error) {
    console.error(`Failed to send email: ${error.message}`);
    throw error;
  }
};

module.exports = sendMail;
