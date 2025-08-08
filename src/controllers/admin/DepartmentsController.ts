import { Request, Response } from "express";
import { db } from "../../db_connect/db";
import { departments } from "../../db_connect/Schema/DepartmentSchema";
import { eq } from "drizzle-orm";

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
      .select({ title: departments.title })
      .from(departments);

    res.status(200).json(allDepartmentTitles);
  } catch (error) {
    console.error("Error fetching department titles:", error);
    res.status(500).json({ error: "Internal server error." });
  }
};


