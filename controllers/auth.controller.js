const bcrypt = require("bcryptjs")
const User = require("../models/users.model")

exports.signup = async (req, res) => {
    const body = req.body
    const userStatus = body.userStatus;
    const userType = body.userType
    if(userType == "CUSTOMER"){
        userStatus = "APPROVED"
    } else {
        userStatus = "PENDING"
    }
    const userObj = {
        name: body.name,
        userId: body.userId,
        email: body.email,
        userType: userType,
        userStatus: userStatus,
        password: bcrypt.hashSync(body.password, 8)
    }

    try {
        const userResponse = await User.create(userObj)
        // Add data mappers / data scrubbers in future
        const responseObj = {
            name: userResponse.name,
            userId: userResponse.userId,
            email: userResponse.email,
            userType: userResponse.userType,
            userStatus: userResponse.userStatus,
            createdAt: userResponse.createdAt,
            updatedAt: userResponse.updatedAt
        }
        res.status(201).send(userResponse)
    } catch (error) {
        console.log(error.message);
        res.status(500).send({
            message: "Failure in signup"
        })
    }

}

exports.signin = async (req, res) => {
    // retrieve input from req object
    const body = req.body
    const userId = body.userId
    const password = body.password

    try {
        const user = await User.findOne({userId: userId})

        if(user == null){
            res.status(400),send({
                message: "User not found"
            })
        }

        if(user.userStatus !== "APPROVED"){
            res.status(200).send({
                message: "User is not authorized for login"
            })
        }

        let passwordIsValid = bcrypt.compareSync(
            body.password,
            user.password
        )

        if(!passwordIsValid){
            res.status(401).send({
                message: "Invalid Password"
            })
            return
        }

        let token = jwt.sign({ id: user.userId}, config.secret, {
            expiresIn: 86400 //24 hrs
        })

        res.status(200).send({
            name: user.name,
            userId: user.userId,
            email: user.email,
            userType: user.userType,
            userStatus: userStatus,
            accessToken: token
        })
        
    } catch (error) {
        console.log(error.message);
        res.status(500).send({
            message: "Failure in signin"
        })
    }
}