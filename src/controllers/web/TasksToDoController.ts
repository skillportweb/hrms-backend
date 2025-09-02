import { Request, Response } from "express";
import { db } from "../../db_connect/db";
import { and, eq } from "drizzle-orm";
import { todos } from "../../db_connect/Schema/TasksToDo";

export const addTask = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, todo } = req.body;

    if (!userId || !todo) {
      res.status(400).json({ message: "userId and todo are required." });
      return;
    }

    const newTask = await db
      .insert(todos)
      .values({
        userId: parseInt(userId),
        todo,
        status: 0, // 0 = pending
      })
      .returning();

    res.status(201).json({
      message: "Task added successfully",
      data: newTask[0],
    });
  } catch (error) {
    console.error("Error adding task:", error);
    res.status(500).json({ message: "Server error", error });
  }
};


export const deleteTask = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = Number(req.params.id);

    if (isNaN(id)) {
      res.status(400).json({ message: "Invalid task ID." });
      return;
    }

    const deleted = await db
      .delete(todos)
      .where(eq(todos.id, id))
      .returning();

    if (deleted.length === 0) {
      res.status(404).json({ message: "Task not found." });
      return;
    }

    res.status(200).json({ message: "Task deleted successfully", data: deleted[0] });
  } catch (error) {
    console.error("Error deleting task:", error);
    res.status(500).json({ message: "Server error", error });
  }
};


export const completeTask = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = Number(req.params.id);

    if (isNaN(id)) {
      res.status(400).json({ message: "Invalid task ID." });
      return;
    }

    const updatedTask = await db
      .update(todos)
      .set({ status: 1 }) // 1 = completed
      .where(eq(todos.id, id))
      .returning();

    if (updatedTask.length === 0) {
      res.status(404).json({ message: "Task not found." });
      return;
    }

    res.status(200).json({ message: "Task marked as complete", data: updatedTask[0] });
  } catch (error) {
    console.error("Error completing task:", error);
    res.status(500).json({ message: "Server error", error });
  }
};


export const getPendingTasks = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = Number(req.params.userId);

    if (isNaN(userId)) {
      res.status(400).json({ message: "Invalid user ID." });
      return;
    }

    const pendingTasks = await db
      .select()
      .from(todos)
      .where(and(eq(todos.userId, userId), eq(todos.status, 0))); // 0 = pending

    res.status(200).json({ message: "Pending tasks fetched successfully", data: pendingTasks });
  } catch (error) {
    console.error("Error fetching pending tasks:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

export const getCompletedTasks = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = Number(req.params.userId);

    if (isNaN(userId)) {
      res.status(400).json({ message: "Invalid user ID." });
      return;
    }

    const completedTasks = await db
      .select()
      .from(todos)
      .where(and(eq(todos.userId, userId), eq(todos.status, 1))); // 1 = completed

    res.status(200).json({ message: "Completed tasks fetched successfully", data: completedTasks });
  } catch (error) {
    console.error("Error fetching completed tasks:", error);
    res.status(500).json({ message: "Server error", error });
  }
};
