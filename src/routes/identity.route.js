import { Router } from "express";
import identityController from "../controllers/identity.controller.js";

const router = Router();

router.post("/", identityController);

export default router;
