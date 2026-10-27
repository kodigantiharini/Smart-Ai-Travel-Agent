import { Router } from 'express';
import {
  listExpenses,
  addExpense,
  updateExpense,
  deleteExpense,
  getBudgetSummary,
} from '../controllers/expensesController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.get('/:tripId/expenses', listExpenses);
router.post('/:tripId/expenses', addExpense);
router.patch('/:tripId/expenses/:expenseId', updateExpense);
router.delete('/:tripId/expenses/:expenseId', deleteExpense);
router.get('/:tripId/budget-summary', getBudgetSummary);

export default router;
