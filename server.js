let express = require('express');
let bodyParser = require('body-parser');
let pg = require('pg');
let cors = require('cors');
const nodemailer = require('nodemailer');
require('dotenv').config();

const altPORT =3001;
const lin= process.env.elin;
const uid=process.env.euid;

// setting up the pg connection will put into env file for keys
let pool = new pg.Pool({
    port: process.env.eport, //var is eport
    password: process.env.dbp,
    database: process.env.db,
    user: process.env.dbu,
    host: process.env.dbh
});

let app = express();

// allowing cors so the front end can talk to the api
app.use(cors());
app.use(function(request,response,next){
    response.header("Access-Control-Allow_origin", "*");
    response.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

// parses the json file
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));

// API for get command for search will need to incorporate the search criteria
// app.get('/api/search/:cNumber', function(request, response){ //works
app.get('/api/search/:cNumber/:cId/:cDos/:cBilled', function(request, response){
    var claimNumber = request.params.cNumber;
    var taxid = request.params.cId;
    var dos = request.params.cDos;
    var billed = request.params.cBilled;
    console.log(claimNumber);
    pool.connect(function(err, db, done){
        if(err){
            return response.status(400).send(err);
        }else{
            done();
            db.query('SELECT * FROM eors.eor WHERE "claimNumber"=$1 and "taxId"=$2 and "dos"=$3 and "billedAmt"=$4', [claimNumber, taxid, dos, billed] , function(err, table){
                if(err){
                    return response.status(400).send(err);
                    console.log(err)
                }else if(err){
                    return response.status(404).send(table.rows);
                    console.log(err);
                }else{
                    return response.status(200).send(table.rows);
                    console.log(table.row)
                }
            })
        }
    })
})

app.post('/api/request', (req, res) =>{
    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth:{
            user:`${uid}`,
            pass:`${lin}`
        }
    });

    const mailOptions = {
        from: `${uid}`,
        to: `${uid}`,
        subject: `EOB Request.`,
        html:
            `Requestor: ${req.body.rName}
            <br/>
            Request: ${req.body.rBody}`
    };

    transporter.sendMail(mailOptions, function (err, info) {
        if(err)
            console.log(err)
        else {
            console.log('email log', info)
        }
    });
});




app.listen(process.env.PORT || altPORT, () => console.log('listening on port ' + PORT))