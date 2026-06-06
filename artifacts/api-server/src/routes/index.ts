import { Router, type IRouter } from "express";
import healthRouter from "./health";
import heygenRouter from "./heygen";
import falRouter from "./fal";
import klingRouter from "./kling";
import siDirectorRouter from "./si-director";
import hfRouter from "./hf";
import authRouter from "./auth";

const router: IRouter = Router();

router.use(authRouter);
router.use(healthRouter);
router.use(heygenRouter);
// Backward-compatible namespace used by older studio pages and CLI tools.
router.use("/heygen", heygenRouter);
router.use(falRouter);
router.use(klingRouter);
router.use(siDirectorRouter);
router.use(hfRouter);

export default router;
