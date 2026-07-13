--
-- PostgreSQL database dump
--

\restrict 1UvJtSXzbmkV8WIw9xsQLuf8St4Jdnw17fti5D8GH3OsGke5SeMjtI9k7qkrAwD

-- Dumped from database version 18.4 (Debian 18.4-1.pgdg13+1)
-- Dumped by pg_dump version 18.4 (Debian 18.4-1.pgdg13+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;


--
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: ingredients; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.ingredients (
    id integer NOT NULL,
    user_id integer NOT NULL,
    name text NOT NULL,
    description text,
    calories real,
    protein real,
    carbohydrates real,
    fats real,
    is_deleted boolean DEFAULT false
);


ALTER TABLE public.ingredients OWNER TO postgres;

--
-- Name: ingredients_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.ingredients_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.ingredients_id_seq OWNER TO postgres;

--
-- Name: ingredients_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.ingredients_id_seq OWNED BY public.ingredients.id;


--
-- Name: ingredients_user_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.ingredients_user_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.ingredients_user_id_seq OWNER TO postgres;

--
-- Name: ingredients_user_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.ingredients_user_id_seq OWNED BY public.ingredients.user_id;


--
-- Name: macro_totals; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.macro_totals (
    user_id integer NOT NULL,
    date date DEFAULT CURRENT_DATE NOT NULL,
    "time" time without time zone DEFAULT CURRENT_TIME NOT NULL,
    calories integer,
    protein integer,
    carbohydrates integer,
    fats integer
);


ALTER TABLE public.macro_totals OWNER TO postgres;

--
-- Name: macro_totals_user_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.macro_totals_user_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.macro_totals_user_id_seq OWNER TO postgres;

--
-- Name: macro_totals_user_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.macro_totals_user_id_seq OWNED BY public.macro_totals.user_id;


--
-- Name: meals; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.meals (
    id integer NOT NULL,
    user_id integer NOT NULL,
    name text NOT NULL,
    description text,
    date date DEFAULT CURRENT_DATE,
    "time" time without time zone DEFAULT CURRENT_TIME,
    calories integer,
    protein integer,
    carbohydrates integer,
    fats integer,
    is_recurring boolean DEFAULT false
);


ALTER TABLE public.meals OWNER TO postgres;

--
-- Name: meals_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.meals_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.meals_id_seq OWNER TO postgres;

--
-- Name: meals_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.meals_id_seq OWNED BY public.meals.id;


--
-- Name: meals_user_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.meals_user_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.meals_user_id_seq OWNER TO postgres;

--
-- Name: meals_user_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.meals_user_id_seq OWNED BY public.meals.user_id;


--
-- Name: recipes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.recipes (
    id integer NOT NULL,
    user_id integer NOT NULL,
    name text NOT NULL,
    description text,
    division_mode text NOT NULL,
    portion_count real,
    total_yield_oz real,
    CONSTRAINT recipes_division_mode_check CHECK (
        (division_mode = ANY (ARRAY['portions'::text, 'per_ounce'::text]))
    ),
    CONSTRAINT recipes_portions_require_count CHECK (
        ((division_mode <> 'portions'::text) OR ((portion_count IS NOT NULL) AND (portion_count > (0)::double precision)))
    ),
    CONSTRAINT recipes_per_ounce_require_yield CHECK (
        ((division_mode <> 'per_ounce'::text) OR ((total_yield_oz IS NOT NULL) AND (total_yield_oz > (0)::double precision)))
    )
);


ALTER TABLE public.recipes OWNER TO postgres;

--
-- Name: recipes_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.recipes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.recipes_id_seq OWNER TO postgres;

--
-- Name: recipes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.recipes_id_seq OWNED BY public.recipes.id;


--
-- Name: recipe_ingredients; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.recipe_ingredients (
    recipe_id integer NOT NULL,
    ingredient_id integer NOT NULL,
    default_amount real NOT NULL,
    current_amount real NOT NULL,
    CONSTRAINT recipe_ingredients_default_amount_check CHECK ((default_amount > (0)::double precision)),
    CONSTRAINT recipe_ingredients_current_amount_check CHECK ((current_amount > (0)::double precision))
);


ALTER TABLE public.recipe_ingredients OWNER TO postgres;

--
-- Name: session; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.session (
    sid character varying NOT NULL,
    sess json NOT NULL,
    expire timestamp(6) without time zone NOT NULL
);


ALTER TABLE public.session OWNER TO postgres;

--
-- Name: user_weights; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_weights (
    id integer NOT NULL,
    user_id integer NOT NULL,
    weight real NOT NULL,
    date date DEFAULT CURRENT_DATE,
    target_calories integer DEFAULT 0,
    target_protein integer DEFAULT 0,
    target_carbohydrates integer DEFAULT 0,
    target_fats integer DEFAULT 0
);


ALTER TABLE public.user_weights OWNER TO postgres;

--
-- Name: user_weights_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.user_weights_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.user_weights_id_seq OWNER TO postgres;

--
-- Name: user_weights_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.user_weights_id_seq OWNED BY public.user_weights.id;


--
-- Name: user_weights_user_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.user_weights_user_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.user_weights_user_id_seq OWNER TO postgres;

--
-- Name: user_weights_user_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.user_weights_user_id_seq OWNED BY public.user_weights.user_id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id integer NOT NULL,
    username text NOT NULL,
    password text NOT NULL,
    email_address text NOT NULL
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: ingredients id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ingredients ALTER COLUMN id SET DEFAULT nextval('public.ingredients_id_seq'::regclass);


--
-- Name: ingredients user_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ingredients ALTER COLUMN user_id SET DEFAULT nextval('public.ingredients_user_id_seq'::regclass);


--
-- Name: macro_totals user_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.macro_totals ALTER COLUMN user_id SET DEFAULT nextval('public.macro_totals_user_id_seq'::regclass);


--
-- Name: meals id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.meals ALTER COLUMN id SET DEFAULT nextval('public.meals_id_seq'::regclass);


--
-- Name: meals user_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.meals ALTER COLUMN user_id SET DEFAULT nextval('public.meals_user_id_seq'::regclass);


--
-- Name: recipes id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.recipes ALTER COLUMN id SET DEFAULT nextval('public.recipes_id_seq'::regclass);


--
-- Name: user_weights id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_weights ALTER COLUMN id SET DEFAULT nextval('public.user_weights_id_seq'::regclass);


--
-- Name: user_weights user_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_weights ALTER COLUMN user_id SET DEFAULT nextval('public.user_weights_user_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Name: ingredients ingredients_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ingredients
    ADD CONSTRAINT ingredients_pkey PRIMARY KEY (id);


--
-- Name: macro_totals macro_totals_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.macro_totals
    ADD CONSTRAINT macro_totals_pkey PRIMARY KEY (user_id, date, "time");


--
-- Name: meals meals_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.meals
    ADD CONSTRAINT meals_pkey PRIMARY KEY (id);


--
-- Name: recipes recipes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.recipes
    ADD CONSTRAINT recipes_pkey PRIMARY KEY (id);


--
-- Name: recipe_ingredients recipe_ingredients_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.recipe_ingredients
    ADD CONSTRAINT recipe_ingredients_pkey PRIMARY KEY (recipe_id, ingredient_id);


--
-- Name: session session_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.session
    ADD CONSTRAINT session_pkey PRIMARY KEY (sid);


--
-- Name: user_weights user_weights_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_weights
    ADD CONSTRAINT user_weights_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: IDX_session_expire; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_session_expire" ON public.session USING btree (expire);


--
-- Name: ingredients ingredients_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ingredients
    ADD CONSTRAINT ingredients_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: macro_totals macro_totals_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.macro_totals
    ADD CONSTRAINT macro_totals_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: meals meals_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.meals
    ADD CONSTRAINT meals_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: recipes recipes_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.recipes
    ADD CONSTRAINT recipes_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: recipe_ingredients recipe_ingredients_recipe_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.recipe_ingredients
    ADD CONSTRAINT recipe_ingredients_recipe_id_fkey FOREIGN KEY (recipe_id) REFERENCES public.recipes(id) ON DELETE CASCADE;


--
-- Name: recipe_ingredients recipe_ingredients_ingredient_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.recipe_ingredients
    ADD CONSTRAINT recipe_ingredients_ingredient_id_fkey FOREIGN KEY (ingredient_id) REFERENCES public.ingredients(id);


--
-- Name: user_weights user_weights_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_weights
    ADD CONSTRAINT user_weights_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- PostgreSQL database dump complete
--

\unrestrict 1UvJtSXzbmkV8WIw9xsQLuf8St4Jdnw17fti5D8GH3OsGke5SeMjtI9k7qkrAwD

