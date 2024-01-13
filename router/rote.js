import { Router } from "express";
import * as controller from '../controllers/appController.js';
import UserController from "../controllers/appController.js";
import Auth, {localVariables} from "../middleware/auth.js";

const router = Router();


/** POST Methods */
router.route('/register').post(UserController.register); // register user
router.route('/registerMail').post((req,res)=> res.json("Register Mail")); // send the email
router.route('/authenticate').post((req,res)=> res.json("Authenticate User")); // authenticate user
router.route('/login').post(controller.verifyUser,UserController.login); // login in app

/** GET Methods */
router.route('/user/:username').get(UserController.getUser) // user with username
router.route('/generateOTP').get(controller.verifyUser,localVariables, UserController.generateOTP) // generate random OTP
router.route('/verifyOTP').get(UserController.verifyOTP) // verify generated OTP
router.route('/createResetSession').get(UserController.createResetSession) // reset all the variables


/** PUT Methods */
router.route('/updateuser').put(Auth,UserController.updateUser); // is use to update the user profile
router.route('/resetPassword').put(controller.verifyUser,UserController.resetPassword); // use to reset password



export default router;