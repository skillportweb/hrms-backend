// controllers/holidayController.ts
import { Request, Response } from "express";
import { db } from "../../db_connect/db";
import { holidays } from "../../db_connect/Schema/HolidaysSchema";

export const addHoliday = async (req: Request, res: Response): Promise<void> => {
  try {
    const { date, day, title, message } = req.body;

    if (!date || !day || !title || !message) {
      res.status(400).json({ message: "All fields are required" });
      return;
    }

    await db.insert(holidays).values({ date, day, title, message });

    res.status(201).json({ message: "Holiday added successfully" });
  } catch (error) {
    console.error("Add Holiday Error:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const getAllHolidays = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await db.select().from(holidays);
    res.status(200).json({ holidays: result });
  } catch (error) {
    console.error("Get Holidays Error:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};
