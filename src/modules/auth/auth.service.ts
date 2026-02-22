import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../database/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { MailService } from '../mail/mail.service';
import { addMinutes, isAfter } from 'date-fns';
import { VerifyResetOtpDto } from '../mail/verifyresetotp.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import * as bcrypt from 'bcrypt';
import { generateSlug } from '../../ultils/slug.util';

type GoogleUserProfile = {
  email: string;
  name: string;
};

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private mailService: MailService,
  ) {}

  // ================= REGISTER =================
  async register(dto: RegisterDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        name: dto.name,
        slug: generateSlug(dto.name),
        passwordHash: hashedPassword,

        wallet: {
          create: {
            availableBalance: 0,
            pendingBalance: 0,
          },
        },
      },
    });

    const result = { ...user };
    Reflect.deleteProperty(result, 'passwordHash');
    return result;
  }

  // ================= LOGIN =================
  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      include: { wallet: true },
    });

    if (
      !user ||
      !user.passwordHash ||
      !(await bcrypt.compare(dto.password, user.passwordHash))
    ) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { sub: user.id, email: user.email, role: user.role };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        wallet: user.wallet?.availableBalance ?? 0,
      },
    };
  }

  // ================= GOOGLE LOGIN =================
  async handleGoogleLogin(googleUser: GoogleUserProfile) {
    const { email, name } = googleUser;

    let user = await this.prisma.user.findUnique({
      where: { email },
      include: { wallet: true },
    });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          email,
          name,
          slug: generateSlug(name),
          passwordHash: '',

          wallet: {
            create: {
              availableBalance: 0,
              pendingBalance: 0,
            },
          },
        },
        include: { wallet: true },
      });
    }

    const access_token = await this.jwtService.signAsync(
      { sub: user.id, email: user.email },
      { expiresIn: '7d' },
    );

    return { user, access_token };
  }

  // ================= RESET PASSWORD =================
  async requestResetPassword(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new BadRequestException('Email không tồn tại');

    if (!user.passwordHash)
      throw new BadRequestException('Tài khoản đăng nhập Google');

    const latestOtp = await this.prisma.otpVerification.findFirst({
      where: { email, used: false },
      orderBy: { createdAt: 'desc' },
    });

    if (latestOtp && isAfter(addMinutes(latestOtp.createdAt, 5), new Date())) {
      throw new BadRequestException('Chỉ được gửi lại OTP sau 5 phút');
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    await this.prisma.otpVerification.create({
      data: { email, otp },
    });

    await this.mailService.sendOtpEmail(email, otp);
    return { message: 'OTP đã được gửi' };
  }

  async verifyResetOtp(dto: VerifyResetOtpDto) {
    const record = await this.prisma.otpVerification.findFirst({
      where: {
        email: dto.email,
        otp: dto.otp,
        used: false,
        createdAt: { gte: new Date(Date.now() - 5 * 60 * 1000) },
      },
    });

    if (!record) {
      return { success: false, message: 'OTP không hợp lệ' };
    }

    await this.prisma.otpVerification.update({
      where: { id: record.id },
      data: { used: true },
    });

    return { success: true };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (!user) throw new NotFoundException('User not found');

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    await this.prisma.user.update({
      where: { email: dto.email },
      data: { passwordHash: hashedPassword },
    });

    await this.prisma.otpVerification.deleteMany({
      where: { email: dto.email },
    });

    return { message: 'Đặt lại mật khẩu thành công' };
  }
  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) throw new Error('User not found');

    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch) throw new Error('Current password is incorrect');

    const newHashed = await bcrypt.hash(newPassword, 10);

    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash: newHashed },
    });

    return { message: 'Password changed successfully' };
  }
}
