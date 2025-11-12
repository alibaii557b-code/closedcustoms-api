import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ status: "Closed Customs API is running." });
});

app.post("/build", (req, res) => {
  const { parts } = req.body;
  if (!parts) return res.status(400).json({ error: "No parts provided." });
  res.json({ message: "Build received!", build: parts });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

