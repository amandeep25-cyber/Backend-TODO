import { Router } from "express";
import { verifyJWT } from "../middlewares/verifyJWT.middlewares.js";
import { createTask, deleteOneTask, getAllTask, getCompletedTask, getIncompletedTask, istaskCompleted, updateInTask } from "../controllers/task.controllers.js";

const router = Router();

//All secured routes
router.route('/create-Task').post(verifyJWT,createTask)
router.route('/get-All-Task').get(verifyJWT,getAllTask)
router.route('/deleted-Task/:id').delete(verifyJWT,deleteOneTask)
router.route('/update-Task/:id').put(verifyJWT,updateInTask)
router.route('/is-task-completed/:id').put(verifyJWT,istaskCompleted)
router.route('/get-completed-task').get(verifyJWT,getCompletedTask)
router.route('/get-incompleted-task').get(verifyJWT,getIncompletedTask)

export default router