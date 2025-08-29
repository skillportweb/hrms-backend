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
exports.getAllHolidays = exports.addHoliday = void 0;
const db_1 = require("../../db_connect/db");
const HolidaysSchema_1 = require("../../db_connect/Schema/HolidaysSchema");
const addHoliday = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { date, title, message } = req.body;
        if (!date || !title || !message) {
            res.status(400).json({ message: "All fields are required" });
            return;
        }
        yield db_1.db.insert(HolidaysSchema_1.holidays).values({ date, title, message });
        res.status(201).json({ message: "Holiday added successfully" });
    }
    catch (error) {
        console.error("Add Holiday Error:", error);
        res.status(500).json({ message: "Something went wrong" });
    }
});
exports.addHoliday = addHoliday;
const getAllHolidays = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield db_1.db.select().from(HolidaysSchema_1.holidays);
        res.status(200).json({ holidays: result });
    }
    catch (error) {
        console.error("Get Holidays Error:", error);
        res.status(500).json({ message: "Something went wrong" });
    }
});
exports.getAllHolidays = getAllHolidays;
