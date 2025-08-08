// controllers/departmentMemberController.ts
import { Request, Response } from "express";
import { db } from "../../db_connect/db";
import { users } from "../../db_connect/Schema/UserSchema";
import { departments } from "../../db_connect/Schema/DepartmentSchema";
import { eq, inArray } from "drizzle-orm";
import nodemailer from "nodemailer";
import { updateMemberTemplate } from "../../emails/updateMemberTemplate";

// --- Email Transporter ---
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "dinesh1804200182@gmail.com",
    pass: "alrxrwgdsrixbuen", // 🔐 Use environment variables in production!
  },
});

// --- Send Email Function ---
const sendEmail = async (to: string, subject: string, html: string) => {
  try {
    await transporter.sendMail({
      from: '"Admin" <dinesh1804200182@gmail.com>',
      to,
      subject,
      html,
    });
  } catch (err) {
    console.error(`❌ Failed to send email to ${to}:`, err);
  }
};

// --- Email HTML Template ---
// --- Email HTML Template ---
// const updateMemberTemplate = (
//   username: string,
//   deptName: string,
//   action: "added" | "removed"
// ) => {
//   return `
//     <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6; max-width: 600px; margin: auto; border: 1px solid #e0e0e0; padding: 20px; border-radius: 8px;">
//       <h2 style="color: #2c3e50;">Hello ${username || "User"},</h2>
//       <p>You have been <strong>${action}</strong> ${
//         action === "added" ? "to" : "from"
//       } the department: <strong>${deptName}</strong>.</p>
//       <p>If you have any questions regarding this change, feel free to reach out to your administrator.</p>
//       <br/>
//       <p>Best regards,<br/>
//       <strong>Yiron Technologies Pvt Ltd</strong><br/>
//       Team Management System</p>
//     </div>
//   `;
// };


// --- Main Function ---
export const addDepartmentMembers = async (req: Request, res: Response): Promise<void> => {
  try {
    const { departmentId, userIds, removedUserIds } = req.body;

    if (!departmentId || !Array.isArray(userIds) || !Array.isArray(removedUserIds)) {
      res.status(400).json({ success: false, message: "Invalid input data" });
      return;
    }

    // 🔎 Get department title
    const department = await db
      .select()
      .from(departments)
      .where(eq(departments.id, departmentId));

    const departmentName = department[0]?.title || "Unknown Department";

    // ➕ Handle additions
    if (userIds.length > 0) {
      await db.update(users).set({ departmentId }).where(inArray(users.id, userIds));
      const addedUsers = await db.select().from(users).where(inArray(users.id, userIds));

      for (const user of addedUsers) {
        if (user.email) {
          const html = updateMemberTemplate(user.firstname ?? "User", departmentName, "added");
          await sendEmail(user.email, "You've been added to a department", html);
        }
      }
    }

    // ➖ Handle removals
    if (removedUserIds.length > 0) {
      await db.update(users).set({ departmentId: null }).where(inArray(users.id, removedUserIds));
      const removedUsers = await db.select().from(users).where(inArray(users.id, removedUserIds));

      for (const user of removedUsers) {
        if (user.email) {
          const html = updateMemberTemplate(user.firstname ?? "User", departmentName, "removed");
          await sendEmail(user.email, "You've been removed from a department", html);
        }
      }
    }

    res.status(200).json({ success: true, message: "Department members updated and emails sent." });
  } catch (error) {
    console.error("Error updating department members:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};


export const getUsersByDepartment = async (req: Request, res: Response): Promise<void> => {
  try {
    const departmentId = parseInt(req.params.id, 10);

    if (isNaN(departmentId)) {
      res.status(400).json({ success: false, message: "Invalid department ID" });
      return;
    }

    const result = await db
      .select({ id: users.id, firstname: users.firstname }) 
      .from(users)
      .where(eq(users.departmentId, departmentId));

    res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error("Error fetching users by department:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};