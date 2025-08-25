import { Router } from "express"
import { upload } from "../middlewares/multer.middlewares.js"
import { changePassword, deleteAccount, loggedOut, loginUser, refreshAccessToken, registerUser, updateAvatar, updateCredential } from "../controllers/user.controllers.js";
import { verifyJWT } from "../middlewares/verifyJWT.middlewares.js";

const router = Router();

// unsecure routes
router.route('/register').post(upload.single('file'),registerUser);
router.route('/login').get(loginUser)
router.route('/refresh-Access-Token').get(refreshAccessToken)

//secured routes
router.route('/logged-Out').get( verifyJWT, loggedOut)
router.route('/delete-Account').get( verifyJWT, deleteAccount)
router.route('/update-Image').post(verifyJWT,upload.single('file'),updateAvatar)
router.route('/update-Profile').put(verifyJWT,updateCredential)
router.route('/change-password').put(verifyJWT,changePassword)

export default router