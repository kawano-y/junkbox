import { Router } from 'express';
import { create, list  } from '../controllers/invoiceController';

export const orderRouter = Router();

orderRouter.post('/:id/invoices', create);
orderRouter.get('/:id/invoices', list);
