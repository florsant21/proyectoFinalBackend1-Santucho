import Cart from "../models/Carts.js";

const updateCart = async (req, res) => {
  try {
    const { cid } = req.params;
    const { products } = req.body;
    const cart = await Cart.findByIdAndUpdate(cid, { products }, { new: true });
    res.json(cart);
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

const updateProductQuantity = async (req, res) => {
  try {
    const { cid, pid } = req.params;
    const { quantity } = req.body;
    const cart = await Cart.findById(cid);
    if (!cart)
      return res
        .status(404)
        .json({ status: "error", message: "Carrito no encontrado" });

    const productIndex = cart.products.findIndex(
      (p) => p.product.toString() === pid
    );
    if (productIndex === -1)
      return res
        .status(404)
        .json({
          status: "error",
          message: "Producto no encontrado en el carrito",
        });

    cart.products[productIndex].quantity = quantity;
    await cart.save();
    res.json(cart);
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

const deleteProductFromCart = async (req, res) => {
  try {
    const { cid, pid } = req.params;
    const cart = await Cart.findById(cid);
    if (!cart)
      return res
        .status(404)
        .json({ status: "error", message: "Carrito no encontrado" });

    cart.products = cart.products.filter((p) => p.product.toString() !== pid);
    await cart.save();
    res.json(cart);
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

const deleteAllProductsFromCart = async (req, res) => {
  try {
    const { cid } = req.params;
    const cart = await Cart.findByIdAndUpdate(
      cid,
      { products: [] },
      { new: true }
    );
    res.json(cart);
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

export {
  updateCart,
  updateProductQuantity,
  deleteProductFromCart,
  deleteAllProductsFromCart,
};
