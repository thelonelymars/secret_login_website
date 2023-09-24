//jshint esversion:6
import dotenv from 'dotenv'
dotenv.config()
import express from 'express'
import bodyParser from 'body-parser'
import ejs from 'ejs'
import mongoose from 'mongoose';
import validator from 'validator';
import encrypt from 'mongoose-encryption';
import crypto from 'crypto'

const app=express();
app.use(express.static('public'))
app.set('view engine','ejs');
app.use(bodyParser.urlencoded({
    extended:true
}));
const mongoDBUrl = process.env.DATABASE_URL;
mongoose.connect(mongoDBUrl, { useNewUrlParser: true, useUnifiedTopology: true });

const db = mongoose.connection;

const Schema =  mongoose.Schema;
const userSchema = new Schema({
  email: {
    type: String, required: true 
},
    password:{type: String, required:true
 } 
});





userSchema.plugin(encrypt, {
  secret: process.env.SECRET_KEY,
  encryptedFields: ['password'],
});
const User = mongoose.model('user', userSchema);



db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});
app.get('/',(req,res)=>{
    res.render('home.ejs')
})
app.get('/login',(req,res)=>{
    res.render('login.ejs')
})
app.get('/register',(req,res)=>{
    res.render('register.ejs')
})
app.post('/register', async (req, res) => {
  try {
    const newUser = {
      email: req.body['username'],
      password: req.body['password']
    };
    if (validator.isEmail(newUser.email)) {
      const newUser_data = new User(newUser);
      await newUser_data.save();
      console.log('User registered successfully');
      res.render('secrets.ejs');
    } else {
      console.log('Invalid email address');
      // You should handle this case with a response to the user
    }
  } catch (error) {
    console.error('Error while registering user:', error);
    // Handle errors here and send an appropriate response
    res.status(500).send('An error occurred during registration');
  }
});

app.post('/login', async (req, res) => {
  try {
    const Useremail = req.body['username'];
    const doc1 = await User.findOne({ email: Useremail});
    const doc = await User.findOne({ email: Useremail, password: doc1['passwword'] });

    
    if (!doc) {
      console.log('User does not exist');
      // Handle this case with a response to the user
    } else {
      res.render('secrets.ejs');
    }
  } catch (error) {
    console.error('Error while logging in:', error);
    // Handle errors here and send an appropriate response
    res.status(500).send('An error occurred during login');
  }
});
  

app.listen(process.env.PORT,()=>{
    console.log("server started on port 3000")
})