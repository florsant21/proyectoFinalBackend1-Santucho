import express from 'express';
import { updateCart, updateProductQuantity, deleteProductFromCart, deleteAllProductsFromCart } from '../controllers/cartController.js';

const router = express.Router();

router.put('/:cid', updateCart);
router.put('/:cid/products/:pid', updateProductQuantity);
router.delete('/:cid/products/:pid', deleteProductFromCart);
router.delete('/:cid', deleteAllProductsFromCart);

export default router;
