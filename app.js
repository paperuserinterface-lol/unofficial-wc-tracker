// Main App Logic

const translations = {
    en: {
        'nav.scores': 'Scores',
        'nav.bracket': 'Bracket & Groups',
        'nav.moments': 'Moments',
        'nav.stats': 'Stats',
        'nav.forum': 'Forum',
        'nav.draft': 'Draft',
        'nav.profile': 'Profile',
        'nav.admin': 'Admin Panel',
        'nav.login': 'Login',
        'nav.logout': 'Logout',
        'scores.title': 'Live Scores',
        'scores.subtitle': 'Track all FIFA World Cup 2026™ matches',
        'bracket.title': 'Bracket & Groups',
        'bracket.subtitle': 'Group tables and knockout stage',
        'bracket.groups': 'Groups',
        'bracket.knockout': 'Knockout',
        'moments.title': 'Moments',
        'moments.subtitle': 'A digital museum of football history\'s most unforgettable seconds',
        'moments.goals': 'Goals',
        'moments.saves': 'Saves',
        'moments.emotion': 'Emotion',
        'moments.recreate': 'Recreate The Moment',
        'moments.instructions': 'Watch how it happened...',
        'stats.title': 'Tournament Stats',
        'stats.subtitle': 'Top scorers, award races, and standout performances',
        'forum.title': 'Forum',
        'forum.subtitle': 'Talk football, react to matches, follow creators, and join the World Cup community',
        'forum.allPosts': 'All Posts',
        'forum.following': 'Following',
        'profile.title': 'Profile',
        'profile.subtitle': 'Show your World Cup colors, track your notifications, and see your community activity',
        'admin.title': 'Admin Panel',
        'admin.subtitle': 'Manage members, monitor growth, and unlock admin-only tools',
        'admin.exportCsv': 'Export Users CSV',
        'auth.loginTitle': 'Welcome Back',
        'auth.loginSubtitle': 'Log in to sync your drafts and favorite moments',
        'auth.signupTitle': 'Create Account',
        'auth.signupSubtitle': 'Join the FIFA World Cup 2026™ community',
        'auth.emailOrUsername': 'Email / Username',
        'auth.emailOrUsernamePlaceholder': 'Enter your email or username',
        'auth.password': 'Password',
        'auth.passwordPlaceholder': 'Enter your password',
        'auth.signupPasswordPlaceholder': 'Choose a password',
        'auth.username': 'Username',
        'auth.usernamePlaceholder': 'Choose a username',
        'auth.email': 'Email',
        'auth.emailPlaceholder': 'Enter your email',
        'auth.logIn': 'Log In',
        'auth.signUp': 'Sign Up',
        'auth.noAccount': "Don't have an account?",
        'auth.haveAccount': 'Already have an account?',
        'draft.title': 'FUT Draft',
        'draft.subtitle': 'Build your ultimate World Cup XI',
        'draft.formation': 'Formation:',
        'draft.randomize': 'Randomize',
        'draft.save': 'Save Draft',
        'draft.exportTxt': 'Export TXT',
        'draft.teamRating': 'Team Rating',
        'draft.chemistry': 'Chemistry',
        'draft.substitutes': 'Substitutes',
        'draft.choosePlayer': 'Choose Player',
        'footer.disclaimerLabel': 'Disclaimer:',
        'footer.disclaimerText': 'This site is not affiliated, associated, authorized, endorsed by, or in any way officially connected with FIFA, or any of its subsidiaries or its affiliates. All product and company names are the registered trademarks of their original owners.',
        'filters.all': 'All',
        'filters.upcoming': 'Upcoming',
        'filters.live': 'Live',
        'filters.finished': 'Finished',
        'actions.tryAgain': 'Try Again',
        'actions.close': 'Close',
        'actions.refresh': 'Refresh',
        'actions.reset': 'Reset'
    },
    uz: {
        'nav.scores': 'Hisoblar',
        'nav.bracket': 'Turnir Jadvali',
        'nav.moments': 'Lahzalar',
        'nav.stats': 'Statistika',
        'nav.forum': 'Forum',
        'nav.draft': 'Draft',
        'nav.profile': 'Profil',
        'nav.admin': 'Admin Paneli',
        'nav.login': 'Kirish',
        'nav.logout': 'Chiqish',
        'scores.title': 'Jonli Hisoblar',
        'scores.subtitle': 'FIFA World Cup 2026™ o\'yinlarini kuzating',
        'bracket.title': 'Turnir Jadvali va Guruhlar',
        'bracket.subtitle': 'Guruh jadvali va pley-off bosqichi',
        'bracket.groups': 'Guruhlar',
        'bracket.knockout': 'Pley-off',
        'moments.title': 'Lahzalar',
        'moments.subtitle': 'Futbol tarixidagi eng unutilmas soniyalar raqamli muzeyi',
        'moments.goals': 'Gollar',
        'moments.saves': 'Sevlar',
        'moments.emotion': 'Hissiyot',
        'moments.recreate': 'Lahzani Qayta Yarating',
        'moments.instructions': 'Qanday bo\'lganini tomosha qiling...',
        'stats.title': 'Turnir Statistikasi',
        'stats.subtitle': 'Eng yaxshi to\'purarlar, sovrin poygalari va yorqin o\'yinlar',
        'forum.title': 'Forum',
        'forum.subtitle': 'Futbol haqida gaplashing, o\'yinlarga munosabat bildiring va jamoaga qo\'shiling',
        'forum.allPosts': 'Barcha Postlar',
        'forum.following': 'Kuzatilayotganlar',
        'profile.title': 'Profil',
        'profile.subtitle': 'Jamoangiz ranglarini ko\'rsating, bildirishnomalarni kuzating va faolligingizni ko\'ring',
        'admin.title': 'Admin Paneli',
        'admin.subtitle': 'Foydalanuvchilarni boshqaring va admin vositalarini oching',
        'admin.exportCsv': 'Foydalanuvchilar CSV ni Yuklash',
        'auth.loginTitle': 'Qaytganingizdan Xursandmiz',
        'auth.loginSubtitle': 'Draft va sevimli lahzalaringizni sinxronlash uchun kiring',
        'auth.signupTitle': 'Hisob Yaratish',
        'auth.signupSubtitle': 'FIFA World Cup 2026™ hamjamiyatiga qo\'shiling',
        'auth.emailOrUsername': 'Email / Foydalanuvchi nomi',
        'auth.emailOrUsernamePlaceholder': 'Email yoki foydalanuvchi nomini kiriting',
        'auth.password': 'Parol',
        'auth.passwordPlaceholder': 'Parolingizni kiriting',
        'auth.signupPasswordPlaceholder': 'Parol tanlang',
        'auth.username': 'Foydalanuvchi nomi',
        'auth.usernamePlaceholder': 'Foydalanuvchi nomini tanlang',
        'auth.email': 'Email',
        'auth.emailPlaceholder': 'Emailingizni kiriting',
        'auth.logIn': 'Kirish',
        'auth.signUp': 'Ro\'yxatdan o\'tish',
        'auth.noAccount': 'Hisobingiz yo\'qmi?',
        'auth.haveAccount': 'Hisobingiz bormi?',
        'draft.title': 'FUT Draft',
        'draft.subtitle': 'Eng kuchli World Cup XI tarkibingizni tuzing',
        'draft.formation': 'Taktika:',
        'draft.randomize': 'Tasodifiy',
        'draft.save': 'Draftni Saqlash',
        'draft.exportTxt': 'TXT Yuklash',
        'draft.teamRating': 'Jamoa Reytingi',
        'draft.chemistry': 'Kimyo',
        'draft.substitutes': 'Zaxiralar',
        'draft.choosePlayer': 'O\'yinchini Tanlang',
        'footer.disclaimerLabel': 'Eslatma:',
        'footer.disclaimerText': 'Bu sayt FIFA yoki uning sho\'ba tashkilotlari bilan bog\'liq emas, tasdiqlanmagan va rasmiy aloqaga ega emas. Barcha mahsulot va kompaniya nomlari ularning asl egalarining ro\'yxatdan o\'tgan savdo belgilaridir.',
        'filters.all': 'Barchasi',
        'filters.upcoming': 'Kutilayotgan',
        'filters.live': 'Jonli',
        'filters.finished': 'Tugagan',
        'actions.tryAgain': 'Yana Urinish',
        'actions.close': 'Yopish',
        'actions.refresh': 'Yangilash',
        'actions.reset': 'Tiklash'
    }
};

let currentLanguage = localStorage.getItem('worldCupLanguage') || 'en';

function translate(key) {
    return translations[currentLanguage]?.[key] || translations.en[key] || key;
}

function applyTranslations() {
    document.documentElement.lang = currentLanguage;

    document.querySelectorAll('[data-i18n]').forEach((element) => {
        element.textContent = translate(element.dataset.i18n);
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach((element) => {
        element.placeholder = translate(element.dataset.i18nPlaceholder);
    });

    updateLanguageButtons();

    if (typeof updateNavState === 'function') {
        updateNavState();
    }
}

function setLanguage(language) {
    currentLanguage = translations[language] ? language : 'en';
    localStorage.setItem('worldCupLanguage', currentLanguage);
    applyTranslations();
}

function updateLanguageButtons() {
    document.querySelectorAll('.language-btn').forEach((button) => {
        button.classList.toggle('active', button.dataset.language === currentLanguage);
    });
}

document.addEventListener('DOMContentLoaded', async () => {
    document.querySelectorAll('.language-btn').forEach((button) => {
        button.addEventListener('click', () => setLanguage(button.dataset.language));
    });

    applyTranslations();

    // Navigation
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Update nav links
            document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            
            // Show page
            const page = link.dataset.page;
            
            if (page === 'logout') {
                handleLogout();
                return;
            }

            document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
            document.getElementById(`${page}-page`).classList.add('active');
            
            // Initialize page if needed
            if (page === 'scores') {
                initScoresPage();
            } else if (page === 'bracket') {
                initBracketPage();
            } else if (page === 'moments') {
                initMomentsPage();
            } else if (page === 'stats') {
                initStatsPage();
            } else if (page === 'forum') {
                initForumPage();
            } else if (page === 'draft') {
                initDraftPage();
            } else if (page === 'profile') {
                initProfilePage(currentUser ? currentUser.username : null);
            } else if (page === 'admin') {
                initAdminPage();
            }
        });
    });
    
    // Initialize Auth
    await initAuth();
    
    // Initialize scores page by default
    initScoresPage();
    initBracketPage();
    initMomentsPage();
    initStatsPage();
    initForumPage();
    initDraftPage();
    initProfilePage();
    initAdminPage();
});