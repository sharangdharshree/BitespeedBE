import { PrismaClient } from "../generated/prisma/index.js";

const prisma = new PrismaClient();

const identityController = async (req, res) => {
  try {
    const email = req.body.email || null;
    const phoneNumber = req.body.phoneNumber || null;
    var response = {
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
    const existingContacts = await prisma.contact.findMany({
      where: {
        OR: [{ email: email }, { phoneNumber: phoneNumber }],
      },
    });

    // if no contact exists, create a new one, compile data and send response
    if (existingContacts.length === 0) {
      const newContact = await prisma.contact.create({
        data: {
          email: email || null,
          phoneNumber: phoneNumber || null,
        },
      });
      response.contact.primaryContactId = newContact.id;
      newContact.email ? response.contact.emails.push(newContact.email) : null;
      newContact.phoneNumber
        ? response.contact.phoneNumbers.push(newContact.phoneNumber)
        : null;
      return res.status(201).json(response);
    }

    if (existingContacts.length > 0) {
      // if both contact/s sent, then check following and create the response
      if (email && phoneNumber) {
        const indexEmail = existingContacts.findIndex(
          (contact) => contact.email === email
        );
        const indexNumber = existingContacts.findIndex(
          (contact) => contact.phoneNumber === phoneNumber
        );

        // if both details exist exists in the same contact: compile data and send response
        if (indexEmail === indexNumber && indexEmail !== -1) {
          for (let i = 0; i < existingContacts.length; i++) {
            if (existingContacts[i].linkPrecedence == "PRIMARY") {
              response.contact.primaryContactId = existingContacts[i].id;
              existingContacts.email
                ? response.contact.emails.push(existingContacts[i].email)
                : null;
              existingContacts.phoneNumber
                ? response.contact.phoneNumbers.push(
                    existingContacts[i].phoneNumber
                  )
                : null;
            } else {
              response.contact.secondaryContactIds.push(existingContacts[i].id);
              existingContacts.email
                ? response.contact.emails.push(existingContacts[i].email)
                : null;
              existingContacts.phoneNumber
                ? response.contact.phoneNumbers.push(
                    existingContacts[i].phoneNumber
                  )
                : null;
            }
          }
          return res.status(201).json(response);
        }

        // if both details exists but in different contact: check for its precedence, update accordingly then compile data and send response
        if (
          indexEmail !== -1 &&
          indexNumber !== -1 &&
          indexEmail !== indexNumber
        ) {
          // sorted the contact array according to its creation date
          existingContacts.sort((a, b) => a.createdAt - b.createdAt);
          // checked and set precedence, compiled data and send response
          for (let i = 0; i < existingContacts; i++) {
            if (i === 0) {
              response.contact.primaryContactId = existingContacts[i].id;
              if (existingContacts[i].linkPrecedence !== "PRIMARY") {
                await prisma.contact.update({
                  where: {
                    id: existingContacts[i].id,
                  },
                  data: {
                    linkPrecedence: "PRIMARY",
                  },
                });
              }
            } else {
              response.contact.secondaryContactIds.push(existingContacts[i].id);
              if (existingContacts[i].linkPrecedence !== "SECONDARY") {
                await prisma.contact.update({
                  where: {
                    id: existingContacts[i].id,
                  },
                  data: {
                    linkPrecedence: "SECONDARY",
                  },
                });
              }
            }
            existingContacts[i].email
              ? response.contact.emails.push(existingContacts[i].email)
              : null;
            existingContacts[i].phoneNumber
              ? response.contact.phoneNumbers.push(
                  existingContacts[i].phoneNumber
                )
              : null;
          }
          return res.status(201).json(response);
        }

        // either email or phone exists in db, create the other one, compile data and send response
        if (indexEmail !== -1 || indexNumber !== -1) {
          // if email exists but not phone
          const newContact = await prisma.contact.create({
            data: {
              email: email,
              phoneNumber: phoneNumber,
              linkPrecedence: "SECONDARY",
            },
          });
          indexNumber === -1
            ? response.contact.phoneNumbers.push(newContact.phoneNumber)
            : null;
          indexEmail === -1
            ? response.contact.emails.push(newContact.email)
            : null;
          response.contact.secondaryContactIds.push(newContact.id);
          for (let i = 0; i < existingContacts.length; i++) {
            if (existingContacts[i].linkPrecedence === "PRIMARY") {
              response.contact.primaryContactId = existingContacts[i].id;
            } else {
              response.contact.secondaryContactIds.push(existingContacts[i].id);
            }
            existingContacts[i].email
              ? response.contact.emails.push(existingContacts[i].email)
              : null;
            existingContacts[i].phoneNumber
              ? response.contact.phoneNumbers.push(
                  existingContacts[i].phoneNumber
                )
              : null;
          }
          return res.status(201).json(response);
        }
      }
      // if either email or phone only is sent and there is a match
      if (!email || !phoneNumber) {
        for (let i = 0; i < existingContacts.length; i++) {
          if (existingContacts[i].linkPrecedence === "PRIMARY") {
            response.contact.primaryContactId = existingContacts[i].id;
          } else {
            response.contact.secondaryContactIds.push(existingContacts[i].id);
          }
          existingContacts[i].email
            ? response.contact.emails.push(existingContacts[i].email)
            : null;
          existingContacts[i].phoneNumber
            ? response.contact.phoneNumbers.push(
                existingContacts[i].phoneNumber
              )
            : null;
        }
        return res.status(201).json(response);
      }
    }
  } catch (error) {
    console.error("Error in identityController:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export default identityController;
