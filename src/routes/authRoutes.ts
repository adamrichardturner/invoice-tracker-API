import express, { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { pool } from "../config/database";
import bcrypt from "bcrypt";
import { clearAuthCookie, setAuthCookie } from "../utils/authCookies";

interface AuthTokenPayload {
    id: string;
    email: string;
}

const router = express.Router();
const TOKEN_EXPIRES_IN = "24h";

function isAuthTokenPayload(value: unknown): value is AuthTokenPayload {
    if (typeof value !== "object" || value === null) {
        return false;
    }

    if (!("id" in value) || !("email" in value)) {
        return false;
    }

    return typeof value.id === "string" && typeof value.email === "string";
}

function getJwtSecret(): string {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error("JWT_SECRET is not configured");
    }
    return secret;
}

function signAuthToken(payload: AuthTokenPayload): string {
    return jwt.sign(payload, getJwtSecret(), {
        expiresIn: TOKEN_EXPIRES_IN,
    });
}

router.post("/demo-login", async (req: Request, res: Response) => {
    try {
        const demoCredentials = {
            email: process.env.DEMO_EMAIL,
            password: process.env.DEMO_PASSWORD,
        };

        if (!demoCredentials.email || !demoCredentials.password) {
            return res
                .status(500)
                .json({ message: "Demo credentials not configured" });
        }

        const result = await pool.query(
            "SELECT id, email, password_hash FROM users WHERE email = $1",
            [demoCredentials.email],
        );

        if (result.rows.length === 0) {
            return res.status(401).json({ message: "Demo user not found" });
        }

        const user = result.rows[0];

        const isValidPassword = await bcrypt.compare(
            demoCredentials.password,
            user.password_hash,
        );

        if (!isValidPassword) {
            return res
                .status(401)
                .json({ message: "Invalid demo credentials" });
        }

        const token = signAuthToken({ id: user.id, email: user.email });
        setAuthCookie(res, token);

        return res.json({ success: true });
    } catch (error) {
        console.error("Demo login error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
});

router.post("/refresh", async (req: Request, res: Response) => {
    const tokenCookie = req.cookies.token;
    const token = typeof tokenCookie === "string" ? tokenCookie : undefined;

    if (!token) {
        clearAuthCookie(res);
        return res
            .status(401)
            .json({ message: "No token, authorization denied" });
    }

    try {
        const decoded = jwt.verify(token, getJwtSecret());

        if (!isAuthTokenPayload(decoded)) {
            clearAuthCookie(res);
            return res.status(401).json({ message: "Token is not valid" });
        }

        const refreshedToken = signAuthToken({
            id: decoded.id,
            email: decoded.email,
        });
        setAuthCookie(res, refreshedToken);

        return res.json({ success: true });
    } catch {
        clearAuthCookie(res);
        return res.status(401).json({ message: "Token is not valid" });
    }
});

export default router;
