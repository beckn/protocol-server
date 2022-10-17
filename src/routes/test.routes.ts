import { Router } from "express";
import { testController } from "../controllers/test.controller";
import { authValidatorMiddleware } from "../middlewares/auth.middleware";

const testRouter=Router();

testRouter.post('/', authValidatorMiddleware, testController);

export default testRouter;