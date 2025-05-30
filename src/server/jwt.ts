import jwt, { JwtPayload, SignOptions } from "jsonwebtoken";

const DEFAULT_SIGN_OPTION: SignOptions = {
  expiresIn: "1h",
};

export function signJwtAccessToken(
  payload: JwtPayload,
  options: SignOptions = DEFAULT_SIGN_OPTION
) {
  const secret_key = process.env.JWT_SECRET_KEY;

  if (!secret_key) {
    throw new Error("JWT_SECRET_KEY is not defined in environment variables");
  }

  const token = jwt.sign(payload, secret_key, options);
  return token;
}

export function verifyJwt(token: string) {
  try {
    const secret_key = process.env.JWT_SECRET_KEY;

    if (!secret_key) {
      throw new Error("JWT_SECRET_KEY is not defined in environment variables");
    }

    const decoded = jwt.verify(token, secret_key);
    return decoded as JwtPayload;
  } catch (error) {
    console.log(error);
    return null;
  }
}
