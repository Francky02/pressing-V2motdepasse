import type { SupportedLocale } from '../types';

export interface CommonTranslations {
  actions: string;
  save: string;
  saving: string;
  cancel: string;
  delete: string;
  edit: string;
  close: string;
  search: string;
  filter: string;
  all: string;
  refresh: string;
  loading: string;
  export: string;
  copy: string;
  copied: string;
  back: string;
  confirm: string;
  status: string;
  amount: string;
  total: string;
  balance: string;
  date: string;
  dueDate: string;
  client: string;
  phone: string;
  email: string;
  notes: string;
  reference: string;
  paymentMethod: string;
  details: string;
  success: string;
  error: string;
  noData: string;
  active: string;
  inactive: string;
  currency: string;
  statusLabels: {
    en_attente: string;
    partiellement_payee: string;
    payee: string;
    en_retard: string;
    expire: string;
    annule: string;
  };
}

export interface LayoutTranslations {
  dashboard: string;
  clients: string;
  creances: string;
  paymentLinks: string;
  payments: string;
  reminders: string;
  settings: string;
  logout: string;
  isolatedTenant: string;
  loadingWorkspace: string;
  myCompany: string;
  switchLang: string;
}

export interface DashboardPortalTranslations {
  welcome: string;
  welcomeSubtitle: string;
  totalToRecover: string;
  totalCollected: string;
  overdueDebts: string;
  activeClients: string;
  recoveryRate: string;
  quickActions: string;
  newReceivable: string;
  newClient: string;
  sendReminders: string;
  generateLink: string;
  recentReceivables: string;
  recentPayments: string;
  recentActivity: string;
  viewAll: string;
  noReceivablesYet: string;
  noPaymentsYet: string;
  noActivityYet: string;
  unpaidDebtsCount: string;
  overdueCount: string;
  clientsToRemind: string;
}

export interface ClientsTranslations {
  title: string;
  subtitle: string;
  newClient: string;
  editClient: string;
  clientDetails: string;
  filterAll: string;
  filterActive: string;
  filterWithBalance: string;
  name: string;
  company: string;
  individual: string;
  type: string;
  address: string;
  receivablesCount: string;
  totalOwed: string;
  totalPaid: string;
  outstandingBalance: string;
  noClientsFound: string;
  createSuccess: string;
  updateSuccess: string;
  archiveSuccess: string;
  reactivateSuccess: string;
  archiveConfirm: string;
  clientSince: string;
  receivablesHistory: string;
  paymentsHistory: string;
  quickCreateReceivable: string;
}

export interface CreancesTranslations {
  title: string;
  subtitle: string;
  newReceivable: string;
  filterAll: string;
  filterPending: string;
  filterPartial: string;
  filterPaid: string;
  filterOverdue: string;
  motif: string;
  description: string;
  initialAmount: string;
  paidAmount: string;
  remainingBalance: string;
  creationDate: string;
  dueDate: string;
  selectClient: string;
  addNewClientFast: string;
  recordPayment: string;
  generatePaymentLink: string;
  sendWhatsAppReminder: string;
  paymentHistory: string;
  remindersSummary: string;
  remindersSentCount: string;
  lastReminder: string;
  nextReminder: string;
  noCreancesFound: string;
  createSuccess: string;
  paymentRecordedSuccess: string;
  paymentAmount: string;
  paymentDate: string;
  paymentMethodPlaceholder: string;
  fullBalance: string;
  partialPaymentNotice: string;
  previewLink: string;
  copiedLink: string;
}

export interface DemandesTranslations {
  title: string;
  subtitle: string;
  newLink: string;
  filterAll: string;
  filterActive: string;
  filterPaid: string;
  filterExpired: string;
  filterCancelled: string;
  token: string;
  targetReceivable: string;
  requestedAmount: string;
  expiresOn: string;
  expiresIn: string;
  days: string;
  validityDuration: string;
  sevenDays: string;
  fourteenDays: string;
  thirtyDays: string;
  customDate: string;
  copyLink: string;
  linkCopied: string;
  shareWhatsApp: string;
  openPublicPage: string;
  cancelLink: string;
  cancelConfirm: string;
  createSuccess: string;
  cancelSuccess: string;
  createdModalTitle: string;
  createdModalSubtitle: string;
  directLinkNotice: string;
  noDemandesFound: string;
}

export interface PaiementsTranslations {
  title: string;
  subtitle: string;
  totalCollected: string;
  totalTransactions: string;
  paymentDate: string;
  client: string;
  motif: string;
  amount: string;
  method: string;
  reference: string;
  notes: string;
  receiptTitle: string;
  receiptSubtitle: string;
  printReceipt: string;
  noPaymentsFound: string;
  recordedBy: string;
}

export interface RelancesTranslations {
  title: string;
  subtitle: string;
  tabManual: string;
  tabAutomated: string;
  tabHistory: string;
  criticalOverdue: string;
  upcomingDue: string;
  allUnpaid: string;
  upToDate: string;
  allDebtsSettled: string;
  congratulationsNoDebts: string;
  sendWhatsApp: string;
  previewMessage: string;
  customMessage: string;
  sendDirectWhatsApp: string;
  copyMessage: string;
  messageCopied: string;
  automatedTitle: string;
  automatedSubtitle: string;
  enableAutomation: string;
  activeAutomationNotice: string;
  inactiveAutomationNotice: string;
  milestonesTitle: string;
  saveAutoSettings: string;
  settingsSaved: string;
  logsTitle: string;
  logsSubtitle: string;
  channel: string;
  sentAt: string;
  milestone: string;
  deliveryStatus: string;
  statusSent: string;
  statusFailed: string;
  statusCancelled: string;
  noLogsFound: string;
  milestones: {
    m_j_minus_7: string;
    m_j_minus_3: string;
    m_j_0: string;
    m_j_plus_3: string;
    m_j_plus_7: string;
    m_j_plus_14: string;
    m_j_plus_30: string;
  };
}

export interface SettingsTranslations {
  title: string;
  subtitle: string;
  companyInfo: string;
  companyName: string;
  managerName: string;
  professionalEmail: string;
  phoneWhatsApp: string;
  sector: string;
  address: string;
  branding: string;
  logo: string;
  uploadLogo: string;
  changeLogo: string;
  deleteLogo: string;
  primaryColor: string;
  secondaryColor: string;
  colorPresets: string;
  saveChanges: string;
  savedSuccess: string;
  logoDeletedSuccess: string;
  saveError: string;
}

export interface PublicPaymentTranslations {
  title: string;
  secureCheckout: string;
  billedTo: string;
  invoiceReference: string;
  initialAmount: string;
  amountAlreadyPaid: string;
  remainingToPay: string;
  dueDate: string;
  paymentMethods: string;
  mobileMoney: string;
  bankCard: string;
  bankTransfer: string;
  payNow: string;
  simulatePayment: string;
  simulationNotice: string;
  enterPaymentDetails: string;
  confirmPayment: string;
  processing: string;
  paymentSuccess: string;
  successSubtitle: string;
  receiptAvailable: string;
  securedByRelancio: string;
  sslEncryption: string;
  linkExpired: string;
  linkCancelled: string;
  contactMerchant: string;
  selectLanguage: string;
}

export interface AuthTranslations {
  loginTitle: string;
  loginSubtitle: string;
  registerTitle: string;
  registerSubtitle: string;
  emailOrPhone: string;
  password: string;
  confirmPassword: string;
  passwordMismatch: string;
  passwordMinLength: string;
  registerBadge: string;
  creatingAccount: string;
  guaranteeNoSubscription: string;
  guaranteeSecure: string;
  guaranteeInstantAccess: string;
  companyName: string;
  fullName: string;
  sector: string;
  phone: string;
  loginBtn: string;
  registerBtn: string;
  alreadyAccount: string;
  noAccount: string;
  signIn: string;
  signUp: string;
  demoAccounts: string;
  fillSuperAdmin: string;
  fillPressingAdmin: string;
  sessionEncrypted: string;
  termsNotice: string;
  onboardingStep: string;
  onboardingOf: string;
  step1Title: string;
  step1Subtitle: string;
  step2Title: string;
  step2Subtitle: string;
  step3Title: string;
  step3Subtitle: string;
  readyNotice: string;
  finishOnboarding: string;
  next: string;
  previous: string;
  expressConfig: string;
  forgotPassword: string;
  forgotPasswordTitle: string;
  forgotPasswordSubtitle: string;
  sendResetLink: string;
  resetLinkSent: string;
  resetPasswordTitle: string;
  resetPasswordSubtitle: string;
  newPassword: string;
  confirmNewPassword: string;
  resetPasswordBtn: string;
  resetSuccessTitle: string;
  resetSuccessSubtitle: string;
  backToLogin: string;
  invalidTokenTitle: string;
  invalidTokenSubtitle: string;
  requestNewLink: string;
  sectors: {
    pressing: string;
    ecole: string;
    garage: string;
    salon: string;
    commerce: string;
    artisan: string;
    services: string;
    autre: string;
  };
}

export interface AdminTranslations {
  title: string;
  subtitle: string;
  realTimeUpdate: string;
  totalCompanies: string;
  activeCompanies: string;
  inactiveCompanies: string;
  totalUsers: string;
  proAccounts: string;
  authorizedToCollect: string;
  accessSuspended: string;
  adminsCount: string;
  companiesList: string;
  companiesSubtitle: string;
  companyName: string;
  manager: string;
  createdDate: string;
  status: string;
  actions: string;
  activate: string;
  deactivate: string;
  viewDetails: string;
  recentActivities: string;
  superAdminBadge: string;
  logout: string;
  sessionChecking: string;
  registeredOn: string;
  color: string;
  close: string;
  deactivateThisCompany: string;
  reactivateThisCompany: string;
}

export interface PlaceholderTranslations {
  underConstruction: string;
  readyArchitecture: string;
  tenantCompany: string;
  tenantId: string;
  backToDashboard: string;
}

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

  // Modular Application Sections
  common: CommonTranslations;
  layout: LayoutTranslations;
  dashboardPortal: DashboardPortalTranslations;
  clients: ClientsTranslations;
  creances: CreancesTranslations;
  demandes: DemandesTranslations;
  paiements: PaiementsTranslations;
  relances: RelancesTranslations;
  settings: SettingsTranslations;
  publicPayment: PublicPaymentTranslations;
  auth: AuthTranslations;
  admin: AdminTranslations;
  placeholder: PlaceholderTranslations;
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

    // Modular App - FR
    common: {
      actions: "Actions",
      save: "Enregistrer",
      saving: "Enregistrement...",
      cancel: "Annuler",
      delete: "Supprimer",
      edit: "Modifier",
      close: "Fermer",
      search: "Rechercher...",
      filter: "Filtrer",
      all: "Tous",
      refresh: "Actualiser",
      loading: "Chargement en cours...",
      export: "Exporter",
      copy: "Copier",
      copied: "Copié !",
      back: "Retour",
      confirm: "Confirmer",
      status: "Statut",
      amount: "Montant",
      total: "Total",
      balance: "Solde",
      date: "Date",
      dueDate: "Date d'échéance",
      client: "Client",
      phone: "Téléphone",
      email: "Email",
      notes: "Notes",
      reference: "Référence",
      paymentMethod: "Moyen de paiement",
      details: "Détails",
      success: "Succès",
      error: "Erreur",
      noData: "Aucune donnée disponible",
      active: "Actif",
      inactive: "Inactif",
      currency: "FCFA",
      statusLabels: {
        en_attente: "En attente",
        partiellement_payee: "Partiellement payée",
        payee: "Payée",
        en_retard: "En retard",
        expire: "Expiré",
        annule: "Annulé",
      },
    },

    layout: {
      dashboard: "Tableau de bord",
      clients: "Clients",
      creances: "Créances",
      paymentLinks: "Liens de paiement",
      payments: "Paiements",
      reminders: "Relances",
      settings: "Paramètres",
      logout: "Déconnexion",
      isolatedTenant: "Espace Isolé",
      loadingWorkspace: "Chargement de votre espace sécurisé...",
      myCompany: "Mon Entreprise",
      switchLang: "Changer de langue",
    },

    dashboardPortal: {
      welcome: "Bienvenue sur votre espace",
      welcomeSubtitle: "Suivez l'état de vos créances et encaissez sans stress.",
      totalToRecover: "Total à récupérer",
      totalCollected: "Total encaissé",
      overdueDebts: "Créances en retard",
      activeClients: "Clients actifs",
      recoveryRate: "Taux de recouvrement",
      quickActions: "Actions rapides",
      newReceivable: "Nouvelle Créance",
      newClient: "Nouveau Client",
      sendReminders: "Relances WhatsApp",
      generateLink: "Générer un Lien",
      recentReceivables: "Dernières créances",
      recentPayments: "Derniers encaissements",
      recentActivity: "Journal d'activité récent",
      viewAll: "Voir tout",
      noReceivablesYet: "Aucune créance enregistrée pour le moment.",
      noPaymentsYet: "Aucun encaissement enregistré pour le moment.",
      noActivityYet: "Aucune activité récente enregistrée.",
      unpaidDebtsCount: "créances en cours",
      overdueCount: "en retard critique",
      clientsToRemind: "Clients à relancer",
    },

    clients: {
      title: "Gestion des Clients",
      subtitle: "Suivez vos clients, leur historique de prestations et leurs soldes débiteurs.",
      newClient: "Nouveau Client",
      editClient: "Modifier le Client",
      clientDetails: "Fiche Client Détail",
      filterAll: "Tous les clients",
      filterActive: "Clients actifs",
      filterWithBalance: "Avec solde débiteur",
      name: "Nom complet / Raison sociale",
      company: "Entreprise",
      individual: "Particulier",
      type: "Type de client",
      address: "Adresse physique",
      receivablesCount: "Créances",
      totalOwed: "Total facturé",
      totalPaid: "Total réglé",
      outstandingBalance: "Solde restant dû",
      noClientsFound: "Aucun client ne correspond à votre recherche.",
      createSuccess: "Client créé avec succès.",
      updateSuccess: "Informations client mises à jour.",
      archiveSuccess: "Client archivé avec succès.",
      reactivateSuccess: "Client réactivé avec succès.",
      archiveConfirm: "Êtes-vous sûr de vouloir archiver ce client ?",
      clientSince: "Client depuis le",
      receivablesHistory: "Historique des créances",
      paymentsHistory: "Historique des règlements",
      quickCreateReceivable: "Créer une créance",
    },

    creances: {
      title: "Gestion des Créances",
      subtitle: "Suivez vos prestations, dates d'échéances et encaissez vos acomptes.",
      newReceivable: "Nouvelle Créance",
      filterAll: "Toutes les créances",
      filterPending: "En attente",
      filterPartial: "Partielles",
      filterPaid: "Soldées / Payées",
      filterOverdue: "En retard",
      motif: "Motif de la prestation",
      description: "Description détaillée",
      initialAmount: "Montant initial",
      paidAmount: "Déjà encaissé",
      remainingBalance: "Solde restant",
      creationDate: "Date de création",
      dueDate: "Date d'échéance",
      selectClient: "Sélectionner un client...",
      addNewClientFast: "Ajout rapide d'un client",
      recordPayment: "Enregistrer un règlement",
      generatePaymentLink: "Générer un lien",
      sendWhatsAppReminder: "Relancer sur WhatsApp",
      paymentHistory: "Historique des règlements",
      remindersSummary: "Historique des relances",
      remindersSentCount: "relance(s) envoyée(s)",
      lastReminder: "Dernière relance",
      nextReminder: "Prochaine relance",
      noCreancesFound: "Aucune créance ne correspond à vos critères.",
      createSuccess: "Créance créée avec succès !",
      paymentRecordedSuccess: "Règlement enregistré avec succès !",
      paymentAmount: "Montant du règlement",
      paymentDate: "Date du règlement",
      paymentMethodPlaceholder: "Moyen de paiement (ex: Wave, Espèces, Virement)",
      fullBalance: "Régler la totalité du solde",
      partialPaymentNotice: "Ce montant sera immédiatement déduit du solde de la créance.",
      previewLink: "Lien de paiement généré",
      copiedLink: "Lien copié dans le presse-papier !",
    },

    demandes: {
      title: "Liens de Paiement",
      subtitle: "Générez des liens de règlement direct à envoyer à vos clients par WhatsApp ou SMS.",
      newLink: "Créer un lien de paiement",
      filterAll: "Tous les liens",
      filterActive: "Actifs / En attente",
      filterPaid: "Payés",
      filterExpired: "Expirés",
      filterCancelled: "Annulés",
      token: "Jeton",
      targetReceivable: "Créance concernée",
      requestedAmount: "Montant demandé",
      expiresOn: "Expire le",
      expiresIn: "Expire dans",
      days: "jours",
      validityDuration: "Durée de validité du lien",
      sevenDays: "7 jours",
      fourteenDays: "14 jours (Recommandé)",
      thirtyDays: "30 jours",
      customDate: "Date personnalisée",
      copyLink: "Copier le lien",
      linkCopied: "Lien copié avec succès !",
      shareWhatsApp: "Partager sur WhatsApp",
      openPublicPage: "Tester la page client",
      cancelLink: "Désactiver le lien",
      cancelConfirm: "Voulez-vous désactiver ce lien ? Les futurs paiements seront bloqués.",
      createSuccess: "Lien de paiement créé avec succès !",
      cancelSuccess: "Le lien de paiement a été désactivé.",
      createdModalTitle: "Lien de paiement prêt !",
      createdModalSubtitle: "Partagez directement ce lien à votre client.",
      directLinkNotice: "Le client accède à une page sécurisée à vos couleurs pour régler en 1 clic.",
      noDemandesFound: "Aucun lien de paiement trouvé.",
    },

    paiements: {
      title: "Historique des Paiements",
      subtitle: "Consultez tous les règlements et acomptes enregistrés sur vos créances.",
      totalCollected: "Total encaissé",
      totalTransactions: "Paiements enregistrés",
      paymentDate: "Date d'encaissement",
      client: "Client",
      motif: "Motif de la créance",
      amount: "Montant réglé",
      method: "Moyen de paiement",
      reference: "Référence",
      notes: "Notes / Reçu",
      receiptTitle: "Reçu de Paiement",
      receiptSubtitle: "Détails certifiés de la transaction",
      printReceipt: "Imprimer le reçu",
      noPaymentsFound: "Aucun paiement enregistré pour le moment.",
      recordedBy: "Encaissé par le compte entreprise",
    },

    relances: {
      title: "Relances & Recouvrement WhatsApp",
      subtitle: "Gérez vos rappels polis et configurez vos relances automatiques pour encaisser plus vite.",
      tabManual: "Relances Manuelles",
      tabAutomated: "Relances Automatiques",
      tabHistory: "Journal des Envois",
      criticalOverdue: "Retards critiques",
      upcomingDue: "Échéances proches (J-3 / J0)",
      allUnpaid: "Toutes les dettes en cours",
      upToDate: "À jour",
      allDebtsSettled: "Toutes vos créances sont soldées !",
      congratulationsNoDebts: "Félicitations ! Aucun client n'a de retard de paiement actuellement.",
      sendWhatsApp: "Relancer sur WhatsApp",
      previewMessage: "Aperçu du message WhatsApp",
      customMessage: "Personnaliser le texte de la relance",
      sendDirectWhatsApp: "Ouvrir WhatsApp Web / App",
      copyMessage: "Copier le message",
      messageCopied: "Message copié dans le presse-papier !",
      automatedTitle: "Automatisation des Relances WhatsApp",
      automatedSubtitle: "Relancio surveille vos créances et envoie un rappel courtois à chaque étape clé.",
      enableAutomation: "Activer les relances automatiques quotidiennes",
      activeAutomationNotice: "L'automatisation est active. Les relances programmées sont envoyées chaque matin.",
      inactiveAutomationNotice: "L'automatisation est en pause. Activez-la pour sécuriser vos règlements.",
      milestonesTitle: "Jalons temporels à activer",
      saveAutoSettings: "Enregistrer la configuration",
      settingsSaved: "Paramètres de relance automatique enregistrés !",
      logsTitle: "Historique des Relances",
      logsSubtitle: "Journal complet de tous les messages envoyés à vos clients.",
      channel: "Canal",
      sentAt: "Envoyé le",
      milestone: "Jalon",
      deliveryStatus: "Statut",
      statusSent: "Envoyé",
      statusFailed: "Échec",
      statusCancelled: "Annulé",
      noLogsFound: "Aucune relance consignée dans l'historique.",
      milestones: {
        m_j_minus_7: "J-7 (Préventif - 7 jours avant)",
        m_j_minus_3: "J-3 (Rappel courtois - 3 jours avant)",
        m_j_0: "J0 (Jour d'échéance)",
        m_j_plus_3: "J+3 (Première relance - 3 jours de retard)",
        m_j_plus_7: "J+7 (Relance ferme - 7 jours de retard)",
        m_j_plus_14: "J+14 (Mise en demeure - 14 jours de retard)",
        m_j_plus_30: "J+30 (Dernier avis - 30 jours de retard)",
      },
    },

    settings: {
      title: "Paramètres de l'Entreprise",
      subtitle: "Gérez votre identité commerciale, vos couleurs de marque et vos coordonnées.",
      companyInfo: "Informations Générales",
      companyName: "Nom commercial",
      managerName: "Nom du responsable",
      professionalEmail: "Email professionnel",
      phoneWhatsApp: "Numéro de contact / WhatsApp",
      sector: "Secteur d'activité",
      address: "Adresse physique",
      branding: "Identité Visuelle & Couleurs",
      logo: "Logo de l'entreprise",
      uploadLogo: "Téléverser un logo",
      changeLogo: "Changer le logo",
      deleteLogo: "Supprimer le logo",
      primaryColor: "Couleur principale",
      secondaryColor: "Couleur secondaire",
      colorPresets: "Palettes pré-définies",
      saveChanges: "Enregistrer les modifications",
      savedSuccess: "Modifications enregistrées avec succès.",
      logoDeletedSuccess: "Logo supprimé avec succès.",
      saveError: "Erreur lors de l'enregistrement des modifications.",
    },

    publicPayment: {
      title: "Paiement Sécurisé",
      secureCheckout: "Espace de Règlement Sécurisé",
      billedTo: "Facturé à",
      invoiceReference: "Référence créance",
      initialAmount: "Montant initial",
      amountAlreadyPaid: "Montant déjà réglé",
      remainingToPay: "Montant à régler",
      dueDate: "Date d'échéance",
      paymentMethods: "Sélectionnez votre moyen de règlement",
      mobileMoney: "Mobile Money (Wave, Orange Money, MTN, Moov)",
      bankCard: "Carte Bancaire (Visa, Mastercard)",
      bankTransfer: "Virement Bancaire",
      payNow: "Payer maintenant",
      simulatePayment: "Simuler un paiement test (Démo)",
      simulationNotice: "Mode démonstration : valide instantanément ce règlement pour tester le flux sans débit réel.",
      enterPaymentDetails: "Confirmez le règlement",
      confirmPayment: "Valider le paiement",
      processing: "Traitement sécurisé en cours...",
      paymentSuccess: "Paiement Réussi !",
      successSubtitle: "Votre règlement a été enregistré et votre créance est immédiatement mise à jour.",
      receiptAvailable: "Votre reçu de paiement électronique est validé.",
      securedByRelancio: "Infrastructure de paiement sécurisée Relancio",
      sslEncryption: "Chiffrement SSL 256-bit certifié",
      linkExpired: "Ce lien de paiement a expiré.",
      linkCancelled: "Ce lien de paiement a été désactivé par l'émetteur.",
      contactMerchant: "Veuillez contacter directement votre prestataire pour obtenir un nouveau lien.",
      selectLanguage: "Langue",
    },

    auth: {
      loginTitle: "Connexion Entreprise",
      loginSubtitle: "Accédez à votre espace sécurisé Relancio",
      registerTitle: "Commencer avec Relancio",
      registerSubtitle: "Enregistrez vos créances et facilitez les paiements de vos clients dès aujourd'hui.",
      emailOrPhone: "Numéro WhatsApp ou Email",
      password: "Mot de passe",
      confirmPassword: "Confirmer le mot de passe",
      passwordMismatch: "Les mots de passe ne correspondent pas.",
      passwordMinLength: "Le mot de passe doit comporter au moins 6 caractères.",
      registerBadge: "Création de compte Entreprise",
      creatingAccount: "Création du compte en cours...",
      guaranteeNoSubscription: "0€ d'abonnement obligatoire",
      guaranteeSecure: "Données isolées et sécurisées",
      guaranteeInstantAccess: "Accès immédiat",
      companyName: "Nom de l'entreprise",
      fullName: "Nom et prénom du responsable",
      sector: "Secteur d'activité principal",
      phone: "Téléphone / WhatsApp",
      loginBtn: "Se connecter à mon espace",
      registerBtn: "Créer mon compte entreprise",
      alreadyAccount: "Déjà un compte ?",
      noAccount: "Pas encore de compte ?",
      signIn: "Se connecter",
      signUp: "Créer un compte",
      demoAccounts: "Comptes de démonstration rapide",
      fillSuperAdmin: "Tester en Super Administrateur",
      fillPressingAdmin: "Tester avec le Pressing pilote",
      sessionEncrypted: "Session chiffrée et protégée par double authentification",
      termsNotice: "En vous inscrivant, vous acceptez nos conditions d'utilisation et notre politique de confidentialité.",
      onboardingStep: "Étape",
      onboardingOf: "sur",
      step1Title: "Créez votre profil d'entreprise",
      step1Subtitle: "Personnalisez votre espace Relancio en moins d'une minute.",
      step2Title: "Enregistrez votre première créance",
      step2Subtitle: "Saisissez ce qu'un client vous doit pour tester l'encaissement.",
      step3Title: "Votre lien de paiement est prêt !",
      step3Subtitle: "Votre client recevra ce lien direct pour vous régler en toute sécurité.",
      readyNotice: "Configuration Express terminée avec succès !",
      finishOnboarding: "Finaliser et ouvrir mon espace",
      next: "Continuer",
      previous: "Précédent",
      expressConfig: "Configuration Express",
      forgotPassword: "Mot de passe oublié ?",
      forgotPasswordTitle: "Récupération de mot de passe",
      forgotPasswordSubtitle: "Saisissez l'adresse e-mail associée à votre compte Relancio pour recevoir un lien de réinitialisation sécurisé.",
      sendResetLink: "Envoyer le lien de réinitialisation",
      resetLinkSent: "Si un compte correspond à cette adresse, un lien de réinitialisation vient d'être envoyé.",
      resetPasswordTitle: "Nouveau mot de passe",
      resetPasswordSubtitle: "Définissez un nouveau mot de passe sécurisé pour votre compte Relancio.",
      newPassword: "Nouveau mot de passe",
      confirmNewPassword: "Confirmer le nouveau mot de passe",
      resetPasswordBtn: "Modifier mon mot de passe",
      resetSuccessTitle: "Mot de passe modifié avec succès !",
      resetSuccessSubtitle: "Votre mot de passe a été mis à jour. Vous pouvez dès à présent vous connecter à votre espace.",
      backToLogin: "Retour à la page de connexion",
      invalidTokenTitle: "Lien invalide ou expiré",
      invalidTokenSubtitle: "Ce lien de réinitialisation n'est plus valide ou a déjà été utilisé. Veuillez effectuer une nouvelle demande.",
      requestNewLink: "Demander un nouveau lien",
      sectors: {
        pressing: "Pressing & Blanchisserie",
        ecole: "École & Éducation",
        garage: "Garage & Réparation Auto",
        salon: "Salon de coiffure & Beauté",
        commerce: "Commerce & Vente de détail",
        artisan: "Artisan & BTP",
        services: "Entreprise de services & Conseil",
        autre: "Autre activité professionnelle",
      },
    },

    admin: {
      title: "Supervision Globale de la Plateforme",
      subtitle: "Supervision des entreprises clientes, volumétrie et santé de la plateforme.",
      realTimeUpdate: "Mise à jour en temps réel",
      totalCompanies: "Entreprises totales",
      activeCompanies: "Entreprises actives",
      inactiveCompanies: "Entreprises désactivées",
      totalUsers: "Utilisateurs inscrits",
      proAccounts: "Comptes professionnels",
      authorizedToCollect: "Autorisées à encaisser",
      accessSuspended: "Accès suspendu",
      adminsCount: "Admins & Super Admin",
      companiesList: "Gestion des Entreprises Clientes",
      companiesSubtitle: "Contrôle d'accès et supervision des tenants de la plateforme",
      companyName: "Entreprise",
      manager: "Responsable",
      createdDate: "Date d'inscription",
      status: "Statut",
      actions: "Actions",
      activate: "Activer",
      deactivate: "Désactiver",
      viewDetails: "Consulter",
      recentActivities: "Journal d'Activité Récent",
      superAdminBadge: "SUPER ADMIN CONSOLE",
      logout: "Déconnexion",
      sessionChecking: "Vérification de la session Super Admin...",
      registeredOn: "Inscrit le :",
      color: "Couleur :",
      close: "Fermer",
      deactivateThisCompany: "Désactiver cette entreprise",
      reactivateThisCompany: "Réactiver cette entreprise",
    },

    placeholder: {
      underConstruction: "Module en préparation",
      readyArchitecture: "Architecture prête & isolation activée",
      tenantCompany: "Entreprise :",
      tenantId: "Identifiant tenant :",
      backToDashboard: "Retourner au Tableau de bord",
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

    // Modular App - EN
    common: {
      actions: "Actions",
      save: "Save",
      saving: "Saving...",
      cancel: "Cancel",
      delete: "Delete",
      edit: "Edit",
      close: "Close",
      search: "Search...",
      filter: "Filter",
      all: "All",
      refresh: "Refresh",
      loading: "Loading...",
      export: "Export",
      copy: "Copy",
      copied: "Copied!",
      back: "Back",
      confirm: "Confirm",
      status: "Status",
      amount: "Amount",
      total: "Total",
      balance: "Balance",
      date: "Date",
      dueDate: "Due Date",
      client: "Customer",
      phone: "Phone",
      email: "Email",
      notes: "Notes",
      reference: "Reference",
      paymentMethod: "Payment Method",
      details: "Details",
      success: "Success",
      error: "Error",
      noData: "No data available",
      active: "Active",
      inactive: "Inactive",
      currency: "FCFA",
      statusLabels: {
        en_attente: "Pending",
        partiellement_payee: "Partially Paid",
        payee: "Paid in Full",
        en_retard: "Overdue",
        expire: "Expired",
        annule: "Cancelled",
      },
    },

    layout: {
      dashboard: "Dashboard",
      clients: "Customers",
      creances: "Receivables",
      paymentLinks: "Payment Links",
      payments: "Payments",
      reminders: "Reminders",
      settings: "Settings",
      logout: "Log Out",
      isolatedTenant: "Isolated Workspace",
      loadingWorkspace: "Loading secure workspace...",
      myCompany: "My Business",
      switchLang: "Change Language",
    },

    dashboardPortal: {
      welcome: "Welcome to your workspace",
      welcomeSubtitle: "Monitor receivables and get paid effortlessly.",
      totalToRecover: "Total to Recover",
      totalCollected: "Total Collected",
      overdueDebts: "Overdue Receivables",
      activeClients: "Active Customers",
      recoveryRate: "Recovery Rate",
      quickActions: "Quick Actions",
      newReceivable: "New Receivable",
      newClient: "New Customer",
      sendReminders: "WhatsApp Reminders",
      generateLink: "Generate Link",
      recentReceivables: "Recent Receivables",
      recentPayments: "Recent Payments",
      recentActivity: "Recent Activity Log",
      viewAll: "View all",
      noReceivablesYet: "No receivables logged yet.",
      noPaymentsYet: "No payments recorded yet.",
      noActivityYet: "No recent activity recorded.",
      unpaidDebtsCount: "open receivables",
      overdueCount: "critically overdue",
      clientsToRemind: "Clients to remind",
    },

    clients: {
      title: "Customer Management",
      subtitle: "Track customer history, pending balances, and service records.",
      newClient: "New Customer",
      editClient: "Edit Customer",
      clientDetails: "Customer File",
      filterAll: "All customers",
      filterActive: "Active customers",
      filterWithBalance: "With outstanding balance",
      name: "Full Name / Business Name",
      company: "Company",
      individual: "Individual",
      type: "Customer Type",
      address: "Physical Address",
      receivablesCount: "Receivables",
      totalOwed: "Total Invoiced",
      totalPaid: "Total Paid",
      outstandingBalance: "Outstanding Balance",
      noClientsFound: "No customers matching your search criteria.",
      createSuccess: "Customer created successfully.",
      updateSuccess: "Customer information updated.",
      archiveSuccess: "Customer archived successfully.",
      reactivateSuccess: "Customer reactivated successfully.",
      archiveConfirm: "Are you sure you want to archive this customer?",
      clientSince: "Customer since",
      receivablesHistory: "Receivables history",
      paymentsHistory: "Payment history",
      quickCreateReceivable: "Add receivable",
    },

    creances: {
      title: "Receivables & Debts",
      subtitle: "Manage unpaid invoices, due dates, and record partial settlements.",
      newReceivable: "New Receivable",
      filterAll: "All receivables",
      filterPending: "Pending",
      filterPartial: "Partially Paid",
      filterPaid: "Settled / Paid",
      filterOverdue: "Overdue",
      motif: "Service / Reason",
      description: "Detailed description",
      initialAmount: "Initial Amount",
      paidAmount: "Amount Paid",
      remainingBalance: "Remaining Balance",
      creationDate: "Creation Date",
      dueDate: "Due Date",
      selectClient: "Select a customer...",
      addNewClientFast: "Quick add customer",
      recordPayment: "Record a payment",
      generatePaymentLink: "Generate link",
      sendWhatsAppReminder: "Remind on WhatsApp",
      paymentHistory: "Payment History",
      remindersSummary: "Reminders History",
      remindersSentCount: "reminder(s) sent",
      lastReminder: "Last reminder",
      nextReminder: "Next scheduled reminder",
      noCreancesFound: "No receivables matching your filters.",
      createSuccess: "Receivable logged successfully!",
      paymentRecordedSuccess: "Payment recorded successfully!",
      paymentAmount: "Payment Amount",
      paymentDate: "Payment Date",
      paymentMethodPlaceholder: "Payment method (e.g. Wave, Cash, Bank)",
      fullBalance: "Settle full balance",
      partialPaymentNotice: "This amount will immediately deduct from the open debt balance.",
      previewLink: "Payment link generated",
      copiedLink: "Link copied to clipboard!",
    },

    demandes: {
      title: "Payment Links",
      subtitle: "Generate instant, secure payment links and share them via WhatsApp or SMS.",
      newLink: "Create payment link",
      filterAll: "All links",
      filterActive: "Active / Pending",
      filterPaid: "Paid",
      filterExpired: "Expired",
      filterCancelled: "Cancelled",
      token: "Token",
      targetReceivable: "Target Receivable",
      requestedAmount: "Requested Amount",
      expiresOn: "Expires on",
      expiresIn: "Expires in",
      days: "days",
      validityDuration: "Link Validity Duration",
      sevenDays: "7 days",
      fourteenDays: "14 days (Recommended)",
      thirtyDays: "30 days",
      customDate: "Custom Date",
      copyLink: "Copy Link",
      linkCopied: "Link copied to clipboard!",
      shareWhatsApp: "Share on WhatsApp",
      openPublicPage: "Preview Customer Page",
      cancelLink: "Deactivate Link",
      cancelConfirm: "Are you sure you want to deactivate this link? Future payments will be rejected.",
      createSuccess: "Payment link created successfully!",
      cancelSuccess: "The payment link has been deactivated.",
      createdModalTitle: "Payment Link Ready!",
      createdModalSubtitle: "Share this link directly with your customer.",
      directLinkNotice: "The customer opens a secure, branded page to settle in 1 click.",
      noDemandesFound: "No payment links found.",
    },

    paiements: {
      title: "Payment Transactions",
      subtitle: "Review all collected funds and partial settlements across your receivables.",
      totalCollected: "Total Collected",
      totalTransactions: "Recorded Payments",
      paymentDate: "Payment Date",
      client: "Customer",
      motif: "Receivable Reason",
      amount: "Amount Paid",
      method: "Payment Method",
      reference: "Reference",
      notes: "Notes / Receipt",
      receiptTitle: "Payment Receipt",
      receiptSubtitle: "Certified transaction details",
      printReceipt: "Print Receipt",
      noPaymentsFound: "No payments recorded yet.",
      recordedBy: "Recorded by company account",
    },

    relances: {
      title: "WhatsApp Debt Recovery",
      subtitle: "Send polite reminders and configure automated triggers to recover debt faster.",
      tabManual: "Manual Reminders",
      tabAutomated: "Automated Triggers",
      tabHistory: "Dispatch Log",
      criticalOverdue: "Critical Overdue",
      upcomingDue: "Upcoming Due (D-3 / D0)",
      allUnpaid: "All Open Receivables",
      upToDate: "All Settled",
      allDebtsSettled: "All receivables are settled!",
      congratulationsNoDebts: "Congratulations! No customers have overdue balances right now.",
      sendWhatsApp: "Remind on WhatsApp",
      previewMessage: "WhatsApp Message Preview",
      customMessage: "Customize reminder wording",
      sendDirectWhatsApp: "Open WhatsApp Web / App",
      copyMessage: "Copy message",
      messageCopied: "Message copied to clipboard!",
      automatedTitle: "Automated WhatsApp Reminders",
      automatedSubtitle: "Relancio tracks due dates and sends courteous reminders automatically at key milestones.",
      enableAutomation: "Enable daily automated reminders",
      activeAutomationNotice: "Automation is active. Scheduled reminders are dispatched every morning.",
      inactiveAutomationNotice: "Automation is paused. Turn it on to automate debt recovery.",
      milestonesTitle: "Active Milestones",
      saveAutoSettings: "Save Settings",
      settingsSaved: "Automated reminder settings saved!",
      logsTitle: "Reminder Dispatch Log",
      logsSubtitle: "Complete audit trail of all messages sent to customers.",
      channel: "Channel",
      sentAt: "Sent at",
      milestone: "Milestone",
      deliveryStatus: "Delivery Status",
      statusSent: "Sent",
      statusFailed: "Failed",
      statusCancelled: "Cancelled",
      noLogsFound: "No reminder logs recorded yet.",
      milestones: {
        m_j_minus_7: "D-7 (Preventive - 7 days before)",
        m_j_minus_3: "D-3 (Courteous reminder - 3 days before)",
        m_j_0: "D0 (Due Date)",
        m_j_plus_3: "D+3 (First follow-up - 3 days overdue)",
        m_j_plus_7: "D+7 (Firm reminder - 7 days overdue)",
        m_j_plus_14: "D+14 (Formal notice - 14 days overdue)",
        m_j_plus_30: "D+30 (Final notice - 30 days overdue)",
      },
    },

    settings: {
      title: "Company Settings",
      subtitle: "Manage your business identity, brand colors, logo, and contact details.",
      companyInfo: "General Information",
      companyName: "Business Name",
      managerName: "Manager Name",
      professionalEmail: "Business Email",
      phoneWhatsApp: "Contact Phone / WhatsApp",
      sector: "Industry",
      address: "Physical Address",
      branding: "Visual Identity & Colors",
      logo: "Company Logo",
      uploadLogo: "Upload new logo",
      changeLogo: "Change logo",
      deleteLogo: "Remove logo",
      primaryColor: "Primary Color",
      secondaryColor: "Secondary Color",
      colorPresets: "Pre-configured palettes",
      saveChanges: "Save Changes",
      savedSuccess: "Changes saved successfully.",
      logoDeletedSuccess: "Logo deleted successfully.",
      saveError: "Error saving changes.",
    },

    publicPayment: {
      title: "Secure Payment",
      secureCheckout: "Secure Payment Portal",
      billedTo: "Billed to",
      invoiceReference: "Receivable Reference",
      initialAmount: "Original Amount",
      amountAlreadyPaid: "Amount Already Paid",
      remainingToPay: "Amount to Settle",
      dueDate: "Due Date",
      paymentMethods: "Select your preferred payment method",
      mobileMoney: "Mobile Money (Wave, Orange Money, MTN, Moov)",
      bankCard: "Debit / Credit Card (Visa, Mastercard)",
      bankTransfer: "Bank Transfer",
      payNow: "Pay Now",
      simulatePayment: "Simulate Test Payment (Demo)",
      simulationNotice: "Demo mode: instantly confirms this payment to test the flow without real charges.",
      enterPaymentDetails: "Confirm settlement",
      confirmPayment: "Authorize Payment",
      processing: "Processing payment securely...",
      paymentSuccess: "Payment Successful!",
      successSubtitle: "Your payment has been received and the receivable updated in real time.",
      receiptAvailable: "Your digital payment receipt is ready.",
      securedByRelancio: "Relancio Secure Financial Infrastructure",
      sslEncryption: "256-bit SSL Certified Encryption",
      linkExpired: "This payment link has expired.",
      linkCancelled: "This payment link was deactivated by the merchant.",
      contactMerchant: "Please contact the business directly to request a new payment link.",
      selectLanguage: "Language",
    },

    auth: {
      loginTitle: "Business Login",
      loginSubtitle: "Sign in to your secure Relancio workspace",
      registerTitle: "Get Started with Relancio",
      registerSubtitle: "Record your receivables and facilitate customer settlements today.",
      emailOrPhone: "WhatsApp Number or Email",
      password: "Password",
      confirmPassword: "Confirm Password",
      passwordMismatch: "Passwords do not match.",
      passwordMinLength: "Password must be at least 6 characters long.",
      registerBadge: "Business Account Setup",
      creatingAccount: "Creating your account...",
      guaranteeNoSubscription: "Zero mandatory subscription",
      guaranteeSecure: "Isolated and encrypted data",
      guaranteeInstantAccess: "Instant access",
      companyName: "Business Name",
      fullName: "Responsible Person Name",
      sector: "Primary Industry Sector",
      phone: "Phone / WhatsApp",
      loginBtn: "Sign in to my dashboard",
      registerBtn: "Create my business account",
      alreadyAccount: "Already have an account?",
      noAccount: "Don't have an account?",
      signIn: "Log in",
      signUp: "Sign up",
      demoAccounts: "One-click Demo Accounts",
      fillSuperAdmin: "Log in as Super Admin",
      fillPressingAdmin: "Log in as Pilot Business Admin",
      sessionEncrypted: "Encrypted session protected by 2FA token security",
      termsNotice: "By signing up, you agree to our Terms of Service and Privacy Policy.",
      onboardingStep: "Step",
      onboardingOf: "of",
      step1Title: "Create your business profile",
      step1Subtitle: "Brand your Relancio workspace in under a minute.",
      step2Title: "Record your first receivable",
      step2Subtitle: "Log an outstanding amount to test the collection flow.",
      step3Title: "Your payment link is ready!",
      step3Subtitle: "Your customer receives this link to settle securely online.",
      readyNotice: "Express setup completed successfully!",
      finishOnboarding: "Finish and open my workspace",
      next: "Continue",
      previous: "Previous",
      expressConfig: "Express Setup",
      forgotPassword: "Forgot password?",
      forgotPasswordTitle: "Password Recovery",
      forgotPasswordSubtitle: "Enter the email address associated with your Relancio account to receive a secure reset link.",
      sendResetLink: "Send reset link",
      resetLinkSent: "If an account matches this address, a reset link has just been sent.",
      resetPasswordTitle: "New Password",
      resetPasswordSubtitle: "Set a new secure password for your Relancio account.",
      newPassword: "New password",
      confirmNewPassword: "Confirm new password",
      resetPasswordBtn: "Change my password",
      resetSuccessTitle: "Password successfully changed!",
      resetSuccessSubtitle: "Your password has been updated. You can now log in to your account.",
      backToLogin: "Back to login",
      invalidTokenTitle: "Invalid or expired link",
      invalidTokenSubtitle: "This reset link is no longer valid or has already been used. Please submit a new request.",
      requestNewLink: "Request a new link",
      sectors: {
        pressing: "Dry Cleaning & Laundry",
        ecole: "School & Education",
        garage: "Auto Repair & Garage",
        salon: "Hair Salon & Beauty",
        commerce: "Retail & Shop",
        artisan: "Craftsman & Construction",
        services: "Professional Services & Consulting",
        autre: "Other Business Activity",
      },
    },

    admin: {
      title: "Platform Global Supervision",
      subtitle: "Monitor registered businesses, platform volume, and overall health.",
      realTimeUpdate: "Real-time updates",
      totalCompanies: "Total Businesses",
      activeCompanies: "Active Businesses",
      inactiveCompanies: "Deactivated Businesses",
      totalUsers: "Registered Users",
      proAccounts: "Professional Accounts",
      authorizedToCollect: "Authorized to collect",
      accessSuspended: "Access suspended",
      adminsCount: "Admins & Super Admin",
      companiesList: "Client Businesses Management",
      companiesSubtitle: "Access control and platform tenant supervision",
      companyName: "Business",
      manager: "Manager",
      createdDate: "Registration Date",
      status: "Status",
      actions: "Actions",
      activate: "Activate",
      deactivate: "Deactivate",
      viewDetails: "View Details",
      recentActivities: "Recent Activity Log",
      superAdminBadge: "SUPER ADMIN CONSOLE",
      logout: "Log Out",
      sessionChecking: "Verifying Super Admin session...",
      registeredOn: "Registered on:",
      color: "Color:",
      close: "Close",
      deactivateThisCompany: "Deactivate this business",
      reactivateThisCompany: "Reactivate this business",
    },

    placeholder: {
      underConstruction: "Module in preparation",
      readyArchitecture: "Architecture ready & isolation activated",
      tenantCompany: "Business:",
      tenantId: "Tenant ID:",
      backToDashboard: "Return to Dashboard",
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

    // Modular App - AR (RTL)
    common: {
      actions: "الإجراءات",
      save: "حفظ",
      saving: "جاري الحفظ...",
      cancel: "إلغاء",
      delete: "حذف",
      edit: "تعديل",
      close: "إغلاق",
      search: "بحث...",
      filter: "تصفية",
      all: "الكل",
      refresh: "تحديث",
      loading: "جاري التحميل...",
      export: "تصدير",
      copy: "نسخ",
      copied: "تم النسخ!",
      back: "رجوع",
      confirm: "تأكيد",
      status: "الحالة",
      amount: "المبلغ",
      total: "الإجمالي",
      balance: "الرصيد",
      date: "التاريخ",
      dueDate: "تاريخ الاستحقاق",
      client: "العميل",
      phone: "الهاتف",
      email: "البريد الإلكتروني",
      notes: "ملاحظات",
      reference: "المرجع",
      paymentMethod: "طريقة الدفع",
      details: "التفاصيل",
      success: "نجاح",
      error: "خطأ",
      noData: "لا توجد بيانات متاحة",
      active: "نشط",
      inactive: "غير نشط",
      currency: "فرنك",
      statusLabels: {
        en_attente: "قيد الانتظار",
        partiellement_payee: "مدفوعة جزئياً",
        payee: "مدفوعة بالكامل",
        en_retard: "متأخرة",
        expire: "منتهي الصلاحية",
        annule: "ملغى",
      },
    },

    layout: {
      dashboard: "لوحة التحكم",
      clients: "العملاء",
      creances: "المستحقات المالية",
      paymentLinks: "روابط الدفع",
      payments: "المدفوعات",
      reminders: "التذكيرات",
      settings: "الإعدادات",
      logout: "تسجيل الخروج",
      isolatedTenant: "مساحة آمنة ومعزولة",
      loadingWorkspace: "جاري تحميل مساحتك الآمنة...",
      myCompany: "مؤسستي",
      switchLang: "تغيير اللغة",
    },

    dashboardPortal: {
      welcome: "مرحباً بك في مساحة عملك",
      welcomeSubtitle: "تابع حالة مستحقاتك وحصّل أموالك بكل يسر وسهولة.",
      totalToRecover: "إجمالي المبالغ للتحصيل",
      totalCollected: "إجمالي المبالغ المحصلة",
      overdueDebts: "المستحقات المتأخرة",
      activeClients: "العملاء النشطون",
      recoveryRate: "نسبة التحصيل",
      quickActions: "إجراءات سريعة",
      newReceivable: "تسجيل مطالبة جديدة",
      newClient: "إضافة عميل جديد",
      sendReminders: "تذكيرات واتساب",
      generateLink: "إنشاء رابط دفع",
      recentReceivables: "أحدث المستحقات المسجلة",
      recentPayments: "أحدث التحصيلات الواردة",
      recentActivity: "سجل العمليات الأخير",
      viewAll: "عرض الكل",
      noReceivablesYet: "لا توجد مستحقات مسجلة حتى الآن.",
      noPaymentsYet: "لا توجد مدفوعات مسجلة حتى الآن.",
      noActivityYet: "لا يوجد نشاط مسجل حديثاً.",
      unpaidDebtsCount: "مطالبات قيد السداد",
      overdueCount: "متأخرة بصفة حرجة",
      clientsToRemind: "عملاء بانتظار التذكير",
    },

    clients: {
      title: "إدارة العملاء",
      subtitle: "تابع سجل عملائك، وفواتيرهم، والأرصدة المستحقة عليهم بدقة.",
      newClient: "إضافة عميل",
      editClient: "تعديل بيانات العميل",
      clientDetails: "ملف العميل المالي",
      filterAll: "جميع العملاء",
      filterActive: "العملاء النشطون",
      filterWithBalance: "عملاء عليهم مستحقات",
      name: "الاسم الكامل / المؤسسة",
      company: "شركة",
      individual: "فرد",
      type: "نوع العميل",
      address: "العنوان",
      receivablesCount: "عدد المطالبات",
      totalOwed: "إجمالي الفواتير",
      totalPaid: "إجمالي المسدد",
      outstandingBalance: "الرصيد المتبقي بذمته",
      noClientsFound: "لم يتم العثور على عملاء يطابقون بحثك.",
      createSuccess: "تمت إضافة العميل بنجاح.",
      updateSuccess: "تم تحديث بيانات العميل بنجاح.",
      archiveSuccess: "تمت أرشفة العميل بنجاح.",
      reactivateSuccess: "تمت إعادة تفعيل حساب العميل.",
      archiveConfirm: "هل أنت متأكد من رغبتك في أرشفة هذا العميل؟",
      clientSince: "عميل منذ",
      receivablesHistory: "سجل المطالبات المالية",
      paymentsHistory: "سجل المدفوعات والتحصيلات",
      quickCreateReceivable: "تسجيل مطالبة سريعة",
    },

    creances: {
      title: "إدارة المستحقات والديون",
      subtitle: "تتبع الفواتير، ومواعيد الاستحقاق، وسجّل الدفعات الجزئية بكل مرونة.",
      newReceivable: "تسجيل مطالبة جديدة",
      filterAll: "جميع المطالبات",
      filterPending: "قيد الانتظار",
      filterPartial: "مدفوعة جزئياً",
      filterPaid: "مدفوعة بالكامل",
      filterOverdue: "متأخرة",
      motif: "سبب المعاملة / الخدمة",
      description: "الوصف التفصيلي",
      initialAmount: "المبلغ الأصلي",
      paidAmount: "المبلغ المسدد",
      remainingBalance: "الرصيد المتبقي",
      creationDate: "تاريخ الإنشاء",
      dueDate: "تاريخ الاستحقاق",
      selectClient: "اختر عميلاً...",
      addNewClientFast: "إضافة عميل سريع",
      recordPayment: "تسجيل دفعة",
      generatePaymentLink: "إنشاء رابط دفع",
      sendWhatsAppReminder: "تذكير عبر واتساب",
      paymentHistory: "سجل الدفعات المستلمة",
      remindersSummary: "ملخص التذكيرات",
      remindersSentCount: "تذكير(ات) مرسلة",
      lastReminder: "آخر تذكير",
      nextReminder: "التذكير القادم المجدول",
      noCreancesFound: "لا توجد مطالبات تطابق شروط التصفية.",
      createSuccess: "تم تسجيل المطالبة بنجاح!",
      paymentRecordedSuccess: "تم تسجيل الدفعة بنجاح وتحديث الرصيد!",
      paymentAmount: "مبلغ الدفعة",
      paymentDate: "تاريخ الدفع",
      paymentMethodPlaceholder: "طريقة الدفع (مثل: ويف Wave، نقداً، تحويل بنكي)",
      fullBalance: "سداد كامل الرصيد المتبقي",
      partialPaymentNotice: "سيتم خصم هذا المبلغ فوراً من الرصيد المتبقي على المطالبة.",
      previewLink: "تم إنشاء رابط الدفع",
      copiedLink: "تم نسخ الرابط إلى الحافظة!",
    },

    demandes: {
      title: "روابط الدفع الرقمية",
      subtitle: "أنشئ روابط سداد آمنة وفورية وشاركها مع عملائك عبر واتساب أو الرسائل القصيرة.",
      newLink: "إنشاء رابط دفع",
      filterAll: "جميع الروابط",
      filterActive: "نشطة / قيد الانتظار",
      filterPaid: "مدفوعة",
      filterExpired: "منتهية الصلاحية",
      filterCancelled: "ملغاة",
      token: "رمز الرابط",
      targetReceivable: "المطالبة المرتبطة",
      requestedAmount: "المبلغ المطلوب",
      expiresOn: "تاريخ الانتهاء",
      expiresIn: "ينتهي خلال",
      days: "أيام",
      validityDuration: "مدة صلاحية الرابط",
      sevenDays: "7 أيام",
      fourteenDays: "14 يوماً (مستحسن)",
      thirtyDays: "30 يوماً",
      customDate: "تاريخ مخصص",
      copyLink: "نسخ الرابط",
      linkCopied: "تم نسخ الرابط بنجاح!",
      shareWhatsApp: "مشاركة عبر واتساب",
      openPublicPage: "معاينة صفحة العميل",
      cancelLink: "تعطيل الرابط",
      cancelConfirm: "هل أنت متأكد من تعطيل هذا الرابط؟ سيتم حظر أي محاولات سداد لاحقة.",
      createSuccess: "تم إنشاء رابط الدفع بنجاح!",
      cancelSuccess: "تم تعطيل رابط الدفع بنجاح.",
      createdModalTitle: "رابط الدفع جاهز للإرسال!",
      createdModalSubtitle: "شارك هذا الرابط مباشرة مع عميلك ليدفع فوراً.",
      directLinkNotice: "يفتح العميل صفحة دفع آمنة تحمل هوية وألوان شركتك للسداد بنقرة واحدة.",
      noDemandesFound: "لم يتم العثور على روابط دفع.",
    },

    paiements: {
      title: "سجل المدفوعات والتحصيلات",
      subtitle: "استعرض كافة الدفعات والمبالغ المحصلة لحساب مطالباتك المالية.",
      totalCollected: "إجمالي التحصيلات",
      totalTransactions: "العمليات المسجلة",
      paymentDate: "تاريخ السداد",
      client: "العميل",
      motif: "سبب المطالبة",
      amount: "المبلغ المحصل",
      method: "وسيلة السداد",
      reference: "الرقم المرجعي",
      notes: "الملاحظات / الإيصال",
      receiptTitle: "إيصال سداد إلكتروني",
      receiptSubtitle: "تفاصيل العملية المالية المؤكدة",
      printReceipt: "طباعة الإيصال",
      noPaymentsFound: "لا توجد مدفوعات مسجلة حتى الآن.",
      recordedBy: "تم القيد بواسطة حساب المؤسسة",
    },

    relances: {
      title: "تذكيرات وتحصيل واتساب",
      subtitle: "أرسل تذكيرات لبقة وفعّل الجدولة الآلية لتحصيل ديونك بدون إحراج.",
      tabManual: "التذكيرات اليدوية",
      tabAutomated: "التذكيرات الآلية",
      tabHistory: "سجل الإرسال",
      criticalOverdue: "تأخيرات حرجة",
      upcomingDue: "استحقاقات قريبة (J-3 / J0)",
      allUnpaid: "كافة المستحقات المفتوحة",
      upToDate: "خالٍ من الديون",
      allDebtsSettled: "جميع مطالباتك مسددة بالكامل!",
      congratulationsNoDebts: "تهانينا! لا يوجد عملاء متأخرون في السداد حالياً.",
      sendWhatsApp: "إرسال تذكير واتساب",
      previewMessage: "معاينة نص التذكير عبر واتساب",
      customMessage: "تخصيص نص التذكير",
      sendDirectWhatsApp: "فتح واتساب ويب / التطبيق",
      copyMessage: "نسخ النص",
      messageCopied: "تم نسخ النص إلى الحافظة!",
      automatedTitle: "أتمتة تذكيرات واتساب الذكية",
      automatedSubtitle: "يقوم ريلانسيو بمراقبة تواريخ الاستحقاق وإرسال رسائل تذكير لطيفة في كل محطة زمنية.",
      enableAutomation: "تفعيل التذكيرات الآلية اليومية",
      activeAutomationNotice: "الأتمتة مفعلة حالياً. يتم فحص المستحقات وإرسال التذكيرات كل صباح.",
      inactiveAutomationNotice: "الأتمتة متوقفة مؤقتاً. قم بتفعيلها لضمان سرعة التحصيل تلقائياً.",
      milestonesTitle: "محطات التذكير المجدولة",
      saveAutoSettings: "حفظ إعدادات الأتمتة",
      settingsSaved: "تم حفظ إعدادات التذكير الآلي بنجاح!",
      logsTitle: "سجل الإرسال والتدقيق",
      logsSubtitle: "سجل شامل لكافة رسائل التذكير المرسلة لعملائك.",
      channel: "القناة",
      sentAt: "تاريخ الإرسال",
      milestone: "المحطة",
      deliveryStatus: "حالة الإرسال",
      statusSent: "تم الإرسال",
      statusFailed: "فشل",
      statusCancelled: "ملغى",
      noLogsFound: "لا توجد رسائل تذكير مسجلة في السجل.",
      milestones: {
        m_j_minus_7: "قبل الاستحقاق بـ 7 أيام (تذكير وقائي)",
        m_j_minus_3: "قبل الاستحقاق بـ 3 أيام (تذكير لبق)",
        m_j_0: "يوم الاستحقاق (موعد السداد)",
        m_j_plus_3: "بعد الاستحقاق بـ 3 أيام (المتابعة الأولى)",
        m_j_plus_7: "بعد الاستحقاق بـ 7 أيام (تذكير حازم)",
        m_j_plus_14: "بعد الاستحقاق بـ 14 يوماً (إشعار رسمي)",
        m_j_plus_30: "بعد الاستحقاق بـ 30 يوماً (إنذار أخير)",
      },
    },

    settings: {
      title: "إعدادات المؤسسة",
      subtitle: "خصص الهوية التجارية لعلامتك، وألوانك، وشعارك، وبيانات التواصل.",
      companyInfo: "المعلومات العامة",
      companyName: "الاسم التجاري للمؤسسة",
      managerName: "اسم المسؤول",
      professionalEmail: "البريد الإلكتروني للعمل",
      phoneWhatsApp: "رقم الهاتف / واتساب",
      sector: "النشاط التجاري",
      address: "العنوان الفعلي",
      branding: "الهوية البصرية والألوان",
      logo: "شعار المؤسسة",
      uploadLogo: "رفع شعار جديد",
      changeLogo: "تغيير الشعار",
      deleteLogo: "حذف الشعار",
      primaryColor: "اللون الأساسي",
      secondaryColor: "اللون الثانوي",
      colorPresets: "نماذج ألوان جاهزة",
      saveChanges: "حفظ التعديلات",
      savedSuccess: "تم حفظ التعديلات بنجاح.",
      logoDeletedSuccess: "تم حذف الشعار بنجاح.",
      saveError: "حدث خطأ أثناء حفظ التعديلات.",
    },

    publicPayment: {
      title: "الدفع الآمن",
      secureCheckout: "بوابة السداد الإلكتروني الآمن",
      billedTo: "الفاتورة موجهة إلى",
      invoiceReference: "مرجع المطالبة",
      initialAmount: "المبلغ الأصلي",
      amountAlreadyPaid: "المبلغ المسدد مسبقاً",
      remainingToPay: "المبلغ المطلوب سداده",
      dueDate: "تاريخ الاستحقاق",
      paymentMethods: "اختر وسيلة الدفع المناسبة لك",
      mobileMoney: "المحافظ الإلكترونية (Wave, Orange Money, MTN, Moov)",
      bankCard: "البطاقة المصرفية (فيزا / ماستركارد)",
      bankTransfer: "تحويل مصرفي",
      payNow: "ادفع الآن",
      simulatePayment: "تجربة سداد تجريبي (محاكاة)",
      simulationNotice: "وضع تجريبي: يؤكد الدفعة فورياً لاختبار المسار دون خصم فعلي من حسابك.",
      enterPaymentDetails: "تأكيد الدفع",
      confirmPayment: "إتمام عملية السداد",
      processing: "جاري تأمين ومعالجة السداد...",
      paymentSuccess: "تم السداد بنجاح!",
      successSubtitle: "تم تأكيد عملية الدفع وتحديث حالة المطالبة لدى المؤسسة فورياً.",
      receiptAvailable: "إيصال الدفع الإلكتروني متاح وموثق.",
      securedByRelancio: "بنية تحتية مشفرة ومدعومة من ريلانسيو",
      sslEncryption: "تشفير SSL 256-bit معتمد وآمن",
      linkExpired: "انتهت صلاحية رابط الدفع هذا.",
      linkCancelled: "تم إلغاء رابط الدفع هذا من قِبل المؤسسة.",
      contactMerchant: "يرجى التواصل مباشرة مع الجهة المعنية لطلب رابط سداد جديد.",
      selectLanguage: "اللغة",
    },

    auth: {
      loginTitle: "تسجيل دخول المؤسسات",
      loginSubtitle: "سجّل الدخول إلى مساحتك الآمنة في ريلانسيو",
      registerTitle: "ابدأ العمل مع ريلانسيو",
      registerSubtitle: "سجّل مستحقاتك المالية وسهّل عمليات التحصيل لعملائك اليوم.",
      emailOrPhone: "رقم واتساب أو البريد الإلكتروني",
      password: "كلمة المرور",
      confirmPassword: "تأكيد كلمة المرور",
      passwordMismatch: "كلمتا المرور غير متطابقتين.",
      passwordMinLength: "يجب ألا تقل كلمة المرور عن 6 أحرف.",
      registerBadge: "إنشاء حساب مؤسسة جديد",
      creatingAccount: "جارٍ إنشاء الحساب...",
      guaranteeNoSubscription: "0€ اشتراك إلزامي",
      guaranteeSecure: "بيانات معزولة ومحمية بالكامل",
      guaranteeInstantAccess: "وصول فوري للوحة التحكم",
      companyName: "اسم المؤسسة التجاري",
      fullName: "الاسم الكامل للمسؤول",
      sector: "النشاط التجاري الرئيسي",
      phone: "رقم الهاتف / واتساب",
      loginBtn: "دخول إلى لوحة التحكم",
      registerBtn: "إنشاء حساب مؤسستي",
      alreadyAccount: "هل لديك حساب بالفعل؟",
      noAccount: "ليس لديك حساب بعد؟",
      signIn: "تسجيل الدخول",
      signUp: "إنشاء حساب جديد",
      demoAccounts: "حسابات تجريبية سريعة",
      fillSuperAdmin: "دخول تجريبي كمدير عام للسيستم",
      fillPressingAdmin: "دخول تجريبي بمغسلة الملابس",
      sessionEncrypted: "جلسة عمل مشفرة ومحمية ببروتوكولات الأمان الثنائية",
      termsNotice: "بالتسجيل، أنت توافق على شروط الخدمة وسياسة الخصوصية الخاصة بنا.",
      onboardingStep: "الخطوة",
      onboardingOf: "من",
      step1Title: "أنشئ ملف مؤسستك التجاري",
      step1Subtitle: "خصص مساحة عملك بهويتك في أقل من دقيقة.",
      step2Title: "سجّل أول مطالبة مالية",
      step2Subtitle: "أدخل ما يدين به أحد العملاء لاختبار دورة التحصيل.",
      step3Title: "رابط الدفع الخاص بك جاهز!",
      step3Subtitle: "سيستقبل عميلك هذا الرابط المباشر للسداد بكل أمان.",
      readyNotice: "تمت التهيئة السريعة بنجاح!",
      finishOnboarding: "إتمام التهيئة وفتح مساحة العمل",
      next: "متابعة",
      previous: "السابق",
      expressConfig: "التهيئة السريعة",
      forgotPassword: "نسيت كلمة المرور؟",
      forgotPasswordTitle: "استعادة كلمة المرور",
      forgotPasswordSubtitle: "أدخل عنوان البريد الإلكتروني المرتبط بحساب ريلانسيو لتلقي رابط إعادة تعيين آمن.",
      sendResetLink: "إرسال رابط إعادة التعيين",
      resetLinkSent: "إذا كان هناك حساب مرتبط بهذا العنوان، فقد تم إرسال رابط إعادة التعيين إليه للتو.",
      resetPasswordTitle: "كلمة مرور جديدة",
      resetPasswordSubtitle: "عيّن كلمة مرور جديدة وآمنة لحسابك في ريلانسيو.",
      newPassword: "كلمة المرور الجديدة",
      confirmNewPassword: "تأكيد كلمة المرور الجديدة",
      resetPasswordBtn: "تعديل كلمة المرور",
      resetSuccessTitle: "تم تغيير كلمة المرور بنجاح!",
      resetSuccessSubtitle: "تم تحديث كلمة المرور الخاصة بك. يمكنك الآن تسجيل الدخول إلى حسابك.",
      backToLogin: "العودة إلى صفحة تسجيل الدخول",
      invalidTokenTitle: "رابط غير صالح أو منتهي الصلاحية",
      invalidTokenSubtitle: "هذا الرابط لم يعد صالحاً أو تم استخدامه بالفعل. يرجى تقديم طلب استعادة جديد.",
      requestNewLink: "طلب رابط جديد",
      sectors: {
        pressing: "المغاسل والعناية بالملابس",
        ecole: "المدارس والتعليم",
        garage: "ورش وميكانيكا السيارات",
        salon: "صالونات الحلاقة والتجميل",
        commerce: "المتاجر والتجزئة",
        artisan: "الحرفيون والمقاولات",
        services: "الخدمات المهنية والاستشارات",
        autre: "نشاط مهني آخر",
      },
    },

    admin: {
      title: "المراقبة والإشراف العام على المنصة",
      subtitle: "الإشراف الكامل على المؤسسات المشتركة ومراقبة حجم العمليات في المنصة.",
      realTimeUpdate: "تحديث فوري ومباشر",
      totalCompanies: "إجمالي المؤسسات",
      activeCompanies: "المؤسسات النشطة",
      inactiveCompanies: "المؤسسات المعطلة",
      totalUsers: "المستخدمون المسجلون",
      proAccounts: "حسابات مهنية",
      authorizedToCollect: "مخول لها بالتحصيل",
      accessSuspended: "تم تعليق الحساب",
      adminsCount: "المسؤولون والمشرف العام",
      companiesList: "إدارة المؤسسات المشتركة",
      companiesSubtitle: "إدارة الصلاحيات والإشراف على مساحات العمل",
      companyName: "المؤسسة",
      manager: "المسؤول",
      createdDate: "تاريخ التسجيل",
      status: "الحالة",
      actions: "الإجراءات",
      activate: "تفعيل",
      deactivate: "تعطيل",
      viewDetails: "معاينة",
      recentActivities: "سجل العمليات الأخير",
      superAdminBadge: "لوحة المشرف العام",
      logout: "تسجيل الخروج",
      sessionChecking: "جارٍ التحقق من صلاحيات المشرف العام...",
      registeredOn: "تاريخ التسجيل:",
      color: "اللون:",
      close: "إغلاق",
      deactivateThisCompany: "تعطيل هذه المؤسسة",
      reactivateThisCompany: "إعادة تفعيل هذه المؤسسة",
    },

    placeholder: {
      underConstruction: "الوحدة قيد التطوير",
      readyArchitecture: "البنية البرمجية جاهزة ونظام العزل مفعل",
      tenantCompany: "المؤسسة:",
      tenantId: "معرف الحساب:",
      backToDashboard: "العودة إلى لوحة التحكم",
    },
  },
};
