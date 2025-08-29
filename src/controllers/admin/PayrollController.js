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
exports.getPromotionsByUserId = exports.updateUserPromotion = void 0;
const db_1 = require("../../db_connect/db");
const UserSchema_1 = require("../../db_connect/Schema/UserSchema");
const PayrollSchema_1 = require("../../db_connect/Schema/PayrollSchema");
const drizzle_orm_1 = require("drizzle-orm");
const updateUserPromotion = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = Number(req.params.id);
        if (!userId) {
            res.status(400).json({ error: "User ID is required in the URL." });
            return;
        }
        const { newDesignation, currentPayroll, promotedPayroll, promotionDate, notes } = req.body;
        if (!newDesignation || !promotionDate || !currentPayroll || !promotedPayroll) {
            res.status(400).json({
                error: "newDesignation, currentPayroll, promotedPayroll, and promotionDate are required.",
            });
            return;
        }
        // Check if user exists
        const existingUser = yield db_1.db.select().from(UserSchema_1.users).where((0, drizzle_orm_1.eq)(UserSchema_1.users.id, userId)).limit(1);
        if (existingUser.length === 0) {
            res.status(404).json({ error: "User not found." });
            return;
        }
        // Insert into payrolls table (log the promotion event)
        yield db_1.db.insert(PayrollSchema_1.payrolls).values({
            userId,
            newDesignation,
            currentPayroll,
            promotedPayroll,
            promotionDate,
            notes: notes || "",
        });
        // Update user's designation, current payroll (to new promoted payroll), and promotion date
        yield db_1.db
            .update(UserSchema_1.users)
            .set({
            designation: newDesignation,
            currentPayroll: promotedPayroll, // promoted payroll becomes new current payroll
            promotionDate: promotionDate,
        })
            .where((0, drizzle_orm_1.eq)(UserSchema_1.users.id, userId));
        res.status(200).json({
            message: "User promotion updated in users table and logged in payrolls table.",
        });
    }
    catch (error) {
        console.error("Error updating user promotion:", error.message || error);
        res.status(500).json({ error: "Internal server error." });
    }
});
exports.updateUserPromotion = updateUserPromotion;
const getPromotionsByUserId = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = Number(req.params.id);
        if (!userId) {
            res.status(400).json({ error: "User ID is required in the URL." });
            return;
        }
        const promotions = yield db_1.db
            .select()
            .from(PayrollSchema_1.payrolls)
            .where((0, drizzle_orm_1.eq)(PayrollSchema_1.payrolls.userId, userId))
            .orderBy(PayrollSchema_1.payrolls.promotionDate); // oldest first
        res.status(200).json({
            data: promotions, //  Wrapped inside "data"
        });
    }
    catch (error) {
        console.error("Error fetching promotions:", error.message || error);
        res.status(500).json({ error: "Internal server error." });
    }
});
exports.getPromotionsByUserId = getPromotionsByUserId;
