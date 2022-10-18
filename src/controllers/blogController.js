const mongoose = require('mongoose')
const author = require('../models/authorModel.js')
const blog = require('../models/blogModel.js')

var nameRegex=/^[A-Za-z]+$/

let createBlog = async function (req, res) {
    try {
        let data = req.body

        if(Object.keys(data).length===0){
            return res.status(400).send({status:false,message:"Please enters details in the body...."})
        }

        let obj={}

        let checkTitle = data.title
    if(!checkTitle)
    {return res.status(400).send({status : false , msg : "Please enter your Title"})}

    obj.title=checkTitle
    

    let checkBody = data.body
    if(!checkBody)
    {return res.status(400).send({status : false , msg : "Please enter Body"})}

    obj.body=checkBody
    

    let checkAuthorId = data.authorId
    if(!checkAuthorId)
    {return res.status(400).send({status : false , msg : "Please enter authorId"})}

    if(!mongoose.isValidObjectId(checkAuthorId)){
        return res.status(400).send({status:false,message:"AuthorId is invalid...."})
    }
    
     let checkAuthor = await author.findById(checkAuthorId)
     if(!checkAuthor)
    { return res.status(404).send({status : false, msg : "Author does not exist"})}

    if(req.user.userId!=data.authorId){
        return res.status(400).send({status:false,message:"Authorisation failed..."})
    }

    obj.authorId=checkAuthorId

     let checkCategory = data.category
    if(!checkCategory)
    {return res.status(400).send({status : false , msg : "Please enter category"})}
    
    obj.category=checkCategory

    if(data.tags){
        if(data.tags.length==0){
            return res.status(400).send({status:false,message:"tags are empty....."})
        }

        obj.tags=data.tags
    }

    if(data.subcategory){
        if(data.subcategory.length===0){
            return res.status(400).send({status:false,message:"sub categorys are empty....."})
        }

        obj.subcategory=data.subcategory

    }

    if(data.isDeleted){
        if(data.isDeleted.length===0){
            return res.status(400).send({status:false,message:"isDeleted field is empty....."})
        }

        if(typeof data.isDeleted!="boolean"){
            return res.status(400).send({status:false,message:"isDeleted should be in boolean form  true/false ...."})
        }

        obj.isDeleted=data.isDeleted
    }

    if(data.isPublished){
        if(data.isPublished.length===0){
            return res.status(400).send({status:false,message:"isPublished field is empty....."})
        }

        if(typeof data.isPublished!="boolean"){
            return res.status(400).send({status:false,message:"isPublished should be in boolean form  true/false ...."})
        }

        obj.isPublished=data.isPublished
    }

        let create = await blog.create(obj)
        return res.status(201).send({ status: true, data: create })

    }
    catch (err) {
        return res.status(500).send({ status:false,error: err.message })
    }
}

let filterBlogs = async function (req, res) {
    try {
        let data = req.query

        let obj={isDeleted:false,isPublished:true}

        if(data.authorId){
            if(data.authorId.length===0){
                return res.status(400).send({status:false,message:"AuthorId field is empty..."})
            }

            if(!mongoose.isValidObjectId(data.authorId)){
                return res.status(400).send({status:false,message:"Invalid authorId"})
            }

            let checkAuthor = await author.findById(data.authorId)
             if(!checkAuthor){ return res.status(404).send({status : false, msg : "Author does not exist"})}

             obj.authorId=data.authorId
        }

        if(data.category){
            if(data.category.length===0){
                return res.status(400).send({status:false,message:"Category field is empty..."})
            }

            obj.category=data.category
        }

        if(data.tags){
            if(data.tags.length===0){
                return res.status(400).send({status:false,message:"tags field is empty..."})
            }

            let tag=data.tags.split(',')
            obj.tags={$in:tag}

        }

        if(data.subcategory){
            if(data.subcategory.length==0){
                return res.status(400).send({status:false,message:"subcategory field is empty..."})
            }
            let sub=data.subcategory.split(',')
            obj.subcategory={$in:sub}
        }

        let filter=await blog.find(obj)

        return res.status(200).send({status:true,data:filter})

    }
    catch (err) {
       return res.status(500).send({ status:false,error: err.message })
    }
}

let updateBlog = async function (req, res) {
    try {
        let blogId = req.params.blogId
        let bodyData = req.body
        
        let obj={}

        if(!mongoose.isValidObjectId(blogId)){
            return res.status(400).send({status:false,message:"blogId is invalid"})
        }

        let dataById = await blog.findOne({_id:blogId,isDeleted:false})

        if(!dataById){return res.status(404).send({status: false, msg : "No such blog exists"})}

    if(req.user.userId!=dataById.authorId){
        return res.status(400).send({status:false,message:"Authorisation failed..."})
    }

    if(bodyData.title){
        if(bodyData.title.length==0){
            return res.status(400).send({status:false,message:"title field is empty..."})
        }

        obj.title=bodyData.title

    }


    if(bodyData.body){
        if(bodyData.body.length==0){
            return res.status(400).send({status:false,message:"body field is empty..."})
        }

        obj.body=bodyData.body
    }


    if(bodyData.tags){
        let tag = dataById.tags

        let newTag = bodyData.tags.split(',')
        for (let i = 0; i < newTag.length; i++) {
            if (tag.includes(newTag[i])) {
                continue;
            } else {
                tag.push(newTag[i])
            }
        }

        obj.tags=tag

    }

    if(bodyData.subcategory){

        let subCategory = dataById.subcategory
        let newSubCategory = bodyData.subcategory.split(',')
        for (let i = 0; i < newSubCategory.length; i++) {
            if (subCategory.includes(newSubCategory[i])) {
                continue;
            } else {
                subCategory.push(newSubCategory[i])
            }
        }

        obj.subcategory=subCategory

    }


    obj.isPublished=true

    obj.publishedAt=Date.now()

        let update1 = await blog.findOneAndUpdate({ _id: blogId },{$set:obj}, { new: true })
        return res.status(200).send({ status: true, msg: update1 })
    }
    catch (err) {
        return res.status(500).send({ status:false,error: err.message })
    }
}

const deleteBlog = async function (req, res) {
    try {
        let blogId = req.params.blogId

        if(!mongoose.isValidObjectId(blogId)){
            return res.status(400).send({status:false,message:"BlogId is invalid..."})
        }

        let data = await blog.findOne({ _id: blogId, isDeleted: false })

        if (!data) {
            return res.status(404).send({ status: false, msg: "no document found" })
        }

        if(req.user.userId!=data.authorId){
            return res.status(400).send({status:false,message:"Authorisation failed..."})
        }

            let deleteBlog = await blog.findOneAndUpdate({ _id: blogId }, { $set: { isDeleted: true, deletedAt: Date.now() } }, { new: true })
            return res.status(200).send()

    }
    catch (err) {
        return res.status(500).send({status:false,msg: err.message })
    }
}

let deleteBlogs = async function (req, res) {
    try {
        let data = req.query

        let obj={isDeleted:false,isPublished:false}

            if(!data.authorId){
                return res.status(400).send({status:false,message:"AuthorId field is empty..."})
            }

            if(!mongoose.isValidObjectId(data.authorId)){
                return res.status(400).send({status:false,message:"Invalid authorId"})
            }

            let checkAuthor = await author.findById(data.authorId)
             if(!checkAuthor){ return res.status(404).send({status : false, msg : "Author does not exist"})}

             if(req.user.userId!=data.authorId){
                return res.status(400).send({status:false,message:"Authorisation failed..."})
            }

             obj.authorId=data.authorId

        if(data.category){
            if(data.category.length===0){
                return res.status(400).send({status:false,message:"Category field is empty..."})
            }

            obj.category=data.category
        }

        if(data.tags){
            if(data.tags.length===0){
                return res.status(400).send({status:false,message:"tags field is empty..."})
            }

            let tag=data.tags.split(',')
            obj.tags={$in:tag}

        }

        if(data.subcategory){
            if(data.subcategory.length==0){
                return res.status(400).send({status:false,message:"subcategory field is empty..."})
            }
            let sub=data.subcategory.split(',')
            obj.subcategory={$in:sub}
        }

        let deleteB = await blog.updateMany(obj,{ $set: { isDeleted: true, deletedAt: Date.now() } }, { new: true })
        if (!deleteB) {
            return res.status(400).send({ status: false, msg: "No data found" })
        }
        return res.status(200).send({ status: true, data: deleteB })
    }
    catch (err) {
        return res.status(500).send({ status:false,msg: err.message })
    }
}

module.exports={createBlog,filterBlogs,updateBlog,deleteBlog,deleteBlogs}