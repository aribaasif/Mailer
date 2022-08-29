const oracledb = require('oracledb');
module.exports = {
    getCategories: async (req, res) =>  {
        var connection = false
        
        console.log("RESULT") 
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
    
          console.log(result)
        
          // Always close connections
                await connection.close(); 
                console.log('close connection success');
                res.render('index.ejs', {
                    title: "Ariba testing",
                    categories: result,
                    async:true
                    
                });
              } catch (err) {
                console.error(err.message);
                
                res.redirect('/');
              }
            }
          }
    },



    getDatabase: async (req, res) =>  {
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
                  title: "Ariba testing",
                  databases: result,
                  async:true
                  
              });
            } catch (err) {
              console.error(err.message);
              
              res.redirect('/');
            }
          }
        }

        

  },
};