import { CookieOptions, Response } from "express";

const TOKEN_MAX_AGE_MS = 24 * 60 * 60 * 1000;

export function getAuthCookieOptions(): CookieOptions {
    const isProduction = process.env.NODE_ENV === "production";

    return {
        ...(isProduction ? { domain: ".adamrichardturner.dev" } : {}),
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? "none" : "lax",
        maxAge: TOKEN_MAX_AGE_MS,
    };
}

export function setAuthCookie(res: Response, token: string): void {
    res.cookie("token", token, getAuthCookieOptions());
}

export function clearAuthCookie(res: Response): void {
    const isProduction = process.env.NODE_ENV === "production";

    res.clearCookie("token", {
        ...(isProduction ? { domain: ".adamrichardturner.dev" } : {}),
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? "none" : "lax",
    });
}
