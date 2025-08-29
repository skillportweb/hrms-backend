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
exports.getUsersByDepartment = exports.addDepartmentMembers = void 0;
const db_1 = require("../../db_connect/db");
const UserSchema_1 = require("../../db_connect/Schema/UserSchema");
const DepartmentSchema_1 = require("../../db_connect/Schema/DepartmentSchema");
const drizzle_orm_1 = require("drizzle-orm");
const nodemailer_1 = __importDefault(require("nodemailer"));
const updateMemberTemplate_1 = require("../../emails/updateMemberTemplate");
// --- Email Transporter ---
const transporter = nodemailer_1.default.createTransport({
    service: "gmail",
    auth: {
        user: "dinesh1804200182@gmail.com",
        pass: "alrxrwgdsrixbuen", // Use environment variables in production!
    },
});
// --- Send Email Function ---
const sendEmail = (to, subject, html) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield transporter.sendMail({
            from: '"Admin" <dinesh1804200182@gmail.com>',
            to,
            subject,
            html,
        });
    }
    catch (err) {
        console.error(` Failed to send email to ${to}:`, err);
    }
});
// --- Main Function ---
const addDepartmentMembers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    try {
        const { departmentId, userIds, removedUserIds } = req.body;
        if (!departmentId || !Array.isArray(userIds) || !Array.isArray(removedUserIds)) {
            res.status(400).json({ success: false, message: "Invalid input data" });
            return;
        }
        //  Get department title
        const department = yield db_1.db
            .select()
            .from(DepartmentSchema_1.departments)
            .where((0, drizzle_orm_1.eq)(DepartmentSchema_1.departments.id, departmentId));
        const departmentName = ((_a = department[0]) === null || _a === void 0 ? void 0 : _a.title) || "Unknown Department";
        //  Handle additions
        if (userIds.length > 0) {
            yield db_1.db.update(UserSchema_1.users).set({ departmentId }).where((0, drizzle_orm_1.inArray)(UserSchema_1.users.id, userIds));
            const addedUsers = yield db_1.db.select().from(UserSchema_1.users).where((0, drizzle_orm_1.inArray)(UserSchema_1.users.id, userIds));
            for (const user of addedUsers) {
                if (user.email) {
                    const html = (0, updateMemberTemplate_1.updateMemberTemplate)((_b = user.firstname) !== null && _b !== void 0 ? _b : "User", departmentName, "added");
                    yield sendEmail(user.email, "You've been added to a department", html);
                }
            }
        }
        //  Handle removals
        if (removedUserIds.length > 0) {
            yield db_1.db.update(UserSchema_1.users).set({ departmentId: null }).where((0, drizzle_orm_1.inArray)(UserSchema_1.users.id, removedUserIds));
            const removedUsers = yield db_1.db.select().from(UserSchema_1.users).where((0, drizzle_orm_1.inArray)(UserSchema_1.users.id, removedUserIds));
            for (const user of removedUsers) {
                if (user.email) {
                    const html = (0, updateMemberTemplate_1.updateMemberTemplate)((_c = user.firstname) !== null && _c !== void 0 ? _c : "User", departmentName, "removed");
                    yield sendEmail(user.email, "You've been removed from a department", html);
                }
            }
        }
        res.status(200).json({ success: true, message: "Department members updated and emails sent." });
    }
    catch (error) {
        console.error("Error updating department members:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
});
exports.addDepartmentMembers = addDepartmentMembers;
const getUsersByDepartment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const departmentId = parseInt(req.params.id, 10);
        if (isNaN(departmentId)) {
            res.status(400).json({ success: false, message: "Invalid department ID" });
            return;
        }
        const result = yield db_1.db
            .select({ id: UserSchema_1.users.id, firstname: UserSchema_1.users.firstname })
            .from(UserSchema_1.users)
            .where((0, drizzle_orm_1.eq)(UserSchema_1.users.departmentId, departmentId));
        res.status(200).json({ success: true, data: result });
    }
    catch (error) {
        console.error("Error fetching users by department:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
});
exports.getUsersByDepartment = getUsersByDepartment;
