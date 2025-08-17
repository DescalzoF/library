import express from "express";
import cors from "cors";

const app = express();

app.use(cors());
app.use(express.json());
const PORT = process.env.PORT || 5174;
app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`));
