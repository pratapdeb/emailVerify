const mongoose  = require('mongoose')
const userSchema = require('../models/user')
const User = mongoose.model('User', userSchema)
const tokenSchema = require('../models/token')
const Token = mongoose.model('Token', tokenSchema)

const crypto = require('crypto')
const nodemailer = require('nodemailer')

const confirmationPost = (req, res) => {

}

const resendTokenPost = (req, res) => {
    
}

const loginPost = (req,res, next) =>{
    req.assert('email', 'Email is not valis').isEmail()
    req.assert('email', 'Email cannot be blank').notEmpty()
    req.assert('password', 'Password cannot be blank').notEmpty()
    req.sanitize('email').normalizeEmail({remove_dots: false})

    //checking validation error
     var errors  = req.validationErrors()
     if(errors) return res.status(400).send(errors)

     User.findOne({email: req.body.email}, (err, user)=>{
         if(!user) return res.status(401).send({msg: 'Access Denied'})
         
         user.comparePassword(res.body.password, (err, isMatch)=>{
             if(!isMatch) return res.status(401).send({msg: 'Access Denied : invalid password'})
             //checking user verified
             if(!user.varified) return res.status(401).send({type: `not verified`,msg:"un verified account"})
             res.send({token: generateToken(user), user: user.toJSON()})
         })
     })
    

}

const signupPost = (req,res,next) =>{
    req.assert('name', 'Name cannot be blank').notEmpty()
    req.assert('email', 'Email cannot be blank').notEmpty()
    req.assert('Email', 'Email not valid').notValaid()
    req.assert('password', 'Password cannot be blank').notEmpty()
    req.sanitize('email').normalizeEmail({remove_dots: false})

    //check validation errors
    var errors = validationErrors()
    if(errors) return res.status(400).send(errors)

    //checking accout exists
    User.findOne({email: req.body.email}, (err, user)=>{
        if(user) res.status(400).send({msg: `Accoutn alerady exists`})

        //create user

        user = new User()
        user.name = req.body.name
        user.email =req.body.email
        user.password  = req.body.password
        user.save((err)=>{
            if(err) return res.status(500).send({msg: err})
            // save the varificatiohn token
            var token  = new Token()
            token.userId = user._id
            token.token = crypto.randomBytes(16).toString('hex')
            token.save((err)=>{
                if(err) return res.status(500).send({msg:err.message})

                //send the email
                var transporter = nodemailer.createTransport({
                    service: 'Sendgrid',
                    auth: {
                        user: process.env.SENDGRID_USERNAME,
                        user: process.env.SENDGRID_PASSWORD,
                    }
                })

                var mailOptions = {
                    from: '',
                    to: '',
                    subject: '',
                    text: ''
                }
                transporter.sendMail(mailOptions, (err)=>{
                    if(err) return res.status(500).send({msg: err.message})
                    res.status(200).send('A verification email has been sent')
                })
            })


        })
    })


}

const confirmationPost = (req,res, next) => {
    req.assert('name', 'Name cannot be blank').notEmpty()
    req.assert('email', 'Email cannot be blank').notEmpty()
    req.assert('Email', 'Email not valid').notValaid()
    req.assert('password', 'Password cannot be blank').notEmpty()
    req.sanitize('email').normalizeEmail({remove_dots: false})

        //check validation errors
        var errors = validationErrors()
        if(errors) return res.status(400).send(errors)

        //find a matching token
    Token.findOne({token: req.body.token}, (err, token)=>{
        if(!token) return res.status(400).send({type:'not verified', msg:'token not found'})
        
        // find a matching user
        User.findOne({_id: token._userId, email:req.body.email},(err, user)=>{
            if(!user) return res.status(400).send({msg: 'user not found'})
            if(user.isVerified) return res.status(400).send({type:'verified', msg: `User alreay verified`})

            //verify and save the user

            user.save((err)=>{
                if(err) return res.status(500).send({msg: err.message})
                res.status(200).send("Account verified please login")
            })
        })
    })
}
exports.resendTokenPost = function (req, res, next) {
    req.assert('email', 'Email is not valid').isEmail();
    req.assert('email', 'Email cannot be blank').notEmpty();
    req.sanitize('email').normalizeEmail({ remove_dots: false });
 
    // Check for validation errors    
    var errors = req.validationErrors();
    if (errors) return res.status(400).send(errors);
 
    User.findOne({ email: req.body.email }, function (err, user) {
        if (!user) return res.status(400).send({ msg: 'We were unable to find a user with that email.' });
        if (user.isVerified) return res.status(400).send({ msg: 'This account has already been verified. Please log in.' });
 
        // Create a verification token, save it, and send email
        var token = new Token({ _userId: user._id, token: crypto.randomBytes(16).toString('hex') });
 
        // Save the token
        token.save(function (err) {
            if (err) { return res.status(500).send({ msg: err.message }); }
 
            // Send the email
            var transporter = nodemailer.createTransport({ service: 'Sendgrid', auth: { user: process.env.SENDGRID_USERNAME, pass: process.env.SENDGRID_PASSWORD } });
            var mailOptions = { from: 'no-reply@codemoto.io', to: user.email, subject: 'Account Verification Token', text: 'Hello,\n\n' + 'Please verify your account by clicking the link: \nhttp:\/\/' + req.headers.host + '\/confirmation\/' + token.token + '.\n' };
            transporter.sendMail(mailOptions, function (err) {
                if (err) { return res.status(500).send({ msg: err.message }); }
                res.status(200).send('A verification email has been sent to ' + user.email + '.');
            });
        });
 
    });
};
module.exports = {

}