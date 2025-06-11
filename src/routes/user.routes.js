import express from "express"
import { upload } from "../middlewares/multer.middlewares.js"
import { changePassword, deleteAccount, loggedOut, loginUser, refreshAccessToken, registerUser, updateAvatar, updateCredential } from "../controllers/user.controllers.js";
import { verifyJWT } from "../middlewares/verifyJWT.middlewares.js";


const router = express.Router()


// unsecure routes
router.route('/register').post(upload.single('file'),registerUser);
router.route('/login').get(loginUser)
router.route('/refresh-Access-Token').get(refreshAccessToken)

//secured routes
router.route('/logged-Out').get( verifyJWT, loggedOut)


export default router