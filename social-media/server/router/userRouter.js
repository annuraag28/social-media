const requireUser = require('../middlewares/requireUser');
const userController = require('../controllers/userController');
const router = require('express').Router();

router.post('/follow', requireUser, userController.followOrUnfollowUserController);
router.get('/getPostOfFollowing', requireUser, userController.getPostOfFollowing);
router.get('/getMyPosts', requireUser, userController.getMyPosts);
router.get('/getUserPosts', requireUser, userController.getUserPosts);
router.delete('/', requireUser, userController.deleteMyProfile);

module.exports = router;