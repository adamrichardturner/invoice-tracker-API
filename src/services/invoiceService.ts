import { pool } from "../config/database";
import Decimal from "decimal.js";
import { Invoice } from "../models/invoice";
import {
    decodeInvoiceCursor,
    encodeInvoiceCursor,
    GetInvoicesOptions,
    PaginatedInvoices,
} from "../utils/pagination";

export class InvoiceService {
    static async createInvoice(data: Invoice): Promise<Invoice> {
        const {
            bill_from_street_address,
            bill_from_city,
            bill_from_postcode,
            bill_from_country,
            bill_to_email,
            bill_to_name,
            bill_to_street_address,
            bill_to_city,
            bill_to_postcode,
            bill_to_country,
            invoice_date,
            payment_terms,
            project_description,
            items,
            status,
        } = data;

        const client = await pool.connect();

        try {
            await client.query("BEGIN");

            let invoiceTotal = new Decimal(0);
            for (const item of items || []) {
                const itemTotal = new Decimal(item.item_price).mul(
                    item.item_quantity,
                );
                invoiceTotal = invoiceTotal.add(itemTotal);
            }

            const invoiceTotalNumber = invoiceTotal.toNumber();

            const result = await client.query(
                `INSERT INTO invoices (
                    bill_from_street_address, bill_from_city, bill_from_postcode, bill_from_country,
                    bill_to_email, bill_to_name, bill_to_street_address, bill_to_city,
                    bill_to_postcode, bill_to_country, invoice_date, payment_terms,
                    project_description, status, invoice_total
                ) VALUES (
                    $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15
                ) RETURNING *`,
                [
                    bill_from_street_address,
                    bill_from_city,
                    bill_from_postcode,
                    bill_from_country,
                    bill_to_email,
                    bill_to_name,
                    bill_to_street_address,
                    bill_to_city,
                    bill_to_postcode,
                    bill_to_country,
                    invoice_date,
                    payment_terms,
                    project_description,
                    status,
                    invoiceTotalNumber,
                ],
            );
            const invoice_id = result.rows[0].id;

            for (const item of items || []) {
                await client.query(
                    `INSERT INTO invoice_items (
                        invoice_id, item_description, item_quantity, item_price, item_total
                    ) VALUES ($1, $2, $3, $4, $5)`,
                    [
                        invoice_id,
                        item.item_description,
                        item.item_quantity,
                        item.item_price,
                        new Decimal(item.item_price)
                            .mul(item.item_quantity)
                            .toNumber(),
                    ],
                );
            }

            await client.query("COMMIT");

            return {
                ...result.rows[0],
                items,
            };
        } catch (err) {
            await client.query("ROLLBACK");
            throw err;
        } finally {
            client.release();
        }
    }

    static async getInvoices(
        options: GetInvoicesOptions = {},
    ): Promise<PaginatedInvoices<Invoice>> {
        const limit = Math.min(Math.max(options.limit ?? 20, 1), 50);
        const statuses = options.statuses ?? [];

        const values: Array<string | number | string[]> = [];
        const whereClauses: string[] = [];

        if (statuses.length > 0) {
            values.push(statuses);
            whereClauses.push(`status = ANY($${values.length}::text[])`);
        }

        if (options.cursor) {
            const decoded = decodeInvoiceCursor(options.cursor);
            values.push(decoded.createdAt);
            const createdAtParam = values.length;
            values.push(decoded.id);
            const idParam = values.length;
            whereClauses.push(
                `(created_at, id) < ($${createdAtParam}::timestamptz, $${idParam}::int)`,
            );
        }

        const whereSql =
            whereClauses.length > 0
                ? `WHERE ${whereClauses.join(" AND ")}`
                : "";

        const countValues: Array<string[]> = [];
        let countWhereSql = "";
        if (statuses.length > 0) {
            countValues.push(statuses);
            countWhereSql = "WHERE status = ANY($1::text[])";
        }

        const countResult = await pool.query(
            `SELECT COUNT(*)::int AS count FROM invoices ${countWhereSql}`,
            countValues,
        );
        const totalCount: number = countResult.rows[0].count;

        values.push(limit + 1);
        const limitParam = values.length;

        const invoicesResult = await pool.query(
            `SELECT * FROM invoices
             ${whereSql}
             ORDER BY created_at DESC, id DESC
             LIMIT $${limitParam}`,
            values,
        );

        const rows = invoicesResult.rows;
        const hasMore = rows.length > limit;
        const pageRows = hasMore ? rows.slice(0, limit) : rows;

        const lastRow = pageRows[pageRows.length - 1] as
            | { created_at: Date | string; id: number | string }
            | undefined;

        const nextCursor =
            hasMore && lastRow
                ? encodeInvoiceCursor(lastRow.created_at, Number(lastRow.id))
                : null;

        const data: Invoice[] = pageRows.map((invoice) => ({
            ...invoice,
            id: String(invoice.id),
            items: [],
        }));

        return {
            data,
            nextCursor,
            hasMore,
            totalCount,
        };
    }

    static async getInvoiceById(id: number): Promise<Invoice> {
        try {
            const invoiceResult = await pool.query(
                "SELECT * FROM invoices WHERE id = $1",
                [id],
            );
            if (invoiceResult.rows.length === 0) {
                throw new Error("Invoice not found");
            }

            const invoice = invoiceResult.rows[0];

            const itemsResult = await pool.query(
                "SELECT * FROM invoice_items WHERE invoice_id = $1",
                [id],
            );
            invoice.items = itemsResult.rows;

            return invoice;
        } catch (err) {
            throw err;
        }
    }

    static async updateInvoice(id: number, data: Invoice): Promise<Invoice> {
        const {
            status,
            project_description,
            invoice_date,
            payment_terms,
            bill_from_street_address,
            bill_from_city,
            bill_from_postcode,
            bill_from_country,
            bill_to_name,
            bill_to_email,
            bill_to_street_address,
            bill_to_city,
            bill_to_postcode,
            bill_to_country,
            items,
        } = data;

        const client = await pool.connect();

        try {
            await client.query("BEGIN");

            let invoiceTotal = new Decimal(0);
            for (const item of items || []) {
                const itemTotal = new Decimal(item.item_price).mul(
                    item.item_quantity,
                );
                invoiceTotal = invoiceTotal.add(itemTotal);
            }

            const invoiceTotalNumber = invoiceTotal.toNumber();

            const result = await client.query(
                `UPDATE invoices SET
                    bill_from_street_address = $1,
                    bill_from_city = $2,
                    bill_from_postcode = $3,
                    bill_from_country = $4,
                    bill_to_email = $5,
                    bill_to_name = $6,
                    bill_to_street_address = $7,
                    bill_to_city = $8,
                    bill_to_postcode = $9,
                    bill_to_country = $10,
                    invoice_date = $11,
                    payment_terms = $12,
                    project_description = $13,
                    status = $14,
                    invoice_total = $15,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = $16 RETURNING *`,
                [
                    bill_from_street_address,
                    bill_from_city,
                    bill_from_postcode,
                    bill_from_country,
                    bill_to_email,
                    bill_to_name,
                    bill_to_street_address,
                    bill_to_city,
                    bill_to_postcode,
                    bill_to_country,
                    new Date(invoice_date),
                    payment_terms,
                    project_description,
                    status,
                    invoiceTotalNumber,
                    id,
                ],
            );

            await client.query(
                `DELETE FROM invoice_items WHERE invoice_id = $1`,
                [id],
            );

            for (const item of items || []) {
                await client.query(
                    `INSERT INTO invoice_items (
                        invoice_id, item_description, item_quantity, item_price, item_total
                    ) VALUES ($1, $2, $3, $4, $5)`,
                    [
                        id,
                        item.item_description,
                        item.item_quantity,
                        item.item_price,
                        new Decimal(item.item_price)
                            .mul(item.item_quantity)
                            .toNumber(),
                    ],
                );
            }

            const itemsResult = await client.query(
                `SELECT item_description, item_quantity, item_price, item_total 
                 FROM invoice_items WHERE invoice_id = $1`,
                [id],
            );

            await client.query("COMMIT");

            return {
                ...result.rows[0],
                items: itemsResult.rows,
            };
        } catch (err) {
            await client.query("ROLLBACK");
            throw err;
        } finally {
            client.release();
        }
    }

    static async updateInvoiceStatus(
        id: number,
        status: string,
    ): Promise<Invoice> {
        const client = await pool.connect();

        try {
            await client.query("BEGIN");

            const result = await client.query(
                `UPDATE invoices SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *`,
                [status, id],
            );

            if (result.rowCount === 0) {
                await client.query("ROLLBACK");
                throw new Error("Invoice not found");
            }

            const itemsResult = await client.query(
                `SELECT item_description, item_quantity, item_price, item_total 
                 FROM invoice_items WHERE invoice_id = $1`,
                [id],
            );

            await client.query("COMMIT");

            return {
                ...result.rows[0],
                items: itemsResult.rows,
            };
        } catch (err) {
            await client.query("ROLLBACK");
            throw err;
        } finally {
            client.release();
        }
    }

    static async deleteInvoice(id: number): Promise<void> {
        const client = await pool.connect();

        try {
            await client.query("BEGIN");

            const invoiceResult = await client.query(
                "SELECT id FROM invoices WHERE id = $1",
                [id],
            );

            if (invoiceResult.rowCount === 0) {
                await client.query("ROLLBACK");
                throw new Error("Invoice not found");
            }

            await client.query(
                "DELETE FROM invoice_items WHERE invoice_id = $1",
                [id],
            );
            await client.query("DELETE FROM invoices WHERE id = $1", [id]);

            await client.query("COMMIT");
        } catch (err) {
            await client.query("ROLLBACK");
            throw err;
        } finally {
            client.release();
        }
    }
}
