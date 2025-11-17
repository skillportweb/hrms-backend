import { Request, Response } from "express";
import { db } from "../../db_connect/db";
import { eq, isNull } from "drizzle-orm";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import { getRegistrationEmailTemplate } from "../../emails/registrationEmailTemplate";
import { getAccountApprovedEmailTemplate } from "../../emails/accountApprovedEmailTemplate";
import { AuthRequest } from "../../middleware/authMiddleware";
import { users } from "./../../db_connect/Schema/UserSchema";
import { departments } from "../../db_connect/Schema/DepartmentSchema";

const blacklistedTokens = new Set<string>();
export { blacklistedTokens };

const JWT_SECRET = "your_jwt_secret_key";

// export const usersRegistration = async (
//   req: Request,
//   res: Response
// ): Promise<void> => {
//   try {
//     const {
//       firstname,
//       lastname,
//       email,
//       phone,
//       password,
//       dob,
//       role,
//       designation,
//     } = req.body;

//     if (
//       !firstname ||
//       !lastname ||
//       !email ||
//       !phone ||
//       !password ||
//       !dob ||
//       !designation
//     ) {
//       res.status(400).json({ message: "All fields are required" });
//       return;
//     }

//     const existingUser = await db
//       .select()
//       .from(users)
//       .where(eq(users.email, email));
//     if (existingUser.length > 0) {
//       res.status(400).json({ message: "Email already registered" });
//       return;
//     }

//     const hashedPassword = await bcrypt.hash(password, 10);

//     await db.insert(users).values({
//       firstname,
//       lastname,
//       email,
//       phone,
//       password: hashedPassword,
//       dob,
//       designation,
//       role: typeof role === "number" ? role : 0,
//     });

//     const transporter = nodemailer.createTransport({
//       service: "gmail",
//       auth: {
//         user: "dinesh1804200182@gmail.com",
//         pass: "alrxrwgdsrixbuen",
//       },
//     });

//     const mailOptions = {
//       from: '"HRMS System" <admin@example.com>',
//       to: "dinesh1804200182@gmail.com",
//       subject: "New Employee Registration - Approval Required",
//       html: getRegistrationEmailTemplate(
//         firstname,
//         lastname,
//         email,
//         designation
//       ),
//     };

//     await transporter.sendMail(mailOptions);

//     res
//       .status(201)
//       .json({ message: "User registered and email sent successfully" });
//   } catch (error) {
//     console.error("Registration error:", error);
//     res.status(500).json({ message: "Internal server error" });
//   }
// };

export const usersRegistration = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {
      firstname,
      lastname,
      email,
      phone,
      password,
      dob,
      role,
      designation,
    } = req.body;

    if (
      !firstname ||
      !lastname ||
      !email ||
      !phone ||
      !password ||
      !dob ||
      !designation
    ) {
      res.status(400).json({ message: "All fields are required" });
      return;
    }

    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email));

    if (existingUser.length > 0) {
      res.status(400).json({ message: "Email already registered" });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const insertedUser = await db
      .insert(users)
      .values({
        firstname,
        lastname,
        email,
        phone,
        password: hashedPassword,
        dob,
        designation,
        role: typeof role === "number" ? role : 0,
      })
      .returning({ id: users.id });

    const userId = insertedUser[0]?.id;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "dinesh1804200182@gmail.com",
        pass: "alrxrwgdsrixbuen",
      },
    });

    const mailOptions = {
      from: '"HRMS System" <admin@example.com>',
      to: "dinesh1804200182@gmail.com",
      subject: "New Employee Registration - Approval Required",
      html: getRegistrationEmailTemplate(
        firstname,
        lastname,
        email,
        designation
      ),
    };

    await transporter.sendMail(mailOptions);

    res.status(201).json({
      message: "User registered and email sent successfully",
      userId,
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const loginUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ message: "Email and password are required." });
      return;
    }

    const userResult = await db
      .select()
      .from(users)
      .where(eq(users.email, email));
    if (userResult.length === 0) {
      res.status(401).json({ message: "Invalid email or password." });
      return;
    }

    const storedUser = userResult[0];

    if (!storedUser.password) {
      res.status(500).json({ message: "Password not found for this user." });
      return;
    }

    if (storedUser.isBlocked) {
      res
        .status(403)
        .json({ message: "Access denied. Please contact the administrator." });
      return;
    }

    if (storedUser.role !== 1 && !storedUser.approved) {
      res.status(403).json({ message: "Your account is not approved yet." });
      return;
    }

    const isMatch = await bcrypt.compare(password, storedUser.password);
    if (!isMatch) {
      res.status(401).json({ message: "Invalid email or password." });
      return;
    }

    const roleMessage =
      storedUser.role === 1
        ? "Admin login successful"
        : "User login successful";

    const token = jwt.sign(
      { id: storedUser.id, email: storedUser.email, role: storedUser.role },
      JWT_SECRET,
      { expiresIn: "1d" }
    );

    const { password: _, ...userWithoutPassword } = storedUser;

    res.status(200).json({
      message: roleMessage,
      token,
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

// export const approveUser = async (req: Request, res: Response): Promise<void> => {
//   try {
//     const userId = Number(req.params.userId);
//     const { status } = req.body;

//     const allowedStatuses = ["approved", "blocked", "unblocked"] as const;
//     type StatusType = (typeof allowedStatuses)[number];

//     if (isNaN(userId) || !allowedStatuses.includes(status as StatusType)) {
//       res.status(400).json({ message: "Invalid user ID or status." });
//       return;
//     }

//     const result = await db.select().from(users).where(eq(users.id, userId));
//     const user = result[0];

//     if (!user) {
//       res.status(404).json({ message: "User not found." });
//       return;
//     }

//     // Already in desired state
//     if (
//       (status === "approved" && user.approved) ||
//       (status === "blocked" && user.isBlocked) ||
//       (status === "unblocked" && !user.isBlocked)
//     ) {
//       res.status(400).json({ message: `User is already ${status}.` });
//       return;
//     }

//     // Prepare update payload
//     const updateData: any = {};
//     if (status === "approved") {
//       updateData.approved = true;
//     } else {
//       updateData.isBlocked = status === "blocked";
//     }

//     // Update user record
//     await db.update(users).set(updateData).where(eq(users.id, userId));

//     // Only send email when approved
//     if (status === "approved") {
//       const transporter = nodemailer.createTransport({
//         service: "gmail",
//         auth: {
//           user: process.env.GMAIL_USER || "dinesh1804200182@gmail.com",
//           pass: process.env.GMAIL_PASS || "alrxrwgdsrixbuen",
//         },
//       });

//       await transporter.sendMail({
//         from: `"HRMS Admin" <admin@example.com>`,
//         to: user.email,
//         subject: "Your Account Has Been Approved",
//         html: getAccountApprovedEmailTemplate(user.firstname),
//       });
//     }

//     res.status(200).json({ message: `User ${status} successfully.` });

//   } catch (error) {
//     console.error("Update user status error:", error);
//     res.status(500).json({ message: "Internal server error." });
//   }
// };

export const approveUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = Number(req.params.userId);
    const { status } = req.body;

    const allowedStatuses = ["approved", "blocked", "unblocked"] as const;
    type StatusType = (typeof allowedStatuses)[number];

    if (isNaN(userId) || !allowedStatuses.includes(status as StatusType)) {
      res.status(400).json({ message: "Invalid user ID or status." });
      return;
    }

    // Get user data
    const result = await db.select().from(users).where(eq(users.id, userId));
    const user = result[0];

    if (!user) {
      res.status(404).json({ message: "User not found." });
      return;
    }

    //  Check department status before unblocking
    //  Check department status before unblocking
    //  Check department status before unblocking
    if (status === "unblocked") {
      if (user.departmentId) {
        // User has a department, check its status
        const deptResult = await db
          .select({ status: departments.status })
          .from(departments)
          .where(eq(departments.id, user.departmentId));

        if (deptResult.length === 0) {
          res.status(404).json({ message: "User's department not found." });
          return;
        }

        if (deptResult[0].status === 0) {
          res
            .status(400)
            .json({ message: "Cannot unblock user. Department is inactive." });
          return;
        }
      }
      // If departmentId is null → allow unblocking
    }

    // Already in desired state
    if (
      (status === "approved" && user.approved) ||
      (status === "blocked" && user.isBlocked) ||
      (status === "unblocked" && !user.isBlocked)
    ) {
      res.status(400).json({ message: `User is already ${status}.` });
      return;
    }

    // Prepare update payload
    const updateData: any = {};
    if (status === "approved") {
      updateData.approved = true;
    } else {
      updateData.isBlocked = status === "blocked";
    }

    // Update user record
    await db.update(users).set(updateData).where(eq(users.id, userId));

    // Send email only when approved
    if (status === "approved") {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.GMAIL_USER || "dinesh1804200182@gmail.com",
          pass: process.env.GMAIL_PASS || "alrxrwgdsrixbuen",
        },
      });

      await transporter.sendMail({
        from: `"HRMS Admin" <admin@example.com>`,
        to: user.email,
        subject: "Your Account Has Been Approved",
        html: getAccountApprovedEmailTemplate(user.firstname),
      });
    }

    res.status(200).json({ message: `User ${status} successfully.` });
  } catch (error) {
    console.error("Update user status error:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

export const getAllUsers = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = (req as any).user?.id;
    const userRole = (req as any).user?.role;

    if (userRole !== 1) {
      res.status(403).json({ message: "Access denied. Admins only." });
      return;
    }

    // JOIN users with departments
    const allUsers = await db
      .select({
        id: users.id,
        firstname: users.firstname,
        lastname: users.lastname,
        email: users.email,
        phone: users.phone,
        dob: users.dob,
        designation: users.designation,
        isBlocked: users.isBlocked,
        approved: users.approved,
        departmentId: users.departmentId,
        departmentName: departments.title,
        currentPayroll: users.currentPayroll,
        promotionDate: users.promotionDate,
      })
      .from(users)
      .leftJoin(departments, eq(users.departmentId, departments.id));

    const filteredUsers = allUsers.filter((user) => user.id !== userId);

    res.status(200).json({
      message: "Admin fetched data successfully",
      users: filteredUsers,
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getUserProfile = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    // Fetch user with department name
    const result = await db
      .select({
        id: users.id,
        firstname: users.firstname,
        lastname: users.lastname,
        email: users.email,
        phone: users.phone,
        dob: users.dob,
        role: users.role,
        designation: users.designation,
        approved: users.approved,
        isBlocked: users.isBlocked,
        currentPayroll: users.currentPayroll,
        promotionDate: users.promotionDate,
        departmentId: users.departmentId,
        departmentName: departments.title,
      })
      .from(users)
      .leftJoin(departments, eq(users.departmentId, departments.id))
      .where(eq(users.id, userId));

    const user = result[0];

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.status(200).json({
      message: "User profile fetched successfully",
      user,
    });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const logoutUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      res.status(400).json({ message: "Unauthorized" });
      return;
    }

    blacklistedTokens.add(token);
    res.status(200).json({ message: "User logged out successfully" });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// export const getAllUserNamesWithId = async (req: Request, res: Response): Promise<void> => {
//   try {
//     const userList = await db.select({
//       id: users.id,
//       firstname: users.firstname,
//     }).from(users);

//     res.status(200).json({ data: userList });
//   } catch (error) {
//     console.error('Error fetching user names:', error);
//     res.status(500).json({ message: 'Internal server error' });
//   }
// };

export const getAllUserNamesWithId = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userList = await db
      .select({
        id: users.id,
        firstname: users.firstname,
      })
      .from(users)
      .where(isNull(users.departmentId)); //  Correct syntax

    res.status(200).json({ data: userList });
  } catch (error) {
    console.error("Error fetching user names:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getUsersByDepartmentId = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { departmentId } = req.params;

    if (!departmentId) {
      res.status(400).json({ message: "Department ID is required" });
      return;
    }

    const userList = await db
      .select()
      .from(users)
      .where(eq(users.departmentId, Number(departmentId)));

    res.status(200).json({ data: userList });
  } catch (error) {
    console.error("Error fetching users by departmentId:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
