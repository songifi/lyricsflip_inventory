export type JwtPayload = {
  sub: string;
  email: string;
  name: string;
  roles?: string[];
};
