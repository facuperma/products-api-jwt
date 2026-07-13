import { getAllProductsByFilterService, getProductByIdService, postProductService, deleteProductService } from '../servicios/products.service.js';

const normalizeId = (value) => {
  if (!value) return null;
  return String(value).trim().replace(/^:+/, '');
};

export const getAllProducts = async (req, res) => {
    try {
        const categoryQuery = req.query.category;
        const priceQuery = req.query.price;
       
        const products = await getAllProductsByFilterService({ category: categoryQuery, price: priceQuery });

        if (products.length === 0) {
            return res.status(400).json({ message: 'No se encontraron productos' });
        }

        return res.status(200).json(products);
    } catch (error) {
        return res.status(500).json({ message: 'Error al obtener los productos' });
    }
};

export const getProductById = async (req, res) => {
    try {
        const rawId = req.params.id ?? req.body.id ?? req.body.product?.id ?? req.body.producto?.id;
        const productId = normalizeId(rawId);

        if (!productId) {
            return res.status(400).json({ message: 'ID de producto inválido' });
        }

        const product = await getProductByIdService(productId);

        if (product) {
            return res.status(200).json(product);
        }

        return res.status(404).json({ message: 'Producto no encontrado' });
    } catch (error) {
        return res.status(500).json({ message: 'Error al obtener el producto' });
    }
};

export const postProduct = async (req, res) => {
    const body = req.body;
    const rootKeys = Object.keys(body);
    let data;
    let id;

    if (
      rootKeys.length === 1 &&
      body[rootKeys[0]] &&
      typeof body[rootKeys[0]] === 'object' &&
      !Array.isArray(body[rootKeys[0]])
    ) {
      id = rootKeys[0];
      data = body[id];
    } else {
      data = body.product ?? body.producto ?? body;
      id = data?.id;
    }

    if (!data || Object.keys(data).length === 0) {
      return res.status(400).json({ message: 'Información del producto es requerida' });
    }

    const producto = { ...data, ...(id ? { id } : {}) };
    console.log("Producto recibido controller:", producto);

    try {
        const result = await postProductService(producto);
        const status = result.overwritten ? 200 : 201;
        const message = result.overwritten
          ? 'Producto existente sobreescrito en la base de datos'
          : 'Producto creado correctamente en la base de datos';

        return res.status(status).json({ id: result.id, message });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error al crear el producto' });
    }
};

export const deleteProduct = async (req, res) => {
  try {
    const rawId = req.params.id ?? req.body.id ?? req.body.product?.id ?? req.body.producto?.id;
    const productId = normalizeId(rawId);

    console.log("ID recibido para eliminar:", rawId, "=>", productId);

    if (!productId) {
      return res.status(400).json({ message: "ID de producto requerido" });
    }

    const deleted = await deleteProductService(productId);

    if (!deleted) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }

    return res.status(200).json({ message: "Producto eliminado", id: productId });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error al eliminar el producto" });
  }
};