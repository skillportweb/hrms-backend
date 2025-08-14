
import { verifyToken } from './../../middleware/authMiddleware';
import express, { Router } from "express";
import {
  approveUser,
  getAllUserNamesWithId,
  getAllUsers,
  getUserProfile,
  getUsersByDepartmentId,
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
import { addUserAttendance, ApproveMissPunchOut, getUserAttendanceById, punchOutAttendance, RequestMissPunchOut,  ViewMissPunchout, } from '../../controllers/web/AttendanceController';
import { addHoliday, getAllHolidays } from '../../controllers/web/HolidaysController';
import { activateJob, addJob, deactivateJob, EditJob, getActiveJobs, getAllJobs, getJobById } from '../../controllers/admin/RecruitmentController';
import { addDepartment, changeUserDepartment, getAllDepartments, getAllDepartmentsTitle, getDepartmentById, updateDepartment, UpdateDepartmentStatus, } from '../../controllers/admin/DepartmentsController';
import { addDepartmentMembers, getUsersByDepartment } from '../../controllers/admin/MemberController';
import { getPromotionsByUserId, updateUserPromotion } from '../../controllers/admin/PayrollController';


const usersRoute: Router = express.Router();

usersRoute.post("/register", usersRegistration);
usersRoute.post("/login", loginUser);
usersRoute.get('/all-users', verifyToken, getAllUsers);
usersRoute.put('/approve-user/:userId', verifyToken, approveUser);
usersRoute.get('/profile', verifyToken, getUserProfile);
usersRoute.post('/logout', verifyToken, logoutUser);
usersRoute.get('/get-all-usernames-with-id', verifyToken, getAllUserNamesWithId);


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
usersRoute.get("/view-miss-punchout-request/:requestId", verifyToken, ViewMissPunchout);

// Holiday
usersRoute.post("/add-holidays", verifyToken, addHoliday);
usersRoute.get("/get-all-holiday",  verifyToken, getAllHolidays);

//  Recruitment

usersRoute.post("/add-job", verifyToken, addJob);
usersRoute.get("/get-all-jobs", verifyToken, getAllJobs);
usersRoute.get("/getjobdetails/:id",verifyToken, getJobById);
usersRoute.put("/edit-jobs/:id",verifyToken , EditJob);

usersRoute.patch("/activejob/:id",verifyToken , activateJob);
usersRoute.patch("/deactivatejob/:id",verifyToken , deactivateJob);
usersRoute.get("/get-active-jobs",verifyToken , getActiveJobs);

// Department
usersRoute.post("/add-department",verifyToken ,addDepartment);
usersRoute.get("/get-all-departments",verifyToken ,getAllDepartments);
usersRoute.put("/update-department/:id",verifyToken ,updateDepartment);
usersRoute.get("/get-department-by-id/:id",verifyToken ,getDepartmentById);
usersRoute.get("/get-all-departments-title",verifyToken,getAllDepartmentsTitle);
usersRoute.post("/add-department-members",verifyToken ,addDepartmentMembers);
usersRoute.get("/get-users-dy-department-id/:id",verifyToken ,getUsersByDepartment);
usersRoute.get("/get-users-by-departmentid/:departmentId",verifyToken ,getUsersByDepartmentId);
usersRoute.put("/update-department-status/:id",verifyToken, UpdateDepartmentStatus);
usersRoute.put("/change-department", verifyToken, changeUserDepartment);




usersRoute.put("/user-promotion/:id",verifyToken, updateUserPromotion);
usersRoute.get("/get-all-promotions/:id",verifyToken, getPromotionsByUserId);






export default usersRoute; 
