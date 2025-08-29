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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.changeUserDepartment = exports.UpdateDepartmentStatus = exports.getAllDepartmentsTitle = exports.getDepartmentById = exports.updateDepartment = exports.getAllDepartments = exports.addDepartment = void 0;
const db_1 = require("../../db_connect/db");
const DepartmentSchema_1 = require("../../db_connect/Schema/DepartmentSchema");
const UserSchema_1 = require("../../db_connect/Schema/UserSchema");
const drizzle_orm_1 = require("drizzle-orm");
const nodemailer_1 = __importDefault(require("nodemailer"));
const departmentChangeEmailTemplate_1 = require("../../emails/departmentChangeEmailTemplate");
const addDepartment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        yield db_1.db.insert(DepartmentSchema_1.departments).values({
            title,
            headName,
            description,
            status: 1,
        });
        res.status(201).json({ message: "Department added successfully." });
    }
    catch (error) {
        console.error("Error adding department:", error.message || error);
        res.status(500).json({ error: "Internal server error." });
    }
});
exports.addDepartment = addDepartment;
const getAllDepartments = (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const allDepartments = yield db_1.db.select().from(DepartmentSchema_1.departments);
        res.status(200).json(allDepartments);
    }
    catch (error) {
        console.error("Error fetching departments:", error);
        res.status(500).json({ error: "Internal server error." });
    }
});
exports.getAllDepartments = getAllDepartments;
const updateDepartment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        const result = yield db_1.db
            .update(DepartmentSchema_1.departments)
            .set({ title, headName, description })
            .where((0, drizzle_orm_1.eq)(DepartmentSchema_1.departments.id, Number(id)))
            .returning();
        res
            .status(200)
            .json({ message: "Department updated successfully.", result });
    }
    catch (error) {
        console.error("Error updating department:", error);
        res.status(500).json({ error: "Internal server error." });
    }
});
exports.updateDepartment = updateDepartment;
const getDepartmentById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        if (!id || isNaN(Number(id))) {
            res.status(400).json({ error: "Invalid or missing department ID." });
            return;
        }
        const result = yield db_1.db
            .select()
            .from(DepartmentSchema_1.departments)
            .where((0, drizzle_orm_1.eq)(DepartmentSchema_1.departments.id, Number(id)));
        if (result.length === 0) {
            res.status(404).json({ error: "Department not found." });
            return;
        }
        res.status(200).json({ data: result[0] });
    }
    catch (error) {
        console.error("Error fetching department:", error);
        res.status(500).json({ error: "Internal server error." });
    }
});
exports.getDepartmentById = getDepartmentById;
const getAllDepartmentsTitle = (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const allDepartmentTitles = yield db_1.db
            .select({ id: DepartmentSchema_1.departments.id, title: DepartmentSchema_1.departments.title })
            .from(DepartmentSchema_1.departments);
        res.status(200).json(allDepartmentTitles);
    }
    catch (error) {
        console.error("Error fetching department titles:", error);
        res.status(500).json({ error: "Internal server error." });
    }
});
exports.getAllDepartmentsTitle = getAllDepartmentsTitle;
const UpdateDepartmentStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { status } = req.body || {}; // Safe destructuring
        // Validate ID
        if (!id || isNaN(Number(id))) {
            res.status(400).json({ error: "Invalid or missing department ID." });
            return;
        }
        // Validate status
        if (status !== 0 && status !== 1) {
            res.status(400).json({ error: "Status must be 0 (inactive) or 1 (active)." });
            return;
        }
        // 1 Update department status
        const deptResult = yield db_1.db
            .update(DepartmentSchema_1.departments)
            .set({ status })
            .where((0, drizzle_orm_1.eq)(DepartmentSchema_1.departments.id, Number(id)))
            .returning();
        if (deptResult.length === 0) {
            res.status(404).json({ error: "Department not found." });
            return;
        }
        // 2 If department is deactivated (status = 0) → block all users in that department
        let userUpdateResult = [];
        if (status === 0) {
            userUpdateResult = yield db_1.db
                .update(UserSchema_1.users)
                .set({ isBlocked: true })
                .where((0, drizzle_orm_1.eq)(UserSchema_1.users.departmentId, Number(id)))
                .returning();
        }
        // 3 If department is activated (status = 1) → unblock all users in that department
        if (status === 1) {
            userUpdateResult = yield db_1.db
                .update(UserSchema_1.users)
                .set({ isBlocked: false })
                .where((0, drizzle_orm_1.eq)(UserSchema_1.users.departmentId, Number(id)))
                .returning();
        }
        res.status(200).json({
            message: `Department ${status === 1 ? "activated" : "deactivated"} successfully.`,
            department: deptResult[0],
            affectedUsers: userUpdateResult.length,
        });
    }
    catch (error) {
        console.error("Error updating department status:", error);
        res.status(500).json({ error: "Internal server error." });
    }
});
exports.UpdateDepartmentStatus = UpdateDepartmentStatus;
const transporter = nodemailer_1.default.createTransport({
    service: "gmail",
    auth: {
        user: "dinesh1804200182@gmail.com",
        pass: "alrxrwgdsrixbuen",
    },
});
const changeUserDepartment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId, departmentId } = req.body;
        // Validate input
        if (!userId || isNaN(Number(userId))) {
            res.status(400).json({ error: "Invalid or missing user ID." });
            return;
        }
        if (!departmentId || isNaN(Number(departmentId))) {
            res.status(400).json({ error: "Invalid or missing department ID." });
            return;
        }
        // Check new department exists
        const newDept = yield db_1.db
            .select()
            .from(DepartmentSchema_1.departments)
            .where((0, drizzle_orm_1.eq)(DepartmentSchema_1.departments.id, Number(departmentId)));
        if (newDept.length === 0) {
            res.status(404).json({ error: "New department not found." });
            return;
        }
        const newDepartmentTitle = newDept[0].title;
        // Fetch user info with current departmentId & email
        const userRecord = yield db_1.db
            .select()
            .from(UserSchema_1.users)
            .where((0, drizzle_orm_1.eq)(UserSchema_1.users.id, Number(userId)));
        if (userRecord.length === 0) {
            res.status(404).json({ error: "User not found." });
            return;
        }
        const user = userRecord[0];
        const userEmail = user.email;
        if (!userEmail) {
            res.status(400).json({ error: "User email not found." });
            return;
        }
        // Fetch old department title
        const oldDeptId = user.departmentId;
        let oldDepartmentTitle = "None";
        if (oldDeptId) {
            const oldDept = yield db_1.db
                .select()
                .from(DepartmentSchema_1.departments)
                .where((0, drizzle_orm_1.eq)(DepartmentSchema_1.departments.id, oldDeptId));
            if (oldDept.length > 0) {
                oldDepartmentTitle = oldDept[0].title;
            }
        }
        // Update user's department
        const updatedUser = yield db_1.db
            .update(UserSchema_1.users)
            .set({ departmentId: Number(departmentId) })
            .where((0, drizzle_orm_1.eq)(UserSchema_1.users.id, Number(userId)))
            .returning();
        if (updatedUser.length === 0) {
            res.status(404).json({ error: "User not found during update." });
            return;
        }
        // Prepare email using updated template with old and new department names
        const emailText = (0, departmentChangeEmailTemplate_1.departmentChangeEmailTemplate)(user.firstname, oldDepartmentTitle, newDepartmentTitle);
        // Send email
        const mailOptions = {
            from: '"Yiron Technologies Pvt Ltd" <dinesh1804200182@gmail.com>',
            to: userEmail,
            subject: "Your Department Has Been Changed",
            html: (0, departmentChangeEmailTemplate_1.departmentChangeEmailTemplate)(user.firstname, oldDepartmentTitle, newDepartmentTitle),
        };
        yield transporter.sendMail(mailOptions);
        res.status(200).json({
            message: "User's department updated successfully and email sent.",
            user: updatedUser[0],
        });
    }
    catch (error) {
        console.error("Error changing user department or sending email:", error);
        res.status(500).json({ error: "Internal server error." });
    }
});
exports.changeUserDepartment = changeUserDepartment;
