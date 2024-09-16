import { IsString, IsNotEmpty, MinLength, MaxLength } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  public address: string;

  @IsString()
  @IsNotEmpty()
  public message: string;

  @IsString()
  @IsNotEmpty()
  public signature: string;
}

export class UpdateUserDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(9)
  @MaxLength(32)
  public password: string;
}
