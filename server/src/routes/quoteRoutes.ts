import { Router } from 'express';
import { calculate, convertQuote, register } from '../controllers/quoteController';

const router = Router();
router.post('/calculate', calculate);
router.post('/:id/convert', convertQuote);
router.post('', register);

export default router;
