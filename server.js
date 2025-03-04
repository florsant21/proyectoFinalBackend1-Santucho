import express from "express";
import connectDB from "./src/config/db.js";
import productRoutes from "./src/routes/productRoutes.js";
import cartRoutes from "./src/routes/cartRoutes.js";
import path from "path";
import { fileURLToPath } from "url";
import { createServer } from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";
import exphbs from "express-handlebars";
import Product from "./src/models/Product.js";
import Cart from "./src/models/Carts.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const server = createServer(app);
const io = new Server(server);

connectDB();

const hbs = exphbs.create({
  allowProtoPropertiesByDefault: true,
  allowProtoMethodsByDefault: true,
  runtimeOptions: {
    allowProtoPropertiesByDefault: true,
    allowProtoMethodsByDefault: true,
  },
});
app.engine("handlebars", hbs.engine);
app.set("view engine", "handlebars");

app.set("views", path.join(__dirname, "src", "views"));

app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());

app.use("/api/products", productRoutes);
app.use("/api/carts", cartRoutes);

app.get("/products", async (req, res) => {
  try {
    const products = await Product.find();
    res.render("products", { products });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get("/real-time-products", async (req, res) => {
  try {
    const products = await Product.find();
    res.render("realTimeProducts", { products });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get("/cart", async (req, res) => {
  try {
    const cart = await Cart.findOne();
    if (!cart) {
      const newCart = new Cart({ products: [] });
      await newCart.save();
      res.render("cart", { cart: newCart });
    } else {
      const populatedCart = await Cart.findById(cart._id).populate(
        "products.product"
      );
      res.render("cart", { cart: populatedCart });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

io.on("connection", (socket) => {
  console.log("Cliente conectado");

  socket.on("newProduct", async (product) => {
    try {
      const newProduct = new Product(product);
      await newProduct.save();
      io.emit("updateProducts", await Product.find());
    } catch (error) {
      console.error("Error al guardar producto:", error);
    }
  });

  socket.on("deleteProduct", async (productId) => {
    try {
      await Product.findByIdAndDelete(productId);
      io.emit("updateProducts", await Product.find());
    } catch (error) {
      console.error("Error al eliminar producto:", error);
    }
  });
  socket.on("addToCart", async (productId) => {
    try {
      let cart = await Cart.findOne();

      if (!cart) {
        cart = new Cart({ products: [{ product: productId, quantity: 1 }] });
      } else {
        const productIndex = cart.products.findIndex(
          (p) => p.product.toString() === productId
        );

        if (productIndex === -1) {
          cart.products.push({ product: productId, quantity: 1 });
        } else {
          cart.products[productIndex].quantity += 1;
        }
      }

      await cart.save();
      io.emit("updateCart", await Cart.findOne().populate("products.product"));
    } catch (error) {
      console.error("Error al agregar al carrito:", error);
    }
  });
  socket.on("clearCart", async () => {
    try {
      await Cart.findOneAndDelete();
      io.emit("updateCart", null);
    } catch (error) {
      console.error("Error al limpiar el carrito:", error);
    }
  });
});

server.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
