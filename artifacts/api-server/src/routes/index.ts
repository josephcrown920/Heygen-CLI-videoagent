import { Router, type IRouter } from "express";
import healthRouter from "./health";
import heygenRouter from "./heygen";
import falRouter from "./fal";
import klingRouter from "./kling";

const router: IRouter = Router();

router.use(healthRouter);
router.use(heygenRouter);
router.use(falRouter);
router.use(klingRouter);

export default router;
