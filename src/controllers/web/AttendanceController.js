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
exports.getAttendanceWithMissPunch = exports.ViewMissPunchout = exports.ApproveMissPunchOut = exports.RequestMissPunchOut = exports.getUserAttendanceById = exports.punchOutAttendance = exports.addUserAttendance = void 0;
const db_1 = require("../../db_connect/db");
const AttendanceSchema_1 = require("../../db_connect/Schema/AttendanceSchema");
const drizzle_orm_1 = require("drizzle-orm");
const MissPunchRequests_1 = require("../../db_connect/Schema/MissPunchRequests");
// Haversine formula to check allowed location
function getDistanceFromLatLonInMeters(lat1, lon1, lat2, lon2) {
    const R = 6371e3;
    const toRad = (deg) => deg * (Math.PI / 180);
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
            Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}
const allowedLat = 28.6019;
const allowedLon = 77.3899;
const allowedRadius = 100;
const addUserAttendance = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId, date, dayName, punchIn, punchInDate, punchInLocation, latitude, longitude, status, missPunchStatus } = req.body;
        console.log("Received Body:", req.body);
        console.log("User ID:", userId);
        if (!userId || !date || !dayName || latitude == null || longitude == null) {
            res.status(400).json({ error: "Missing required fields including location." });
            return;
        }
        const [existing] = yield db_1.db
            .select()
            .from(AttendanceSchema_1.userAttendance)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(AttendanceSchema_1.userAttendance.userId, userId), (0, drizzle_orm_1.eq)(AttendanceSchema_1.userAttendance.date, date)));
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
        yield db_1.db.insert(AttendanceSchema_1.userAttendance).values({
            userId,
            date,
            dayName,
            punchIn,
            punchInDate: new Date(punchInDate),
            punchInLocation,
            punchInLatitude: String(latitude),
            punchInLongitude: String(longitude),
            status: status || "Present",
            missPunchStatus: missPunchStatus !== null && missPunchStatus !== void 0 ? missPunchStatus : 0
        });
        res.status(201).json({ message: "Punch In recorded successfully." });
    }
    catch (error) {
        console.error("Punch In Error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});
exports.addUserAttendance = addUserAttendance;
const punchOutAttendance = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId, date, punchOut, punchOutDate, punchOutLocation, latitude, longitude } = req.body;
        if (!userId || !date || !punchOut || !punchOutDate || !punchOutLocation || latitude == null || longitude == null) {
            res.status(400).json({ error: "Missing required fields for punch-out." });
            return;
        }
        const distance = getDistanceFromLatLonInMeters(latitude, longitude, allowedLat, allowedLon);
        if (distance > allowedRadius) {
            res.status(403).json({ error: "You are not within the allowed location to Punch Out." });
            return;
        }
        const [attendanceRecord] = yield db_1.db
            .select()
            .from(AttendanceSchema_1.userAttendance)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(AttendanceSchema_1.userAttendance.userId, userId), (0, drizzle_orm_1.eq)(AttendanceSchema_1.userAttendance.date, date)));
        if (!attendanceRecord) {
            res.status(404).json({ error: "No punch-in record found for this user on this date." });
            return;
        }
        yield db_1.db
            .update(AttendanceSchema_1.userAttendance)
            .set({
            punchOut,
            punchOutDate: new Date(punchOutDate),
            punchOutLocation
        })
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(AttendanceSchema_1.userAttendance.userId, userId), (0, drizzle_orm_1.eq)(AttendanceSchema_1.userAttendance.date, date)));
        res.status(200).json({ message: "Punch Out recorded successfully." });
    }
    catch (error) {
        console.error("Punch Out Error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});
exports.punchOutAttendance = punchOutAttendance;
const getUserAttendanceById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = Number(req.params.userId);
        if (isNaN(userId)) {
            res.status(400).json({ error: "Invalid user ID." });
            return;
        }
        const records = yield db_1.db
            .select()
            .from(AttendanceSchema_1.userAttendance)
            .where((0, drizzle_orm_1.eq)(AttendanceSchema_1.userAttendance.userId, userId));
        // Always return the result, even if it's empty
        res.status(200).json({ userId, attendance: records });
    }
    catch (error) {
        console.error("Error fetching attendance by user ID:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});
exports.getUserAttendanceById = getUserAttendanceById;
const RequestMissPunchOut = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.body) {
            res.status(400).json({ error: "Missing request body." });
            return;
        }
        const userId = Number(req.params.userId);
        const { date, punchOut, reason } = req.body;
        if (!userId || !date || !punchOut || !reason) {
            res.status(400).json({ error: "Missing required fields." });
            return;
        }
        const existing = yield db_1.db
            .select()
            .from(MissPunchRequests_1.missPunchRequests)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(MissPunchRequests_1.missPunchRequests.userId, userId), (0, drizzle_orm_1.eq)(MissPunchRequests_1.missPunchRequests.date, date)));
        if (existing.length > 0) {
            res.status(409).json({ error: "A request for this date already exists." });
            return;
        }
        // Insert miss punch-out request
        yield db_1.db.insert(MissPunchRequests_1.missPunchRequests).values({
            userId,
            date,
            punchOut,
            reason,
        });
        // Update missPunchStatus in userAttendance to 1 (requested)
        yield db_1.db
            .update(AttendanceSchema_1.userAttendance)
            .set({ missPunchStatus: 1 })
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(AttendanceSchema_1.userAttendance.userId, userId), (0, drizzle_orm_1.eq)(AttendanceSchema_1.userAttendance.date, date)));
        res.status(201).json({ message: "Miss punch-out request submitted successfully." });
    }
    catch (error) {
        console.error("Miss Punch-Out Error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});
exports.RequestMissPunchOut = RequestMissPunchOut;
const ApproveMissPunchOut = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const requestId = Number(req.params.requestId);
        if (!requestId) {
            res.status(400).json({ error: "Missing request ID." });
            return;
        }
        const [request] = yield db_1.db
            .select()
            .from(MissPunchRequests_1.missPunchRequests)
            .where((0, drizzle_orm_1.eq)(MissPunchRequests_1.missPunchRequests.id, requestId));
        if (!request) {
            res.status(404).json({ error: "Request not found." });
            return;
        }
        yield db_1.db
            .update(AttendanceSchema_1.userAttendance)
            .set({
            punchOut: request.punchOut,
            punchOutLocation: request.reason,
            status: "Present",
            missPunchStatus: 2
        })
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(AttendanceSchema_1.userAttendance.userId, request.userId), (0, drizzle_orm_1.eq)(AttendanceSchema_1.userAttendance.date, request.date)));
        // Update request status to "Approved"
        yield db_1.db
            .update(MissPunchRequests_1.missPunchRequests)
            .set({ status: "Approved" })
            .where((0, drizzle_orm_1.eq)(MissPunchRequests_1.missPunchRequests.id, requestId));
        res.status(200).json({ message: "Miss punch-out request approved." });
    }
    catch (error) {
        console.error("Approve Miss Punch-Out Error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});
exports.ApproveMissPunchOut = ApproveMissPunchOut;
const ViewMissPunchout = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const requestId = Number(req.params.requestId);
        if (!requestId) {
            res.status(400).json({ error: "Missing request ID." });
            return;
        }
        const [request] = yield db_1.db
            .select()
            .from(MissPunchRequests_1.missPunchRequests)
            .where((0, drizzle_orm_1.eq)(MissPunchRequests_1.missPunchRequests.id, requestId));
        if (!request) {
            res.status(404).json({ error: "Request not found." });
            return;
        }
        res.status(200).json({ data: request });
    }
    catch (error) {
        console.error("View Miss Punch-Out Error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});
exports.ViewMissPunchout = ViewMissPunchout;
const getAttendanceWithMissPunch = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    return yield db_1.db
        .select({
        date: AttendanceSchema_1.userAttendance.date,
        status: AttendanceSchema_1.userAttendance.status,
        punchIn: AttendanceSchema_1.userAttendance.punchIn,
        punchOut: AttendanceSchema_1.userAttendance.punchOut,
        missPunchStatus: AttendanceSchema_1.userAttendance.missPunchStatus,
        missPunchId: MissPunchRequests_1.missPunchRequests.id,
    })
        .from(AttendanceSchema_1.userAttendance)
        .leftJoin(MissPunchRequests_1.missPunchRequests, (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(AttendanceSchema_1.userAttendance.userId, MissPunchRequests_1.missPunchRequests.userId), (0, drizzle_orm_1.eq)(AttendanceSchema_1.userAttendance.date, MissPunchRequests_1.missPunchRequests.date)))
        .where((0, drizzle_orm_1.eq)(AttendanceSchema_1.userAttendance.userId, userId));
});
exports.getAttendanceWithMissPunch = getAttendanceWithMissPunch;
