export const getRegistrationEmailTemplate = (
  firstname: string,
  lastname: string,
  email: string,
  designation: string
): string => {
  return `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <h2 style="color: #007BFF;">New Employee Registration Pending Approval</h2>
      <p>Hello Admin,</p>
      <p>A new employee has registered on the HRMS portal and is awaiting your approval to activate their account.</p>

      <h3>Employee Details:</h3>
      <table style="border-collapse: collapse; margin-top: 10px;">
        <tr>
          <td style="padding: 6px 12px;"><strong>Name:</strong></td>
          <td style="padding: 6px 12px;">${firstname} ${lastname}</td>
        </tr>
        <tr>
          <td style="padding: 6px 12px;"><strong>Email:</strong></td>
          <td style="padding: 6px 12px;">${email}</td>
        </tr>
        <tr>
          <td style="padding: 6px 12px;"><strong>Designation:</strong></td>
          <td style="padding: 6px 12px;">${designation}</td>
        </tr>
      </table>

      <p style="margin-top: 20px;">Please log in to the admin panel to review and approve this registration.</p>

      <a href="#" style="display: inline-block; margin-top: 15px; padding: 10px 20px; background-color: #007BFF; color: #fff; text-decoration: none; border-radius: 4px;">Go to Admin Panel</a>

      <br/><br/>
      <p style="color: #888;">This is an automated message from the HRMS system.</p>
      <p>Regards,<br/>HRMS System</p>
    </div>
  `;
};
