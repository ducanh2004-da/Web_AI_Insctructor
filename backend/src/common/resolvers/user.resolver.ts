import { Resolver, Query, Mutation, Args, Context } from '@nestjs/graphql';
import { UserService } from '../providers/user.service';
import { UserResponse } from '../DTO/user/user.response';
import { CreateUserInput, UpdateUserInput } from '../DTO/user/user.input';
import { UseGuards } from '@nestjs/common';
import { AuthGuard, RolesGuard } from '../guards/auth.guard';
import { Roles } from '../decorators/roles.decorator';
import { AuthContext } from '../interfaces/auth.interface';

@Resolver(() => UserResponse)
@UseGuards(AuthGuard, RolesGuard)
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  @Query(() => [UserResponse], { name: 'users' })
  @Roles('ADMIN')
  async findAll() {
    return this.userService.findAll();
  }

  @Query(() => UserResponse, { name: 'user' })
  @Roles('USER', 'ADMIN')
  async findOne(
    @Args('id', { type: () => String }) id: string,
    @Context() ctx: AuthContext,
  ) {
    // Users can only view their own profile unless they're an admin
    if (ctx.user.role !== 'ADMIN' && id !== ctx.user.id) {
      throw new Error('You can only view your own profile');
    }
    return this.userService.findOne(id);
  }

  @Mutation(() => UserResponse, { name: 'createUser' })
  @Roles('ADMIN')
  async create(
    @Args('data', { type: () => CreateUserInput }) data: CreateUserInput,
  ) {
    return this.userService.create(data);
  }

  @Mutation(() => UserResponse, { name: 'updateUser' })
  @Roles('USER', 'ADMIN')
  async update(
    @Args('data', { type: () => UpdateUserInput }) data: UpdateUserInput,
    @Context() ctx: AuthContext,
  ) {
    // Users can only update their own profile unless they're an admin
    if (ctx.user.role !== 'ADMIN' && data.id !== ctx.user.id) {
      throw new Error('You can only update your own profile');
    }
    return this.userService.update(data);
  }

  @Mutation(() => Boolean, { name: 'deleteUser' })
  @Roles('ADMIN')
  async delete(@Args('id', { type: () => String }) id: string) {
    return this.userService.delete(id);
  }
}