--
-- PostgreSQL database dump
--

-- Dumped from database version 16.0 (Debian 16.0-1.pgdg120+1)
-- Dumped by pg_dump version 16.0 (Debian 16.0-1.pgdg120+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
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


--
-- Name: logging_level; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.logging_level AS ENUM (
    'DEBUG',
    'INFO',
    'WARNING',
    'ERROR',
    'FATAL'
);


ALTER TYPE public.logging_level OWNER TO postgres;

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
    calories integer,
    protein integer,
    carbohydrates integer,
    fats integer,
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
-- Name: meal_ingredients; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.meal_ingredients (
    meal_id integer NOT NULL,
    ingredient_id integer NOT NULL,
    portion_size real
);


ALTER TABLE public.meal_ingredients OWNER TO postgres;

--
-- Name: meal_ingredients_ingredient_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.meal_ingredients_ingredient_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.meal_ingredients_ingredient_id_seq OWNER TO postgres;

--
-- Name: meal_ingredients_ingredient_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.meal_ingredients_ingredient_id_seq OWNED BY public.meal_ingredients.ingredient_id;


--
-- Name: meal_ingredients_meal_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.meal_ingredients_meal_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.meal_ingredients_meal_id_seq OWNER TO postgres;

--
-- Name: meal_ingredients_meal_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.meal_ingredients_meal_id_seq OWNED BY public.meal_ingredients.meal_id;


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
    fats integer
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
    parent_ingredient_id integer NOT NULL,
    component_ingredient_id integer NOT NULL,
    portion_size real
);


ALTER TABLE public.recipes OWNER TO postgres;

--
-- Name: recipes_component_ingredient_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.recipes_component_ingredient_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.recipes_component_ingredient_id_seq OWNER TO postgres;

--
-- Name: recipes_component_ingredient_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.recipes_component_ingredient_id_seq OWNED BY public.recipes.component_ingredient_id;


--
-- Name: recipes_parent_ingredient_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.recipes_parent_ingredient_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.recipes_parent_ingredient_id_seq OWNER TO postgres;

--
-- Name: recipes_parent_ingredient_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.recipes_parent_ingredient_id_seq OWNED BY public.recipes.parent_ingredient_id;


--
-- Name: system_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.system_logs (
    uuid uuid DEFAULT gen_random_uuid() NOT NULL,
    level public.logging_level NOT NULL,
    message text NOT NULL,
    payload text,
    create_timestamp timestamp without time zone DEFAULT now()
);


ALTER TABLE public.system_logs OWNER TO postgres;

--
-- Name: user_weights; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_weights (
    id integer NOT NULL,
    user_id integer NOT NULL,
    weight integer NOT NULL,
    date date DEFAULT CURRENT_DATE,
    "time" time without time zone DEFAULT CURRENT_TIME
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
-- Name: meal_ingredients meal_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.meal_ingredients ALTER COLUMN meal_id SET DEFAULT nextval('public.meal_ingredients_meal_id_seq'::regclass);


--
-- Name: meal_ingredients ingredient_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.meal_ingredients ALTER COLUMN ingredient_id SET DEFAULT nextval('public.meal_ingredients_ingredient_id_seq'::regclass);


--
-- Name: meals id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.meals ALTER COLUMN id SET DEFAULT nextval('public.meals_id_seq'::regclass);


--
-- Name: meals user_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.meals ALTER COLUMN user_id SET DEFAULT nextval('public.meals_user_id_seq'::regclass);


--
-- Name: recipes parent_ingredient_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.recipes ALTER COLUMN parent_ingredient_id SET DEFAULT nextval('public.recipes_parent_ingredient_id_seq'::regclass);


--
-- Name: recipes component_ingredient_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.recipes ALTER COLUMN component_ingredient_id SET DEFAULT nextval('public.recipes_component_ingredient_id_seq'::regclass);


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
-- Name: meal_ingredients meal_ingredients_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.meal_ingredients
    ADD CONSTRAINT meal_ingredients_pkey PRIMARY KEY (meal_id, ingredient_id);


--
-- Name: meals meals_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.meals
    ADD CONSTRAINT meals_pkey PRIMARY KEY (id);


--
-- Name: recipes recipes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.recipes
    ADD CONSTRAINT recipes_pkey PRIMARY KEY (parent_ingredient_id, component_ingredient_id);


--
-- Name: system_logs system_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.system_logs
    ADD CONSTRAINT system_logs_pkey PRIMARY KEY (uuid);


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
-- Name: recipes recipes_component_ingredient_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.recipes
    ADD CONSTRAINT recipes_component_ingredient_id_fkey FOREIGN KEY (component_ingredient_id) REFERENCES public.ingredients(id);


--
-- Name: recipes recipes_parent_ingredient_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.recipes
    ADD CONSTRAINT recipes_parent_ingredient_id_fkey FOREIGN KEY (parent_ingredient_id) REFERENCES public.ingredients(id);


--
-- Name: user_weights user_weights_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_weights
    ADD CONSTRAINT user_weights_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- PostgreSQL database dump complete
--

