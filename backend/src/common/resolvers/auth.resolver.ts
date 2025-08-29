import { Resolver, Mutation, Args, Context, Query } from '@nestjs/graphql';
import { AuthService } from '../providers/auth.service';
import {
  RegisterInput,
  LoginInput,
  GoogleLoginInput,
} from '../../common/DTO/auth/auth.input';
import { AuthResponse } from '../DTO/auth/auth.response';
import { UseGuards } from '@nestjs/common';
import { AuthGuard, RolesGuard } from '../guards/auth.guard';
import { Roles } from '../decorators/roles.decorator'; // Import Custom Decorator

@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Mutation(() => AuthResponse)
  async register(@Args('data') data: RegisterInput) {
    return this.authService.register(data);
  }

  @Mutation(() => AuthResponse)
  async login(@Args('data') data: LoginInput) {
    return this.authService.login(data);
  }

  @Mutation(() => AuthResponse)
  async googleLogin(@Args('data') data: GoogleLoginInput) {
    return this.authService.googleLogin(data);
  }

  @Mutation(() => Boolean)
  async logout(@Context() context) {
    return this.authService.logout(context);
  }

  @Query(() => String)
  @UseGuards(AuthGuard)
  hello() {
    return 'Hello World!';
  }

  @Query(() => String)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('ADMIN') // Đúng cách truyền role
  admin() {
    return 'Hello Admin!';
  }
}
