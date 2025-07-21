import express from "express";
import cors from "cors";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.get("/identity", (req, res) => {
  const { email, phoneNumber } = req.body;
  res.send(
    `Identity received: Email - ${email}, Phone Number - ${phoneNumber}`
  );
});

export default app;
