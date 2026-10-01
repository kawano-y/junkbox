import { Router } from 'express';
import { calculate } from '../controllers/quoteController';

const router = Router();
router.post('/calculate', calculate);

export default router;
