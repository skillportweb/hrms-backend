import { Request, Response } from "express";
import { or, eq, desc } from "drizzle-orm";
import { userleave, } from "../../db_connect/Schema/UserLeaveSchema";
import { db } from "../../db_connect/db";
import { userLeaveRequests } from "../../db_connect/Schema/UserLeaveReqSchama";
import { users } from "../../db_connect/Schema/UserSchema";


export const yearlyLeaving = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = Number(req.params.userId); 

    const {
      totalLeaves,
      usedLeaves,
      remainingLeaves,
      casualLeave,
      sickLeave,
      paidLeave,
      optionalLeave,
    } = req.body;

    if (
      isNaN(userId) ||
      totalLeaves == null ||
      usedLeaves == null ||
      remainingLeaves == null ||
      casualLeave == null ||
      sickLeave == null ||
      paidLeave == null ||
      optionalLeave == null
    ) {
      res.status(400).json({ error: "All fields are required and userId must be a number." });
      return;
    }

    const existing = await db
      .select()
      .from(userleave)
      .where(eq(userleave.userId, userId)); 

    if (existing.length > 0) {
      await db
        .update(userleave)
        .set({
          totalLeaves,
          usedLeaves,
          remainingLeaves,
          casualLeave,
          sickLeave,
          paidLeave,
          optionalLeave,
        })
        .where(eq(userleave.userId, userId));

      res.status(200).json({ message: "Leave record updated successfully." });
    } else {
      await db.insert(userleave).values({
        userId,
        totalLeaves,
        usedLeaves,
        remainingLeaves,
        casualLeave,
        sickLeave,
        paidLeave,
        optionalLeave,
      });

      res.status(201).json({ message: "Leave record created successfully." });
    }
  } catch (error) {
    console.error("Leave assignment failed:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getUserLeaveBalance = async (req: Request, res: Response): Promise<void> => {
try {
const userId = Number(req.params.userId);

if (isNaN(userId)) {
res.status(400).json({ error: "Invalid userId" });
return;
}

const result = await db
.select({
totalLeaves: userleave.totalLeaves,
usedLeaves: userleave.usedLeaves,
remainingLeaves: userleave.remainingLeaves,
casualLeave: userleave.casualLeave,
sickLeave: userleave.sickLeave,
paidLeave: userleave.paidLeave,
optionalLeave: userleave.optionalLeave,
})
.from(userleave)
.where(eq(userleave.userId, userId));

if (result.length === 0) {
res.status(404).json({ error: "Leave record not found for this user." });
return;
}

res.status(200).json({ leaveBalance: result[0] });
} catch (error) {
console.error("Error fetching leave balance:", error);
res.status(500).json({ error: "Internal Server Error" });
}
};

export const applyLeave = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = Number(req.params.userId);
    const { leaveType, startDate, endDate, message } = req.body;

    const allowedLeaveTypes = ["casualLeave", "sickLeave", "paidLeave", "optionalLeave"] as const;
    type LeaveType = (typeof allowedLeaveTypes)[number];

    // Validation
    if (
      isNaN(userId) ||
      !leaveType ||
      !startDate ||
      !endDate ||
      !message ||
      !allowedLeaveTypes.includes(leaveType as LeaveType)
    ) {
      res.status(400).json({ error: "Invalid input. All fields are required and must be valid." });
      return;
    }

    // Insert leave request
    await db.insert(userLeaveRequests).values({
      userId,
      leaveType,
      startDate,
      endDate,
      message,
      status: "pending", // default, but explicitly set for clarity
    });

    res.status(201).json({ message: "Leave request submitted successfully." });
  } catch (error) {
    console.error("Error applying for leave:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

function calculateDays(start: string, end: string): number {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const timeDiff = endDate.getTime() - startDate.getTime();
  return Math.floor(timeDiff / (1000 * 60 * 60 * 24)) + 1;
}

export const updateLeaveStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const leaveId = Number(req.params.id);
    const { status } = req.body;

    const allowedStatuses = ["approved", "rejected"] as const;
    type StatusType = (typeof allowedStatuses)[number];

    if (isNaN(leaveId) || !status || !allowedStatuses.includes(status as StatusType)) {
      res.status(400).json({ error: "Invalid leave ID or status." });
      return;
    }

    // Fetch leave request
    const leaveReq = await db
      .select()
      .from(userLeaveRequests)
      .where(eq(userLeaveRequests.id, leaveId));

    if (leaveReq.length === 0) {
      res.status(404).json({ error: "Leave request not found." });
      return;
    }

    const { userId, leaveType, startDate, endDate } = leaveReq[0];

    if (status === "approved") {
      const days = calculateDays(startDate.toString(), endDate.toString());

      const userLeaveData = await db
        .select()
        .from(userleave)
        .where(eq(userleave.userId, userId));

      if (userLeaveData.length === 0) {
        res.status(404).json({ error: "User leave balance not found." });
        return;
      }

      const userData = userLeaveData[0];
      const leaveKey = leaveType as keyof typeof userData;

      if (userData[leaveKey] < days) {
        res.status(400).json({ error: `Not enough ${leaveType} available.` });
        return;
      }

      const updatedLeaveBalance = {
        usedLeaves: userData.usedLeaves + days,
        remainingLeaves: userData.remainingLeaves - days,
        [leaveKey]: userData[leaveKey] - days,
      };

      await db
        .update(userleave)
        .set(updatedLeaveBalance)
        .where(eq(userleave.userId, userId));
    }

    // Update the leave request status (approved or rejected)
    await db
      .update(userLeaveRequests)
      .set({ status })
      .where(eq(userLeaveRequests.id, leaveId));

    res.status(200).json({ message: `Leave request ${status} successfully.` });
  } catch (error) {
    console.error("Error updating leave status:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getAllLeaveRequestsWithUserInfo = async (req: Request, res: Response): Promise<void> => {
  try {
    const results = await db
      .select({
        leaveId: userLeaveRequests.id,
        leaveType: userLeaveRequests.leaveType,
        startDate: userLeaveRequests.startDate,
        endDate: userLeaveRequests.endDate,
        message: userLeaveRequests.message,
        status: userLeaveRequests.status,
        userId: userLeaveRequests.userId,

        firstName: users.firstname,
        lastName: users.lastname,
        designation: users.designation,
      })
      .from(userLeaveRequests)
      .innerJoin(users, eq(userLeaveRequests.userId, users.id));

    // Combine firstName + lastName manually in JS
    const leaveRequests = results.map((item) => ({
      leaveId: item.leaveId,
      leaveType: item.leaveType,
      startDate: item.startDate,
      endDate: item.endDate,
      message: item.message,
      status: item.status,
      name: `${item.firstName} ${item.lastName}`,
      designation: item.designation,
      userId: item.userId,
      
    }));

    res.status(200).json({ leaveRequests });
  } catch (error) {
    console.error("Error fetching leave requests with user info:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getUserapplyLeaves = async (req: Request, res: Response): Promise<void> => {
  const { userId } = req.params;

  const parsedUserId = Number(userId);
  if (isNaN(parsedUserId)) {
    res.status(400).json({ error: "Invalid user ID" });
    return;
  }

  try {
    const results = await db
      .select({
        leaveId: userLeaveRequests.id,
        leaveType: userLeaveRequests.leaveType,
        startDate: userLeaveRequests.startDate,
        endDate: userLeaveRequests.endDate,
        message: userLeaveRequests.message,
        status: userLeaveRequests.status,
        userId: userLeaveRequests.userId,

        firstName: users.firstname,
        lastName: users.lastname,
        designation: users.designation,
      })
      .from(userLeaveRequests)
      .innerJoin(users, eq(userLeaveRequests.userId, users.id))
      .where(eq(userLeaveRequests.userId, parsedUserId)); // use parsedUserId here

    const userLeaveRequestsList = results.map((item) => {
      const start = new Date(item.startDate);
      const end = new Date(item.endDate);
      const days = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

      return {
        leaveId: item.leaveId,
        leaveType: item.leaveType,
        startDate: item.startDate,
        endDate: item.endDate,
        message: item.message,
        status: item.status,
        name: `${item.firstName} ${item.lastName}`,
        designation: item.designation,
        userId: item.userId,
        days: days,
      };
    });

    res.status(200).json({ userLeaveRequests: userLeaveRequestsList });
  } catch (error) {
    console.error("Error fetching user leave requests:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getPendingLeaveRequests = async (req: Request, res: Response): Promise<void> => {
  try {
    const results = await db
      .select({
        leaveId: userLeaveRequests.id,
        leaveType: userLeaveRequests.leaveType,
        startDate: userLeaveRequests.startDate,
        endDate: userLeaveRequests.endDate,
        message: userLeaveRequests.message,
        status: userLeaveRequests.status,
        userId: userLeaveRequests.userId,
        firstName: users.firstname,
        lastName: users.lastname,
        designation: users.designation,
      })
      .from(userLeaveRequests)
      .innerJoin(users, eq(userLeaveRequests.userId, users.id))
      .where(eq(userLeaveRequests.status, "pending"));

    const leaveRequests = results.map((item) => ({
      leaveId: item.leaveId,
      leaveType: item.leaveType,
      startDate: item.startDate,
      endDate: item.endDate,
      message: item.message,
      status: item.status,
      name: `${item.firstName} ${item.lastName}`,
      designation: item.designation,
      userId: item.userId,
    }));

    res.status(200).json({ leaveRequests });
  } catch (error) {
    console.error("Error fetching pending leave requests:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getApprovedAndRejectedLeaveRequests = async (req: Request, res: Response): Promise<void> => {
  try {
    const results = await db
      .select({
        leaveId: userLeaveRequests.id,
        leaveType: userLeaveRequests.leaveType,
        startDate: userLeaveRequests.startDate,
        endDate: userLeaveRequests.endDate,
        message: userLeaveRequests.message,
        status: userLeaveRequests.status,
        userId: userLeaveRequests.userId,
        firstName: users.firstname,
        lastName: users.lastname,
        designation: users.designation,
      })
      .from(userLeaveRequests)
      .innerJoin(users, eq(userLeaveRequests.userId, users.id))
      .where(
        or(
          eq(userLeaveRequests.status, "approved"),
          eq(userLeaveRequests.status, "rejected")
        )
      )
      .orderBy(desc(userLeaveRequests.startDate));

    const leaveRequests = results.map((item) => ({
      leaveId: item.leaveId,
      leaveType: item.leaveType,
      startDate: item.startDate,
      endDate: item.endDate,
      message: item.message,
      status: item.status,
      name: `${item.firstName} ${item.lastName}`,
      designation: item.designation,
      userId: item.userId,
    }));

    res.status(200).json({ leaveRequests });
  } catch (error) {
    console.error("Error fetching approved/rejected leave requests:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getSingleLeaveRequestById = async (req: Request, res: Response): Promise<void> => {
  try {
    const leaveId = Number(req.params.id);

    if (isNaN(leaveId)) {
      res.status(400).json({ error: "Invalid leave ID." });
      return;
    }

    const result = await db
      .select({
        leaveId: userLeaveRequests.id,
        leaveType: userLeaveRequests.leaveType,
        startDate: userLeaveRequests.startDate,
        endDate: userLeaveRequests.endDate,
        message: userLeaveRequests.message,
        status: userLeaveRequests.status,
        userId: userLeaveRequests.userId,

        firstName: users.firstname,
        lastName: users.lastname,
        designation: users.designation,
      })
      .from(userLeaveRequests)
      .innerJoin(users, eq(userLeaveRequests.userId, users.id))
      .where(eq(userLeaveRequests.id, leaveId));

    if (result.length === 0) {
      res.status(404).json({ error: "Leave request not found." });
      return;
    }

    const item = result[0];
    const leaveRequest = {
      leaveId: item.leaveId,
      leaveType: item.leaveType,
      startDate: item.startDate,
      endDate: item.endDate,
      message: item.message,
      status: item.status,
      name: `${item.firstName} ${item.lastName}`,
      designation: item.designation,
      userId: item.userId,
    };

    res.status(200).json({ leaveRequest });
  } catch (error) {
    console.error("Error fetching leave request:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getLeaveRequestSummary = async (req: Request, res: Response): Promise<void> => {
  try {
    // Fetch all leave requests
    const allRequests = await db.select().from(userLeaveRequests);

    // Count by status
    const newRequests = allRequests.filter(req => req.status === "pending").length;
    const approvedRequests = allRequests.filter(req => req.status === "approved").length;
    const rejectedRequests = allRequests.filter(req => req.status === "rejected").length;
    const totalRequests = allRequests.length;

    res.status(200).json({
      newRequests,
      approvedRequests,
      rejectedRequests,
      totalRequests,
    });
  } catch (error) {
    console.error("Error fetching leave request summary:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};