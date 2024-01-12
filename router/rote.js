import { Router } from "express";
const router = Router();

/** POST Methods */
router.route('/register').post((req,res)=> res.json("Register User")); // register user
router.route('/registerMail').post((req,res)=> res.json("Register Mail")); // send the email
router.route('/authenticate').post((req,res)=> res.json("Authenticate User")); // authenticate user
router.route('/login').post((req,res)=> res.json("Login User")); // login in app

/** GET Methods */
router.route('/user/:username').get((req,res)=> res.json("Get user with username")) // user with username
router.route('/generateOTP').get((req,res)=> res.json("Generate Random OTP")) // generate random OTP
router.route('/verifyOTP').get((req,res)=> res.json("Verify OTP")) // verify generated OTP
router.route('/createResetSession').get((req,res)=> res.json("Reset all the variables")) // reset all the variables


/** PUT Methods */
router.route('/updateuser').put((req,res)=> res.json("Update the user profile")); // is use to update the user profile
router.route('/resetPassword').put((req,res)=> res.json("Reset Password")); // use to reset password



export default router;