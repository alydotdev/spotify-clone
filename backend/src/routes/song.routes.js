import { Router } from "express";
import { getAllSongs , getFeaturedSongs , getTrendingSongs , getMadeForYouSongs, searchSongs} from "../controllers/song.controller.js";
import {protectRoute , requireAdmin} from "../middleware/auth.middleware.js"
const router = Router();

router.get("/search", searchSongs)
router.get("/", protectRoute , requireAdmin , getAllSongs)
router.get("/featured", getFeaturedSongs)
router.get("/made-for-you" ,getMadeForYouSongs)
router.get("/trending" , getTrendingSongs)


export default router;