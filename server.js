import express from "express";
import connectDB from "./src/config/db.js";
import productRoutes from "./src/routes/productRoutes.js";
import cartRoutes from "./src/routes/cartRoutes.js";
import Product from "./src/models/Product.js";
import path from "path";
import { fileURLToPath } from "url";
import { createServer } from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const server = createServer(app);
const io = new Server(server);

connectDB();

app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use("/api/products", productRoutes);
app.use("/api/carts", cartRoutes);

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

  socket.on("deleteProduct", async (index) => {
    try {
      const products = await Product.find();
      if (products[index]) {
        await Product.findByIdAndDelete(products[index]._id);
        io.emit("updateProducts", await Product.find());
      }
    } catch (error) {
      console.error("Error al eliminar producto:", error);
    }
  });
});

server.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
