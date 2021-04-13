require('dotenv').config();
const express = require('express');
const mysql = require('mysql')
const app = express();
const schedule= require('node-schedule');
let {PythonShell} = require('python-shell')

const jb = schedule.scheduleJob('00 * * * *', function(){
    let options = {
        mode: 'text',
        pythonOptions: ['-u'], // get print results in real-time
        scriptPath: 'C:/Users/JOEL/Documents/Automate/hedonism/src/'
      };  
    PythonShell.run('hello.py', options, function(err) {
        if(err) console.error(err);
        console.log('finished');
    });    
     
})
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization')
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS')
    res.setHeader('X-Frame-Options', 'sameorigin');
    next();
});
 

app.use('/api/youtube', (req, res) => {
    //res.json({ message: 'requête a bien été reçue !'});


    const db = mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });
    try {
        db.connect(function (err) {
            if (err) {
                console.log(err);
                return;
            }
            console.log("Connexion établie");
            let query="";
            if(req.query.channel){
                let channel = req.query.channel
                query="SELECT DISTINCT iframe, author, title, publishedAt FROM videosInfo WHERE author='"+channel+"' GROUP BY iframe ORDER BY publishedAt DESC"
            }
            else {
                query="SELECT DISTINCT iframe, author, title, publishedAt FROM videosInfo GROUP BY iframe ORDER BY publishedAt DESC"
            }
            db.query(query, function (err, result) {
                if (!err) {
                    res.json(result);
                    db.end(function (err) {
                        if (err) {
                            return console.log('error' + err.message)
                        }
                        console.log('Ended Connection')
                    })
                }
                else {
                    
                    console.log(err);
                }

            });

            //  res.json({message: 'Connexion établie' });

        })
    } catch (e) {
        console.log(e)
    }
});

app.use('/api/author', (req, res) => {
    //res.json({ message: 'requête a bien été reçue !'});

    if(req.query.channel){
        let channel = req.query.channel
        console.log(channel)
    }
    const db = mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });
    try {
        db.connect(function (err) {
            if (err) {
                console.log(err);
                return;
            }
            console.log("Connexion établie");

            db.query("SELECT DISTINCT author FROM videosInfo ORDER BY author ASC", function (err, result) {
                if (!err) {
                    res.json(result);
                    db.end(function (err) {
                        if (err) {
                            return console.log('error' + err.message)
                        }
                        console.log('Ended Connection')
                    })
                }
                else {
                    console.log(err);
                }

            });

            //  res.json({message: 'Connexion établie' });

        })
    } catch (e) {
        console.log(e)
    }
});



app.use((req, res) => {
    res.json({ message: 'Votre requête a bien été reçue !' });

});
module.exports = app;