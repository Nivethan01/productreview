const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const app = express();
const secretKey = process.env.SECRET_KEY || "default_secret_key";

app.use(bodyParser.json());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

mongoose
  .connect("mongodb://localhost:27017/Products", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

const loginSchema = new mongoose.Schema({
  Username: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
});
const Auth = mongoose.model("Auth", loginSchema);

const productSchema = new mongoose.Schema({
  product_name: { type: String, required: true },
  description: { type: String, required: true },
});
const Product = mongoose.model("Product", productSchema);

const reviewSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  reviewText: { type: String, required: true },
});
const Review = mongoose.model("Review", reviewSchema);

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader)
    return res.status(401).send("Access denied. No token provided.");

  const token = authHeader.split(" ")[1];
  if (!token) return res.status(401).send("Access denied. No token provided.");

  try {
    const verified = jwt.verify(token, secretKey);
    req.user = verified;
    next();
  } catch (error) {
    res.status(400).send("Invalid token");
  }
};

app.get("/", (req, res) => {
  res.send("Get message");
});

app.post("/signup", async (req, res) => {
  try {
    const { Username, email, password } = req.body;
    const hashPassword = await bcrypt.hash(password, 10);
    const newItem = new Auth({
      Username,
      email,
      password: hashPassword,
    });
    await newItem.save();
    res.status(200).send("User created successfully");
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/users", async (req, res) => {
  try {
    const users = await Auth.find({}, { password: 0 });
    res.send(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).send("Internal server error");
  }
});

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await Auth.findOne({ email: email });
    if (!user) return res.status(400).send("User not found");
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(400).send("Invalid Password");
    const token = jwt.sign(
      { _id: user._id, username: user.Username, email: user.email },
      secretKey,
      { expiresIn: "10d" }
    );
    res.send({ token });
  } catch (error) {
    console.error("Error in Login:", error);
    res.status(500).send("Error in Login");
  }
});

app.get("/profile", verifyToken, (req, res) => {
  res.send({ username: req.user.username, email: req.user.email });
});

app.put("/users/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { Username, email } = req.body;

    if (req.user._id !== id) return res.status(403).send("Forbidden");

    const user = await Auth.findByIdAndUpdate(
      id,
      { Username, email },
      { new: true }
    );

    if (!user) return res.status(404).send("User not found");

    res.send(user);
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).send("Internal server error");
  }
});

app.delete("/users/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;

    if (req.user._id !== id) return res.status(403).send("Forbidden");

    const deletedUser = await Auth.findByIdAndDelete(id);

    if (!deletedUser) return res.status(404).send("User not found");

    res.send("User deleted successfully");
  } catch (error) {
    
    console.error("Error deleting user:", error);
    res.status(500).send("Internal server error");
  }
});

app.get("/pro", async (req, res) => {
  try {
    const products = await Product.find({});
    res.send(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).send("Internal server error");
  }
});

app.post("/pro/create", async (req, res) => {
  try {
    const { product_name, description } = req.body;
    const newItem = new Product({
      product_name,
      description,
    });
    await newItem.save();
    res.status(200).json(newItem);
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.put("/pro/update/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { product_name, description } = req.body;

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      { product_name, description },
      { new: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.status(200).json(updatedProduct);
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.delete("/pro/delete/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const deletedProduct = await Product.findByIdAndDelete(id);

    if (!deletedProduct) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/products/:productId/reviews", async (req, res) => {
  try {
    const { productId } = req.params;
    const reviews = await Review.find({ productId });
    res.status(200).json(reviews);
  } catch (error) {
    console.error("Error fetching reviews:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/reviews", async (req, res) => {
  try {
    const { productId, reviewText } = req.body;
    const newReview = new Review({
      productId,
      reviewText,
    });
    await newReview.save();
    res.status(200).json(newReview);
  } catch (error) {
    console.error("Error creating review:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.put("/reviews/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { reviewText } = req.body;

    const updatedReview = await Review.findByIdAndUpdate(
      id,
      { reviewText },
      { new: true }
    );

    if (!updatedReview) {
      return res.status(404).json({ error: "Review not found" });
    }

    res.status(200).json(updatedReview);
  } catch (error) {
    console.error("Error updating review:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.delete("/reviews/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const deletedReview = await Review.findByIdAndDelete(id);

    if (!deletedReview) {
      return res.status(404).json({ error: "Review not found" });
    }

    res.status(200).json({ message: "Review deleted successfully" });
  } catch (error) {
    console.error("Error deleting review:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
