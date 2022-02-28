const mysql = require("mysql");
const jwt = require("jsonwebtoken");
const Crypt = require("cryptr");
const crypt = new Crypt('myTotalySecretKey');
// const dotenv = require("dotenv");

// dotenv.config({ path: "./.env"});

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PWD,
    database: process.env.DATABASE
});

exports.register = (req, res) => {
    console.log(req.body);

    // const name = req.body.name;
    // const email = req.body.email;
    // const password = req.body.password;
    // const passwordConfirm = req.body.passwordConfirm;
    //below line is the same as above
    const {name, email, password, passwordConfirm} = req.body;

    db.query('SELECT email FROM users WHERE email = ?', [email], (err, result) => {
        if(err) {
            console.log(err);
        }
        if(result.length > 0) {
            return res.render('register', {
                message: 'That email is already in use'
            });
        } else if(password !== passwordConfirm) {
            return res.render('register', {
                message: 'Passwords do not match'
            });
        }

        let hashedPassword = crypt.encrypt(password);
        console.log(hashedPassword);
        console.log("Decrypted email = ", crypt.decrypt(hashedPassword));
        db.query('INSERT INTO users SET ?', {name: name, email: email, password: hashedPassword, isAdmin: 0, mailing: 0}, (err, results) => {
            if(err) {
                console.log(err);
            } else {
                console.log(results);
                return res.render('register', {
                    message: 'user registered'
                });
            };
        })
    });
}

exports.login = (req, res) => {
    // const form = document.querySelector("form");
    // emailField = form.querySelector("#email");
    // pwdField = form.querySelector("#password");

    console.log(req.body);

    const {email, password} = req.body;

    db.query("SELECT * FROM users where email =?", [email], (err, result) => {
        if(err) {
            console.log(err);
        }
        if(result.length == 0) {
            return res.render('login', {
                message: 'That email is not registered'
            });
        }
        console.log(result);
        let decryptPassword = crypt.decrypt(result[0].password)
        console.log(decryptPassword);
        if(password === decryptPassword) {
            return res.render('welcome', {name: result[0].name, isAdmin:result[0].isAdmin});
        } else {
            return res.render('login', {
                message: 'Invalid Password entered'
            });
        }
    });
}

exports.forgot = (req, res) => {
    console.log(req.body);
    const {email, password, password2} = req.body;

    db.query("SELECT * FROM users where email =?", [email], (err, result) => {
        if(err) {
            console.log(err);
        }
        if(result.length == 0) {
            return res.render('login', {
                message: 'That email is not registered'
            });
        }
        console.log(result);

        if(password === password2){
            let hashedPassword = crypt.encrypt(password);
            console.log(result[0].id);
            console.log(result[0].name);
            console.log(email);
            console.log(password);
            console.log(hashedPassword);
            db.query("UPDATE users SET id=?, name=?, email=?, password=? WHERE id=?",
                [result[0].id,result[0].name,email,hashedPassword,result[0].id], (error, results) => {
                    console.log("results:",results)
                    if(error) {
                        console.log(err);
                    }
                    if(results.length !== 0){
                        return res.render('login', {
                            message: 'User has been updated, please go to Login page'
                        });
                    }
                })
        } else {
            return res.render('forgot', {
                message: 'Password are not identical'
            });
        }
    });
}

exports.list = (req, res) => {
    db.query("SELECT * FROM users", (err, results) => {
        if(err) {
            console.log(err);
        }
        if(results.length == 0) {
            return res.render('admin', {
                message: 'table users is empty'
            });
        }
        console.log(results);
        var table = [];
        for(i=0;i<results.length;i++){
            var decryptPassword = crypt.decrypt(results[i].password)
            var myUser={};
            results[i].password=decryptPassword;
            myUser.id=results[i].id;
            myUser.name=results[i].name;
            myUser.email=results[i].email;
            myUser.password=decryptPassword
            myUser.isAdmin=results[i].isAdmin;
            myUser.mailing=results[i].mailing;
            table[i]=myUser;
        }
        console.log(table);
        return res.render('admin', {member: table});
    });
}

exports.delete = (req, res) => {
    console.log("Delete user:",req.body);
    const {email, password} = req.body;
    db.query("DELETE FROM users WHERE email=?",[email], (err, result) => {
        if(err) {
            console.log(err);
        }
        if(result.length == 0) {
            return res.render('admin', {
                message: 'User not found for deletion'
            });
        }
        
        db.query("SELECT * FROM users", (err, results) => {
            if(err) {
                console.log(err);
            }
            if(results.length == 0) {
                return res.render('admin', {
                    message: 'table users is empty'
                });
            }
            console.log(results);
            var table = [];
            for(i=0;i<results.length;i++){
                var decryptPassword = crypt.decrypt(results[i].password)
                var myUser={};
                results[i].password=decryptPassword;
                myUser.id=results[i].id;
                myUser.name=results[i].name;
                myUser.email=results[i].email;
                myUser.password=decryptPassword
                myUser.isAdmin=results[i].isAdmin;
                myUser.mailing=results[i].mailing;
                table[i]=myUser;
            }
            console.log(table);
            return res.render('admin', {member: table});
        });
    })
}
