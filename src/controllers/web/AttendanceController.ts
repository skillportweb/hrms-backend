import { Request, Response } from "express";
import { db } from "../../db_connect/db";
import { userAttendance } from "../../db_connect/Schema/AttendanceSchema";
import { and, eq } from "drizzle-orm";
import { missPunchRequests } from "../../db_connect/Schema/MissPunchRequests";

// Haversine formula to check allowed location
function getDistanceFromLatLonInMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3;
  const toRad = (deg: number) => deg * (Math.PI / 180);
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

const allowedLat = 28.6018;
const allowedLon = 77.3895;
const allowedRadius = 100; 


export const addUserAttendance = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      userId,
      date,
      dayName,
      punchIn,
      punchInDate,
      punchInLocation,
      latitude,
      longitude,
      status
    } = req.body;

    console.log("Received Body:", req.body);
    console.log("User ID:", userId);

    if (!userId || !date || !dayName || latitude == null || longitude == null) {
      res.status(400).json({ error: "Missing required fields including location." });
      return;
    }

    // Check if user already punched in for the date
    const [existing] = await db
      .select()
      .from(userAttendance)
      .where(and(eq(userAttendance.userId, userId), eq(userAttendance.date, date)));

    if (existing) {
      res.status(409).json({ error: "User has already punched in for this date." });
      return;
    }

    const distance = getDistanceFromLatLonInMeters(latitude, longitude, allowedLat, allowedLon);

    if (distance > allowedRadius) {
      res.status(403).json({
        error: "403 - You are not at the allowed location. Please go to the office to punch in."
      });
      return;
    }

    await db.insert(userAttendance).values({
      userId,
      date,
      dayName,
      punchIn,
      punchInDate: new Date(punchInDate),
      punchInLocation,
      punchInLatitude: String(latitude),
      punchInLongitude: String(longitude),
      status: status || "Present"
    });

    res.status(201).json({ message: "Punch In recorded successfully." });

  } catch (error) {
    console.error("Punch In Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const punchOutAttendance = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      userId,
      date,
      punchOut,
      punchOutDate,
      punchOutLocation,
      latitude,
      longitude
    } = req.body;

    if (!userId || !date || !punchOut || !punchOutDate || !punchOutLocation || latitude == null || longitude == null) {
      res.status(400).json({ error: "Missing required fields for punch-out." });
      return;
    }

    const distance = getDistanceFromLatLonInMeters(latitude, longitude, allowedLat, allowedLon);

    if (distance > allowedRadius) {
      res.status(403).json({ error: "You are not within the allowed location to Punch Out." });
      return;
    }

    const [attendanceRecord] = await db
      .select()
      .from(userAttendance)
      .where(and(eq(userAttendance.userId, userId), eq(userAttendance.date, date)));

    if (!attendanceRecord) {
      res.status(404).json({ error: "No punch-in record found for this user on this date." });
      return;
    }

    await db
      .update(userAttendance)
      .set({
        punchOut,
        punchOutDate: new Date(punchOutDate),
        punchOutLocation
      })
      .where(and(eq(userAttendance.userId, userId), eq(userAttendance.date, date)));

    res.status(200).json({ message: "Punch Out recorded successfully." });

  } catch (error) {
    console.error("Punch Out Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getUserAttendanceById = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = Number(req.params.userId);

    if (isNaN(userId)) {
      res.status(400).json({ error: "Invalid user ID." });
      return;
    }

    const records = await db
      .select()
      .from(userAttendance)
      .where(eq(userAttendance.userId, userId));

    if (records.length === 0) {
      res.status(404).json({ message: "No attendance records found for this user." });
      return;
    }

    res.status(200).json({ userId, attendance: records });

  } catch (error) {
    console.error("Error fetching attendance by user ID:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};


export const RequestMissPunchOut = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = Number(req.params.userId);
    const { date, punchOut, reason } = req.body;

    if (!userId || !date || !punchOut || !reason) {
      res.status(400).json({ error: "Missing required fields." });
      return;
    }

    await db.insert(missPunchRequests).values({
      userId,
      date,
      punchOut,
      reason,
    });

    res.status(201).json({ message: "Miss punch-out request submitted successfully." });
  } catch (error) {
    console.error("Miss Punch-Out Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const ApproveMissPunchOut = async (req: Request, res: Response): Promise<void> => {
  try {
    const requestId = Number(req.params.requestId);

    if (!requestId) {
      res.status(400).json({ error: "Missing request ID." });
      return;
    }

    const [request] = await db
      .select()
      .from(missPunchRequests)
      .where(eq(missPunchRequests.id, requestId));

    if (!request) {
      res.status(404).json({ error: "Request not found." });
      return;
    }

    await db
      .update(userAttendance)
      .set({
        punchOut: request.punchOut,
        punchOutLocation: request.reason,
        status: "Present", 
      })
      .where(
        and(
          eq(userAttendance.userId, request.userId),
          eq(userAttendance.date, request.date)
        )
      );

    await db
      .update(missPunchRequests)
      .set({ status: "Approved" })
      .where(eq(missPunchRequests.id, requestId));

    res.status(200).json({ message: "Miss punch-out request approved." });
  } catch (error) {
    console.error("Approve Miss Punch-Out Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
