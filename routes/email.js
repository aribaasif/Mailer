var oracledb = require('oracledb');
var config = require(__dirname + '../../config.js');

module.exports = {
    getHomePage: (req, res) => {
        oracledb.getConnection(
            config.database,
            function (err, connection) {
                if (err) {
                    return next(err);
                }
                let query = "SELECT * FROM category"; // query database to get all the players
                
                connection.execute(
                    query, 
                    {},//no binds
                    {
                        outFormat: oracledb.OBJECT
                    },
                    function (err, results1) {
                        if (err) {
                            connection.release(function (err) {
                                if (err) {
                                    console.error(err.message);
                                }
                            }
                            );

                            res.redirect('/');
                        }
                        let categories = results1.rows;

                        oracledb.getConnection(
                            config.database,
                            function (err, connection) {
                                if (err) {
                                    return next(err);
                                }
                                let query = "SELECT * FROM database"; // query database to get all the players
                                connection.execute(
                                    query,
                                    {},//no binds
                                    {
                                        outFormat: oracledb.OBJECT
                                    },
                                    function (err, results1) {
                                        if (err) {
                                            connection.release(function (err) {
                                                if (err) {
                                                    console.error(err.message);
                                                }
                                            }
                                            );

                                            res.redirect('/');
                                        }

                                        var databases = results1.rows;
                                        oracledb.getConnection(
                                            config.database,
                                            function (err, connection) {
                                                if (err) {
                                                    return next(err);
                                                }
                                                let query = "SELECT * FROM designation"; // query database to get all the players
                                                connection.execute(
                                                    query,
                                                    {},//no binds
                                                    {
                                                        outFormat: oracledb.OBJECT
                                                    },
                                                    function (err, results4) {
                                                        if (err) {
                                                            connection.release(function (err) {
                                                                if (err) {
                                                                    console.error(err.message);
                                                                }
                                                            }
                                                            );

                                                            res.redirect('/');
                                                        }

                                                        var designations = results4.rows;
                                                        oracledb.getConnection(
                                                            config.database,
                                                            function (err, connection) {
                                                                if (err) {
                                                                    return next(err);
                                                                }
                                                                let query = "SELECT * FROM batch"; // query database to get all the players
                                                                connection.execute(
                                                                    query,
                                                                    {},//no binds
                                                                    {
                                                                        outFormat: oracledb.OBJECT
                                                                    },
                                                                    function (err, results5) {
                                                                        if (err) {
                                                                            connection.release(function (err) {
                                                                                if (err) {
                                                                                    console.error(err.message);
                                                                                }
                                                                            }
                                                                            );

                                                                            res.redirect('/');
                                                                        }

                                                                        var batch = results5.rows;
                                                                        oracledb.getConnection(
                                                                            config.database,
                                                                            function (err, connection) {
                                                                                if (err) {
                                                                                    return next(err);
                                                                                }
                                                                                let query = "SELECT * FROM department"; // query database to get all the players
                                                                                connection.execute(
                                                                                    query,
                                                                                    {},//no binds
                                                                                    {
                                                                                        outFormat: oracledb.OBJECT
                                                                                    },
                                                                                    function (err, results3) {
                                                                                        if (err) {
                                                                                            connection.release(function (err) {
                                                                                                if (err) {
                                                                                                    console.error(err.message);
                                                                                                }
                                                                                            }
                                                                                            );

                                                                                            res.redirect('/');
                                                                                        }
                                                                                        var department = results3.rows;
                                                                                        res.render('email.ejs', {
                                                                                            title: "Welcome to Socka | View Players",
                                                                                            categories: categories
                                                                                            , databases: databases,
                                                                                            departments: department,
                                                                                            designations: designations,
                                                                                            batch: batch,
                                                                                        });
                                                                                    }
                                                                                );
                                                                            }
                                                                        );

                                                                        connection.release(function (err) {
                                                                            if (err) {
                                                                                console.error(err.message);
                                                                            }
                                                                        });
                                                                    }
                                                                );
                                                            }
                                                        );
                                                    }
                                                );
                                            }
                                        );
                                    }
                                );
                            });
                    })
            })
    }
}
