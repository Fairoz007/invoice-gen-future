-- Create a table to track invoice counters by month
create table if not exists public.invoice_counters (
  id uuid primary key default gen_random_uuid(),
  year_month text not null unique, -- Format: YYYY-MM
  last_number integer not null default 0,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Create index for faster lookups
create index if not exists invoice_counters_year_month_idx on public.invoice_counters(year_month);

-- Function to generate next invoice number
create or replace function generate_invoice_number()
returns text
language plpgsql
as $$
declare
  current_year_month text;
  current_number integer;
  new_invoice_number text;
begin
  -- Get current year and month in YYYY-MM format
  current_year_month := to_char(current_date, 'YYYY-MM');
  
  -- Lock the row to prevent race conditions
  select last_number into current_number
  from invoice_counters
  where year_month = current_year_month
  for update;
  
  -- If no record exists for this month, create one
  if not found then
    insert into invoice_counters (year_month, last_number)
    values (current_year_month, 1)
    returning last_number into current_number;
  else
    -- Increment the counter
    current_number := current_number + 1;
    update invoice_counters
    set last_number = current_number,
        updated_at = now()
    where year_month = current_year_month;
  end if;
  
  -- Format: FFE-INV-YYYY-MM-XXX (e.g., FFE-INV-2026-01-001)
  new_invoice_number := 'FFE-INV-' || current_year_month || '-' || lpad(current_number::text, 3, '0');
  
  return new_invoice_number;
end;
$$;
