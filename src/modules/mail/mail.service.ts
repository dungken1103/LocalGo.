import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
      },
    });
  }

  async sendOtpEmail(email: string, otp: string) {
    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: email,
      subject: 'Yêu cầu đặt lại mật khẩu',
      text: `Mã OTP đặt lại mật khẩu của bạn là: ${otp}. Mã này có hiệu lực trong 5 phút.`,
    };

    await this.transporter.sendMail(mailOptions);
  }
}
