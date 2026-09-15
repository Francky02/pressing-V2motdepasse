import type { SupportedLocale } from '../types';

export interface Translations {
  nav: {
    features: string;
    sectors: string;
    customization: string;
    howItWorks: string;
    pricing: string;
    dashboard: string;
    login: string;
    getStarted: string;
  };
  hero: {
    taglineBadge: string;
    titlePart1: string;
    titleHighlight: string;
    subtitle: string;
    ctaPrimary: string;
    ctaSecondary: string;
    badge1: string;
    badge2: string;
    badge3: string;
    flowTitle: string;
    flowSubtitle: string;
  };
  problem: {
    tag: string;
    title: string;
    subtitle: string;
    p1Title: string;
    p1Desc: string;
    p2Title: string;
    p2Desc: string;
    p3Title: string;
    p3Desc: string;
    p4Title: string;
    p4Desc: string;
    p5Title: string;
    p5Desc: string;
    p6Title: string;
    p6Desc: string;
    p7Title: string;
    p7Desc: string;
  };
  solution: {
    tag: string;
    title: string;
    subtitle: string;
    s1Title: string;
    s1Desc: string;
    s2Title: string;
    s2Desc: string;
    s3Title: string;
    s3Desc: string;
    s4Title: string;
    s4Desc: string;
    s5Title: string;
    s5Desc: string;
    s6Title: string;
    s6Desc: string;
  };
  sectors: {
    tag: string;
    title: string;
    subtitle: string;
    allFilter: string;
  };
  customization: {
    tag: string;
    title: string;
    subtitle: string;
    liveDemoTitle: string;
    previewNote: string;
    uploadLogo: string;
    replaceLogo: string;
    deleteLogo: string;
    companyNameLabel: string;
    sectorLabel: string;
    primaryColorLabel: string;
    secondaryColorLabel: string;
    phoneLabel: string;
    emailLabel: string;
    presetsTitle: string;
    beforeAfterToggle: string;
  };
  howItWorks: {
    tag: string;
    title: string;
    subtitle: string;
  };
  pricing: {
    tag: string;
    title: string;
    noSubscription: string;
    payWhenCollected: string;
    desc: string;
    feature1: string;
    feature2: string;
    feature3: string;
    feature4: string;
    cta: string;
  };
  dashboard: {
    tag: string;
    title: string;
    question: string;
    totalToRecover: string;
    totalCollected: string;
    clientsToRemind: string;
    pendingPayments: string;
    successfulPayments: string;
    recoveryRate: string;
    recentTransactions: string;
  };
  faq: {
    title: string;
    subtitle: string;
  };
  footer: {
    tagline: string;
    rights: string;
    independentNote: string;
  };
}

export const translations: Record<SupportedLocale, Translations> = {
  fr: {
    nav: {
      features: "Fonctionnalités",
      sectors: "Secteurs",
      customization: "Personnalisation",
      howItWorks: "Comment ça marche",
      pricing: "Modèle & Tarifs",
      dashboard: "Tableau de bord",
      login: "Connexion",
      getStarted: "Commencer gratuitement",
    },
    hero: {
      taglineBadge: "Nouveau • Solution intelligente d'encaissement",
      titlePart1: "Transformez vos créances en",
      titleHighlight: "paiements.",
      subtitle: "Relancio vous aide à suivre ce que vos clients vous doivent, les relancer et faciliter leur paiement.",
      ctaPrimary: "Commencer gratuitement",
      ctaSecondary: "Découvrir Relancio",
      badge1: "0€ d'abonnement fixe",
      badge2: "Prêt en 2 minutes",
      badge3: "Multi-secteurs & Multi-devises",
      flowTitle: "Le cycle vertueux Relancio",
      flowSubtitle: "De la dette oubliée au paiement instantanément encaissé",
    },
    problem: {
      tag: "Le constat quotidien",
      title: "Vos clients vous doivent de l'argent ?",
      subtitle: "La plupart des entreprises et indépendants perdent des millions chaque année à cause d'une gestion des créances éclatée et manuelle.",
      p1Title: "Paiements en retard",
      p1Desc: "Des factures et prestations échues qui s'accumulent sans date de règlement clair.",
      p2Title: "Clients difficiles à relancer",
      p2Desc: "La gêne de réclamer son dû et la peur de froisser un client de longue date.",
      p3Title: "Suivi manuel sur WhatsApp",
      p3Desc: "Messages vocaux perdus, promesses oubliées, aucune trace centralisée.",
      p4Title: "Cahiers ou fichiers Excel",
      p4Desc: "Registres papier égarés, tableurs non synchronisés et erreurs de saisie.",
      p5Title: "Combien reste à récupérer ?",
      p5Desc: "Incapacité à estimer la trésorerie réelle bloquée dehors.",
      p6Title: "Oublis de relance",
      p6Desc: "Plus le temps passe, plus les chances d'encaisser votre argent diminuent.",
      p7Title: "Manque de visibilité",
      p7Desc: "Aucune vision nette des encaissements du mois ni de vos prévisions de cash.",
    },
    solution: {
      tag: "La solution clé en main",
      title: "Relancio centralise vos encaissements.",
      subtitle: "Un parcours fluide et automatisé qui transforme les dettes clients en règlements encaissés.",
      s1Title: "1. Enregistrez la créance",
      s1Desc: "Saisissez en 15 secondes le client, le montant et le motif de la prestation.",
      s2Title: "2. Envoyez une demande",
      s2Desc: "Générez un lien de paiement personnalisé aux couleurs de votre entreprise.",
      s3Title: "3. Relancez votre client",
      s3Desc: "Des rappels automatiques et polis par WhatsApp et SMS sans charge mentale.",
      s4Title: "4. Votre client paie",
      s4Desc: "Le client règle en 1 clic par Mobile Money, carte ou virement.",
      s5Title: "5. Vous recevez la confirmation",
      s5Desc: "Notification en temps réel dès que l'opération est validée.",
      s6Title: "6. Votre créance est mise à jour",
      s6Desc: "Le solde s'ajuste immédiatement dans votre tableau de bord sans action manuelle.",
    },
    sectors: {
      tag: "Multi-activités",
      title: "Un seul outil pour plusieurs métiers.",
      subtitle: "Que vous gériez des acomptes, des forfaits, des réparations ou des honoraires, Relancio s'adapte à votre réalité terrain.",
      allFilter: "Tous les métiers",
    },
    customization: {
      tag: "Identité de marque",
      title: "Votre entreprise. Votre identité.",
      subtitle: "Chaque entreprise peut personnaliser son espace Relancio à son image. Vos clients ont l'assurance de payer directement votre enseigne.",
      liveDemoTitle: "Atelier interactif de personnalisation",
      previewNote: "Aperçu en direct du lien de paiement reçu par votre client",
      uploadLogo: "Téléverser votre logo",
      replaceLogo: "Changer le logo",
      deleteLogo: "Supprimer",
      companyNameLabel: "Nom commercial",
      sectorLabel: "Secteur d'activité",
      primaryColorLabel: "Couleur principale",
      secondaryColorLabel: "Couleur secondaire",
      phoneLabel: "Numéro de contact / WhatsApp",
      emailLabel: "Email professionnel",
      presetsTitle: "Ou testez avec des profils pré-configurés :",
      beforeAfterToggle: "Comparer : Sans branding vs Avec votre identité",
    },
    howItWorks: {
      tag: "Parcours guidé",
      title: "Comment ça marche ?",
      subtitle: "Une démarche en 6 étapes simples pour sécuriser votre trésorerie au quotidien.",
    },
    pricing: {
      tag: "Modèle économique équitable",
      title: "Zéro abonnement fixe imposé.",
      noSubscription: "Pas d'abonnement obligatoire.",
      payWhenCollected: "Vous payez lorsque Relancio vous aide à encaisser.",
      desc: "Nous alignons nos intérêts sur votre réussite. Pas de frais mensuels cachés ni de contrat bloquant : notre commission minime ne s'applique que sur les fonds effectivement recouvrés.",
      feature1: "Création de compte gratuite et immédiate",
      feature2: "Nombre illimité de créances et de clients",
      feature3: "Lien de paiement sécurisé à vos couleurs",
      feature4: "Relances automatisées WhatsApp & SMS",
      cta: "Activer mon compte sans engagement",
    },
    dashboard: {
      tag: "Visibilité totale",
      title: "Aperçu de votre futur tableau de bord",
      question: "Combien mes clients me doivent-ils et combien ai-je récupéré ?",
      totalToRecover: "Total à récupérer",
      totalCollected: "Total encaissé",
      clientsToRemind: "Clients à relancer",
      pendingPayments: "Paiements en attente",
      successfulPayments: "Paiements réussis",
      recoveryRate: "Taux de recouvrement",
      recentTransactions: "Dernières créances & encaissements",
    },
    faq: {
      title: "Questions fréquentes",
      subtitle: "Tout ce que vous devez savoir pour démarrer avec Relancio.",
    },
    footer: {
      tagline: "La plateforme moderne qui transforme vos créances impayées en trésorerie disponible.",
      rights: "Tous droits réservés.",
      independentNote: "Relancio — Plateforme SaaS indépendante de gestion de créances et d'encaissement.",
    },
  },
  en: {
    nav: {
      features: "Features",
      sectors: "Industries",
      customization: "Customization",
      howItWorks: "How it works",
      pricing: "Pricing",
      dashboard: "Dashboard",
      login: "Log in",
      getStarted: "Get Started Free",
    },
    hero: {
      taglineBadge: "New • Smart Debt-to-Cash Platform",
      titlePart1: "Turn your receivables into",
      titleHighlight: "payments.",
      subtitle: "Relancio helps you track what your customers owe you, follow up effortlessly, and get paid faster.",
      ctaPrimary: "Get Started Free",
      ctaSecondary: "Discover Relancio",
      badge1: "Zero fixed subscription",
      badge2: "Ready in 2 minutes",
      badge3: "Multi-industry & Multi-currency",
      flowTitle: "The Relancio Cash Flow Loop",
      flowSubtitle: "From an overdue invoice to confirmed collected cash",
    },
    problem: {
      tag: "The daily struggle",
      title: "Do your customers owe you money?",
      subtitle: "Most small and mid-sized businesses lose valuable cash flow due to fragmented, manual debt tracking.",
      p1Title: "Late payments",
      p1Desc: "Overdue invoices stacking up without a clear payment schedule.",
      p2Title: "Awkward follow-ups",
      p2Desc: "The anxiety of demanding owed money without damaging customer relationships.",
      p3Title: "Scattered WhatsApp chats",
      p3Desc: "Lost voice notes, forgotten promises, zero centralized audit trail.",
      p4Title: "Paper notebooks & messy Excel",
      p4Desc: "Lost paper logs, unsynced spreadsheets, and human error.",
      p5Title: "How much is still outstanding?",
      p5Desc: "Inability to accurately forecast available cash flow.",
      p6Title: "Forgotten reminders",
      p6Desc: "The older a debt gets, the lower the probability of recovering it.",
      p7Title: "Lack of visibility",
      p7Desc: "No real-time insight into this month's revenue vs outstanding receivables.",
    },
    solution: {
      tag: "All-in-one platform",
      title: "Relancio centralizes your collections.",
      subtitle: "A frictionless automated journey that turns customer debts into cash in your account.",
      s1Title: "1. Log the receivable",
      s1Desc: "Enter customer, amount, and reason in under 15 seconds.",
      s2Title: "2. Send payment request",
      s2Desc: "Generate a custom, branded payment link tailored to your business.",
      s3Title: "3. Remind your customer",
      s3Desc: "Polite, automatic reminders via WhatsApp and SMS without stress.",
      s4Title: "4. Customer pays",
      s4Desc: "Your customer pays in 1 click via Mobile Money, Card, or Transfer.",
      s5Title: "5. Instant confirmation",
      s5Desc: "Receive real-time notifications the second funds are secured.",
      s6Title: "6. Receivable updated",
      s6Desc: "The balance updates automatically on your dashboard without manual entry.",
    },
    sectors: {
      tag: "Versatile SaaS",
      title: "One powerful tool for multiple trades.",
      subtitle: "Whether you manage deposits, school fees, repairs, or service invoices, Relancio fits your business.",
      allFilter: "All industries",
    },
    customization: {
      tag: "Brand Identity",
      title: "Your business. Your brand.",
      subtitle: "Every business can brand their Relancio space. Your customers feel confident paying your verified brand directly.",
      liveDemoTitle: "Interactive Branding Studio",
      previewNote: "Live preview of the payment link your customer will see",
      uploadLogo: "Upload your logo",
      replaceLogo: "Change logo",
      deleteLogo: "Remove",
      companyNameLabel: "Business Name",
      sectorLabel: "Industry",
      primaryColorLabel: "Primary Color",
      secondaryColorLabel: "Secondary Color",
      phoneLabel: "Contact Phone / WhatsApp",
      emailLabel: "Business Email",
      presetsTitle: "Or test with pre-configured brand presets:",
      beforeAfterToggle: "Compare: Generic vs Branded experience",
    },
    howItWorks: {
      tag: "Simple Roadmap",
      title: "How does it work?",
      subtitle: "A streamlined 6-step roadmap to secure your cash flow every single day.",
    },
    pricing: {
      tag: "Fair Pricing",
      title: "No mandatory subscription.",
      noSubscription: "No mandatory subscription.",
      payWhenCollected: "You only pay when Relancio helps you collect.",
      desc: "Our incentives match yours. No hidden monthly costs, no lock-in contracts: our tiny commission is only charged on funds successfully recovered.",
      feature1: "Instant and free account creation",
      feature2: "Unlimited receivables and customers",
      feature3: "Secure payment links branded with your logo",
      feature4: "Automated WhatsApp & SMS reminders",
      cta: "Get started without commitment",
    },
    dashboard: {
      tag: "Total Clarity",
      title: "Preview your future dashboard",
      question: "How much do my customers owe me, and how much have I collected?",
      totalToRecover: "Total to recover",
      totalCollected: "Total collected",
      clientsToRemind: "Clients to remind",
      pendingPayments: "Pending payments",
      successfulPayments: "Successful payments",
      recoveryRate: "Recovery rate",
      recentTransactions: "Recent receivables & collections",
    },
    faq: {
      title: "Frequently Asked Questions",
      subtitle: "Everything you need to know about getting started with Relancio.",
    },
    footer: {
      tagline: "The modern SaaS platform transforming outstanding receivables into available cash flow.",
      rights: "All rights reserved.",
      independentNote: "Relancio — Independent debt recovery and collection SaaS platform.",
    },
  },
  ar: {
    nav: {
      features: "المميزات",
      sectors: "القطاعات",
      customization: "الهوية والتخصيص",
      howItWorks: "كيف يعمل",
      pricing: "الأسعار",
      dashboard: "لوحة التحكم",
      login: "تسجيل الدخول",
      getStarted: "ابدأ مجاناً",
    },
    hero: {
      taglineBadge: "جديد • منصة تحصيل المستحقات الذكية",
      titlePart1: "حوّل مستحقاتك إلى",
      titleHighlight: "مدفوعات مؤكدة.",
      subtitle: "يساعدك ريلانسيو (Relancio) على متابعة ديون العملاء، وإرسال تذكيرات آلية، وتسهيل الدفع الفوري.",
      ctaPrimary: "ابدأ مجاناً الآن",
      ctaSecondary: "اكتشف ريلانسيو",
      badge1: "بدون اشتراك شهري إلزامي",
      badge2: "جاهز خلال دقيقتين",
      badge3: "متعدد العملات والقطاعات",
      flowTitle: "دورة التحصيل السلسة",
      flowSubtitle: "من مطالبة معلقة إلى سيولة نقدية محصلة فوراً",
    },
    problem: {
      tag: "المشكلة اليومية",
      title: "هل يدين لك عملاؤك بالمال؟",
      subtitle: "تفقد العديد من الشركات والمهنيين مبالغ ضخمة سنوياً بسبب التتبع اليدوي العشوائي للمستحقات.",
      p1Title: "تأخر المدفوعات",
      p1Desc: "فواتير متراكمة دون تواريخ سداد واضحة.",
      p2Title: "إحراج تذكير العملاء",
      p2Desc: "التردد في طلب الحقوق خوفاً من خسارة العلاقة مع العميل.",
      p3Title: "متابعة مشتتة عبر واتساب",
      p3Desc: "تسجيلات صوتية تائهة ووعود شفهية دون سجل مركزي.",
      p4Title: "دفاتر ورقية وجداول إكسل",
      p4Desc: "سجلات مفقودة وأخطاء إدخال بشرية متكررة.",
      p5Title: "كم تبقى لتحصيله؟",
      p5Desc: "صعوبة معرفة حجم السيولة العالقة خارج شركتك بدقة.",
      p6Title: "نسيان المتابعة",
      p6Desc: "كلما طال الوقت، قلت فرص استرداد أموالك.",
      p7Title: "انعدام الرؤية المالية",
      p7Desc: "غياب تقارير واضحة حول المداخيل المتوقعة والمحققة.",
    },
    solution: {
      tag: "الحل المتكامل",
      title: "ريلانسيو يوحّد تحصيلاتك المالية.",
      subtitle: "مسار رقمي ميسر يحول المستحقات إلى أموال نقدية محصلة بسرعة.",
      s1Title: "1. سجّل المستحق",
      s1Desc: "أدخل بيانات العميل والمبلغ وسبب المطالبة في ثوانٍ.",
      s2Title: "2. أرسل رابط الدفع",
      s2Desc: "أنشئ رابط دفع يحمل هوية وشعار شركتك بالكامل.",
      s3Title: "3. تذكير آلي للعميل",
      s3Desc: "تذكيرات لبقة ومنتظمة عبر واتساب والرسائل القصيرة.",
      s4Title: "4. يدفع العميل",
      s4Desc: "يسدد العميل بنقرة واحدة عبر المحافظ الإلكترونية أو البطاقة.",
      s5Title: "5. تأكيد فوري",
      s5Desc: "إشعار فوري عند اكتمال عملية السداد بنجاح.",
      s6Title: "6. إغلاق المطالبة تلقائياً",
      s6Desc: "تحديث مباشر للأرصدة في لوحة التحكم دون جهد يدوي.",
    },
    sectors: {
      tag: "لكل المهن",
      title: "أداة واحدة لمختلف الأنشطة التجارية.",
      subtitle: "مغاسل، مدارس، ورش سيارات، صالونات تجميل، تجارة وتجزئة وخدمات.",
      allFilter: "جميع القطاعات",
    },
    customization: {
      tag: "هويتك التجارية",
      title: "شركتك. هويتك المستقلة.",
      subtitle: "خصص مظهر الروابط وفواتير الدفع بشعارك وألوانك لتمنح عميلك ثقة مطلقة.",
      liveDemoTitle: "استوديو التخصيص التفاعلي",
      previewNote: "معاينة حية لصفحة الدفع التي يستقبلها عميلك",
      uploadLogo: "رفع الشعار",
      replaceLogo: "تغيير الشعار",
      deleteLogo: "حذف",
      companyNameLabel: "اسم المؤسسة",
      sectorLabel: "النشاط التجاري",
      primaryColorLabel: "اللون الأساسي",
      secondaryColorLabel: "اللون الثانوي",
      phoneLabel: "رقم الهاتف / واتساب",
      emailLabel: "البريد الإلكتروني",
      presetsTitle: "أو جرب نماذج جاهزة لأنشطة مختلفة:",
      beforeAfterToggle: "مقارنة: نموذج افتراضي مقابل هوية علامتك",
    },
    howItWorks: {
      tag: "خطوات واضحة",
      title: "كيف يعمل ريلانسيو؟",
      subtitle: "6 خطوات محكمة لتأمين السيولة النقدية لعملك يومياً.",
    },
    pricing: {
      tag: "نموذج اقتصادي عادل",
      title: "لا يوجد اشتراك شهري إلزامي.",
      noSubscription: "بدون اشتراك إلزامي.",
      payWhenCollected: "تدفع فقط عندما يساعدك ريلانسيو في التحصيل الفعلي.",
      desc: "نحن نربح عندما تنجح في تحصيل أموالك. لا رسوم خفية، نسبة يسيرة فقط على المبالغ المحصلة بنجاح.",
      feature1: "إنشاء حساب مجاني وفوري",
      feature2: "عدد غير محدود من المطالبات والعملاء",
      feature3: "روابط دفع آمنة بشعارك وألوانك",
      feature4: "تذكيرات ذكية عبر واتساب والرسائل",
      cta: "ابدأ الآن بدون التزام",
    },
    dashboard: {
      tag: "رؤية شاملة",
      title: "معاينة لوحة التحكم الخاصة بك",
      question: "كم يدين لي العملاء، وكم تم تحصيله بالفعل؟",
      totalToRecover: "إجمالي المستحقات للتحصيل",
      totalCollected: "إجمالي المبالغ المحصلة",
      clientsToRemind: "عملاء بحاجة لتذكير",
      pendingPayments: "دفعات قيد الانتظار",
      successfulPayments: "دفعات ناجحة",
      recoveryRate: "نسبة التحصيل",
      recentTransactions: "أحدث العمليات والمستحقات",
    },
    faq: {
      title: "الأسئلة الشائعة",
      subtitle: "كل ما تود معرفته عن منصة ريلانسيو.",
    },
    footer: {
      tagline: "المنصة السحابية التي تحول ديونك المتأخرة إلى سيولة نقدية في حسابك.",
      rights: "جميع الحقوق محفوظة.",
      independentNote: "ريلانسيو — منصة SaaS مستقلة لإدارة المستحقات والتحصيل المالي.",
    },
  },
};
