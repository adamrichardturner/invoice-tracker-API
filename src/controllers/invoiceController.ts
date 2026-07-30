import { Request, Response } from "express";
import { InvoiceService } from "../services/invoiceService";

export const createInvoice = async (req: Request, res: Response) => {
    try {
        const invoice = await InvoiceService.createInvoice(req.body);
        res.status(201).json(invoice);
    } catch (err) {
        console.error("Error in createInvoice:", err);
        if (err instanceof Error) {
            res.status(500).json({
                error: "Server error",
                message: err.message,
                stack: err.stack,
            });
        } else {
            res.status(500).json({
                error: "Server error",
                message: "An unknown error occurred",
            });
        }
    }
};

export const getInvoices = async (req: Request, res: Response) => {
    try {
        const limitParam = req.query.limit;
        const cursorParam = req.query.cursor;
        const statusParam = req.query.status;

        const limit =
            typeof limitParam === "string"
                ? Number.parseInt(limitParam, 10)
                : 20;

        if (Number.isNaN(limit)) {
            res.status(400).json({ message: "Invalid limit" });
            return;
        }

        const cursor =
            typeof cursorParam === "string" && cursorParam.length > 0
                ? cursorParam
                : null;

        const statuses: Array<"draft" | "pending" | "paid"> = [];
        const allowedStatuses = new Set(["draft", "pending", "paid"]);

        if (typeof statusParam === "string") {
            for (const value of statusParam.split(",")) {
                const status = value.trim();
                if (status.length === 0) {
                    continue;
                }
                if (!allowedStatuses.has(status)) {
                    res.status(400).json({
                        message: `Invalid status: ${status}`,
                    });
                    return;
                }
                statuses.push(status as "draft" | "pending" | "paid");
            }
        }

        if (Array.isArray(statusParam)) {
            for (const value of statusParam) {
                if (typeof value !== "string") {
                    continue;
                }
                if (!allowedStatuses.has(value)) {
                    res.status(400).json({
                        message: `Invalid status: ${value}`,
                    });
                    return;
                }
                statuses.push(value as "draft" | "pending" | "paid");
            }
        }

        const result = await InvoiceService.getInvoices({
            limit,
            cursor,
            statuses,
        });

        res.json(result);
    } catch (err) {
        console.error("Error in getInvoices:", err);
        if (err instanceof Error && err.message === "Invalid cursor") {
            res.status(400).json({ message: "Invalid cursor" });
            return;
        }
        res.status(500).send("Server error.");
    }
};

export const getInvoiceById = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        const invoice = await InvoiceService.getInvoiceById(Number(id));
        res.json(invoice);
    } catch (err: unknown) {
        console.error("Error in getInvoiceById:", err);
        if (err instanceof Error) {
            if (err.message === "Invoice not found") {
                res.status(404).json({ message: "Invoice not found" });
            } else {
                res.status(500).json({
                    error: "Server error",
                    message: err.message,
                    stack: err.stack,
                });
            }
        } else {
            res.status(500).json({
                error: "Server error",
                message: "An unknown error occurred",
            });
        }
    }
};

export const updateInvoice = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        const invoice = await InvoiceService.updateInvoice(
            Number(id),
            req.body,
        );
        res.json(invoice);
    } catch (err) {
        console.error("Error in updateInvoice:", err);
        res.status(500).send("Server error.");
    }
};

export const updateInvoiceStatus = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { status } = req.body;

    try {
        const invoice = await InvoiceService.updateInvoiceStatus(
            Number(id),
            status,
        );
        res.json(invoice);
    } catch (err) {
        console.error("Error in updateInvoiceStatus:", err);
        res.status(500).send("Server error.");
    }
};

export const deleteInvoice = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        await InvoiceService.deleteInvoice(Number(id));
        res.send("Invoice deleted successfully.");
    } catch (err) {
        console.error("Error in deleteInvoice:", err);
        res.status(500).send("Server error.");
    }
};
