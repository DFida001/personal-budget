// Budget API

// const express = require("express");
// const cors = require("cors");
// const app = express();
// const port = 3000;

// app.use(cors());

// app.get("/budget", (req, res) => {
//   res.json(budget);
// });

// app.listen(port, () => {
//   console.log(`API served at http://localhost:${port}`);
//});

// Week 4 API

const express = require("express");
const mongoose = require("mongoose");
const app = express();
const port = 3000;

app.use("/", express.static("public"));
app.use(express.json());

const MONGO_URI =
  process.env.MONGO_URI ||
  "mongodb+srv://demoUser:notTheRealPassword@cluster0.rwcjvda.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

const hexColorRegex = /^#([A-Fa-f0-9]{6})$/;

const budgetItemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  value: {
    type: Number,
    required: true,
  },
  color: {
    type: String,
    required: true,
    validate: {
      validator: (value) => hexColorRegex.test(value),
      message:
        "color must be in hexadecimal format with a leading # and six digits (e.g., #ED4523)",
    },
  },
});

const BudgetItem = mongoose.model("BudgetItem", budgetItemSchema);

app.get("/hello", (req, res) => {
  res.send("Hello World!");
});

app.get("/budget", (req, res) => {
  BudgetItem.find()
    .lean()
    .then((items) => {
      res.json({ myBudget: items });
    })
    .catch((error) => {
      console.error("Failed to fetch budget items", error);
      res.status(500).json({ error: "Failed to fetch budget data" });
    });
});

app.post("/budget", async (req, res) => {
  const { title, value, color } = req.body;

  if (typeof title !== "string" || !title.trim()) {
    return res.status(400).json({ error: "title is required" });
  }

  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) {
    return res.status(400).json({ error: "value must be a number" });
  }

  if (typeof color !== "string" || !hexColorRegex.test(color)) {
    return res.status(400).json({
      error: "color must be in hexadecimal format like #ED4523",
    });
  }

  try {
    const budgetItem = new BudgetItem({
      title: title.trim(),
      value: numericValue,
      color,
    });
    const savedItem = await budgetItem.save();
    res.status(201).json(savedItem);
  } catch (error) {
    console.error("Failed to insert budget item", error);
    res.status(500).json({ error: "Failed to insert budget item" });
  }
});

mongoose
  .connect(MONGO_URI, { dbName: "pb" })
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(port, () => {
      console.log(`Example app listening at http://localhost:${port}`);
    });
  })
  .catch((error) => {
    console.error("Failed to connect to MongoDB", error);
  });
