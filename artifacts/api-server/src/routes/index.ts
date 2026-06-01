import { Router, type IRouter } from "express";
import healthRouter from "./health";
import heygenRouter from "./heygen";
import falRouter from "./fal";

const router: IRouter = Router();

router.use(healthRouter);
router.use(heygenRouter);
router.use(falRouter);

export default router;
