import { PrismaClient } from "../generated/prisma/index.js";

const prisma = new PrismaClient();

const identityController = async (req, res) => {
  try {
    const { email, phoneNumber } = req.body;
    res.send(`Email: ${email}, Phone Number: ${phoneNumber}`);
  } catch (error) {
    console.error("Error in identityController:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export default identityController;
