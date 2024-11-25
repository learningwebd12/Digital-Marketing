const nodemailer = required("nodemailer");

const transport = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "regmiganesh87@gmail.com",
    pass: "12345",
  },
});

const sendMail = (to, subject, text) => {
  return transport.sendMail({
    from: "regmiganesh87@gmail.com",
    to,
    subject,
    text,
  });
};

module.exports.sendMail;
