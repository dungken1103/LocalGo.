import { IsEmail, IsInt, Min, Max, IsNotEmpty, Matches } from 'class-validator';

export class VerifyResetOtpDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @Matches(/^\d{6}$/, { message: 'OTP phải là 6 chữ số' })
  otp: string;
}
