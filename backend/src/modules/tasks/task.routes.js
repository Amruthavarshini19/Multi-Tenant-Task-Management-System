import { Router } from "express";
import * as taskController from "./task.controller.js";
import { authenticate } from "../../middlewares/auth.js";
import { tenantScope } from "../../middlewares/tenantScope.js";
import { authorize } from "../../middlewares/rbac.js";

const taskRouter = Router();

taskRouter.use(authenticate, tenantScope);

taskRouter.get("/", taskController.getTasks);
taskRouter.post("/", authorize("admin", "member"), taskController.createTask);
taskRouter.put("/:id", authorize("admin", "member"), taskController.updateTask);
taskRouter.delete("/:id", authorize("admin", "member"), taskController.deleteTask);

export { taskRouter };
