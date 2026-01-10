import { Controller, Post, Body, HttpCode, HttpStatus, Res, Req, Get, UseGuards, Param, NotFoundException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { UsersService } from '../user/user.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthGuard } from '@nestjs/passport';
import { VerifyResetOtpDto } from '../mail/verifyresetotp.dto';
import { ApiSuccessResponse, ApiErrorResponse } from '../../common/dto/api-response.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import express from 'express';
import { FastifyReply } from 'fastify';


@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }
  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'User registered successfully', type: ApiSuccessResponse })
  @ApiResponse({ status: 400, description: 'Bad Request - Validation failed', type: ApiErrorResponse })
  @ApiResponse({ status: 409, description: 'Conflict - Email already exists', type: ApiErrorResponse })
  async register(@Body() registerDto: RegisterDto) {
    const result = await this.authService.register(registerDto);
    return new ApiSuccessResponse(result, 'User registered successfully', HttpStatus.CREATED);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login and get JWT token' })
  @ApiResponse({ status: 200, description: 'Login successful', type: ApiSuccessResponse })
  @ApiResponse({ status: 401, description: 'Invalid credentials', type: ApiErrorResponse })
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: express.Response
  ) {
    console.log(loginDto);
    const result = await this.authService.login(loginDto);

    res.cookie('token', result.access_token, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 ngày
    });

    return {
      success: true,
      statusCode: 200,
      message: 'Login successfulaa',
      data: {
        user: result.user,
        token: result.access_token,
      },
      timestamp: new Date().toISOString(),
    };
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Redirect to Google login page' })
  @ApiResponse({ status: 200, description: 'Redirecting to Google login' })
  async googleAuth() {
    // Redirects to Google

  }

  @Get('google/redirect')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req: Request, @Res() res: express.Response) {
    const googleUser = (req as any).user;

    // Gọi service để xử lý lưu user nếu cần và tạo JWT
    const result = await this.authService.handleGoogleLogin(googleUser);
    // Lưu JWT vào cookie
    console.log(result);
    res.cookie('token', result.access_token, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 ngày
    });

    // Redirect kèm thông tin user trong localStorage (tùy bạn xử lý ở FE)
    return res.redirect(
      `http://localhost:5173/login-success?token=${encodeURIComponent(result.access_token)}&name=${encodeURIComponent(googleUser.name)}&email=${encodeURIComponent(googleUser.email)}`
    )
  }

  @Post('request-reset-password')
  async requestResetPassword(@Body('email') email: string) {
    return this.authService.requestResetPassword(email);
  }

  @Post('verify-reset-otp')
  async verifyResetOtp(@Body() dto: VerifyResetOtpDto) {
    return this.authService.verifyResetOtp(dto);
  }

  @Post('reset-password')
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto);
  }


  @Post('logout')
logout(@Res({ passthrough: true }) res: express.Response) {
  res.clearCookie('token', {
    path: '/',
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
  });
  return { message: 'Logged out' };
}

@Post('change-password')
async changePassword(@Body() body: { userId: string; currentPassword: string; newPassword: string }) {
  return this.authService.changePassword(body.userId, body.currentPassword, body.newPassword);
}



}
