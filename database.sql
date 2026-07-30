-- Enable uuid-ossp extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create the invoices table
CREATE TABLE public.invoices (
    id serial4 NOT NULL,
    bill_from_street_address varchar(255) NOT NULL,
    bill_from_city varchar(100) NOT NULL,
    bill_from_postcode varchar(20) NOT NULL,
    bill_from_country varchar(100) NOT NULL,
    bill_to_email varchar(255) NOT NULL,
    bill_to_name varchar(255) NOT NULL,
    bill_to_street_address varchar(255) NOT NULL,
    bill_to_city varchar(100) NOT NULL,
    bill_to_postcode varchar(20) NOT NULL,
    bill_to_country varchar(100) NOT NULL,
    invoice_date date NOT NULL,
    payment_terms varchar(20) NOT NULL,
    project_description text NOT NULL,
    status varchar(20) DEFAULT 'draft'::character varying NOT NULL,
    created_at timestamptz DEFAULT CURRENT_TIMESTAMP NULL,
    updated_at timestamptz DEFAULT CURRENT_TIMESTAMP NULL,
    invoice_total float8 NOT NULL,
    CONSTRAINT invoices_pkey PRIMARY KEY (id)
);

-- Create the session table
CREATE TABLE public.session (
    sid varchar NOT NULL,
    sess json NOT NULL,
    expire timestamp(6) NOT NULL,
    CONSTRAINT session_pkey PRIMARY KEY (sid)
);

-- Create the users table
CREATE TABLE public.users (
    id uuid DEFAULT uuid_generate_v4() NOT NULL,
    username varchar(255) NOT NULL,
    email varchar(255) NOT NULL,
    password_hash varchar(255) NOT NULL,
    google_id varchar(255) NULL,
    twitter_id varchar(255) NULL,
    profile_image_url varchar(255) NULL,
    created_at timestamp DEFAULT CURRENT_TIMESTAMP NULL,
    email_confirmed bool DEFAULT false NULL,
    email_confirmation_token varchar(255) NULL,
    CONSTRAINT users_email_key UNIQUE (email),
    CONSTRAINT users_google_id_key UNIQUE (google_id),
    CONSTRAINT users_pkey PRIMARY KEY (id),
    CONSTRAINT users_twitter_id_key UNIQUE (twitter_id),
    CONSTRAINT users_username_key UNIQUE (username)
);

-- Create the invoice_items table
CREATE TABLE public.invoice_items (
    id serial4 NOT NULL,
    invoice_id int4 NOT NULL,
    item_description text NOT NULL,
    item_quantity int4 NOT NULL,
    item_price numeric(10, 2) NOT NULL,
    item_total numeric(10, 2) NOT NULL,
    CONSTRAINT invoice_items_pkey PRIMARY KEY (id),
    CONSTRAINT invoice_items_invoice_id_fkey FOREIGN KEY (invoice_id) REFERENCES public.invoices(id) ON DELETE CASCADE
);

-- Create index on bill_to_email in invoices table
CREATE INDEX idx_invoices_bill_to_email ON public.invoices USING btree (bill_to_email);

-- Keyset pagination + status filtering
CREATE INDEX idx_invoices_created_at_id_desc ON public.invoices USING btree (created_at DESC, id DESC);
CREATE INDEX idx_invoices_status ON public.invoices USING btree (status);

-- Create index on expire in session table
CREATE INDEX "IDX_session_expire" ON public.session USING btree (expire);
