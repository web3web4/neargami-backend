import { IsString, IsNotEmpty, MinLength, MaxLength, IsDate, IsUUID, IsNumber } from 'class-validator';

export class CreateUserDto {
  public name: string;

  public address: string;

  public message?: string;

  public signature: string;

  public phone: string;

  public linkedin?: string;

  public about?: string;

  public slug?: string;

  public score: number;
  public createdAt: Date;
}

export class UpdateUserDto {
  @MinLength(9)
  @MaxLength(32)
  address?: string;
  signature?: string;
  message?: string;
  name?: string;
  phone?: string;
  linkedin?: string;
  score?: number;
  about?: string;
  slug?: string;
}
