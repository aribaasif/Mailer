require("dotenv").config()
const { workerData } = require("worker_threads");
const nodeMailer = require("nodemailer");
const { Console } = require("console");

const oracledb = require('oracledb');

var moment = require('moment');
const { readSync } = require("fs");
async function main() {
  console.log(workerData.description);
  let transporter = nodeMailer.createTransport({
    service: "Gmail",
    //host: "outlook.office365.com",
    // port: 587,
    //secure: false,
    auth: {
      user: process.env.EMAIL, //REPLACE WITH YOUR EMAIL ADDRESS
      pass: process.env.PASSWORD //REPLACE WITH YOUR EMAIL PASSWORD
    },

    tls: {
      rejectUnauthorized: false
    }
  });

  try {
    var connection = await oracledb.getConnection({
      user: "sys",
      password: "ariba",
      connectString: "localhost:1521/orcl",
      privilege: oracledb.SYSDBA
    });
    let query = 'SELECT * FROM Books a, Recipients b, category c where a.issued_to=b.rid and b.category=c.category_id';

    result = await connection.execute(query, [], // no binds
      {
        outFormat: oracledb.OBJECT
      });

    if (result.rows.length == 0) {
      console.log('zero rows');
    } else {
      result.rows.forEach(async function (result) {
        //3 days -> alert
        //after 1 day -> remainder
        //after 7 days -> notice
        var current = moment();
        var returndate = new Date(result.RETURN_DATE);
        var retdate = result.RETURN_DATE;
        returndate = moment(returndate);
        //lost book completed
        if (current.diff(returndate, 'days') == +365) {
        
        let query = `UPDATE books SET BOOK_STATUS = 'Lost Book' WHERE BOOK_TITLE = '${result.BOOK_TITLE}'`;
         connection.execute(
          query,      
          {
     },
                {
                    autoCommit: true
                },
                function(err, results){
                    console.log(err);
                    console.log("results");
                    console.log(results)
                    if (err) {
                        connection.release(function(err) {
                            if (err) {
                                console.error(err.message);
                            }
                        });}})
          console.log("updated");
          let result2 = await connection.execute(query, [], // no binds
            {
              outFormat: oracledb.OBJECT
            });
        }
        // //change this code for others (this is the code for notice (after 7 days)) completed
        if (current.diff(returndate, 'days') == +7) {
          console.log(result.BOOK_TITLE);
          var returnData  = moment(returndate).format("DD MMM YYYY");
          console.log(returnData);
          var issuedate = result.ISSUE_DATE;
          var issuedata = moment(issuedate).format("DD MMM YYYY");
          console.log("old"+issuedata);
          console.log(current);
          await transporter.sendMail({
            from: process.env.EMAIL, //SENDER
            to: result.EMAIL, //MULTIPLE RECEIVERS
            subject: "Notice for Overdue Books - Engr. Abul Kalam Library - NED University of Engg & Tech.", //EMAIL SUBJECT
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
            "<br><p style='color: #333333; font-size: 16px; font-weight: 400; line-height: 24px;'><b>Respected Borrower,</b><br><p>You are hereby informed that the following book issued to you from the Circulation Section of the Library has been overdue for some time.</p></p>" +
            "<tr> <td align='center' style='padding: 35px 35px 20px 35px; background-color: #ffffff;' bgcolor='#ffffff'>" +
            "<table align='center' border='0' cellpadding='0' cellspacing='0' width='100%' style='max-width:600px;'>" +
            "<tr><td align='left' style='padding-top: 20px;'>" +
            "<table cellspacing='0' cellpadding='0' border='0' width='100%'>" +
            "<tr><td width='40%' align='left' bgcolor='#eeeeee' style='color: #333333; font-family: Open Sans, Helvetica, Arial, sans-serif; font-size: 16px; font-weight: 800; line-height: 24px; padding: 10px;'> Complete Information </td>" +
            "<td width='60%' align='left' color: #333333; bgcolor='#eeeeee' style='font-family: Open Sans, Helvetica, Arial, sans-serif; font-size: 16px; font-weight: 800; line-height: 24px; padding: 10px;'></td> </tr>" +
            "<tr><td width='40%' align='left' style='font-family: Open Sans, Helvetica, Arial, sans-serif; color: #333333; font-size: 16px; font-weight: 200; line-height: 24px; padding: 15px 10px 5px 10px;'>Book's Title </td>" +
            "<td width='60%' align='left' style='font-family: Open Sans, Helvetica, Arial, sans-serif; color: #333333; font-size: 16px; font-weight: 400; line-height: 24px; padding: 15px 10px 5px 10px;'>" + result.BOOK_TITLE + "</td></tr>" +
            "<tr><td width='40%' align='left' style='font-family: Open Sans, Helvetica, Arial, sans-serif; color: #333333; font-size: 16px; font-weight: 400; line-height: 24px; padding: 5px 10px;'>Book's Author </td>" +
            "<td width='60%' align='left' style='font-family: Open Sans, Helvetica, Arial, sans-serif; color: #333333; font-size: 16px; font-weight: 400; line-height: 24px; padding: 5px 10px;'>" + result.AUTHOR + "</td></tr>" +
            "<tr><td width='40%' align='left' style='font-family: Open Sans, Helvetica, Arial, sans-serif; color: #333333; font-size: 16px; font-weight: 400; line-height: 24px; padding: 5px 10px;'>Issue Date </td>" +
            "<td width='60%' align='left' style='font-family: Open Sans, Helvetica, Arial, sans-serif; color: #333333; font-size: 16px; font-weight: 400; line-height: 24px; padding: 5px 10px;'>" + issuedata + "</td></tr>" +
            "<tr><td width='40%' align='left' style='font-family: Open Sans, Helvetica, Arial, sans-serif; color: #333333; font-size: 16px; font-weight: 400; line-height: 24px; padding: 5px 10px;'>Return Date </td>" +
            "<td width='60%' align='left' style='font-family: Open Sans, Helvetica, Arial, sans-serif; color: #333333; font-size: 16px; font-weight: 400; line-height: 24px; padding: 5px 10px;'>" + returnData + "</td></tr>" +
            "</tr> </table> </td></tr>" +
            "<br><p>This is the second and final notice being sent to you. You are requested to kindly either return the book or renew it from the library on immediate basis and pay overdue charges. <br><b>Please Note that Overdue Charges will not be charged for days when library is closed due to COVID19 Pandemic</b></p>"+
            "<p>Your cooperation in this regard shall be highly appreciated.</p> <br>"+
            "Regards, <br>Circulation Librarian <br>Engr. Abul Kalam Library<br>NED University of Engineering and Technology."+
            "<br><br><b>Note: *This is an auto generated email. Please do not reply to it.*</b>"+
            "<br><b>Note: *Kindly ignore this email if you have already returned/renewed the book.*</b>"+
            "<tr><td align='center' style='padding: 35px; background-color: #ffffff;' bgcolor='#ffffff'><table align='center' border='0' cellpadding='0' cellspacing='0' width='100%' style='max-width:600px;'>" +
            "<tr><td align='center'><img src='https://www.pnglogos.com/images/education/ned-university-of-engineering-technolo-logo.png' width='37' height='37' style='display: block; border: 0px;'/></td> </tr><tr>" +
            "<td align='center' style='font-family: Open Sans, Helvetica, Arial, sans-serif; font-size: 14px; font-weight: 400; line-height: 24px; padding: 5px 0 10px 0;'>" +
            "<p style='font-size: 14px; line-height: 18px; color: #333333;'><b>NED University</b><br>Karachi, Karachi City, Sindh</p></td></tr>" +
            "<tr><td align='left' style='font-family: Open Sans, Helvetica, Arial, sans-serif; font-size: 14px; font-weight: 400; line-height: 24px;'>" +
            "</p></td></tr>" +
            "</table></td></tr></table></td></tr></table>" +
            "</body>", //EMAIL BODY IN HTML FORMAT
          })
        }
        //change this code for others (this is the code for alert (before 3 days)) completed
        else if (current.diff(returndate, 'days') == -2) {
          var returnData  = moment(returndate).format("DD MMM YYYY");
          console.log(returnData);
          var issuedate = result.ISSUE_DATE;
          var issuedata = moment(issuedate).format("DD MMM YYYY");
          console.log("old"+issuedata);
          console.log(result.BOOK_TITLE);
          console.log(returndate);
          await transporter.sendMail({
            from: process.env.EMAIL, //SENDER
            to: result.EMAIL, //MULTIPLE RECEIVERS
            subject: "Alert for Issued Books - Engr. Abul Kalam Library - NED University of Engg & Tech.", //EMAIL SUBJECT
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
              "<br><p style='color: #333333; font-size: 16px; font-weight: 400; line-height: 24px;'><b>Respected Borrower,</b><br><p>You are hereby informed that the following book issued to you from the Circulation Section of the Library will be due on " + returnData + "</p></p>" +
              "<tr> <td align='center' style='padding: 35px 35px 20px 35px; background-color: #ffffff;' bgcolor='#ffffff'>" +
              "<table align='center' border='0' cellpadding='0' cellspacing='0' width='100%' style='max-width:600px;'>" +
              "<tr><td align='left' style='padding-top: 20px;'>" +
              "<table cellspacing='0' cellpadding='0' border='0' width='100%'>" +
              "<tr><td width='40%' align='left' bgcolor='#eeeeee' style='color: #333333; font-family: Open Sans, Helvetica, Arial, sans-serif; font-size: 16px; font-weight: 800; line-height: 24px; padding: 10px;'> Complete Information </td>" +
              "<td width='60%' align='left' color: #333333; bgcolor='#eeeeee' style='font-family: Open Sans, Helvetica, Arial, sans-serif; font-size: 16px; font-weight: 800; line-height: 24px; padding: 10px;'></td> </tr>" +
              "<tr><td width='40%' align='left' style='font-family: Open Sans, Helvetica, Arial, sans-serif; color: #333333; font-size: 16px; font-weight: 200; line-height: 24px; padding: 15px 10px 5px 10px;'>Book's Title </td>" +
              "<td width='60%' align='left' style='font-family: Open Sans, Helvetica, Arial, sans-serif; color: #333333; font-size: 16px; font-weight: 400; line-height: 24px; padding: 15px 10px 5px 10px;'>" + result.BOOK_TITLE + "</td></tr>" +
              "<tr><td width='40%' align='left' style='font-family: Open Sans, Helvetica, Arial, sans-serif; color: #333333; font-size: 16px; font-weight: 400; line-height: 24px; padding: 5px 10px;'>Book's Author </td>" +
              "<td width='60%' align='left' style='font-family: Open Sans, Helvetica, Arial, sans-serif; color: #333333; font-size: 16px; font-weight: 400; line-height: 24px; padding: 5px 10px;'>" + result.AUTHOR + "</td></tr>" +
              "<tr><td width='40%' align='left' style='font-family: Open Sans, Helvetica, Arial, sans-serif; color: #333333; font-size: 16px; font-weight: 400; line-height: 24px; padding: 5px 10px;'>Issue Date </td>" +
              "<td width='60%' align='left' style='font-family: Open Sans, Helvetica, Arial, sans-serif; color: #333333; font-size: 16px; font-weight: 400; line-height: 24px; padding: 5px 10px;'>" + issuedata + "</td></tr>" +
              "<tr><td width='40%' align='left' style='font-family: Open Sans, Helvetica, Arial, sans-serif; color: #333333; font-size: 16px; font-weight: 400; line-height: 24px; padding: 5px 10px;'>Return Date </td>" +
              "<td width='60%' align='left' style='font-family: Open Sans, Helvetica, Arial, sans-serif; color: #333333; font-size: 16px; font-weight: 400; line-height: 24px; padding: 5px 10px;'>" + returnData + "</td></tr>" +
              "</tr> </table> </td></tr>" +
              "<br><p>Your are requested to kindly return/renew the book by the due date.<br>Your cooperation in this regard shall be highly appreciated.</p> <br>"+
              "Regards, <br>Circulation Librarian <br>Engr. Abul Kalam Library<br>NED University of Engineering and Technology."+
              "<br><br><b>Note: *This is an auto generated email. Please do not reply to it.*</b>"+
              "<tr><td align='center' style='padding: 35px; background-color: #ffffff;' bgcolor='#ffffff'><table align='center' border='0' cellpadding='0' cellspacing='0' width='100%' style='max-width:600px;'>" +
              "<tr><td align='center'><img src='https://www.pnglogos.com/images/education/ned-university-of-engineering-technolo-logo.png' width='37' height='37' style='display: block; border: 0px;'/></td> </tr><tr>" +
              "<td align='center' style='font-family: Open Sans, Helvetica, Arial, sans-serif; font-size: 14px; font-weight: 400; line-height: 24px; padding: 5px 0 10px 0;'>" +
              "<p style='font-size: 14px; line-height: 18px; color: #333333;'><b>NED University</b><br>Karachi, Karachi City, Sindh</p></td></tr>" +
              "<tr><td align='left' style='font-family: Open Sans, Helvetica, Arial, sans-serif; font-size: 14px; font-weight: 400; line-height: 24px;'>" +
              "</p></td></tr>" +
              "</table></td></tr></table></td></tr></table>" +
              "</body>", //EMAIL BODY IN HTML FORMAT
          })
        }
        //change this code for others (this is the code for reminder (after 1 day)) completed
        else if (current.diff(returndate, 'days') == +1) {
          var returnData  = moment(returndate).format("DD MMM YYYY");
          console.log(returnData);
          var issuedate = result.ISSUE_DATE;
          var issuedata = moment(issuedate).format("DD MMM YYYY");
          console.log("old"+issuedata);
          console.log(result.BOOK_TITLE);
          console.log(returndate);
          console.log(current);
          await transporter.sendMail({
            from: process.env.EMAIL, //SENDER
            to: result.EMAIL, //MULTIPLE RECEIVERS
            subject: "Reminder for Overdue Books - Engr. Abul Kalam Library - NED University of Engg & Tech.", //EMAIL SUBJECT
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
                 "<br><p style='color: #333333; font-size: 16px; font-weight: 400; line-height: 24px;'><b>Respected Borrower,</b><br><p>You are hereby informed that the following book issued to you from the Circulation Section of the Library is now overdue.</p></p>" +
                 "<tr> <td align='center' style='padding: 35px 35px 20px 35px; background-color: #ffffff;' bgcolor='#ffffff'>" +
                 "<table align='center' border='0' cellpadding='0' cellspacing='0' width='100%' style='max-width:600px;'>" +
                 "<tr><td align='left' style='padding-top: 20px;'>" +
                 "<table cellspacing='0' cellpadding='0' border='0' width='100%'>" +
                 "<tr><td width='40%' align='left' bgcolor='#eeeeee' style='color: #333333; font-family: Open Sans, Helvetica, Arial, sans-serif; font-size: 16px; font-weight: 800; line-height: 24px; padding: 10px;'> Complete Information </td>" +
                 "<td width='60%' align='left' color: #333333; bgcolor='#eeeeee' style='font-family: Open Sans, Helvetica, Arial, sans-serif; font-size: 16px; font-weight: 800; line-height: 24px; padding: 10px;'></td> </tr>" +
                 "<tr><td width='40%' align='left' style='font-family: Open Sans, Helvetica, Arial, sans-serif; color: #333333; font-size: 16px; font-weight: 200; line-height: 24px; padding: 15px 10px 5px 10px;'>Book's Title </td>" +
                 "<td width='60%' align='left' style='font-family: Open Sans, Helvetica, Arial, sans-serif; color: #333333; font-size: 16px; font-weight: 400; line-height: 24px; padding: 15px 10px 5px 10px;'>" + result.BOOK_TITLE + "</td></tr>" +
                 "<tr><td width='40%' align='left' style='font-family: Open Sans, Helvetica, Arial, sans-serif; color: #333333; font-size: 16px; font-weight: 400; line-height: 24px; padding: 5px 10px;'>Book's Author </td>" +
                 "<td width='60%' align='left' style='font-family: Open Sans, Helvetica, Arial, sans-serif; color: #333333; font-size: 16px; font-weight: 400; line-height: 24px; padding: 5px 10px;'>" + result.AUTHOR + "</td></tr>" +
                 "<tr><td width='40%' align='left' style='font-family: Open Sans, Helvetica, Arial, sans-serif; color: #333333; font-size: 16px; font-weight: 400; line-height: 24px; padding: 5px 10px;'>Issue Date </td>" +
                 "<td width='60%' align='left' style='font-family: Open Sans, Helvetica, Arial, sans-serif; color: #333333; font-size: 16px; font-weight: 400; line-height: 24px; padding: 5px 10px;'>" + issuedata + "</td></tr>" +
                 "<tr><td width='40%' align='left' style='font-family: Open Sans, Helvetica, Arial, sans-serif; color: #333333; font-size: 16px; font-weight: 400; line-height: 24px; padding: 5px 10px;'>Return Date </td>" +
                 "<td width='60%' align='left' style='font-family: Open Sans, Helvetica, Arial, sans-serif; color: #333333; font-size: 16px; font-weight: 400; line-height: 24px; padding: 5px 10px;'>" + returnData + "</td></tr>" +
                 "</tr> </table> </td></tr>" +
                 "<br><p>You are requested to kindly either return the book or renew it from the library on immediate basis and pay overdue charges. <br><b>Please Note that Overdue Charges will not be charged for days when library is closed due to COVID19 Pandemic</b></p>"+
                 "<p>Your cooperation in this regard shall be highly appreciated.</p> <br>"+
                 "Regards, <br>Circulation Librarian <br>Engr. Abul Kalam Library<br>NED University of Engineering and Technology."+
                 "<br><br><b>Note: *This is an auto generated email. Please do not reply to it.*</b>"+
                 "<br><b>Note: *Kindly ignore this email if you have already returned/renewed the book.*</b>"+
                 "<tr><td align='center' style='padding: 35px; background-color: #ffffff;' bgcolor='#ffffff'><table align='center' border='0' cellpadding='0' cellspacing='0' width='100%' style='max-width:600px;'>" +
                 "<tr><td align='center'><img src='https://www.pnglogos.com/images/education/ned-university-of-engineering-technolo-logo.png' width='37' height='37' style='display: block; border: 0px;'/></td> </tr><tr>" +
                 "<td align='center' style='font-family: Open Sans, Helvetica, Arial, sans-serif; font-size: 14px; font-weight: 400; line-height: 24px; padding: 5px 0 10px 0;'>" +
                 "<p style='font-size: 14px; line-height: 18px; color: #333333;'><b>NED University</b><br>Karachi, Karachi City, Sindh</p></td></tr>" +
                 "<tr><td align='left' style='font-family: Open Sans, Helvetica, Arial, sans-serif; font-size: 14px; font-weight: 400; line-height: 24px;'>" +
                 "</p></td></tr>" +
                 "</table></td></tr></table></td></tr></table>" +
              "</table></td></tr></table></td></tr></table></body>", //EMAIL BODY IN HTML FORMAT
          })
        }
        // 1 week before marking lost
        else if (current.diff(returndate, 'days') == -358) {
          console.log(result.BOOK_TITLE);
          var returnData  = moment(returndate).format("DD MMM YYYY");
          console.log(returnData);
          var issuedate = result.ISSUE_DATE;
          var issuedata = moment(issuedate).format("DD MMM YYYY");
          console.log("old"+issuedata);
          console.log(returndate);
          console.log(current);
          await transporter.sendMail({
            from: process.env.EMAIL, //SENDER
            to: result.EMAIL, //MULTIPLE RECEIVERS
            subject: "Final Reminder - Engr. Abul Kalam Library - NED University of Engg & Tech.", //EMAIL SUBJECT
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
            "<br><p style='color: #333333; font-size: 16px; font-weight: 400; line-height: 24px;'><b>Respected Borrower,</b><br><p>You are hereby informed that the following book issued to you from the Circulation Section of the Library for a very long time now.</p></p>" +
            "<tr> <td align='center' style='padding: 35px 35px 20px 35px; background-color: #ffffff;' bgcolor='#ffffff'>" +
            "<table align='center' border='0' cellpadding='0' cellspacing='0' width='100%' style='max-width:600px;'>" +
            "<tr><td align='left' style='padding-top: 20px;'>" +
            "<table cellspacing='0' cellpadding='0' border='0' width='100%'>" +
            "<tr><td width='40%' align='left' bgcolor='#eeeeee' style='color: #333333; font-family: Open Sans, Helvetica, Arial, sans-serif; font-size: 16px; font-weight: 800; line-height: 24px; padding: 10px;'> Complete Information </td>" +
            "<td width='60%' align='left' color: #333333; bgcolor='#eeeeee' style='font-family: Open Sans, Helvetica, Arial, sans-serif; font-size: 16px; font-weight: 800; line-height: 24px; padding: 10px;'></td> </tr>" +
            "<tr><td width='40%' align='left' style='font-family: Open Sans, Helvetica, Arial, sans-serif; color: #333333; font-size: 16px; font-weight: 200; line-height: 24px; padding: 15px 10px 5px 10px;'>Book's Title </td>" +
            "<td width='60%' align='left' style='font-family: Open Sans, Helvetica, Arial, sans-serif; color: #333333; font-size: 16px; font-weight: 400; line-height: 24px; padding: 15px 10px 5px 10px;'>" + result.BOOK_TITLE + "</td></tr>" +
            "<tr><td width='40%' align='left' style='font-family: Open Sans, Helvetica, Arial, sans-serif; color: #333333; font-size: 16px; font-weight: 400; line-height: 24px; padding: 5px 10px;'>Book's Author </td>" +
            "<td width='60%' align='left' style='font-family: Open Sans, Helvetica, Arial, sans-serif; color: #333333; font-size: 16px; font-weight: 400; line-height: 24px; padding: 5px 10px;'>" + result.AUTHOR + "</td></tr>" +
            "<tr><td width='40%' align='left' style='font-family: Open Sans, Helvetica, Arial, sans-serif; color: #333333; font-size: 16px; font-weight: 400; line-height: 24px; padding: 5px 10px;'>Issue Date </td>" +
            "<td width='60%' align='left' style='font-family: Open Sans, Helvetica, Arial, sans-serif; color: #333333; font-size: 16px; font-weight: 400; line-height: 24px; padding: 5px 10px;'>" + issuedata + "</td></tr>" +
            "<tr><td width='40%' align='left' style='font-family: Open Sans, Helvetica, Arial, sans-serif; color: #333333; font-size: 16px; font-weight: 400; line-height: 24px; padding: 5px 10px;'>Return Date </td>" +
            "<td width='60%' align='left' style='font-family: Open Sans, Helvetica, Arial, sans-serif; color: #333333; font-size: 16px; font-weight: 400; line-height: 24px; padding: 5px 10px;'>" + returnData + "</td></tr>" +
            "</tr> </table> </td></tr>" +
            "<br><p>You are requested to kindly either return the book or renew it from the library on immediate basis and pay overdue charges before any serious action is taken by the university. <br><b>Please Note that Overdue Charges will not be charged for days when library is closed due to COVID19 Pandemic</b></p>"+
            "<p>Your cooperation in this regard shall be highly appreciated.</p> <br>"+
            "Regards, <br>Circulation Librarian <br>Engr. Abul Kalam Library<br>NED University of Engineering and Technology."+
            "<br><br><b>Note: *This is an auto generated email. Please do not reply to it.*</b>"+
            "<br><b>Note: *Kindly ignore this email if you have already returned/renewed the book.*</b>"+
            "<tr><td align='center' style='padding: 35px; background-color: #ffffff;' bgcolor='#ffffff'><table align='center' border='0' cellpadding='0' cellspacing='0' width='100%' style='max-width:600px;'>" +
            "<tr><td align='center'><img src='https://www.pnglogos.com/images/education/ned-university-of-engineering-technolo-logo.png' width='37' height='37' style='display: block; border: 0px;'/></td> </tr><tr>" +
            "<td align='center' style='font-family: Open Sans, Helvetica, Arial, sans-serif; font-size: 14px; font-weight: 400; line-height: 24px; padding: 5px 0 10px 0;'>" +
            "<p style='font-size: 14px; line-height: 18px; color: #333333;'><b>NED University</b><br>Karachi, Karachi City, Sindh</p></td></tr>" +
            "<tr><td align='left' style='font-family: Open Sans, Helvetica, Arial, sans-serif; font-size: 14px; font-weight: 400; line-height: 24px;'>" +
            "</p></td></tr>" +
            "</table></td></tr></table></td></tr></table>" +
         "</table></td></tr></table></td></tr></table></body>", //EMAIL BODY IN HTML FORMAT
          })
        }

      });
      //    console.log(result.rows);

      //
      //  return res.send(result.rows);
    }
  } catch (err) {
    console.log(err);
    console.log('error');
    return null;
    //send error message
    //return res.send(err.message);
  }
  finally {
    if (connection) {
      try {
        // Always close connections
        // await connection.close();
        // console.log('close connection success');
      } catch (err) {
        console.error(err.message);
      }
    }
    //Transporter configuration

    // //Email configuration

  }
}

main().catch(err => console.log(err))