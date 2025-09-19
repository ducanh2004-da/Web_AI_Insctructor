// // test.resolver.ts
// import { Resolver, Mutation, Args } from '@nestjs/graphql';
// import { Response } from '../common/model/DTO/message/messageResponse.model';
// import { TestService } from './test.service';
// import { CreateMessageInput } from '../common/model/DTO/message/createMessage2.model';

// @Resolver(() => Response)
// export class TestResolver {
//   constructor(private readonly testService: TestService) {}

//   @Mutation(() => Response)
//   async createMessage(
//     @Args('data') data: CreateMessageInput,
//   ): Promise<Response> {
//     return this.testService.streamChatFromFastApi(data);
//   }
// }
