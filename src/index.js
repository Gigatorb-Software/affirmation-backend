const express = require("express");
const dotenv = require("dotenv");
const authRoutes = require("./routes/auth.routes");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use("/api/auth", authRoutes);

app.listen(PORT, () => {
  console.log(`App listening to Port ${PORT}`);
});
