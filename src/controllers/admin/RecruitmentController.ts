import { Request, Response } from "express";
import { db } from "../../db_connect/db";
import { eq } from "drizzle-orm";
import { jobs } from "../../db_connect/Schema/JobsSchema";

export const addJob = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      jobTitle,
      jobId,
      city,
      state,
      country,
      workArrangement,
      areaOfWork,
      employmentType,
      positionType,
      travelRequired,
      shift,
      education,
      introduction,
      responsibilities,
      skills,
    } = req.body;

    if (
      !jobTitle || !jobId || !city || !state || !country || !workArrangement ||
      !areaOfWork || !employmentType || !positionType || !travelRequired ||
      !shift || !education || !introduction || !responsibilities || !skills
    ) {
      res.status(400).json({ error: "All fields are required." });
      return;
    }

    await db.insert(jobs).values({
      jobTitle,
      jobId,
      city,
      state,
      country,
      workArrangement,
      areaOfWork,
      employmentType,
      positionType,
      travelRequired,
      shift,
      education,
      introduction,
      responsibilities,
      skills,
      status: false,
    });

    res.status(201).json({ message: "Job added successfully." });
  } catch (error) {
    console.error("Error adding job:", error);
    res.status(500).json({ error: "Internal server error." });
  }
};

export const getAllJobs = async (req: Request, res: Response): Promise<void> => {
  try {
    const allJobs = await db.select().from(jobs);
    res.status(200).json({ data: allJobs });
  } catch (error) {
    console.error("Error fetching jobs:", error);
    res.status(500).json({ error: "Failed to fetch jobs." });
  }
};

export const getJobById = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = Number(req.params.id);

    if (isNaN(id)) {
      res.status(400).json({ error: "Invalid job ID." });
      return;
    }

    const job = await db.select().from(jobs).where(eq(jobs.id, id)).limit(1);

    if (job.length === 0) {
      res.status(404).json({ error: "Job not found." });
      return;
    }

    res.status(200).json({ data: job[0] });
  } catch (error) {
    console.error("Error fetching job by ID:", error);
    res.status(500).json({ error: "Failed to fetch job." });
  }
};

export const EditJob = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = Number(req.params.id);

    if (isNaN(id)) {
      res.status(400).json({ error: "Invalid job ID." });
      return;
    }

    const {
      jobTitle,
      jobId,
      city,
      state,
      country,
      workArrangement,
      areaOfWork,
      employmentType,
      positionType,
      travelRequired,
      shift,
      education,
      introduction,
      responsibilities,
      skills,
    } = req.body;

    await db
      .update(jobs)
      .set({
        jobTitle,
        jobId,
        city,
        state,
        country,
        workArrangement,
        areaOfWork,
        employmentType,
        positionType,
        travelRequired,
        shift,
        education,
        introduction,
        responsibilities,
        skills,
      })
      .where(eq(jobs.id, id));

    res.status(200).json({ message: "Job updated successfully." });
  } catch (error) {
    console.error("Error updating job:", error);
    res.status(500).json({ error: "Failed to update job." });
  }
}

export const activateJob = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = Number(req.params.id);

    if (isNaN(id)) {
      res.status(400).json({ error: "Invalid job ID." });
      return;
    }

    await db
      .update(jobs)
      .set({ status: true })
      .where(eq(jobs.id, id));

    res.status(200).json({ message: "Job activated successfully." });
  } catch (error) {
    console.error("Error activating job:", error);
    res.status(500).json({ error: "Failed to activate job." });
  }
};

export const deactivateJob = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = Number(req.params.id);

    if (isNaN(id)) {
      res.status(400).json({ error: "Invalid job ID." });
      return;
    }

    await db
      .update(jobs)
      .set({ status: false })
      .where(eq(jobs.id, id));

    res.status(200).json({ message: "Job deactivated successfully." });
  } catch (error) {
    console.error("Error deactivating job:", error);
    res.status(500).json({ error: "Failed to deactivate job." });
  }
};

export const getActiveJobs = async (req: Request, res: Response): Promise<void> => {
  try {
    const activeJobs = await db
      .select()
      .from(jobs)
      .where(eq(jobs.status, true)); // Only jobs where status is true

    res.status(200).json({ data: activeJobs });
  } catch (error) {
    console.error("Error fetching active jobs:", error);
    res.status(500).json({ error: "Failed to fetch active jobs." });
  }
};
