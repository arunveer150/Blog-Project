const express = require('express');
const router = express.Router();

const {createBlog,filterBlogs,updateBlog,deleteBlog,deleteBlogs} = require("../controllers/blogController.js")
const authorController = require("../controllers/authorController")

router.post('/authors',authorController.createAuthor)

router.post('/login',authorController.loginUser)

router.post('/blogs',createBlog)

router.get('/blogs',filterBlogs)

module.exports = router;