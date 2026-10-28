import express from 'express';
import { getAllProducts, getProductById, postProduct, updateProduct, deleteProduct } from '../controladores/products.controller.js';
import { authentication } from '../middleware/authentication.js';

const router = express.Router();

router.get('/products', getAllProducts);
router.get('/products/:id', getProductById);
router.post('/products/create', authentication, postProduct);
router.put('/products/:id', authentication, updateProduct);
router.delete('/products/:id', authentication, deleteProduct);

export default router;
