require('dotenv').config();
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
var fetchuser= require('../middleware/fetchuser');

const JWT_SECRET = process.env.JWT_SECRET;


// ROUTE 1: Create a User using: POST "/api/auth/createuser". No login required

router.post('/createuser', [
    body('name', 'Enter a valid name').isLength({ min: 3 }),
    body('email', 'Enter a valid email').isEmail(),
    body('password', 'Password must be atleast 5 characters').isLength({ min: 5 }),
], async (req, res) => {
    let success = false;
    //If there are errors,return Bad request and the errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({success, errors: errors.array() });
    }
    //Check whether the user with this email exists already
    try {
        let user = await User.findOne({ email: req.body.email });

        if (user) {
            return res.status(400).json({ success,error: "Sorry a user with this email already exists" })
        }
        const salt = await bcrypt.genSalt(10);
        const secPass = await bcrypt.hash(req.body.password,salt);

        //Create a new user
        user = await User.create({
            name: req.body.name,
            email: req.body.email,
            password: secPass,
        })
        const data = {
            user:{
                id: user.id
            }
        }
        const authtoken = jwt.sign(data, JWT_SECRET, { expiresIn: "240hr"});
      

        // res.json({ user })
        success = true;
        res.json({success,authtoken})
        // Catch errors
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal server error");
    }
})

// ROUTE 2: Authenticate a User using: POST "/api/auth/login". No login required

router.post('/login', [
   
    body('email', 'Enter a valid email').isEmail(),
    body('password','Password cannot be blank').exists(),
   
], async (req, res) => {
    // console.log("I was here");
    //If there are errors,return Bad request and the errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const {email,password} = req.body;
    try {
        let user = await User.findOne({email});
        if(!user){
            return res.status(400).json({error: "please try to login with correct credentials"});
        }

        const passwordCompare =  await bcrypt.compare(password,user.password);
        if(!passwordCompare){
            return res.status(400).json({error: "please try to login with correct credentials"});
        }

        const data = {
            user:{
                id: user.id
            }
        }
        const authtoken = jwt.sign(data, JWT_SECRET);
        res.json({authtoken})
      
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal server error");
    }
})

//ROUTE 3: Get loggedin User Details using: POST "/api/auth/getuser". Login required
router.post('/getuser', fetchuser,async (req,res) => { 
    
try {
    const userId = req.user.id;
    const user = await User.findById(userId).select("-password")
    res.send(user)
} catch (error) {
    console.error(error.message);
    res.status(500).send("Internal server error");
}
})
module.exports = router