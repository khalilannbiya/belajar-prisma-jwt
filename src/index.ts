import express, { NextFunction, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const app = express();
const PORT = 3000;
const prisma = new PrismaClient();

app.use(express.json());

interface UserData {
  id: string;
  name: string;
  email: string;
  address: string;
}

interface ValidationRequest extends Request {
  userData: UserData;
}

const accessValidation = (req: Request, res: Response, next: NextFunction) => {
  const validationReq = req as ValidationRequest;
  const { authorization } = validationReq.headers;

  if (!authorization) {
    return res.status(401).json({
      message: "Token diperlukan",
    });
  }

  const token: any = authorization.split(" ").at(1);
  const secret = process.env.JWT_SECRET_KEY!;

  try {
    // cek apakah token valid atau tidak
    const jwtDecode = jwt.verify(token, secret);

    if (typeof jwtDecode !== "string") {
      validationReq.userData = jwtDecode as UserData;
    }
  } catch (error) {
    return res.status(401).json({
      message: "Unauthorized",
    });
  }

  next();
};

// Register
app.post("/register", async (req, res) => {
  const { name, email, password, address } = req.body;

  const hashedPassword = await bcrypt.hash(password, 10);

  const result = await prisma.users.create({
    data: {
      name,
      email,
      password: hashedPassword,
      address,
    },
  });

  res.status(201).json({
    message: "user created",
  });
});

// login
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.users.findUnique({
      where: {
        email: email,
      },
    });

    if (!user) throw new Error("Email belum teregistrasi!");

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      throw new Error("Password Salah!");
    }

    // Kalau email dan password sesuai maka generate JWT
    // JWT Implementation
    const payload = {
      id: user.id,
      name: user.name,
      email: user.email,
      address: user.address,
    };

    // tanda seru disini memaksa typesciprt/meyakinkan bahwa data di env tersebut ada
    const secret = process.env.JWT_SECRET_KEY!;
    const expiresIn = 60 * 60 * 1;

    const token = jwt.sign(payload, secret, { expiresIn });

    res.json({
      message: "success login",
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        address: user.address,
      },
      token,
    });
  } catch (error: any) {
    res.status(404).json({
      message: error.message,
    });
  }
});

// CREATE
// app.post("/users", async (req, res, next) => {
//   const { name, email, address } = req.body;

//   const result = await prisma.users.create({
//     data: {
//       name,
//       email,
//       password,
//       address,
//     },
//   });
//   res.json({
//     message: "User created",
//     data: result,
//   });
// });

// READ All Data
app.get("/users", accessValidation, async (req, res) => {
  const allUsers = await prisma.users.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      address: true,
      created_at: true,
    },
  });
  res.json({
    message: "Users lists",
    data: allUsers,
  });
});

// Read data by id
app.get("/users/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const dataById = await prisma.users.findFirst({
      where: {
        id: Number(id),
      },
    });

    if (!dataById) throw new Error("Data Tidak ada!");

    res.json({
      status: "success",
      message: "Get Data By ID",
      data: dataById,
    });
  } catch (error: any) {
    res.status(404).json({
      status: "error",
      message: error.message,
    });
  }
});

// UPDATE
app.put("/users/:id", async (req, res) => {
  const { id } = req.params;
  const { name, email, address } = req.body;
  const user = await prisma.users.update({
    where: { id: Number(id) },
    data: { name, email, address },
  });
  res.json({
    message: `User ${id} updated`,
    data: user,
  });
});

// DELETE
app.delete("/users/:id", async (req, res) => {
  const { id } = req.params;
  const user = await prisma.users.delete({
    where: { id: Number(id) },
  });
  res.json({
    message: `User ${id} deleted`,
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port: http://localhost:${PORT}`);
});
