"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getActiveJobs = exports.deactivateJob = exports.activateJob = exports.EditJob = exports.getJobById = exports.getAllJobs = exports.addJob = void 0;
const db_1 = require("../../db_connect/db");
const drizzle_orm_1 = require("drizzle-orm");
const JobsSchema_1 = require("../../db_connect/Schema/JobsSchema");
const addJob = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { jobTitle, jobId, city, state, country, workArrangement, areaOfWork, employmentType, positionType, travelRequired, shift, education, introduction, responsibilities, skills, } = req.body;
        if (!jobTitle || !jobId || !city || !state || !country || !workArrangement ||
            !areaOfWork || !employmentType || !positionType || !travelRequired ||
            !shift || !education || !introduction || !responsibilities || !skills) {
            res.status(400).json({ error: "All fields are required." });
            return;
        }
        yield db_1.db.insert(JobsSchema_1.jobs).values({
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
    }
    catch (error) {
        console.error("Error adding job:", error);
        res.status(500).json({ error: "Internal server error." });
    }
});
exports.addJob = addJob;
const getAllJobs = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const allJobs = yield db_1.db.select().from(JobsSchema_1.jobs);
        res.status(200).json({ data: allJobs });
    }
    catch (error) {
        console.error("Error fetching jobs:", error);
        res.status(500).json({ error: "Failed to fetch jobs." });
    }
});
exports.getAllJobs = getAllJobs;
const getJobById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = Number(req.params.id);
        if (isNaN(id)) {
            res.status(400).json({ error: "Invalid job ID." });
            return;
        }
        const job = yield db_1.db.select().from(JobsSchema_1.jobs).where((0, drizzle_orm_1.eq)(JobsSchema_1.jobs.id, id)).limit(1);
        if (job.length === 0) {
            res.status(404).json({ error: "Job not found." });
            return;
        }
        res.status(200).json({ data: job[0] });
    }
    catch (error) {
        console.error("Error fetching job by ID:", error);
        res.status(500).json({ error: "Failed to fetch job." });
    }
});
exports.getJobById = getJobById;
const EditJob = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = Number(req.params.id);
        if (isNaN(id)) {
            res.status(400).json({ error: "Invalid job ID." });
            return;
        }
        const { jobTitle, jobId, city, state, country, workArrangement, areaOfWork, employmentType, positionType, travelRequired, shift, education, introduction, responsibilities, skills, } = req.body;
        yield db_1.db
            .update(JobsSchema_1.jobs)
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
            .where((0, drizzle_orm_1.eq)(JobsSchema_1.jobs.id, id));
        res.status(200).json({ message: "Job updated successfully." });
    }
    catch (error) {
        console.error("Error updating job:", error);
        res.status(500).json({ error: "Failed to update job." });
    }
});
exports.EditJob = EditJob;
const activateJob = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = Number(req.params.id);
        if (isNaN(id)) {
            res.status(400).json({ error: "Invalid job ID." });
            return;
        }
        yield db_1.db
            .update(JobsSchema_1.jobs)
            .set({ status: true })
            .where((0, drizzle_orm_1.eq)(JobsSchema_1.jobs.id, id));
        res.status(200).json({ message: "Job activated successfully." });
    }
    catch (error) {
        console.error("Error activating job:", error);
        res.status(500).json({ error: "Failed to activate job." });
    }
});
exports.activateJob = activateJob;
const deactivateJob = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = Number(req.params.id);
        if (isNaN(id)) {
            res.status(400).json({ error: "Invalid job ID." });
            return;
        }
        yield db_1.db
            .update(JobsSchema_1.jobs)
            .set({ status: false })
            .where((0, drizzle_orm_1.eq)(JobsSchema_1.jobs.id, id));
        res.status(200).json({ message: "Job deactivated successfully." });
    }
    catch (error) {
        console.error("Error deactivating job:", error);
        res.status(500).json({ error: "Failed to deactivate job." });
    }
});
exports.deactivateJob = deactivateJob;
const getActiveJobs = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const activeJobs = yield db_1.db
            .select()
            .from(JobsSchema_1.jobs)
            .where((0, drizzle_orm_1.eq)(JobsSchema_1.jobs.status, true)); // Only jobs where status is true
        res.status(200).json({ data: activeJobs });
    }
    catch (error) {
        console.error("Error fetching active jobs:", error);
        res.status(500).json({ error: "Failed to fetch active jobs." });
    }
});
exports.getActiveJobs = getActiveJobs;
