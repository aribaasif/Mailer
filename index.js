'use strict'
const express = require('express');
const config = require('./helpers/config');
const expresslayouts = require('express-ejs-layouts');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');
const emailRoutes = require('./routes/email-routes');
const oracledb = require('oracledb');
const { upload } = require('./helpers/filehelper');
const { getHomePage, getDatabase } = require('./routes/email');

const { emailView, sendEmail, getCategories } = require('./controllers/emailController');
const app = express();
const Bree = require('bree');
const { connect } = require('http2');

const bree = new Bree({
  jobs: [{
    name: 'sendmail',
    cron: '1 12 * * *',
    worker: {
      workerData: {
        description: "This job will send emails."
      }
    }
  }]
})

bree.start()
var jsonParser = bodyParser.json();
app.use(expresslayouts);

app.set('views', __dirname + '/views'); // set express to look in this folder to render our view
app.set('view engine', 'ejs');

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

//app.use(emailRoutes.routes);
// app.use(databaseRoutes.routes);

app.get('/viewemail', emailView);
app.post('/sendemail', upload.array('files'), sendEmail);
app.get('/', [getHomePage]);
app.post('/insertData', jsonParser, function (request, response) {
  console.log("insert");
  console.log("Email To :" + request.body.Toemail);
  console.log("Database :" + request.body.Database);
  console.log("Category :" + request.body.Category);
  console.log("Batch :" + request.body.Batch);
  console.log("Designation :" + request.body.Designation);
  console.log("Department :" + request.body.Department);
  console.log("CC Email :" + request.body.CCemail);
  console.log("Subject :" + request.body.Subject);
  console.log("Body :" + request.body.BodyText);
  console.log("Generate Logs :" + request.body.Generatelogs);
  async function fetchnodemail() {
 console.log("ppp");
    var connection = false;
    try {
      var tomail ='';
      connection = await oracledb.getConnection({
        user: "sys",
        password: "ariba",
        connectString: "localhost:1521/orcl",
        privilege: oracledb.SYSDBA
      });
      console.log('connected to database');
    } catch (err) {
      console.error(err.message);
    } finally {
      if (connection) {
        try {
          let query= `SELECT EMAIL FROM RECIPIENTS WHERE CATEGORY = '${request.body.Category}' AND (BATCH = '${request.body.Batch}' OR DESIGNATION = '${request.body.Designation}') AND DEPARTMENT = '${request.body.Department}' `;
          connection.execute(
            query,
            {
            },
            {
              autoCommit: true
            },
            function (err, results) {
              results.rows.forEach(async function (result) {
                tomail = tomail + "," + result;});
                if (request.body.Generatelogs == "Yes") {
                  console.log("Adding to Database Records");
                  const insertData = async (req, res) => {
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
                    } finally {
                      if (connection) {
                        try {
                          var emailss = request.body.Toemail + "," +tomail ;
                          console.log(emailss);
                          let query = `INSERT INTO NSMAIL (RID, CCEMAIL, SUBJECT, BODY, LOGS, TOEMAIL) VALUES (1,'${request.body.CCemail}', '${request.body.Subject}', '${request.body.BodyText}' , '${request.body.Generatelogs}', '${emailss}')`;
                          connection.execute(
                            query,
                            {
                            },
                            {
                              autoCommit: true
                            },
                            function (err, results) {
                              console.log(err);
                              console.log("results");
                              console.log(results)
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
                          console.error(err.message); 9
                        }
                      }
                    }
              
                  };
                  insertData();
                }
                else {
                  console.log("Not Added to Database Records");
                }
              

              if (err) {
                connection.release(function (err) {
                  if (err) {
                    console.error(err.message);
                  }
                });
              }
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
  }   
fetchnodemail();

  // if ./.data/sqlite.db does not exist, create it, otherwise print records to console

});


app.listen(config.port, () => console.log(`app is listening on url: ${config.url}`));
