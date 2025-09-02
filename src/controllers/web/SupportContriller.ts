import { Request, Response } from "express";
import { supportRequests } from "../../db_connect/Schema/SupportSchema";
import { db } from "../../db_connect/db";
import { and, eq } from "drizzle-orm";

export const createSupportRequest = async (req: Request,res: Response): Promise<void> => {
  try {
    const {
      userId,
      employeeName,
      department,
      employeeEmail,
      title,
      priority,
      category,
      description,
    } = req.body;

    // validate required fields
    if (
      !userId ||
      !employeeName ||
      !department ||
      !employeeEmail ||
      !title ||
      !category ||
      !description
    ) {
      res.status(400).json({ message: "All required fields must be filled." });
      return;
    }

    const newRequest = await db
      .insert(supportRequests)
      .values({
        userId: parseInt(userId),
        employeeName,
        departmentId: parseInt(department),
        employeeEmail,
        title,
        priority: priority || "Medium",
        category,
        description,
      })
      .returning();

    res.status(201).json({
      message: "Support request created successfully",
      data: newRequest[0],
    });
  } catch (error) {
    console.error("Error creating support request:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

export const getSupportRequests = async (req: Request, res: Response): Promise<void> => {
  try {
    const requests = await db.select().from(supportRequests);

    res.status(200).json({
      success: true,
      data: requests, 
    });
  } catch (error) {
    console.error("Error fetching support requests:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
      error: error instanceof Error ? error.message : error,
    });
  }
};

export const getSupportRequestDetailsById = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = Number(req.params.id);

    if (isNaN(id)) {
      res.status(400).json({ error: "Invalid request ID." });
      return;
    }

    const result = await db
      .select()
      .from(supportRequests)
      .where(eq(supportRequests.id, id));

    if (result.length === 0) {
      res.status(404).json({ error: "Support request not found." });
      return;
    }

    // Wrap the result in a `data` object
    res.status(200).json({ data: result[0] });
  } catch (error) {
    console.error("Error fetching support request by ID:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

// Get all pending requests for a user (status = 0)
export const getPendingRequestsByUserId = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = Number(req.params.userId);

    if (isNaN(userId)) {
      res.status(400).json({ error: "Invalid user ID." });
      return;
    }

    const pendingRequests = await db
      .select()
      .from(supportRequests)
      .where(and(eq(supportRequests.userId, userId), eq(supportRequests.status, "0")));

    res.status(200).json({
      success: true,
      data: pendingRequests,
    });
  } catch (error) {
    console.error("Error fetching pending requests:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

// Get all solved requests for a user (status = 1)
export const getSolvedRequestsByUserId = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = Number(req.params.userId);

    if (isNaN(userId)) {
      res.status(400).json({ error: "Invalid user ID." });
      return;
    }

    const solvedRequests = await db
      .select()
      .from(supportRequests)
      .where(and(eq(supportRequests.userId, userId), eq(supportRequests.status, "1")));

    res.status(200).json({
      success: true,
      data: solvedRequests,
    });
  } catch (error) {
    console.error("Error fetching solved requests:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

export const getSupportRequestsCount = async (req: Request, res: Response): Promise<void> => {
  try {
    // Total requests
    const totalCount = await db.select().from(supportRequests);

    // Pending requests (status = "0")
    const pendingCount = await db
      .select()
      .from(supportRequests)
      .where(eq(supportRequests.status, "0"));

    // Solved requests (status = "1")
    const solvedCount = await db
      .select()
      .from(supportRequests)
      .where(eq(supportRequests.status, "1"));

    res.status(200).json({
      totalRequests: totalCount.length,
      pendingRequests: pendingCount.length,
      solvedRequests: solvedCount.length,
    });
  } catch (error) {
    console.error("Error fetching request counts:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

// Solve a support request (mark as solved + add resolution notes)
export const solveSupportRequest = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = Number(req.params.id);
    const { resolutionNotes } = req.body;

    if (isNaN(id)) {
      res.status(400).json({ error: "Invalid request ID." });
      return;
    }

    const updatedRequest = await db
      .update(supportRequests)
      .set({
        status: "1", //  mark as solved
        resolutionNotes: resolutionNotes || null, //save notes if provided
      })
      .where(eq(supportRequests.id, id))
      .returning();

    if (updatedRequest.length === 0) {
      res.status(404).json({ error: "Support request not found." });
      return;
    }

    res.status(200).json({
      message: "Support request marked as solved",
      data: updatedRequest[0],
    });
  } catch (error) {
    console.error("Error solving support request:", error);
    res.status(500).json({ message: "Server error", error });
  }
};
