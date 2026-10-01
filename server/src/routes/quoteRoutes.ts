import { Router } from 'express';
import { calculate, convertQuote } from '../controllers/quoteController';

const router = Router();
router.post('/calculate', calculate);
router.post('/:id/convert', convertQuote);

export default router;
