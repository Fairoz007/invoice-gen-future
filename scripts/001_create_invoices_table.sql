-- Create invoices table to store invoice data
create table if not exists public.invoices (
  id uuid primary key default gen_random_uuid(),
  invoice_number text not null unique,
  invoice_date date not null,
  due_date date not null,
  customer_number text,
  bill_to_name text not null,
  bill_to_address text,
  bill_to_city text,
  bill_to_phone text,
  bill_to_email text,
  ship_to_name text,
  ship_to_address text,
  ship_to_city text,
  ship_to_phone text,
  items jsonb not null,
  currency text default 'OMR',
  discount numeric(10, 3) default 0,
  payment_terms text,
  purchase_order_number text,
  notes text,
  subtotal numeric(10, 3) not null,
  total_tax numeric(10, 3) not null,
  grand_total numeric(10, 3) not null,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Create index on invoice_number for faster lookups
create index if not exists invoices_invoice_number_idx on public.invoices(invoice_number);

-- Create index on created_at for sorting
create index if not exists invoices_created_at_idx on public.invoices(created_at desc);
