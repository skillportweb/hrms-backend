import { Request, Response } from "express";
import { db } from "../../db_connect/db";
import { departments } from "../../db_connect/Schema/DepartmentSchema";
import { users } from "../../db_connect/Schema/UserSchema";
import { eq } from "drizzle-orm";
import nodemailer from "nodemailer";
import { departmentChangeEmailTemplate } from "../../emails/departmentChangeEmailTemplate";

export const addDepartment = async ( req: Request,res: Response): Promise<void> => {
  try {
    console.log("Incoming request body:", req.body);

    if (!req.body) {
      res.status(400).json({ error: "Request body is missing." });
      return;
    }

    const { title, headName, description } = req.body;

    if (!title || !headName || !description) {
      res
        .status(400)
        .json({
          error: "All fields (title, headName, description) are required.",
        });
      return;
    }

    await db.insert(departments).values({
      title,
      headName,
      description,
      status: 1,
    });

    res.status(201).json({ message: "Department added successfully." });
  } catch (error: any) {
    console.error("Error adding department:", error.message || error);
    res.status(500).json({ error: "Internal server error." });
  }
};

export const getAllDepartments = async ( _req: Request,res: Response): Promise<void> => {
  try {
    const allDepartments = await db.select().from(departments);
    res.status(200).json(allDepartments);
  } catch (error) {
    console.error("Error fetching departments:", error);
    res.status(500).json({ error: "Internal server error." });
  }
};

export const updateDepartment = async (req: Request,res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { title, headName, description } = req.body;

    if (!id || isNaN(Number(id))) {
      res.status(400).json({ error: "Invalid or missing department ID." });
      return;
    }

    if (!title || !headName || !description) {
      res.status(400).json({ error: "All fields are required." });
      return;
    }

    const result = await db
      .update(departments)
      .set({ title, headName, description })
      .where(eq(departments.id, Number(id)))
      .returning(); 

    res
      .status(200)
      .json({ message: "Department updated successfully.", result });
  } catch (error) {
    console.error("Error updating department:", error);
    res.status(500).json({ error: "Internal server error." });
  }
};

export const getDepartmentById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!id || isNaN(Number(id))) {
      res.status(400).json({ error: "Invalid or missing department ID." });
      return;
    }

    const result = await db
      .select()
      .from(departments)
      .where(eq(departments.id, Number(id)));

    if (result.length === 0) {
      res.status(404).json({ error: "Department not found." });
      return;
    }

    res.status(200).json({ data: result[0] });

  } catch (error) {
    console.error("Error fetching department:", error);
    res.status(500).json({ error: "Internal server error." });
  }
};

export const getAllDepartmentsTitle = async (_req: Request, res: Response): Promise<void> => {
  try {
    const allDepartmentTitles = await db
      .select({ id: departments.id, title: departments.title })
      .from(departments);

    res.status(200).json(allDepartmentTitles);
  } catch (error) {
    console.error("Error fetching department titles:", error);
    res.status(500).json({ error: "Internal server error." });
  }
};


export const UpdateDepartmentStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body || {}; // Safe destructuring

    // Validate ID
    if (!id || isNaN(Number(id))) {
      res.status(400).json({ error: "Invalid or missing department ID." });
      return;
    }

    // Validate status
    if (status !== 0 && status !== 1) {
      res.status(400).json({ error: "Status must be 0 (inactive) or 1 (active)." });
      return;
    }

    // 1 Update department status
    const deptResult = await db
      .update(departments)
      .set({ status })
      .where(eq(departments.id, Number(id)))
      .returning();

    if (deptResult.length === 0) {
      res.status(404).json({ error: "Department not found." });
      return;
    }

    // 2 If department is deactivated (status = 0) → block all users in that department
    let userUpdateResult: any[] = [];
    if (status === 0) {
      userUpdateResult = await db
        .update(users)
        .set({ isBlocked: true })
        .where(eq(users.departmentId, Number(id)))
        .returning();
    }

    // 3 If department is activated (status = 1) → unblock all users in that department
    if (status === 1) {
      userUpdateResult = await db
        .update(users)
        .set({ isBlocked: false })
        .where(eq(users.departmentId, Number(id)))
        .returning();
    }

    res.status(200).json({
      message: `Department ${status === 1 ? "activated" : "deactivated"} successfully.`,
      department: deptResult[0],
      affectedUsers: userUpdateResult.length,
    });
  } catch (error) {
    console.error("Error updating department status:", error);
    res.status(500).json({ error: "Internal server error." });
  }
};


const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "dinesh1804200182@gmail.com",
    pass: "alrxrwgdsrixbuen",
  },
});


export const changeUserDepartment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, departmentId } = req.body;

    // Validate input
    if (!userId || isNaN(Number(userId))) {
      res.status(400).json({ error: "Invalid or missing user ID." });
      return;
    }
    if (!departmentId || isNaN(Number(departmentId))) {
      res.status(400).json({ error: "Invalid or missing department ID." });
      return;
    }

    // Check new department exists
    const newDept = await db
      .select()
      .from(departments)
      .where(eq(departments.id, Number(departmentId)));

    if (newDept.length === 0) {
      res.status(404).json({ error: "New department not found." });
      return;
    }
    const newDepartmentTitle = newDept[0].title;

    // Fetch user info with current departmentId & email
    const userRecord = await db
      .select()
      .from(users)
      .where(eq(users.id, Number(userId)));

    if (userRecord.length === 0) {
      res.status(404).json({ error: "User not found." });
      return;
    }
    const user = userRecord[0];
    const userEmail = user.email;

    if (!userEmail) {
      res.status(400).json({ error: "User email not found." });
      return;
    }

    // Fetch old department title
    const oldDeptId = user.departmentId;
    let oldDepartmentTitle = "None";

    if (oldDeptId) {
      const oldDept = await db
        .select()
        .from(departments)
        .where(eq(departments.id, oldDeptId));

      if (oldDept.length > 0) {
        oldDepartmentTitle = oldDept[0].title;
      }
    }

    // Update user's department
    const updatedUser = await db
      .update(users)
      .set({ departmentId: Number(departmentId) })
      .where(eq(users.id, Number(userId)))
      .returning();

    if (updatedUser.length === 0) {
      res.status(404).json({ error: "User not found during update." });
      return;
    }

    // Prepare email using updated template with old and new department names
    const emailText = departmentChangeEmailTemplate(user.firstname, oldDepartmentTitle, newDepartmentTitle);

    // Send email
   const mailOptions = {
  from: '"Yiron Technologies Pvt Ltd" <dinesh1804200182@gmail.com>',
  to: userEmail,
  subject: "Your Department Has Been Changed",
  html: departmentChangeEmailTemplate(user.firstname, oldDepartmentTitle, newDepartmentTitle),
};

    await transporter.sendMail(mailOptions);

    res.status(200).json({
      message: "User's department updated successfully and email sent.",
      user: updatedUser[0],
    });

  } catch (error) {
    console.error("Error changing user department or sending email:", error);
    res.status(500).json({ error: "Internal server error." });
  }
};



