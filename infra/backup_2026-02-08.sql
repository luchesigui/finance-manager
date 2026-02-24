SET session_replication_role = replica;

--
-- PostgreSQL database dump
--

-- \restrict St1zxSG5V4etuKsdo9x9x0h4agN8WcocyoHpDnKeJMGW6djm2iYHL0loS3fIwnT

-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.6

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
-- Data for Name: audit_log_entries; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: flow_state; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."flow_state" ("id", "user_id", "auth_code", "code_challenge_method", "code_challenge", "provider_type", "provider_access_token", "provider_refresh_token", "created_at", "updated_at", "authentication_method", "auth_code_issued_at", "invite_token", "referrer", "oauth_client_state_id", "linking_target_id", "email_optional") VALUES
	('c3a425e1-6253-4b5b-8c8d-f4b473ad3be1', '02aab5da-3c73-4d2f-903c-fa7adea8f8d4', '237753c9-16fe-4f3c-9daf-207d9a1937c7', 's256', 'Ab8FP9JsdFh-L_6TojKlnD7awhS-9fwuwej6Bhr5wzo', 'email', '', '', '2025-12-16 16:53:59.476221+00', '2025-12-16 16:54:08.886815+00', 'email/signup', '2025-12-16 16:54:08.886759+00', NULL, NULL, NULL, NULL, false);


--
-- Data for Name: users; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."users" ("instance_id", "id", "aud", "role", "email", "encrypted_password", "email_confirmed_at", "invited_at", "confirmation_token", "confirmation_sent_at", "recovery_token", "recovery_sent_at", "email_change_token_new", "email_change", "email_change_sent_at", "last_sign_in_at", "raw_app_meta_data", "raw_user_meta_data", "is_super_admin", "created_at", "updated_at", "phone", "phone_confirmed_at", "phone_change", "phone_change_token", "phone_change_sent_at", "email_change_token_current", "email_change_confirm_status", "banned_until", "reauthentication_token", "reauthentication_sent_at", "is_sso_user", "deleted_at", "is_anonymous") VALUES
	('00000000-0000-0000-0000-000000000000', 'e6c38a0a-9d5f-4b11-bb10-bbf23bfabd61', 'authenticated', 'authenticated', 'mateus.jose.tulon@gmail.com', '$2a$10$YRvpOeWZwyfrIdQ5dsc4Ae6RVM2KOfYJ4iGDuQeFn8Vzyzzd.o1fm', '2025-12-17 11:11:10.725685+00', NULL, '', NULL, '', NULL, '', '', NULL, '2025-12-17 11:11:10.742327+00', '{"provider": "email", "providers": ["email"]}', '{"sub": "e6c38a0a-9d5f-4b11-bb10-bbf23bfabd61", "email": "mateus.jose.tulon@gmail.com", "email_verified": true, "phone_verified": false}', NULL, '2025-12-17 11:11:10.570508+00', '2025-12-17 21:40:31.745772+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '3ec8e972-109f-4a52-bf8a-dee4e6b7f924', 'authenticated', 'authenticated', 'test@test.com', '$2a$10$gsPz1DoWjtuf8/Gu06aEc.V6.cpaz8YI.Q61eNg5QMT.ksKwstcfq', '2026-01-23 22:47:25.290906+00', NULL, '', NULL, '', NULL, '', '', NULL, '2026-02-08 20:51:43.328617+00', '{"provider": "email", "providers": ["email"]}', '{"sub": "3ec8e972-109f-4a52-bf8a-dee4e6b7f924", "email": "test@test.com", "email_verified": true, "phone_verified": false}', NULL, '2026-01-23 22:47:25.192996+00', '2026-02-08 20:51:43.408443+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', 'b4d91ed2-7c0b-4f0f-9ec7-d44751d514a0', 'authenticated', 'authenticated', 'wluchesi@gmail.com', '$2a$10$aspalqL0en3X/vW/t04VQuw13o3RCEdlXSuDbPV8Mp5CxaZvHQEjG', '2026-02-05 13:30:20.289541+00', NULL, '', NULL, '', NULL, '', '', NULL, '2026-02-05 13:30:20.309109+00', '{"provider": "email", "providers": ["email"]}', '{"sub": "b4d91ed2-7c0b-4f0f-9ec7-d44751d514a0", "email": "wluchesi@gmail.com", "email_verified": true, "phone_verified": false}', NULL, '2026-02-05 13:30:20.097542+00', '2026-02-05 13:30:20.357049+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '54fad26c-fa12-4517-896b-1bf591d0b7d4', 'authenticated', 'authenticated', 'devin@osbornex.com', '$2a$10$MsiP6DHKZb.4rPFmSv6FZuvpHLBnCRvd6cHWUKcM/mlnt0vwAAvSi', '2026-02-05 05:59:12.136299+00', NULL, '', NULL, '', NULL, '', '', NULL, '2026-02-05 05:59:12.160078+00', '{"provider": "email", "providers": ["email"]}', '{"sub": "54fad26c-fa12-4517-896b-1bf591d0b7d4", "email": "devin@osbornex.com", "email_verified": true, "phone_verified": false}', NULL, '2026-02-05 05:59:11.926896+00', '2026-02-05 05:59:12.221012+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '25a9614c-b368-4c87-95f1-e1eba6a652f9', 'authenticated', 'authenticated', 'maparodi22@gmail.com', '$2a$10$tgkJV0NVmoV/4U52KhYoBeoQu2LCK//vstflLNXLRfXu5Dx2TiCC6', '2026-02-05 00:26:00.734745+00', NULL, '', NULL, '', NULL, '', '', NULL, '2026-02-05 00:26:00.74739+00', '{"provider": "email", "providers": ["email"]}', '{"sub": "25a9614c-b368-4c87-95f1-e1eba6a652f9", "email": "maparodi22@gmail.com", "email_verified": true, "phone_verified": false}', NULL, '2026-02-05 00:26:00.596532+00', '2026-02-05 00:26:00.789602+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '32249e9f-fff8-4b05-aaa6-530b27cdc632', 'authenticated', 'authenticated', 'bcesarsilva@live.com', '$2a$10$zsxc/prm7SxA8fAyXualpOSA3q3eaWnwYCsw8O4OW/.WtU/bvCC5W', '2026-02-04 23:58:46.347501+00', NULL, '', NULL, '', NULL, '', '', NULL, '2026-02-04 23:58:46.363877+00', '{"provider": "email", "providers": ["email"]}', '{"sub": "32249e9f-fff8-4b05-aaa6-530b27cdc632", "email": "bcesarsilva@live.com", "email_verified": true, "phone_verified": false}', NULL, '2026-02-04 23:58:46.289903+00', '2026-02-04 23:58:46.372139+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '4e54f129-4416-4ca5-8ce6-d39fcfff300e', 'authenticated', 'authenticated', 'pater@the.tester', '$2a$10$xeDfOV08ZONvNzF6o8CAU.b4jwaHXEIXA4vt7tCRFw2BVcuTgfXaW', '2026-02-05 13:38:46.562822+00', NULL, '', NULL, '', NULL, '', '', NULL, '2026-02-05 13:38:46.56801+00', '{"provider": "email", "providers": ["email"]}', '{"sub": "4e54f129-4416-4ca5-8ce6-d39fcfff300e", "email": "pater@the.tester", "email_verified": true, "phone_verified": false}', NULL, '2026-02-05 13:38:46.530951+00', '2026-02-05 15:13:41.657814+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '2ff8a673-1ffd-4ea0-b7e1-11dac3d920a9', 'authenticated', 'authenticated', 'cinzialuchesi@gmail.vom', '$2a$10$aeGmzX4sJFesPy44ecGhhO80wDfaF/Lkg617UHUVe1ld9q//onxwK', '2026-02-05 23:47:58.314726+00', NULL, '', NULL, '', NULL, '', '', NULL, '2026-02-08 17:06:02.088306+00', '{"provider": "email", "providers": ["email"]}', '{"sub": "2ff8a673-1ffd-4ea0-b7e1-11dac3d920a9", "email": "cinzialuchesi@gmail.vom", "email_verified": true, "phone_verified": false}', NULL, '2026-02-05 23:47:58.134908+00', '2026-02-08 17:06:02.114955+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '02aab5da-3c73-4d2f-903c-fa7adea8f8d4', 'authenticated', 'authenticated', 'gui.olhenrique@gmail.com', '$2a$10$ctPaju3xSTpGiTXxHMxVHeQP5T.EXWji0R.wjGtC62r7OC9UcxSUO', '2025-12-16 16:54:08.879065+00', NULL, '', '2025-12-16 16:53:59.491883+00', '', NULL, '', '', NULL, '2026-02-08 18:04:18.326408+00', '{"provider": "email", "providers": ["email"]}', '{"sub": "02aab5da-3c73-4d2f-903c-fa7adea8f8d4", "email": "gui.olhenrique@gmail.com", "email_verified": true, "phone_verified": false}', NULL, '2025-12-16 16:53:59.395385+00', '2026-02-08 18:04:18.342141+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false);


--
-- Data for Name: identities; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."identities" ("provider_id", "user_id", "identity_data", "provider", "last_sign_in_at", "created_at", "updated_at", "id") VALUES
	('02aab5da-3c73-4d2f-903c-fa7adea8f8d4', '02aab5da-3c73-4d2f-903c-fa7adea8f8d4', '{"sub": "02aab5da-3c73-4d2f-903c-fa7adea8f8d4", "email": "gui.olhenrique@gmail.com", "email_verified": true, "phone_verified": false}', 'email', '2025-12-16 16:53:59.461299+00', '2025-12-16 16:53:59.461854+00', '2025-12-16 16:53:59.461854+00', 'a6e08e11-4c39-4ec7-8d9b-8d684daffe5f'),
	('e6c38a0a-9d5f-4b11-bb10-bbf23bfabd61', 'e6c38a0a-9d5f-4b11-bb10-bbf23bfabd61', '{"sub": "e6c38a0a-9d5f-4b11-bb10-bbf23bfabd61", "email": "mateus.jose.tulon@gmail.com", "email_verified": false, "phone_verified": false}', 'email', '2025-12-17 11:11:10.711052+00', '2025-12-17 11:11:10.711104+00', '2025-12-17 11:11:10.711104+00', 'e83b009c-cae5-4751-90a4-271ae244b042'),
	('3ec8e972-109f-4a52-bf8a-dee4e6b7f924', '3ec8e972-109f-4a52-bf8a-dee4e6b7f924', '{"sub": "3ec8e972-109f-4a52-bf8a-dee4e6b7f924", "email": "test@test.com", "email_verified": false, "phone_verified": false}', 'email', '2026-01-23 22:47:25.283711+00', '2026-01-23 22:47:25.283781+00', '2026-01-23 22:47:25.283781+00', '1b171a0b-3003-42ee-84ac-9ecc73a76613'),
	('32249e9f-fff8-4b05-aaa6-530b27cdc632', '32249e9f-fff8-4b05-aaa6-530b27cdc632', '{"sub": "32249e9f-fff8-4b05-aaa6-530b27cdc632", "email": "bcesarsilva@live.com", "email_verified": false, "phone_verified": false}', 'email', '2026-02-04 23:58:46.342925+00', '2026-02-04 23:58:46.342991+00', '2026-02-04 23:58:46.342991+00', 'cf1ffb85-3671-4629-8a8c-bdafd22238fc'),
	('25a9614c-b368-4c87-95f1-e1eba6a652f9', '25a9614c-b368-4c87-95f1-e1eba6a652f9', '{"sub": "25a9614c-b368-4c87-95f1-e1eba6a652f9", "email": "maparodi22@gmail.com", "email_verified": false, "phone_verified": false}', 'email', '2026-02-05 00:26:00.727939+00', '2026-02-05 00:26:00.728024+00', '2026-02-05 00:26:00.728024+00', 'a96d8fdc-c0e9-4cce-8831-be58fc14b1d8'),
	('54fad26c-fa12-4517-896b-1bf591d0b7d4', '54fad26c-fa12-4517-896b-1bf591d0b7d4', '{"sub": "54fad26c-fa12-4517-896b-1bf591d0b7d4", "email": "devin@osbornex.com", "email_verified": false, "phone_verified": false}', 'email', '2026-02-05 05:59:12.11395+00', '2026-02-05 05:59:12.114038+00', '2026-02-05 05:59:12.114038+00', 'faa01114-e2fe-48f8-92a1-8c7224894f05'),
	('b4d91ed2-7c0b-4f0f-9ec7-d44751d514a0', 'b4d91ed2-7c0b-4f0f-9ec7-d44751d514a0', '{"sub": "b4d91ed2-7c0b-4f0f-9ec7-d44751d514a0", "email": "wluchesi@gmail.com", "email_verified": false, "phone_verified": false}', 'email', '2026-02-05 13:30:20.274275+00', '2026-02-05 13:30:20.275634+00', '2026-02-05 13:30:20.275634+00', '0d9c20a8-c6e0-4a7c-95d6-98c76f33f508'),
	('4e54f129-4416-4ca5-8ce6-d39fcfff300e', '4e54f129-4416-4ca5-8ce6-d39fcfff300e', '{"sub": "4e54f129-4416-4ca5-8ce6-d39fcfff300e", "email": "pater@the.tester", "email_verified": false, "phone_verified": false}', 'email', '2026-02-05 13:38:46.559803+00', '2026-02-05 13:38:46.559854+00', '2026-02-05 13:38:46.559854+00', 'ff7be29e-b1dc-4dc1-bdeb-c4702f604bcf'),
	('2ff8a673-1ffd-4ea0-b7e1-11dac3d920a9', '2ff8a673-1ffd-4ea0-b7e1-11dac3d920a9', '{"sub": "2ff8a673-1ffd-4ea0-b7e1-11dac3d920a9", "email": "cinzialuchesi@gmail.vom", "email_verified": false, "phone_verified": false}', 'email', '2026-02-05 23:47:58.304817+00', '2026-02-05 23:47:58.304887+00', '2026-02-05 23:47:58.304887+00', '7120b4de-d7fc-477e-8016-492cf99b8fca');


--
-- Data for Name: instances; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: oauth_clients; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: sessions; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."sessions" ("id", "user_id", "created_at", "updated_at", "factor_id", "aal", "not_after", "refreshed_at", "user_agent", "ip", "tag", "oauth_client_id", "refresh_token_hmac_key", "refresh_token_counter", "scopes") VALUES
	('018bc926-0da0-4105-97bf-3ec224ac8cdb', '3ec8e972-109f-4a52-bf8a-dee4e6b7f924', '2026-02-08 20:51:43.328727+00', '2026-02-08 20:51:43.328727+00', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', '187.106.41.7', NULL, NULL, NULL, NULL, NULL),
	('f4fe4329-3eb4-4ff9-ab71-959c254cc66b', '4e54f129-4416-4ca5-8ce6-d39fcfff300e', '2026-02-05 13:38:46.568114+00', '2026-02-05 15:13:41.863909+00', NULL, 'aal1', NULL, '2026-02-05 15:13:41.863786', 'node', '18.228.153.99', NULL, NULL, NULL, NULL, NULL),
	('eaf5fcbb-eec4-436c-8ba9-a06d4c983bfe', 'e6c38a0a-9d5f-4b11-bb10-bbf23bfabd61', '2025-12-17 11:11:10.743042+00', '2025-12-17 21:40:31.754289+00', NULL, 'aal1', NULL, '2025-12-17 21:40:31.752543', 'Vercel Edge Functions', '56.125.229.5', NULL, NULL, NULL, NULL, NULL),
	('6cc1652f-e4ad-4d66-97b8-b561a6256368', '32249e9f-fff8-4b05-aaa6-530b27cdc632', '2026-02-04 23:58:46.364011+00', '2026-02-04 23:58:46.364011+00', NULL, 'aal1', NULL, NULL, 'node', '54.174.165.215', NULL, NULL, NULL, NULL, NULL),
	('7060e70a-a707-4bf4-8cfc-8cf6ca8d7cf6', '25a9614c-b368-4c87-95f1-e1eba6a652f9', '2026-02-05 00:26:00.747525+00', '2026-02-05 00:26:00.747525+00', NULL, 'aal1', NULL, NULL, 'node', '3.231.229.255', NULL, NULL, NULL, NULL, NULL);


--
-- Data for Name: mfa_amr_claims; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."mfa_amr_claims" ("session_id", "created_at", "updated_at", "authentication_method", "id") VALUES
	('eaf5fcbb-eec4-436c-8ba9-a06d4c983bfe', '2025-12-17 11:11:10.795512+00', '2025-12-17 11:11:10.795512+00', 'password', '7a80873e-d70e-44c2-8af2-73edc3ee52cc'),
	('018bc926-0da0-4105-97bf-3ec224ac8cdb', '2026-02-08 20:51:43.41449+00', '2026-02-08 20:51:43.41449+00', 'password', '0660b2a9-fc92-47dc-8a0f-2564ace9874e'),
	('6cc1652f-e4ad-4d66-97b8-b561a6256368', '2026-02-04 23:58:46.372501+00', '2026-02-04 23:58:46.372501+00', 'password', '4415bd08-3bd4-4d54-b76b-3e04469b6205'),
	('7060e70a-a707-4bf4-8cfc-8cf6ca8d7cf6', '2026-02-05 00:26:00.790189+00', '2026-02-05 00:26:00.790189+00', 'password', 'a27271cc-cab4-441b-958e-a6eee4f0082d'),
	('f4fe4329-3eb4-4ff9-ab71-959c254cc66b', '2026-02-05 13:38:46.575777+00', '2026-02-05 13:38:46.575777+00', 'password', 'fb31c519-c066-447f-b8f1-ca2ac72e4c60');


--
-- Data for Name: mfa_factors; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: mfa_challenges; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: oauth_authorizations; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: oauth_client_states; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: oauth_consents; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: one_time_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: refresh_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."refresh_tokens" ("instance_id", "id", "token", "user_id", "revoked", "created_at", "updated_at", "parent", "session_id") VALUES
	('00000000-0000-0000-0000-000000000000', 164, 'lxvybfvl4lkh', '25a9614c-b368-4c87-95f1-e1eba6a652f9', false, '2026-02-05 00:26:00.772634+00', '2026-02-05 00:26:00.772634+00', NULL, '7060e70a-a707-4bf4-8cfc-8cf6ca8d7cf6'),
	('00000000-0000-0000-0000-000000000000', 218, 'iq7ohcvcl55z', '3ec8e972-109f-4a52-bf8a-dee4e6b7f924', false, '2026-02-08 20:51:43.372131+00', '2026-02-08 20:51:43.372131+00', NULL, '018bc926-0da0-4105-97bf-3ec224ac8cdb'),
	('00000000-0000-0000-0000-000000000000', 20, '5ebmxyzy2km4', 'e6c38a0a-9d5f-4b11-bb10-bbf23bfabd61', true, '2025-12-17 11:11:10.767665+00', '2025-12-17 21:40:31.69906+00', NULL, 'eaf5fcbb-eec4-436c-8ba9-a06d4c983bfe'),
	('00000000-0000-0000-0000-000000000000', 21, 'ws3lwuujyvds', 'e6c38a0a-9d5f-4b11-bb10-bbf23bfabd61', false, '2025-12-17 21:40:31.725449+00', '2025-12-17 21:40:31.725449+00', '5ebmxyzy2km4', 'eaf5fcbb-eec4-436c-8ba9-a06d4c983bfe'),
	('00000000-0000-0000-0000-000000000000', 173, 'zieg524zdgw2', '4e54f129-4416-4ca5-8ce6-d39fcfff300e', true, '2026-02-05 13:38:46.572148+00', '2026-02-05 15:13:41.618157+00', NULL, 'f4fe4329-3eb4-4ff9-ab71-959c254cc66b'),
	('00000000-0000-0000-0000-000000000000', 159, 'ivjs5pzcnl5i', '32249e9f-fff8-4b05-aaa6-530b27cdc632', false, '2026-02-04 23:58:46.370182+00', '2026-02-04 23:58:46.370182+00', NULL, '6cc1652f-e4ad-4d66-97b8-b561a6256368'),
	('00000000-0000-0000-0000-000000000000', 182, 'yavmec7kmwro', '4e54f129-4416-4ca5-8ce6-d39fcfff300e', false, '2026-02-05 15:13:41.640447+00', '2026-02-05 15:13:41.640447+00', 'zieg524zdgw2', 'f4fe4329-3eb4-4ff9-ab71-959c254cc66b');


--
-- Data for Name: sso_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: saml_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: saml_relay_states; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: sso_domains; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: categories; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."categories" ("id", "name", "created_at") VALUES
	('c0b3b4a0-0001-0000-0000-000000000001', 'Custos Fixos', '2025-12-16 14:22:41.608454+00'),
	('c0b3b4a0-0002-0000-0000-000000000002', 'Conforto', '2025-12-16 14:22:41.608454+00'),
	('c0b3b4a0-0003-0000-0000-000000000003', 'Metas', '2025-12-16 14:22:41.608454+00'),
	('c0b3b4a0-0005-0000-0000-000000000005', 'Liberdade Financeira', '2025-12-16 14:22:41.608454+00'),
	('c0b3b4a0-0006-0000-0000-000000000006', 'Conhecimento', '2025-12-16 14:22:41.608454+00'),
	('c0b3b4a0-0004-0000-0000-000000000004', 'Prazeres', '2025-12-16 14:22:41.608454+00');


--
-- Data for Name: profiles; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."profiles" ("id", "email", "full_name", "avatar_url", "created_at") VALUES
	('02aab5da-3c73-4d2f-903c-fa7adea8f8d4', 'gui.olhenrique@gmail.com', NULL, NULL, '2025-12-16 16:53:59.390803+00'),
	('e6c38a0a-9d5f-4b11-bb10-bbf23bfabd61', 'mateus.jose.tulon@gmail.com', NULL, NULL, '2025-12-17 11:11:10.569513+00'),
	('3ec8e972-109f-4a52-bf8a-dee4e6b7f924', 'test@test.com', NULL, NULL, '2026-01-23 22:47:25.191244+00'),
	('32249e9f-fff8-4b05-aaa6-530b27cdc632', 'bcesarsilva@live.com', NULL, NULL, '2026-02-04 23:58:46.286421+00'),
	('25a9614c-b368-4c87-95f1-e1eba6a652f9', 'maparodi22@gmail.com', NULL, NULL, '2026-02-05 00:26:00.594162+00'),
	('54fad26c-fa12-4517-896b-1bf591d0b7d4', 'devin@osbornex.com', NULL, NULL, '2026-02-05 05:59:11.92524+00'),
	('b4d91ed2-7c0b-4f0f-9ec7-d44751d514a0', 'wluchesi@gmail.com', NULL, NULL, '2026-02-05 13:30:20.095696+00'),
	('4e54f129-4416-4ca5-8ce6-d39fcfff300e', 'pater@the.tester', NULL, NULL, '2026-02-05 13:38:46.53059+00'),
	('2ff8a673-1ffd-4ea0-b7e1-11dac3d920a9', 'cinzialuchesi@gmail.vom', NULL, NULL, '2026-02-05 23:47:58.131363+00');


--
-- Data for Name: people; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."people" ("id", "name", "income", "created_at", "household_id", "linked_user_id") VALUES
	('d0851521-01bd-4ba5-951b-807d038df4df', 'wluchesi', 0, '2026-02-05 13:30:20.095696+00', 'bf033d43-c239-4f95-beed-57e6df2b63f9', 'b4d91ed2-7c0b-4f0f-9ec7-d44751d514a0'),
	('8c296710-483c-437a-876d-404927e08a0f', 'PATER THE TESTER!', 0, '2026-02-05 13:38:46.53059+00', '62380d47-5634-45b3-9db3-d541534d2109', '4e54f129-4416-4ca5-8ce6-d39fcfff300e'),
	('197180e4-abf8-412e-ac33-7bb0a205dce2', 'PUTER THE PENERS', 100000, '2026-02-05 13:53:37.304125+00', '62380d47-5634-45b3-9db3-d541534d2109', NULL),
	('8c745ae4-89c5-460d-8fec-50f86f67fe41', 'Cinzia', 3900, '2026-02-05 23:47:58.131363+00', 'b02c0448-2c95-4c39-afb1-29957a24a499', '2ff8a673-1ffd-4ea0-b7e1-11dac3d920a9'),
	('003e46ba-d2e8-4657-b243-7d9dbc0da133', 'mateus.jose.tulon', 0, '2025-12-17 11:11:10.569513+00', '9da23617-b145-4d3f-8dbf-662842751d0c', 'e6c38a0a-9d5f-4b11-bb10-bbf23bfabd61'),
	('8aec301b-85f7-406b-bc73-9d70534d4040', 'Guilherme', 40000, '2025-12-16 16:53:59.390803+00', '8b09bf3c-9adf-48d2-a8ab-6c6240aac5d9', '02aab5da-3c73-4d2f-903c-fa7adea8f8d4'),
	('98bbb09b-875c-4c5e-ae24-fb637f25b352', 'Amanda', 10000, '2025-12-17 00:52:15.847813+00', '8b09bf3c-9adf-48d2-a8ab-6c6240aac5d9', NULL),
	('dc1431a3-811f-454e-9ab3-be97afdd894c', 'bcesarsilva', 0, '2026-02-04 23:58:46.286421+00', '758c9eed-802e-4750-b06e-f907ea0d031f', '32249e9f-fff8-4b05-aaa6-530b27cdc632'),
	('075af7a6-5e23-476e-883f-cb77a7a2e15c', 'maparodi22', 0, '2026-02-05 00:26:00.594162+00', '15b0cafe-8617-4283-aaff-57a5017de909', '25a9614c-b368-4c87-95f1-e1eba6a652f9'),
	('55f1ebee-1160-48a1-91f7-d0c65de3726b', 'Beltraninho', 4000, '2026-01-23 22:48:03.709045+00', '08456303-f1c0-46fe-850f-2b01dd66410b', NULL),
	('db609c27-506b-4f1c-8e5e-506f9f02099f', 'Fulaninho', 5000, '2026-01-23 22:47:25.191244+00', '08456303-f1c0-46fe-850f-2b01dd66410b', '3ec8e972-109f-4a52-bf8a-dee4e6b7f924'),
	('06526dcb-05a0-481e-b678-62a84d34295d', 'devin', 0, '2026-02-05 05:59:11.92524+00', '21a138cc-bd93-415a-9228-0c005d4da88e', '54fad26c-fa12-4517-896b-1bf591d0b7d4');


--
-- Data for Name: households; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."households" ("id", "created_at", "default_payer_id", "anonymous_id", "emergency_fund") VALUES
	('758c9eed-802e-4750-b06e-f907ea0d031f', '2026-02-04 23:58:46.286421+00', 'dc1431a3-811f-454e-9ab3-be97afdd894c', NULL, 0),
	('15b0cafe-8617-4283-aaff-57a5017de909', '2026-02-05 00:26:00.594162+00', '075af7a6-5e23-476e-883f-cb77a7a2e15c', NULL, 0),
	('08456303-f1c0-46fe-850f-2b01dd66410b', '2026-01-23 22:47:25.191244+00', 'db609c27-506b-4f1c-8e5e-506f9f02099f', NULL, 20000),
	('21a138cc-bd93-415a-9228-0c005d4da88e', '2026-02-05 05:59:11.92524+00', '06526dcb-05a0-481e-b678-62a84d34295d', NULL, 0),
	('bf033d43-c239-4f95-beed-57e6df2b63f9', '2026-02-05 13:30:20.095696+00', 'd0851521-01bd-4ba5-951b-807d038df4df', NULL, 0),
	('62380d47-5634-45b3-9db3-d541534d2109', '2026-02-05 13:38:46.53059+00', '8c296710-483c-437a-876d-404927e08a0f', NULL, 0),
	('9da23617-b145-4d3f-8dbf-662842751d0c', '2025-12-17 11:11:10.569513+00', '003e46ba-d2e8-4657-b243-7d9dbc0da133', NULL, 0),
	('b02c0448-2c95-4c39-afb1-29957a24a499', '2026-02-05 23:47:58.131363+00', '8c745ae4-89c5-460d-8fec-50f86f67fe41', NULL, 0),
	('8b09bf3c-9adf-48d2-a8ab-6c6240aac5d9', '2025-12-16 16:53:59.390803+00', '8aec301b-85f7-406b-bc73-9d70534d4040', NULL, 60000);


--
-- Data for Name: household_categories; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."household_categories" ("id", "household_id", "category_id", "target_percent", "created_at") VALUES
	('05189901-cb48-4a67-8eb7-570123633ee6', '8b09bf3c-9adf-48d2-a8ab-6c6240aac5d9', 'c0b3b4a0-0002-0000-0000-000000000002', 15, '2025-12-16 14:22:41.608454+00'),
	('8f764397-7e62-404c-9dc6-ea801ca08eae', '8b09bf3c-9adf-48d2-a8ab-6c6240aac5d9', 'c0b3b4a0-0005-0000-0000-000000000005', 30, '2025-12-16 14:22:41.608454+00'),
	('03a54ce6-9a5f-48c5-8a33-4c6208f46985', '9da23617-b145-4d3f-8dbf-662842751d0c', 'c0b3b4a0-0005-0000-0000-000000000005', 30, '2025-12-17 11:11:10.569513+00'),
	('0d5184b4-4fbf-4673-a868-34ba2bdf8129', '9da23617-b145-4d3f-8dbf-662842751d0c', 'c0b3b4a0-0001-0000-0000-000000000001', 25, '2025-12-17 11:11:10.569513+00'),
	('d1f4f6ef-8ee1-4652-834e-d5570caddea9', '9da23617-b145-4d3f-8dbf-662842751d0c', 'c0b3b4a0-0002-0000-0000-000000000002', 15, '2025-12-17 11:11:10.569513+00'),
	('c03f31b3-c89e-411c-86e0-60097f33f5ba', '9da23617-b145-4d3f-8dbf-662842751d0c', 'c0b3b4a0-0003-0000-0000-000000000003', 15, '2025-12-17 11:11:10.569513+00'),
	('a1ae542f-9919-4cd4-9381-f29fdb94aef7', '9da23617-b145-4d3f-8dbf-662842751d0c', 'c0b3b4a0-0004-0000-0000-000000000004', 10, '2025-12-17 11:11:10.569513+00'),
	('151fb676-bcee-4f66-bd2a-9306b34922b2', '9da23617-b145-4d3f-8dbf-662842751d0c', 'c0b3b4a0-0006-0000-0000-000000000006', 5, '2025-12-17 11:11:10.569513+00'),
	('6cc1a8f6-4132-4a1e-9392-b420b309384f', 'b02c0448-2c95-4c39-afb1-29957a24a499', 'c0b3b4a0-0005-0000-0000-000000000005', 15, '2026-02-05 23:47:58.131363+00'),
	('92eab77f-7d2a-4fc7-a96a-511b9c89788e', 'b02c0448-2c95-4c39-afb1-29957a24a499', 'c0b3b4a0-0001-0000-0000-000000000001', 40, '2026-02-05 23:47:58.131363+00'),
	('a638f6ab-94a8-45e1-ac99-3f565db7d5c2', '08456303-f1c0-46fe-850f-2b01dd66410b', 'c0b3b4a0-0005-0000-0000-000000000005', 30, '2026-01-23 22:47:25.191244+00'),
	('bf87391f-159c-4592-bec6-3e40c3bd6845', '08456303-f1c0-46fe-850f-2b01dd66410b', 'c0b3b4a0-0006-0000-0000-000000000006', 5, '2026-01-23 22:47:25.191244+00'),
	('e7ec6fdd-768f-4e7c-a16f-c518ea50338a', '8b09bf3c-9adf-48d2-a8ab-6c6240aac5d9', 'c0b3b4a0-0006-0000-0000-000000000006', 1, '2025-12-16 14:22:41.608454+00'),
	('983b34cf-e38c-47e1-a598-2259700d72c6', '8b09bf3c-9adf-48d2-a8ab-6c6240aac5d9', 'c0b3b4a0-0004-0000-0000-000000000004', 14, '2025-12-16 14:22:41.608454+00'),
	('3fb4c773-b62f-43cb-b889-33a907314b21', '8b09bf3c-9adf-48d2-a8ab-6c6240aac5d9', 'c0b3b4a0-0001-0000-0000-000000000001', 30, '2025-12-16 14:22:41.608454+00'),
	('2b39025b-a7e4-4964-a0c2-535fd4a272df', '8b09bf3c-9adf-48d2-a8ab-6c6240aac5d9', 'c0b3b4a0-0003-0000-0000-000000000003', 10, '2025-12-16 14:22:41.608454+00'),
	('17db83ea-e5d0-4345-a413-43e42573335c', '758c9eed-802e-4750-b06e-f907ea0d031f', 'c0b3b4a0-0001-0000-0000-000000000001', 25, '2026-02-04 23:58:46.286421+00'),
	('3aebeea3-ac3c-4fec-adb8-bde9610c74f5', '758c9eed-802e-4750-b06e-f907ea0d031f', 'c0b3b4a0-0002-0000-0000-000000000002', 15, '2026-02-04 23:58:46.286421+00'),
	('09daa38c-474b-4bb6-8acd-9a5777fa9616', '758c9eed-802e-4750-b06e-f907ea0d031f', 'c0b3b4a0-0003-0000-0000-000000000003', 15, '2026-02-04 23:58:46.286421+00'),
	('b7c1deb1-86b1-4f1f-b3a4-5dd0e6e14551', '758c9eed-802e-4750-b06e-f907ea0d031f', 'c0b3b4a0-0005-0000-0000-000000000005', 30, '2026-02-04 23:58:46.286421+00'),
	('06379f23-6368-4fa9-af4b-674ece5d6720', '758c9eed-802e-4750-b06e-f907ea0d031f', 'c0b3b4a0-0006-0000-0000-000000000006', 5, '2026-02-04 23:58:46.286421+00'),
	('fa465d0e-e546-421f-8705-439c9d18ce36', '758c9eed-802e-4750-b06e-f907ea0d031f', 'c0b3b4a0-0004-0000-0000-000000000004', 10, '2026-02-04 23:58:46.286421+00'),
	('2fff0a99-1f3f-4ed1-a38a-1f149d0e0e94', '15b0cafe-8617-4283-aaff-57a5017de909', 'c0b3b4a0-0001-0000-0000-000000000001', 25, '2026-02-05 00:26:00.594162+00'),
	('4613bb83-d372-4fa1-a812-6adcb3874a48', '15b0cafe-8617-4283-aaff-57a5017de909', 'c0b3b4a0-0002-0000-0000-000000000002', 15, '2026-02-05 00:26:00.594162+00'),
	('b36bd06b-3797-43c9-9b15-582052e2481e', '15b0cafe-8617-4283-aaff-57a5017de909', 'c0b3b4a0-0003-0000-0000-000000000003', 15, '2026-02-05 00:26:00.594162+00'),
	('7bc6cff3-07a8-4f46-ba03-2ec25634b360', '15b0cafe-8617-4283-aaff-57a5017de909', 'c0b3b4a0-0005-0000-0000-000000000005', 30, '2026-02-05 00:26:00.594162+00'),
	('f0299af6-9e6f-4c2e-b693-7857f29482c4', '15b0cafe-8617-4283-aaff-57a5017de909', 'c0b3b4a0-0006-0000-0000-000000000006', 5, '2026-02-05 00:26:00.594162+00'),
	('e6ea8f91-a247-4dea-b00d-d476dedadbe8', '15b0cafe-8617-4283-aaff-57a5017de909', 'c0b3b4a0-0004-0000-0000-000000000004', 10, '2026-02-05 00:26:00.594162+00'),
	('c8a7ddd4-9c8e-4fd5-8bf8-df0030427539', '08456303-f1c0-46fe-850f-2b01dd66410b', 'c0b3b4a0-0003-0000-0000-000000000003', 10, '2026-01-23 22:47:25.191244+00'),
	('e06dd6c8-b0f3-43c1-8b70-0dbbb8d0c76c', '08456303-f1c0-46fe-850f-2b01dd66410b', 'c0b3b4a0-0002-0000-0000-000000000002', 8, '2026-01-23 22:47:25.191244+00'),
	('e8588930-3e4a-492f-8507-9016807a7342', '08456303-f1c0-46fe-850f-2b01dd66410b', 'c0b3b4a0-0001-0000-0000-000000000001', 40, '2026-01-23 22:47:25.191244+00'),
	('db0fff11-c409-4b4b-9e0c-c3ca67b9ff39', '08456303-f1c0-46fe-850f-2b01dd66410b', 'c0b3b4a0-0004-0000-0000-000000000004', 7, '2026-01-23 22:47:25.191244+00'),
	('3c643fce-c7ee-4937-abe9-b7857991abbb', '21a138cc-bd93-415a-9228-0c005d4da88e', 'c0b3b4a0-0001-0000-0000-000000000001', 25, '2026-02-05 05:59:11.92524+00'),
	('45bb659e-6ade-4ccc-aeb4-2f34ace32de1', '21a138cc-bd93-415a-9228-0c005d4da88e', 'c0b3b4a0-0002-0000-0000-000000000002', 15, '2026-02-05 05:59:11.92524+00'),
	('97d6397c-1e57-4de3-b01a-8c19c722d6ee', '21a138cc-bd93-415a-9228-0c005d4da88e', 'c0b3b4a0-0003-0000-0000-000000000003', 15, '2026-02-05 05:59:11.92524+00'),
	('974480e9-ef3f-4dd8-b4a7-30c9b480aa34', '21a138cc-bd93-415a-9228-0c005d4da88e', 'c0b3b4a0-0005-0000-0000-000000000005', 30, '2026-02-05 05:59:11.92524+00'),
	('68dedcf0-df60-49a9-bd48-4631a6dc475f', '21a138cc-bd93-415a-9228-0c005d4da88e', 'c0b3b4a0-0006-0000-0000-000000000006', 5, '2026-02-05 05:59:11.92524+00'),
	('5e168757-5ec5-4564-9263-2c0b2118cc2c', '21a138cc-bd93-415a-9228-0c005d4da88e', 'c0b3b4a0-0004-0000-0000-000000000004', 10, '2026-02-05 05:59:11.92524+00'),
	('3623addb-8ba5-4e68-89ad-e5f5b570fa89', 'bf033d43-c239-4f95-beed-57e6df2b63f9', 'c0b3b4a0-0001-0000-0000-000000000001', 25, '2026-02-05 13:30:20.095696+00'),
	('b283d589-e15e-472b-b7da-a9d43a8c6566', 'bf033d43-c239-4f95-beed-57e6df2b63f9', 'c0b3b4a0-0002-0000-0000-000000000002', 15, '2026-02-05 13:30:20.095696+00'),
	('065f9af4-a497-4594-82eb-b919f02718a0', 'bf033d43-c239-4f95-beed-57e6df2b63f9', 'c0b3b4a0-0003-0000-0000-000000000003', 15, '2026-02-05 13:30:20.095696+00'),
	('7e7a9a55-bfbe-4560-9d4c-fe6dd9c4452b', 'bf033d43-c239-4f95-beed-57e6df2b63f9', 'c0b3b4a0-0005-0000-0000-000000000005', 30, '2026-02-05 13:30:20.095696+00'),
	('51206cbc-c7e2-49f4-95d4-9cea0b01d6b2', 'bf033d43-c239-4f95-beed-57e6df2b63f9', 'c0b3b4a0-0006-0000-0000-000000000006', 5, '2026-02-05 13:30:20.095696+00'),
	('29a30eea-369a-41b1-90df-28c491187a25', 'bf033d43-c239-4f95-beed-57e6df2b63f9', 'c0b3b4a0-0004-0000-0000-000000000004', 10, '2026-02-05 13:30:20.095696+00'),
	('f056cb20-f601-49c9-a585-414a8d4ff02e', '62380d47-5634-45b3-9db3-d541534d2109', 'c0b3b4a0-0001-0000-0000-000000000001', 25, '2026-02-05 13:38:46.53059+00'),
	('61ba9a38-5b22-4e4a-9293-de23e0fc950a', '62380d47-5634-45b3-9db3-d541534d2109', 'c0b3b4a0-0002-0000-0000-000000000002', 15, '2026-02-05 13:38:46.53059+00'),
	('037dbc2c-8ade-453f-ae39-000781255ffa', '62380d47-5634-45b3-9db3-d541534d2109', 'c0b3b4a0-0003-0000-0000-000000000003', 15, '2026-02-05 13:38:46.53059+00'),
	('3e6e1fcb-ca00-4f47-8f2e-dc4922597e44', '62380d47-5634-45b3-9db3-d541534d2109', 'c0b3b4a0-0005-0000-0000-000000000005', 30, '2026-02-05 13:38:46.53059+00'),
	('307fb42b-d9e8-4182-bd95-9d60d535811f', '62380d47-5634-45b3-9db3-d541534d2109', 'c0b3b4a0-0006-0000-0000-000000000006', 5, '2026-02-05 13:38:46.53059+00'),
	('1e2e6f48-43cb-4e64-9c6e-317685daad1f', '62380d47-5634-45b3-9db3-d541534d2109', 'c0b3b4a0-0004-0000-0000-000000000004', 10, '2026-02-05 13:38:46.53059+00'),
	('605badda-42fd-4a66-b6ee-2da6fd69ccec', 'b02c0448-2c95-4c39-afb1-29957a24a499', 'c0b3b4a0-0002-0000-0000-000000000002', 15, '2026-02-05 23:47:58.131363+00'),
	('c6b4c79c-4767-46bb-b5a8-b6a05924e92a', 'b02c0448-2c95-4c39-afb1-29957a24a499', 'c0b3b4a0-0003-0000-0000-000000000003', 15, '2026-02-05 23:47:58.131363+00'),
	('708a76d2-fae7-4d11-a115-6fdacd450e5a', 'b02c0448-2c95-4c39-afb1-29957a24a499', 'c0b3b4a0-0006-0000-0000-000000000006', 5, '2026-02-05 23:47:58.131363+00'),
	('72e9f3de-202f-4def-9349-5a671ce92b1f', 'b02c0448-2c95-4c39-afb1-29957a24a499', 'c0b3b4a0-0004-0000-0000-000000000004', 10, '2026-02-05 23:47:58.131363+00');


--
-- Data for Name: household_members; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."household_members" ("household_id", "user_id", "role", "created_at") VALUES
	('8b09bf3c-9adf-48d2-a8ab-6c6240aac5d9', '02aab5da-3c73-4d2f-903c-fa7adea8f8d4', 'owner', '2025-12-16 16:53:59.390803+00'),
	('9da23617-b145-4d3f-8dbf-662842751d0c', 'e6c38a0a-9d5f-4b11-bb10-bbf23bfabd61', 'owner', '2025-12-17 11:11:10.569513+00'),
	('08456303-f1c0-46fe-850f-2b01dd66410b', '3ec8e972-109f-4a52-bf8a-dee4e6b7f924', 'owner', '2026-01-23 22:47:25.191244+00'),
	('758c9eed-802e-4750-b06e-f907ea0d031f', '32249e9f-fff8-4b05-aaa6-530b27cdc632', 'owner', '2026-02-04 23:58:46.286421+00'),
	('15b0cafe-8617-4283-aaff-57a5017de909', '25a9614c-b368-4c87-95f1-e1eba6a652f9', 'owner', '2026-02-05 00:26:00.594162+00'),
	('21a138cc-bd93-415a-9228-0c005d4da88e', '54fad26c-fa12-4517-896b-1bf591d0b7d4', 'owner', '2026-02-05 05:59:11.92524+00'),
	('bf033d43-c239-4f95-beed-57e6df2b63f9', 'b4d91ed2-7c0b-4f0f-9ec7-d44751d514a0', 'owner', '2026-02-05 13:30:20.095696+00'),
	('62380d47-5634-45b3-9db3-d541534d2109', '4e54f129-4416-4ca5-8ce6-d39fcfff300e', 'owner', '2026-02-05 13:38:46.53059+00'),
	('b02c0448-2c95-4c39-afb1-29957a24a499', '2ff8a673-1ffd-4ea0-b7e1-11dac3d920a9', 'owner', '2026-02-05 23:47:58.131363+00');


--
-- Data for Name: simulations; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."simulations" ("id", "household_id", "name", "state", "created_at", "updated_at") VALUES
	('47089af2-1378-409f-911a-7bf9883ef157', '8b09bf3c-9adf-48d2-a8ab-6c6240aac5d9', 'Desemprego - Gui', '{"scenario": "minimalist", "participants": [{"id": "98bbb09b-875c-4c5e-ae24-fb637f25b352", "name": "Amanda", "isActive": true, "realIncome": 10000, "simulatedIncome": 10000, "incomeMultiplier": 1}, {"id": "8aec301b-85f7-406b-bc73-9d70534d4040", "name": "Guilherme", "isActive": false, "realIncome": 40000, "simulatedIncome": 0, "incomeMultiplier": 1}], "expenseOverrides": {"manualExpenses": [{"id": "manual-1770552009312", "amount": 500, "description": "Gasolina"}, {"id": "manual-1770552016278", "amount": 1000, "description": "Outros"}, {"id": "manual-1770552065741", "amount": 120, "description": "Barbeiro"}, {"id": "manual-1770552106626", "amount": 150, "description": "Lavagem de carro"}, {"id": "manual-1770552684778", "amount": 900, "description": "Cidadania - Amanda"}], "ignoredExpenseIds": ["recurring-16", "recurring-24", "recurring-31", "recurring-106", "recurring-33", "recurring-29"]}}', '2026-02-08 11:56:51.467455+00', '2026-02-08 12:11:36.008+00');


--
-- Data for Name: transactions; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."transactions" ("id", "description", "amount", "paid_by", "is_recurring", "date", "created_at", "household_id", "exclude_from_split", "is_credit_card", "type", "is_increment", "is_forecast", "category_id") OVERRIDING SYSTEM VALUE VALUES
	(169, 'Aluguel', 2500, 'db609c27-506b-4f1c-8e5e-506f9f02099f', true, '2026-01-08', '2026-01-23 23:09:36.722953+00', '08456303-f1c0-46fe-850f-2b01dd66410b', false, false, 'expense', true, false, 'e8588930-3e4a-492f-8507-9016807a7342'),
	(251, 'Carro', 250000, 'd0851521-01bd-4ba5-951b-807d038df4df', false, '2026-02-01', '2026-02-05 13:31:43.355549+00', 'bf033d43-c239-4f95-beed-57e6df2b63f9', false, false, 'expense', true, false, '29a30eea-369a-41b1-90df-28c491187a25'),
	(258, 'GASTER MASTERS (7/8)', 8.71125, '8c296710-483c-437a-876d-404927e08a0f', false, '2026-08-01', '2026-02-05 13:51:02.265369+00', '62380d47-5634-45b3-9db3-d541534d2109', false, false, 'expense', true, false, '61ba9a38-5b22-4e4a-9293-de23e0fc950a'),
	(263, 'GASTER MASTERS (6/8)', 8.71125, '8c296710-483c-437a-876d-404927e08a0f', false, '2026-07-01', '2026-02-05 13:51:02.320516+00', '62380d47-5634-45b3-9db3-d541534d2109', false, false, 'expense', true, false, '61ba9a38-5b22-4e4a-9293-de23e0fc950a'),
	(268, 'Sanasa', 280, '8c745ae4-89c5-460d-8fec-50f86f67fe41', true, '2026-02-01', '2026-02-05 23:50:03.805492+00', 'b02c0448-2c95-4c39-afb1-29957a24a499', false, false, 'expense', true, false, '92eab77f-7d2a-4fc7-a96a-511b9c89788e'),
	(275, 'Mercado - Dia do Croissant', 40, '8aec301b-85f7-406b-bc73-9d70534d4040', false, '2026-02-01', '2026-02-07 21:03:42.785272+00', '8b09bf3c-9adf-48d2-a8ab-6c6240aac5d9', false, true, 'expense', true, false, '05189901-cb48-4a67-8eb7-570123633ee6'),
	(282, 'Cabelereiro Amanda', 100, '8aec301b-85f7-406b-bc73-9d70534d4040', false, '2026-02-01', '2026-02-07 21:08:01.163836+00', '8b09bf3c-9adf-48d2-a8ab-6c6240aac5d9', false, true, 'expense', true, false, '3fb4c773-b62f-43cb-b889-33a907314b21'),
	(314, 'Mounjaro', 200, '8aec301b-85f7-406b-bc73-9d70534d4040', false, '2026-02-01', '2026-02-07 21:14:23.378057+00', '8b09bf3c-9adf-48d2-a8ab-6c6240aac5d9', false, true, 'expense', true, false, '05189901-cb48-4a67-8eb7-570123633ee6'),
	(320, 'Cidadania - Amanda (8/21)', 894.8571428571429, '8aec301b-85f7-406b-bc73-9d70534d4040', false, '2026-09-01', '2026-02-07 21:18:24.995984+00', '8b09bf3c-9adf-48d2-a8ab-6c6240aac5d9', false, true, 'expense', true, false, '2b39025b-a7e4-4964-a0c2-535fd4a272df'),
	(325, 'Cidadania - Amanda (11/21)', 894.8571428571429, '8aec301b-85f7-406b-bc73-9d70534d4040', false, '2026-12-01', '2026-02-07 21:18:25.016709+00', '8b09bf3c-9adf-48d2-a8ab-6c6240aac5d9', false, true, 'expense', true, false, '2b39025b-a7e4-4964-a0c2-535fd4a272df'),
	(332, 'Cidadania - Amanda (16/21)', 894.8571428571429, '8aec301b-85f7-406b-bc73-9d70534d4040', false, '2027-05-01', '2026-02-07 21:18:25.036786+00', '8b09bf3c-9adf-48d2-a8ab-6c6240aac5d9', false, true, 'expense', true, false, '2b39025b-a7e4-4964-a0c2-535fd4a272df'),
	(337, 'Cidadania - Amanda (14/21)', 894.8571428571429, '8aec301b-85f7-406b-bc73-9d70534d4040', false, '2027-03-01', '2026-02-07 21:18:25.049855+00', '8b09bf3c-9adf-48d2-a8ab-6c6240aac5d9', false, true, 'expense', true, false, '2b39025b-a7e4-4964-a0c2-535fd4a272df'),
	(342, 'Remédio - Manipulado', 257, '8aec301b-85f7-406b-bc73-9d70534d4040', false, '2026-02-01', '2026-02-07 21:30:24.91071+00', '8b09bf3c-9adf-48d2-a8ab-6c6240aac5d9', false, false, 'expense', true, false, '05189901-cb48-4a67-8eb7-570123633ee6'),
	(348, 'Mounjaro', 1200, '8aec301b-85f7-406b-bc73-9d70534d4040', false, '2026-02-01', '2026-02-08 11:16:08.088656+00', '8b09bf3c-9adf-48d2-a8ab-6c6240aac5d9', false, true, 'expense', true, true, '05189901-cb48-4a67-8eb7-570123633ee6'),
	(354, 'Dólares - Califórnia', 5000, '8aec301b-85f7-406b-bc73-9d70534d4040', false, '2026-03-01', '2026-02-08 11:34:05.671989+00', '8b09bf3c-9adf-48d2-a8ab-6c6240aac5d9', false, false, 'expense', true, true, '2b39025b-a7e4-4964-a0c2-535fd4a272df'),
	(252, 'Renda', 1000000, 'd0851521-01bd-4ba5-951b-807d038df4df', true, '2026-02-01', '2026-02-05 13:32:47.344369+00', 'bf033d43-c239-4f95-beed-57e6df2b63f9', true, false, 'expense', true, false, '7e7a9a55-bfbe-4560-9d4c-fe6dd9c4452b'),
	(259, 'GASTER MASTERS (8/8)', 8.71125, '8c296710-483c-437a-876d-404927e08a0f', false, '2026-09-01', '2026-02-05 13:51:02.267673+00', '62380d47-5634-45b3-9db3-d541534d2109', false, false, 'expense', true, false, '61ba9a38-5b22-4e4a-9293-de23e0fc950a'),
	(269, 'Supermercado ', 120, '8c745ae4-89c5-460d-8fec-50f86f67fe41', false, '2026-02-01', '2026-02-05 23:52:29.711892+00', 'b02c0448-2c95-4c39-afb1-29957a24a499', false, true, 'expense', true, false, '92eab77f-7d2a-4fc7-a96a-511b9c89788e'),
	(276, 'Lenço da Chiara e Brinquedinho', 74, '8aec301b-85f7-406b-bc73-9d70534d4040', false, '2026-02-01', '2026-02-07 21:04:19.868164+00', '8b09bf3c-9adf-48d2-a8ab-6c6240aac5d9', false, true, 'expense', true, false, '05189901-cb48-4a67-8eb7-570123633ee6'),
	(283, 'Coco na lagoa', 44, '8aec301b-85f7-406b-bc73-9d70534d4040', false, '2026-02-01', '2026-02-07 21:08:24.204744+00', '8b09bf3c-9adf-48d2-a8ab-6c6240aac5d9', false, true, 'expense', true, false, '05189901-cb48-4a67-8eb7-570123633ee6'),
	(315, 'Aluguel de Carro (3/3)', 617.3333333333334, '8aec301b-85f7-406b-bc73-9d70534d4040', false, '2026-04-01', '2026-02-07 21:17:36.836443+00', '8b09bf3c-9adf-48d2-a8ab-6c6240aac5d9', false, true, 'expense', true, false, '2b39025b-a7e4-4964-a0c2-535fd4a272df'),
	(321, 'Cidadania - Amanda (6/21)', 894.8571428571429, '8aec301b-85f7-406b-bc73-9d70534d4040', false, '2026-07-01', '2026-02-07 21:18:25.003547+00', '8b09bf3c-9adf-48d2-a8ab-6c6240aac5d9', false, true, 'expense', true, false, '2b39025b-a7e4-4964-a0c2-535fd4a272df'),
	(327, 'Cidadania - Amanda (4/21)', 894.8571428571429, '8aec301b-85f7-406b-bc73-9d70534d4040', false, '2026-05-01', '2026-02-07 21:18:25.017761+00', '8b09bf3c-9adf-48d2-a8ab-6c6240aac5d9', false, true, 'expense', true, false, '2b39025b-a7e4-4964-a0c2-535fd4a272df'),
	(330, 'Cidadania - Amanda (20/21)', 894.8571428571429, '8aec301b-85f7-406b-bc73-9d70534d4040', false, '2027-09-01', '2026-02-07 21:18:25.036385+00', '8b09bf3c-9adf-48d2-a8ab-6c6240aac5d9', false, true, 'expense', true, false, '2b39025b-a7e4-4964-a0c2-535fd4a272df'),
	(336, 'Cidadania - Amanda (17/21)', 894.8571428571429, '8aec301b-85f7-406b-bc73-9d70534d4040', false, '2027-06-01', '2026-02-07 21:18:25.053484+00', '8b09bf3c-9adf-48d2-a8ab-6c6240aac5d9', false, true, 'expense', true, false, '2b39025b-a7e4-4964-a0c2-535fd4a272df'),
	(343, 'Biscoito Chiara', 88, '98bbb09b-875c-4c5e-ae24-fb637f25b352', true, '2026-02-01', '2026-02-07 21:41:16.407051+00', '8b09bf3c-9adf-48d2-a8ab-6c6240aac5d9', false, false, 'expense', true, false, '3fb4c773-b62f-43cb-b889-33a907314b21'),
	(349, 'Marmitas Livup', 1400, '8aec301b-85f7-406b-bc73-9d70534d4040', true, '2026-03-01', '2026-02-08 11:19:51.943939+00', '8b09bf3c-9adf-48d2-a8ab-6c6240aac5d9', false, true, 'expense', true, false, '3fb4c773-b62f-43cb-b889-33a907314b21'),
	(355, 'Mercado', 800, '8aec301b-85f7-406b-bc73-9d70534d4040', false, '2026-02-01', '2026-02-08 11:43:02.543318+00', '8b09bf3c-9adf-48d2-a8ab-6c6240aac5d9', false, true, 'expense', true, true, '3fb4c773-b62f-43cb-b889-33a907314b21'),
	(185, 'Academia', 150, '55f1ebee-1160-48a1-91f7-d0c65de3726b', true, '2026-01-22', '2026-01-23 23:09:36.722953+00', '08456303-f1c0-46fe-850f-2b01dd66410b', false, false, 'expense', true, false, 'e06dd6c8-b0f3-43c1-8b70-0dbbb8d0c76c'),
	(58, 'Renovação de certificado digital', 160, '8aec301b-85f7-406b-bc73-9d70534d4040', false, '2026-01-01', '2026-01-11 03:39:47.117788+00', '8b09bf3c-9adf-48d2-a8ab-6c6240aac5d9', false, true, 'expense', true, false, '3fb4c773-b62f-43cb-b889-33a907314b21'),
	(60, 'Taxa de embarque - LA', 495, '8aec301b-85f7-406b-bc73-9d70534d4040', false, '2026-01-01', '2026-01-11 03:42:09.084583+00', '8b09bf3c-9adf-48d2-a8ab-6c6240aac5d9', false, true, 'expense', true, false, '983b34cf-e38c-47e1-a598-2259700d72c6'),
	(116, 'Folga de fim de ano', 10000, '8aec301b-85f7-406b-bc73-9d70534d4040', false, '2026-02-01', '2026-01-18 00:45:27.157748+00', '8b09bf3c-9adf-48d2-a8ab-6c6240aac5d9', false, false, 'income', false, false, NULL),
	(61, 'Joguinho da Amanda', 465, '8aec301b-85f7-406b-bc73-9d70534d4040', false, '2026-01-01', '2026-01-11 03:42:49.659775+00', '8b09bf3c-9adf-48d2-a8ab-6c6240aac5d9', false, true, 'expense', true, false, '983b34cf-e38c-47e1-a598-2259700d72c6'),
	(62, 'Recarga de tag', 50, '8aec301b-85f7-406b-bc73-9d70534d4040', false, '2026-01-01', '2026-01-11 03:43:24.706922+00', '8b09bf3c-9adf-48d2-a8ab-6c6240aac5d9', false, true, 'expense', true, false, '3fb4c773-b62f-43cb-b889-33a907314b21'),
	(187, 'Reserva Emergencia', 500, 'db609c27-506b-4f1c-8e5e-506f9f02099f', true, '2026-01-21', '2026-01-23 23:09:36.722953+00', '08456303-f1c0-46fe-850f-2b01dd66410b', true, false, 'expense', true, false, 'a638f6ab-94a8-45e1-ac99-3f565db7d5c2'),
	(260, 'GASTER MASTERS (2/8)', 8.71125, '8c296710-483c-437a-876d-404927e08a0f', false, '2026-03-01', '2026-02-05 13:51:02.275252+00', '62380d47-5634-45b3-9db3-d541534d2109', false, false, 'expense', true, false, '61ba9a38-5b22-4e4a-9293-de23e0fc950a'),
	(264, 'GASTER MASTERS (5/8)', 8.71125, '8c296710-483c-437a-876d-404927e08a0f', false, '2026-06-01', '2026-02-05 13:51:02.397412+00', '62380d47-5634-45b3-9db3-d541534d2109', false, false, 'expense', true, false, '61ba9a38-5b22-4e4a-9293-de23e0fc950a'),
	(201, 'Manutencao Carro (previsto)', 800, '55f1ebee-1160-48a1-91f7-d0c65de3726b', false, '2026-02-12', '2026-01-23 23:09:36.722953+00', '08456303-f1c0-46fe-850f-2b01dd66410b', false, false, 'expense', true, true, 'e06dd6c8-b0f3-43c1-8b70-0dbbb8d0c76c'),
	(253, 'Tratamento ocular por danos de reflexo de sol', 75000, '8c296710-483c-437a-876d-404927e08a0f', true, '2026-02-01', '2026-02-05 13:40:51.226059+00', '62380d47-5634-45b3-9db3-d541534d2109', false, false, 'expense', true, false, 'f056cb20-f601-49c9-a585-414a8d4ff02e'),
	(277, 'Padaria com Amigas - Amanda', 75, '8aec301b-85f7-406b-bc73-9d70534d4040', false, '2026-02-01', '2026-02-07 21:04:46.306886+00', '8b09bf3c-9adf-48d2-a8ab-6c6240aac5d9', false, true, 'expense', true, false, '983b34cf-e38c-47e1-a598-2259700d72c6'),
	(310, 'Marmita LivUp', 332, '8aec301b-85f7-406b-bc73-9d70534d4040', false, '2026-02-01', '2026-02-07 21:12:27.510723+00', '8b09bf3c-9adf-48d2-a8ab-6c6240aac5d9', false, true, 'expense', true, false, '3fb4c773-b62f-43cb-b889-33a907314b21'),
	(311, 'Clube Smiles', 46, '8aec301b-85f7-406b-bc73-9d70534d4040', false, '2026-02-01', '2026-02-07 21:13:07.476282+00', '8b09bf3c-9adf-48d2-a8ab-6c6240aac5d9', false, true, 'expense', true, false, '983b34cf-e38c-47e1-a598-2259700d72c6'),
	(316, 'Aluguel de Carro (1/3)', 617.3333333333334, '8aec301b-85f7-406b-bc73-9d70534d4040', false, '2026-02-01', '2026-02-07 21:17:36.857298+00', '8b09bf3c-9adf-48d2-a8ab-6c6240aac5d9', false, true, 'expense', true, false, '2b39025b-a7e4-4964-a0c2-535fd4a272df'),
	(322, 'Cidadania - Amanda (9/21)', 894.8571428571429, '8aec301b-85f7-406b-bc73-9d70534d4040', false, '2026-10-01', '2026-02-07 21:18:25.00757+00', '8b09bf3c-9adf-48d2-a8ab-6c6240aac5d9', false, true, 'expense', true, false, '2b39025b-a7e4-4964-a0c2-535fd4a272df'),
	(333, 'Cidadania - Amanda (18/21)', 894.8571428571429, '8aec301b-85f7-406b-bc73-9d70534d4040', false, '2027-07-01', '2026-02-07 21:18:25.040317+00', '8b09bf3c-9adf-48d2-a8ab-6c6240aac5d9', false, true, 'expense', true, false, '2b39025b-a7e4-4964-a0c2-535fd4a272df'),
	(339, 'Estacionamento', 17, '8aec301b-85f7-406b-bc73-9d70534d4040', false, '2026-02-01', '2026-02-07 21:19:27.945402+00', '8b09bf3c-9adf-48d2-a8ab-6c6240aac5d9', false, true, 'expense', true, false, '3fb4c773-b62f-43cb-b889-33a907314b21'),
	(344, 'Café da manhã com as amigas ', 23, '98bbb09b-875c-4c5e-ae24-fb637f25b352', false, '2026-02-01', '2026-02-07 21:41:36.502027+00', '8b09bf3c-9adf-48d2-a8ab-6c6240aac5d9', false, false, 'expense', true, false, '983b34cf-e38c-47e1-a598-2259700d72c6'),
	(350, 'Mercado', 1200, '8aec301b-85f7-406b-bc73-9d70534d4040', true, '2026-03-01', '2026-02-08 11:22:01.725255+00', '8b09bf3c-9adf-48d2-a8ab-6c6240aac5d9', false, true, 'expense', true, false, '05189901-cb48-4a67-8eb7-570123633ee6'),
	(188, 'Reserva Troca de Carro', 800, '55f1ebee-1160-48a1-91f7-d0c65de3726b', true, '2026-01-21', '2026-01-23 23:09:36.722953+00', '08456303-f1c0-46fe-850f-2b01dd66410b', false, false, 'expense', true, false, 'c8a7ddd4-9c8e-4fd5-8bf8-df0030427539'),
	(189, 'Restaurante Japones', 320, 'db609c27-506b-4f1c-8e5e-506f9f02099f', false, '2026-01-09', '2026-01-23 23:09:36.722953+00', '08456303-f1c0-46fe-850f-2b01dd66410b', false, true, 'expense', true, false, 'db0fff11-c409-4b4b-9e0c-c3ca67b9ff39'),
	(190, 'Bar com amigos', 180, 'db609c27-506b-4f1c-8e5e-506f9f02099f', false, '2026-01-16', '2026-01-23 23:09:36.722953+00', '08456303-f1c0-46fe-850f-2b01dd66410b', false, true, 'expense', true, false, 'db0fff11-c409-4b4b-9e0c-c3ca67b9ff39'),
	(191, 'Spotify', 35, 'db609c27-506b-4f1c-8e5e-506f9f02099f', true, '2026-01-18', '2026-01-23 23:09:36.722953+00', '08456303-f1c0-46fe-850f-2b01dd66410b', false, false, 'expense', true, false, 'db0fff11-c409-4b4b-9e0c-c3ca67b9ff39'),
	(192, 'Delivery iFood', 95, 'db609c27-506b-4f1c-8e5e-506f9f02099f', false, '2026-01-21', '2026-01-23 23:09:36.722953+00', '08456303-f1c0-46fe-850f-2b01dd66410b', false, true, 'expense', true, false, 'db0fff11-c409-4b4b-9e0c-c3ca67b9ff39'),
	(193, 'Cinema', 85, '55f1ebee-1160-48a1-91f7-d0c65de3726b', false, '2026-01-13', '2026-01-23 23:09:36.722953+00', '08456303-f1c0-46fe-850f-2b01dd66410b', false, true, 'expense', true, false, 'db0fff11-c409-4b4b-9e0c-c3ca67b9ff39'),
	(194, 'Netflix', 45, '55f1ebee-1160-48a1-91f7-d0c65de3726b', true, '2026-01-18', '2026-01-23 23:09:36.722953+00', '08456303-f1c0-46fe-850f-2b01dd66410b', false, false, 'expense', true, false, 'db0fff11-c409-4b4b-9e0c-c3ca67b9ff39'),
	(195, 'Presente aniversario', 250, '55f1ebee-1160-48a1-91f7-d0c65de3726b', false, '2026-01-22', '2026-01-23 23:09:36.722953+00', '08456303-f1c0-46fe-850f-2b01dd66410b', false, true, 'expense', true, false, 'db0fff11-c409-4b4b-9e0c-c3ca67b9ff39'),
	(196, 'Curso Udemy', 80, 'db609c27-506b-4f1c-8e5e-506f9f02099f', false, '2026-01-03', '2026-01-23 23:09:36.722953+00', '08456303-f1c0-46fe-850f-2b01dd66410b', false, false, 'expense', true, false, 'bf87391f-159c-4592-bec6-3e40c3bd6845'),
	(199, 'Curso de Ingles', 300, '55f1ebee-1160-48a1-91f7-d0c65de3726b', true, '2026-01-20', '2026-01-23 23:09:36.722953+00', '08456303-f1c0-46fe-850f-2b01dd66410b', false, false, 'expense', true, false, 'bf87391f-159c-4592-bec6-3e40c3bd6845'),
	(200, 'IPVA (previsto)', 2500, 'db609c27-506b-4f1c-8e5e-506f9f02099f', false, '2026-02-07', '2026-01-23 23:09:36.722953+00', '08456303-f1c0-46fe-850f-2b01dd66410b', false, false, 'expense', true, true, 'e8588930-3e4a-492f-8507-9016807a7342'),
	(254, 'Testar Sites de Amigos', 5000, '8c296710-483c-437a-876d-404927e08a0f', true, '2026-02-01', '2026-02-05 13:41:27.985051+00', '62380d47-5634-45b3-9db3-d541534d2109', false, false, 'income', true, false, NULL),
	(261, 'GASTER MASTERS (3/8)', 8.71125, '8c296710-483c-437a-876d-404927e08a0f', false, '2026-04-01', '2026-02-05 13:51:02.291096+00', '62380d47-5634-45b3-9db3-d541534d2109', false, false, 'expense', true, false, '61ba9a38-5b22-4e4a-9293-de23e0fc950a'),
	(271, 'Aluguel kitnet', 2000, '8c745ae4-89c5-460d-8fec-50f86f67fe41', true, '2026-02-01', '2026-02-06 10:04:34.609833+00', 'b02c0448-2c95-4c39-afb1-29957a24a499', false, false, 'income', true, false, NULL),
	(278, 'Mounjaro', 200, '8aec301b-85f7-406b-bc73-9d70534d4040', false, '2026-02-01', '2026-02-07 21:05:39.80144+00', '8b09bf3c-9adf-48d2-a8ab-6c6240aac5d9', false, true, 'expense', true, false, '05189901-cb48-4a67-8eb7-570123633ee6'),
	(285, 'Aluguel de Carro (2/3)', 206, '8aec301b-85f7-406b-bc73-9d70534d4040', false, '2026-03-01', '2026-02-07 21:09:36.203993+00', '8b09bf3c-9adf-48d2-a8ab-6c6240aac5d9', false, true, 'expense', true, false, '2b39025b-a7e4-4964-a0c2-535fd4a272df'),
	(59, 'Clube Smiles', 46, '8aec301b-85f7-406b-bc73-9d70534d4040', false, '2026-01-01', '2026-01-11 03:40:04.057076+00', '8b09bf3c-9adf-48d2-a8ab-6c6240aac5d9', false, true, 'expense', true, false, '983b34cf-e38c-47e1-a598-2259700d72c6'),
	(317, 'Aluguel de Carro (2/3)', 617.3333333333334, '8aec301b-85f7-406b-bc73-9d70534d4040', false, '2026-03-01', '2026-02-07 21:17:36.86099+00', '8b09bf3c-9adf-48d2-a8ab-6c6240aac5d9', false, true, 'expense', true, false, '2b39025b-a7e4-4964-a0c2-535fd4a272df'),
	(323, 'Cidadania - Amanda (1/21)', 894.8571428571429, '8aec301b-85f7-406b-bc73-9d70534d4040', false, '2026-02-01', '2026-02-07 21:18:25.004366+00', '8b09bf3c-9adf-48d2-a8ab-6c6240aac5d9', false, true, 'expense', true, false, '2b39025b-a7e4-4964-a0c2-535fd4a272df'),
	(331, 'Cidadania - Amanda (5/21)', 894.8571428571429, '8aec301b-85f7-406b-bc73-9d70534d4040', false, '2026-06-01', '2026-02-07 21:18:25.04313+00', '8b09bf3c-9adf-48d2-a8ab-6c6240aac5d9', false, true, 'expense', true, false, '2b39025b-a7e4-4964-a0c2-535fd4a272df'),
	(340, 'Cursor - Uso adicional', 224, '8aec301b-85f7-406b-bc73-9d70534d4040', false, '2026-02-01', '2026-02-07 21:20:27.236402+00', '8b09bf3c-9adf-48d2-a8ab-6c6240aac5d9', false, true, 'expense', true, false, 'e7ec6fdd-768f-4e7c-a16f-c518ea50338a'),
	(345, 'Mercado', 120, '8aec301b-85f7-406b-bc73-9d70534d4040', false, '2026-02-01', '2026-02-07 21:42:13.994203+00', '8b09bf3c-9adf-48d2-a8ab-6c6240aac5d9', false, true, 'expense', true, false, '3fb4c773-b62f-43cb-b889-33a907314b21'),
	(351, 'Demissão', 20000, '8aec301b-85f7-406b-bc73-9d70534d4040', false, '2026-04-01', '2026-02-08 11:24:32.81665+00', '8b09bf3c-9adf-48d2-a8ab-6c6240aac5d9', false, false, 'income', false, false, NULL),
	(236, 'Recompor poupança - Gui', 2300, '8aec301b-85f7-406b-bc73-9d70534d4040', false, '2026-02-01', '2026-01-31 18:51:55.688233+00', '8b09bf3c-9adf-48d2-a8ab-6c6240aac5d9', true, false, 'expense', true, false, '8f764397-7e62-404c-9dc6-ea801ca08eae'),
	(235, 'Marmitas Livup', 383, '8aec301b-85f7-406b-bc73-9d70534d4040', false, '2026-02-01', '2026-01-31 18:49:03.435184+00', '8b09bf3c-9adf-48d2-a8ab-6c6240aac5d9', false, true, 'expense', true, false, '05189901-cb48-4a67-8eb7-570123633ee6'),
	(45, 'Marmitas Livup', 360, '8aec301b-85f7-406b-bc73-9d70534d4040', false, '2026-01-01', '2026-01-05 01:58:44.594126+00', '8b09bf3c-9adf-48d2-a8ab-6c6240aac5d9', false, true, 'expense', true, false, '3fb4c773-b62f-43cb-b889-33a907314b21'),
	(46, 'Produtos de skin care', 310, '8aec301b-85f7-406b-bc73-9d70534d4040', false, '2026-01-01', '2026-01-05 02:06:22.363191+00', '8b09bf3c-9adf-48d2-a8ab-6c6240aac5d9', false, true, 'expense', true, false, '05189901-cb48-4a67-8eb7-570123633ee6'),
	(47, 'Almoço de domingo - Amanda', 42, '8aec301b-85f7-406b-bc73-9d70534d4040', false, '2026-01-01', '2026-01-05 02:07:11.368226+00', '8b09bf3c-9adf-48d2-a8ab-6c6240aac5d9', false, true, 'expense', true, false, '05189901-cb48-4a67-8eb7-570123633ee6'),
	(48, 'Gasolina', 205, '8aec301b-85f7-406b-bc73-9d70534d4040', false, '2026-01-01', '2026-01-05 02:07:37.486378+00', '8b09bf3c-9adf-48d2-a8ab-6c6240aac5d9', false, true, 'expense', true, false, '3fb4c773-b62f-43cb-b889-33a907314b21'),
	(56, 'Produtos para casa', 280, '8aec301b-85f7-406b-bc73-9d70534d4040', false, '2026-01-01', '2026-01-11 03:39:09.313396+00', '8b09bf3c-9adf-48d2-a8ab-6c6240aac5d9', false, true, 'expense', true, false, '05189901-cb48-4a67-8eb7-570123633ee6'),
	(57, 'Mercado', 265, '8aec301b-85f7-406b-bc73-9d70534d4040', false, '2026-01-01', '2026-01-11 03:39:24.675537+00', '8b09bf3c-9adf-48d2-a8ab-6c6240aac5d9', false, true, 'expense', true, false, '3fb4c773-b62f-43cb-b889-33a907314b21'),
	(67, 'Estacionamento', 28, '8aec301b-85f7-406b-bc73-9d70534d4040', false, '2026-01-01', '2026-01-11 03:48:32.962792+00', '8b09bf3c-9adf-48d2-a8ab-6c6240aac5d9', false, true, 'expense', true, false, '05189901-cb48-4a67-8eb7-570123633ee6'),
	(136, 'Reabastecer reserva de emergência - Gui', 1000, '8aec301b-85f7-406b-bc73-9d70534d4040', false, '2026-02-01', '2026-01-23 03:51:06.267516+00', '8b09bf3c-9adf-48d2-a8ab-6c6240aac5d9', false, false, 'expense', true, false, '8f764397-7e62-404c-9dc6-ea801ca08eae'),
	(224, 'Mercadinha AM Labs', 2.2, '8aec301b-85f7-406b-bc73-9d70534d4040', false, '2026-01-01', '2026-01-31 15:45:40.310444+00', '8b09bf3c-9adf-48d2-a8ab-6c6240aac5d9', false, true, 'expense', true, false, '05189901-cb48-4a67-8eb7-570123633ee6'),
	(230, 'Mercado AM Labs', 20, '98bbb09b-875c-4c5e-ae24-fb637f25b352', false, '2026-01-01', '2026-01-31 17:55:47.163845+00', '8b09bf3c-9adf-48d2-a8ab-6c6240aac5d9', false, true, 'expense', true, false, '05189901-cb48-4a67-8eb7-570123633ee6'),
	(232, 'Remédios', 214, '98bbb09b-875c-4c5e-ae24-fb637f25b352', false, '2026-01-01', '2026-01-31 17:56:48.44964+00', '8b09bf3c-9adf-48d2-a8ab-6c6240aac5d9', false, true, 'expense', true, false, '3fb4c773-b62f-43cb-b889-33a907314b21'),
	(233, 'Água de côco', 44, '98bbb09b-875c-4c5e-ae24-fb637f25b352', false, '2026-01-01', '2026-01-31 17:58:14.728615+00', '8b09bf3c-9adf-48d2-a8ab-6c6240aac5d9', false, true, 'expense', true, false, '3fb4c773-b62f-43cb-b889-33a907314b21'),
	(234, 'Mercado', 30, '98bbb09b-875c-4c5e-ae24-fb637f25b352', false, '2026-01-01', '2026-01-31 17:58:27.036768+00', '8b09bf3c-9adf-48d2-a8ab-6c6240aac5d9', false, true, 'expense', true, false, '3fb4c773-b62f-43cb-b889-33a907314b21'),
	(226, 'Gás', 28, '8aec301b-85f7-406b-bc73-9d70534d4040', false, '2026-01-01', '2026-01-31 15:49:58.695679+00', '8b09bf3c-9adf-48d2-a8ab-6c6240aac5d9', false, false, 'expense', true, false, '3fb4c773-b62f-43cb-b889-33a907314b21'),
	(231, 'Dedetização (Golpe)', 650, '98bbb09b-875c-4c5e-ae24-fb637f25b352', false, '2026-01-01', '2026-01-31 17:56:20.203327+00', '8b09bf3c-9adf-48d2-a8ab-6c6240aac5d9', false, false, 'expense', true, false, '3fb4c773-b62f-43cb-b889-33a907314b21'),
	(227, 'Remoção do Gambá morto', 150, '8aec301b-85f7-406b-bc73-9d70534d4040', false, '2026-01-01', '2026-01-31 15:51:02.90068+00', '8b09bf3c-9adf-48d2-a8ab-6c6240aac5d9', false, false, 'expense', true, false, '3fb4c773-b62f-43cb-b889-33a907314b21'),
	(255, 'PENIS BENIS PONIS BUNIS', 9999.99, '8c296710-483c-437a-876d-404927e08a0f', false, '2026-02-01', '2026-02-05 13:42:17.839548+00', '62380d47-5634-45b3-9db3-d541534d2109', false, false, 'income', true, false, '61ba9a38-5b22-4e4a-9293-de23e0fc950a'),
	(279, 'Estacionamento', 17, '8aec301b-85f7-406b-bc73-9d70534d4040', false, '2026-02-01', '2026-02-07 21:06:04.795743+00', '8b09bf3c-9adf-48d2-a8ab-6c6240aac5d9', false, true, 'expense', true, false, '3fb4c773-b62f-43cb-b889-33a907314b21'),
	(286, 'Aluguel de Carro (3/3)', 206, '8aec301b-85f7-406b-bc73-9d70534d4040', false, '2026-04-01', '2026-02-07 21:09:36.275113+00', '8b09bf3c-9adf-48d2-a8ab-6c6240aac5d9', false, true, 'expense', true, false, '2b39025b-a7e4-4964-a0c2-535fd4a272df'),
	(312, 'Almoço no Candevra - Amanda', 58, '8aec301b-85f7-406b-bc73-9d70534d4040', false, '2026-02-01', '2026-02-07 21:13:26.205508+00', '8b09bf3c-9adf-48d2-a8ab-6c6240aac5d9', false, true, 'expense', true, false, '05189901-cb48-4a67-8eb7-570123633ee6'),
	(318, 'Cidadania - Amanda (3/21)', 894.8571428571429, '8aec301b-85f7-406b-bc73-9d70534d4040', false, '2026-04-01', '2026-02-07 21:18:24.991713+00', '8b09bf3c-9adf-48d2-a8ab-6c6240aac5d9', false, true, 'expense', true, false, '2b39025b-a7e4-4964-a0c2-535fd4a272df'),
	(324, 'Cidadania - Amanda (12/21)', 894.8571428571429, '8aec301b-85f7-406b-bc73-9d70534d4040', false, '2027-01-01', '2026-02-07 21:18:25.013571+00', '8b09bf3c-9adf-48d2-a8ab-6c6240aac5d9', false, true, 'expense', true, false, '2b39025b-a7e4-4964-a0c2-535fd4a272df'),
	(329, 'Cidadania - Amanda (2/21)', 894.8571428571429, '8aec301b-85f7-406b-bc73-9d70534d4040', false, '2026-03-01', '2026-02-07 21:18:25.029259+00', '8b09bf3c-9adf-48d2-a8ab-6c6240aac5d9', false, true, 'expense', true, false, '2b39025b-a7e4-4964-a0c2-535fd4a272df'),
	(335, 'Cidadania - Amanda (19/21)', 894.8571428571429, '8aec301b-85f7-406b-bc73-9d70534d4040', false, '2027-08-01', '2026-02-07 21:18:25.043955+00', '8b09bf3c-9adf-48d2-a8ab-6c6240aac5d9', false, true, 'expense', true, false, '2b39025b-a7e4-4964-a0c2-535fd4a272df'),
	(341, 'Bar do Carioca com os amigos', 100, '8aec301b-85f7-406b-bc73-9d70534d4040', false, '2026-02-01', '2026-02-07 21:20:43.418079+00', '8b09bf3c-9adf-48d2-a8ab-6c6240aac5d9', false, true, 'expense', true, false, '983b34cf-e38c-47e1-a598-2259700d72c6'),
	(352, 'Hotel - Disney', 2800, '8aec301b-85f7-406b-bc73-9d70534d4040', false, '2026-04-01', '2026-02-08 11:27:10.953789+00', '8b09bf3c-9adf-48d2-a8ab-6c6240aac5d9', false, true, 'expense', true, true, '2b39025b-a7e4-4964-a0c2-535fd4a272df'),
	(346, 'Dólares', 4000, '8aec301b-85f7-406b-bc73-9d70534d4040', false, '2026-02-01', '2026-02-08 11:14:36.59731+00', '8b09bf3c-9adf-48d2-a8ab-6c6240aac5d9', false, false, 'expense', true, true, '2b39025b-a7e4-4964-a0c2-535fd4a272df'),
	(249, 'Plano de saúde - Roseli', 1650, '8aec301b-85f7-406b-bc73-9d70534d4040', false, '2026-01-01', '2026-02-03 13:32:40.93074+00', '8b09bf3c-9adf-48d2-a8ab-6c6240aac5d9', false, false, 'expense', true, false, '983b34cf-e38c-47e1-a598-2259700d72c6'),
	(211, 'Poke na noite do board game | iFood', 267, '8aec301b-85f7-406b-bc73-9d70534d4040', false, '2026-01-01', '2026-01-31 15:23:10.513017+00', '8b09bf3c-9adf-48d2-a8ab-6c6240aac5d9', false, true, 'expense', true, false, '05189901-cb48-4a67-8eb7-570123633ee6'),
	(171, 'Internet', 150, 'db609c27-506b-4f1c-8e5e-506f9f02099f', true, '2026-01-13', '2026-01-23 23:09:36.722953+00', '08456303-f1c0-46fe-850f-2b01dd66410b', false, false, 'expense', true, false, 'e8588930-3e4a-492f-8507-9016807a7342'),
	(172, 'Plano de Saude', 450, 'db609c27-506b-4f1c-8e5e-506f9f02099f', true, '2026-01-18', '2026-01-23 23:09:36.722953+00', '08456303-f1c0-46fe-850f-2b01dd66410b', false, false, 'expense', true, false, 'e8588930-3e4a-492f-8507-9016807a7342'),
	(174, 'Agua', 95, '55f1ebee-1160-48a1-91f7-d0c65de3726b', true, '2026-01-15', '2026-01-23 23:09:36.722953+00', '08456303-f1c0-46fe-850f-2b01dd66410b', false, false, 'expense', true, false, 'e8588930-3e4a-492f-8507-9016807a7342'),
	(175, 'Gas', 60, '55f1ebee-1160-48a1-91f7-d0c65de3726b', true, '2026-01-16', '2026-01-23 23:09:36.722953+00', '08456303-f1c0-46fe-850f-2b01dd66410b', false, false, 'expense', true, false, 'e8588930-3e4a-492f-8507-9016807a7342'),
	(176, 'Seguro Carro', 180, '55f1ebee-1160-48a1-91f7-d0c65de3726b', true, '2026-01-20', '2026-01-23 23:09:36.722953+00', '08456303-f1c0-46fe-850f-2b01dd66410b', false, false, 'expense', true, false, 'e8588930-3e4a-492f-8507-9016807a7342'),
	(50, 'Viagem pra Atlanta (3/3)', 540, '8aec301b-85f7-406b-bc73-9d70534d4040', false, '2026-03-01', '2026-01-05 14:35:43.677362+00', '8b09bf3c-9adf-48d2-a8ab-6c6240aac5d9', false, false, 'expense', true, false, '983b34cf-e38c-47e1-a598-2259700d72c6'),
	(16, 'Babu Pet School', 580, '98bbb09b-875c-4c5e-ae24-fb637f25b352', true, '2026-01-01', '2026-01-02 02:36:19.430998+00', '8b09bf3c-9adf-48d2-a8ab-6c6240aac5d9', false, false, 'expense', true, false, '05189901-cb48-4a67-8eb7-570123633ee6'),
	(181, 'Supermercado', 1200, 'db609c27-506b-4f1c-8e5e-506f9f02099f', false, '2026-01-11', '2026-01-23 23:09:36.722953+00', '08456303-f1c0-46fe-850f-2b01dd66410b', false, true, 'expense', true, false, 'e06dd6c8-b0f3-43c1-8b70-0dbbb8d0c76c'),
	(182, 'Farmacia', 180, 'db609c27-506b-4f1c-8e5e-506f9f02099f', false, '2026-01-17', '2026-01-23 23:09:36.722953+00', '08456303-f1c0-46fe-850f-2b01dd66410b', false, false, 'expense', true, false, 'e06dd6c8-b0f3-43c1-8b70-0dbbb8d0c76c'),
	(183, 'Uber/99', 250, 'db609c27-506b-4f1c-8e5e-506f9f02099f', false, '2026-01-20', '2026-01-23 23:09:36.722953+00', '08456303-f1c0-46fe-850f-2b01dd66410b', false, true, 'expense', true, false, 'e06dd6c8-b0f3-43c1-8b70-0dbbb8d0c76c'),
	(10, 'Aluguel', 4120, '8aec301b-85f7-406b-bc73-9d70534d4040', true, '2026-01-01', '2025-12-17 02:52:25.890951+00', '8b09bf3c-9adf-48d2-a8ab-6c6240aac5d9', false, false, 'expense', true, false, '3fb4c773-b62f-43cb-b889-33a907314b21'),
	(21, 'Água', 120, '8aec301b-85f7-406b-bc73-9d70534d4040', true, '2026-01-01', '2026-01-02 02:46:39.611246+00', '8b09bf3c-9adf-48d2-a8ab-6c6240aac5d9', false, false, 'expense', true, false, '3fb4c773-b62f-43cb-b889-33a907314b21'),
	(22, 'Internet', 175, '8aec301b-85f7-406b-bc73-9d70534d4040', true, '2026-01-01', '2026-01-02 02:46:50.901187+00', '8b09bf3c-9adf-48d2-a8ab-6c6240aac5d9', false, false, 'expense', true, false, '3fb4c773-b62f-43cb-b889-33a907314b21'),
	(23, 'Plano de Saúde - Gui', 480, '8aec301b-85f7-406b-bc73-9d70534d4040', true, '2026-01-01', '2026-01-02 02:47:10.123394+00', '8b09bf3c-9adf-48d2-a8ab-6c6240aac5d9', false, false, 'expense', true, false, '3fb4c773-b62f-43cb-b889-33a907314b21'),
	(184, 'Supermercado', 850, '55f1ebee-1160-48a1-91f7-d0c65de3726b', false, '2026-01-18', '2026-01-23 23:09:36.722953+00', '08456303-f1c0-46fe-850f-2b01dd66410b', false, true, 'expense', true, false, 'e06dd6c8-b0f3-43c1-8b70-0dbbb8d0c76c'),
	(15, 'Emmanuel - Psi', 1125, '98bbb09b-875c-4c5e-ae24-fb637f25b352', true, '2026-01-01', '2026-01-02 02:25:46.065356+00', '8b09bf3c-9adf-48d2-a8ab-6c6240aac5d9', false, false, 'expense', true, false, '3fb4c773-b62f-43cb-b889-33a907314b21'),
	(28, 'Spotify', 32, '8aec301b-85f7-406b-bc73-9d70534d4040', true, '2026-01-01', '2026-01-02 03:05:04.296112+00', '8b09bf3c-9adf-48d2-a8ab-6c6240aac5d9', false, true, 'expense', true, false, '05189901-cb48-4a67-8eb7-570123633ee6'),
	(55, 'Café', 105, '8aec301b-85f7-406b-bc73-9d70534d4040', true, '2026-01-01', '2026-01-11 03:38:26.246271+00', '8b09bf3c-9adf-48d2-a8ab-6c6240aac5d9', false, true, 'expense', true, false, '05189901-cb48-4a67-8eb7-570123633ee6'),
	(37, 'Cursor', 115, '8aec301b-85f7-406b-bc73-9d70534d4040', true, '2026-01-01', '2026-01-02 03:21:28.02114+00', '8b09bf3c-9adf-48d2-a8ab-6c6240aac5d9', false, true, 'expense', true, false, '05189901-cb48-4a67-8eb7-570123633ee6'),
	(36, 'Ração da Chiara', 207, '8aec301b-85f7-406b-bc73-9d70534d4040', true, '2026-01-01', '2026-01-02 03:21:10.981917+00', '8b09bf3c-9adf-48d2-a8ab-6c6240aac5d9', false, true, 'expense', true, false, '3fb4c773-b62f-43cb-b889-33a907314b21'),
	(18, 'Plano de Saúde - Amanda', 525, '98bbb09b-875c-4c5e-ae24-fb637f25b352', true, '2026-01-01', '2026-01-02 02:41:02.33373+00', '8b09bf3c-9adf-48d2-a8ab-6c6240aac5d9', false, false, 'expense', true, false, '3fb4c773-b62f-43cb-b889-33a907314b21'),
	(38, 'Outback', 41.9, '8aec301b-85f7-406b-bc73-9d70534d4040', false, '2026-01-01', '2026-01-04 18:06:46.230057+00', '8b09bf3c-9adf-48d2-a8ab-6c6240aac5d9', false, true, 'expense', true, false, '05189901-cb48-4a67-8eb7-570123633ee6'),
	(241, 'Fatura Dez', 8455, '8aec301b-85f7-406b-bc73-9d70534d4040', false, '2026-01-01', '2026-01-31 20:37:32.250268+00', '8b09bf3c-9adf-48d2-a8ab-6c6240aac5d9', true, false, 'expense', true, false, '2b39025b-a7e4-4964-a0c2-535fd4a272df'),
	(212, 'Almoço de trabalho | Guaco', 57, '8aec301b-85f7-406b-bc73-9d70534d4040', false, '2026-01-01', '2026-01-31 15:30:33.420179+00', '8b09bf3c-9adf-48d2-a8ab-6c6240aac5d9', false, true, 'expense', true, false, '05189901-cb48-4a67-8eb7-570123633ee6'),
	(213, 'Mounjaro', 400, '8aec301b-85f7-406b-bc73-9d70534d4040', false, '2026-01-01', '2026-01-31 15:32:51.034967+00', '8b09bf3c-9adf-48d2-a8ab-6c6240aac5d9', false, true, 'expense', true, false, '05189901-cb48-4a67-8eb7-570123633ee6'),
	(214, 'Mercadinho AM Labs', 2.2, '8aec301b-85f7-406b-bc73-9d70534d4040', false, '2026-01-01', '2026-01-31 15:33:20.826066+00', '8b09bf3c-9adf-48d2-a8ab-6c6240aac5d9', false, true, 'expense', true, false, '05189901-cb48-4a67-8eb7-570123633ee6'),
	(216, 'Café com Amigas', 40, '8aec301b-85f7-406b-bc73-9d70534d4040', false, '2026-01-01', '2026-01-31 15:37:02.02086+00', '8b09bf3c-9adf-48d2-a8ab-6c6240aac5d9', false, true, 'expense', true, false, '983b34cf-e38c-47e1-a598-2259700d72c6'),
	(217, 'Mercado', 60, '8aec301b-85f7-406b-bc73-9d70534d4040', false, '2026-01-01', '2026-01-31 15:38:59.344593+00', '8b09bf3c-9adf-48d2-a8ab-6c6240aac5d9', false, true, 'expense', true, false, '3fb4c773-b62f-43cb-b889-33a907314b21'),
	(49, 'Viagem pra Atlanta (2/3)', 540, '8aec301b-85f7-406b-bc73-9d70534d4040', false, '2026-02-01', '2026-01-05 14:35:43.661848+00', '8b09bf3c-9adf-48d2-a8ab-6c6240aac5d9', false, false, 'expense', true, false, '983b34cf-e38c-47e1-a598-2259700d72c6'),
	(34, 'Manual', 120, '8aec301b-85f7-406b-bc73-9d70534d4040', true, '2026-01-01', '2026-01-02 03:18:29.661291+00', '8b09bf3c-9adf-48d2-a8ab-6c6240aac5d9', false, true, 'expense', true, false, '05189901-cb48-4a67-8eb7-570123633ee6'),
	(218, 'Remédios', 72, '8aec301b-85f7-406b-bc73-9d70534d4040', false, '2026-01-01', '2026-01-31 15:39:54.183421+00', '8b09bf3c-9adf-48d2-a8ab-6c6240aac5d9', false, true, 'expense', true, false, '3fb4c773-b62f-43cb-b889-33a907314b21'),
	(220, 'Apple TV', 30, '8aec301b-85f7-406b-bc73-9d70534d4040', false, '2026-01-01', '2026-01-31 15:41:01.168118+00', '8b09bf3c-9adf-48d2-a8ab-6c6240aac5d9', false, true, 'expense', true, false, '05189901-cb48-4a67-8eb7-570123633ee6'),
	(33, 'Canva', 35, '8aec301b-85f7-406b-bc73-9d70534d4040', true, '2026-01-01', '2026-01-02 03:09:02.45171+00', '8b09bf3c-9adf-48d2-a8ab-6c6240aac5d9', false, true, 'expense', true, false, '983b34cf-e38c-47e1-a598-2259700d72c6'),
	(221, 'Anualidade Bastter', 320, '8aec301b-85f7-406b-bc73-9d70534d4040', false, '2026-01-01', '2026-01-31 15:41:41.111408+00', '8b09bf3c-9adf-48d2-a8ab-6c6240aac5d9', false, true, 'expense', true, false, '05189901-cb48-4a67-8eb7-570123633ee6'),
	(29, 'Amazon Prime', 20, '8aec301b-85f7-406b-bc73-9d70534d4040', true, '2026-01-01', '2026-01-02 03:05:23.748653+00', '8b09bf3c-9adf-48d2-a8ab-6c6240aac5d9', false, true, 'expense', true, false, '05189901-cb48-4a67-8eb7-570123633ee6'),
	(27, 'Apple One', 67, '8aec301b-85f7-406b-bc73-9d70534d4040', true, '2026-01-01', '2026-01-02 03:04:39.518421+00', '8b09bf3c-9adf-48d2-a8ab-6c6240aac5d9', false, true, 'expense', true, false, '05189901-cb48-4a67-8eb7-570123633ee6'),
	(17, 'Celular - Amanda', 71, '98bbb09b-875c-4c5e-ae24-fb637f25b352', true, '2026-01-01', '2026-01-02 02:36:56.698449+00', '8b09bf3c-9adf-48d2-a8ab-6c6240aac5d9', false, true, 'expense', true, false, '3fb4c773-b62f-43cb-b889-33a907314b21'),
	(222, 'Uber', 20, '8aec301b-85f7-406b-bc73-9d70534d4040', false, '2026-01-01', '2026-01-31 15:41:51.106248+00', '8b09bf3c-9adf-48d2-a8ab-6c6240aac5d9', false, true, 'expense', true, false, '05189901-cb48-4a67-8eb7-570123633ee6'),
	(223, 'Padaria Cambui', 50, '8aec301b-85f7-406b-bc73-9d70534d4040', false, '2026-01-01', '2026-01-31 15:45:29.60555+00', '8b09bf3c-9adf-48d2-a8ab-6c6240aac5d9', false, true, 'expense', true, false, '05189901-cb48-4a67-8eb7-570123633ee6'),
	(244, 'Investimento - Gui', 7000, '8aec301b-85f7-406b-bc73-9d70534d4040', false, '2026-01-01', '2026-02-01 21:36:36.702806+00', '8b09bf3c-9adf-48d2-a8ab-6c6240aac5d9', true, false, 'expense', true, false, '8f764397-7e62-404c-9dc6-ea801ca08eae'),
	(242, 'Fatura Dez', 8825, '8aec301b-85f7-406b-bc73-9d70534d4040', false, '2026-01-01', '2026-01-31 20:37:46.512406+00', '8b09bf3c-9adf-48d2-a8ab-6c6240aac5d9', true, false, 'expense', true, false, '3fb4c773-b62f-43cb-b889-33a907314b21'),
	(173, 'Energia', 150, '55f1ebee-1160-48a1-91f7-d0c65de3726b', true, '2026-01-15', '2026-01-23 23:09:36.722953+00', '08456303-f1c0-46fe-850f-2b01dd66410b', false, false, 'expense', true, false, 'e8588930-3e4a-492f-8507-9016807a7342'),
	(180, 'Previdencia Privada', 500, '55f1ebee-1160-48a1-91f7-d0c65de3726b', true, '2026-01-21', '2026-01-23 23:09:36.722953+00', '08456303-f1c0-46fe-850f-2b01dd66410b', true, false, 'expense', true, false, 'a638f6ab-94a8-45e1-ac99-3f565db7d5c2'),
	(179, 'Acoes', 800, '55f1ebee-1160-48a1-91f7-d0c65de3726b', true, '2026-01-21', '2026-01-23 23:09:36.722953+00', '08456303-f1c0-46fe-850f-2b01dd66410b', true, false, 'expense', true, false, 'a638f6ab-94a8-45e1-ac99-3f565db7d5c2'),
	(177, 'Tesouro Direto', 1000, 'db609c27-506b-4f1c-8e5e-506f9f02099f', true, '2026-01-21', '2026-01-23 23:09:36.722953+00', '08456303-f1c0-46fe-850f-2b01dd66410b', true, false, 'expense', true, false, 'a638f6ab-94a8-45e1-ac99-3f565db7d5c2'),
	(266, 'BUNUS', 200000, '8c296710-483c-437a-876d-404927e08a0f', false, '2026-02-01', '2026-02-05 15:16:17.149575+00', '62380d47-5634-45b3-9db3-d541534d2109', false, false, 'income', true, false, NULL),
	(256, 'BUNIS BENIS BANIS BÓNIES', 8888.88, '197180e4-abf8-412e-ac33-7bb0a205dce2', false, '2026-02-01', '2026-02-05 13:42:47.172746+00', '62380d47-5634-45b3-9db3-d541534d2109', false, false, 'expense', true, false, '61ba9a38-5b22-4e4a-9293-de23e0fc950a'),
	(280, 'Remédios - Endocrino', 320, '8aec301b-85f7-406b-bc73-9d70534d4040', false, '2026-02-01', '2026-02-07 21:07:23.152071+00', '8b09bf3c-9adf-48d2-a8ab-6c6240aac5d9', false, true, 'expense', true, false, '05189901-cb48-4a67-8eb7-570123633ee6'),
	(287, 'Mercado', 97, '8aec301b-85f7-406b-bc73-9d70534d4040', false, '2026-02-01', '2026-02-07 21:09:55.513575+00', '8b09bf3c-9adf-48d2-a8ab-6c6240aac5d9', false, true, 'expense', true, false, '3fb4c773-b62f-43cb-b889-33a907314b21'),
	(237, 'Ingresso Disney', 3272.03, '8aec301b-85f7-406b-bc73-9d70534d4040', false, '2026-02-01', '2026-01-31 20:15:27.349221+00', '8b09bf3c-9adf-48d2-a8ab-6c6240aac5d9', false, true, 'expense', true, false, '983b34cf-e38c-47e1-a598-2259700d72c6'),
	(215, 'Recarga Sem Parar', 50, '8aec301b-85f7-406b-bc73-9d70534d4040', false, '2026-01-01', '2026-01-31 15:34:04.922745+00', '8b09bf3c-9adf-48d2-a8ab-6c6240aac5d9', false, true, 'expense', true, false, '3fb4c773-b62f-43cb-b889-33a907314b21'),
	(240, 'Fatura Dez', 8230, '8aec301b-85f7-406b-bc73-9d70534d4040', false, '2026-01-01', '2026-01-31 20:37:05.137952+00', '8b09bf3c-9adf-48d2-a8ab-6c6240aac5d9', true, false, 'expense', true, false, '983b34cf-e38c-47e1-a598-2259700d72c6'),
	(239, 'Fatura Dez', 3410, '8aec301b-85f7-406b-bc73-9d70534d4040', false, '2026-01-01', '2026-01-31 20:36:43.821785+00', '8b09bf3c-9adf-48d2-a8ab-6c6240aac5d9', true, false, 'expense', true, false, '05189901-cb48-4a67-8eb7-570123633ee6'),
	(238, 'Fatura Dez', 148, '8aec301b-85f7-406b-bc73-9d70534d4040', false, '2026-01-01', '2026-01-31 20:36:32.089335+00', '8b09bf3c-9adf-48d2-a8ab-6c6240aac5d9', true, false, 'expense', true, false, 'e7ec6fdd-768f-4e7c-a16f-c518ea50338a'),
	(51, 'Viagem pra Atlanta (1/3)', 540, '8aec301b-85f7-406b-bc73-9d70534d4040', false, '2026-01-01', '2026-01-05 14:35:43.683821+00', '8b09bf3c-9adf-48d2-a8ab-6c6240aac5d9', false, false, 'expense', true, false, '2b39025b-a7e4-4964-a0c2-535fd4a272df'),
	(19, 'Condomínio', 990, '8aec301b-85f7-406b-bc73-9d70534d4040', true, '2026-01-01', '2026-01-02 02:45:07.332811+00', '8b09bf3c-9adf-48d2-a8ab-6c6240aac5d9', false, false, 'expense', true, false, '3fb4c773-b62f-43cb-b889-33a907314b21'),
	(24, 'Tênis', 350, '8aec301b-85f7-406b-bc73-9d70534d4040', true, '2026-03-01', '2026-01-02 02:47:39.182741+00', '8b09bf3c-9adf-48d2-a8ab-6c6240aac5d9', false, false, 'expense', true, false, '983b34cf-e38c-47e1-a598-2259700d72c6'),
	(63, 'Almoço - Amanda', 31, '8aec301b-85f7-406b-bc73-9d70534d4040', false, '2026-01-01', '2026-01-11 03:44:25.859536+00', '8b09bf3c-9adf-48d2-a8ab-6c6240aac5d9', false, true, 'expense', true, false, '05189901-cb48-4a67-8eb7-570123633ee6'),
	(64, 'Sobremesa - Amanda', 2, '8aec301b-85f7-406b-bc73-9d70534d4040', false, '2026-01-01', '2026-01-11 03:44:51.426874+00', '8b09bf3c-9adf-48d2-a8ab-6c6240aac5d9', false, true, 'expense', true, false, '05189901-cb48-4a67-8eb7-570123633ee6'),
	(66, 'Almoço de liderados', 485, '8aec301b-85f7-406b-bc73-9d70534d4040', false, '2026-01-01', '2026-01-11 03:48:18.738041+00', '8b09bf3c-9adf-48d2-a8ab-6c6240aac5d9', false, true, 'expense', true, false, '983b34cf-e38c-47e1-a598-2259700d72c6'),
	(68, 'Cabelo - Amanda', 92, '8aec301b-85f7-406b-bc73-9d70534d4040', false, '2026-01-01', '2026-01-11 03:49:00.613336+00', '8b09bf3c-9adf-48d2-a8ab-6c6240aac5d9', false, true, 'expense', true, false, '3fb4c773-b62f-43cb-b889-33a907314b21'),
	(69, 'Dentista', 620, '8aec301b-85f7-406b-bc73-9d70534d4040', false, '2026-01-01', '2026-01-11 03:49:29.185622+00', '8b09bf3c-9adf-48d2-a8ab-6c6240aac5d9', false, true, 'expense', true, false, '3fb4c773-b62f-43cb-b889-33a907314b21'),
	(70, 'Enxaguante bucal', 38, '8aec301b-85f7-406b-bc73-9d70534d4040', false, '2026-01-01', '2026-01-11 03:49:42.934961+00', '8b09bf3c-9adf-48d2-a8ab-6c6240aac5d9', false, true, 'expense', true, false, '3fb4c773-b62f-43cb-b889-33a907314b21'),
	(71, 'Veterinária da Chiara', 190, '8aec301b-85f7-406b-bc73-9d70534d4040', false, '2026-01-01', '2026-01-11 03:50:03.283167+00', '8b09bf3c-9adf-48d2-a8ab-6c6240aac5d9', false, true, 'expense', true, false, '3fb4c773-b62f-43cb-b889-33a907314b21'),
	(72, 'Remédios da Chiara', 190, '8aec301b-85f7-406b-bc73-9d70534d4040', false, '2026-01-01', '2026-01-11 03:50:13.40777+00', '8b09bf3c-9adf-48d2-a8ab-6c6240aac5d9', false, true, 'expense', true, false, '3fb4c773-b62f-43cb-b889-33a907314b21'),
	(73, 'Marmitas Livup', 332, '8aec301b-85f7-406b-bc73-9d70534d4040', false, '2026-01-01', '2026-01-11 03:50:32.577333+00', '8b09bf3c-9adf-48d2-a8ab-6c6240aac5d9', false, true, 'expense', true, false, '3fb4c773-b62f-43cb-b889-33a907314b21'),
	(74, 'Barbeiro - Gui', 120, '8aec301b-85f7-406b-bc73-9d70534d4040', false, '2026-01-01', '2026-01-11 03:51:21.294866+00', '8b09bf3c-9adf-48d2-a8ab-6c6240aac5d9', false, true, 'expense', true, false, '3fb4c773-b62f-43cb-b889-33a907314b21'),
	(75, 'Jantar de 8 anos', 787, '8aec301b-85f7-406b-bc73-9d70534d4040', false, '2026-01-01', '2026-01-11 03:51:34.938866+00', '8b09bf3c-9adf-48d2-a8ab-6c6240aac5d9', false, true, 'expense', true, false, '983b34cf-e38c-47e1-a598-2259700d72c6'),
	(76, 'Equipamento de mangueira do jardim', 47, '8aec301b-85f7-406b-bc73-9d70534d4040', false, '2026-01-01', '2026-01-11 03:52:07.040116+00', '8b09bf3c-9adf-48d2-a8ab-6c6240aac5d9', false, true, 'expense', true, false, '05189901-cb48-4a67-8eb7-570123633ee6'),
	(77, 'Presente Ari', 195, '8aec301b-85f7-406b-bc73-9d70534d4040', false, '2026-01-01', '2026-01-11 03:52:26.84023+00', '8b09bf3c-9adf-48d2-a8ab-6c6240aac5d9', false, true, 'expense', true, false, '983b34cf-e38c-47e1-a598-2259700d72c6'),
	(78, 'Mercado', 490, '8aec301b-85f7-406b-bc73-9d70534d4040', false, '2026-01-01', '2026-01-11 03:52:39.123886+00', '8b09bf3c-9adf-48d2-a8ab-6c6240aac5d9', false, true, 'expense', true, false, '3fb4c773-b62f-43cb-b889-33a907314b21'),
	(79, 'Pagamento final da Liti', 780, '8aec301b-85f7-406b-bc73-9d70534d4040', false, '2026-01-01', '2026-01-11 03:53:00.733622+00', '8b09bf3c-9adf-48d2-a8ab-6c6240aac5d9', false, true, 'expense', true, false, '05189901-cb48-4a67-8eb7-570123633ee6'),
	(121, 'IPVA', 2290.65, '8aec301b-85f7-406b-bc73-9d70534d4040', false, '2026-01-01', '2026-01-22 02:05:54.197692+00', '8b09bf3c-9adf-48d2-a8ab-6c6240aac5d9', false, false, 'expense', true, false, '3fb4c773-b62f-43cb-b889-33a907314b21'),
	(91, 'Barrinhas de proteina', 126, '8aec301b-85f7-406b-bc73-9d70534d4040', false, '2026-01-01', '2026-01-17 14:09:29.967801+00', '8b09bf3c-9adf-48d2-a8ab-6c6240aac5d9', false, true, 'expense', true, false, '05189901-cb48-4a67-8eb7-570123633ee6'),
	(93, 'Almoço Amanda no trabalho', 42.11, '8aec301b-85f7-406b-bc73-9d70534d4040', false, '2026-01-01', '2026-01-17 14:17:17.103871+00', '8b09bf3c-9adf-48d2-a8ab-6c6240aac5d9', false, true, 'expense', true, false, '05189901-cb48-4a67-8eb7-570123633ee6'),
	(94, 'Repelente', 56.99, '8aec301b-85f7-406b-bc73-9d70534d4040', false, '2026-01-01', '2026-01-17 14:18:46.46681+00', '8b09bf3c-9adf-48d2-a8ab-6c6240aac5d9', false, true, 'expense', true, false, '05189901-cb48-4a67-8eb7-570123633ee6'),
	(95, 'Compra no mercadinho AM Labs', 6.78, '8aec301b-85f7-406b-bc73-9d70534d4040', false, '2026-01-01', '2026-01-17 14:19:05.675178+00', '8b09bf3c-9adf-48d2-a8ab-6c6240aac5d9', false, true, 'expense', true, false, '05189901-cb48-4a67-8eb7-570123633ee6'),
	(96, 'Almoço no Trabalho - Amanda', 84.15, '8aec301b-85f7-406b-bc73-9d70534d4040', false, '2026-01-01', '2026-01-17 14:19:37.009995+00', '8b09bf3c-9adf-48d2-a8ab-6c6240aac5d9', false, true, 'expense', true, false, '05189901-cb48-4a67-8eb7-570123633ee6'),
	(97, 'Compra no mercadinho AM Labs', 2.86, '8aec301b-85f7-406b-bc73-9d70534d4040', false, '2026-01-01', '2026-01-17 14:19:51.823648+00', '8b09bf3c-9adf-48d2-a8ab-6c6240aac5d9', false, true, 'expense', true, false, '05189901-cb48-4a67-8eb7-570123633ee6'),
	(98, 'Date no outback', 326.65, '8aec301b-85f7-406b-bc73-9d70534d4040', false, '2026-01-01', '2026-01-17 14:24:07.796076+00', '8b09bf3c-9adf-48d2-a8ab-6c6240aac5d9', false, true, 'expense', true, false, '983b34cf-e38c-47e1-a598-2259700d72c6'),
	(106, 'Clube Azul', 45, '8aec301b-85f7-406b-bc73-9d70534d4040', true, '2026-01-01', '2026-01-17 14:47:30.287222+00', '8b09bf3c-9adf-48d2-a8ab-6c6240aac5d9', false, true, 'expense', true, false, '05189901-cb48-4a67-8eb7-570123633ee6'),
	(90, 'Multa de trânsito', 78, '8aec301b-85f7-406b-bc73-9d70534d4040', false, '2026-01-01', '2026-01-17 14:09:13.373112+00', '8b09bf3c-9adf-48d2-a8ab-6c6240aac5d9', false, false, 'expense', true, false, '3fb4c773-b62f-43cb-b889-33a907314b21'),
	(108, 'Metas - Amanda', 1000, '8aec301b-85f7-406b-bc73-9d70534d4040', false, '2026-01-01', '2026-01-17 18:23:00.329385+00', '8b09bf3c-9adf-48d2-a8ab-6c6240aac5d9', true, false, 'expense', true, false, '2b39025b-a7e4-4964-a0c2-535fd4a272df'),
	(99, 'Shampoo anti-fungo Chiara', 242, '8aec301b-85f7-406b-bc73-9d70534d4040', false, '2026-01-01', '2026-01-17 14:24:34.099394+00', '8b09bf3c-9adf-48d2-a8ab-6c6240aac5d9', false, true, 'expense', true, false, '3fb4c773-b62f-43cb-b889-33a907314b21'),
	(107, 'Investimentos - Amanda', 8000, '98bbb09b-875c-4c5e-ae24-fb637f25b352', false, '2026-01-01', '2026-01-17 18:20:35.685934+00', '8b09bf3c-9adf-48d2-a8ab-6c6240aac5d9', true, false, 'expense', true, false, '8f764397-7e62-404c-9dc6-ea801ca08eae'),
	(100, 'Compra no mercadinho AM Labs', 2, '8aec301b-85f7-406b-bc73-9d70534d4040', false, '2026-01-01', '2026-01-17 14:24:50.304555+00', '8b09bf3c-9adf-48d2-a8ab-6c6240aac5d9', false, true, 'expense', true, false, '05189901-cb48-4a67-8eb7-570123633ee6'),
	(101, 'Clube iFood', 13, '8aec301b-85f7-406b-bc73-9d70534d4040', false, '2026-01-01', '2026-01-17 14:26:29.32074+00', '8b09bf3c-9adf-48d2-a8ab-6c6240aac5d9', false, true, 'expense', true, false, '05189901-cb48-4a67-8eb7-570123633ee6'),
	(102, 'Almoço no trabalho - Amanda', 28, '8aec301b-85f7-406b-bc73-9d70534d4040', false, '2026-01-01', '2026-01-17 14:26:55.920587+00', '8b09bf3c-9adf-48d2-a8ab-6c6240aac5d9', false, true, 'expense', true, false, '05189901-cb48-4a67-8eb7-570123633ee6'),
	(103, 'Marmitas Livup', 320, '8aec301b-85f7-406b-bc73-9d70534d4040', false, '2026-01-01', '2026-01-17 14:27:13.331123+00', '8b09bf3c-9adf-48d2-a8ab-6c6240aac5d9', false, true, 'expense', true, false, '3fb4c773-b62f-43cb-b889-33a907314b21'),
	(104, 'Mounjaro', 2000, '8aec301b-85f7-406b-bc73-9d70534d4040', false, '2026-01-01', '2026-01-17 14:28:02.001816+00', '8b09bf3c-9adf-48d2-a8ab-6c6240aac5d9', false, true, 'expense', true, false, '05189901-cb48-4a67-8eb7-570123633ee6'),
	(118, 'Compra de café da tarde', 18.05, '8aec301b-85f7-406b-bc73-9d70534d4040', false, '2026-01-01', '2026-01-18 02:21:25.804578+00', '8b09bf3c-9adf-48d2-a8ab-6c6240aac5d9', false, true, 'expense', true, false, '05189901-cb48-4a67-8eb7-570123633ee6'),
	(122, 'Mercado', 18, '8aec301b-85f7-406b-bc73-9d70534d4040', false, '2026-01-01', '2026-01-22 02:10:09.096605+00', '8b09bf3c-9adf-48d2-a8ab-6c6240aac5d9', false, true, 'expense', true, false, '3fb4c773-b62f-43cb-b889-33a907314b21'),
	(123, 'Mercado', 168.15, '8aec301b-85f7-406b-bc73-9d70534d4040', false, '2026-01-01', '2026-01-22 02:10:35.513442+00', '8b09bf3c-9adf-48d2-a8ab-6c6240aac5d9', false, true, 'expense', true, false, '3fb4c773-b62f-43cb-b889-33a907314b21'),
	(131, 'Aluguel de quadra', 26, '8aec301b-85f7-406b-bc73-9d70534d4040', false, '2026-01-01', '2026-01-22 02:30:21.510205+00', '8b09bf3c-9adf-48d2-a8ab-6c6240aac5d9', false, false, 'expense', true, false, '983b34cf-e38c-47e1-a598-2259700d72c6'),
	(132, 'Cinema | Hamnet', 100, '8aec301b-85f7-406b-bc73-9d70534d4040', false, '2026-01-01', '2026-01-22 02:32:05.087049+00', '8b09bf3c-9adf-48d2-a8ab-6c6240aac5d9', false, false, 'expense', true, false, '983b34cf-e38c-47e1-a598-2259700d72c6'),
	(202, 'Viagem fim de semana (previsto)', 1200, '55f1ebee-1160-48a1-91f7-d0c65de3726b', false, '2026-02-02', '2026-01-23 23:09:36.722953+00', '08456303-f1c0-46fe-850f-2b01dd66410b', false, false, 'expense', true, true, 'db0fff11-c409-4b4b-9e0c-c3ca67b9ff39'),
	(205, 'Tigrinho', 2300, 'db609c27-506b-4f1c-8e5e-506f9f02099f', false, '2026-01-01', '2026-01-23 23:48:05.08419+00', '08456303-f1c0-46fe-850f-2b01dd66410b', false, true, 'expense', true, false, 'db0fff11-c409-4b4b-9e0c-c3ca67b9ff39'),
	(31, 'Netflix', 86, '8aec301b-85f7-406b-bc73-9d70534d4040', true, '2026-01-01', '2026-01-02 03:06:25.471383+00', '8b09bf3c-9adf-48d2-a8ab-6c6240aac5d9', false, true, 'expense', true, false, '05189901-cb48-4a67-8eb7-570123633ee6'),
	(39, 'Uber', 28.95, '8aec301b-85f7-406b-bc73-9d70534d4040', false, '2026-01-01', '2026-01-04 18:06:57.656398+00', '8b09bf3c-9adf-48d2-a8ab-6c6240aac5d9', false, true, 'expense', true, false, '05189901-cb48-4a67-8eb7-570123633ee6'),
	(40, 'Café da manhã', 30.43, '8aec301b-85f7-406b-bc73-9d70534d4040', false, '2026-01-01', '2026-01-04 18:07:07.525517+00', '8b09bf3c-9adf-48d2-a8ab-6c6240aac5d9', false, true, 'expense', true, false, '983b34cf-e38c-47e1-a598-2259700d72c6'),
	(41, 'Sem parar', 50, '8aec301b-85f7-406b-bc73-9d70534d4040', false, '2026-01-01', '2026-01-05 01:57:40.663719+00', '8b09bf3c-9adf-48d2-a8ab-6c6240aac5d9', false, true, 'expense', true, false, '3fb4c773-b62f-43cb-b889-33a907314b21'),
	(219, 'Wellhub', 320, '8aec301b-85f7-406b-bc73-9d70534d4040', true, '2026-01-01', '2026-01-31 15:40:24.780778+00', '8b09bf3c-9adf-48d2-a8ab-6c6240aac5d9', false, true, 'expense', true, false, '05189901-cb48-4a67-8eb7-570123633ee6'),
	(42, 'Omega 3 - Chiara', 90.86, '8aec301b-85f7-406b-bc73-9d70534d4040', false, '2026-01-01', '2026-01-05 01:58:01.203215+00', '8b09bf3c-9adf-48d2-a8ab-6c6240aac5d9', false, true, 'expense', true, false, '3fb4c773-b62f-43cb-b889-33a907314b21'),
	(43, 'Regadores', 23.4, '8aec301b-85f7-406b-bc73-9d70534d4040', false, '2026-01-01', '2026-01-05 01:58:14.735153+00', '8b09bf3c-9adf-48d2-a8ab-6c6240aac5d9', false, true, 'expense', true, false, '05189901-cb48-4a67-8eb7-570123633ee6'),
	(44, 'HBO Max', 420, '8aec301b-85f7-406b-bc73-9d70534d4040', false, '2026-01-01', '2026-01-05 01:58:29.739233+00', '8b09bf3c-9adf-48d2-a8ab-6c6240aac5d9', false, true, 'expense', true, false, '05189901-cb48-4a67-8eb7-570123633ee6'),
	(124, 'Gasolina', 238.99, '8aec301b-85f7-406b-bc73-9d70534d4040', false, '2026-01-01', '2026-01-22 02:10:54.763013+00', '8b09bf3c-9adf-48d2-a8ab-6c6240aac5d9', false, true, 'expense', true, false, '3fb4c773-b62f-43cb-b889-33a907314b21'),
	(125, 'Adaptadores de Torneira', 20.5, '8aec301b-85f7-406b-bc73-9d70534d4040', false, '2026-01-01', '2026-01-22 02:11:32.274419+00', '8b09bf3c-9adf-48d2-a8ab-6c6240aac5d9', false, true, 'expense', true, false, '05189901-cb48-4a67-8eb7-570123633ee6'),
	(126, 'Audible', 0.99, '8aec301b-85f7-406b-bc73-9d70534d4040', false, '2026-01-01', '2026-01-22 02:12:15.289153+00', '8b09bf3c-9adf-48d2-a8ab-6c6240aac5d9', false, true, 'expense', true, false, '05189901-cb48-4a67-8eb7-570123633ee6'),
	(127, 'Estacionamento', 15, '8aec301b-85f7-406b-bc73-9d70534d4040', false, '2026-01-01', '2026-01-22 02:12:58.368624+00', '8b09bf3c-9adf-48d2-a8ab-6c6240aac5d9', false, true, 'expense', true, false, '05189901-cb48-4a67-8eb7-570123633ee6'),
	(225, 'Gás', 28, '8aec301b-85f7-406b-bc73-9d70534d4040', true, '2026-01-01', '2026-01-31 15:49:51.418667+00', '8b09bf3c-9adf-48d2-a8ab-6c6240aac5d9', false, false, 'expense', true, false, '3fb4c773-b62f-43cb-b889-33a907314b21'),
	(228, 'Marmitas | Livup', 385, '8aec301b-85f7-406b-bc73-9d70534d4040', false, '2026-02-01', '2026-01-31 15:53:08.211814+00', '8b09bf3c-9adf-48d2-a8ab-6c6240aac5d9', false, true, 'expense', true, false, '05189901-cb48-4a67-8eb7-570123633ee6'),
	(128, 'Marmitas Livup', 334.84, '8aec301b-85f7-406b-bc73-9d70534d4040', false, '2026-01-01', '2026-01-22 02:13:28.396978+00', '8b09bf3c-9adf-48d2-a8ab-6c6240aac5d9', false, true, 'expense', true, false, '3fb4c773-b62f-43cb-b889-33a907314b21'),
	(210, 'Google One', 54, '8aec301b-85f7-406b-bc73-9d70534d4040', true, '2026-01-01', '2026-01-31 15:18:51.272955+00', '8b09bf3c-9adf-48d2-a8ab-6c6240aac5d9', false, true, 'expense', true, false, '05189901-cb48-4a67-8eb7-570123633ee6'),
	(129, 'Claude AI', 120, '8aec301b-85f7-406b-bc73-9d70534d4040', false, '2026-01-01', '2026-01-22 02:13:59.877501+00', '8b09bf3c-9adf-48d2-a8ab-6c6240aac5d9', false, true, 'expense', true, false, 'e7ec6fdd-768f-4e7c-a16f-c518ea50338a'),
	(130, 'Remédios', 416, '8aec301b-85f7-406b-bc73-9d70534d4040', false, '2026-01-01', '2026-01-22 02:30:00.781206+00', '8b09bf3c-9adf-48d2-a8ab-6c6240aac5d9', false, true, 'expense', true, false, '3fb4c773-b62f-43cb-b889-33a907314b21'),
	(133, 'Cambly', 2220, '8aec301b-85f7-406b-bc73-9d70534d4040', false, '2026-01-01', '2026-01-22 03:31:47.679903+00', '8b09bf3c-9adf-48d2-a8ab-6c6240aac5d9', false, true, 'expense', true, false, '983b34cf-e38c-47e1-a598-2259700d72c6'),
	(250, 'Jantar de 8 anos', 800, 'db609c27-506b-4f1c-8e5e-506f9f02099f', false, '2026-01-01', '2026-02-05 01:32:35.510917+00', '08456303-f1c0-46fe-850f-2b01dd66410b', false, false, 'expense', true, false, 'db0fff11-c409-4b4b-9e0c-c3ca67b9ff39'),
	(262, 'GASTER MASTERS (4/8)', 8.71125, '8c296710-483c-437a-876d-404927e08a0f', false, '2026-05-01', '2026-02-05 13:51:02.306776+00', '62380d47-5634-45b3-9db3-d541534d2109', false, false, 'expense', true, false, '61ba9a38-5b22-4e4a-9293-de23e0fc950a'),
	(257, 'GASTER MASTERS (1/8)', 8.71125, '8c296710-483c-437a-876d-404927e08a0f', false, '2026-02-01', '2026-02-05 13:51:02.238756+00', '62380d47-5634-45b3-9db3-d541534d2109', false, false, 'expense', true, false, '61ba9a38-5b22-4e4a-9293-de23e0fc950a'),
	(267, 'Energia', 95, '8c745ae4-89c5-460d-8fec-50f86f67fe41', true, '2026-02-01', '2026-02-05 23:49:26.110826+00', 'b02c0448-2c95-4c39-afb1-29957a24a499', false, false, 'expense', true, false, '92eab77f-7d2a-4fc7-a96a-511b9c89788e'),
	(274, 'Mercado', 27, '8aec301b-85f7-406b-bc73-9d70534d4040', false, '2026-02-01', '2026-02-07 21:03:13.596329+00', '8b09bf3c-9adf-48d2-a8ab-6c6240aac5d9', false, true, 'expense', true, false, '3fb4c773-b62f-43cb-b889-33a907314b21'),
	(281, 'Remédio', 38, '8aec301b-85f7-406b-bc73-9d70534d4040', false, '2026-02-01', '2026-02-07 21:07:39.177709+00', '8b09bf3c-9adf-48d2-a8ab-6c6240aac5d9', false, true, 'expense', true, false, '3fb4c773-b62f-43cb-b889-33a907314b21'),
	(288, 'Cursor - Custo adicional', 170, '8aec301b-85f7-406b-bc73-9d70534d4040', false, '2026-02-01', '2026-02-07 21:10:30.776438+00', '8b09bf3c-9adf-48d2-a8ab-6c6240aac5d9', false, true, 'expense', true, false, 'e7ec6fdd-768f-4e7c-a16f-c518ea50338a'),
	(313, 'Gasolina', 245, '8aec301b-85f7-406b-bc73-9d70534d4040', false, '2026-02-01', '2026-02-07 21:14:10.251212+00', '8b09bf3c-9adf-48d2-a8ab-6c6240aac5d9', false, true, 'expense', true, false, '3fb4c773-b62f-43cb-b889-33a907314b21'),
	(319, 'Cidadania - Amanda (10/21)', 894.8571428571429, '8aec301b-85f7-406b-bc73-9d70534d4040', false, '2026-11-01', '2026-02-07 21:18:24.994782+00', '8b09bf3c-9adf-48d2-a8ab-6c6240aac5d9', false, true, 'expense', true, false, '2b39025b-a7e4-4964-a0c2-535fd4a272df'),
	(326, 'Cidadania - Amanda (15/21)', 894.8571428571429, '8aec301b-85f7-406b-bc73-9d70534d4040', false, '2027-04-01', '2026-02-07 21:18:25.018287+00', '8b09bf3c-9adf-48d2-a8ab-6c6240aac5d9', false, true, 'expense', true, false, '2b39025b-a7e4-4964-a0c2-535fd4a272df'),
	(328, 'Cidadania - Amanda (7/21)', 894.8571428571429, '8aec301b-85f7-406b-bc73-9d70534d4040', false, '2026-08-01', '2026-02-07 21:18:25.031024+00', '8b09bf3c-9adf-48d2-a8ab-6c6240aac5d9', false, true, 'expense', true, false, '2b39025b-a7e4-4964-a0c2-535fd4a272df'),
	(334, 'Cidadania - Amanda (13/21)', 894.8571428571429, '8aec301b-85f7-406b-bc73-9d70534d4040', false, '2027-02-01', '2026-02-07 21:18:25.046658+00', '8b09bf3c-9adf-48d2-a8ab-6c6240aac5d9', false, true, 'expense', true, false, '2b39025b-a7e4-4964-a0c2-535fd4a272df'),
	(338, 'Cidadania - Amanda (21/21)', 894.8571428571429, '8aec301b-85f7-406b-bc73-9d70534d4040', false, '2027-10-01', '2026-02-07 21:18:25.074605+00', '8b09bf3c-9adf-48d2-a8ab-6c6240aac5d9', false, true, 'expense', true, false, '2b39025b-a7e4-4964-a0c2-535fd4a272df'),
	(65, 'Celular - Gui', 56, '8aec301b-85f7-406b-bc73-9d70534d4040', true, '2026-02-01', '2026-01-11 03:47:58.901931+00', '8b09bf3c-9adf-48d2-a8ab-6c6240aac5d9', false, true, 'expense', true, false, '3fb4c773-b62f-43cb-b889-33a907314b21'),
	(25, 'Energia', 100, '8aec301b-85f7-406b-bc73-9d70534d4040', true, '2026-03-01', '2026-01-02 02:47:55.783519+00', '8b09bf3c-9adf-48d2-a8ab-6c6240aac5d9', false, false, 'expense', true, false, '3fb4c773-b62f-43cb-b889-33a907314b21'),
	(353, 'Hotel - Death Valley', 2800, '8aec301b-85f7-406b-bc73-9d70534d4040', false, '2026-04-01', '2026-02-08 11:27:41.404075+00', '8b09bf3c-9adf-48d2-a8ab-6c6240aac5d9', false, true, 'expense', true, true, '2b39025b-a7e4-4964-a0c2-535fd4a272df'),
	(347, 'Dólares - SXSW', 2500, '8aec301b-85f7-406b-bc73-9d70534d4040', false, '2026-03-01', '2026-02-08 11:15:05.251821+00', '8b09bf3c-9adf-48d2-a8ab-6c6240aac5d9', false, false, 'expense', true, true, '983b34cf-e38c-47e1-a598-2259700d72c6');


--
-- Data for Name: buckets; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: buckets_analytics; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: buckets_vectors; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: objects; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: s3_multipart_uploads; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: s3_multipart_uploads_parts; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: vector_indexes; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE SET; Schema: auth; Owner: supabase_auth_admin
--

SELECT pg_catalog.setval('"auth"."refresh_tokens_id_seq"', 218, true);


--
-- Name: transactions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."transactions_id_seq"', 356, true);


--
-- PostgreSQL database dump complete
--

-- \unrestrict St1zxSG5V4etuKsdo9x9x0h4agN8WcocyoHpDnKeJMGW6djm2iYHL0loS3fIwnT

RESET ALL;
