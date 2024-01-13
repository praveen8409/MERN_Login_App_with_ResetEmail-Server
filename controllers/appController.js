import UserModel from '../model/User.model.js'
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import otpGenerator from 'otp-generator';



/** middleware for verify user */
export async function verifyUser(req, res, next) {
    try {

        const { username } = req.method == "GET" ? req.query : req.body;

        // check the user existance
        let exist = await UserModel.findOne({ username });
        if (!exist) return res.status(404).send({ error: "Can't find User!" });
        next();

    } catch (error) {
        return res.status(404).send({ error: "Authentication Error" });
    }
}

/** POST: http://localhost:8080/api/register 
 * @param : {
  "username" : "example123",
  "password" : "admin123",
  "email": "example@gmail.com",
  "firstName" : "bill",
  "lastName": "william",
  "mobile": 8009860560,
  "address" : "Apt. 556, Kulas Light, Gwenborough",
  "profile": ""
}
*/
// export async function register(req, res) {
//     try {
//         const { username, password, profile, email } = req.body;        

//         // check the existing user
//         const existUsername = new Promise((resolve, reject) => {
//             UserModel.findOne({ username }, function(err, user){
//                 if(err) reject(new Error(err))
//                 if(user) reject({ error : "Please use unique username"});

//                 resolve();
//             })
//         });

//         // check for existing email
//         const existEmail = new Promise((resolve, reject) => {
//             UserModel.findOne({ email }, function(err, email){
//                 if(err) reject(new Error(err))
//                 if(email) reject({ error : "Please use unique Email"});

//                 resolve();
//             })
//         });


//         Promise.all([existUsername, existEmail])
//             .then(() => {
//                 if(password){
//                     bcrypt.hash(password, 10)
//                         .then( hashedPassword => {

//                             const user = new UserModel({
//                                 username,
//                                 password: hashedPassword,
//                                 profile: profile || '',
//                                 email
//                             });

//                             // return save result as a response
//                             user.save()
//                                 .then(result => res.status(201).send({ msg: "User Register Successfully"}))
//                                 .catch(error => res.status(500).send({error}))

//                         }).catch(error => {
//                             return res.status(500).send({
//                                 error : "Enable to hashed password"
//                             })
//                         })
//                 }
//             }).catch(error => {
//                 return res.status(500).send({ error })
//             })


//     } catch (error) {
//         return res.status(500).send(error);
//     }

// }

export default class UserController {
    static async register(req, res) {
        try {
            const { username, password, profile, email } = req.body;
            // check if user already exist

            const existingUser = await UserModel.findOne({ username });
            if (existingUser) {
                return res.status(400).send({ msg: "User already exist" });
            } else if (await UserModel.findOne({ email })) {
                return res.status(400).send({ msg: "Email already exist" });
            }
            // hash password
            const hashedPassword = await bcrypt.hash(password, 10);
            // create user
            const user = new UserModel({
                username,
                password: hashedPassword,
                profile,
                email
            });
            // save user

            // return save result as a response
            await user.save()
                .then(result => {
                    res.status(201).json({
                        message: "User created successfully",
                        userCreated: {
                            _id: result._id,
                            username: result.username,
                            email: result.email,
                            profile: result.profile
                        }
                    });
                })
        }
        catch (err) {

        }
    }

    static async getUser(req, res) {
        try {

            const { username } = req.params;
            if (!username) return res.status(501).send({ error: "Invalid Username" });
            const user = await UserModel.findOne({ username });
            if (!user) return res.status(501).send({ error: "Couldn't Find the User" });
            /** remove password from user */
            // mongoose return unnecessary data with object so convert it into json
            const { password, ...rest } = Object.assign({}, user.toJSON());

            return res.status(201).send(rest);


        } catch (error) {

        }
    }

    /** POST: http://localhost:8080/api/login 
 * @param: {
  "username" : "example123",
  "password" : "admin123"
}
*/
    static async login(req, res) {
        try {
            const { username, password } = req.body;
            const user = await UserModel.findOne({ username });
            if (!user) return res.status(501).send({ error: "Couldn't Find the User" });
            const passwordMatch = await bcrypt.compare(password, user.password);
            if (passwordMatch) {
                console.log(user.password)
                // create jwt token
                const token = jwt.sign({
                    userId: user._id,
                    username: user.username
                }, 'secret', { expiresIn: "24h" });

                return res.status(200).send({
                    msg: "Login Successful...!",
                    username: user.username,
                    token
                });
            } else {
                return res.status(404).send({ error: "Password Invalid" });

            }
        } catch (error) {

        }
    }

    /** PUT: http://localhost:8080/api/updateuser 
 * @param: {
  "header" : "<token>"
}
body: {
    firstName: '',
    address : '',
    profile : ''
}
*/
    static async updateUser(req, res) {
        try {

            const { userId } = req.user;
            console.log(userId);

            if (userId) {
                const body = req.body;
                console.log(body);
                // Update the data and wait for the operation to complete
                const result = await UserModel.findByIdAndUpdate(userId, body, { new: true });


                // Check if the update was successful
                if (result) {
                    return res.status(200).send({ msg: "Record Updated...!" });
                } else {
                    return res.status(404).send({ error: "User Not Found or No Changes Made...!" });
                }
            } else {
                return res.status(400).send({ error: "Invalid Request: User ID is required...!" });
            }
        } catch (error) {
            return res.status(500).send({ error: error.message || "Internal Server Error" });
        }
    }
/** GET: http://localhost:8080/api/generateOTP */
    static async generateOTP(req, res) {
        try {
            req.app.locals.OTP = await otpGenerator.generate(6, { lowerCaseAlphabets: false, upperCaseAlphabets: false, specialChars: false })
            res.status(201).send({ code: req.app.locals.OTP })
        } catch (error) {

        }
    }
/** GET: http://localhost:8080/api/verifyOTP */
    static async verifyOTP(req, res) {
        try {
            const { code } = req.query;
            if (parseInt(req.app.locals.OTP) === parseInt(code)) {
                req.app.locals.OTP = null; // reset the OTP value
                req.app.locals.resetSession = true; // start session for reset password
                return res.status(201).send({ msg: 'Verify Successsfully!' })
            }
            return res.status(400).send({ error: "Invalid OTP" });
        } catch (error) {

        }
    }

    // successfully redirect user when OTP is valid
/** GET: http://localhost:8080/api/createResetSession */
    static async createResetSession(req, res) {
        try {
            if (req.app.locals.resetSession) {
                return res.status(201).send({ flag: req.app.locals.resetSession })
            }
            return res.status(440).send({ error: "Session expired!" })
        } catch (error) {

        }
    }

    // update the password when we have valid session
/** PUT: http://localhost:8080/api/resetPassword */
    static async resetPassword(req, res) {
        try {
            if (!req.app.locals.resetSession) {
                return res.status(440).send({ error: "Session expired!" });
            }

            const { username, password } = req.body;

            try {
                const user = await UserModel.findOne({ username });

                if (!user) {
                    return res.status(404).send({ error: "Username not found" });
                }

                const hashedPassword = await bcrypt.hash(password, 10);

                // Update using the updateOne method and await the result
                // Use findOneAndUpdate to update based on the username
                const updatedUser = await UserModel.findOneAndUpdate(
                    { username: user.username },
                    { password: hashedPassword },
                    { new: true }

                );
                console.log(updatedUser);
                // Check if the update was successful\\
                if (updatedUser) {
                    req.app.locals.resetSession = false; // reset session
                    return res.status(201).send({ msg: "Record Updated...!" });
                } else {
                    return res.status(500).send({ error: "Unable to update password" });
                }
            } catch (error) {
                return res.status(500).send({ error: "Unable to find user" });
            }
        } catch (error) {
            return res.status(401).send({ error });
        }
    }
}



