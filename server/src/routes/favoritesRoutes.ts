import { Router } from 'express';
import {
  listFavorites,
  addFavorite,
  deleteFavorite,
  getCollections,
  renameCollection,
} from '../controllers/favoritesController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.get('/', listFavorites);
router.post('/', addFavorite);
router.delete('/:favoriteId', deleteFavorite);
router.get('/collections', getCollections);
router.post('/collections/rename', renameCollection);

export default router;
