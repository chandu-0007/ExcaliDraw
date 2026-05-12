import type { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";


declare global {
  namespace Express {
    interface Request {
      user?: string | JwtPayload;
    }
  }
}

const auth = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.cookies?.token;
  const JWT_SECRET = process.env.JWT_SECRET;

  if (!JWT_SECRET) {
    return res.status(500).json({
      message: "JWT secret is not configured",
    });
  }

  if (!token) {
    return res.status(401).json({
      message: "Authentication token missing",
    });
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;

    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({
      message: "Invalid or expired token",
    });
  }
};

export default auth;