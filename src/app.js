import express from "express";
import cors from "cors";
import identityRouter from "./routes/identity.route.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.use("/identify", identityRouter);

export default app;
