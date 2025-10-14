// Complete translation system for चेtanā app
const translations = {
    en: {
        // Login & Registration
        'awakening_minds': 'Awakening Minds, Nurturing Wellbeing',
        'login': 'Login',
        'email_username': 'Email / Username',
        'password': 'Password',
        'create_account': 'Create Account',
        'dont_have_account': 'Don\'t have an account?',
        'signup': 'Sign Up',
        'continue_as_guest': 'Continue as Guest',
        'back_to_login': 'Back to Login',
        'full_name': 'Full Name',
        'date_of_birth': 'Date of Birth',
        'email': 'Email Address',
        'create_your_account': 'Create Your Account',
        
        // Dashboard & Navigation
        'welcome': 'Welcome',
        'demo_ai_therapist': 'Demo AI Therapist Chat',
        'ai_therapist': 'AI Therapist',
        'self_assessment': 'Self-Assessment',
        'find_your_therapist': 'Find Your Therapist',
        'community_forum': 'Community Forum',
        'my_progress': 'My Progress Dashboard',
        'wellness_resources': 'Wellness Resources',
        'profile_settings': 'Profile & Settings',
        'chat_with_ai': 'Chat With AI Therapist',
        'take_assessment': 'Take Self-Assessment',
        'book_appointment': 'Book Appointment',
        'my_progress_dashboard': 'My Progress Dashboard',
        
        // Chat Interface
        'type_message': 'Type your message...',
        'type_message_50_limit': 'Type your message (50 daily limit)...',
        'voice_to_text': 'Voice to Text',
        'send': 'Send',
        'i_feel_anxious': 'I feel anxious',
        'cant_sleep': 'I can\'t sleep',
        'feeling_overwhelmed': 'I\'m feeling overwhelmed',
        'bad_day': 'I had a bad day',
        'talk_stress': 'Can we talk about stress?',
        
        // Assessment Questions - PHQ-9
        'phq9_q0': 'Little interest or pleasure in doing things.',
        'phq9_q1': 'Feeling down, depressed, or hopeless.',
        'phq9_q2': 'Trouble falling or staying asleep, or sleeping too much.',
        'phq9_q3': 'Feeling tired or having little energy.',
        'phq9_q4': 'Poor appetite or overeating.',
        'phq9_q5': 'Feeling bad about yourself — or that you are a failure or have let yourself or your family down.',
        'phq9_q6': 'Trouble concentrating on things, such as reading the newspaper or watching television.',
        'phq9_q7': 'Moving or speaking so slowly that other people could have noticed? Or the opposite — being so fidgety or restless that you have been moving around a lot more than usual.',
        'phq9_q8': 'Thoughts that you would be better off dead or of hurting yourself in some way.',
        
        // Assessment Questions - GAD-7
        'gad7_q0': 'Feeling nervous, anxious, or on edge.',
        'gad7_q1': 'Not being able to stop or control worrying.',
        'gad7_q2': 'Worrying too much about different things.',
        'gad7_q3': 'Trouble relaxing.',
        'gad7_q4': 'Being so restless that it\'s hard to sit still.',
        'gad7_q5': 'Becoming easily annoyed or irritable.',
        'gad7_q6': 'Feeling afraid as if something awful might happen.',
        
        // Assessment Options
        'not_at_all': 'Not at all',
        'several_days': 'Several days',
        'more_than_half': 'More than half the days',
        'nearly_every_day': 'Nearly every day',
        'never': 'Never',
        'almost_never': 'Almost Never',
        'sometimes': 'Sometimes',
        'fairly_often': 'Fairly Often',
        'very_often': 'Very Often',
        
        // Assessment Titles
        'depression_phq9': 'Depression (PHQ-9)',
        'anxiety_gad7': 'Anxiety (GAD-7)',
        'stress_pss10': 'Stress (PSS-10)',
        
        // Wellness Resources
        'understanding_depression': 'Understanding Depression',
        'understanding_anxiety': 'Understanding Anxiety', 
        'understanding_stress': 'Understanding Stress',
        'behavioral_activation': 'Behavioral Activation',
        'breathing_exercise': 'Breathing Exercise',
        'writing_journal': 'Writing Journal',
        'mindfulness_meditation': 'Mindfulness Meditation',
        'virtual_relax_space': 'Virtual Relax Space',
        
        // Progress & Assessment
        'daily_mood_tracker': 'Daily Mood Tracker',
        'how_feeling_today': 'How are you feeling today?',
        'save_mood': 'Save Today\'s Mood',
        'mood_trend': '7-Day Mood Trend',
        'average': 'Average:',
        'trend': 'Trend:',
        'export_data': 'Export My Data',
        'milestones': 'Your Milestones',
        'assessment_history': 'Assessment History',
        'view_progress': 'View My Progress',
        'see_results': 'See My Results',
        'your_results': 'Your Results',
        'start_assessment': 'Start Assessment',
        'question_of': 'Question {current} of {total}',
        'previous': 'Previous',
        'next': 'Next',
        
        // Forum & Community
        'join': 'Join',
        'joined': 'Joined',
        'members': 'members',
        'create_post': 'Create Post',
        'post_title': 'Post Title',
        'post_content': 'Post Content',
        'submit_post': 'Submit Post',
        'comments': 'comments',
        'reply': 'Reply',
        'upvote': 'Upvote',
        'downvote': 'Downvote',
        
        // Settings & Profile
        'settings': 'Settings',
        'theme': 'Theme',
        'dark': 'Dark',
        'light': 'Light',
        'notifications': 'Notifications',
        'language': 'Language',
        'data_privacy': 'Data & Privacy',
        'logout': 'Logout',
        'manage': 'Manage',
        'on': 'On',
        'off': 'Off',
        
        // Emergency & Support
        'emergency_support': 'Emergency Support',
        'call_emergency': 'Call Emergency Services',
        'crisis_helpline': 'Crisis Helpline',
        'need_immediate_help': 'Need Immediate Help?',
        
        // Grant Permission Screen
        'grant_permissions': 'Grant Permissions',
        'microphone_permission': 'Microphone Permission',
        'microphone_permission_desc': 'Allow access to microphone for voice chat',
        'camera_permission': 'Camera Permission', 
        'camera_permission_desc': 'Allow access to camera for video calls',
        'notification_permission': 'Notification Permission',
        'notification_permission_desc': 'Allow notifications for reminders and updates',
        'location_permission': 'Location Permission',
        'location_permission_desc': 'Allow location access to find nearby therapists',
        'allow': 'Allow',
        'deny': 'Deny',
        'skip_for_now': 'Skip for Now',
        'permissions_required': 'Permissions Required',
        'permissions_help_text': 'These permissions help us provide you with the best experience',
        
        // Demo AI Therapist Chat
        'demo_chat_title': 'Demo AI Therapist Chat',
        'demo_chat_subtitle': 'Experience our AI therapist before creating an account',
        'demo_chat_disclaimer': 'This is a demo. For full features, please create an account.',
        'demo_limit_reached': 'Demo limit reached. Please create an account to continue.',
        'try_demo_chat': 'Try Demo Chat',
        'demo_conversation_starter': 'Hello! I\'m your AI therapist. How are you feeling today?',
        'welcome_demo_chat': 'Welcome to the demo chat.',
        'welcome_back': 'Welcome back.',
        
        // Privacy Policy & Data Management
        'privacy_policy': 'Privacy Policy',
        'terms_of_service': 'Terms of Service',
        'data_collection': 'Data Collection',
        'data_usage': 'Data Usage',
        'data_sharing': 'Data Sharing',
        'data_retention': 'Data Retention',
        'your_rights': 'Your Rights',
        'contact_us': 'Contact Us',
        'privacy_settings': 'Privacy Settings',
        'manage_data': 'Manage My Data',
        'download_data': 'Download My Data',
        'delete_account': 'Delete Account',
        'data_portability': 'Data Portability',
        'cookie_settings': 'Cookie Settings',
        'data_consent_required': 'Data Consent Required',
        'before_starting_assessment': 'Before starting your assessment, please confirm your consent for data processing:',
        'consent_storage_processing': 'I consent to the storage and processing of my assessment responses as per the',
        'not_diagnosis': 'This is not a diagnosis. Please consult a healthcare professional for a formal evaluation.',
        
        // Wellness Resources Content
        'resource_categories': 'Resource Categories',
        'mental_health_basics': 'Mental Health Basics',
        'coping_strategies': 'Coping Strategies',
        'self_care_tips': 'Self-Care Tips',
        'crisis_resources': 'Crisis Resources',
        'professional_help': 'Professional Help',
        'support_groups': 'Support Groups',
        'educational_content': 'Educational Content',
        'guided_exercises': 'Guided Exercises',
        'relaxation_techniques': 'Relaxation Techniques',
        'mood_management': 'Mood Management',
        'stress_reduction': 'Stress Reduction',
        'sleep_hygiene': 'Sleep Hygiene',
        'healthy_habits': 'Healthy Habits',
        'relationship_tips': 'Relationship Tips',
        'work_life_balance': 'Work-Life Balance',
        'understanding_mental_health': 'Understanding Mental Health',
        'relaxation_mindfulness': 'Relaxation & Mindfulness',
        'self_care_tools': 'Self-Care Tools',
        'learn_signs_symptoms': 'Learn about signs, symptoms, and coping strategies.',
        'anxiety_types_symptoms': 'Learn about anxiety types, symptoms, and management techniques.',
        'stress_types_effects': 'Learn about stress types, effects, and healthy coping mechanisms.',
        'simple_technique_mood': 'A simple technique to improve mood by scheduling positive activities.',
        'guided_breathing_calm': 'Guided breathing to calm your nervous system.',
        'express_thoughts_track': 'Express thoughts and track your mood.',
        'ten_minute_guided': '10-minute guided mindfulness session.',
        'soothing_environment': 'Soothing environment with calming sounds.',
        
        // Profile & Settings Content
        'personal_information': 'Personal Information',
        'account_settings': 'Account Settings',
        'security_settings': 'Security Settings',
        'change_password': 'Change Password',
        'two_factor_auth': 'Two-Factor Authentication',
        'login_history': 'Login History',
        'connected_devices': 'Connected Devices',
        'app_preferences': 'App Preferences',
        'accessibility': 'Accessibility',
        'font_size': 'Font Size',
        'high_contrast': 'High Contrast',
        'screen_reader': 'Screen Reader Support',
        'backup_restore': 'Backup & Restore',
        'sync_settings': 'Sync Settings',
        
        // Progress & Mood Tracking
        'very_low': 'Very Low',
        'neutral': 'Neutral',
        'very_good': 'Very Good',
        'save_todays_mood': 'Save Today\'s Mood',
        'seven_day_mood_trend': '7-Day Mood Trend',
        'your_milestones': 'Your Milestones',
        'complete_assessments_unlock': 'Complete assessments to unlock milestones!',
        'no_assessments_completed': 'You haven\'t completed any assessments yet. Take one to start tracking your progress!',
        
        // Admin Panel
        'admin_panel': 'Admin Panel',
        'total_users': 'Total Users',
        'total_assessments': 'Total Assessments',
        'view_reports': 'View Reports',
        'clean_duplicate_posts': 'Clean Duplicate Posts',
        'registered_users': 'Registered Users',
        
        // Booking & Therapist
        'my_booking_requests': 'My Booking Requests',
        
        // Assessment Questions - PSS-10 (missing ones)
        'pss10_q0': 'In the last month, how often have you been upset because of something that happened unexpectedly?',
        'pss10_q1': 'In the last month, how often have you felt that you were unable to control the important things in your life?',
        'pss10_q2': 'In the last month, how often have you felt nervous and "stressed"?',
        'pss10_q3': 'In the last month, how often have you felt confident about your ability to handle your personal problems?',
        'pss10_q4': 'In the last month, how often have you felt that things were going your way?',
        'pss10_q5': 'In the last month, how often have you found that you could not cope with all the things that you had to do?',
        'pss10_q6': 'In the last month, how often have you been able to control irritations in your life?',
        'pss10_q7': 'In the last month, how often have you felt that you were on top of things?',
        'pss10_q8': 'In the last month, how often have you been angered because of things that were outside of your control?',
        'pss10_q9': 'In the last month, how often have you felt difficulties were piling up so high that you could not overcome them?',
        
        // AI Response Templates
        'ai_response_1': 'Thank you for sharing. How does that make you feel?',
        'ai_response_2': 'I understand. Could you tell me more about what\'s on your mind?',
        'ai_response_3': 'That sounds challenging. I\'m here to listen.',
        'ai_response_4': 'It takes courage to open up about that. What are your thoughts on it?',
        'ai_response_5': 'I hear you. Let\'s explore that feeling a bit more.',
        
        // Common Actions
        'save': 'Save',
        'edit': 'Edit',
        'delete': 'Delete',
        'confirm': 'Confirm',
        'yes': 'Yes',
        'no': 'No',
        'ok': 'OK',
        'loading': 'Loading...',
        'error': 'Error',
        'success': 'Success',
        'warning': 'Warning',
        'info': 'Info',
        'close': 'Close',
        'cancel': 'Cancel',
        'continue': 'Continue',
        
        // Wellness Resources Content
        'what_is_depression': 'What is Depression?',
        'depression_description': 'Depression is more than just feeling sad or going through a rough patch. It\'s a serious mental health condition that affects how you feel, think, and handle daily activities.',
        'common_signs_symptoms': 'Common Signs & Symptoms',
        'persistent_sad_mood': 'Persistent sad, anxious, or "empty" mood',
        'loss_of_interest': 'Loss of interest in activities once enjoyed',
        'fatigue_decreased_energy': 'Fatigue and decreased energy',
        'difficulty_concentrating': 'Difficulty concentrating or making decisions',
        'changes_sleep_patterns': 'Changes in sleep patterns',
        'changes_appetite_weight': 'Changes in appetite or weight',
        'coping_strategies': 'Coping Strategies',
        'daily_routine': 'Daily Routine',
        'maintain_consistent_schedule': 'Maintain a consistent daily schedule to provide structure and stability.',
        'physical_activity': 'Physical Activity',
        'regular_exercise_boost': 'Regular exercise can boost mood and energy levels naturally.',
        'social_connection': 'Social Connection',
        'stay_connected_friends': 'Stay connected with friends and family, even when you don\'t feel like it.',
        'small_goals': 'Small Goals',
        'set_achievable_daily_goals': 'Set achievable daily goals to build momentum and confidence.',
        'when_to_seek_help': 'When to Seek Help',
        'symptoms_persist_two_weeks': 'If symptoms persist for more than two weeks or interfere with daily life, consider reaching out to a mental health professional.',
        
        // Privacy Policy Content
        'your_privacy_matters': 'Your Privacy Matters',
        'dpdp_act_compliant': 'DPDP Act 2023 Compliant',
        'privacy_commitment': 'चेtanā is committed to protecting your personal health information in compliance with India\'s Digital Personal Data Protection Act (DPDP) 2023.',
        'what_data_we_collect': 'What Data We Collect',
        'assessment_scores_desc': 'PHQ-9, GAD-7, and PSS-10 responses and calculated scores',
        'mood_logs_desc': 'Daily mood ratings and journal entries',
        'account_information_desc': 'Email address, name, and date of birth (if registered)',
        'usage_data_desc': 'App interaction patterns for improving user experience',
        'where_data_stored': 'Where Your Data is Stored',
        'data_storage_desc': 'All data is securely stored in encrypted databases within India (Mumbai region) to comply with data localization requirements under DPDP Act.',
        'who_can_access_data': 'Who Can Access Your Data',
        'you_full_access': 'You: Full access to view, export, and delete your data',
        'licensed_clinicians': 'Licensed Clinicians: Only with your explicit consent for treatment purposes',
        'admin_anonymized': 'Admin: Anonymized data for system maintenance and improvement',
        'no_third_parties': 'No Third Parties: We never sell or share your personal health data'
    },
    
    hi: {
        // Login & Registration
        'awakening_minds': 'मन जगाना, कल्याण पोषण',
        'login': 'लॉगिन',
        'email_username': 'ईमेल / उपयोगकर्ता नाम',
        'password': 'पासवर्ड',
        'create_account': 'खाता बनाएं',
        'dont_have_account': 'खाता नहीं है?',
        'signup': 'साइन अप',
        'continue_as_guest': 'अतिथि के रूप में जारी रखें',
        'back_to_login': 'लॉगिन पर वापस',
        'full_name': 'पूरा नाम',
        'date_of_birth': 'जन्म तिथि',
        'email': 'ईमेल पता',
        'create_your_account': 'अपना खाता बनाएं',
        
        // Dashboard & Navigation
        'welcome': 'स्वागत',
        'demo_ai_therapist': 'डेमो AI थेरेपिस्ट चैट',
        'ai_therapist': 'AI थेरेपिस्ट',
        'self_assessment': 'स्व-मूल्यांकन',
        'find_your_therapist': 'अपना थेरेपिस्ट खोजें',
        'community_forum': 'कम्युनिटी फोरम',
        'my_progress': 'मेरी प्रगति डैशबोर्ड',
        'wellness_resources': 'कल्याण संसाधन',
        'profile_settings': 'प्रोफाइल और सेटिंग्स',
        'chat_with_ai': 'AI थेरेपिस्ट से चैट करें',
        'take_assessment': 'स्व-मूल्यांकन करें',
        'book_appointment': 'अपॉइंटमेंट बुक करें',
        'my_progress_dashboard': 'मेरी प्रगति डैशबोर्ड',
        
        // Chat Interface
        'type_message': 'अपना संदेश टाइप करें...',
        'type_message_50_limit': 'अपना संदेश टाइप करें (50 दैनिक सीमा)...',
        'voice_to_text': 'आवाज से टेक्स्ट',
        'send': 'भेजें',
        'i_feel_anxious': 'मुझे चिंता हो रही है',
        'cant_sleep': 'मुझे नींद नहीं आ रही',
        'feeling_overwhelmed': 'मैं परेशान हूं',
        'bad_day': 'मेरा दिन खराब था',
        'talk_stress': 'तनाव के बारे में बात करें',
        
        // Assessment Questions - PHQ-9
        'phq9_q0': 'चीजों में कम रुचि या खुशी महसूस करना।',
        'phq9_q1': 'उदास, निराश, या निराशाजनक महसूस करना।',
        'phq9_q2': 'सोने में परेशानी या बहुत अधिक सोना।',
        'phq9_q3': 'थकान या कम ऊर्जा महसूस करना।',
        'phq9_q4': 'भूख न लगना या अधिक खाना।',
        'phq9_q5': 'अपने बारे में बुरा महसूस करना — या यह कि आप असफल हैं या अपने परिवार को निराश किया है।',
        'phq9_q6': 'अखबार पढ़ने या टेलीविजन देखने जैसी चीजों पर ध्यान केंद्रित करने में परेशानी।',
        'phq9_q7': 'इतनी धीमी गति से चलना या बोलना कि दूसरे लोग इसे नोटिस कर सकें? या इसके विपरीत — इतना बेचैन या परेशान होना कि आप सामान्य से बहुत अधिक घूम रहे हैं।',
        'phq9_q8': 'यह सोचना कि आप मर जाएं तो बेहतर होगा या किसी तरह से खुद को नुकसान पहुंचाने के विचार।',
        
        // Assessment Questions - GAD-7
        'gad7_q0': 'घबराहट, चिंता, या बेचैनी महसूस करना।',
        'gad7_q1': 'चिंता को रोकने या नियंत्रित करने में असमर्थ होना।',
        'gad7_q2': 'विभिन्न चीजों के बारे में बहुत अधिक चिंता करना।',
        'gad7_q3': 'आराम करने में परेशानी।',
        'gad7_q4': 'इतना बेचैन होना कि शांत बैठना मुश्किल हो।',
        'gad7_q5': 'आसानी से परेशान या चिड़चिड़ाहट होना।',
        'gad7_q6': 'डर लगना जैसे कि कुछ भयानक होने वाला है।',
        
        // Assessment Questions - PSS-10
        'pss10_q0': 'पिछले महीने में, आप कितनी बार अप्रत्याशित चीजों के कारण परेशान हुए हैं?',
        'pss10_q1': 'पिछले महीने में, आप कितनी बार महसूस किया कि आप अपने जीवन की महत्वपूर्ण चीजों को नियंत्रित करने में असमर्थ हैं?',
        'pss10_q2': 'पिछले महीने में, आप कितनी बार तनावग्रस्त और दबाव महसूस किया है?',
        'pss10_q3': 'पिछले महीने में, आप कितनी बार सफलतापूर्वक परेशान करने वाली समस्याओं से निपटे हैं?',
        'pss10_q4': 'पिछले महीने में, आप कितनी बार महसूस किया कि आप जीवन में होने वाले बदलावों से प्रभावी रूप से निपट रहे हैं?',
        'pss10_q5': 'पिछले महीने में, आप कितनी बार विश्वास महसूस किया कि आप अपनी व्यक्तिगत समस्याओं को संभाल सकते हैं?',
        'pss10_q6': 'पिछले महीने में, आप कितनी बार महसूस किया कि चीजें आपके अनुसार चल रही हैं?',
        'pss10_q7': 'पिछले महीने में, आप कितनी बार पाया कि आप उन सभी चीजों से निपट नहीं सकते जो आपको करनी थीं?',
        'pss10_q8': 'पिछले महीने में, आप कितनी बार अपने गुस्से को नियंत्रित करने में सक्षम रहे हैं?',
        'pss10_q9': 'पिछले महीने में, आप कितनी बार महसूस किया कि कठिनाइयां इतनी बढ़ रही हैं कि आप उन पर काबू नहीं पा सकते?',
        
        // Assessment Options
        'not_at_all': 'बिल्कुल नहीं',
        'several_days': 'कई दिन',
        'more_than_half': 'आधे से अधिक दिन',
        'nearly_every_day': 'लगभग हर दिन',
        'never': 'कभी नहीं',
        'almost_never': 'लगभग कभी नहीं',
        'sometimes': 'कभी कभी',
        'fairly_often': 'अक्सर',
        'very_often': 'बहुत अक्सर',
        
        // Assessment Titles
        'depression_phq9': 'अवसाद (PHQ-9)',
        'anxiety_gad7': 'चिंता (GAD-7)',
        'stress_pss10': 'तनाव (PSS-10)',
        
        // Wellness Resources
        'understanding_depression': 'अवसाद को समझना',
        'understanding_anxiety': 'चिंता को समझना',
        'understanding_stress': 'तनाव को समझना',
        'behavioral_activation': 'व्यवहारिक सक्रियता',
        'breathing_exercise': 'सांस का अभ्यास',
        'writing_journal': 'लेखन पत्रिका',
        'mindfulness_meditation': 'माइंडफुलनेस मेडिटेशन',
        'virtual_relax_space': 'वर्चुअल रिलैक्स स्पेस',
        
        // Progress & Assessment
        'daily_mood_tracker': 'दैनिक मूड ट्रैकर',
        'how_feeling_today': 'आज आप कैसा महसूस कर रहे हैं?',
        'save_mood': 'आज का मूड सेव करें',
        'mood_trend': '7-दिन मूड ट्रेंड',
        'average': 'औसत:',
        'trend': 'रुझान:',
        'export_data': 'मेरा डेटा एक्सपोर्ट करें',
        'milestones': 'आपके माइलस्टोन',
        'assessment_history': 'मूल्यांकन इतिहास',
        'view_progress': 'मेरी प्रगति देखें',
        'see_results': 'मेरे परिणाम देखें',
        'your_results': 'आपके परिणाम',
        'start_assessment': 'मूल्यांकन शुरू करें',
        'question_of': 'प्रश्न {current} का {total}',
        'previous': 'पिछला',
        'next': 'अगला',
        
        // Forum & Community
        'join': 'जुड़ें',
        'joined': 'जुड़ गए',
        'members': 'सदस्य',
        'create_post': 'पोस्ट बनाएं',
        'post_title': 'पोस्ट शीर्षक',
        'post_content': 'पोस्ट सामग्री',
        'submit_post': 'पोस्ट सबमिट करें',
        'comments': 'टिप्पणियां',
        'reply': 'जवाब',
        'upvote': 'अपवोट',
        'downvote': 'डाउनवोट',
        
        // Settings & Profile
        'settings': 'सेटिंग्स',
        'theme': 'थीम',
        'dark': 'डार्क',
        'light': 'लाइट',
        'notifications': 'नोटिफिकेशन',
        'language': 'भाषा',
        'data_privacy': 'डेटा और प्राइवेसी',
        'logout': 'लॉगआउट',
        'manage': 'प्रबंधित करें',
        'on': 'चालू',
        'off': 'बंद',
        
        // Emergency & Support
        'emergency_support': 'आपातकालीन सहायता',
        'call_emergency': 'आपातकालीन सेवाओं को कॉल करें',
        'crisis_helpline': 'संकट हेल्पलाइन',
        'need_immediate_help': 'तत्काल सहायता चाहिए?',
        
        // Grant Permission Screen
        'grant_permissions': 'अनुमतियां प्रदान करें',
        'microphone_permission': 'माइक्रोफोन अनुमति',
        'microphone_permission_desc': 'वॉयस चैट के लिए माइक्रोफोन एक्सेस की अनुमति दें',
        'camera_permission': 'कैमरा अनुमति',
        'camera_permission_desc': 'वीडियो कॉल के लिए कैमरा एक्सेस की अनुमति दें',
        'notification_permission': 'नोटिफिकेशन अनुमति',
        'notification_permission_desc': 'रिमाइंडर और अपडेट के लिए नोटिफिकेशन की अनुमति दें',
        'location_permission': 'स्थान अनुमति',
        'location_permission_desc': 'नजदीकी थेरेपिस्ट खोजने के लिए स्थान एक्सेस की अनुमति दें',
        'allow': 'अनुमति दें',
        'deny': 'मना करें',
        'skip_for_now': 'अभी के लिए छोड़ें',
        'permissions_required': 'अनुमतियां आवश्यक',
        'permissions_help_text': 'ये अनुमतियां आपको बेहतर अनुभव प्रदान करने में मदद करती हैं',
        
        // Demo AI Therapist Chat
        'demo_chat_title': 'डेमो AI थेरेपिस्ट चैट',
        'demo_chat_subtitle': 'खाता बनाने से पहले हमारे AI थेरेपिस्ट का अनुभव करें',
        'demo_chat_disclaimer': 'यह एक डेमो है। पूर्ण सुविधाओं के लिए, कृपया खाता बनाएं।',
        'demo_limit_reached': 'डेमो सीमा पूरी हो गई। जारी रखने के लिए कृपया खाता बनाएं।',
        'try_demo_chat': 'डेमो चैट आज़माएं',
        'demo_conversation_starter': 'नमस्ते! मैं आपका AI थेरेपिस्ट हूं। आज आप कैसा महसूस कर रहे हैं?',
        'welcome_demo_chat': 'डेमो चैट में आपका स्वागत है।',
        'welcome_back': 'वापसी पर स्वागत है।',
        
        // Privacy Policy & Data Management
        'privacy_policy': 'गोपनीयता नीति',
        'terms_of_service': 'सेवा की शर्तें',
        'data_collection': 'डेटा संग्रह',
        'data_usage': 'डेटा उपयोग',
        'data_sharing': 'डेटा साझाकरण',
        'data_retention': 'डेटा प्रतिधारण',
        'your_rights': 'आपके अधिकार',
        'contact_us': 'हमसे संपर्क करें',
        'privacy_settings': 'गोपनीयता सेटिंग्स',
        'manage_data': 'मेरा डेटा प्रबंधित करें',
        'download_data': 'मेरा डेटा डाउनलोड करें',
        'delete_account': 'खाता हटाएं',
        'data_portability': 'डेटा पोर्टेबिलिटी',
        'cookie_settings': 'कुकी सेटिंग्स',
        'data_consent_required': 'डेटा सहमति आवश्यक',
        'before_starting_assessment': 'अपना मूल्यांकन शुरू करने से पहले, कृपया डेटा प्रसंस्करण के लिए अपनी सहमति की पुष्टि करें:',
        'consent_storage_processing': 'मैं अपने मूल्यांकन उत्तरों के भंडारण और प्रसंस्करण के लिए सहमति देता हूं जैसा कि',
        'not_diagnosis': 'यह निदान नहीं है। औपचारिक मूल्यांकन के लिए कृपया स्वास्थ्य पेशेवर से सलाह लें।',
        
        // Wellness Resources Content
        'resource_categories': 'संसाधन श्रेणियां',
        'mental_health_basics': 'मानसिक स्वास्थ्य मूल बातें',
        'coping_strategies': 'मुकाबला रणनीतियां',
        'self_care_tips': 'स्व-देखभाल सुझाव',
        'crisis_resources': 'संकट संसाधन',
        'professional_help': 'पेशेवर सहायता',
        'support_groups': 'सहायता समूह',
        'educational_content': 'शैक्षिक सामग्री',
        'guided_exercises': 'निर्देशित अभ्यास',
        'relaxation_techniques': 'विश्राम तकनीकें',
        'mood_management': 'मूड प्रबंधन',
        'stress_reduction': 'तनाव कम करना',
        'sleep_hygiene': 'नींद की स्वच्छता',
        'healthy_habits': 'स्वस्थ आदतें',
        'relationship_tips': 'रिश्ते के सुझाव',
        'work_life_balance': 'कार्य-जीवन संतुलन',
        'understanding_mental_health': 'मानसिक स्वास्थ्य को समझना',
        'relaxation_mindfulness': 'विश्राम और माइंडफुलनेस',
        'self_care_tools': 'स्व-देखभाल उपकरण',
        'learn_signs_symptoms': 'संकेत, लक्षण और मुकाबला रणनीतियों के बारे में जानें।',
        'anxiety_types_symptoms': 'चिंता के प्रकार, लक्षण और प्रबंधन तकनीकों के बारे में जानें।',
        'stress_types_effects': 'तनाव के प्रकार, प्रभाव और स्वस्थ मुकाबला तंत्र के बारे में जानें।',
        'simple_technique_mood': 'सकारात्मक गतिविधियों को शेड्यूल करके मूड सुधारने की एक सरल तकनीक।',
        'guided_breathing_calm': 'आपके तंत्रिका तंत्र को शांत करने के लिए निर्देशित श्वास।',
        'express_thoughts_track': 'विचारों को व्यक्त करें और अपने मूड को ट्रैक करें।',
        'ten_minute_guided': '10-मिनट का निर्देशित माइंडफुलनेस सत्र।',
        'soothing_environment': 'शांत आवाजों के साथ सुखदायक वातावरण।',
        
        // Profile & Settings Content
        'personal_information': 'व्यक्तिगत जानकारी',
        'account_settings': 'खाता सेटिंग्स',
        'security_settings': 'सुरक्षा सेटिंग्स',
        'change_password': 'पासवर्ड बदलें',
        'two_factor_auth': 'दो-कारक प्रमाणीकरण',
        'login_history': 'लॉगिन इतिहास',
        'connected_devices': 'जुड़े उपकरण',
        'app_preferences': 'ऐप प्राथमिकताएं',
        'accessibility': 'पहुंच',
        'font_size': 'फ़ॉन्ट आकार',
        'high_contrast': 'उच्च कंट्रास्ट',
        'screen_reader': 'स्क्रीन रीडर समर्थन',
        'backup_restore': 'बैकअप और पुनर्स्थापना',
        'sync_settings': 'सिंक सेटिंग्स',
        
        // Progress & Mood Tracking
        'very_low': 'बहुत कम',
        'neutral': 'तटस्थ',
        'very_good': 'बहुत अच्छा',
        'save_todays_mood': 'आज का मूड सेव करें',
        'seven_day_mood_trend': '7-दिन मूड ट्रेंड',
        'your_milestones': 'आपके माइलस्टोन',
        'complete_assessments_unlock': 'माइलस्टोन अनलॉक करने के लिए मूल्यांकन पूरे करें!',
        'no_assessments_completed': 'आपने अभी तक कोई मूल्यांकन पूरा नहीं किया है। अपनी प्रगति ट्रैक करना शुरू करने के लिए एक करें!',
        
        // Admin Panel
        'admin_panel': 'एडमिन पैनल',
        'total_users': 'कुल उपयोगकर्ता',
        'total_assessments': 'कुल मूल्यांकन',
        'view_reports': 'रिपोर्ट देखें',
        'clean_duplicate_posts': 'डुप्लिकेट पोस्ट साफ करें',
        'registered_users': 'पंजीकृत उपयोगकर्ता',
        
        // Booking & Therapist
        'my_booking_requests': 'मेरे बुकिंग अनुरोध',
        
        // Assessment Questions - PSS-10 (missing ones)
        'pss10_q0': 'पिछले महीने में, आप कितनी बार अप्रत्याशित चीजों के कारण परेशान हुए हैं?',
        'pss10_q1': 'पिछले महीने में, आप कितनी बार महसूस किया कि आप अपने जीवन की महत्वपूर्ण चीजों को नियंत्रित करने में असमर्थ हैं?',
        'pss10_q2': 'पिछले महीने में, आप कितनी बार तनावग्रस्त और दबाव महसूस किया है?',
        'pss10_q3': 'पिछले महीने में, आप कितनी बार सफलतापूर्वक परेशान करने वाली समस्याओं से निपटे हैं?',
        'pss10_q4': 'पिछले महीने में, आप कितनी बार महसूस किया कि आप जीवन में होने वाले बदलावों से प्रभावी रूप से निपट रहे हैं?',
        'pss10_q5': 'पिछले महीने में, आप कितनी बार विश्वास महसूस किया कि आप अपनी व्यक्तिगत समस्याओं को संभाल सकते हैं?',
        'pss10_q6': 'पिछले महीने में, आप कितनी बार महसूस किया कि चीजें आपके अनुसार चल रही हैं?',
        'pss10_q7': 'पिछले महीने में, आप कितनी बार पाया कि आप उन सभी चीजों से निपट नहीं सकते जो आपको करनी थीं?',
        'pss10_q8': 'पिछले महीने में, आप कितनी बार अपने गुस्से को नियंत्रित करने में सक्षम रहे हैं?',
        'pss10_q9': 'पिछले महीने में, आप कितनी बार महसूस किया कि कठिनाइयां इतनी बढ़ रही हैं कि आप उन पर काबू नहीं पा सकते?',
        
        // AI Response Templates
        'ai_response_1': 'साझा करने के लिए धन्यवाद। इससे आपको कैसा लगता है?',
        'ai_response_2': 'मैं समझता हूं। क्या आप मुझे बता सकते हैं कि आपके मन में क्या है?',
        'ai_response_3': 'यह चुनौतीपूर्ण लगता है। मैं सुनने के लिए यहां हूं।',
        'ai_response_4': 'इसके बारे में खुलकर बात करने में साहस लगता है। इस पर आपके क्या विचार हैं?',
        'ai_response_5': 'मैं आपकी बात सुन रहा हूं। आइए उस भावना को थोड़ा और समझते हैं।',
        
        // Common Actions
        'save': 'सेव करें',
        'edit': 'संपादित करें',
        'delete': 'हटाएं',
        'confirm': 'पुष्टि करें',
        'yes': 'हां',
        'no': 'नहीं',
        'ok': 'ठीक है',
        'loading': 'लोड हो रहा है...',
        'error': 'त्रुटि',
        'success': 'सफलता',
        'warning': 'चेतावनी',
        'info': 'जानकारी',
        'close': 'बंद करें',
        'cancel': 'रद्द करें',
        'continue': 'जारी रखें',
        
        // Wellness Resources Content
        'what_is_depression': 'डिप्रेशन क्या है?',
        'depression_description': 'डिप्रेशन केवल उदास महसूस करना या मुश्किल दौर से गुजरना नहीं है। यह एक गंभीर मानसिक स्वास्थ्य स्थिति है जो आपके महसूस करने, सोचने और दैनिक गतिविधियों को संभालने के तरीके को प्रभावित करती है।',
        'common_signs_symptoms': 'सामान्य लक्षण और संकेत',
        'persistent_sad_mood': 'लगातार उदास, चिंतित, या "खाली" मूड',
        'loss_of_interest': 'पहले पसंद की गतिविधियों में रुचि का नुकसान',
        'fatigue_decreased_energy': 'थकान और ऊर्जा में कमी',
        'difficulty_concentrating': 'ध्यान केंद्रित करने या फैसले लेने में कठिनाई',
        'changes_sleep_patterns': 'नींद के पैटर्न में बदलाव',
        'changes_appetite_weight': 'भूख या वजन में बदलाव',
        'coping_strategies': 'निपटने की रणनीतियाँ',
        'daily_routine': 'दैनिक दिनचर्या',
        'maintain_consistent_schedule': 'संरचना और स्थिरता प्रदान करने के लिए एक सुसंगत दैनिक कार्यक्रम बनाए रखें।',
        'physical_activity': 'शारीरिक गतिविधि',
        'regular_exercise_boost': 'नियमित व्यायाम प्राकृतिक रूप से मूड और ऊर्जा के स्तर को बढ़ा सकता है।',
        'social_connection': 'सामाजिक जुड़ाव',
        'stay_connected_friends': 'दोस्तों और परिवार के साथ जुड़े रहें, भले ही आपका मन न करे।',
        'small_goals': 'छोटे लक्ष्य',
        'set_achievable_daily_goals': 'गति और आत्मविश्वास बनाने के लिए प्राप्त करने योग्य दैनिक लक्ष्य निर्धारित करें।',
        'when_to_seek_help': 'कब मदद लें',
        'symptoms_persist_two_weeks': 'यदि लक्षण दो सप्ताह से अधिक समय तक बने रहते हैं या दैनिक जीवन में हस्तक्षेप करते हैं, तो मानसिक स्वास्थ्य पेशेवर से संपर्क करने पर विचार करें।',
        
        // Privacy Policy Content
        'your_privacy_matters': 'आपकी गोपनीयता महत्वपूर्ण है',
        'dpdp_act_compliant': 'DPDP अधिनियम 2023 अनुपालन',
        'privacy_commitment': 'चेtanā भारत के डिजिटल व्यक्तिगत डेटा संरक्षण अधिनियम (DPDP) 2023 के अनुपालन में आपकी व्यक्तिगत स्वास्थ्य जानकारी की सुरक्षा के लिए प्रतिबद्ध है।',
        'what_data_we_collect': 'हम कौन सा डेटा संग्रहीत करते हैं',
        'assessment_scores_desc': 'PHQ-9, GAD-7, और PSS-10 प्रतिक्रियाएँ और गणना किए गए स्कोर',
        'mood_logs_desc': 'दैनिक मूड रेटिंग और जर्नल एंट्री',
        'account_information_desc': 'ईमेल पता, नाम, और जन्म तिथि (यदि पंजीकृत)',
        'usage_data_desc': 'उपयोगकर्ता अनुभव में सुधार के लिए ऐप इंटरैक्शन पैटर्न',
        'where_data_stored': 'आपका डेटा कहाँ संग्रहीत है',
        'data_storage_desc': 'DPDP अधिनियम के तहत डेटा स्थानीयकरण आवश्यकताओं का अनुपालन करने के लिए सभी डेटा भारत (मुंबई क्षेत्र) के भीतर एन्क्रिप्टेड डेटाबेस में सुरक्षित रूप से संग्रहीत है।',
        'who_can_access_data': 'आपके डेटा तक कौन पहुँच सकता है',
        'you_full_access': 'आप: अपने डेटा को देखने, एक्सपोर्ट करने और डिलीट करने की पूरी पहुँच',
        'licensed_clinicians': 'लाइसेंसप्राप्त चिकित्सक: केवल इलाज के उद्देश्य से आपकी स्पष्ट सहमति के साथ',
        'admin_anonymized': 'एडमिन: सिस्टम रखरखाव और सुधार के लिए गुमनाम डेटा',
        'no_third_parties': 'कोई तीसरा पक्ष नहीं: हम कभी भी आपके व्यक्तिगत स्वास्थ्य डेटा को नहीं बेचते या साझा नहीं करते'
    },
    
    bn: {
        // Login & Registration
        'awakening_minds': 'মন জাগ্রত করা, কল্যাণ লালন',
        'login': 'লগইন',
        'email_username': 'ইমেইল / ব্যবহারকারীর নাম',
        'password': 'পাসওয়ার্ড',
        'create_account': 'অ্যাকাউন্ট তৈরি করুন',
        'dont_have_account': 'অ্যাকাউন্ট নেই?',
        'signup': 'সাইন আপ',
        'continue_as_guest': 'অতিথি হিসেবে চালিয়ে যান',
        'back_to_login': 'লগইনে ফিরে যান',
        'full_name': 'পূর্ণ নাম',
        'date_of_birth': 'জন্ম তারিখ',
        'email': 'ইমেইল ঠিকানা',
        'create_your_account': 'আপনার অ্যাকাউন্ট তৈরি করুন',
        
        // Dashboard & Navigation
        'welcome': 'স্বাগতম',
        'demo_ai_therapist': 'ডেমো AI থেরাপিস্ট চ্যাট',
        'ai_therapist': 'AI থেরাপিস্ট',
        'self_assessment': 'স্ব-মূল্যায়ন',
        'find_your_therapist': 'আপনার থেরাপিস্ট খুঁজুন',
        'community_forum': 'কমিউনিটি ফোরাম',
        'my_progress': 'আমার অগ্রগতি ড্যাশবোর্ড',
        'wellness_resources': 'কল্যাণ সম্পদ',
        'profile_settings': 'প্রোফাইল ও সেটিংস',
        'chat_with_ai': 'AI থেরাপিস্টের সাথে চ্যাট করুন',
        'take_assessment': 'স্ব-মূল্যায়ন করুন',
        'book_appointment': 'অ্যাপয়েন্টমেন্ট বুক করুন',
        'my_progress_dashboard': 'আমার অগ্রগতি ড্যাশবোর্ড',
        
        // Chat Interface
        'type_message': 'আপনার বার্তা টাইপ করুন...',
        'type_message_50_limit': 'আপনার বার্তা টাইপ করুন (৫০ দৈনিক সীমা)...',
        'voice_to_text': 'ভয়েস টু টেক্সট',
        'send': 'পাঠান',
        'i_feel_anxious': 'আমি উদ্বিগ্ন বোধ করছি',
        'cant_sleep': 'আমার ঘুম আসছে না',
        'feeling_overwhelmed': 'আমি অভিভূত বোধ করছি',
        'bad_day': 'আমার খারাপ দিন ছিল',
        'talk_stress': 'চাপ নিয়ে কথা বলি',
        
        // Assessment Questions - PHQ-9
        'phq9_q0': 'কাজকর্মে কম আগ্রহ বা আনন্দ অনুভব করা।',
        'phq9_q1': 'নিরাশ, বিষণ্ণ, বা নিরাশাজনক অনুভব করা।',
        'phq9_q2': 'ঘুমাতে যাওয়া বা ঘুমিয়ে থাকতে সমস্যা, বা অত্যধিক ঘুমানো।',
        'phq9_q3': 'ক্লান্ত বোধ করা বা কম শক্তি থাকা।',
        'phq9_q4': 'খাবারে অরুচি বা অত্যধিক খাওয়া।',
        'phq9_q5': 'নিজের সম্পর্কে খারাপ অনুভব করা — বা মনে করা যে আপনি ব্যর্থ বা নিজের বা পরিবারকে নিরাশ করেছেন।',
        'phq9_q6': 'খবরের কাগজ পড়া বা টেলিভিশন দেখার মতো কাজে মনোযোগ দিতে সমস্যা।',
        'phq9_q7': 'এত ধীরে চলাফেরা বা কথা বলা যে অন্যরা লক্ষ্য করতে পারে? বা উল্টো — এত অস্থির বা বেচৈন যে আপনি সাধারণের চেয়ে অনেক বেশি ঘুরে বেড়াচ্ছেন।',
        'phq9_q8': 'এমন চিন্তা যে আপনি মরে গেলে ভালো হতো বা কোনোভাবে নিজের ক্ষতি করার চিন্তা।',
        
        // Assessment Questions - GAD-7
        'gad7_q0': 'ঘাবড়া, উদ্বেগ, বা অস্থিরতা অনুভব করা।',
        'gad7_q1': 'চিন্তা বন্ধ করতে বা নিয়ন্ত্রণ করতে পারা না।',
        'gad7_q2': 'বিভিন্ন বিষয় নিয়ে অত্যধিক চিন্তা করা।',
        'gad7_q3': 'শান্ত হতে সমস্যা।',
        'gad7_q4': 'এত অস্থির হয়ে যাওয়া যে স্থির হয়ে বসা কঠিন।',
        'gad7_q5': 'সহজেই বিরক্ত বা চিড়চিড়ে হয়ে যাওয়া।',
        'gad7_q6': 'ভয় পাওয়া যেন কিছু ভয়ানক ঘটতে যাচ্ছে।',
        
        // Assessment Questions - PSS-10
        'pss10_q0': 'গত মাসে, আপনি কতবার অপ্রত্যাশিত ঘটনার কারণে বিরক্ত হয়েছেন?',
        'pss10_q1': 'গত মাসে, আপনি কতবার অনুভব করেছেন যে আপনি আপনার জীবনের গুরুত্বপূর্ণ বিষয়গুলি নিয়ন্ত্রণ করতে অক্ষম?',
        'pss10_q2': 'গত মাসে, আপনি কতবার তনাবগ্রস্ত ও চাপে অনুভব করেছেন?',
        'pss10_q3': 'গত মাসে, আপনি কতবার সফলভাবে বিরক্তিকর সমস্যার মোকাবেলা করেছেন?',
        'pss10_q4': 'গত মাসে, আপনি কতবার অনুভব করেছেন যে আপনি জীবনের পরিবর্তনগুলির সাথে কার্যকরভাবে মানিয়ে নিচ্ছেন?',
        'pss10_q5': 'গত মাসে, আপনি কতবার আত্মবিশ্বাস অনুভব করেছেন যে আপনি আপনার ব্যক্তিগত সমস্যাগুলি সামলাতে পারেন?',
        'pss10_q6': 'গত মাসে, আপনি কতবার অনুভব করেছেন যে বিষয়গুলি আপনার ইচ্ছা অনুযায়ী চলছে?',
        'pss10_q7': 'গত মাসে, আপনি কতবার দেখেছেন যে আপনি সেই সব কাজ সামলাতে পারছেন না যা আপনার করা দরকার ছিল?',
        'pss10_q8': 'গত মাসে, আপনি কতবার আপনার ক্রোধ নিয়ন্ত্রণ করতে সক্ষম হয়েছেন?',
        'pss10_q9': 'গত মাসে, আপনি কতবার অনুভব করেছেন যে অসুবিধাগুলি এত বেড়ে যাচ্ছে যে আপনি সেগুলি কাটিয়ে উঠতে পারছেন না?',
        
        // Assessment Titles
        'depression_phq9': 'বিষণ্ণতা (PHQ-9)',
        'anxiety_gad7': 'উদ্বেগ (GAD-7)',
        'stress_pss10': 'চাপ (PSS-10)',
        
        // Assessment Options
        'not_at_all': 'একেবারেই না',
        'several_days': 'কয়েক দিন',
        'more_than_half': 'অর্ধেকের বেশি দিন',
        'nearly_every_day': 'প্রায় প্রতিদিন',
        'never': 'কখনো না',
        'almost_never': 'প্রায় কখনো না',
        'sometimes': 'মাঝে মাঝে',
        'fairly_often': 'মোটামুটি প্রায়ই',
        'very_often': 'খুব প্রায়ই',
        
        // Wellness Resources
        'understanding_depression': 'বিষণ্ণতা বোঝা',
        'understanding_anxiety': 'উদ্বেগ বোঝা',
        'understanding_stress': 'চাপ বোঝা',
        'behavioral_activation': 'আচরণগত সক্রিয়করণ',
        'breathing_exercise': 'শ্বাসের ব্যায়াম',
        'writing_journal': 'লেখার জার্নাল',
        'mindfulness_meditation': 'মাইন্ডফুলনেস মেডিটেশন',
        'virtual_relax_space': 'ভার্চুয়াল রিল্যাক্স স্পেস',
        
        // Progress & Assessment
        'daily_mood_tracker': 'দৈনিক মুড ট্র্যাকার',
        'how_feeling_today': 'আজ আপনি কেমন অনুভব করছেন?',
        'save_mood': 'আজকের মুড সংরক্ষণ করুন',
        'mood_trend': '৭-দিনের মুড ট্রেন্ড',
        'average': 'গড়:',
        'trend': 'প্রবণতা:',
        'export_data': 'আমার ডেটা এক্সপোর্ট করুন',
        'milestones': 'আপনার মাইলফলক',
        'assessment_history': 'মূল্যায়নের ইতিহাস',
        'view_progress': 'আমার অগ্রগতি দেখুন',
        'see_results': 'আমার ফলাফল দেখুন',
        'your_results': 'আপনার ফলাফল',
        'start_assessment': 'মূল্যায়ন শুরু করুন',
        'question_of': 'প্রশ্ন {current} এর {total}',
        'previous': 'পূর্ববর্তী',
        'next': 'পরবর্তী',
        
        // Forum & Community
        'join': 'যোগ দিন',
        'joined': 'যোগ দিয়েছেন',
        'members': 'সদস্য',
        'create_post': 'পোস্ট তৈরি করুন',
        'post_title': 'পোস্টের শিরোনাম',
        'post_content': 'পোস্টের বিষয়বস্তু',
        'submit_post': 'পোস্ট জমা দিন',
        'comments': 'মন্তব্য',
        'reply': 'উত্তর',
        'upvote': 'আপভোট',
        'downvote': 'ডাউনভোট',
        
        // Settings & Profile
        'settings': 'সেটিংস',
        'theme': 'থিম',
        'dark': 'ডার্ক',
        'light': 'লাইট',
        'notifications': 'নোটিফিকেশন',
        'language': 'ভাষা',
        'data_privacy': 'ডেটা ও গোপনীয়তা',
        'logout': 'লগআউট',
        'manage': 'পরিচালনা',
        'on': 'চালু',
        'off': 'বন্ধ',
        
        // Emergency & Support
        'emergency_support': 'জরুরি সহায়তা',
        'call_emergency': 'জরুরি সেবায় কল করুন',
        'crisis_helpline': 'সংকট হেল্পলাইন',
        'need_immediate_help': 'তাৎক্ষণিক সাহায্য প্রয়োজন?',
        
        // Grant Permission Screen
        'grant_permissions': 'অনুমতি প্রদান করুন',
        'microphone_permission': 'মাইক্রোফোন অনুমতি',
        'microphone_permission_desc': 'ভয়েস চ্যাটের জন্য মাইক্রোফোন অ্যাক্সেসের অনুমতি দিন',
        'camera_permission': 'ক্যামেরা অনুমতি',
        'camera_permission_desc': 'ভিডিও কলের জন্য ক্যামেরা অ্যাক্সেসের অনুমতি দিন',
        'notification_permission': 'নোটিফিকেশন অনুমতি',
        'notification_permission_desc': 'রিমাইন্ডার এবং আপডেটের জন্য নোটিফিকেশনের অনুমতি দিন',
        'location_permission': 'অবস্থান অনুমতি',
        'location_permission_desc': 'কাছাকাছি থেরাপিস্ট খুঁজতে অবস্থান অ্যাক্সেসের অনুমতি দিন',
        'allow': 'অনুমতি দিন',
        'deny': 'প্রত্যাখ্যান করুন',
        'skip_for_now': 'এখনের জন্য এড়িয়ে যান',
        'permissions_required': 'অনুমতি প্রয়োজন',
        'permissions_help_text': 'এই অনুমতিগুলি আপনাকে সেরা অভিজ্ঞতা প্রদান করতে সাহায্য করে',
        
        // Demo AI Therapist Chat
        'demo_chat_title': 'ডেমো AI থেরাপিস্ট চ্যাট',
        'demo_chat_subtitle': 'অ্যাকাউন্ট তৈরি করার আগে আমাদের AI থেরাপিস্টের অভিজ্ঞতা নিন',
        'demo_chat_disclaimer': 'এটি একটি ডেমো। সম্পূর্ণ বৈশিষ্ট্যের জন্য, দয়া করে একটি অ্যাকাউন্ট তৈরি করুন।',
        'demo_limit_reached': 'ডেমো সীমা পৌঁছেছে। চালিয়ে যেতে দয়া করে একটি অ্যাকাউন্ট তৈরি করুন।',
        'try_demo_chat': 'ডেমো চ্যাট চেষ্টা করুন',
        'demo_conversation_starter': 'হ্যালো! আমি আপনার AI থেরাপিস্ট। আজ আপনি কেমন অনুভব করছেন?',
        'welcome_demo_chat': 'ডেমো চ্যাটে আপনাকে স্বাগতম।',
        'welcome_back': 'ফিরে আসার জন্য স্বাগতম।',
        
        // Wellness Resources Content
        'resource_categories': 'সম্পদ বিভাগ',
        'mental_health_basics': 'মানসিক স্বাস্থ্যের মূল বিষয়',
        'coping_strategies': 'মোকাবেলার কৌশল',
        'self_care_tips': 'স্ব-যত্নের টিপস',
        'crisis_resources': 'সংকট সম্পদ',
        'professional_help': 'পেশাদার সাহায্য',
        'support_groups': 'সহায়তা গ্রুপ',
        'educational_content': 'শিক্ষামূলক বিষয়বস্তু',
        'guided_exercises': 'নির্দেশিত ব্যায়াম',
        'relaxation_techniques': 'শিথিলকরণ কৌশল',
        'mood_management': 'মুড ব্যবস্থাপনা',
        'stress_reduction': 'চাপ কমানো',
        'sleep_hygiene': 'ঘুমের স্বাস্থ্যবিধি',
        'healthy_habits': 'স্বাস্থ্যকর অভ্যাস',
        'relationship_tips': 'সম্পর্কের টিপস',
        'work_life_balance': 'কাজ-জীবনের ভারসাম্য',
        'understanding_mental_health': 'মানসিক স্বাস্থ্য বোঝা',
        'relaxation_mindfulness': 'শিথিলতা ও মাইন্ডফুলনেস',
        'self_care_tools': 'স্ব-যত্নের সরঞ্জাম',
        'learn_signs_symptoms': 'লক্ষণ, উপসর্গ এবং মোকাবেলার কৌশল সম্পর্কে জানুন।',
        'anxiety_types_symptoms': 'উদ্বেগের ধরন, উপসর্গ এবং ব্যবস্থাপনা কৌশল সম্পর্কে জানুন।',
        'stress_types_effects': 'চাপের ধরন, প্রভাব এবং স্বাস্থ্যকর মোকাবেলার পদ্ধতি সম্পর্কে জানুন।',
        'simple_technique_mood': 'ইতিবাচক কার্যকলাপ নির্ধারণ করে মুড উন্নত করার একটি সহজ কৌশল।',
        'guided_breathing_calm': 'আপনার স্নায়ুতন্ত্রকে শান্ত করার জন্য নির্দেশিত শ্বাস।',
        'express_thoughts_track': 'চিন্তাভাবনা প্রকাশ করুন এবং আপনার মুড ট্র্যাক করুন।',
        'ten_minute_guided': '১০-মিনিটের নির্দেশিত মাইন্ডফুলনেস সেশন।',
        'soothing_environment': 'শান্ত শব্দের সাথে প্রশান্তিদায়ক পরিবেশ।',
        
        // Privacy Policy Content
        'privacy_policy': 'গোপনীয়তা নীতি',
        'terms_of_service': 'সেবার শর্তাবলী',
        'data_collection': 'ডেটা সংগ্রহ',
        'data_usage': 'ডেটা ব্যবহার',
        'data_sharing': 'ডেটা ভাগাভাগি',
        'data_retention': 'ডেটা ধরে রাখা',
        'your_rights': 'আপনার অধিকার',
        'contact_us': 'আমাদের সাথে যোগাযোগ করুন',
        'privacy_settings': 'গোপনীয়তা সেটিংস',
        'manage_data': 'আমার ডেটা পরিচালনা করুন',
        'download_data': 'আমার ডেটা ডাউনলোড করুন',
        'delete_account': 'অ্যাকাউন্ট মুছুন',
        'data_portability': 'ডেটা বহনযোগ্যতা',
        'cookie_settings': 'কুকি সেটিংস',
        'data_consent_required': 'ডেটা সম্মতি প্রয়োজন',
        'before_starting_assessment': 'আপনার মূল্যায়ন শুরু করার আগে, দয়া করে ডেটা প্রক্রিয়াকরণের জন্য আপনার সম্মতি নিশ্চিত করুন:',
        'consent_storage_processing': 'আমি আমার মূল্যায়ন প্রতিক্রিয়াগুলির সংরক্ষণ এবং প্রক্রিয়াকরণের জন্য সম্মতি দিচ্ছি যেমনটি',
        'not_diagnosis': 'এটি একটি নির্ণয় নয়। আনুষ্ঠানিক মূল্যায়নের জন্য দয়া করে একজন স্বাস্থ্যসেবা পেশাদারের সাথে পরামর্শ করুন।',
        'your_privacy_matters': 'আপনার গোপনীয়তা গুরুত্বপূর্ণ',
        'dpdp_act_compliant': 'DPDP আইন ২০২৩ সম্মত',
        'privacy_commitment': 'চেtanā ভারতের ডিজিটাল ব্যক্তিগত ডেটা সুরক্ষা আইন (DPDP) ২০২ৃ এর সাথে সম্মতিতে আপনার ব্যক্তিগত স্বাস্থ্য তথ্য রক্ষা করতে প্রতিশ্রুতিবদ্ধ।',
        'what_data_we_collect': 'আমরা কী ডেটা সংগ্রহ করি',
        'assessment_scores_desc': 'PHQ-9, GAD-7, এবং PSS-10 প্রতিক্রিয়া এবং গণনাকৃত স্কোর',
        'mood_logs_desc': 'দৈনিক মুড রেটিং এবং জার্নাল এন্ট্রি',
        'account_information_desc': 'ইমেইল ঠিকানা, নাম, এবং জন্ম তারিখ (যদি নিবন্ধিত)',
        'usage_data_desc': 'ব্যবহারকারীর অভিজ্ঞতা উন্নত করার জন্য অ্যাপ ইন্টারঅ্যাকশন প্যাটার্ন',
        'where_data_stored': 'আপনার ডেটা কোথায় সংরক্ষিত',
        'data_storage_desc': 'DPDP আইনের অধীনে ডেটা স্থানীয়করণের প্রয়োজনীয়তা মেনে চলতে সমস্ত ডেটা ভারতের (মুম্বাই অঞ্চল) মধ্যে এনক্রিপ্টেড ডেটাবেসে নিরাপদে সংরক্ষিত।',
        'who_can_access_data': 'কে আপনার ডেটা অ্যাক্সেস করতে পারে',
        'you_full_access': 'আপনি: আপনার ডেটা দেখা, রপ্তানি এবং মুছে ফেলার সম্পূর্ণ অ্যাক্সেস',
        'licensed_clinicians': 'লাইসেন্সপ্রাপ্ত চিকিৎসক: শুধুমাত্র চিকিৎসার উদ্দেশ্যে আপনার স্পষ্ট সম্মতিতে',
        'admin_anonymized': 'অ্যাডমিন: সিস্টেম রক্ষণাবেক্ষণ এবং উন্নতির জন্য বেনামী ডেটা',
        'no_third_parties': 'কোনো তৃতীয় পক্ষ নেই: আমরা কখনো আপনার ব্যক্তিগত স্বাস্থ্য ডেটা বিক্রি বা ভাগ করি না',
        
        // AI Response Templates
        'ai_response_1': 'শেয়ার করার জন্য ধন্যবাদ। এটি আপনাকে কেমন অনুভব করায়?',
        'ai_response_2': 'আমি বুঝতে পারছি। আপনার মনে কী আছে সে সম্পর্কে আরও বলতে পারেন?',
        'ai_response_3': 'এটি চ্যালেঞ্জিং মনে হচ্ছে। আমি শোনার জন্য এখানে আছি।',
        'ai_response_4': 'এ বিষয়ে খোলামেলা কথা বলতে সাহস লাগে। এ নিয়ে আপনার কী ভাবনা?',
        'ai_response_5': 'আমি আপনার কথা শুনছি। আসুন সেই অনুভূতিটি আরও একটু অন্বেষণ করি।',
        
        // Common Actions
        'save': 'সংরক্ষণ',
        'edit': 'সম্পাদনা',
        'delete': 'মুছুন',
        'confirm': 'নিশ্চিত করুন',
        'yes': 'হ্যাঁ',
        'no': 'না',
        'ok': 'ঠিক আছে',
        'loading': 'লোড হচ্ছে...',
        'error': 'ত্রুটি',
        'success': 'সফল',
        'warning': 'সতর্কতা',
        'info': 'তথ্য',
        'close': 'বন্ধ করুন',
        'cancel': 'বাতিল',
        'continue': 'চালিয়ে যান'
    },
    
    te: {
        // Login & Registration
        'awakening_minds': 'మనస్సులను మేల్కొలపడం, శ్రేయస్సును పెంపొందించడం',
        'login': 'లాగిన్',
        'email_username': 'ఇమెయిల్ / వాడుకరి పేరు',
        'password': 'పాస్వర్డ్',
        'create_account': 'ఖాతా తయారు చేయండి',
        'dont_have_account': 'ఖాతా లేదా?',
        'signup': 'సైన్ అప్',
        'continue_as_guest': 'అతిథిగా కొనసాగించండి',
        'back_to_login': 'లాగిన్కు తిరిగి వెళ్ళండి',
        'full_name': 'ముందు పేరు',
        'date_of_birth': 'జన్మ తేదీ',
        'email': 'ఇమెయిల్ చిరునామా',
        'create_your_account': 'మీ ఖాతాను తయారు చేయండి',
        
        // Dashboard & Navigation
        'welcome': 'స్వాగతం',
        'demo_ai_therapist': 'డెమో AI థెరపిస్ట్ చాట్',
        'ai_therapist': 'AI థెరపిస్ట్',
        'self_assessment': 'స్వీయ-అంచనా',
        'find_your_therapist': 'మీ థెరపిస్ట్ను కనుగొనండి',
        'community_forum': 'కమ్యూనిటీ ఫోరమ్',
        'my_progress': 'నా పురోగతి డాష్బోర్డ్',
        'wellness_resources': 'వెల్నెస్ వనరులు',
        'profile_settings': 'ప్రొఫైల్ మరియు సెట్టింగ్స్',
        'chat_with_ai': 'AI థెరపిస్ట్తో చాట్ చేయండి',
        'take_assessment': 'స్వీయ-అంచనా తీసుకోండి',
        'book_appointment': 'అపాయింట్మెంట్ బుక్ చేయండి',
        'my_progress_dashboard': 'నా పురోగతి డాష్బోర్డ్',
        
        // Chat Interface
        'type_message': 'మీ సందేశాన్ని టైప్ చేయండి...',
        'type_message_50_limit': 'మీ సందేశాన్ని టైప్ చేయండి (50 రోజుల మితి)...',
        'voice_to_text': 'వాయిస్ టు టెక్స్ట్',
        'send': 'పంపండి',
        'i_feel_anxious': 'నాకు ఆత్రుత అనిపిస్తోంది',
        'cant_sleep': 'నాకు నిద్ర రావడం లేదు',
        'feeling_overwhelmed': 'నేను అధికంగా అనిపిస్తున్నాను',
        'bad_day': 'నాకు కెట్ట దినం ఉంది',
        'talk_stress': 'ఒత్తిడి గురించి మాట్లాడాలి',
        
        // Assessment Questions - PHQ-9
        'phq9_q0': 'కార్యాలు చేయడంలో కమ్మి ఆసక్తి లేదా ఆనందం అనుభవించడం।',
        'phq9_q1': 'నిరాశ, దుఃఖం, లేదా నిరాశాజనకంగా అనుభవించడం।',
        'phq9_q2': 'నిద్రలేకపోవడంలో లేదా నిద్రలో ఉండడంలో సమస్య, లేదా ఎక్కువ నిద్రపోవడం।',
        'phq9_q3': 'క్లాంతి అనుభవించడం లేదా కమ్మి శక్తి ఉండడం।',
        'phq9_q4': 'తినడంలో ఇష్టం లేకపోవడం లేదా ఎక్కువ తినడం।',
        'phq9_q5': 'నిమ్మ గురించి కెట్టగా అనిపించడం — లేదా మీరు విఫలమైయారు లేదా మీ కుటుంబానిని నిరాశపరచారు అని అనిపించడం।',
        'phq9_q6': 'వార్తాపత్రిక చదవడం లేదా టెలివిషన్ చూడడం వంటి విషయాలపై ధ్యానం కేంద్రీకరించడంలో సమస్య।',
        'phq9_q7': 'ఇతరులు గమనించగలగా నడవడం లేదా మాట్లాడడం? లేదా విపరీతంగా — ఎంత అస్వస్థత లేదా అశాంతతవం ఉండి మీరు సాధారణం కన్నా ఎక్కువ తిరుగుతున్నారు।',
        'phq9_q8': 'మీరు చనిపోయిన మేలు ఉండాలి లేదా ఏదైనా విధంగా నిమ్మను నోపపెట్టడం వంటి ఆలోచనలు।',
        
        // Assessment Questions - GAD-7
        'gad7_q0': 'నర్వస్నెస్, ఆత్రుత, లేదా అశాంతత అనుభవించడం।',
        'gad7_q1': 'ఆత్రుతను ఆపడం లేదా నియంత్రించడం కూడకపోవడం।',
        'gad7_q2': 'వేరే వేరే విషయాల గురించి ఎక్కువ ఆత్రుత పడడం।',
        'gad7_q3': 'శాంతిగా ఉండడంలో సమస్య।',
        'gad7_q4': 'ఎంత అశాంతతవం ఉండి శాంతంగా కూర్చోవడం కష్టం।',
        'gad7_q5': 'సహజంగా కోపం లేదా చిడికి అవ్వడం।',
        'gad7_q6': 'ఏదైనా భయానకం జరగుతుంది అని భయపడడం।',
        
        // Assessment Questions - PSS-10
        'pss10_q0': 'గత నెలలో, మీరు ఎన్ని సార్లు అప్రత్యాశిత సంభవాల వల్ల కలతైయారు?',
        'pss10_q1': 'గత నెలలో, మీరు ఎన్ని సార్లు మీ జీవితంలోని ముఖ్యమైన విషయాలను నియంత్రించడంలో అసమర్థుడిగా అనిపించారు?',
        'pss10_q2': 'గత నెలలో, మీరు ఎన్ని సార్లు ఒత్తిడిగా మరియు నెరుకునిలా అనుభవించారు?',
        'pss10_q3': 'గత నెలలో, మీరు ఎన్ని సార్లు విజయవంతంగా కలతకారీ సమస్యలను నిర్వహించారు?',
        'pss10_q4': 'గత నెలలో, మీరు ఎన్ని సార్లు మీరు జీవితంలో మార్పులతో ప్రభావవంతంగా నిపట్టున్నారు అని అనిపించారు?',
        'pss10_q5': 'గత నెలలో, మీరు ఎన్ని సార్లు మీరు మీ వ్యక్తిగత సమస్యలను నిర్వహించగలరు అని విశ్వాసం అనిపించారు?',
        'pss10_q6': 'గత నెలలో, మీరు ఎన్ని సార్లు విషయాలు మీ ఇష్టం ప్రకారం నడుస్తున్నాయి అనిపించారు?',
        'pss10_q7': 'గత నెలలో, మీరు ఎన్ని సార్లు మీరు చేయవలసిన అన్ని కార్యాలను నిర్వహించలేకపోవడం కనుగొన్నారు?',
        'pss10_q8': 'గత నెలలో, మీరు ఎన్ని సార్లు మీ కోపాన్ని నియంత్రించడంలో సమర్థుడిగా ఉన్నారు?',
        'pss10_q9': 'గత నెలలో, మీరు ఎన్ని సార్లు కష్టాలు ఎంత పెరుగుతున్నాయి మీరు వాటిని మీరించలేకపోవడం అనిపించారు?',
        
        // Assessment Titles
        'depression_phq9': 'నిరాశ (PHQ-9)',
        'anxiety_gad7': 'ఆత్రుత (GAD-7)',
        'stress_pss10': 'ఒత్తిడి (PSS-10)',
        
        // Assessment Options
        'not_at_all': 'ఎందుకు కాదు',
        'several_days': 'కొన్ని రోజులు',
        'more_than_half': 'అర్ధం కన్నా ఎక్కువ రోజులు',
        'nearly_every_day': 'దాదాపు ప్రతి రోజు',
        'never': 'ఎప్పుడూ కాదు',
        'almost_never': 'దాదాపు ఎప్పుడూ కాదు',
        'sometimes': 'కొన్నిసారి',
        'fairly_often': 'మోస్తారుగా',
        'very_often': 'చాలా తరచుగా',
        
        // Wellness Resources
        'understanding_depression': 'నిరాశను అర్థం చేసుకోవడం',
        'understanding_anxiety': 'ఆత్రుతను అర్థం చేసుకోవడం',
        'understanding_stress': 'ఒత్తిడిని అర్థం చేసుకోవడం',
        'behavioral_activation': 'వ్యవహార సక్రియత',
        'breathing_exercise': 'శ్వాస వ్యాయామం',
        'writing_journal': 'వ్రాసే జర్నల్',
        'mindfulness_meditation': 'మైండ్‌ఫుల్‌నెస్ ధ్యానం',
        'virtual_relax_space': 'వర్చుఅల్ రిలాక్స్ స్పేస్',
        
        // Progress & Assessment
        'daily_mood_tracker': 'రోజువారీ మూడ్ ట్రాకర్',
        'how_feeling_today': 'ఈరోజు మీరు ఎలా అనిపిస్తున్నారు?',
        'save_mood': 'ఈరోజు మూడ్ సేవ్ చేయండి',
        'mood_trend': '7-రోజుల మూడ్ ట్రెండ్',
        'average': 'సరాసరి:',
        'trend': 'ప్రవృత్తి:',
        'export_data': 'నా డేటాను ఎక్స్‌పోర్ట్ చేయండి',
        'milestones': 'మీ మైల్‌స్టోన్లు',
        'assessment_history': 'అంచనా చరిత్ర',
        'view_progress': 'నా పురోగతిని చూడండి',
        'see_results': 'నా ఫలితాలను చూడండి',
        'your_results': 'మీ ఫలితాలు',
        'start_assessment': 'అంచనా ప్రారంభించండి',
        'question_of': 'ప్రశ్న {current} లో {total}',
        'previous': 'ముందుది',
        'next': 'తరువాత',
        
        // Forum & Community
        'join': 'చేరండి',
        'joined': 'చేరారు',
        'members': 'సభ్యులు',
        'create_post': 'పోస్ట్ తయారు చేయండి',
        'post_title': 'పోస్ట్ శీర్షిక',
        'post_content': 'పోస్ట్ విషయం',
        'submit_post': 'పోస్ట్ సబ్మిట్ చేయండి',
        'comments': 'కమెంట్లు',
        'reply': 'సమాధానం',
        'upvote': 'అప్‌వోట్',
        'downvote': 'డౌన్‌వోట్',
        
        // Settings & Profile
        'settings': 'సెట్టింగ్స్',
        'theme': 'థీమ్',
        'dark': 'డార్క్',
        'light': 'లైట్',
        'notifications': 'నోటిఫికేషన్లు',
        'language': 'భాష',
        'data_privacy': 'డేటా మరియు గోప్యత',
        'logout': 'లాగౌట్',
        'manage': 'నిర్వహించండి',
        'on': 'ఆన్',
        'off': 'ఆఫ్',
        
        // Emergency & Support
        'emergency_support': 'ఎమర్జెన్సీ సపోర్ట్',
        'call_emergency': 'ఎమర్జెన్సీ సేవలకు కాల్ చేయండి',
        'crisis_helpline': 'క్రైసిస్ హెల్ప్‌లైన్',
        'need_immediate_help': 'తత్కాల సహాయం అవసరమా?',
        
        // Grant Permission Screen
        'grant_permissions': 'అనుమతులు ఇవ్వండి',
        'microphone_permission': 'మైక్రోఫోన్ అనుమతి',
        'microphone_permission_desc': 'వాయిస్ చాట్ కోసం మైక్రోఫోన్ అక్సెస్ అనుమతి ఇవ్వండి',
        'camera_permission': 'క్యామెరా అనుమతి',
        'camera_permission_desc': 'వీడియో కాల్స్ కోసం క్యామెరా అక్సెస్ అనుమతి ఇవ్వండి',
        'notification_permission': 'నోటిఫికేషన్ అనుమతి',
        'notification_permission_desc': 'రిమైండర్లు మరియు అప్డేట్ల కోసం నోటిఫికేషన్ల అనుమతి ఇవ్వండి',
        'location_permission': 'స్థానం అనుమతి',
        'location_permission_desc': 'సమీపద థెరాపిస్ట్లను కనుగొనడానికి స్థాన అక్సెస్ అనుమతి ఇవ్వండి',
        'allow': 'అనుమతించండి',
        'deny': 'తిరస్కరించండి',
        'skip_for_now': 'ఇప్పుడు విడిచేయండి',
        'permissions_required': 'అనుమతులు అవసరం',
        'permissions_help_text': 'ఈ అనుమతులు మీకు ఉత్తమ అనుభవం అందించడానికి సహాయపడతాయి',
        
        // Demo AI Therapist Chat
        'demo_chat_title': 'డెమో AI థెరాపిస్ట్ చాట్',
        'demo_chat_subtitle': 'ఖాతా తయారు చేయడానికి ముందు మా AI థెరాపిస్ట్ అనుభవించండి',
        'demo_chat_disclaimer': 'ఇది డెమో. పూర్తి వైశిష్ట్యాల కోసం, దయచేసి ఖాతా తయారు చేయండి.',
        'demo_limit_reached': 'డెమో మర్యాద పూర్తి అయ్యింది. కొనసాగించడానికి దయచేసి ఖాతా తయారు చేయండి.',
        'try_demo_chat': 'డెమో చాట్ ప్రయత్నించండి',
        'demo_conversation_starter': 'నమస్కారం! నేను మీ AI థెరాపిస్ట్. ఈరోజు మీరు ఎలా అనుభవిస్తున్నారు?',
        'welcome_demo_chat': 'డెమో చాట్కు స్వాగతం.',
        'welcome_back': 'తిరిగి వచ్చినందుకు స్వాగతం।',
        
        // AI Response Templates
        'ai_response_1': 'పంచుకున్నందుకు ధన్యవాదాలు. ఇది మీకు ఎలా అనిపిస్తుంది?',
        'ai_response_2': 'నేను అర్థం చేసుకున్నాను. మీ మనసులో ఏమి ఉందో మరింత చెప్పగలరా?',
        'ai_response_3': 'ఇది సవాలుగా అనిపిస్తుంది. నేను వినడానికి ఇక్కడ ఉన్నాను.',
        'ai_response_4': 'దాని గురించి తెరిచిగా మాట్లాడడానికి ధైర్యం కావాలి. దాని గురించి మీ ఆలోచనలు ఏమిటి?',
        'ai_response_5': 'నేను మీ మాట వింటున్నాను. ఆ అనుభూతిని మరికొంచెం అన్వేషిద్దాం.',
        
        // Common Actions
        'save': 'సేవ్ చేయండి',
        'edit': 'ఎడిట్ చేయండి',
        'delete': 'డిలీట్ చేయండి',
        'confirm': 'నిర్ధారించండి',
        'yes': 'అవును',
        'no': 'కాదు',
        'ok': 'సరే',
        'loading': 'లోడ్ అవుతోంది...',
        'error': 'తప్పిదం',
        'success': 'విజయం',
        'warning': 'మున్నపు',
        'info': 'వివరాలు',
        'close': 'మూసేయండి',
        'cancel': 'రద్దు చేయండి',
        'continue': 'కొనసాగించండి'
    },
    
    mr: {
        // Login & Registration
        'awakening_minds': 'मन जागृत करणे, कल्याण वाढवणे',
        'login': 'लॉगिन',
        'email_username': 'ईमेल / वापरकर्त्याचे नाव',
        'password': 'पासवर्ड',
        'create_account': 'खाते तयार करा',
        'dont_have_account': 'खाते नाही?',
        'signup': 'साइन अप',
        'continue_as_guest': 'पाहुणे म्हणून सुरू ठेवा',
        'back_to_login': 'लॉगिनवर परत जा',
        'full_name': 'पूर्ण नाव',
        'date_of_birth': 'जन्म तारीख',
        'email': 'ईमेल पत्ता',
        'create_your_account': 'तुमचे खाते तयार करा',
        
        // Dashboard & Navigation
        'welcome': 'स्वागत',
        'demo_ai_therapist': 'डेमो AI थेरपिस्ट चॅट',
        'ai_therapist': 'AI थेरपिस्ट',
        'self_assessment': 'स्व-मूल्यांकन',
        'find_your_therapist': 'तुमचा थेरपिस्ट शोधा',
        'community_forum': 'कम्युनिटी फोरम',
        'my_progress': 'माझी प्रगती डॅशबोर्ड',
        'wellness_resources': 'वेलनेस संसाधने',
        'profile_settings': 'प्रोफाइल आणि सेटिंग्ज',
        'chat_with_ai': 'AI थेरपिस्टशी चॅट करा',
        'take_assessment': 'स्व-मूल्यांकन करा',
        'book_appointment': 'अपॉइंटमेंट बुक करा',
        'my_progress_dashboard': 'माझी प्रगती डॅशबोर्ड',
        
        // Chat Interface
        'type_message': 'तुमचा संदेश टाइप करा...',
        'type_message_50_limit': 'तुमचा संदेश टाइप करा (50 दैनिक मर्यादा)...',
        'voice_to_text': 'आवाज ते मजकूर',
        'send': 'पाठवा',
        'i_feel_anxious': 'मला चिंता वाटते',
        'cant_sleep': 'मला झोप येत नाही',
        'feeling_overwhelmed': 'मी असहाय्य वाटतोय',
        'bad_day': 'माझा दिवस वाईट होता',
        'talk_stress': 'तणावाबद्दल बोलूया',
        
        // Assessment Questions - PHQ-9
        'phq9_q0': 'कामांमध्ये कमी रस किंवा आनंद वाटणे।',
        'phq9_q1': 'उदास, निराश, किंवा निराशाजनक वाटणे।',
        'phq9_q2': 'झोप येण्यात किंवा झोपेत राहण्यात अडचण, किंवा जास्त झोपणे।',
        'phq9_q3': 'थकवा वाटणे किंवा कमी शक्ती असणे।',
        'phq9_q4': 'भूक न लागणे किंवा जास्त खाणे।',
        'phq9_q5': 'स्वतःबद्दल वाईट वाटणे — किंवा असे वाटणे की तुम्ही अयशस्वी आहात किंवा तुम्ही तुमच्या किंवा कुटुंबाला निराश केले आहे।',
        'phq9_q6': 'वर्तमानपत्र वाचणे किंवा दूरदर्शन पाहणे यासारख्या गोष्टींवर लक्ष केंद्रीत करण्यात अडचण।',
        'phq9_q7': 'इतक्या हळूवार चालणे किंवा बोलणे की इतर लोकांना लक्षात येऊ शकेल? किंवा उलट — इतके अस्वस्थ किंवा अशांत होणे की तुम्ही नेहमीपेक्षा बरेच जास्त फिरत आहात।',
        'phq9_q8': 'असे विचार की तुम्ही मेलो तर बरे होईल किंवा कोणत्याही प्रकारे स्वतःला इजा पोहोचवण्याचे विचार।',
        
        // Assessment Questions - GAD-7
        'gad7_q0': 'घाबरणे, चिंता, किंवा अस्वस्थता वाटणे।',
        'gad7_q1': 'चिंता थांबवणे किंवा नियंत्रित करणे शक्य नसणे।',
        'gad7_q2': 'वेगवेगळ्या गोष्टींबद्दल जास्त चिंता करणे।',
        'gad7_q3': 'आराम करण्यात अडचण।',
        'gad7_q4': 'इतके अस्वस्थ होणे की शांत बसणे कठीण होणे।',
        'gad7_q5': 'सहजपणे रागावणे किंवा चिडचिडाहट होणे।',
        'gad7_q6': 'भीती वाटणे जणू काहीतरी भयानक घडणार आहे।',
        
        // Assessment Questions - PSS-10
        'pss10_q0': 'मागील महिन्यात, तुम्ही किती वेळा अनपेक्षित गोष्टींमुळे अस्वस्थ झालात?',
        'pss10_q1': 'मागील महिन्यात, तुम्ही किती वेळा असे वाटले की तुम्ही तुमच्या जीवनातील महत्त्वाच्या गोष्टी नियंत्रित करण्यात असमर्थ आहात?',
        'pss10_q2': 'मागील महिन्यात, तुम्ही किती वेळा तणावग्रस्त आणि दबावाखाली वाटले?',
        'pss10_q3': 'मागील महिन्यात, तुम्ही किती वेळा यशस्वीपणे अस्वस्थ करणाऱ्या समस्यांशी निपटलात?',
        'pss10_q4': 'मागील महिन्यात, तुम्ही किती वेळा असे वाटले की तुम्ही जीवनातील बदलांशी प्रभावीपणे निपटत आहात?',
        'pss10_q5': 'मागील महिन्यात, तुम्ही किती वेळा विश्वास वाटला की तुम्ही तुमच्या व्यक्तिगत समस्या हाताळू शकता?',
        'pss10_q6': 'मागील महिन्यात, तुम्ही किती वेळा असे वाटले की गोष्टी तुमच्या इच्छेप्रमाणे चालत आहेत?',
        'pss10_q7': 'मागील महिन्यात, तुम्ही किती वेळा असे आढळले की तुम्ही त्या सर्व गोष्टींशी निपटू शकत नाही ज्या तुम्हाला कराव्या लागतात?',
        'pss10_q8': 'मागील महिन्यात, तुम्ही किती वेळा तुमचा राग नियंत्रित करण्यात समर्थ राहिलात?',
        'pss10_q9': 'मागील महिन्यात, तुम्ही किती वेळा असे वाटले की अडचणी इतक्या वाढत आहेत की तुम्ही त्यांवर मात करू शकत नाही?',
        
        // Assessment Titles
        'depression_phq9': 'नैराश्य (PHQ-9)',
        'anxiety_gad7': 'चिंता (GAD-7)',
        'stress_pss10': 'तणाव (PSS-10)',
        
        // Assessment Options
        'not_at_all': 'अजिबात नाही',
        'several_days': 'काही दिवस',
        'more_than_half': 'अर्ध्यापेक्षा जास्त दिवस',
        'nearly_every_day': 'जवळजवळ दररोज',
        'never': 'कधी नाही',
        'almost_never': 'जवळजवळ कधी नाही',
        'sometimes': 'कधी कधी',
        'fairly_often': 'बहुतेक वेळा',
        'very_often': 'खूप वेळा',
        
        // Wellness Resources
        'understanding_depression': 'नैराश्य समजून घेणे',
        'understanding_anxiety': 'चिंता समजून घेणे',
        'understanding_stress': 'तणाव समजून घेणे',
        'behavioral_activation': 'वर्तनूक सक्रियता',
        'breathing_exercise': 'श्वासोच्छ्वासाचा व्यायाम',
        'writing_journal': 'लेखन जर्नल',
        'mindfulness_meditation': 'माइंडफुलनेस ध्यान',
        'virtual_relax_space': 'व्हर्चुअल रिलॅक्स स्पेस',
        
        // Progress & Assessment
        'daily_mood_tracker': 'दैनिक मूड ट्रॅकर',
        'how_feeling_today': 'आज तुम्ही कसे वाटत आहात?',
        'save_mood': 'आजचा मूड सेव्ह करा',
        'mood_trend': '7-दिवसांचा मूड ट्रेंड',
        'average': 'सरासरी:',
        'trend': 'प्रवृत्ती:',
        'export_data': 'माझा डेटा एक्सपोर्ट करा',
        'milestones': 'तुमचे माइलस्टोन',
        'assessment_history': 'मूल्यांकन इतिहास',
        'view_progress': 'माझी प्रगती पहा',
        'see_results': 'माझे परिणाम पहा',
        'your_results': 'तुमचे परिणाम',
        'start_assessment': 'मूल्यांकन सुरू करा',
        'question_of': 'प्रश्न {current} चा {total}',
        'previous': 'मागील',
        'next': 'पुढील',
        
        // Forum & Community
        'join': 'सामील व्हा',
        'joined': 'सामील झालो',
        'members': 'सदस्य',
        'create_post': 'पोस्ट तयार करा',
        'post_title': 'पोस्ट शीर्षक',
        'post_content': 'पोस्ट आशय',
        'submit_post': 'पोस्ट सबमिट करा',
        'comments': 'टिप्पण्या',
        'reply': 'उत्तर',
        'upvote': 'अपवोट',
        'downvote': 'डाउनवोट',
        
        // Settings & Profile
        'settings': 'सेटिंग्ज',
        'theme': 'थीम',
        'dark': 'डार्क',
        'light': 'लाइट',
        'notifications': 'नोटिफिकेशन',
        'language': 'भाषा',
        'data_privacy': 'डेटा आणि गोपनीयता',
        'logout': 'लॉगआउट',
        'manage': 'व्यवस्थापन',
        'on': 'चालू',
        'off': 'बंद',
        
        // Emergency & Support
        'emergency_support': 'आपत्कालीन सहाय्य',
        'call_emergency': 'आपत्कालीन सेवांना कॉल करा',
        'crisis_helpline': 'क्राइसिस हेल्पलाइन',
        'need_immediate_help': 'तात्काळ मदत हवी?',
        
        // Grant Permission Screen
        'grant_permissions': 'परवानगी द्या',
        'microphone_permission': 'मायक्रोफोन परवानगी',
        'microphone_permission_desc': 'व्हॉइस चॅटसाठी मायक्रोफोन अक्सेसला परवानगी द्या',
        'camera_permission': 'कॅमेरा परवानगी',
        'camera_permission_desc': 'व्हिडिओ कॉलसाठी कॅमेरा अक्सेसला परवानगी द्या',
        'notification_permission': 'नोटिफिकेशन परवानगी',
        'notification_permission_desc': 'रिमाइंडर आणि अपडेट्ससाठी नोटिफिकेशनला परवानगी द्या',
        'location_permission': 'स्थान परवानगी',
        'location_permission_desc': 'जवळचे थेरपिस्ट शोधण्यासाठी स्थान अक्सेसला परवानगी द्या',
        'allow': 'परवानगी द्या',
        'deny': 'नाकारा',
        'skip_for_now': 'आता सोडा',
        'permissions_required': 'परवानग्या आवश्यक',
        'permissions_help_text': 'या परवानग्या तुम्हाला उत्तम अनुभव देण्यात मदत करतात',
        
        // Demo AI Therapist Chat
        'demo_chat_title': 'डेमो AI थेरपिस्ट चॅट',
        'demo_chat_subtitle': 'खाते तयार करण्यापूर्वी आमच्या AI थेरपिस्टचा अनुभव घ्या',
        'demo_chat_disclaimer': 'हे एक डेमो आहे. संपूर्ण वैशिष्ट्यांसाठी, कृपया खाते तयार करा.',
        'demo_limit_reached': 'डेमो मर्यादा संपली. पुढे चालू ठेवण्यासाठी कृपया खाते तयार करा.',
        'try_demo_chat': 'डेमो चॅट वापरा',
        'demo_conversation_starter': 'नमस्कार! मी तुमचा AI थेरपिस्ट आहे. आज तुम्ही कसे वाटत आहात?',
        'welcome_demo_chat': 'डेमो चॅटमध्ये आपले स्वागत.',
        'welcome_back': 'परत आल्याबद्दल स्वागत.',
        
        // AI Response Templates
        'ai_response_1': 'शेअर केल्याबद्दल धन्यवाद. यामुळे तुम्हाला कसे वाटते?',
        'ai_response_2': 'मी समजतो. तुमच्या मनात काय आहे त्याबद्दल अधिक सांगू शकाल का?',
        'ai_response_3': 'हे आव्हानात्मक वाटते. मी ऐकण्यासाठी इथे आहे.',
        'ai_response_4': 'त्याबद्दल उघडपणे बोलण्यासाठी धैर्य लागते. त्याबद्दल तुमचे काय विचार आहेत?',
        'ai_response_5': 'मी तुमचे ऐकतो. चला त्या भावनेचा आणखी थोडा शोध घेऊया.',
        
        // Common Actions
        'save': 'जतन करा',
        'edit': 'संपादन',
        'delete': 'हटवा',
        'confirm': 'पुष्टी करा',
        'yes': 'होय',
        'no': 'नाही',
        'ok': 'ठीक आहे',
        'loading': 'लोड होत आहे...',
        'error': 'त्रुटी',
        'success': 'यश',
        'warning': 'चेतावणी',
        'info': 'माहिती',
        'close': 'बंद करा',
        'cancel': 'रद्द करा',
        'continue': 'सुरू ठेवा'
    },
    
    ta: {
        // Login & Registration
        'awakening_minds': 'மனங்களை விழிப்படுத்துதல், நல்வாழ்வை வளர்த்தல்',
        'login': 'உள்நுழைவு',
        'email_username': 'மின்னஞ்சல் / பயனர் பெயர்',
        'password': 'கடவுச்சொல்',
        'create_account': 'கணக்கை தயாரிக்கவும்',
        'dont_have_account': 'கணக்கு இல்லையா?',
        'signup': 'சைன் அப்',
        'continue_as_guest': 'விருந்தினராக தொடரவும்',
        'back_to_login': 'உள்நுழைவுக்கு திரும்பவும்',
        'full_name': 'முழு பெயர்',
        'date_of_birth': 'பிறந்த தேதி',
        'email': 'மின்னஞ்சல் முகவரி',
        'create_your_account': 'உங்கள் கணக்கை தயாரிக்கவும்',
        
        // Dashboard & Navigation
        'welcome': 'வரவேற்கிறோம்',
        'demo_ai_therapist': 'டெமோ AI சிகிச்சையாளர் அரட்டை',
        'ai_therapist': 'AI சிகிச்சையாளர்',
        'self_assessment': 'சுய மதிப்பீடு',
        'find_your_therapist': 'உங்கள் சிகிச்சையாளரை கண்டுபிடிக்கவும்',
        'community_forum': 'சமூக மன்றம்',
        'my_progress': 'எனது முன்னேற்ற டாஷ்போர்டு',
        'wellness_resources': 'நல்வாழ்வு வளங்கள்',
        'profile_settings': 'சுவடு மற்றும் அமைப்புகள்',
        'chat_with_ai': 'AI சிகிச்சையாளருடன் அரட்டை',
        'take_assessment': 'சுய மதிப்பீடு செய்யுங்கள்',
        'book_appointment': 'சந்திப்பு முன்பதிவு',
        'my_progress_dashboard': 'எனது முன்னேற்ற டாஷ்போர்டு',
        
        // Chat Interface
        'type_message': 'உங்கள் சந்தேசத்தை டைப் செய்யவும்...',
        'type_message_50_limit': 'உங்கள் சந்தேசத்தை டைப் செய்யவும் (50 நாளைத்த வரையறை)...',
        'voice_to_text': 'குரல் இலிருந்து உரைக்கு',
        'send': 'அனுப்பவும்',
        'i_feel_anxious': 'எனக்கு கவலை ஆகிறது',
        'cant_sleep': 'எனால் தூங்க முடியவில்லை',
        'feeling_overwhelmed': 'நான் அதிகமாக அனுபவிக்கிறேன்',
        'bad_day': 'எனக்கு கெட்ட நாள் இருந்தது',
        'talk_stress': 'மன அழுத்தத்தை பற்றி பேசலாமா?',
        
        // Assessment Questions - PHQ-9
        'phq9_q0': 'வேலைகளில் குறைவான ஆர்வம் அல்லது மகிழ்ச்சி அனுபவிக்காமை।',
        'phq9_q1': 'விரக்தி, மனச்சோர்வு, அல்லது நம்பிக்கைஇல்லாமை அனுபவிக்காமை।',
        'phq9_q2': 'தூங்குவதில் அல்லது தூங்கிக் கொண்டிருக்குவதில் சமஸ்யை, அல்லது அதிகமாக தூங்குவது।',
        'phq9_q3': 'செயலற்றதாக அனுபவிக்காமை அல்லது குறைவான சக்தி இருக்காமை।',
        'phq9_q4': 'பசியின்மை அல்லது அதிகமாக சாப்பிடுவது।',
        'phq9_q5': 'தன்னைப் பற்றி கெட்டதாக அனுபவிக்காமை — அல்லது தான் தோல்வியடைந்தவன் அல்லது தன் குடும்பத்தை நிராசைப்படுத்திவிட்டதாக அனுபவிக்காமை।',
        'phq9_q6': 'செய்தித்தாள் வாசிக்காமை அல்லது தெலிக்காட்சி பார்க்காமை போன்ற விஷயங்களில் கவனம் செலுத்துவதில் சமஸ்யை।',
        'phq9_q7': 'இதர மக்கள் கவனிக்கக்கூடிய அளவிற்கு மெதுவாக நடக்காமை அல்லது பேசாமை? அல்லது இதற்கு எதிராக — மிகவும் அசைவின்மையாக அல்லது அசைவின்மையாக இருக்காமை, அதனால் நீங்கள் சாதாரணத்தைவிட அதிகமாக அலைந்து கொண்டிருக்கிறீர்கள்।',
        'phq9_q8': 'நீங்கள் இறந்துவிட்டால் நல்லதாக இருக்கும் அல்லது ஏதாவது விதத்தில் தன்னை நோவப்படுத்துவது பற்றிய எண்ணங்கள்।',
        
        // Assessment Questions - GAD-7
        'gad7_q0': 'நரம்பு, கவலை, அல்லது அசைவின்மை அனுபவிக்காமை।',
        'gad7_q1': 'கவலையை நிறுத்தவோ அல்லது கட்டுப்படுத்தவோ இயலாமை।',
        'gad7_q2': 'வேறு வேறு விஷயங்களைப் பற்றி அதிகமாக கவலைப்படுவது।',
        'gad7_q3': 'அமைதியாக இருக்குவதில் சமஸ்யை।',
        'gad7_q4': 'மிகவும் அசைவின்மையாக இருக்காமை, அதனால் அமைதியாக உகாருவது கடினமாக இருக்காமை।',
        'gad7_q5': 'எளிதில் கோபமடைவதோ அல்லது சிட்டமடைவதோ।',
        'gad7_q6': 'ஏதோ பயங்கரமான காரியம் நடக்கப்போகிறது போல பயம் அனுபவிக்காமை।',
        
        // Assessment Questions - PSS-10
        'pss10_q0': 'கடந்த மாதத்தில், நீங்கள் எத்தனை முறை எதிர்பாராத சம்பவங்களால் கலங்கியுள்ளீர்கள்?',
        'pss10_q1': 'கடந்த மாதத்தில், நீங்கள் எத்தனை முறை நீங்கள் உங்கள் வாழ்க்கையில் முக்கியமான விஷயங்களை கட்டுப்படுத்த இயலவில்லை என்று அனுபவித்தீர்கள்?',
        'pss10_q2': 'கடந்த மாதத்தில், நீங்கள் எத்தனை முறை மன அழுத்தத்தில் மற்றும் நெருக்கடியில் அனுபவித்தீர்கள்?',
        'pss10_q3': 'கடந்த மாதத்தில், நீங்கள் எத்தனை முறை வெற்றிகரமாக கலங்கடையுள்ள சமஸ்யைகளை கைாளித்தீர்கள்?',
        'pss10_q4': 'கடந்த மாதத்தில், நீங்கள் எத்தனை முறை நீங்கள் வாழ்க்கையில் நடக்கும் மாற்றங்களை ப்ரபாவகரமாக கைாளிக்கிறீர்கள் என்று அனுபவித்தீர்கள்?',
        'pss10_q5': 'கடந்த மாதத்தில், நீங்கள் எத்தனை முறை நீங்கள் உங்கள் தனிப்பட்ட சமஸ்யைகளை கைாள முடியும் என்று நம்பிக்கை அனுபவித்தீர்கள்?',
        'pss10_q6': 'கடந்த மாதத்தில், நீங்கள் எத்தனை முறை விஷயங்கள் உங்கள் இஷ்டப்படி நடக்கிறது என்று அனுபவித்தீர்கள்?',
        'pss10_q7': 'கடந்த மாதத்தில், நீங்கள் எத்தனை முறை நீங்கள் செய்ய வேண்டிய அனைத்து வேலைகளையும் கைாள முடியவில்லை என்று கண்டுபிடித்தீர்கள்?',
        'pss10_q8': 'கடந்த மாதத்தில், நீங்கள் எத்தனை முறை உங்கள் கோபத்தை கட்டுப்படுத்த முடிந்தது?',
        'pss10_q9': 'கடந்த மாதத்தில், நீங்கள் எத்தனை முறை கடினமான சமஸ்யைகள் இத்தனை அதிகரிக்கிறது நீங்கள் அவற்றை காட்டில் கொண்டுவர முடியவில்லை என்று அனுபவித்தீர்கள்?',
        
        // Assessment Titles
        'depression_phq9': 'மனச்சோர்வு (PHQ-9)',
        'anxiety_gad7': 'கவலை (GAD-7)',
        'stress_pss10': 'மன அழுத்தம் (PSS-10)',
        
        // Assessment Options
        'not_at_all': 'ஒன்றும் இல்லை',
        'several_days': 'கொஞ்ச நாட்கள்',
        'more_than_half': 'பதினைலும் அதிக நாட்கள்',
        'nearly_every_day': 'கிட்டத்தட்ட அனைத்து நாளும்',
        'never': 'எப்போதும் இல்லை',
        'almost_never': 'கிட்டத்தட்ட எப்போதும் இல்லை',
        'sometimes': 'சில வேளைகளில்',
        'fairly_often': 'அடிக்கடி',
        'very_often': 'மிக அடிக்கடி',
        
        // Wellness Resources
        'understanding_depression': 'மனச்சோர்வைப் புரிந்துகொள்ளுதல்',
        'understanding_anxiety': 'கவலையைப் புரிந்துகொள்ளுதல்',
        'understanding_stress': 'மன அழுத்தத்தைப் புரிந்துகொள்ளுதல்',
        'behavioral_activation': 'நடவடிக்கை செயல்பாடு',
        'breathing_exercise': 'மூச்சு பயிற்சி',
        'writing_journal': 'எழுதும் நாளிததாள்',
        'mindfulness_meditation': 'மைண்ட்புல்னெஸ் தியானம்',
        'virtual_relax_space': 'வர்சுஅல் ரிலாக்ஸ் இடம்',
        
        // Progress & Assessment
        'daily_mood_tracker': 'நாளைத்த மனநிலை கண்காணிப்பு',
        'how_feeling_today': 'இன்று நீங்கள் எப்படி அனுபவிக்கிறீர்கள்?',
        'save_mood': 'இன்றைய மனநிலையை சேமிக்கவும்',
        'mood_trend': '7-நாட்கள் மனநிலை ப்ரவர்த்தி',
        'average': 'சராசரி:',
        'trend': 'ப்ரவர்த்தி:',
        'export_data': 'எனது தகவலை ஏற்றுமதி செய்யவும்',
        'milestones': 'உங்கள் மைல்கல்லுகள்',
        'assessment_history': 'மதிப்பீடு வரலாறு',
        'view_progress': 'எனது முன்னேற்றத்தை பார்க்கவும்',
        'see_results': 'எனது முடிவுகளை பார்க்கவும்',
        'your_results': 'உங்கள் முடிவுகள்',
        'start_assessment': 'மதிப்பீடு தொடங்கவும்',
        'question_of': 'கேள்வி {current} இன் {total}',
        'previous': 'முந்தைய',
        'next': 'அடுத்த',
        
        // Forum & Community
        'join': 'சேரவும்',
        'joined': 'சேர்ந்துவிட்டீர்கள்',
        'members': 'உறுப்பினர்கள்',
        'create_post': 'போஸ்ட் தயாரிக்கவும்',
        'post_title': 'போஸ்ட் தலைப்பு',
        'post_content': 'போஸ்ட் உள்ளடக்கம்',
        'submit_post': 'போஸ்ட் சமர்ப்பிக்கவும்',
        'comments': 'கருத்துகள்',
        'reply': 'பதில்',
        'upvote': 'அப்வோட்',
        'downvote': 'டவ்ன்வோட்',
        
        // Settings & Profile
        'settings': 'அமைப்புகள்',
        'theme': 'தீம்',
        'dark': 'இருள்',
        'light': 'வெளிச்சம்',
        'notifications': 'அறிவிப்புகள்',
        'language': 'மொழி',
        'data_privacy': 'தகவல் மற்றும் தனியுரிமை',
        'logout': 'லாக்ஆஉட்',
        'manage': 'நிர்வகிக்கவும்',
        'on': 'ஆன்',
        'off': 'ஆப்',
        
        // Emergency & Support
        'emergency_support': 'ஆபத்கால உதவி',
        'call_emergency': 'ஆபத்கால சேவைகளை அழைக்கவும்',
        'crisis_helpline': 'நெருக்கடி உதவி குறிப்பு',
        'need_immediate_help': 'உடனடி உதவி தேவையா?',
        
        // Grant Permission Screen
        'grant_permissions': 'அனுமதிகள் அளிக்கவும்',
        'microphone_permission': 'மைக்ரோபோன் அனுமதி',
        'microphone_permission_desc': 'வாயிஸ் சாட்கு மைக்ரோபோன் அக்செஸ் அனுமதி அளிக்கவும்',
        'camera_permission': 'கேமரா அனுமதி',
        'camera_permission_desc': 'வீடியோ கால்களுக்கு கேமரா அக்செஸ் அனுமதி அளிக்கவும்',
        'notification_permission': 'அறிவிப்பு அனுமதி',
        'notification_permission_desc': 'நினைவூட்டல்கள் மற்றும் அப்டேட்களுக்கு அறிவிப்புகள் அனுமதி அளிக்கவும்',
        'location_permission': 'இட அனுமதி',
        'location_permission_desc': 'அருகிலுள்ள சிகிச்சையாளர்களை கண்டுபிடிக்க இட அக்செஸ் அனுமதி அளிக்கவும்',
        'allow': 'அனுமதி அளிக்கவும்',
        'deny': 'மறுக்கவும்',
        'skip_for_now': 'இப்போதைக்கு தவிர்க்கவும்',
        'permissions_required': 'அனுமதிகள் தேவை',
        'permissions_help_text': 'இந்த அனுமதிகள் உங்களுக்கு செறந்த அனுபவத்தை அளிக்க உதவுகிறது',
        
        // Demo AI Therapist Chat
        'demo_chat_title': 'டெமோ AI சிகிச்சையாளர் சாட்',
        'demo_chat_subtitle': 'கணக்கை தயாரிக்கும் முன் எங்கள் AI சிகிச்சையாளரை அனுபவிக்கவும்',
        'demo_chat_disclaimer': 'இது ஒரு டெமோ. முழு வைசிஷ்ட்யங்களுக்கு, தயவு செய்து கணக்கை தயாரிக்கவும்.',
        'demo_limit_reached': 'டெமோ வரையறை அடைந்தது. தொடர தயவு செய்து கணக்கை தயாரிக்கவும்.',
        'try_demo_chat': 'டெமோ சாட் முயற்சி செய்யவும்',
        'demo_conversation_starter': 'வணக்கம்! நான் உங்கள் AI சிகிச்சையாளர். இன்று நீங்கள் எப்படி அனுபவிக்கிறீர்கள்?',
        'welcome_demo_chat': 'டெமோ சாட்கு வரவேற்கிறோம்.',
        'welcome_back': 'மீண்டும் வரவேற்கிறோம்.',
        
        // AI Response Templates
        'ai_response_1': 'பகிர்ந்துகொண்டதற்கு நன்றி. இது உங்களுக்கு எப்படி உணர வைக்கிறது?',
        'ai_response_2': 'நான் புரிந்துகொள்கிறேன். உங்கள் மனதில் என்ன இருக்கிறது என்பதை மேலும் சொல்ல முடியுமா?',
        'ai_response_3': 'இது சவாலானதாக தெரிகிறது. நான் கேட்க இங்கே இருக்கிறேன்.',
        'ai_response_4': 'அதைப் பற்றி வெளிப்படையாக பேசுவதற்கு தைரியம் தேவை. அதைப் பற்றி உங்கள் எண்ணங்கள் என்ன?',
        'ai_response_5': 'நான் உங்கள் பேச்சைக் கேட்கிறேன். அந்த உணர்வை இன்னும் கொஞ்சம் ஆராய்வோம்.',
        
        // Common Actions
        'save': 'சேமி',
        'edit': 'திருத்தவும்',
        'delete': 'நீக்கவும்',
        'confirm': 'உறுதி செய்யவும்',
        'yes': 'ஆம்',
        'no': 'இல்லை',
        'ok': 'சரி',
        'loading': 'லோட் ஆகிக் கொண்டிருக்கிறது...',
        'error': 'பிழை',
        'success': 'வெற்றி',
        'warning': 'எச்சரிக்கை',
        'info': 'தகவல்',
        'close': 'மூடவும்',
        'cancel': 'ரத்து செய்',
        'continue': 'தொடர்'
    },
    
    gu: {
        // Login & Registration
        'awakening_minds': 'મન જાગૃત કરવું, કલ્યાણ વધારવું',
        'login': 'લોગિન',
        'email_username': 'ઈમેલ / વાપરકર્તાનું નામ',
        'password': 'પાસવર્ડ',
        'create_account': 'ખાતું બનાવો',
        'dont_have_account': 'ખાતું નથી?',
        'signup': 'સાઇન અપ',
        'continue_as_guest': 'મેહમાન તરીકે ચાલુ રાખો',
        'back_to_login': 'લોગિનમાં વાપસ જાઓ',
        'full_name': 'પૂરું નામ',
        'date_of_birth': 'જન્મ તારીખ',
        'email': 'ઈમેલ પત્તો',
        'create_your_account': 'તમારું ખાતું બનાવો',
        
        // Dashboard & Navigation
        'welcome': 'સ્વાગત',
        'demo_ai_therapist': 'ડેમો AI થેરાપિસ્ટ ચેટ',
        'ai_therapist': 'AI થેરાપિસ્ટ',
        'self_assessment': 'સ્વ-મૂલ્યાંકન',
        'find_your_therapist': 'તમારા થેરાપિસ્ટને ખોજો',
        'community_forum': 'કમ્યુનિટી ફોરમ',
        'my_progress': 'મારી પ્રગતિ ડેશબોર્ડ',
        'wellness_resources': 'વેલનેસ સંસાધનો',
        'profile_settings': 'પ્રોફાઇલ અને સેટિંગ્સ',
        'chat_with_ai': 'AI થેરાપિસ્ટ સાથે ચેટ કરો',
        'take_assessment': 'સ્વ-મૂલ્યાંકન કરો',
        'book_appointment': 'એપોઇન્ટમેન્ટ બુક કરો',
        'my_progress_dashboard': 'મારી પ્રગતિ ડેશબોર્ડ',
        
        // Chat Interface
        'type_message': 'તમારો સંદેશ ટાઇપ કરો...',
        'type_message_50_limit': 'તમારો સંદેશ ટાઇપ કરો (50 દૈનિક મર્યાદા)...',
        'voice_to_text': 'વોઇસ ટુ ટેક્સ્ટ',
        'send': 'પાઠવો',
        'i_feel_anxious': 'હું ચિંતિત ફીલ કરું છું',
        'cant_sleep': 'મને નીંદ આવતી નથી',
        'feeling_overwhelmed': 'હું અસહાય ફીલ કરું છું',
        'bad_day': 'મારો દિવસ ખરાબ હતો',
        'talk_stress': 'તણાવ વિશે વાત કરીએ',
        
        // Assessment Questions - PHQ-9
        'phq9_q0': 'કાமોમાં ઓછો રસ કે આનંદ અનુભવવો।',
        'phq9_q1': 'ઉદાસ, નિરાશ, કે નિરાશાજનક લાગવું।',
        'phq9_q2': 'ઝોપવામાં કે ઝોપી રહેવામાં અડચણ, કે જ્યાદા ઝોપવું।',
        'phq9_q3': 'થકાવટ લાગવી કે ઓછી શક્તિ હોવી।',
        'phq9_q4': 'ભૂખ ન લાગવી કે જ્યાદા ખાવું।',
        'phq9_q5': 'પોતાના બાબતમાં ખરાબ લાગવું — કે એવું લાગવું કે તમે અસફળ છો કે તમે તમારા કે કુટુંબને નિરાશ કર્યો છે।',
        'phq9_q6': 'વર્તમાનપત્ર વાંચવું કે ટેલિવિન્ જોવું જેવી વસ્તુઓમાં ધ્યાન કેન્દ્રિત કરવામાં અડચણ।',
        'phq9_q7': 'ઇતની ધીમી ગતિવિધિવાળી કે બોલવી કે અન્ય લોકો નોંધ લે શકે? કે ઉલ્ટું — ઇતની અસ્વસ્થતા કે અશાંતિ કે તમે સામાન્ય કરતાં બહુ વધારે ફરતા રહ્યા છો।',
        'phq9_q8': 'એવા વિચારો કે તમે મરી જાઓ તો બરું થશે કે કોઈ રીતે પોતાને નોકસાન પહોંચાડવાના વિચારો।',
        
        // Assessment Questions - GAD-7
        'gad7_q0': 'ઘબરાવું, ચિંતા, કે અસ્વસ્થતા લાગવી।',
        'gad7_q1': 'ચિંતાને રોકવી કે નિયંત્રિત કરવી ન શકવું।',
        'gad7_q2': 'વેગવેગળી વસ્તુઓ વિશે જ્યાદા ચિંતા કરવી।',
        'gad7_q3': 'આરામ કરવામાં અડચણ।',
        'gad7_q4': 'ઇતની અસ્વસ્થતા કે શાંત બેસવું કઠિન થવું।',
        'gad7_q5': 'સહજતાથી રાગ કે ચિડચિડાહટ થવી।',
        'gad7_q6': 'ડર લાગવો જેમ કે કાંઈ ભયાનક થવાનું છે।',
        
        // Assessment Questions - PSS-10
        'pss10_q0': 'ગત મહિનામાં, તમે કેટલી વાર અપ્રત્યાશિત વસ્તુઓની વજહથી અસ્વસ્થ થયા છો?',
        'pss10_q1': 'ગત મહિનામાં, તમે કેટલી વாર લાગ્યું કે તમે તમારા જીવનની મહત્વની વસ્તુઓને નિયંત્રિત કરવામાં અસમર્થ છો?',
        'pss10_q2': 'ગત મહિનામાં, તમે કેટલી વாર તણાવગ્રસ્ત અને દબાણ લાગ્યું?',
        'pss10_q3': 'ગત મહિનામાં, તમે કેટલી વாર સફળતાપૂર્વક અસ્વસ્થ કરનાર સમસ્યાઓનો સામનો કર્યો?',
        'pss10_q4': 'ગત મહિનામાં, તમે કેટલી વாર લાગ્યું કે તમે જીવનમாં થતா બદલાવોને પ્રભાવી રીતે સામનો કરી રહ્યા છો?',
        'pss10_q5': 'ગત મહિનામાં, તમે કેટલી વாર વિશ્વાસ લાગ્યો કે તમે તમારી વ્યક્તિગત સમસ્યાઓને સંભાળી શકો છો?',
        'pss10_q6': 'ગત મહિનામાં, તમે કેટલી વாર લાગ્યું કે વસ્તુઓ તમારી ઇચ્છા મુજબ ચાલી રહી છે?',
        'pss10_q7': 'ગત મહિનામாં, તમે કેટલી વாર જોયું કે તમે તે સર્વ વસ્તુઓને સામનો કરી શકતા નથી જે તમારે કરવાની જરૂર હતી?',
        'pss10_q8': 'ગત મહિનામாં, તમે કેટલી વாર તમારா ગુસ્સાને નિયંત્રિત કરવામாં સમર્થ રહ્યા છો?',
        'pss10_q9': 'ગત મહિનામாં, તમે કેટલી વாર લાગ્યું કે અડચણો ઇતની વધી રહી છે કે તમે તેને કાબૂમாં ન લાવી શકો?',
        
        // Assessment Titles
        'depression_phq9': 'ડિપ્રેશન (PHQ-9)',
        'anxiety_gad7': 'ચિંતા (GAD-7)',
        'stress_pss10': 'તણાવ (PSS-10)',
        
        // Assessment Options
        'not_at_all': 'બિલકુલ નહીં',
        'several_days': 'કેટલાક દિવસ',
        'more_than_half': 'અધા કરતાં વધુ દિવસ',
        'nearly_every_day': 'લગભગ દર દિવસ',
        'never': 'કદી નહીં',
        'almost_never': 'લગભગ કદી નહીં',
        'sometimes': 'કદાચ કદાચ',
        'fairly_often': 'બહુ વાર',
        'very_often': 'ખૂબ વાર',
        
        // Wellness Resources
        'understanding_depression': 'ડિપ્રેશનને સમજવું',
        'understanding_anxiety': 'ચિંતાને સમજવી',
        'understanding_stress': 'તણાવને સમજવો',
        'behavioral_activation': 'વર્તનૂક સક્રિયતા',
        'breathing_exercise': 'શ્વાસની વ્યાયામ',
        'writing_journal': 'લેખન જર્નલ',
        'mindfulness_meditation': 'માઇન્ડફુલનેસ મેડિટેશન',
        'virtual_relax_space': 'વર્ચુઅલ રિલેક્સ સ્પેસ',
        
        // Progress & Assessment
        'daily_mood_tracker': 'દૈનિક મૂડ ટ્રેકર',
        'how_feeling_today': 'આજે તમે કેમ ફીલ કરો છો?',
        'save_mood': 'આજનો મૂડ સેવ કરો',
        'mood_trend': '7-દિવસનો મૂડ ટ્રેન્ડ',
        'average': 'સરેરાશ:',
        'trend': 'પ્રવૃત્તિ:',
        'export_data': 'મારો ડેટા એક્સપોર્ટ કરો',
        'milestones': 'તમારા માઇલસ્ટોન',
        'assessment_history': 'મૂલ્યાંકનનો ઇતિહાસ',
        'view_progress': 'મારી પ્રગતિ જુઓ',
        'see_results': 'મારા પરિણામો જુઓ',
        'your_results': 'તમારા પરિણામો',
        'start_assessment': 'મૂલ્યાંકન શરૂ કરો',
        'question_of': 'પ્રશ્ન {current} નો {total}',
        'previous': 'પહેલાનો',
        'next': 'અગલો',
        
        // Forum & Community
        'join': 'જોડાઓ',
        'joined': 'જોડાયા',
        'members': 'સદસ્યો',
        'create_post': 'પોસ્ટ બનાવો',
        'post_title': 'પોસ્ટ શીર્ષક',
        'post_content': 'પોસ્ટ વિષય',
        'submit_post': 'પોસ્ટ સબમિટ કરો',
        'comments': 'ટિપ્પણીઓ',
        'reply': 'જવાબ',
        'upvote': 'અપવોટ',
        'downvote': 'ડાઉનવોટ',
        
        // Settings & Profile
        'settings': 'સેટિંગ્સ',
        'theme': 'થીમ',
        'dark': 'ડાર્ક',
        'light': 'લાઇટ',
        'notifications': 'નોટિફિકેશન',
        'language': 'ભાષા',
        'data_privacy': 'ડેટા અને ગોપનીયતા',
        'logout': 'લોગઆઉટ',
        'manage': 'વ્યવસ્થાપન',
        'on': 'ચાલુ',
        'off': 'બંધ',
        
        // Emergency & Support
        'emergency_support': 'આપત્કાલીન સહાય',
        'call_emergency': 'આપત્કાલીન સેવાઓને કોલ કરો',
        'crisis_helpline': 'ક્રાઇસિસ હેલ્પલાઇન',
        'need_immediate_help': 'તાત્કાલિક મદદ જોઈએ?',
        
        // Grant Permission Screen
        'grant_permissions': 'અનુમતિઓ આપો',
        'microphone_permission': 'માઇક્રોફોન અનુમતિ',
        'microphone_permission_desc': 'વોઇસ ચેટ માટે માઇક્રોફોન એક્સેસની અનુમતિ આપો',
        'camera_permission': 'કૅમેરા અનુમતિ',
        'camera_permission_desc': 'વીડિઓ કોલ માટે કૅમેરા એક્સેસની અનુમતિ આપો',
        'notification_permission': 'નોટિફિકેશન અનુમતિ',
        'notification_permission_desc': 'રિમાઇન્ડર અને અપડેટ માટે નોટિફિકેશનની અનુમતિ આપો',
        'location_permission': 'સ્થાન અનુમતિ',
        'location_permission_desc': 'નજીકના થેરાપિસ્ટ શોધવા માટે સ્થાન એક્સેસની અનુમતિ આપો',
        'allow': 'અનુમતિ આપો',
        'deny': 'નકારો',
        'skip_for_now': 'અભી છોડો',
        'permissions_required': 'અનુમતિઓ જરૂરી',
        'permissions_help_text': 'આ અનુમતિઓ તમને સરસ અનુભવ આપવામાં મદદ કરે છે',
        
        // Demo AI Therapist Chat
        'demo_chat_title': 'ડેમો AI થેરાપિસ્ટ ચેટ',
        'demo_chat_subtitle': 'ખાતું બનાવવા પહેલાં અમારા AI થેરાપિસ્ટનો અનુભવ કરો',
        'demo_chat_disclaimer': 'આ એક ડેમો છે. સમ્પૂર્ણ વૈશિષ્ટ્યો માટે, કૃપા કરીને ખાતું બનાવો.',
        'demo_limit_reached': 'ડેમો મર્યાદા પૂરી થઈ. ચાલુ રાખવા માટે કૃપા કરીને ખાતું બનાવો.',
        'try_demo_chat': 'ડેમો ચેટ આજમાવો',
        'demo_conversation_starter': 'નમસ્કાર! હું તમારો AI થેરાપિસ્ટ છું. આજે તમે કેમ ફીલ કરો છો?',
        'welcome_demo_chat': 'ડેમો ચેટમાં સ્વાગત.',
        'welcome_back': 'પાછા આવવા બદલ સ્વાગત.',
        
        // AI Response Templates
        'ai_response_1': 'શેર કરવા બદલ આભાર. આનાથી તમને કેવું લાગે છે?',
        'ai_response_2': 'હું સમજું છું. તમારા મનમાં શું છે તે વિશે વધુ કહી શકશો?',
        'ai_response_3': 'આ પડકારજનક લાગે છે. હું સાંભળવા માટે અહીં છું.',
        'ai_response_4': 'તે વિશે ખુલ્લેઆમ વાત કરવા માટે હિંમત જોઈએ છે. તે વિશે તમારા શું વિચારો છે?',
        'ai_response_5': 'હું તમારી વાત સાંભળું છું. ચાલો તે લાગણીને થોડી વધુ શોધીએ.',
        
        // Common Actions
        'save': 'સેવ કરો',
        'edit': 'સંપાદન',
        'delete': 'ડિલીટ કરો',
        'confirm': 'ખાતરી કરો',
        'yes': 'હા',
        'no': 'ના',
        'ok': 'ઠીક',
        'loading': 'લોડ થઈ રહ્યું છે...',
        'error': 'એરર',
        'success': 'સફળતા',
        'warning': 'ચેતવણી',
        'info': 'માહિતી',
        'close': 'બંધ કરો',
        'cancel': 'રદ કરો',
        'continue': 'ચાલુ રાખો'
    },
    
    kn: {
        // Login & Registration
        'awakening_minds': 'ಮನಸ್ಸುಗಳನ್ನು ಜಾಗೃತಗೊಳಿಸುವುದು, ಯೋಗಕ್ಷೇಮವನ್ನು ಪೋಷಿಸುವುದು',
        'login': 'ಲಾಗಿನ್',
        'email_username': 'ಇಮೇಲ್ / ವಾಪರದಾರ ಹೆಸರು',
        'password': 'ಪಾಸ್ವರ್ಡ್',
        'create_account': 'ಖಾತೆ ಸೃಷ್ಟಿಸಿ',
        'dont_have_account': 'ಖಾತೆ ಇಲ್ಲವೇ?',
        'signup': 'ಸೈನ್ ಅಪ್',
        'continue_as_guest': 'ಅತಿಥಿಯಾಗಿ ಮುಂದುವರಿಸಿ',
        'back_to_login': 'ಲಾಗಿನ್ಗೆ ಹಿಂತಿರುಗಿ',
        'full_name': 'ಪೂರ್ಣ ಹೆಸರು',
        'date_of_birth': 'ಜನ್ಮ ದಿನಾಂಕ',
        'email': 'ಇಮೇಲ್ ವಿಲಾಸ',
        'create_your_account': 'ನಿಮ್ಮ ಖಾತೆಯನ್ನು ಸೃಷ್ಟಿಸಿ',
        
        // Dashboard & Navigation
        'welcome': 'ಸ್ವಾಗತ',
        'demo_ai_therapist': 'ಡೆಮೋ AI ಚಿಕಿತ್ಸಕ ಚಾಟ್',
        'ai_therapist': 'AI ಚಿಕಿತ್ಸಕ',
        'self_assessment': 'ಸ್ವಯಂ ಮೌಲ್ಯಮಾಪನ',
        'find_your_therapist': 'ನಿಮ್ಮ ಚಿಕಿತ್ಸಕರನ್ನು ಹುಡುಕಿ',
        'community_forum': 'ಸಮುದಾಯ ವೇದಿಕೆ',
        'my_progress': 'ನನ್ನ ಪ್ರಗತಿ ಡ್ಯಾಶ್ಬೋರ್ಡ್',
        'wellness_resources': 'ಯೋಗಕ್ಷೇಮ ಸಂಪನ್ಮೂಲಗಳು',
        'profile_settings': 'ಪ್ರೋಫೈಲ್ ಮತ್ತು ಸೆಟ್ಟಿಂಗ್ಸ್',
        'chat_with_ai': 'AI ಚಿಕಿತ್ಸಕರೊಂದಿಗೆ ಚಾಟ್ ಮಾಡಿ',
        'take_assessment': 'ಸ್ವಯಂ ಮೌಲ್ಯಮಾಪನ ಮಾಡಿ',
        'book_appointment': 'ಅಪಾಯಿಂಟ್ಮೆಂಟ್ ಬುಕ್ ಮಾಡಿ',
        'my_progress_dashboard': 'ನನ್ನ ಪ್ರಗತಿ ಡ್ಯಾಶ್ಬೋರ್ಡ್',
        
        // Chat Interface
        'type_message': 'ನಿಮ್ಮ ಸಂದೇಶವನ್ನು ಟೈಪ್ ಮಾಡಿ...',
        'type_message_50_limit': 'ನಿಮ್ಮ ಸಂದೇಶವನ್ನು ಟೈಪ್ ಮಾಡಿ (50 ದೈನಿಕ ಮರ್ಯಾದೆ)...',
        'voice_to_text': 'ವಾಯಿಸ್ ಟು ಟೆಕ್ಸ್ಟ್',
        'send': 'ಕಳುಹಿಸಿ',
        'i_feel_anxious': 'ನನಗೆ ಆತಂಕ ಆಗುತ್ತಿದೆ',
        'cant_sleep': 'ನನಗೆ ನಿದ್ದೆ ಬರುತ್ತಿಲ್ಲ',
        'feeling_overwhelmed': 'ನಾನು ಅಧಿಕ ಅನುಭವಿಸುತ್ತಿದ್ದೇನೆ',
        'bad_day': 'ನನಗೆ ಕೆಟ್ಟ ದಿನ ಇತ್ತು',
        'talk_stress': 'ಒತ್ತಡದ ಗುರಿಂಚಿ ಮಾತನಾಡಬೇಕು',
        
        // Assessment Questions - PHQ-9
        'phq9_q0': 'ಕಾರ್ಯಗಳನ್ನು ಮಾಡುವತರಲ್ಲಿ ಕುಱೈವாದ ಆಸಕ್ತಿ ಅಲ್ಲದೆ ಆನಂದ ಅನುಭವಿಸುವುದು।',
        'phq9_q1': 'ನಿರಾಶೆ, ಖಿನ್ನತೆ, ಅಲ್ಲದೆ ನಿರಾಶಾಜನಕವಾಗಿ ಅನುಭವಿಸುವುದು।',
        'phq9_q2': 'ನಿದ್ದೆ ಬರುವತರಲ್ಲಿ ಅಲ್ಲದೆ ನಿದ್ದೆயಲ್ಲಿ ಇರುವತರಲ್ಲಿ ಸಮಸ್ಯೆ, ಅಲ್ಲದೆ ಅಧಿಕ ನಿದ್ದೆ ಮಾಡುವುದು।',
        'phq9_q3': 'ಆಲಸ್ಯ ಅನುಭವಿಸುವುದು ಅಲ್ಲದೆ ಕುಱೈವாದ ಶಕ್ತಿ ಇರುವುದು।',
        'phq9_q4': 'ತಿನ್ನಲ್ಲಿ ಇಷ್ಟವಿಲ್ಲದಿರುವುದು ಅಲ್ಲದೆ ಅಧಿಕ ತಿನ್ನುವುದು।',
        'phq9_q5': 'ನಿಮ್ಮ ಬಗ್ಗೆ ಕೆಟ್ಟದಾಗಿ ಅನುಭವಿಸುವುದು — ಅಲ್ಲದೆ ನೀವು ವಿಫಲರಾಗಿದ್ದೀರಿ ಅಲ್ಲದೆ ನಿಮ್ಮ ಕುಟುಂಬವನ್ನು ನಿರಾಶೆಗೊಳಿಸಿದ್ದೀರಿ ಅನುಭವಿಸುವುದು।',
        'phq9_q6': 'ವಾರ್ತೆಪತ್ರಿಕೆ ಓದುವುದು ಅಲ್ಲದೆ ಟೆಲಿವಿಷನ್ ನೋಡುವುದು ವಂತಿ ವಿಷಯಗಳಲ್ಲಿ ಧ್ಯಾನ ಕೇಂದ್ರೀಕರಿಸುವತರಲ್ಲಿ ಸಮಸ್ಯೆ।',
        'phq9_q7': 'ಇತರರು ಗಮನಿಸಗಲ್ಲ ಅಳವಿಗೆ ನಡೆಯುವುದು ಅಲ್ಲದೆ ಮಾತನಾಡುವುದು? ಅಲ್ಲದೆ ವಿಪರೀತವಾಗಿ — ಎಂತ ಅಸ್ವಸ್ಥತೆ ಅಲ್ಲದೆ ಅಶಾಂತಿಯಿಂದ ನೀವು ಸಾಧಾರಣಕ್ಕಿಂತ ಅಧಿಕ ಅಲೆಯುತ್ತಿದ್ದೀರಿ।',
        'phq9_q8': 'ನೀವು ಸಾಯ್ದರೆ ಬರೇ ಅನಿಸುತ್ತದೆ ಅಲ್ಲದೆ ಯಾವುದೇ ರೀತಿಯಲ್ಲಿ ನಿಮ್ಮನ್ನು ನೋವಿಸುವ ಆಲೋಚನೆಗಳು।',
        
        // Assessment Questions - GAD-7
        'gad7_q0': 'ನರ್ವಸ್ನೆಸ್, ಆತಂಕ, ಅಲ್ಲದೆ ಅಶಾಂತಿ ಅನುಭವಿಸುವುದು।',
        'gad7_q1': 'ಆತಂಕವನ್ನು ನಿಲ್ಲಿಸುವುದು ಅಲ್ಲದೆ ನಿಯಂತ್ರಿಸುವುದು ಆಗದೆ ಇಲ್ಲ।',
        'gad7_q2': 'ವೇರೆ ವೇರೆ ವಿಷಯಗಳ ಬಗ್ಗೆ ಅಧಿಕ ಆತಂಕ ಪಡುವುದು।',
        'gad7_q3': 'ಶಾಂತಿಯಾಗಿ ಇರುವತರಲ್ಲಿ ಸಮಸ್ಯೆ।',
        'gad7_q4': 'ಎಂತ ಅಶಾಂತಿಯಿಂದ ಶಾಂತಿಯಾಗಿ ಕೂರುವುದು ಕಷ್ಟವಾಗಿರುವುದು।',
        'gad7_q5': 'ಸಹಜವಾಗಿ ಕೋಪಗೊಳ್ಳುವುದು ಅಲ್ಲದೆ ಚಿಡಿಕಿ ಆಗುವುದು।',
        'gad7_q6': 'ಯಾವುದಾದರೂ ಭಯಾನಕ ಘಟನೆ ನಡೆಯುತ್ತದೆ ಅನಿಸಿ ಭಯಪಡುವುದು।',
        
        // Assessment Questions - PSS-10
        'pss10_q0': 'ಕಡಿಮೆ ತಿಂಗಳಲ್ಲಿ, ನೀವು ಎಷ್ಟು ಸಾರಿ ಅಪ್ರತ್ಯಾಶಿತ ಘಟನೆಗಳಿಂದ ಕಲಕಳಾಗಿದ್ದೀರಿ?',
        'pss10_q1': 'ಕಡಿಮೆ ತಿಂಗಳಲ್ಲಿ, ನೀವು ಎಷ್ಟು ಸಾರಿ ನಿಮ್ಮ ಜೀವನದ ಮುಖ್ಯವಾದ ವಿಷಯಗಳನ್ನು ನಿಯಂತ್ರಿಸುವತರಲ್ಲಿ ಅಸಮರ್ಥರಾಗಿ ಅನುಭವಿಸಿದ್ದೀರಿ?',
        'pss10_q2': 'ಕಡಿಮೆ ತಿಂಗಳಲ್ಲಿ, ನೀವು ಎಷ್ಟು ಸಾರಿ ಒತ್ತಡಗ್ರಸ್ತರಾಗಿ ಮತ್ತು ನೆರುಕುನಿಲ್ಲಿ ಅನುಭವಿಸಿದ್ದೀರಿ?',
        'pss10_q3': 'ಕಡಿಮೆ ತಿಂಗಳಲ್ಲಿ, ನೀವು ಎಷ್ಟು ಸಾರಿ ಯಶಸ್ವಿಯಾಗಿ ಕಲಕದಾಯಕ ಸಮಸ್ಯೆಗಳನ್ನು ನಿರ್ವಹಿಸಿದ್ದೀರಿ?',
        'pss10_q4': 'ಕಡಿಮೆ ತಿಂಗಳಲ್ಲಿ, ನೀವು ಎಷ್ಟು ಸಾರಿ ನೀವು ಜೀವನದ ಮಾರ್ಪುಗಳನ್ನು ಪ್ರಭಾವಕಾರಿಯಾಗಿ ನಿರ್ವಹಿಸುತ್ತಿದ್ದೀರಿ ಅನುಭವಿಸಿದ್ದೀರಿ?',
        'pss10_q5': 'ಕಡಿಮೆ ತಿಂಗಳಲ್ಲಿ, ನೀವು ಎಷ್ಟು ಸಾರಿ ನೀವು ನಿಮ್ಮ ವ್ಯಕ್ತಿಗತ ಸಮಸ್ಯೆಗಳನ್ನು ನಿರ್ವಹಿಸಗಲು ಅನುಭವಿಸಿದ್ದೀರಿ?',
        'pss10_q6': 'ಕಡಿಮೆ ತಿಂಗಳಲ್ಲಿ, ನೀವು ಎಷ್ಟು ಸಾರಿ ವಿಷಯಗಳು ನಿಮ್ಮ ಇಷ್ಟಾನುಸಾರ ನಡೆಯುತ್ತಿವೆ ಅನುಭವಿಸಿದ್ದೀರಿ?',
        'pss10_q7': 'ಕಡಿಮೆ ತಿಂಗಳಲ್ಲಿ, ನೀವು ಎಷ್ಟು ಸಾರಿ ನೀವು ಮಾಡಬೇಕಾದ ಅನ್ನಿ ಕಾರ್ಯಗಳನ್ನು ನಿರ್ವಹಿಸಲು ಆಗಲಿಲ್ಲ ಅನುಭವಿಸಿದ್ದೀರಿ?',
        'pss10_q8': 'ಕಡಿಮೆ ತಿಂಗಳಲ್ಲಿ, ನೀವು ಎಷ್ಟು ಸಾರಿ ನಿಮ್ಮ ಕೋಪವನ್ನು ನಿಯಂತ್ರಿಸುವತರಲ್ಲಿ ಸಮರ್ಥರಾಗಿದ್ದೀರಿ?',
        'pss10_q9': 'ಕಡಿಮೆ ತಿಂಗಳಲ್ಲಿ, ನೀವು ಎಷ್ಟು ಸಾರಿ ಕಷ್ಟಗಳು ಎಂತ ವೃದ್ಧಿಯಾಗುತ್ತಿವೆ ನೀವು ಅವುಗಳನ್ನು ಕಾಟ್ಟಲು ಆಗಲಿಲ್ಲ ಅನುಭವಿಸಿದ್ದೀರಿ?',
        
        // Assessment Titles
        'depression_phq9': 'ಖಿನ್ನತೆ (PHQ-9)',
        'anxiety_gad7': 'ಆತಂಕ (GAD-7)',
        'stress_pss10': 'ಒತ್ತಡ (PSS-10)',
        
        // Assessment Options
        'not_at_all': 'ಎಂದು ಇಲ್ಲ',
        'several_days': 'ಕೆಲವು ದಿನಗಳು',
        'more_than_half': 'ಅರ್ಧಕ್ಕಿಂತ ಜಾಸ್ತಿ ದಿನಗಳು',
        'nearly_every_day': 'ದಾದಾಪು ಪ್ರತಿ ದಿನ',
        'never': 'ಎಂದಿಗೂ ಇಲ್ಲ',
        'almost_never': 'ದಾದಾಪು ಎಂದಿಗೂ ಇಲ್ಲ',
        'sometimes': 'ಕೊಂದ ಸಮಯ',
        'fairly_often': 'ಬಹುತೇಕ ಸಮಯ',
        'very_often': 'ತುಂಬಾ ಅಧಿಕ ಸಮಯ',
        
        // Wellness Resources
        'understanding_depression': 'ಖಿನ್ನತೆಯನ್ನು ಅರ್ಥಮಾಡಿಕೊಳ್ಳುವುದು',
        'understanding_anxiety': 'ಆತಂಕವನ್ನು ಅರ್ಥಮಾಡಿಕೊಳ್ಳುವುದು',
        'understanding_stress': 'ಒತ್ತಡವನ್ನು ಅರ್ಥಮಾಡಿಕೊಳ್ಳುವುದು',
        'behavioral_activation': 'ವರ್ತನೆಯ ಸಕ್ರಿಯತೆ',
        'breathing_exercise': 'ಶ್ವಾಸ ವ್ಯಾಯಾಮ',
        'writing_journal': 'ಬರೆಯುವ ಜರ್ನಲ್',
        'mindfulness_meditation': 'ಮೈಂಡ್ಫುಲ್ನೆಸ್ ಧ್ಯಾನ',
        'virtual_relax_space': 'ವರ್ಚುಅಲ್ ರಿಲ್ಯಾಕ್ಸ್ ಸ್ಪೇಸ್',
        
        // Progress & Assessment
        'daily_mood_tracker': 'ದೈನಂದಿನ ಮೂಡ್ ಟ್ರಾಕರ್',
        'how_feeling_today': 'ಇಂದು ನೀವು ಎಲ್ಲಿ ಅನುಭವಿಸುತ್ತಿದ್ದೀರಿ?',
        'save_mood': 'ಇಂದಿನ ಮೂಡ್ ಉಳಿಸಿ',
        'mood_trend': '7-ದಿನಗಳ ಮೂಡ್ ಟ್ರೆಂಡ್',
        'average': 'ಸರಾಸರಿ:',
        'trend': 'ಪ್ರವೃತ್ತಿ:',
        'export_data': 'ನನ್ನ ಡೇಟಾವನ್ನು ಎಕ್ಸ್ಪೋರ್ಟ್ ಮಾಡಿ',
        'milestones': 'ನಿಮ್ಮ ಮೈಲ್ಸ್ಟೋನ್ಗಳು',
        'assessment_history': 'ಮೌಲ್ಯಮಾಪನ ಇತಿಹಾಸ',
        'view_progress': 'ನನ್ನ ಪ್ರಗತಿಯನ್ನು ನೋಡಿ',
        'see_results': 'ನನ್ನ ಪರಿಣಾಮಗಳನ್ನು ನೋಡಿ',
        'your_results': 'ನಿಮ್ಮ ಪರಿಣಾಮಗಳು',
        'start_assessment': 'ಮೌಲ್ಯಮಾಪನ ಪ್ರಾರಂಭಿಸಿ',
        'question_of': 'ಪ್ರಶ್ನೆ {current} ರ {total}',
        'previous': 'ಹಿಂದಿನ',
        'next': 'ಮುಂದಿನ',
        
        // Forum & Community
        'join': 'ಸೇರಿ',
        'joined': 'ಸೇರಿದ್ದೀರಿ',
        'members': 'ಸದಸ್ಯರು',
        'create_post': 'ಪೋಸ್ಟ್ ಸೃಷ್ಟಿಸಿ',
        'post_title': 'ಪೋಸ್ಟ್ ಶೀರ್ಷಿಕೆ',
        'post_content': 'ಪೋಸ್ಟ್ ವಿಷಯ',
        'submit_post': 'ಪೋಸ್ಟ್ ಸಬ್ಮಿಟ್ ಮಾಡಿ',
        'comments': 'ಅಭಿಪ್ರಾಯಗಳು',
        'reply': 'ಉತ್ತರ',
        'upvote': 'ಅಪ್ವೋಟ್',
        'downvote': 'ಡೌನ್ವೋಟ್',
        
        // Settings & Profile
        'settings': 'ಸೆಟ್ಟಿಂಗ್ಸ್',
        'theme': 'ಥೀಮ್',
        'dark': 'ಡಾರ್ಕ್',
        'light': 'ಲೈಟ್',
        'notifications': 'ನೋಟಿಫಿಕೇಶನ್ಗಳು',
        'language': 'ಭಾಷೆ',
        'data_privacy': 'ಡೇಟಾ ಮತ್ತು ಗೋಪ್ಯತೆ',
        'logout': 'ಲಾಗ್ಆಉಟ್',
        'manage': 'ವ್ಯವಸ್ಥೆ ಮಾಡಿ',
        'on': 'ಆನ್',
        'off': 'ಆಫ್',
        
        // Emergency & Support
        'emergency_support': 'ಆಪತ್ಕಾಲೀನ ಸಹಾಯ',
        'call_emergency': 'ಆಪತ್ಕಾಲೀನ ಸೇವೆಗಳಿಗೆ ಕಾಲ್ ಮಾಡಿ',
        'crisis_helpline': 'ಕ್ರೈಸಿಸ್ ಹೆಲ್ಪ್ಲೈನ್',
        'need_immediate_help': 'ತತ್ಕಾಲ ಸಹಾಯ ಬೇಕು?',
        
        // AI Response Templates
        'ai_response_1': 'ಹಂಚಿಕೊಂಡಿದ್ದಕ್ಕಾಗಿ ಧನ್ಯವಾದಗಳು. ಇದು ನಿಮಗೆ ಹೇಗೆ ಅನಿಸುತ್ತದೆ?',
        'ai_response_2': 'ನಾನು ಅರ್ಥಮಾಡಿಕೊಂಡಿದ್ದೇನೆ. ನಿಮ್ಮ ಮನಸ್ಸಿನಲ್ಲಿ ಏನಿದೆ ಎಂಬುದರ ಬಗ್ಗೆ ಹೆಚ್ಚು ಹೇಳಬಹುದೇ?',
        'ai_response_3': 'ಇದು ಸವಾಲಿನಂತೆ ತೋರುತ್ತದೆ. ನಾನು ಕೇಳಲು ಇಲ್ಲಿದ್ದೇನೆ.',
        'ai_response_4': 'ಅದರ ಬಗ್ಗೆ ಮುಕ್ತವಾಗಿ ಮಾತನಾಡಲು ಧೈರ್ಯ ಬೇಕು. ಅದರ ಬಗ್ಗೆ ನಿಮ್ಮ ಆಲೋಚನೆಗಳು ಏನು?',
        'ai_response_5': 'ನಾನು ನಿಮ್ಮ ಮಾತು ಕೇಳುತ್ತಿದ್ದೇನೆ. ಆ ಭಾವನೆಯನ್ನು ಇನ್ನೂ ಸ್ವಲ್ಪ ಅನ್ವೇಷಿಸೋಣ.',
        
        // Common Actions
        'save': 'ಉಳಿಸಿ',
        'edit': 'ಸಂಪಾದನೆ ಮಾಡಿ',
        'delete': 'ಅಳಿಸಿ',
        'confirm': 'ನಿರ್ಧಾರಿಸಿ',
        'yes': 'ಹೌದು',
        'no': 'ಇಲ್ಲ',
        'ok': 'ಸರಿ',
        'loading': 'ಲೋಡ್ ಆಗುತ್ತಿದೆ...',
        'error': 'ತಪ್ಪು',
        'success': 'ಯಶಸ್ಸು',
        'warning': 'ಎಚ್ಚರಿಕೆ',
        'info': 'ಮಾಹಿತಿ',
        'close': 'ಮೂಸಿ',
        'cancel': 'ರದ್ದುಗೊಳಿಸಿ',
        'continue': 'ಮುಂದುವರಿಸಿ'
    }
};

// Translation function
function translate(key, lang = 'en') {
    return translations[lang] && translations[lang][key] ? translations[lang][key] : translations.en[key] || key;
}

// Initialize translation system
function initializeTranslation() {
    const currentLang = localStorage.getItem('selectedLanguage') || 'en';
    setLanguage(currentLang);
}

// Set language
function setLanguage(lang) {
    localStorage.setItem('selectedLanguage', lang);
    updatePageTranslations(lang);
    
    // Update voice chat language immediately
    if (window.voiceChat && typeof window.voiceChat.setLanguage === 'function') {
        window.voiceChat.setLanguage(lang);
    }
    
    // Update quick action buttons in chat if function exists
    if (typeof window.updateQuickActionButtons === 'function') {
        window.updateQuickActionButtons(lang);
    }
    
    // Update all language selectors to reflect the change
    document.querySelectorAll('#language-selector, #demo-language-select').forEach(selector => {
        if (selector && selector.value !== lang) {
            selector.value = lang;
        }
    });
}

// Update page translations
function updatePageTranslations(lang) {
    document.querySelectorAll('[data-translate]').forEach(element => {
        const key = element.getAttribute('data-translate');
        const translatedText = translate(key, lang);
        if (translatedText !== key) { // Only update if translation exists
            element.textContent = translatedText;
        }
    });
    
    document.querySelectorAll('[data-translate-placeholder]').forEach(element => {
        const key = element.getAttribute('data-translate-placeholder');
        const translatedText = translate(key, lang);
        if (translatedText !== key) { // Only update if translation exists
            element.placeholder = translatedText;
        }
    });
    
    // Update input placeholders that use data-translate
    document.querySelectorAll('input[data-translate]').forEach(element => {
        const key = element.getAttribute('data-translate');
        const translatedText = translate(key, lang);
        if (translatedText !== key && element.placeholder) {
            element.placeholder = translatedText;
        }
    });
}

// Make functions globally available
if (typeof window !== 'undefined') {
    window.translations = translations;
    window.translate = translate;
    window.initializeTranslation = initializeTranslation;
    window.setLanguage = setLanguage;
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { translations, translate, initializeTranslation, setLanguage };
}