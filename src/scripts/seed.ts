import { pool } from "../config/database";
import Decimal from "decimal.js";
import bcrypt from "bcrypt";

type PaymentTerms = "Net 30 Days" | "14 Days" | "7 Days";
type InvoiceStatus = "draft" | "pending" | "paid";

interface SeedItem {
    item_description: string;
    item_quantity: number;
    item_price: number;
}

type UKCountry = "England" | "Scotland" | "Wales" | "Northern Ireland";

interface AddressEntry {
    street: string;
    city: string;
    outward: string; // outward postcode area/district (e.g., W1S, M3, BT1)
    country: UKCountry;
}

const britishFirstNames = [
    "Oliver",
    "George",
    "Harry",
    "Jack",
    "Jacob",
    "Noah",
    "Charlie",
    "Thomas",
    "Oscar",
    "William",
    "Ava",
    "Isla",
    "Emily",
    "Sophia",
    "Grace",
    "Amelia",
    "Olivia",
    "Jessica",
    "Lily",
    "Sophie",
];

const britishSurnames = [
    "Smith",
    "Jones",
    "Taylor",
    "Brown",
    "Williams",
    "Wilson",
    "Johnson",
    "Davies",
    "Patel",
    "Wright",
    "Evans",
    "Thomas",
    "Roberts",
    "Walker",
    "Thompson",
    "White",
];

const RETAILER_ADDRESSES: AddressEntry[] = [
    {
        street: "12 Savile Row",
        city: "London",
        outward: "W1S",
        country: "England",
    },
    {
        street: "180 Sloane Street",
        city: "London",
        outward: "SW1X",
        country: "England",
    },
    {
        street: "25 Jermyn Street",
        city: "London",
        outward: "SW1Y",
        country: "England",
    },
    {
        street: "200 Regent Street",
        city: "London",
        outward: "W1B",
        country: "England",
    },
];

const CUSTOMER_ADDRESSES: AddressEntry[] = [
    {
        street: "1 Deansgate",
        city: "Manchester",
        outward: "M3",
        country: "England",
    },
    {
        street: "55 King Street",
        city: "Manchester",
        outward: "M2",
        country: "England",
    },
    {
        street: "120 Colmore Row",
        city: "Birmingham",
        outward: "B3",
        country: "England",
    },
    {
        street: "10 New Street",
        city: "Birmingham",
        outward: "B2",
        country: "England",
    },
    {
        street: "99 George Street",
        city: "Edinburgh",
        outward: "EH2",
        country: "Scotland",
    },
    {
        street: "150 Princes Street",
        city: "Edinburgh",
        outward: "EH2",
        country: "Scotland",
    },
    {
        street: "75 Buchanan Street",
        city: "Glasgow",
        outward: "G1",
        country: "Scotland",
    },
    {
        street: "220 Argyle Street",
        city: "Glasgow",
        outward: "G2",
        country: "Scotland",
    },
    {
        street: "30 Queen Street",
        city: "Cardiff",
        outward: "CF10",
        country: "Wales",
    },
    {
        street: "12 St Mary Street",
        city: "Cardiff",
        outward: "CF10",
        country: "Wales",
    },
    {
        street: "3 Donegall Place",
        city: "Belfast",
        outward: "BT1",
        country: "Northern Ireland",
    },
    {
        street: "250 Lisburn Road",
        city: "Belfast",
        outward: "BT9",
        country: "Northern Ireland",
    },
    {
        street: "15 Briggate",
        city: "Leeds",
        outward: "LS1",
        country: "England",
    },
    {
        street: "10 The Headrow",
        city: "Leeds",
        outward: "LS1",
        country: "England",
    },
    {
        street: "24 Lord Street",
        city: "Liverpool",
        outward: "L2",
        country: "England",
    },
    {
        street: "48 Bold Street",
        city: "Liverpool",
        outward: "L1",
        country: "England",
    },
    {
        street: "65 Park Street",
        city: "Bristol",
        outward: "BS1",
        country: "England",
    },
    {
        street: "5 Queen Square",
        city: "Bristol",
        outward: "BS1",
        country: "England",
    },
    {
        street: "20 Grey Street",
        city: "Newcastle upon Tyne",
        outward: "NE1",
        country: "England",
    },
    {
        street: "40 Grainger Street",
        city: "Newcastle upon Tyne",
        outward: "NE1",
        country: "England",
    },
    {
        street: "2 King's Parade",
        city: "Cambridge",
        outward: "CB2",
        country: "England",
    },
    {
        street: "100 High Street",
        city: "Oxford",
        outward: "OX1",
        country: "England",
    },
    {
        street: "18 Stonegate",
        city: "York",
        outward: "YO1",
        country: "England",
    },
    {
        street: "10 Milsom Street",
        city: "Bath",
        outward: "BA1",
        country: "England",
    },
    {
        street: "7 North Street",
        city: "Brighton",
        outward: "BN1",
        country: "England",
    },
    {
        street: "1 Old Market Square",
        city: "Nottingham",
        outward: "NG1",
        country: "England",
    },
    {
        street: "50 Fargate",
        city: "Sheffield",
        outward: "S1",
        country: "England",
    },
    {
        street: "90 Broad Street",
        city: "Reading",
        outward: "RG1",
        country: "England",
    },
    {
        street: "120 Above Bar Street",
        city: "Southampton",
        outward: "SO14",
        country: "England",
    },
    {
        street: "30 Royal Parade",
        city: "Plymouth",
        outward: "PL1",
        country: "England",
    },
    {
        street: "5 Highcross Lane",
        city: "Leicester",
        outward: "LE1",
        country: "England",
    },
    {
        street: "10 Broadgate",
        city: "Coventry",
        outward: "CV1",
        country: "England",
    },
    {
        street: "12 Gentleman's Walk",
        city: "Norwich",
        outward: "NR2",
        country: "England",
    },
    {
        street: "25 High Street",
        city: "Exeter",
        outward: "EX4",
        country: "England",
    },
    {
        street: "80 Oxford Street",
        city: "Swansea",
        outward: "SA1",
        country: "Wales",
    },
    {
        street: "60 High Street",
        city: "Dundee",
        outward: "DD1",
        country: "Scotland",
    },
    {
        street: "150 Union Street",
        city: "Aberdeen",
        outward: "AB10",
        country: "Scotland",
    },
    {
        street: "35 High Street",
        city: "Inverness",
        outward: "IV1",
        country: "Scotland",
    },
    {
        street: "10 Shipquay Street",
        city: "Londonderry",
        outward: "BT48",
        country: "Northern Ireland",
    },
];

const luxuryItemsCatalogue: SeedItem[] = [
    {
        item_description: "Hand-stitched leather briefcase",
        item_quantity: 1,
        item_price: 1450.0,
    },
    {
        item_description: "Bespoke wool suit",
        item_quantity: 1,
        item_price: 3200.0,
    },
    {
        item_description: "Fine bone china tea set",
        item_quantity: 1,
        item_price: 780.0,
    },
    {
        item_description: "Luxury timepiece",
        item_quantity: 1,
        item_price: 12500.0,
    },
    {
        item_description: "Cashmere overcoat",
        item_quantity: 1,
        item_price: 2100.0,
    },
    {
        item_description: "Silk tie (Royal Navy)",
        item_quantity: 2,
        item_price: 95.0,
    },
    {
        item_description: "Handmade brogues",
        item_quantity: 1,
        item_price: 640.0,
    },
    {
        item_description: "Crystal decanter set",
        item_quantity: 1,
        item_price: 980.0,
    },
    {
        item_description: "Mahogany writing desk",
        item_quantity: 1,
        item_price: 5400.0,
    },
    {
        item_description: "Vintage fountain pen",
        item_quantity: 1,
        item_price: 460.0,
    },
    {
        item_description: "British racing green luggage set",
        item_quantity: 1,
        item_price: 2750.0,
    },
    {
        item_description: "Gold cufflinks",
        item_quantity: 1,
        item_price: 1250.0,
    },
    {
        item_description: "Tailored dinner jacket",
        item_quantity: 1,
        item_price: 1850.0,
    },
    {
        item_description: "Silk pocket square (Burgundy)",
        item_quantity: 3,
        item_price: 45.0,
    },
    {
        item_description: "Handwoven Persian rug",
        item_quantity: 1,
        item_price: 7800.0,
    },
    {
        item_description: "Leather-bound notebook",
        item_quantity: 4,
        item_price: 38.0,
    },
    {
        item_description: "Crystal whisky tumblers (set of 6)",
        item_quantity: 1,
        item_price: 360.0,
    },
    {
        item_description: "Bespoke dress shirt",
        item_quantity: 2,
        item_price: 220.0,
    },
    {
        item_description: "Velvet smoking jacket",
        item_quantity: 1,
        item_price: 920.0,
    },
    {
        item_description: "Ebony walking cane",
        item_quantity: 1,
        item_price: 380.0,
    },
];

function sample<T>(arr: T[]): T {
    const index = Math.floor(Math.random() * arr.length);
    return arr[index];
}

function randomInt(minInclusive: number, maxInclusive: number): number {
    const min = Math.ceil(minInclusive);
    const max = Math.floor(maxInclusive);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateRetailerFromAddress(): {
    street: string;
    city: string;
    postcode: string;
    country: string;
} {
    const addr = sample(RETAILER_ADDRESSES);
    return {
        street: addr.street,
        city: addr.city,
        postcode: `${addr.outward} 1AA`,
        country: "United Kingdom",
    };
}

function generateCustomerAddress(): {
    street: string;
    city: string;
    postcode: string;
    country: string;
} {
    const addr = sample(CUSTOMER_ADDRESSES);
    return {
        street: addr.street,
        city: addr.city,
        postcode: `${addr.outward} 1AA`,
        country: "United Kingdom",
    };
}

async function createInvoiceWithItems(index: number): Promise<void> {
    const firstName = sample(britishFirstNames);
    const surname = sample(britishSurnames);
    const billToName = `${firstName} ${surname}`;
    const billToEmail = `${firstName.toLowerCase()}.${surname.toLowerCase()}@example.co.uk`;

    const from = generateRetailerFromAddress();
    const to = generateCustomerAddress();

    const statusOptions: InvoiceStatus[] = ["draft", "pending", "paid"];
    const paymentTermsOptions: PaymentTerms[] = [
        "Net 30 Days",
        "14 Days",
        "7 Days",
    ];
    const invoiceDate = new Date();
    invoiceDate.setDate(invoiceDate.getDate() - randomInt(1, 120));

    const itemsCount = randomInt(2, 5);
    const chosenItems: SeedItem[] = [];
    for (let i = 0; i < itemsCount; i += 1) {
        const base = sample(luxuryItemsCatalogue);
        const quantity = randomInt(1, Math.max(1, base.item_quantity));
        chosenItems.push({
            item_description: base.item_description,
            item_price: base.item_price,
            item_quantity: quantity,
        });
    }

    let invoiceTotal = new Decimal(0);
    for (let i = 0; i < chosenItems.length; i += 1) {
        const it = chosenItems[i];
        const lineTotal = new Decimal(it.item_price).mul(it.item_quantity);
        invoiceTotal = invoiceTotal.add(lineTotal);
    }

    const client = await pool.connect();
    try {
        await client.query("BEGIN");

        const insertInvoice = await client.query(
            `INSERT INTO invoices (
                bill_from_street_address, bill_from_city, bill_from_postcode, bill_from_country,
                bill_to_email, bill_to_name, bill_to_street_address, bill_to_city,
                bill_to_postcode, bill_to_country, invoice_date, payment_terms,
                project_description, status, invoice_total
            ) VALUES (
                $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15
            ) RETURNING id`,
            [
                from.street,
                from.city,
                from.postcode,
                from.country,
                billToEmail,
                billToName,
                to.street,
                to.city,
                to.postcode,
                to.country,
                invoiceDate,
                sample(paymentTermsOptions),
                `Luxury retail order #${index + 1}`,
                sample(statusOptions),
                invoiceTotal.toNumber(),
            ],
        );

        const invoiceId: number = insertInvoice.rows[0].id;

        for (let i = 0; i < chosenItems.length; i += 1) {
            const it = chosenItems[i];
            const total = new Decimal(it.item_price)
                .mul(it.item_quantity)
                .toNumber();
            await client.query(
                `INSERT INTO invoice_items (
                    invoice_id, item_description, item_quantity, item_price, item_total
                ) VALUES ($1, $2, $3, $4, $5)`,
                [
                    invoiceId,
                    it.item_description,
                    it.item_quantity,
                    it.item_price,
                    total,
                ],
            );
        }

        await client.query("COMMIT");
    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
}

async function ensureSeeded(): Promise<void> {
    const targetCount = 250;
    const result = await pool.query(
        "SELECT COUNT(*)::int AS count FROM invoices",
    );
    const currentCount: number = result.rows[0].count;
    if (currentCount >= targetCount) {
        return;
    }

    const toCreate = targetCount - currentCount;
    for (let i = 0; i < toCreate; i += 1) {
        // eslint-disable-next-line no-await-in-loop
        await createInvoiceWithItems(currentCount + i);
    }
}

async function ensureDemoUser(): Promise<void> {
    const demoEmail = process.env.DEMO_EMAIL ?? "";
    const demoPassword = process.env.DEMO_PASSWORD ?? "";

    if (!demoEmail || !demoPassword) {
        return;
    }

    const existing = await pool.query("SELECT id FROM users WHERE email = $1", [
        demoEmail,
    ]);

    if (existing.rows.length > 0) {
        return;
    }

    const localPart = demoEmail.split("@")[0] || "demo";
    let candidate = localPart;

    for (let i = 0; i < 20; i += 1) {
        const check = await pool.query(
            "SELECT 1 FROM users WHERE username = $1",
            [candidate],
        );
        if (check.rows.length === 0) {
            break;
        }
        candidate = `${localPart}${i + 1}`;
    }

    const passwordHash = await bcrypt.hash(demoPassword, 10);

    await pool.query(
        `INSERT INTO users (username, email, password_hash, email_confirmed)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (email) DO NOTHING`,
        [candidate, demoEmail, passwordHash, true],
    );
}

(async () => {
    try {
        await ensureDemoUser();
        await ensureSeeded();
        // eslint-disable-next-line no-console
        console.log("Database seeded with luxury invoices.");
        process.exit(0);
    } catch (err) {
        // eslint-disable-next-line no-console
        console.error("Seeding failed:", err);
        process.exit(1);
    }
})();
