import * as taskService from "./task.service.js";
import { asyncWrap } from "../../middlewares/errorHandler.js";

export const getTasks = asyncWrap(async (req, res) => {
    const tasks = await taskService.listTasks({ 
        orgId: req.tenantId, userId: req.user.userId, role: req.user.role 
    });
    res.json(tasks.rows);
});

export const createTask = asyncWrap(async (req, res) => {
    const task = await taskService.createTask({
        orgId: req.tenantId, userId: req.user.userId, data: req.body
    });
    res.status(201).json(task);
});

export const updateTask = asyncWrap(async (req, res) => {
    const task = await taskService.updateTask({
        orgId: req.tenantId, userId: req.user.userId, role: req.user.role,
        taskId: req.params.id, data: req.body
    });
    res.json(task);
});

export const deleteTask = asyncWrap(async (req, res) => {
    await taskService.deleteTask({
        orgId: req.tenantId, userId: req.user.userId, role: req.user.role, taskId: req.params.id
    });
    res.status(204).send();
});
