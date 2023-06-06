import { createParamDecorator, ExecutionContext } from '@nestjs/common';

const Authentication = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request._user;
  },
);

export default Authentication;
