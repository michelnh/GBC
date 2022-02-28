const express = require("express");
const path = require("path");
const mysql = require("mysql");
const dotenv = require("dotenv");

dotenv.config({ path: "./.env"});

const app = express();

// DB connection creation
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PWD,
    database: process.env.DATABASE
});

const publicDirectory = path.join(__dirname, './public');
app.use(express.static(publicDirectory));

//grab data from forms
app.use(express.urlencoded({ extended: false}));
//grab dat as a JSON format
app.use(express.json());

app.set('view engine', 'hbs');

//db connection
db.connect( (err) => {
    if(err) {
        console.log(err);
    } else {
        console.log("MySql Connected...")
    }
})

app.use('/', require("./routes/pages"));
app.use('/auth', require('./routes/auth'));

app.listen(process.env.PORT, () => {
    console.log("server started on port "+process.env.PORT);
})