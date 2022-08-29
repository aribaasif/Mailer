
const oracledb = require('oracledb');
module.exports = {
    database: {
        user: "sys",
        password: "ariba",
        connectString: "localhost:1521/orcl",
        privilege: oracledb.SYSDBA
    },

    jwtSecretKey: "jmvhDdDBMvqb=M@6h&QVA7x"
};

