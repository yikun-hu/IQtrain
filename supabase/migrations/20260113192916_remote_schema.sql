
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
COMMENT ON SCHEMA "public" IS 'standard public schema';CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";
CREATE TYPE "public"."order_status" AS ENUM (
    'pending',
    'paid',
    'cancelled',
    'refunded'
);
ALTER TYPE "public"."order_status" OWNER TO "postgres";
CREATE TYPE "public"."subscription_type" AS ENUM (
    'one_time',
    'monthly',
    'recurring',
    'biweekly'
);
ALTER TYPE "public"."subscription_type" OWNER TO "postgres";
CREATE TYPE "public"."time_unit" AS ENUM (
    'DAY',
    'MONTH',
    'WEEK',
    'YEAR'
);
ALTER TYPE "public"."time_unit" OWNER TO "postgres";
CREATE TYPE "public"."user_role" AS ENUM (
    'user',
    'admin'
);
ALTER TYPE "public"."user_role" OWNER TO "postgres";
CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  user_count INT;
BEGIN
  SELECT COUNT(*) INTO user_count FROM profiles;
  INSERT INTO profiles (id, email, role)
  VALUES (
    NEW.id,
    NEW.email,
    CASE WHEN user_count = 0 THEN 'admin'::user_role ELSE 'user'::user_role END
  );
  RETURN NEW;
END;
$$;
ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";
CREATE OR REPLACE FUNCTION "public"."is_admin"() RETURNS boolean
    LANGUAGE "sql" SECURITY DEFINER
    AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'::user_role
  );
$$;
ALTER FUNCTION "public"."is_admin"() OWNER TO "postgres";
CREATE OR REPLACE FUNCTION "public"."profiles_block_protected_columns"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$BEGIN
  -- 允许 Edge Function / 后端（service_role）修改
  IF auth.role() = 'service_role' OR is_admin() THEN
    RETURN NEW;
  END IF;  -- 禁止普通用户修改这些字段
  IF NEW.role IS DISTINCT FROM OLD.role
     OR NEW.has_paid IS DISTINCT FROM OLD.has_paid
     OR NEW.subscription_type IS DISTINCT FROM OLD.subscription_type
     OR NEW.subscription_expires_at IS DISTINCT FROM OLD.subscription_expires_at
  THEN
    RAISE EXCEPTION 'Not allowed to update protected columns';
  END IF;  RETURN NEW;
END;$$;
ALTER FUNCTION "public"."profiles_block_protected_columns"() OWNER TO "postgres";
CREATE OR REPLACE FUNCTION "public"."update_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;
ALTER FUNCTION "public"."update_updated_at"() OWNER TO "postgres";SET default_tablespace = '';SET default_table_access_method = "heap";
CREATE TABLE IF NOT EXISTS "public"."daily_stats" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "stat_date" "date" NOT NULL,
    "pv" integer DEFAULT 0,
    "uv" integer DEFAULT 0,
    "total_users" integer DEFAULT 0,
    "new_users" integer DEFAULT 0,
    "new_paid_users" integer DEFAULT 0,
    "new_paid_amount" numeric(10,2) DEFAULT 0,
    "new_subscription_users" integer DEFAULT 0,
    "new_subscription_amount" numeric(10,2) DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);
ALTER TABLE "public"."daily_stats" OWNER TO "postgres";
COMMENT ON TABLE "public"."daily_stats" IS '每日统计数据表';COMMENT ON COLUMN "public"."daily_stats"."stat_date" IS '统计日期';COMMENT ON COLUMN "public"."daily_stats"."pv" IS '页面浏览量';COMMENT ON COLUMN "public"."daily_stats"."uv" IS '独立访客数';COMMENT ON COLUMN "public"."daily_stats"."total_users" IS '总用户数';COMMENT ON COLUMN "public"."daily_stats"."new_users" IS '新增用户数';COMMENT ON COLUMN "public"."daily_stats"."new_paid_users" IS '新增付费用户数';COMMENT ON COLUMN "public"."daily_stats"."new_paid_amount" IS '新增付费金额';COMMENT ON COLUMN "public"."daily_stats"."new_subscription_users" IS '新增订阅用户数';COMMENT ON COLUMN "public"."daily_stats"."new_subscription_amount" IS '新增订阅金额';CREATE TABLE IF NOT EXISTS "public"."games" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "title" json NOT NULL,
    "category" "text" NOT NULL,
    "url" "text" NOT NULL,
    "description" json,
    "thumbnail_url" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);
ALTER TABLE "public"."games" OWNER TO "postgres";
COMMENT ON TABLE "public"."games" IS '游戏表';CREATE TABLE IF NOT EXISTS "public"."iq_questions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "question_number" integer NOT NULL,
    "image_url" "text" NOT NULL,
    "option_a" "text" NOT NULL,
    "option_b" "text" NOT NULL,
    "option_c" "text" NOT NULL,
    "option_d" "text" NOT NULL,
    "option_e" "text" NOT NULL,
    "option_f" "text" NOT NULL,
    "correct_answer" "text" NOT NULL,
    "dimension" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);
ALTER TABLE "public"."iq_questions" OWNER TO "postgres";
COMMENT ON TABLE "public"."iq_questions" IS 'IQ测试题目表';CREATE TABLE IF NOT EXISTS "public"."orders" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "order_no" "text" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "status" "public"."order_status" DEFAULT 'pending'::"public"."order_status" NOT NULL,
    "subscription_type" "public"."subscription_type" NOT NULL,
    "amount" numeric(10,2) NOT NULL,
    "paypal_order_id" "text",
    "paypal_payment_id" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "subscription_plan_id" "uuid"
);
ALTER TABLE "public"."orders" OWNER TO "postgres";
COMMENT ON TABLE "public"."orders" IS '订单表';CREATE TABLE IF NOT EXISTS "public"."payment_gateway_config" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "gateway_name" "text" DEFAULT 'PayPal'::"text" NOT NULL,
    "client_id" "text" NOT NULL,
    "secret_key" "text" NOT NULL,
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);
ALTER TABLE "public"."payment_gateway_config" OWNER TO "postgres";
CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" NOT NULL,
    "email" "text" NOT NULL,
    "full_name" "text",
    "age" integer,
    "gender" "text",
    "role" "public"."user_role" DEFAULT 'user'::"public"."user_role" NOT NULL,
    "has_paid" boolean DEFAULT false,
    "subscription_type" "public"."subscription_type",
    "subscription_expires_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);
ALTER TABLE "public"."profiles" OWNER TO "postgres";
COMMENT ON TABLE "public"."profiles" IS '用户档案表';CREATE TABLE IF NOT EXISTS "public"."scale_scoring_rules" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "test_type" character varying(50) NOT NULL,
    "level" integer NOT NULL,
    "score_min" integer NOT NULL,
    "score_max" integer NOT NULL,
    "ability_dimensions" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "label" "jsonb",
    "color" character varying(20),
    "interpretation" "jsonb",
    "feedback" "jsonb",
    "language" "text" DEFAULT 'en'::"text" NOT NULL
);
ALTER TABLE "public"."scale_scoring_rules" OWNER TO "postgres";
CREATE TABLE IF NOT EXISTS "public"."scale_test_configs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "test_type" character varying NOT NULL,
    "name" "jsonb" NOT NULL,
    "short_name" character varying(20) NOT NULL,
    "recommendations" "jsonb",
    "action_plan" "jsonb",
    "dimensions" "jsonb",
    "percentiles" integer[],
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);
ALTER TABLE "public"."scale_test_configs" OWNER TO "postgres";
CREATE TABLE IF NOT EXISTS "public"."scale_test_questions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "test_type" character varying(50) NOT NULL,
    "question_id" character varying(20) NOT NULL,
    "question_text" json NOT NULL,
    "reverse_scored" boolean DEFAULT false,
    "display_order" integer NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);
ALTER TABLE "public"."scale_test_questions" OWNER TO "postgres";
CREATE TABLE IF NOT EXISTS "public"."subscription_plans" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "trial_price" numeric(10,2) NOT NULL,
    "trial_duration" integer NOT NULL,
    "trial_unit" "public"."time_unit" NOT NULL,
    "recurring_price" numeric(10,2) NOT NULL,
    "recurring_duration" integer NOT NULL,
    "recurring_unit" "public"."time_unit" NOT NULL,
    "paypal_plan_id" "text",
    "description" "jsonb" DEFAULT '[]'::"jsonb" NOT NULL,
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);
ALTER TABLE "public"."subscription_plans" OWNER TO "postgres";
CREATE TABLE IF NOT EXISTS "public"."test_results" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "answers" "jsonb" NOT NULL,
    "score" integer NOT NULL,
    "iq_score" integer NOT NULL,
    "dimension_scores" "jsonb" NOT NULL,
    "time_taken" integer NOT NULL,
    "completed_at" timestamp with time zone DEFAULT "now"(),
    "created_at" timestamp with time zone DEFAULT "now"(),
    "test_type" character varying DEFAULT 'iq'::character varying NOT NULL
);
ALTER TABLE "public"."test_results" OWNER TO "postgres";
COMMENT ON TABLE "public"."test_results" IS '测试结果表';COMMENT ON COLUMN "public"."test_results"."test_type" IS '测试类型';CREATE TABLE IF NOT EXISTS "public"."tests" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "title" "text" NOT NULL,
    "title_zh" "text" NOT NULL,
    "type" "text" NOT NULL,
    "description" "text",
    "description_zh" "text",
    "duration" integer,
    "question_count" integer,
    "thumbnail_url" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);
ALTER TABLE "public"."tests" OWNER TO "postgres";
COMMENT ON TABLE "public"."tests" IS '测试类型表';CREATE TABLE IF NOT EXISTS "public"."training_records" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "game_name" "text" NOT NULL,
    "score" integer,
    "duration" integer,
    "completed_at" timestamp with time zone DEFAULT "now"(),
    "created_at" timestamp with time zone DEFAULT "now"()
);
ALTER TABLE "public"."training_records" OWNER TO "postgres";
COMMENT ON TABLE "public"."training_records" IS '训练记录表';ALTER TABLE ONLY "public"."daily_stats"
    ADD CONSTRAINT "daily_stats_pkey" PRIMARY KEY ("id");ALTER TABLE ONLY "public"."daily_stats"
    ADD CONSTRAINT "daily_stats_stat_date_key" UNIQUE ("stat_date");ALTER TABLE ONLY "public"."games"
    ADD CONSTRAINT "games_pkey" PRIMARY KEY ("id");ALTER TABLE ONLY "public"."iq_questions"
    ADD CONSTRAINT "iq_questions_pkey" PRIMARY KEY ("id");ALTER TABLE ONLY "public"."iq_questions"
    ADD CONSTRAINT "iq_questions_question_number_key" UNIQUE ("question_number");ALTER TABLE ONLY "public"."orders"
    ADD CONSTRAINT "orders_order_no_key" UNIQUE ("order_no");ALTER TABLE ONLY "public"."orders"
    ADD CONSTRAINT "orders_pkey" PRIMARY KEY ("id");ALTER TABLE ONLY "public"."payment_gateway_config"
    ADD CONSTRAINT "payment_gateway_config_pkey" PRIMARY KEY ("id");ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");ALTER TABLE ONLY "public"."scale_scoring_rules"
    ADD CONSTRAINT "scale_scoring_rules_pkey" PRIMARY KEY ("id");ALTER TABLE ONLY "public"."scale_test_configs"
    ADD CONSTRAINT "scale_test_configs_pkey" PRIMARY KEY ("id");ALTER TABLE ONLY "public"."scale_test_questions"
    ADD CONSTRAINT "scale_test_questions_pkey" PRIMARY KEY ("id");ALTER TABLE ONLY "public"."subscription_plans"
    ADD CONSTRAINT "subscription_plans_pkey" PRIMARY KEY ("id");ALTER TABLE ONLY "public"."test_results"
    ADD CONSTRAINT "test_results_pkey" PRIMARY KEY ("id");ALTER TABLE ONLY "public"."tests"
    ADD CONSTRAINT "tests_pkey" PRIMARY KEY ("id");ALTER TABLE ONLY "public"."training_records"
    ADD CONSTRAINT "training_records_pkey" PRIMARY KEY ("id");CREATE INDEX "idx_daily_stats_date" ON "public"."daily_stats" USING "btree" ("stat_date" DESC);CREATE INDEX "idx_games_category" ON "public"."games" USING "btree" ("category");CREATE INDEX "idx_orders_order_no" ON "public"."orders" USING "btree" ("order_no");CREATE INDEX "idx_orders_subscription_plan_id" ON "public"."orders" USING "btree" ("subscription_plan_id");CREATE INDEX "idx_orders_user_id" ON "public"."orders" USING "btree" ("user_id");CREATE INDEX "idx_payment_gateway_config_active" ON "public"."payment_gateway_config" USING "btree" ("is_active");CREATE INDEX "idx_profiles_email" ON "public"."profiles" USING "btree" ("email");CREATE INDEX "idx_scale_scoring_rules_type" ON "public"."scale_scoring_rules" USING "btree" ("test_type");CREATE INDEX "idx_scale_test_questions_type" ON "public"."scale_test_questions" USING "btree" ("test_type");CREATE INDEX "idx_subscription_plans_active" ON "public"."subscription_plans" USING "btree" ("is_active");CREATE INDEX "idx_test_results_user_id" ON "public"."test_results" USING "btree" ("user_id");CREATE INDEX "idx_tests_type" ON "public"."tests" USING "btree" ("type");CREATE INDEX "idx_training_records_user_id" ON "public"."training_records" USING "btree" ("user_id");CREATE OR REPLACE TRIGGER "trg_profiles_block_protected_columns" BEFORE UPDATE ON "public"."profiles" FOR EACH ROW EXECUTE FUNCTION "public"."profiles_block_protected_columns"();CREATE OR REPLACE TRIGGER "update_orders_updated_at" BEFORE UPDATE ON "public"."orders" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at"();CREATE OR REPLACE TRIGGER "update_profiles_updated_at" BEFORE UPDATE ON "public"."profiles" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at"();ALTER TABLE ONLY "public"."orders"
    ADD CONSTRAINT "orders_subscription_plan_id_fkey" FOREIGN KEY ("subscription_plan_id") REFERENCES "public"."subscription_plans"("id") ON DELETE SET NULL;ALTER TABLE ONLY "public"."orders"
    ADD CONSTRAINT "orders_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;ALTER TABLE ONLY "public"."test_results"
    ADD CONSTRAINT "test_results_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;ALTER TABLE ONLY "public"."training_records"
    ADD CONSTRAINT "training_records_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;CREATE POLICY "Anyone can read scale scoring rules" ON "public"."scale_scoring_rules" FOR SELECT USING (true);CREATE POLICY "Anyone can read scale test configs" ON "public"."scale_test_configs" FOR SELECT USING (true);CREATE POLICY "Anyone can read scale test questions" ON "public"."scale_test_questions" FOR SELECT USING (true);CREATE POLICY "Games are viewable by everyone" ON "public"."games" FOR SELECT USING (true);CREATE POLICY "Tests are viewable by everyone" ON "public"."tests" FOR SELECT USING (true);ALTER TABLE "public"."games" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."iq_questions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."orders" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."payment_gateway_config" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."scale_scoring_rules" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."scale_test_configs" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."scale_test_questions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."subscription_plans" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."test_results" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."tests" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."training_records" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "所有人可以查看IQ题目" ON "public"."iq_questions" FOR SELECT USING (true);CREATE POLICY "用户可以创建自己的测试结果" ON "public"."test_results" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));CREATE POLICY "用户可以创建自己的训练记录" ON "public"."training_records" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));CREATE POLICY "用户可以更新自己的profile（除role外）" ON "public"."profiles" FOR UPDATE USING (("auth"."uid"() = "id"));CREATE POLICY "用户可以查看激活的订阅包" ON "public"."subscription_plans" FOR SELECT USING (("is_active" = true));CREATE POLICY "用户可以查看自己的profile" ON "public"."profiles" FOR SELECT USING (("auth"."uid"() = "id"));CREATE POLICY "用户可以查看自己的测试结果" ON "public"."test_results" FOR SELECT USING (("auth"."uid"() = "user_id"));CREATE POLICY "用户可以查看自己的订单" ON "public"."orders" FOR SELECT USING (("auth"."uid"() = "user_id"));CREATE POLICY "用户可以查看自己的训练记录" ON "public"."training_records" FOR SELECT USING (("auth"."uid"() = "user_id"));CREATE POLICY "管理员可以删除订阅包" ON "public"."subscription_plans" FOR DELETE USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'admin'::"public"."user_role")))));CREATE POLICY "管理员可以插入订阅包" ON "public"."subscription_plans" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'admin'::"public"."user_role")))));CREATE POLICY "管理员可以更新所有profiles" ON "public"."profiles" FOR UPDATE USING ("public"."is_admin"());CREATE POLICY "管理员可以更新支付网关配置" ON "public"."payment_gateway_config" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'admin'::"public"."user_role")))));CREATE POLICY "管理员可以更新订阅包" ON "public"."subscription_plans" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'admin'::"public"."user_role")))));CREATE POLICY "管理员可以查看所有profiles" ON "public"."profiles" FOR SELECT USING (true);CREATE POLICY "管理员可以查看所有测试结果" ON "public"."test_results" FOR SELECT USING ("public"."is_admin"());CREATE POLICY "管理员可以查看所有订单" ON "public"."orders" FOR SELECT USING ("public"."is_admin"());CREATE POLICY "管理员可以查看所有订阅包" ON "public"."subscription_plans" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'admin'::"public"."user_role")))));CREATE POLICY "管理员可以查看所有训练记录" ON "public"."training_records" FOR SELECT USING ("public"."is_admin"());CREATE POLICY "管理员可以查看支付网关配置" ON "public"."payment_gateway_config" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'admin'::"public"."user_role")))));CREATE POLICY "管理员可以管理IQ题目" ON "public"."iq_questions" USING ("public"."is_admin"());ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";GRANT ALL ON FUNCTION "public"."is_admin"() TO "anon";
GRANT ALL ON FUNCTION "public"."is_admin"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_admin"() TO "service_role";GRANT ALL ON FUNCTION "public"."profiles_block_protected_columns"() TO "anon";
GRANT ALL ON FUNCTION "public"."profiles_block_protected_columns"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."profiles_block_protected_columns"() TO "service_role";GRANT ALL ON FUNCTION "public"."update_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_updated_at"() TO "service_role";
GRANT ALL ON TABLE "public"."daily_stats" TO "anon";
GRANT ALL ON TABLE "public"."daily_stats" TO "authenticated";
GRANT ALL ON TABLE "public"."daily_stats" TO "service_role";GRANT ALL ON TABLE "public"."games" TO "anon";
GRANT ALL ON TABLE "public"."games" TO "authenticated";
GRANT ALL ON TABLE "public"."games" TO "service_role";GRANT ALL ON TABLE "public"."iq_questions" TO "anon";
GRANT ALL ON TABLE "public"."iq_questions" TO "authenticated";
GRANT ALL ON TABLE "public"."iq_questions" TO "service_role";GRANT ALL ON TABLE "public"."orders" TO "anon";
GRANT ALL ON TABLE "public"."orders" TO "authenticated";
GRANT ALL ON TABLE "public"."orders" TO "service_role";GRANT ALL ON TABLE "public"."payment_gateway_config" TO "anon";
GRANT ALL ON TABLE "public"."payment_gateway_config" TO "authenticated";
GRANT ALL ON TABLE "public"."payment_gateway_config" TO "service_role";GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";GRANT ALL ON TABLE "public"."scale_scoring_rules" TO "anon";
GRANT ALL ON TABLE "public"."scale_scoring_rules" TO "authenticated";
GRANT ALL ON TABLE "public"."scale_scoring_rules" TO "service_role";GRANT ALL ON TABLE "public"."scale_test_configs" TO "anon";
GRANT ALL ON TABLE "public"."scale_test_configs" TO "authenticated";
GRANT ALL ON TABLE "public"."scale_test_configs" TO "service_role";GRANT ALL ON TABLE "public"."scale_test_questions" TO "anon";
GRANT ALL ON TABLE "public"."scale_test_questions" TO "authenticated";
GRANT ALL ON TABLE "public"."scale_test_questions" TO "service_role";GRANT ALL ON TABLE "public"."subscription_plans" TO "anon";
GRANT ALL ON TABLE "public"."subscription_plans" TO "authenticated";
GRANT ALL ON TABLE "public"."subscription_plans" TO "service_role";GRANT ALL ON TABLE "public"."test_results" TO "anon";
GRANT ALL ON TABLE "public"."test_results" TO "authenticated";
GRANT ALL ON TABLE "public"."test_results" TO "service_role";GRANT ALL ON TABLE "public"."tests" TO "anon";
GRANT ALL ON TABLE "public"."tests" TO "authenticated";
GRANT ALL ON TABLE "public"."tests" TO "service_role";GRANT ALL ON TABLE "public"."training_records" TO "anon";
GRANT ALL ON TABLE "public"."training_records" TO "authenticated";
GRANT ALL ON TABLE "public"."training_records" TO "service_role";ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";drop extension if exists "pg_net";CREATE TRIGGER on_auth_user_confirmed AFTER UPDATE ON auth.users FOR EACH ROW WHEN (((old.confirmed_at IS NULL) AND (new.confirmed_at IS NOT NULL))) EXECUTE FUNCTION public.handle_new_user();
