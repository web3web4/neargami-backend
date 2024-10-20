import { IsString, IsNotEmpty, MinLength, MaxLength, IsDate, IsUUID, IsNumber, IsOptional } from 'class-validator';

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

  public createdAt: Date;
  country?: string;
  discord?: string;
  facebook?: string;
  twitter?: string;
}

export class UpdateUserDto {
  @IsString()
  @MaxLength(50)
  @IsOptional()
  public firstname?: string;
  @IsString()
  @MaxLength(50)
  @IsOptional()
  public email?: string;
  @IsString()
  @MaxLength(50)
  @IsOptional()
  public lastname?: string;
  @IsString()
  @MaxLength(50)
  @IsOptional()
  public phone?: string;
  @IsString()
  @MaxLength(60)
  @IsOptional()
  public linkedin?: string;
  @IsString()
  @IsOptional()
  public about?: string;
  @IsString()
  @MaxLength(50)
  @IsOptional()
  public country?: string;
  @IsString()
  @MaxLength(60)
  @IsOptional()
  public discord?: string;
  @IsString()
  @MaxLength(60)
  @IsOptional()
  public facebook?: string;
  @IsString()
  @MaxLength(60)
  @IsOptional()
  public twitter?: string;
  @IsString()
  @IsOptional()
  public image?: string;
}
