'use strict'
const nodemailer = require('nodemailer');

const hbs = require('nodemailer-express-handlebars');
const config = require('../helpers/config');
const oracledb = require('oracledb');
const email = require('../routes/email');
//getallcategories();
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: "neduet.edu.pk1@gmail.com",
    pass: "ecnmamjkxholvetl"
  },
  tls: {
    rejectUnauthorized: false
  }
});

transporter.use('compile', hbs({
  viewEngine: 'express-handlebars',
  viewPath: '../views/'
}));



// checkConnection();
const emailView = (req, res, next) => {
  res.render('email');
}

const getCategories = async (req, res) => {
  var connection = false;
  try {
    connection = await oracledb.getConnection({
      user: "sys",
      password: "ariba",
      connectString: "localhost:1521/orcl",
      privilege: oracledb.SYSDBA
    });
    console.log('connected to database');
  } catch (err) {
    console.error(err.message);

    res.redirect('/');
  } finally {
    if (connection) {
      try {
        let query = 'select * from category';
        //

        var result = await connection.execute(query);
        // Always close connections
        await connection.close();
        console.log('close connection success');
        res.render('index.ejs', {
          title: "Ariba testing categories",
          categories: result,
          async: true

        });
      } catch (err) {
        console.error(err.message);

        res.redirect('/');
      }
    }
  }

};


const getDatabase = async (req, res) => {
  var connection = false

  console.log("RESULT1")
  try {
    connection = await oracledb.getConnection({
      user: "sys",
      password: "ariba",
      connectString: "localhost:1521/orcl",
      privilege: oracledb.SYSDBA
    });
    console.log('connected to database');
  } catch (err) {
    console.error(err.message);

    res.redirect('/');
  } finally {
    if (connection) {
      try {
        let query = 'select * from database';
        //

        var result = await connection.execute(query);

        console.log(result)

        // Always close connections
        await connection.close();
        console.log('close connection success');
        res.render('index.ejs', {
          title: "Ariba testing database table",
          database: result,
          async: true

        });
      } catch (err) {
        console.error(err.message);

        res.redirect('/');
      }
    }
  }

};


const sendEmail = async (req, res, next) => {
  try {
    const { emailobject } = req.body;
    var jsonobject = JSON.parse(emailobject);
    var to = '';
    // console.log(jsonobject. category );
    var connection = false;
    try {
      connection = await oracledb.getConnection({
        user: "sys",
        password: "ariba",
        connectString: "localhost:1521/orcl",
        privilege: oracledb.SYSDBA
      });
    } catch (err) {
      console.error(err.message);
    } finally {
      if (connection) {

        try {
          let query = `SELECT EMAIL FROM RECIPIENTS WHERE CATEGORY = '${jsonobject.category}' AND (BATCH = '${jsonobject.batch}' OR DESIGNATION = '${jsonobject.designation}') AND DEPARTMENT = '${jsonobject.department}' `;
          connection.execute(
            query,
            {
            },
            {
              autoCommit: true
            },
            function (err, results) {
              console.log(err);

              results.rows.forEach(async function (result) {
                to = to + "," + result;
              });
              console.log("to mails");
              console.log(to);
              const files = req.files;
              if (emailobject) {
                const email = JSON.parse(emailobject);
                const mailoptions = {
                  from: "neduet.edu.pk1@gmail.com",
                  to: email.emailto + to,
                  cc: email.emailcc,
                  bcc: email.emailbcc,
                  subject: email.subject,
                  attachments: files,
                  html: "<meta http-equiv='Content-Type' content='text/html'; charset='utf-8'/>" +
                    "<meta name='viewport' content='width=device-width', initial-scale='1'>" +
                    "<meta http-equiv='X-UA-Compatible' content='IE=edge'/>" +
                    "<style type='text/css'> body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; } table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; } img { -ms-interpolation-mode: bicubic; } img { border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; } table { border-collapse: collapse !important; } body { height: 100% !important; margin: 0 !important; padding: 0 !important; width: 100% !important; } a[x-apple-data-detectors] color: inherit !important; text-decoration: none !important; font-size: inherit !important; font-family: inherit !important; font-weight: inherit !important; line-height: inherit !important; } @media screen and (max-width: 480px) { .mobile-hide { display: none !important; } .mobile-center { text-align: center !important;  }} div[style*='margin: 16px 0;'] { margin: 0 !important; } </style>" +
                    "<body style='margin: 0 !important; padding: 0 !important; background-color: '#eeeeee'; bgcolor='#eeeeee'>" +
                    "<table align='center' border='0' cellpadding='0' cellspacing='0' width='100%' style='max-width:600px;'>" +
                    "<tr> <td align='cente' valign='top' style='font-size:0; padding: 20px;' bgcolor='#F44336'> " +
                    "<div style='display:inline-block; max-width:50%; min-width:100px; vertical-align:top; width:100%;'>" +
                    "<table align='left' border='0' cellpadding='0' cellspacing='0' width='100%' style='max-width:300px;'>" +
                    "<tr> <td align='left' valign='top' style='font-family: Open Sans, Helvetica, Arial, sans-serif;  class='mobile-center'>" +
                    "<a href='#' target='_blank' style='color: #ffffff; text-decoration: none;'><img src='https://www.neduet.edu.pk/sites/default/files/LOGONEDUET2LOGO_1.png' width='160' height='40' style='display: block; border: 0px;'/></a>" +
                    "</td> </tr> </table> </div>" +
                    "<div style='display:inline-block; max-width:50%; min-width:100px; vertical-align:top; width:100%;' class='mobile-hide'>" +
                    "<table align='left' border='0' cellpadding='0' cellspacing='0' width='100%' style='max-width:300px;'>" +
                    "<tr> <td align='right' valign='top' style='font-family: Open Sans, Helvetica, Arial, sans-serif; font-size: 48px; font-weight: 400; line-height: 48px;'>" +
                    "<table cellspacing='0' cellpadding='0' border='0' align='right'>" +
                    "<tr> <td style='font-family: Open Sans, Helvetica, Arial, sans-serif; font-size: 18px; font-weight: 400;'>" +
                    "<p style='font-size: 18px; font-weight: 400; margin: 0; color: #ffffff;'></p>" +
                    "</td> <td style='font-family: Open Sans, Helvetica, Arial, sans-serif; font-size: 18px; font-weight: 400; line-height: 24px;'>" +
                    "</td> </tr> </table> </td> </tr> </table> </div> </td> </tr>" +
                    "<br><p>" + email.body + "</p>" +
                    "<tr> <td align='center' style='padding: 35px 35px 20px 35px; background-color: #ffffff;' bgcolor='#ffffff'>" +
                    "<table align='center' border='0' cellpadding='0' cellspacing='0' width='100%' style='max-width:600px;'> <tr>" +
                    "<td align='center' style='font-family: Open Sans, Helvetica, Arial, sans-serif; font-size: 16px; font-weight: 400; line-height: 24px; padding-top: 20px;'>" +
                    "<tr> <td align='left' style='font-family: Open Sans, Helvetica, Arial, sans-serif; font-size: 16px; font-weight: 400; line-height: 24px; padding-top: 10px;'>" +
                    "</td> </tr> <tr><td align='left' style='padding-top: 20px;'>" +
                    "<table cellspacing='0' cellpadding='0' border='0' width='100%'>" +
                    "<tr><td align='left' style='font-family: Open Sans, Helvetica, Arial, sans-serif; font-size: 14px; font-weight: 400; line-height: 24px;'>" +
                    "<p style='font-size: 14px; font-weight: 400; line-height: 20px; color: #777777;''>" +
                    "</p> </td></tr>" +
                    "</table></td></tr></table>" +
                    "For more information, visit <a href='https://library.neduet.edu.pk/' target='_blank' style='color: #777777;'>Engr. Abul Kalam Library</a>" +
                    "<tr><td align='center'><img src='https://www.pnglogos.com/images/education/ned-university-of-engineering-technolo-logo.png' width='37' height='37' style='display: block; border: 0px;'/></td> </tr><tr>" +
                    "<td align='center' style='font-family: Open Sans, Helvetica, Arial, sans-serif; font-size: 14px; font-weight: 400; line-height: 24px; padding: 5px 0 10px 0;'>" +
                    "<p style='font-size: 14px; line-height: 18px; color: #333333;'><b>NED University</b><br>Karachi, Karachi City, Sindh</p></td></tr>" +
                    "<tr><td align='left' style='font-family: Open Sans, Helvetica, Arial, sans-serif; font-size: 14px; font-weight: 400; line-height: 24px;'>" +
                    "</p></td></tr>" +
                    "</td></tr></table>" +
                    "</body>"
                  ,
                };
                transporter.sendMail(mailoptions, function (err, info) {
                  if (err) {
                    console.log(err);
                  } else {
                    alert("Email Sent Successfully!");
                    // $insert = "INSERT INTO NSMAIL (MID, RID, CCEMAIL, EMAILTYPE, SUBJECT, BODY, ATTACHMENTS, LOGS) VALUES (1, 1, 'ariba8500@gmail.com', 'type1', 'test', 'Testing', '', '')";
                    // console.log("Email Sent Succesfully!");
                    // console.log("Email:" +email.emailto);
                    // console.log("Database:" +email.databases);
                    // console.log("Category:" +email.category);
                    // console.log("Batch:" +email.batch);
                    // console.log("Department:"+ email.department);
                    // console.log("Designation:" +email.designation);
                    // console.log("CCEmail:" +email.emailcc);
                    // console.log("Subject:" +email.subject);
                    // console.log("Body:" +email.body);
                    // console.log("Generate Logs Value:" +email.generatelogsvalue);
                    // console.log('Email Send' + info.response);
                  }
                });
              }
              //   let emailData = new emailData();
              //   const emails = {
              //     emailtos: results
              // }

              // emailData.append('emails', JSON.stringify(emails));
              // $.ajax({
              //     url: '/sendemail',npm 
              //     type: 'POST',
              //     datatype: 'json',
              //     processData: false,
              //     contentType: false,
              //     data: emailData,
              //     success: (response) => {
              //         console.log(response);
              //     },
              //     error: (error) => {
              //         console.log(error.message);
              //     }
              // })




              if (err) {
                connection.release(function (err) {
                  if (err) {
                    console.error(err.message);
                  }
                });

                //   return next(err);
              }


              // Always close connections

              console.log('close connection success');


              connection.release(function (err) {
                if (err) {
                  console.error(err.message);
                }
              });
            });
        } catch (err) {
          console.error(err.message);
        }
      }
    }

    // res.status(200).send('Email Sent Successfully');
  } catch (error) {
    res.status(400).send(error);
  }
  
}

module.exports = {
  emailView,
  sendEmail,
  getCategories,
  getDatabase,
}