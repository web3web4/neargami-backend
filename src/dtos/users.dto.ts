import { IsString, IsNotEmpty, MinLength, MaxLength, IsDate, IsUUID, IsNumber } from 'class-validator';

export class CreateUserDto {
  public firstname?: string;
  public lastname?: string;
  public address: string;

  public message?: string;

  public signature: string;

  public phone: string;

  public linkedin?: string;

  public about?: string;

  public slug?: string;

  public score: number;

  public createdAt: Date;
  country?: string;
  discord?: string;
  facebook?: string;
  twitter?: string;
}

export class UpdateUserDto {
  @MinLength(9)
  address?: string;
  signature?: string;
  message?: string;
  firstname?: string;
  lastname?: string;
  phone?: string;
  linkedin?: string;
  score?: number;
  about?: string;
  slug?: string;
  country?: string;
  discord?: string;
  facebook?: string;
  twitter?: string;
}
