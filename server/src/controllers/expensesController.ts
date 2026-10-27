import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { ExpenseModel } from '../models/Expense.js';
import { TripModel } from '../models/Trip.js';
import { memoryStore, generateId } from '../services/memoryStore.js';
import { getDBStatus } from '../config/db.js';

export const listExpenses = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { tripId } = req.params;
    const userId = req.user?.id;

    const dbStatus = getDBStatus();
    if (dbStatus.connected) {
      const expenses = await ExpenseModel.find({ tripId, userId }).sort({ expenseDate: -1 });
      res.json({ success: true, count: expenses.length, data: expenses });
    } else {
      const expenses = memoryStore.expenses
        .filter((e) => e.tripId === tripId && e.userId === userId)
        .sort((a, b) => new Date(b.expenseDate).getTime() - new Date(a.expenseDate).getTime());
      res.json({ success: true, count: expenses.length, data: expenses });
    }
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const addExpense = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { tripId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const { category, description, amount, currency = 'USD', expenseDate, status = 'actual' } = req.body;

    if (!category || !description || amount === undefined || !expenseDate) {
      res.status(400).json({
        success: false,
        message: 'category, description, amount, and expenseDate are required',
      });
      return;
    }

    const dbStatus = getDBStatus();
    if (dbStatus.connected) {
      const expense = await ExpenseModel.create({
        userId,
        tripId,
        category,
        description,
        amount: Number(amount),
        currency,
        expenseDate,
        status,
      });

      res.status(201).json({ success: true, data: expense });
    } else {
      const newExpense = {
        _id: generateId(),
        id: generateId(),
        userId,
        tripId,
        category,
        description,
        amount: Number(amount),
        currency,
        expenseDate,
        status,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      memoryStore.expenses.push(newExpense);
      res.status(201).json({ success: true, data: newExpense });
    }
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updateExpense = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { expenseId } = req.params;
    const userId = req.user?.id;

    const dbStatus = getDBStatus();
    if (dbStatus.connected) {
      const expense = await ExpenseModel.findOneAndUpdate(
        { _id: expenseId, userId },
        req.body,
        { new: true }
      );

      if (!expense) {
        res.status(404).json({ success: false, message: 'Expense not found' });
        return;
      }

      res.json({ success: true, data: expense });
    } else {
      const index = memoryStore.expenses.findIndex(
        (e) => (e._id === expenseId || e.id === expenseId) && e.userId === userId
      );

      if (index === -1) {
        res.status(404).json({ success: false, message: 'Expense not found' });
        return;
      }

      memoryStore.expenses[index] = {
        ...memoryStore.expenses[index],
        ...req.body,
        updatedAt: new Date(),
      };

      res.json({ success: true, data: memoryStore.expenses[index] });
    }
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteExpense = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { expenseId } = req.params;
    const userId = req.user?.id;

    const dbStatus = getDBStatus();
    if (dbStatus.connected) {
      const exp = await ExpenseModel.findOneAndDelete({ _id: expenseId, userId });
      if (!exp) {
        res.status(404).json({ success: false, message: 'Expense not found' });
        return;
      }
      res.json({ success: true, message: 'Expense deleted successfully.' });
    } else {
      const index = memoryStore.expenses.findIndex(
        (e) => (e._id === expenseId || e.id === expenseId) && e.userId === userId
      );

      if (index === -1) {
        res.status(404).json({ success: false, message: 'Expense not found' });
        return;
      }

      memoryStore.expenses.splice(index, 1);
      res.json({ success: true, message: 'Expense deleted successfully.' });
    }
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getBudgetSummary = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { tripId } = req.params;
    const userId = req.user?.id;
    const dbStatus = getDBStatus();

    let trip: any = null;
    let expenses: any[] = [];

    if (dbStatus.connected) {
      trip = await TripModel.findById(tripId);
      expenses = await ExpenseModel.find({ tripId, userId });
    } else {
      trip = memoryStore.trips.find((t) => t._id === tripId || t.id === tripId);
      expenses = memoryStore.expenses.filter((e) => e.tripId === tripId && e.userId === userId);
    }

    const totalBudget = trip?.budget || 0;
    const currency = trip?.currency || 'USD';
    const travelers = trip?.travelers || 1;

    let plannedTotal = 0;
    let actualTotal = 0;

    const categoryMap: Record<string, { planned: number; actual: number }> = {
      transportation: { planned: 0, actual: 0 },
      accommodation: { planned: 0, actual: 0 },
      food: { planned: 0, actual: 0 },
      tickets: { planned: 0, actual: 0 },
      activities: { planned: 0, actual: 0 },
      shopping: { planned: 0, actual: 0 },
      miscellaneous: { planned: 0, actual: 0 },
    };

    for (const exp of expenses) {
      const amt = Number(exp.amount) || 0;
      const cat = exp.category || 'miscellaneous';
      if (!categoryMap[cat]) {
        categoryMap[cat] = { planned: 0, actual: 0 };
      }

      if (exp.status === 'planned') {
        plannedTotal += amt;
        categoryMap[cat].planned += amt;
      } else {
        actualTotal += amt;
        categoryMap[cat].actual += amt;
      }
    }

    const remainingBalance = totalBudget - actualTotal;
    const perPersonActual = Math.round((actualTotal / Math.max(1, travelers)) * 100) / 100;
    const perPersonBudget = Math.round((totalBudget / Math.max(1, travelers)) * 100) / 100;

    res.json({
      success: true,
      data: {
        totalBudget,
        currency,
        travelers,
        plannedTotal,
        actualTotal,
        remainingBalance,
        perPersonBudget,
        perPersonActual,
        categoryBreakdown: categoryMap,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};
