import { Router } from "express";
import { protocolHandler } from "../controllers/protocol";

const router = Router()

router.post(`/${process.env.api}`, protocolHandler)

export default router