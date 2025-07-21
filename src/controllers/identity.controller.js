import { PrismaClient } from "../generated/prisma/index.js";

const prisma = new PrismaClient();

const identityController = async (req, res) => {
  try {
    const { email, phoneNumber } = req.body;
    const response = {
      contact: {
        primaryContactId: 0,
        emails: [],
        phoneNumbers: [],
        secondaryContactIds: [],
      },
    };

    // will have either email or phoneNumber or both
    if (!email && !phoneNumber) {
      return res
        .status(400)
        .json({ error: "Email or Phone Number is required" });
    }

    // check if any contact exists with the provided email or phone number
    const existingContact = await prisma.contact.findMany({
      where: {
        OR: [{ email: email }, { phoneNumber: phoneNumber }],
      },
    });

    // if no contact exists, create a new one
    if (existingContact.length === 0) {
      const newContact = await prisma.contact.create({
        data: {
          email: email || null,
          phoneNumber: phoneNumber || null,
        },
      });
      return res.status(201).json(newContact);
    }

    // if contact/s exist, then check and create the response
    // if both details exist in the same contact
    // if only email exists
    // if only phone number exists

    res.send(`Email: ${email}, Phone Number: ${phoneNumber}`);
  } catch (error) {
    console.error("Error in identityController:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export default identityController;
