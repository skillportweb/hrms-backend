"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAccountApprovedEmailTemplate = void 0;
const getAccountApprovedEmailTemplate = (firstname) => {
    const displayName = firstname !== null && firstname !== void 0 ? firstname : 'User';
    return `
    <div style="font-family: Arial, sans-serif; line-height: 1.6;">
      <h2 style="color: #4CAF50;">Account Approved 🎉</h2>
      <p>Hi <strong>${displayName}</strong>,</p>
      <p>We're happy to inform you that your account has been <strong>approved</strong> by the HRMS administrator.</p>
      <p>You can now log in to your account and start using the platform.</p>
      <a href="#" style="display: inline-block; padding: 10px 20px; background-color: #4CAF50; color: #fff; text-decoration: none; border-radius: 5px;">Login Now</a>
      <br/><br/>
      <p style="color: #888;">If you have any questions, feel free to contact support.</p>
      <br/>
      <p>Regards,<br/>HRMS Team</p>
    </div>
  `;
};
exports.getAccountApprovedEmailTemplate = getAccountApprovedEmailTemplate;
