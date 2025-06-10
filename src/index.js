const express = require("express");
const dotenv = require("dotenv");
const authRoutes = require("./routes/auth.routes");
const postRoutes = require("./routes/post.routes");
const categoryRoutes = require("./routes/category.routes");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/post", postRoutes);
app.use("/api/category", categoryRoutes);

app.listen(PORT, () => {
  console.log(`App listening to Port ${PORT}`);
});
