import { Router, type IRouter } from "express";
import healthRouter from "./health";
import heygenRouter from "./heygen";

const router: IRouter = Router();

router.use(healthRouter);
router.use(heygenRouter);

export default router;
