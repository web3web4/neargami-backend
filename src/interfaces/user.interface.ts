export interface IUser {
  [x: string]: any;
  id: string;
  firstname?: string;
  lastname?: string;
  address: string;
  message?: string;
  signature: string;
  phone: string;
  slug: string;
  linkedin: string;
  ngc: number;
  about: string;
  createdAt: Date;
  country?: string;
  discord?: string;
  facebook?: string;
  twitter?: string;
}
