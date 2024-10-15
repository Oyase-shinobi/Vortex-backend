BEGIN;

    CREATE TABLE IF NOT EXISTS public.entries (
        player_address text COLLATE pg_catalog."default" NOT NULL,
        player_entry text COLLATE pg_catalog."default" NOT NULL,
        round int NOT NULL,
        is_continued bool DEFAULT false,
        original_round int,
        entry_tx_hash text COLLATE pg_catalog."default" NOT NULL,
        created_at timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
        deleted_at timestamp with time zone,
        constraint entry_primary_key primary key (round, entry_tx_hash)
    );

    CREATE TABLE IF NOT EXISTS public.rounds (
        id SERIAL PRIMARY KEY NOT NULL,
        prize_pool text COLLATE pg_catalog."default",
        winner_address text COLLATE pg_catalog."default",
        winner_entry text COLLATE pg_catalog."default",
        winner_multiplier text COLLATE pg_catalog."default",
        finish_at timestamp with time zone,
        finish_tx_hash text COLLATE pg_catalog."default" NOT NULL,
        player_count int NOT NULL DEFAULT 0,
        no_winner bool NOT NULL DEFAULT false,
        created_at timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
        deleted_at timestamp with time zone
    );

    CREATE TABLE IF NOT EXISTS public.claim_prize_records (
        id SERIAL PRIMARY KEY NOT NULL,
        claim_address text COLLATE pg_catalog."default" NOT NULL,
        claim_token text COLLATE pg_catalog."default" NOT NULL,
        claim_amount text COLLATE pg_catalog."default" NOT NULL,
        claim_tx_hash text COLLATE pg_catalog."default" NOT NULL,
        created_at timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
        deleted_at timestamp with time zone
    );

    CREATE TABLE IF NOT EXISTS public.player_round_entries (
        id SERIAL NOT NULL,
        player_address text COLLATE pg_catalog."default" NOT NULL,
        player_entry text COLLATE pg_catalog."default" NOT NULL,
        round int NOT NULL,
        created_at timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
        deleted_at timestamp with time zone,
        constraint player_round_entry_primary_key primary key (round, player_address)
    );

    CREATE TABLE IF NOT EXISTS public.blocks (
       id SERIAL PRIMARY KEY,
       block_number bigint
    );

    INSERT INTO public.rounds(finish_at, id, player_count, no_winner, prize_pool, winner_address, winner_entry, winner_multiplier, finish_tx_hash)
	VALUES (null, 0, 0, false, '', '', '', '', '')
	ON CONFLICT DO NOTHING;

END;
