export const departmentChangeEmailTemplate = (
  userFirstName: string | null,
  oldDepartmentTitle: string,
  newDepartmentTitle: string
): string => {
  const name = userFirstName ?? "Employee";
  return `
  <html>
  <body style="font-family: Arial, sans-serif; color: #333;">
    <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 8px;">
      <tr style="background-color: #004080; color: #fff;">
        <td style="padding: 20px; text-align: center; font-size: 24px; font-weight: bold;">
          Yiron Technologies Pvt Ltd
        </td>
      </tr>
      <tr>
        <td style="padding: 20px; font-size: 16px;">
          <p>Hello <strong>${name}</strong>,</p>

          <p>We would like to inform you that your department has been changed from:</p>
          <p style="margin-left: 20px;"><em>"${oldDepartmentTitle}"</em></p>
          <p>to:</p>
          <p style="margin-left: 20px; font-weight: bold; color: #004080;">"${newDepartmentTitle}"</p>

          <p>If you have any questions or need further assistance, please contact the HR department.</p>

          <p>Best regards,<br/>
          <strong>Yiron Technologies Pvt Ltd</strong></p>
        </td>
      </tr>
      <tr style="background-color: #f5f5f5; text-align: center; padding: 10px; font-size: 12px; color: #999;">
        <td style="padding: 10px;">
          &copy; ${new Date().getFullYear()} Yiron Technologies Pvt Ltd. All rights reserved.
        </td>
      </tr>
    </table>
  </body>
  </html>
  `;
};
