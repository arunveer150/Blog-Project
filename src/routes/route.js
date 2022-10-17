const express = require('express');
const router = express.Router();

const {createBlog,filterBlogs,updateBlog,deleteBlog,deleteBlogs} = require("../controllers/blogController.js")
const authorController = require("../controllers/authorController")
const auth=require("../Authentication/authentication")

router.post('/authors',authorController.createAuthor)

router.post('/login',authorController.loginUser)

router.post('/blogs',auth.authenticate,createBlog)

router.get('/blogs',filterBlogs)

router.put('/blogs/:blogId',auth.authenticate,updateBlog)

router.delete('/blogs/:blogId',auth.authenticate,deleteBlog)

router.delete('/blogs',auth.authenticate,deleteBlogs)

module.exports = router;