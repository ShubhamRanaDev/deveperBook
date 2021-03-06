const express = require('express')
const router = express.Router();
const {check, validationResult} = require('express-validator')
const auth = require('../../middleware/auth')
const Post = require('../../models/Post')
const User = require('../../models/User')
const Profile = require('../../models/Profile')

//post req for posts
router.post('/', [auth, [
        check('text', 'Text is Required')
            .not()
            .isEmpty()
    ]],
    async (req, res) => {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(400).json({errors: errors.array()})
        }


        try {
            const user = await User.findById(req.user.id).select('-password')
            const newPost = new Post({
                text: req.body.text,
                name: user.name,
                avatar: user.avatar,
                user: req.user.id
            })

            const post = await newPost.save()
            res.json(post)

        } catch (e) {
            console.error(e.message)
            res.status(500).send('server error')
        }
    })

//get all post request
router.get('/',auth, async (req,res)=>{
    try{
        const posts = await Post.find().sort({date:-1})
        res.json(posts)
    } catch (e) {
        console.error(e.message)
        res.status(500).send('server error')
    }
})

//get posts by id
router.get('/:id',auth,async (req,res)=>{
    try{
        const post = await Post.findById(req.params.id)
        if(!post) return res.status(404).json({msg:"Post not found"})
        res.json(post)
    } catch (e) {
        console.error(e.message)
        if(e.kind === 'ObjectId') return res.status(404).json({msg:"Post not found"})

        res.status(500).send('server error')
    }
})

//delete post
router.delete('/:id',auth,async (req,res)=>{
    try{
        const post = await Post.findById(req.params.id)
        if(post.user.toString() !== req.user.id) return res.status(401).json({msg:"user not authorized"})

        if(!post) return res.status(404).json({msg:"Post not found"})

        await post.remove()
        res.json({msg:"Post removed"})
    } catch (e) {
        console.error(e.message)
        if(e.kind === 'ObjectId') return res.status(404).json({msg:"Post not found"})

        res.status(500).send('server error')
    }
})

module.exports = router;