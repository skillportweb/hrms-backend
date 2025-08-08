export const updateMemberTemplate = (
  username: string,
  deptName: string,
  action: "added" | "removed"
) => {
  return `
    <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6; max-width: 600px; margin: auto; border: 1px solid #e0e0e0; padding: 20px; border-radius: 8px;">
      <h2 style="color: #2c3e50;">Hello ${username || "User"},</h2>
      <p>You have been <strong>${action}</strong> ${
        action === "added" ? "to" : "from"
      } the department: <strong>${deptName}</strong>.</p>
      <p>If you have any questions regarding this change, feel free to reach out to your administrator.</p>
      <br/>
      <p>Best regards,<br/>
      <strong>Yiron Technologies Pvt Ltd</strong><br/>
      Team Management System</p>
    </div>
  `;
};