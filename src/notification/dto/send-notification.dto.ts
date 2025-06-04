import { IsNotEmpty, isNotEmpty, IsString } from "class-validator";

export class SendNotificationDto {
@IsString()
@IsNotEmpty()
  userId: string;


@IsString()
@IsNotEmpty()
  type: string; 


@IsString()
@IsNotEmpty()
  context: Record<string, any>; // template context
}
