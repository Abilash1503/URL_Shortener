const express = require("express")
const path = require("path")
const app = express()
// const hbs = require("hbs")
const mongoose=require("mongoose")
const userDetails = require("./mongodb")
const port = process.env.PORT || 5000
app.use(express.json())

app.use(express.urlencoded({ extended: false }))

const tempelatePath = path.join(__dirname, '../template')
const publicPath = path.join(__dirname, '../public')
console.log(publicPath);

app.set('view engine', 'ejs')
app.set('views', tempelatePath)
app.use(express.static(publicPath))


// hbs.registerPartials(partialPath)


app.get('/signup', (req, res) => {
    res.render('signup')
})
app.get('/', (req, res) => {
    res.render('login')
})
app.get('/fp', (req, res) => {
    res.render('fp')
})
// app.get('/logout', (req, res) => {
//     res.redirect('login')
// })
app.post('/logout', (req, res) => {
    res.redirect('login')
})

app.post('/signup', function(req,res){

    let signup = new userDetails({
        
        name : req.body.name,
        password : req.body.password,
        mail : req.body.mail,
        phone : req.body.phone
    })
    signup.save().then(function(savedData){
        console.log(savedData);
    }).catch(function(err){
        console.log(err)
    })
})
app.post('/login', function(req, res) {
   
    var mail = req.body.mail;
    var password = req.body.password;
 
    var data;
    if (mail != null && password != null) {
        data = {
            mail: mail,
            password: password
        };
    }
    else {
        res.json({
            status: 0,
            message: err
        });
    }
    userDetails.findOne(data, function(err, user) {
        if (err) {
            res.json({
                status: 0,
                message: err
            });
        }
        if (!user) {
            res.json({
                status: 0,
                msg: "not found"
            });
        }
        // res.json({
        //     status: 1,
        //     id: user._id,
        //     message: " success"
            
        // });
        res.redirect('/home')
    })
});
app.post('/updated', function(req, res) {
   
    var mail = req.body.mail;
    var pass = req.body.password;
    var cpass = req.body.cpassword;
 
    var data;
    if (mail != null) {
        data = {
            mail: mail,
           
        };
    }
    else {
        res.json({
            status: 0,
            message: err
        });
    }
    userDetails.findOneAndUpdate(data,{$set: {password: cpass}},{new: true}, function(err, user) {
        if (err) {
            res.json({
                status: 0,
                message: err
            });
        }
        if (!user) {
            res.json({
                status: 0,
                msg: "not found"
            });
        }
        // res.json({
        //     status: 1,
        //     id: user._id,
        //     message: " success"
            
        // });
        res.redirect("/");
     
        

    })
});



const urlschema =
mongoose.Schema({
    clickcount : {
        type : Number,
        default : 0
    },
    longurl : {
        type : String
    },
    shorturl : {
        type : String
    }
    
})


const urlmodel = mongoose.model('urlShortener',urlschema);

module.exports= {urlmodel};

app.get('/home',function(req,res){
    let allurls = urlmodel.find().then((allurlsData) => {
        res.render('home', {
            allurlsData
        });
    }).catch(function(err){
        console.log(err);
    })
});

app.get('/:shortid',function(req,res){
   
    urlmodel.findOne({shorturl : req.params.shortid}).then(function(data){
        urlmodel.findByIdAndUpdate({_id: data.id},{$inc : {clickcount : 1}})
 
        .then(function(updateData){
            res.redirect(data.longurl);
            
        }).catch(function(err){
            console.log(err)
        })
        res.redirect(data.longurl);
    }).catch(function(err){
        console.log(err);
    })
})

app.get('/delete/:id',function(req,res){
  
        urlmodel.findByIdAndRemove({_id: req.params.id}).then(function(data){
            res.redirect('/home');
            
        }).catch(function(err){
            console.log(err)
        })
    })
app.post('/createurl',function(req,res){
    let Randomlink = Math.floor(Math.random()*10000)
    let newurlshort = new urlmodel({
        longurl : req.body.longurl,
        shorturl:Randomlink

    })
    newurlshort.save().then(function(savedData){
        console.log(savedData);
    }).catch(function(err){
        console.log(err)
    })
})

//and if you have to create schema 

// var db_schema = new Schema({
//     email: {
//         type: String,
//         required: true,
//         unique: true
//     },
//     password: {
//         type: String,
//         required: true,
//         unique: true
//     },
// });
// // define this in your db.js
// var login_db = mongoose.model('your_db_name', db_schema);
// return function(req, res, next) {
//     req.app = login_db;
//     next();
// };

// app.post('/login', async (req, res) => {

//     try {
//         const check = await userDetails.findOne({ mail: req.body.mail })

//         if (check.password === req.body.password) {
//             res.status(201).render("home", { naming: `${req.body.password}+${req.body.name}` })
//         }

//         else {
//             res.send("incorrect password")
//         }


//     } 
    
//     catch (e) {

//         res.send("wrong details")
        

//     }


// })



app.listen(port, () => {
    console.log('port connected');
})