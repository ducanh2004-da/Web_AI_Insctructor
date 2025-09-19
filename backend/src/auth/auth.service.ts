import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import {
  RegisterInput,
  LoginInput,
  GoogleLoginInput,
} from '@/common/model/DTO/auth/auth.input';
import { AuthResponse } from '@/common/model/DTO/auth/auth.response';
import { AuthResponseRegis } from '@/common/model/DTO/auth/auth.responseRegis';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { AuthDAO } from '@/auth/auth.dao';

@Injectable()
export class AuthService {
  constructor(
    private authDAO: AuthDAO,
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  // ✅ Sửa lỗi xử lý email đã tồn tại
  async register(data: RegisterInput): Promise<AuthResponseRegis> {
    try {
      const existingUser = await this.authDAO.findUserByEmail(data.email);

      if (existingUser) {
        throw new ConflictException('Email already exists');
      }
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
      const hashedPassword = await bcrypt.hash(data.password, 10);
      const user = await this.authDAO.createUser({
        email: data.email,
        username: 'testuser',
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        password: hashedPassword,
        role: 'USER',
      });

      return {
        success: true,
        message: 'User registered successfully',
        // token: this.jwtService.sign({ id: user.id, role: user.role }),
      };
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  // ✅ Sửa lỗi khi email không tồn tại hoặc mật khẩu sai
  async login(data: LoginInput): Promise<AuthResponse> {
    const user = await this.authDAO.findUserByEmail(data.email);

    if (!user) {
      return {
        success: false,
        message: 'Email or password is incorrect',
        token: undefined,
      };
    }

    const isPasswordValid = await bcrypt
      .compare(data.password, user.password)
      .catch(() => false);
    if (!isPasswordValid) {
      return {
        success: false,
        message: 'Email or password is incorrect',
        token: undefined,
      };
    }

    const token = this.jwtService.sign({ id: user.id, role: user.role });

    return {
      success: true,
      message: 'Login successful',
      token,
    };
  }

  // ✅ Kiểm tra Google ID trước khi tạo user mới
  async googleLogin(data: GoogleLoginInput): Promise<AuthResponse> {
    if (!data.googleId || !data.email) {
      throw new BadRequestException('Google ID and email are required');
    }

    let user = await this.authDAO.findUserByEmail(data.email);

    let isNewUser = false;
    if (!user) {
      isNewUser = true;
      user = await this.authDAO.createUser({
        email: data.email,
        googleId: data.googleId,
        role: 'USER',
      });
    } else if (!user.googleId) {
      // Nếu user đã tồn tại nhưng chưa có googleId, cập nhật
      user = await this.authDAO.updateUserGoogleId(data.email, data.googleId);
    }

    return {
      success: true,
      message: isNewUser
        ? 'New user created via Google login'
        : 'Google login successful',
      token: this.jwtService.sign({ id: user.id, role: user.role }),
    };
  }

  // ✅ Kiểm tra context trước khi xóa JWT
  async logout(context): Promise<boolean> {
    if (
      !context ||
      !context.res ||
      typeof context.res.clearCookie !== 'function'
    ) {
      throw new UnauthorizedException('Logout failed: Invalid request context');
    }

    context.res.clearCookie('jwt');
    return true;
  }
}
