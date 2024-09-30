import { IsString, IsNotEmpty, MinLength, MaxLength, IsNumber } from 'class-validator';

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

export class CreateProfileDto {
  @IsNumber()
  public userId: number;
  @IsString()
  public name: string;
  @IsString()
  public phone: string;
  @IsString()
  public linkedin: string;
  @IsString()
  public about: string;
}

export class UpdateUserDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(9)
  @MaxLength(32)
  public password: string;
}
