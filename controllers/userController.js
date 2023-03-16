const User = require('./../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');


// user signUp
const userRegister = async (req, res) => {
    const { name, email, password, phone } = req.body;
    if (name && email && password && phone) {
        try {
            const userCheck = await User.find({ email: email });
            if (userCheck.length == 0) {
                const salt = bcrypt.genSaltSync(12);
                const hashedPassword = bcrypt.hashSync(password, salt);
                const newUser = await new User({
                    name, email, password: hashedPassword, phone
                });
                const saveUser = await newUser.save();
                res.status(200).json({
                    message: "user data sucessfully saved !",
                    saveUser,
                    signup: "signup"
                });
            } else {
                res.status(404).json({
                    message: "User is already exist !"
                });
            }

        } catch (error) {
            res.status(404).json({
                message: "something went wrong !"
            });
        }

    } else {
        res.status(404).json({
            message: "all fields are required to fill !"
        });
    }

}

// user login
const userLogin = async (req, res) => {
    const { email, password } = req.body;
    if (email && password) {
        try {
            const userCheck = await User.findOne({ email: email });
            if (userCheck) {
                const isPasswordCorrect = bcrypt.compareSync(password, userCheck.password);
                if (!isPasswordCorrect) {
                    return res.status(404).json({
                        errorMessage: "Invalid password, please enter the right one !"
                    });
                } else {
                    const generateUserToken = jwt.sign({ id: userCheck._id }, process.env.SECRET_kEY, { expiresIn: "35s" });
                    // token generated
                    console.log("generated token\n", generateUserToken);

                    if (req.cookies[`${userCheck._id}`]) {
                        req.cookies[`${userCheck._id}`] = ""
                    }
                    res.cookie(String(userCheck._id), generateUserToken, {
                        path: '/',
                        expires: new Date(Date.now() + 1000 * 30), // 30 sec
                        httpOnly: true,
                        sameSite: 'lax'
                    })

                    res.status(200).json({
                        message: "user successfully login !",
                        userCheck,
                        login: "login",
                        token: generateUserToken
                    });
                }
            } else {
                res.status(404).json({
                    message: "User is not exist please sign up !",
                });
            }
        } catch (error) {
            res.status(404).json({
                message: "something went wrong !",
            });
        }
    } else {
        res.status(404).json({
            message: "please fill the required fields !",
        });
    }
}

// verifyToken
const verifyToken = async (req, res, next) => {
    // const headers = req.headers['authorization'];
    // const token = headers.split(' ')[1];
    const cookies = req.headers.cookie;
    console.log("cookies :", cookies);
    const token = cookies?.split('=')[1];
    console.log("token :", token);
    if (!token) {
        return res.status(404).json({
            message: "No token found !"
        })
    }
    jwt.verify(String(token), process.env.SECRET_kEY, (err, user) => {
        if (err) {
            res.status(404).json({
                message: "Invalid token !"
            })
        }
        // res.json(user);
        console.log("user :", user);
        req.id = user.id;
    });
    next();
}

const getUser = async (req, res, next) => {
    const userId = req.id;
    console.log(userId)
    try {
        const userData = await User.findById(userId, "-password");
        if (userData) {
            return res.status(200).json(userData)
        } else {
            res.status(404).json({
                message: "User not found !"
            })
        }
    } catch (err) {
        throw new Error(err);
    }
}

const refreshToken = (req, res, next) => {
    const cookies = req.headers.cookie;
    console.log("cookies :", cookies);
    const prevToken = cookies?.split('=')[1];
    if (!prevToken) {
        return res.status(400).json({
            message: "could not find token !"
        })
    }
    jwt.verify(String(prevToken), process.env.SECRET_kEY, (err, user) => {
        if (err) {
            res.status(404).json({
                message: "Authentication failed !"
            })
        }
        res.clearCookie(`${user.id}`);
        req.cookies[`${user.id}`] = "";

        const token = jwt.sign({ id: user.id }, process.env.SECRET_kEY, {
            expiresIn: "35s"
        })

        // Regenerated Token
        console.log("Regenerated token\n", token);

        res.cookie(String(user.id), token, {
            path: '/',
            expires: new Date(Date.now() + 1000 * 30), // 30 sec
            httpOnly: true,
            sameSite: 'lax'
        })

        req.id = user.id;

    })
    next()
}

// logout >>
const userLogout = (req, res) => {
    const cookies = req.headers.cookie;
    const prevToken = cookies?.split('=')[1];
    if (!prevToken) {
        return res.status(400).json({
            message: "could not find token !"
        })
    }

    jwt.verify(String(prevToken), process.env.SECRET_kEY, (err, user) => {
        if (err) {
            res.status(404).json({
                message: "Authentication failed !"
            })
        }
        res.clearCookie(`${user.id}`);
        req.cookies[`${user.id}`] = "";
        return res.status(200).json({
            message: "successfully LogOut"
        });

    })

}

// get all users
const getAllRegisterdUser = async (req, res) => {
    try {
        const allUsers = await User.find();
        if(allUsers){
            return res.status(200).json(allUsers);
        }
        res.status(200).json({
            message: "users data is not avaliable !"
        })
    } catch (error) {
        res.status(404).json(err);
    }

}
module.exports = {
    userRegister,
    userLogin,
    verifyToken,
    getUser,
    refreshToken,
    userLogout,
    getAllRegisterdUser 
}