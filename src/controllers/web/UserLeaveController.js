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
exports.getSingleLeaveRequestById = exports.getApprovedAndRejectedLeaveRequests = exports.getPendingLeaveRequests = exports.getUserapplyLeaves = exports.getAllLeaveRequestsWithUserInfo = exports.updateLeaveStatus = exports.applyLeave = exports.getUserLeaveBalance = exports.yearlyLeaving = void 0;
const drizzle_orm_1 = require("drizzle-orm");
const UserLeaveSchema_1 = require("../../db_connect/Schema/UserLeaveSchema");
const db_1 = require("../../db_connect/db");
const UserLeaveReqSchama_1 = require("../../db_connect/Schema/UserLeaveReqSchama");
const UserSchema_1 = require("../../db_connect/Schema/UserSchema");
const yearlyLeaving = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = Number(req.params.userId);
        const { totalLeaves, usedLeaves, remainingLeaves, casualLeave, sickLeave, paidLeave, optionalLeave, } = req.body;
        if (isNaN(userId) ||
            totalLeaves == null ||
            usedLeaves == null ||
            remainingLeaves == null ||
            casualLeave == null ||
            sickLeave == null ||
            paidLeave == null ||
            optionalLeave == null) {
            res.status(400).json({ error: "All fields are required and userId must be a number." });
            return;
        }
        const existing = yield db_1.db
            .select()
            .from(UserLeaveSchema_1.userleave)
            .where((0, drizzle_orm_1.eq)(UserLeaveSchema_1.userleave.userId, userId));
        if (existing.length > 0) {
            yield db_1.db
                .update(UserLeaveSchema_1.userleave)
                .set({
                totalLeaves,
                usedLeaves,
                remainingLeaves,
                casualLeave,
                sickLeave,
                paidLeave,
                optionalLeave,
            })
                .where((0, drizzle_orm_1.eq)(UserLeaveSchema_1.userleave.userId, userId));
            res.status(200).json({ message: "Leave record updated successfully." });
        }
        else {
            yield db_1.db.insert(UserLeaveSchema_1.userleave).values({
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
    }
    catch (error) {
        console.error("Leave assignment failed:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});
exports.yearlyLeaving = yearlyLeaving;
const getUserLeaveBalance = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = Number(req.params.userId);
        if (isNaN(userId)) {
            res.status(400).json({ error: "Invalid userId" });
            return;
        }
        const result = yield db_1.db
            .select({
            totalLeaves: UserLeaveSchema_1.userleave.totalLeaves,
            usedLeaves: UserLeaveSchema_1.userleave.usedLeaves,
            remainingLeaves: UserLeaveSchema_1.userleave.remainingLeaves,
            casualLeave: UserLeaveSchema_1.userleave.casualLeave,
            sickLeave: UserLeaveSchema_1.userleave.sickLeave,
            paidLeave: UserLeaveSchema_1.userleave.paidLeave,
            optionalLeave: UserLeaveSchema_1.userleave.optionalLeave,
        })
            .from(UserLeaveSchema_1.userleave)
            .where((0, drizzle_orm_1.eq)(UserLeaveSchema_1.userleave.userId, userId));
        if (result.length === 0) {
            res.status(404).json({ error: "Leave record not found for this user." });
            return;
        }
        res.status(200).json({ leaveBalance: result[0] });
    }
    catch (error) {
        console.error("Error fetching leave balance:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});
exports.getUserLeaveBalance = getUserLeaveBalance;
const applyLeave = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = Number(req.params.userId);
        const { leaveType, startDate, endDate, message } = req.body;
        const allowedLeaveTypes = ["casualLeave", "sickLeave", "paidLeave", "optionalLeave"];
        // Validation
        if (isNaN(userId) ||
            !leaveType ||
            !startDate ||
            !endDate ||
            !message ||
            !allowedLeaveTypes.includes(leaveType)) {
            res.status(400).json({ error: "Invalid input. All fields are required and must be valid." });
            return;
        }
        // Insert leave request
        yield db_1.db.insert(UserLeaveReqSchama_1.userLeaveRequests).values({
            userId,
            leaveType,
            startDate,
            endDate,
            message,
            status: "pending", // default, but explicitly set for clarity
        });
        res.status(201).json({ message: "Leave request submitted successfully." });
    }
    catch (error) {
        console.error("Error applying for leave:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});
exports.applyLeave = applyLeave;
function calculateDays(start, end) {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const timeDiff = endDate.getTime() - startDate.getTime();
    return Math.floor(timeDiff / (1000 * 60 * 60 * 24)) + 1;
}
const updateLeaveStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const leaveId = Number(req.params.id);
        const { status } = req.body;
        const allowedStatuses = ["approved", "rejected"];
        if (isNaN(leaveId) || !status || !allowedStatuses.includes(status)) {
            res.status(400).json({ error: "Invalid leave ID or status." });
            return;
        }
        // Fetch leave request
        const leaveReq = yield db_1.db
            .select()
            .from(UserLeaveReqSchama_1.userLeaveRequests)
            .where((0, drizzle_orm_1.eq)(UserLeaveReqSchama_1.userLeaveRequests.id, leaveId));
        if (leaveReq.length === 0) {
            res.status(404).json({ error: "Leave request not found." });
            return;
        }
        const { userId, leaveType, startDate, endDate } = leaveReq[0];
        if (status === "approved") {
            const days = calculateDays(startDate.toString(), endDate.toString());
            const userLeaveData = yield db_1.db
                .select()
                .from(UserLeaveSchema_1.userleave)
                .where((0, drizzle_orm_1.eq)(UserLeaveSchema_1.userleave.userId, userId));
            if (userLeaveData.length === 0) {
                res.status(404).json({ error: "User leave balance not found." });
                return;
            }
            const userData = userLeaveData[0];
            const leaveKey = leaveType;
            if (userData[leaveKey] < days) {
                res.status(400).json({ error: `Not enough ${leaveType} available.` });
                return;
            }
            const updatedLeaveBalance = {
                usedLeaves: userData.usedLeaves + days,
                remainingLeaves: userData.remainingLeaves - days,
                [leaveKey]: userData[leaveKey] - days,
            };
            yield db_1.db
                .update(UserLeaveSchema_1.userleave)
                .set(updatedLeaveBalance)
                .where((0, drizzle_orm_1.eq)(UserLeaveSchema_1.userleave.userId, userId));
        }
        // Update the leave request status (approved or rejected)
        yield db_1.db
            .update(UserLeaveReqSchama_1.userLeaveRequests)
            .set({ status })
            .where((0, drizzle_orm_1.eq)(UserLeaveReqSchama_1.userLeaveRequests.id, leaveId));
        res.status(200).json({ message: `Leave request ${status} successfully.` });
    }
    catch (error) {
        console.error("Error updating leave status:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});
exports.updateLeaveStatus = updateLeaveStatus;
const getAllLeaveRequestsWithUserInfo = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const results = yield db_1.db
            .select({
            leaveId: UserLeaveReqSchama_1.userLeaveRequests.id,
            leaveType: UserLeaveReqSchama_1.userLeaveRequests.leaveType,
            startDate: UserLeaveReqSchama_1.userLeaveRequests.startDate,
            endDate: UserLeaveReqSchama_1.userLeaveRequests.endDate,
            message: UserLeaveReqSchama_1.userLeaveRequests.message,
            status: UserLeaveReqSchama_1.userLeaveRequests.status,
            userId: UserLeaveReqSchama_1.userLeaveRequests.userId,
            firstName: UserSchema_1.users.firstname,
            lastName: UserSchema_1.users.lastname,
            designation: UserSchema_1.users.designation,
        })
            .from(UserLeaveReqSchama_1.userLeaveRequests)
            .innerJoin(UserSchema_1.users, (0, drizzle_orm_1.eq)(UserLeaveReqSchama_1.userLeaveRequests.userId, UserSchema_1.users.id));
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
    }
    catch (error) {
        console.error("Error fetching leave requests with user info:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});
exports.getAllLeaveRequestsWithUserInfo = getAllLeaveRequestsWithUserInfo;
const getUserapplyLeaves = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.params;
    const parsedUserId = Number(userId);
    if (isNaN(parsedUserId)) {
        res.status(400).json({ error: "Invalid user ID" });
        return;
    }
    try {
        const results = yield db_1.db
            .select({
            leaveId: UserLeaveReqSchama_1.userLeaveRequests.id,
            leaveType: UserLeaveReqSchama_1.userLeaveRequests.leaveType,
            startDate: UserLeaveReqSchama_1.userLeaveRequests.startDate,
            endDate: UserLeaveReqSchama_1.userLeaveRequests.endDate,
            message: UserLeaveReqSchama_1.userLeaveRequests.message,
            status: UserLeaveReqSchama_1.userLeaveRequests.status,
            userId: UserLeaveReqSchama_1.userLeaveRequests.userId,
            firstName: UserSchema_1.users.firstname,
            lastName: UserSchema_1.users.lastname,
            designation: UserSchema_1.users.designation,
        })
            .from(UserLeaveReqSchama_1.userLeaveRequests)
            .innerJoin(UserSchema_1.users, (0, drizzle_orm_1.eq)(UserLeaveReqSchama_1.userLeaveRequests.userId, UserSchema_1.users.id))
            .where((0, drizzle_orm_1.eq)(UserLeaveReqSchama_1.userLeaveRequests.userId, parsedUserId)); // use parsedUserId here
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
    }
    catch (error) {
        console.error("Error fetching user leave requests:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});
exports.getUserapplyLeaves = getUserapplyLeaves;
const getPendingLeaveRequests = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const results = yield db_1.db
            .select({
            leaveId: UserLeaveReqSchama_1.userLeaveRequests.id,
            leaveType: UserLeaveReqSchama_1.userLeaveRequests.leaveType,
            startDate: UserLeaveReqSchama_1.userLeaveRequests.startDate,
            endDate: UserLeaveReqSchama_1.userLeaveRequests.endDate,
            message: UserLeaveReqSchama_1.userLeaveRequests.message,
            status: UserLeaveReqSchama_1.userLeaveRequests.status,
            userId: UserLeaveReqSchama_1.userLeaveRequests.userId,
            firstName: UserSchema_1.users.firstname,
            lastName: UserSchema_1.users.lastname,
            designation: UserSchema_1.users.designation,
        })
            .from(UserLeaveReqSchama_1.userLeaveRequests)
            .innerJoin(UserSchema_1.users, (0, drizzle_orm_1.eq)(UserLeaveReqSchama_1.userLeaveRequests.userId, UserSchema_1.users.id))
            .where((0, drizzle_orm_1.eq)(UserLeaveReqSchama_1.userLeaveRequests.status, "pending"));
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
    }
    catch (error) {
        console.error("Error fetching pending leave requests:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});
exports.getPendingLeaveRequests = getPendingLeaveRequests;
const getApprovedAndRejectedLeaveRequests = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const results = yield db_1.db
            .select({
            leaveId: UserLeaveReqSchama_1.userLeaveRequests.id,
            leaveType: UserLeaveReqSchama_1.userLeaveRequests.leaveType,
            startDate: UserLeaveReqSchama_1.userLeaveRequests.startDate,
            endDate: UserLeaveReqSchama_1.userLeaveRequests.endDate,
            message: UserLeaveReqSchama_1.userLeaveRequests.message,
            status: UserLeaveReqSchama_1.userLeaveRequests.status,
            userId: UserLeaveReqSchama_1.userLeaveRequests.userId,
            firstName: UserSchema_1.users.firstname,
            lastName: UserSchema_1.users.lastname,
            designation: UserSchema_1.users.designation,
        })
            .from(UserLeaveReqSchama_1.userLeaveRequests)
            .innerJoin(UserSchema_1.users, (0, drizzle_orm_1.eq)(UserLeaveReqSchama_1.userLeaveRequests.userId, UserSchema_1.users.id))
            .where((0, drizzle_orm_1.or)((0, drizzle_orm_1.eq)(UserLeaveReqSchama_1.userLeaveRequests.status, "approved"), (0, drizzle_orm_1.eq)(UserLeaveReqSchama_1.userLeaveRequests.status, "rejected")))
            .orderBy((0, drizzle_orm_1.desc)(UserLeaveReqSchama_1.userLeaveRequests.startDate));
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
    }
    catch (error) {
        console.error("Error fetching approved/rejected leave requests:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});
exports.getApprovedAndRejectedLeaveRequests = getApprovedAndRejectedLeaveRequests;
const getSingleLeaveRequestById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const leaveId = Number(req.params.id);
        if (isNaN(leaveId)) {
            res.status(400).json({ error: "Invalid leave ID." });
            return;
        }
        const result = yield db_1.db
            .select({
            leaveId: UserLeaveReqSchama_1.userLeaveRequests.id,
            leaveType: UserLeaveReqSchama_1.userLeaveRequests.leaveType,
            startDate: UserLeaveReqSchama_1.userLeaveRequests.startDate,
            endDate: UserLeaveReqSchama_1.userLeaveRequests.endDate,
            message: UserLeaveReqSchama_1.userLeaveRequests.message,
            status: UserLeaveReqSchama_1.userLeaveRequests.status,
            userId: UserLeaveReqSchama_1.userLeaveRequests.userId,
            firstName: UserSchema_1.users.firstname,
            lastName: UserSchema_1.users.lastname,
            designation: UserSchema_1.users.designation,
        })
            .from(UserLeaveReqSchama_1.userLeaveRequests)
            .innerJoin(UserSchema_1.users, (0, drizzle_orm_1.eq)(UserLeaveReqSchama_1.userLeaveRequests.userId, UserSchema_1.users.id))
            .where((0, drizzle_orm_1.eq)(UserLeaveReqSchama_1.userLeaveRequests.id, leaveId));
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
    }
    catch (error) {
        console.error("Error fetching leave request:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});
exports.getSingleLeaveRequestById = getSingleLeaveRequestById;
