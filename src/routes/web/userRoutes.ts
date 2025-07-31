
import { verifyToken } from './../../middleware/authMiddleware';
import express, { Router } from "express";
import {
  approveUser,
  getAllUsers,
  getUserProfile,
  loginUser,
  logoutUser,
  usersRegistration
} from './../../controllers/web/UserController';
import {
  applyLeave,
  getAllLeaveRequestsWithUserInfo,
  getApprovedAndRejectedLeaveRequests,
  getPendingLeaveRequests,
  getSingleLeaveRequestById,
  getUserapplyLeaves,
  getUserLeaveBalance,
  updateLeaveStatus,
  yearlyLeaving
} from './../../controllers/web/UserLeaveController';
import { addUserAttendance, ApproveMissPunchOut, getUserAttendanceById, punchOutAttendance, RequestMissPunchOut, } from '../../controllers/web/AttendanceController';
import { addHoliday, getAllHolidays } from '../../controllers/web/HolidaysController';

const usersRoute: Router = express.Router();

usersRoute.post("/register", usersRegistration);
usersRoute.post("/login", loginUser);
usersRoute.get('/all-users', verifyToken, getAllUsers);
usersRoute.put('/approve-user/:userId', verifyToken, approveUser);
usersRoute.get('/profile', verifyToken, getUserProfile);
usersRoute.post('/logout', verifyToken, logoutUser);

usersRoute.post("/admingivenleave/:userId", verifyToken, yearlyLeaving);
usersRoute.get("/leave-balance/:userId", verifyToken, getUserLeaveBalance);
usersRoute.post("/userleaveapply/:userId", verifyToken, applyLeave);
usersRoute.put("/leave-status/:id", verifyToken, updateLeaveStatus);
usersRoute.get("/getallleaveapplication", verifyToken, getAllLeaveRequestsWithUserInfo);
usersRoute.get("/get-approvedandrejected-leaverequests", verifyToken, getApprovedAndRejectedLeaveRequests);
usersRoute.get("/get-single-leaverequest/:id", verifyToken, getSingleLeaveRequestById);
usersRoute.get("/get-pending-leaverequests", verifyToken, getPendingLeaveRequests); 
usersRoute.get("/get-apply-leaves/:userId", verifyToken, getUserapplyLeaves); 


// userAttendance

usersRoute.post("/add-user-attendance", verifyToken, addUserAttendance); 
usersRoute.post("/attendance-punchout", verifyToken, punchOutAttendance);
usersRoute.get("/get-attendance/:userId", verifyToken, getUserAttendanceById);
usersRoute.post("/request-miss-punchout/:userId", verifyToken, RequestMissPunchOut);
usersRoute.put("/approve-miss-punchout/:requestId", verifyToken, ApproveMissPunchOut);

// Holiday
usersRoute.post("/add-holidays", verifyToken, addHoliday);
usersRoute.get("/get-all-holiday",  verifyToken, getAllHolidays);

 




export default usersRoute; 
