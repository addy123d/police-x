const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const User = require('./model/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const JWT_SECRET = 'shfdjsfhuer89489fije490ur9@@*@(*FHN#*RNF(#*#&RFN#HIHIUHFUIHdkhfskjdhfe48y843984*&*^&HIHKJ';
const session = require('express-session');

const url = require("./setup/config").url;



const port = process.env.PORT || 80;

//Express Setup ---------------------------------------------------------------------------------------------
const app = express();

// Database Connection !
mongoose.connect(url, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true
    })
    .then(() => {
        console.log("Database connected successfully !");
    })
    .catch((error) => {
        console.log("Problem connecting with database !");
    });


app.use('/public', express.static('public'));
let sess = {
    name: 'CHETAN',
    resave: false,
    saveUninitialized: true,
    secret: 'keyboard cat',
    cookie: {}
}

if (app.get('env') === 'production') {
    app.set('trust proxy', 1) // trust first proxy
    cookie.secure = true // serve secure cookies
}

app.use(session(sess));

// Form Data configuration

app.use(express.json());
app.use(express.urlencoded({
    extended: false
}));

//PUG Setup--------------------------------------------------------------------------------------------------
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));



//middleware for session

function redirectLogin(req, res, next) {

    console.log("Session : ", req.session);

    if (!req.session.ID) {
        res.redirect('/login');
    } else {
        next();
    }

}

function redirectHome(req, res, next) {

    console.log("Session : ", req.session);

    if (req.session.ID) {
        res.redirect('/dashboard');
    } else {
        next();
    }

}

//ENDPOINTS-------------------------------------------------------------------------------------------------
app.get('/', (req, res) => {
    res.status(200).render('home.pug');
})

app.get('/login', redirectHome, (req, res) => {
    res.status(200).render('login.pug');

})

// ------------------------------------------------------------------------------------------------------------




// ----------------------------------------- LOGIN ------------------------------------------------------------
app.post('/api/login', (req, res) => {

    console.log(req.body);

    const {
        email,
        password
    } = req.body



    User.findOne({
            email: email
        })
        .then(async (user) => {
            if (!user) {
                res.json({
                    "err": "email doesn't exists !"
                });
            } else {
                const status = await bcrypt.compare(password, user.key);

                if (status) {

                    // Create Session !
                    req.session.ID = user._id;
                    req.session.email = user.email;

                    console.log("Session :", req.session);

                    // Response 
                    res.redirect("/dashboard");

                } else {
                    res.json({
                        "passworderr": "Password not matched !"
                    })
                }
            }
        })
        .catch((error) => {
            console.log(error);
        });
    // const user = await User.findOne({
    //     email_address: loginEmail
    // }).lean();

    // console.log(user)

    // if (!user) {
    //     return res.json({
    //         status: 'error',
    //         data: 'Invalid Email ID / Password'
    //     });
    // }

    // if (await bcrypt.compare(loginPassword, user.key)) {

    //     const token = jwt.sign({
    //             _id: user._id,
    //             email_address: user.email_address,
    //         },
    //         JWT_SECRET
    //     )

    //     req.session.emailID = user.email_address;
    //     console.log(req.session);

    //     return res.json({
    //         status: 'ok',
    //         data: token
    //     });
    // }

    // res.json({status : 'error', data : 'Invalid Email ID / Password'});
})

// -------------------------------------------------------------------------------------------------------------





// ------------------------------------------SIGNUP -------------------------------------------------------------
app.post('/api/register', async (req, res) => {

    console.log(req.body);

    const {
        fName,
        lName,
        emailAdd,
        pass
    } = req.body

    const key = await bcrypt.hash(pass, 10);


    console.log("Plain text Password : ", pass);
    console.log("Email ID : ", emailAdd);

    User.findOne({
            email: emailAdd
        })
        .then((user) => {
            console.log(user);

            if (user) {
                res.json({
                    "emailerr": "User exists !"
                });
            } else {
                // Store data into database !

                const userObj = {
                    name: fName,
                    surname: lName,
                    email: emailAdd,
                    key: key
                }

                // Store this object into database !

                new User(userObj).save()
                    .then((user) => {
                        console.log("User registered !");

                        // Create Session !
                        req.session.ID = user._id;
                        req.session.email = user.email;

                        console.log("Session :", req.session);

                        // Response !
                        res.redirect("/dashboard");
                    })
                    .catch((error) => {
                        console.log('Something went wrong', error);
                    });
            }
        })
        .catch((error) => {
            console.log('Something went wrong', error);
        })

    // try {

    //     const response = await User.create({
    //         fName,
    //         lName,
    //         emailAdd,
    //         key
    //     })
    //     console.log('user created successfully', response);

    //     //Create session ----------------------
    //     req.session.emailID = email_address;
    //     console.log(req.session);

    //     // res.json({
    //     //     status: '1'
    //     // });
    //     res.redirect('/dashboard');

    // } catch (error) {

    //     console.log(`Data not stored : ${error}`);
    //     // if (error.code === 11000) {
    //     //     console.log(res.json({
    //     //         status: '0'
    //     //     }));
    //     //     console.log(JSON.stringify(error));
    //     // }
    //     // throw error;
    // }

})
// -------------------------------------------------------------------------------------------------------------






// ---------------------------------------------- DASHBOARD -----------------------------------------------------
app.get('/dashboard', redirectLogin, (req, res) => {
    res.status(200).render('dashboard.pug');
})




//Listen ---------------------------------------------------------------------------------------------------
app.listen(port, () => {
    console.log(`The app is running on the port : ${port}`);
})