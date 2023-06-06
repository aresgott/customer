import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { AuthGuard } from './auth/auth.guard';
import { ApiBearerAuth, ApiSecurity } from '@nestjs/swagger';
import Authentication from './decorator/auth.decorator';
import AuthUserDTO from './auth/dto/auth.dto';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) { }

  @UseGuards(AuthGuard)
  @Get()
  @ApiBearerAuth()
  getHello(@Req() req:any): any {
    console.log(req.user)
    return this.appService.getHello();
  }
}
