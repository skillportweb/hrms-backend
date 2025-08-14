import { Request, Response } from "express";
import { db } from "../../db_connect/db";
import { users } from "../../db_connect/Schema/UserSchema";
import { payrolls } from "../../db_connect/Schema/PayrollSchema";
import { eq } from "drizzle-orm";

export const updateUserPromotion = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = Number(req.params.id);
    if (!userId) {
      res.status(400).json({ error: "User ID is required in the URL." });
      return;
    }

    const { newDesignation, currentPayroll, promotedPayroll, promotionDate, notes } = req.body;

    if (!newDesignation || !promotionDate || !currentPayroll || !promotedPayroll) {
      res.status(400).json({
        error: "newDesignation, currentPayroll, promotedPayroll, and promotionDate are required.",
      });
      return;
    }

    // Check if user exists
    const existingUser = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    if (existingUser.length === 0) {
      res.status(404).json({ error: "User not found." });
      return;
    }

    // Insert into payrolls table (log the promotion event)
    await db.insert(payrolls).values({
      userId,
      newDesignation,
      currentPayroll,
      promotedPayroll,
      promotionDate,
      notes: notes || "",
    });

    // Update user's designation, current payroll (to new promoted payroll), and promotion date
    await db
      .update(users)
      .set({
        designation: newDesignation,
        currentPayroll: promotedPayroll, // promoted payroll becomes new current payroll
        promotionDate: promotionDate,
      })
      .where(eq(users.id, userId));

    res.status(200).json({
      message: "User promotion updated in users table and logged in payrolls table.",
    });
  } catch (error: any) {
    console.error("Error updating user promotion:", error.message || error);
    res.status(500).json({ error: "Internal server error." });
  }
};

export const getPromotionsByUserId = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = Number(req.params.id);

    if (!userId) {
      res.status(400).json({ error: "User ID is required in the URL." });
      return;
    }

    const promotions = await db
      .select()
      .from(payrolls)
      .where(eq(payrolls.userId, userId))
      .orderBy(payrolls.promotionDate); // oldest first

    res.status(200).json({
      data: promotions, //  Wrapped inside "data"
    });
  } catch (error: any) {
    console.error("Error fetching promotions:", error.message || error);
    res.status(500).json({ error: "Internal server error." });
  }
};
