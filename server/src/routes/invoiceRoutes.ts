import { Router } from 'express';
import { createInvoicePdfHandler } from '../controllers/invoiceController';

export const invoiceRouter = Router();

invoiceRouter.post('/pdf', createInvoicePdfHandler);
