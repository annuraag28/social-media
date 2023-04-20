const Post = require("../models/Post");
const User = require("../models/User");
const { success, error } = require("../utils/responseWrapper");

const followOrUnfollowUserController = async(req, res)=>{
    try {
        const {userIdToFollow} = req.body;
        const userToFollow = await User.findById(userIdToFollow);
        if(!userToFollow){
            return res.send(error(404,"user to follow not found"))
        }

        const curUserId = req._id;
        const curUser = await User.findById(curUserId);

        if(curUserId === userIdToFollow){
            return res.send(error(409, "Users cannot follow themselves"));
        }

        //if followed already
        if(curUser.followings.includes(userIdToFollow)){
            const followingIndex = curUser.followings.indexOf(userIdToFollow);
            curUser.followings.splice(followingIndex,1);

            const followerIndex = userToFollow.followers.indexOf(curUser);
            userToFollow.followers.splice(followerIndex,1);
            await curUser.save();
            await userToFollow.save();
            return res.send(success(200,"user Unfollowed"));
        }
        else{ // if not followed , then follow
            curUser.followings.push(userIdToFollow);
            userToFollow.followers.push(curUserId);
            await curUser.save();
            await userToFollow.save();
            return res.send(success(200,"user Followed"));
        }     
    } catch (e) {
        return res.send(error(500, e.message));
    }
}

const getPostOfFollowing = async(req, res) => {
    try {
        const curUserId = req._id;  
        const curUser = await User.findById(curUserId);
    
        const posts =await Post.find({
            "owner" : {
                "$in" : curUser.followings
            }
        })
        return res.send(success(200, {posts}));
    } catch (e) {
        return res.send(error(500, e.message));
    }
}

const getMyPosts = async (req, res)=>{
    try {
        const curUserId = req._id;

        const allUserPosts = await Post.find({
            owner : curUserId
        }).populate("likes");

        return res.send(success(200,{allUserPosts}));
        
    } catch (e) {
        return res.send(error(500, e.message));
    }
}
const getUserPosts = async (req,res) => {
    try {
        const userId = req.body.userId;
        if(!userId){
            return res.send(error(400,"userId is required"));
        }
        const allUserPosts = await Post.find({
            owner : userId
        }).populate("likes");
        return res.send(success(200, {allUserPosts}));
    } catch (e) {
        return res.send(error(500, e.message));
    }
}


const deleteMyProfile = async (req, res) => {
    try {
        const curUserId = req._id;
        const curUser = await User.findById(curUserId);

        // delete all posts
        await Post.deleteMany({
            owner: curUserId,
        });

        // removed myself from followers' followings
        curUser.followers.forEach(async (followerId) => {
            const follower = await User.findById(followerId);
            const index = follower.followings.indexOf(curUserId);
            follower.followings.splice(index, 1);
            await follower.save();
        });

        // remove myself from my followings' followers
        curUser.followings.forEach(async (followingId) => {
            const following = await User.findById(followingId);
            const index = following.followers.indexOf(curUserId);
            following.followers.splice(index, 1);
            await following.save();
        });

        // remove myself from all likes
        const allPosts = await Post.find();
        allPosts.forEach(async (post) => {
            const index = post.likes.indexOf(curUserId);
            post.likes.splice(index, 1);
            await post.save();
        });

        // delete user
        await curUser.remove();

        res.clearCookie("jwt", {
            httpOnly: true,
            secure: true,
        });

        return res.send(success(200, "user deleted"));
    } catch (error) {
        console.log(e);
        return res.send(error(500, e.message));
    }
};


module.exports = {
    followOrUnfollowUserController,
    getPostOfFollowing,
    getMyPosts,
    getUserPosts,
    deleteMyProfile
}