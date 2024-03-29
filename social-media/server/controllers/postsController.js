const User = require("../models/User");
const Post = require("../models/Post");
const { success, error} = require("../utils/responseWrapper");



const createPostController = async(req,res)=>{
    try {
        const {caption} = req.body;
        if(!caption){
            return res.send(error(400, "caption is required"));
        }
        const owner = req._id;

        const user = await User.findById(req._id);

        //This create will create this post in mongoDB directly
        const post = await Post.create({
            owner,
            caption
        });

        user.posts.push(post._id);
        await user.save();
        return res.send(success(201, post));
    } catch (e) {
        res.send(error(500, e.message));
    }

}
const likeAndUnlikePost = async(req, res) => {
    try {
        const {postId} = req.body;
        const curUserId = req._id;

        const post = await Post.findById(postId);
        if(!post){
            return res.send(error(500, "post not found"));
        }
        // const user = await User.findById(curUserId);

        if(post.likes.includes(curUserId)){ //if the post is already liked
            const index = post.likes.indexOf(curUserId);
            post.likes.splice(index,1);
            await post.save();
            return res.send(success(200, "post Unliked"));
        }
        else{
            post.likes.push(curUserId);
            await post.save();
            return res.send(success(200, "post liked"));
        }
    } catch (e) {
        return res.send(error(500, e.message));
    }
}


const updatePostController = async (req, res) => {
    try {
        const {postId, caption} = req.body;
        const curUserId = req._id;

        const post = await Post.findById(postId);
        if(!post){
            return res.send(error(404, "Post not found"));
        }

        if(post.owner.toString() !== curUserId){
            return res.send(error(404, "user can only update their posts"));
        }
        
        if(caption){
            post.caption = caption;
        }
        await post.save();
        return res.send(success(200,{post}));

    } catch (e) {
        return res.send(error(500, e.message));   
    }
}


const deletePost = async(req, res)=>{
   try {
        const {postId} = req.body;
        const curUserId = req._id;

        const post = await Post.findById(postId);
        if(!post){
            return res.send(error(404, "Post not found"));
        }

        if(post.owner.toString() !== curUserId){
            return res.send(error(404, "user can only delete their posts"));
        }

        const curUser = await User.findById(curUserId);
        const index = curUser.posts.indexOf(postId);
        curUser.posts.splice(index,1);

        await curUser.save();
        await post.remove();
        return res.send(success(200,"post deleted successfully"));
   } catch (e) {
        return res.send(error(500,e.message));
   }
}

module.exports = {
    createPostController,
    likeAndUnlikePost,
    updatePostController,
    deletePost
}