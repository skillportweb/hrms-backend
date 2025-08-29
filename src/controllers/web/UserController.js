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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUsersByDepartmentId = exports.getAllUserNamesWithId = exports.logoutUser = exports.getUserProfile = exports.getAllUsers = exports.approveUser = exports.loginUser = exports.usersRegistration = exports.blacklistedTokens = void 0;
const db_1 = require("../../db_connect/db");
const drizzle_orm_1 = require("drizzle-orm");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const nodemailer_1 = __importDefault(require("nodemailer"));
const registrationEmailTemplate_1 = require("../../emails/registrationEmailTemplate");
const accountApprovedEmailTemplate_1 = require("../../emails/accountApprovedEmailTemplate");
const UserSchema_1 = require("./../../db_connect/Schema/UserSchema");
const DepartmentSchema_1 = require("../../db_connect/Schema/DepartmentSchema");
const blacklistedTokens = new Set();
exports.blacklistedTokens = blacklistedTokens;
const JWT_SECRET = "your_jwt_secret_key";
const usersRegistration = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { firstname, lastname, email, phone, password, dob, role, designation, } = req.body;
        if (!firstname ||
            !lastname ||
            !email ||
            !phone ||
            !password ||
            !dob ||
            !designation) {
            res.status(400).json({ message: "All fields are required" });
            return;
        }
        const existingUser = yield db_1.db
            .select()
            .from(UserSchema_1.users)
            .where((0, drizzle_orm_1.eq)(UserSchema_1.users.email, email));
        if (existingUser.length > 0) {
            res.status(400).json({ message: "Email already registered" });
            return;
        }
        const hashedPassword = yield bcrypt_1.default.hash(password, 10);
        yield db_1.db.insert(UserSchema_1.users).values({
            firstname,
            lastname,
            email,
            phone,
            password: hashedPassword,
            dob,
            designation,
            role: typeof role === "number" ? role : 0,
        });
        const transporter = nodemailer_1.default.createTransport({
            service: "gmail",
            auth: {
                user: "dinesh1804200182@gmail.com",
                pass: "alrxrwgdsrixbuen",
            },
        });
        const mailOptions = {
            from: '"HRMS System" <admin@example.com>',
            to: "dinesh1804200182@gmail.com",
            subject: "New Employee Registration - Approval Required",
            html: (0, registrationEmailTemplate_1.getRegistrationEmailTemplate)(firstname, lastname, email, designation),
        };
        yield transporter.sendMail(mailOptions);
        res
            .status(201)
            .json({ message: "User registered and email sent successfully" });
    }
    catch (error) {
        console.error("Registration error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});
exports.usersRegistration = usersRegistration;
const loginUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            res.status(400).json({ message: "Email and password are required." });
            return;
        }
        const userResult = yield db_1.db
            .select()
            .from(UserSchema_1.users)
            .where((0, drizzle_orm_1.eq)(UserSchema_1.users.email, email));
        if (userResult.length === 0) {
            res.status(401).json({ message: "Invalid email or password." });
            return;
        }
        const storedUser = userResult[0];
        if (!storedUser.password) {
            res.status(500).json({ message: "Password not found for this user." });
            return;
        }
        if (storedUser.isBlocked) {
            res
                .status(403)
                .json({ message: "Access denied. Please contact the administrator." });
            return;
        }
        if (storedUser.role !== 1 && !storedUser.approved) {
            res.status(403).json({ message: "Your account is not approved yet." });
            return;
        }
        const isMatch = yield bcrypt_1.default.compare(password, storedUser.password);
        if (!isMatch) {
            res.status(401).json({ message: "Invalid email or password." });
            return;
        }
        const roleMessage = storedUser.role === 1
            ? "Admin login successful"
            : "User login successful";
        const token = jsonwebtoken_1.default.sign({ id: storedUser.id, email: storedUser.email, role: storedUser.role }, JWT_SECRET, { expiresIn: "1d" });
        const { password: _ } = storedUser, userWithoutPassword = __rest(storedUser, ["password"]);
        res.status(200).json({
            message: roleMessage,
            token,
            user: userWithoutPassword,
        });
    }
    catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ message: "Internal server error." });
    }
});
exports.loginUser = loginUser;
// export const approveUser = async (req: Request, res: Response): Promise<void> => {
//   try {
//     const userId = Number(req.params.userId);
//     const { status } = req.body;
//     const allowedStatuses = ["approved", "blocked", "unblocked"] as const;
//     type StatusType = (typeof allowedStatuses)[number];
//     if (isNaN(userId) || !allowedStatuses.includes(status as StatusType)) {
//       res.status(400).json({ message: "Invalid user ID or status." });
//       return;
//     }
//     const result = await db.select().from(users).where(eq(users.id, userId));
//     const user = result[0];
//     if (!user) {
//       res.status(404).json({ message: "User not found." });
//       return;
//     }
//     // Already in desired state
//     if (
//       (status === "approved" && user.approved) ||
//       (status === "blocked" && user.isBlocked) ||
//       (status === "unblocked" && !user.isBlocked)
//     ) {
//       res.status(400).json({ message: `User is already ${status}.` });
//       return;
//     }
//     // Prepare update payload
//     const updateData: any = {};
//     if (status === "approved") {
//       updateData.approved = true;
//     } else {
//       updateData.isBlocked = status === "blocked";
//     }
//     // Update user record
//     await db.update(users).set(updateData).where(eq(users.id, userId));
//     // Only send email when approved
//     if (status === "approved") {
//       const transporter = nodemailer.createTransport({
//         service: "gmail",
//         auth: {
//           user: process.env.GMAIL_USER || "dinesh1804200182@gmail.com",
//           pass: process.env.GMAIL_PASS || "alrxrwgdsrixbuen",
//         },
//       });
//       await transporter.sendMail({
//         from: `"HRMS Admin" <admin@example.com>`,
//         to: user.email,
//         subject: "Your Account Has Been Approved",
//         html: getAccountApprovedEmailTemplate(user.firstname),
//       });
//     }
//     res.status(200).json({ message: `User ${status} successfully.` });
//   } catch (error) {
//     console.error("Update user status error:", error);
//     res.status(500).json({ message: "Internal server error." });
//   }
// };
const approveUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = Number(req.params.userId);
        const { status } = req.body;
        const allowedStatuses = ["approved", "blocked", "unblocked"];
        if (isNaN(userId) || !allowedStatuses.includes(status)) {
            res.status(400).json({ message: "Invalid user ID or status." });
            return;
        }
        // Get user data
        const result = yield db_1.db.select().from(UserSchema_1.users).where((0, drizzle_orm_1.eq)(UserSchema_1.users.id, userId));
        const user = result[0];
        if (!user) {
            res.status(404).json({ message: "User not found." });
            return;
        }
        //  Check department status before unblocking
        //  Check department status before unblocking
        //  Check department status before unblocking
        if (status === "unblocked") {
            if (user.departmentId) {
                // User has a department, check its status
                const deptResult = yield db_1.db
                    .select({ status: DepartmentSchema_1.departments.status })
                    .from(DepartmentSchema_1.departments)
                    .where((0, drizzle_orm_1.eq)(DepartmentSchema_1.departments.id, user.departmentId));
                if (deptResult.length === 0) {
                    res.status(404).json({ message: "User's department not found." });
                    return;
                }
                if (deptResult[0].status === 0) {
                    res
                        .status(400)
                        .json({ message: "Cannot unblock user. Department is inactive." });
                    return;
                }
            }
            // If departmentId is null → allow unblocking
        }
        // Already in desired state
        if ((status === "approved" && user.approved) ||
            (status === "blocked" && user.isBlocked) ||
            (status === "unblocked" && !user.isBlocked)) {
            res.status(400).json({ message: `User is already ${status}.` });
            return;
        }
        // Prepare update payload
        const updateData = {};
        if (status === "approved") {
            updateData.approved = true;
        }
        else {
            updateData.isBlocked = status === "blocked";
        }
        // Update user record
        yield db_1.db.update(UserSchema_1.users).set(updateData).where((0, drizzle_orm_1.eq)(UserSchema_1.users.id, userId));
        // Send email only when approved
        if (status === "approved") {
            const transporter = nodemailer_1.default.createTransport({
                service: "gmail",
                auth: {
                    user: process.env.GMAIL_USER || "dinesh1804200182@gmail.com",
                    pass: process.env.GMAIL_PASS || "alrxrwgdsrixbuen",
                },
            });
            yield transporter.sendMail({
                from: `"HRMS Admin" <admin@example.com>`,
                to: user.email,
                subject: "Your Account Has Been Approved",
                html: (0, accountApprovedEmailTemplate_1.getAccountApprovedEmailTemplate)(user.firstname),
            });
        }
        res.status(200).json({ message: `User ${status} successfully.` });
    }
    catch (error) {
        console.error("Update user status error:", error);
        res.status(500).json({ message: "Internal server error." });
    }
});
exports.approveUser = approveUser;
const getAllUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        const userRole = (_b = req.user) === null || _b === void 0 ? void 0 : _b.role;
        if (userRole !== 1) {
            res.status(403).json({ message: "Access denied. Admins only." });
            return;
        }
        // JOIN users with departments
        const allUsers = yield db_1.db
            .select({
            id: UserSchema_1.users.id,
            firstname: UserSchema_1.users.firstname,
            lastname: UserSchema_1.users.lastname,
            email: UserSchema_1.users.email,
            phone: UserSchema_1.users.phone,
            dob: UserSchema_1.users.dob,
            designation: UserSchema_1.users.designation,
            isBlocked: UserSchema_1.users.isBlocked,
            approved: UserSchema_1.users.approved,
            departmentId: UserSchema_1.users.departmentId,
            departmentName: DepartmentSchema_1.departments.title,
            currentPayroll: UserSchema_1.users.currentPayroll,
            promotionDate: UserSchema_1.users.promotionDate,
        })
            .from(UserSchema_1.users)
            .leftJoin(DepartmentSchema_1.departments, (0, drizzle_orm_1.eq)(UserSchema_1.users.departmentId, DepartmentSchema_1.departments.id));
        const filteredUsers = allUsers.filter((user) => user.id !== userId);
        res.status(200).json({
            message: "Admin fetched data successfully",
            users: filteredUsers,
        });
    }
    catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});
exports.getAllUsers = getAllUsers;
const getUserProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }
        // Fetch user with department name
        const result = yield db_1.db
            .select({
            id: UserSchema_1.users.id,
            firstname: UserSchema_1.users.firstname,
            lastname: UserSchema_1.users.lastname,
            email: UserSchema_1.users.email,
            phone: UserSchema_1.users.phone,
            dob: UserSchema_1.users.dob,
            role: UserSchema_1.users.role,
            designation: UserSchema_1.users.designation,
            approved: UserSchema_1.users.approved,
            isBlocked: UserSchema_1.users.isBlocked,
            currentPayroll: UserSchema_1.users.currentPayroll,
            promotionDate: UserSchema_1.users.promotionDate,
            departmentId: UserSchema_1.users.departmentId,
            departmentName: DepartmentSchema_1.departments.title
        })
            .from(UserSchema_1.users)
            .leftJoin(DepartmentSchema_1.departments, (0, drizzle_orm_1.eq)(UserSchema_1.users.departmentId, DepartmentSchema_1.departments.id))
            .where((0, drizzle_orm_1.eq)(UserSchema_1.users.id, userId));
        const user = result[0];
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        res.status(200).json({
            message: "User profile fetched successfully",
            user,
        });
    }
    catch (error) {
        console.error("Error fetching user profile:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});
exports.getUserProfile = getUserProfile;
const logoutUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(" ")[1];
        if (!token) {
            res.status(400).json({ message: "Unauthorized" });
            return;
        }
        blacklistedTokens.add(token);
        res.status(200).json({ message: "User logged out successfully" });
    }
    catch (error) {
        console.error("Logout error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});
exports.logoutUser = logoutUser;
// export const getAllUserNamesWithId = async (req: Request, res: Response): Promise<void> => {
//   try {
//     const userList = await db.select({
//       id: users.id,
//       firstname: users.firstname,
//     }).from(users);
//     res.status(200).json({ data: userList });
//   } catch (error) {
//     console.error('Error fetching user names:', error);
//     res.status(500).json({ message: 'Internal server error' });
//   }
// };
const getAllUserNamesWithId = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userList = yield db_1.db
            .select({
            id: UserSchema_1.users.id,
            firstname: UserSchema_1.users.firstname,
        })
            .from(UserSchema_1.users)
            .where((0, drizzle_orm_1.isNull)(UserSchema_1.users.departmentId)); //  Correct syntax
        res.status(200).json({ data: userList });
    }
    catch (error) {
        console.error("Error fetching user names:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});
exports.getAllUserNamesWithId = getAllUserNamesWithId;
const getUsersByDepartmentId = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { departmentId } = req.params;
        if (!departmentId) {
            res.status(400).json({ message: "Department ID is required" });
            return;
        }
        const userList = yield db_1.db
            .select()
            .from(UserSchema_1.users)
            .where((0, drizzle_orm_1.eq)(UserSchema_1.users.departmentId, Number(departmentId)));
        res.status(200).json({ data: userList });
    }
    catch (error) {
        console.error("Error fetching users by departmentId:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});
exports.getUsersByDepartmentId = getUsersByDepartmentId;
