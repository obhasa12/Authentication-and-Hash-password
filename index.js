const express = require('express');
const app = express();
const mongoose = require('mongoose');
const User = require('./models/user');
const path = require('path');
const bcrypt = require('bcrypt');
const session = require('express-session');

mongoose.connect('mongodb://127.0.0.1:27017/authDemo');

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({extended: true}));
app.use(session({secret: 'notagoodsecret'}));

const requireLogin = (req, res , next) => {
    if(!req.session.user_id){
        return res.redirect('/login');
    }
    next();
};

app.get('/', (req, res) => {
    res.send("THIS IS THE HOMEPAGE!");
});

app.get('/register', (req, res) => {
    res.render('register');
});

app.post('/register', async (req, res) => {
    const { username, password } = req.body;
    const user = new User({ username, password });
    await user.save();
    req.session.user_id = user._id;
    res.redirect('/');
});

app.get('/login', (req, res) => {
    res.render('login');
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const foundUser = await User.findAndValidate( username, password );
    if(foundUser){
        req.session.user_id = foundUser._id;
        res.redirect('/secret');
    }else{
        res.redirect('/login');
    };
});

app.post('/logout', (req, res) => {
    // req.session.user_id = null;
    req.session.destroy();
    res.redirect('/login');
});

app.get('/secret', requireLogin, (req, res) => {
    res.render('secret');
});

app.get('/topsecret', requireLogin, (req, res) => {
    res.send("TOP SECRET!!");
});

app.listen(3000, () => {
    console.log("OPEN IN PORT 3000");
});


