-- Seed data for form-builder
-- This uses realistic sample data (no Lorem ipsum or "Test User")

-- Note: Auth users are created via the Supabase dashboard or auth API.
-- These seed inserts assume the demo user exists with the UUID below.
-- Replace 'demo-user-uuid' with your actual test user ID.

-- Insert demo forms for testing (run after creating a user)
-- The demo user email would be demo@formbuilder.dev

DO $$
DECLARE
  demo_user_id UUID;
  form1_id UUID;
  form2_id UUID;
  form3_id UUID;
  q1_id UUID;
  q2_id UUID;
  q3_id UUID;
  q4_id UUID;
  q5_id UUID;
  q6_id UUID;
  q7_id UUID;
  q8_id UUID;
  sub1_id UUID;
  sub2_id UUID;
  sub3_id UUID;
BEGIN
  -- Get the first user (for local dev seeding)
  SELECT id INTO demo_user_id FROM auth.users LIMIT 1;

  IF demo_user_id IS NULL THEN
    RAISE NOTICE 'No users found. Create a user first, then re-run seed.sql';
    RETURN;
  END IF;

  -- Form 1: Customer Satisfaction Survey
  form1_id := gen_random_uuid();
  INSERT INTO forms (id, user_id, title, slug, description, settings, is_published)
  VALUES (
    form1_id,
    demo_user_id,
    'Customer Satisfaction Survey Q3 2024',
    'customer-satisfaction-q3',
    'Help us improve our service by sharing your experience.',
    '{"mode":"conversational","brandColor":"#2563eb","showProgressBar":true,"thankYouMessage":"Thank you for your feedback! We read every response and use it to make real improvements."}',
    true
  );

  -- Questions for Form 1
  q1_id := gen_random_uuid();
  INSERT INTO questions (id, form_id, type, title, description, required, sort_order)
  VALUES (q1_id, form1_id, 'text', 'What is your name?', 'So we can personalize your experience', false, 0);

  q2_id := gen_random_uuid();
  INSERT INTO questions (id, form_id, type, title, required, sort_order)
  VALUES (q2_id, form1_id, 'email', 'What is your email address?', true, 1);

  q3_id := gen_random_uuid();
  INSERT INTO questions (id, form_id, type, title, description, required, options, sort_order)
  VALUES (q3_id, form1_id, 'rating', 'How would you rate your overall experience?', 'On a scale from 1 (terrible) to 5 (excellent)', true, '[]', 2);

  q4_id := gen_random_uuid();
  INSERT INTO questions (id, form_id, type, title, required, options, sort_order)
  VALUES (q4_id, form1_id, 'select', 'Which product did you purchase?',  true,
    '[{"id":"p1","label":"Starter Plan","value":"starter"},{"id":"p2","label":"Growth Plan","value":"growth"},{"id":"p3","label":"Enterprise Plan","value":"enterprise"}]',
    3);

  q5_id := gen_random_uuid();
  INSERT INTO questions (id, form_id, type, title, description, required, sort_order)
  VALUES (q5_id, form1_id, 'text', 'What could we improve?', 'Be as specific as possible — we take action on all feedback', false, 4);

  -- Form 2: Job Application
  form2_id := gen_random_uuid();
  INSERT INTO forms (id, user_id, title, slug, description, settings, is_published)
  VALUES (
    form2_id,
    demo_user_id,
    'Senior Frontend Developer Application',
    'frontend-dev-application',
    'We''re hiring a senior frontend developer. Fill out this form to apply.',
    '{"mode":"conversational","brandColor":"#7c3aed","showProgressBar":true,"thankYouMessage":"Thanks for applying! We''ll review your application and get back to you within 5 business days."}',
    true
  );

  q6_id := gen_random_uuid();
  INSERT INTO questions (id, form_id, type, title, required, sort_order)
  VALUES (q6_id, form2_id, 'text', 'What is your full name?', true, 0);

  q7_id := gen_random_uuid();
  INSERT INTO questions (id, form_id, type, title, required, sort_order)
  VALUES (q7_id, form2_id, 'email', 'What is your email address?', true, 1);

  q8_id := gen_random_uuid();
  INSERT INTO questions (id, form_id, type, title, description, required, sort_order)
  VALUES (q8_id, form2_id, 'number', 'How many years of React experience do you have?', 'Include both professional and personal projects', true, 2);

  -- Form 3: Event RSVP (unpublished draft)
  form3_id := gen_random_uuid();
  INSERT INTO forms (id, user_id, title, slug, description, settings, is_published)
  VALUES (
    form3_id,
    demo_user_id,
    'Product Launch Webinar RSVP',
    'product-launch-webinar-rsvp',
    'Join us for the launch of our new analytics dashboard.',
    '{"mode":"classic","brandColor":"#059669","showProgressBar":false,"thankYouMessage":"You''re registered! Check your email for the webinar link."}',
    false
  );

  -- Sample submissions for Form 1
  sub1_id := gen_random_uuid();
  INSERT INTO submissions (id, form_id, is_complete, completed_at)
  VALUES (sub1_id, form1_id, true, now() - interval '3 days');

  INSERT INTO answers (submission_id, question_id, value) VALUES
    (sub1_id, q1_id, '"Yuki Tanaka"'),
    (sub1_id, q2_id, '"yuki.tanaka@acmecorp.co.jp"'),
    (sub1_id, q3_id, '5'),
    (sub1_id, q4_id, '"growth"'),
    (sub1_id, q5_id, '"The onboarding could use a guided tutorial for first-time users."');

  sub2_id := gen_random_uuid();
  INSERT INTO submissions (id, form_id, is_complete, completed_at)
  VALUES (sub2_id, form1_id, true, now() - interval '2 days');

  INSERT INTO answers (submission_id, question_id, value) VALUES
    (sub2_id, q1_id, '"Marcus Webb"'),
    (sub2_id, q2_id, '"marcus@startupxyz.io"'),
    (sub2_id, q3_id, '4'),
    (sub2_id, q4_id, '"starter"'),
    (sub2_id, q5_id, '"Response time on support tickets could be faster."');

  sub3_id := gen_random_uuid();
  INSERT INTO submissions (id, form_id, is_complete, completed_at)
  VALUES (sub3_id, form1_id, true, now() - interval '1 day');

  INSERT INTO answers (submission_id, question_id, value) VALUES
    (sub3_id, q1_id, '"Priya Nair"'),
    (sub3_id, q2_id, '"priya.nair@globaltech.in"'),
    (sub3_id, q3_id, '5'),
    (sub3_id, q4_id, '"enterprise"'),
    (sub3_id, q5_id, '"Nothing, honestly. The product has been transformative for our team."');

  -- Incomplete submission
  INSERT INTO submissions (id, form_id, is_complete)
  VALUES (gen_random_uuid(), form1_id, false);

  RAISE NOTICE 'Seed data inserted successfully for user %', demo_user_id;
END;
$$;
