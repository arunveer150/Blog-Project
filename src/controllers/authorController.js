const AuthorModel = require("../models/authorModel")
const emailValidation=require("email-validator")
const jwt = require("jsonwebtoken")


const createAuthor = async function (req, res) {
    try {
        let data = req.body
        let check = data.fname

    if(!check){return   res.status(400).send({status : false , msg : "Please enter your First Name"})}
    
    let check1 = data.lname
    if(!check1){return res.status(400).send({status : false , msg : "Please enter your Last Name"})}
    

    let check2 = data.title
    if(!check2)
      {return  res.status(400).send({status : false , msg : "Please enter your Title"})}
    

    let check3 = ["Mr","Mrs","Miss"]
      let checkEnum = await check3.find(element => element==check2)
        if(!checkEnum)
        {return  res.status(400).send({status: false, msg : "Enter your Title from this Only [Mr, Mrs,Miss]"})}
        
    

        let checkEmail = data.email
        if(!checkEmail) {return res.status(400).send({status : false , msg : "Please enter your Email"})}

    let validateEmail= emailValidation.validate(checkEmail)


if(validateEmail==false)
 {return res.send({msg: "Please enter a valid email"})}

let checkDuplicateEmail=await AuthorModel.findOne({email:checkEmail})
if(checkDuplicateEmail) return res.status(400).send({status:false , msg: "email id already exists please enter the new email id" })


    let checkPassword = data.password
    if(!checkPassword)
     {return res.status(400).send({status : false , msg : "Please enter your Password"})}
         
            let savedData = await AuthorModel.create(data)
            res.status(201).send({ msg: savedData })
        
         
    }
    catch (err) {
        console.log("This is the error :", err.message)
        res.status(500).send({ msg: "Error", error: err.message })
    }
}


const loginUser = async function (req, res) {
   let userName = req.body.email;
   
   if(!userName){
    return res.status(400).send({status : false , msg : "Please enter your email"})
   }
    let password = req.body.password;

    if(!password){
      return res.status(400).send({status : false , msg : "Please enter your password"})
     }
  
    let user = await AuthorModel.findOne({ email: userName, password: password });
    if (!user)
      return res.send({
        status: false,
        msg: "username or the password is not corerct",
      });
      let token = jwt.sign(
        {
          userId: user._id.toString(),
          
        },
        "functionup-radon"
      );
      res.setHeader("x-api-key", token);
      res.status(201).send({ status: true, data: token });
      }
    



module.exports.createAuthor=createAuthor
module.exports.loginUser=loginUser