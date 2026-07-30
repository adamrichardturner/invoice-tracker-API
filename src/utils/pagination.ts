export type InvoiceStatusFilter = "draft" | "pending" | "paid";

export interface InvoiceCursor {
    createdAt: string;
    id: number;
}

export interface GetInvoicesOptions {
    limit?: number;
    cursor?: string | null;
    statuses?: InvoiceStatusFilter[];
}

export interface PaginatedInvoices<T> {
    data: T[];
    nextCursor: string | null;
    hasMore: boolean;
    totalCount: number;
}

export function encodeInvoiceCursor(createdAt: Date | string, id: number): string {
    const payload: InvoiceCursor = {
        createdAt: new Date(createdAt).toISOString(),
        id,
    };

    return Buffer.from(JSON.stringify(payload)).toString("base64url");
}

export function decodeInvoiceCursor(cursor: string): InvoiceCursor {
    try {
        const parsed = JSON.parse(
            Buffer.from(cursor, "base64url").toString("utf8"),
        ) as InvoiceCursor;

        if (
            typeof parsed.createdAt !== "string" ||
            typeof parsed.id !== "number" ||
            Number.isNaN(parsed.id)
        ) {
            throw new Error("Invalid cursor payload");
        }

        return parsed;
    } catch {
        throw new Error("Invalid cursor");
    }
}
