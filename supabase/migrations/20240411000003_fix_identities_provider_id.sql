-- Fix the identities table by adding the missing provider_id column value

-- Update the demo student identity
UPDATE auth.identities
SET provider_id = 'email'
WHERE id = '88888888-8888-8888-8888-888888888888';

-- Update the demo driver identity
UPDATE auth.identities
SET provider_id = 'email'
WHERE id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
