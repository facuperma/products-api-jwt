import { readDocuments, readDocument, createDocument, updateDocument, deleteDocument } from "../modelos/products.models.js";

export const getAllProductsByFilterService = async ({ category, price }) => {
    if (category === undefined && price === undefined) {
        return await readDocuments('products');
    }

    const products = await readDocuments('products');

    return products.filter((item) => {
        if (category && item.category !== category) return false;
        if (price && item.price !== price) return false;
        return true;
    });
};

export const getProductByIdService = async (productId) => {
    return await readDocument('products', productId);
};

export const postProductService = async (newProduct) => {
    console.log("Producto recibido services:", newProduct);
    return await createDocument('products', newProduct);
};

export const updateProductService = async (productId, changes) => {
    const existing = await readDocument('products', productId);
    if (!existing) return null;

    await updateDocument('products', productId, changes);
    return { ...existing, ...changes, id: productId };
};

export const deleteProductService = async (productId) => {
    return await deleteDocument('products', productId);
};
