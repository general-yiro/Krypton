/**
 * Krypton Vault - Multi-Language Localization Engine
 * Supports International English, Amharic (አማርኛ), Afaan Oromoo, French, and Spanish.
 */

import { SupportedLanguage } from '../types/account';

export interface TranslationStrings {
  appName: string;
  vaultTitle: string;
  tagline: string;
  unlocked: string;
  locked: string;
  lockVault: string;
  unlockVault: string;
  enterMasterPin: string;
  masterPasswordPlaceholder: string;
  biometricUnlock: string;
  searchPlaceholder: string;
  newAccount: string;
  totalBalance: string;
  activeAccounts: string;
  virtualCards: string;
  encryptedAssets: string;
  atmModule: string;
  mobileBankingModule: string;
  originBranch: string;
  bankOrgName: string;
  accountNumber: string;
  phoneNumber: string;
  accountName: string;
  atmCardNumber: string;
  cvv: string;
  atmPin: string;
  mobileBankingPin: string;
  memo: string;
  currentBalance: string;
  saveAccount: string;
  cancel: string;
  deleteAccount: string;
  revealData: string;
  hideData: string;
  flipCard: string;
  copyNumber: string;
  copied: string;
  recentTransactions: string;
  addTransaction: string;
  income: string;
  expense: string;
  category: string;
  amount: string;
  burnRate: string;
  securityAudit: string;
  emergencyExport: string;
  importVault: string;
  language: string;
  installApp: string;
  offlineNotice: string;
  quickParseNotice: string;
  autoLockNotice: string;
  weakPinWarning: string;
  zeroKnowledgeBadge: string;
  tabs: {
    vault: string;
    cards: string;
    finance: string;
    security: string;
  };
}

export const translations: Record<SupportedLanguage, TranslationStrings> = {
  en: {
    appName: 'Krypton Vault',
    vaultTitle: 'Zero-Knowledge Vault',
    tagline: 'Client-side encrypted financial & credentials command center',
    unlocked: 'Vault Unlocked',
    locked: 'Vault Locked',
    lockVault: 'Lock Vault',
    unlockVault: 'Unlock Vault',
    enterMasterPin: 'Enter Master Passphrase / PIN',
    masterPasswordPlaceholder: 'Master Passphrase (min 8 characters)',
    biometricUnlock: 'Unlock with FaceID / Biometrics',
    searchPlaceholder: 'Search by Name, Account #, Bank, Phone...',
    newAccount: 'New Account',
    totalBalance: 'Total Vault Assets',
    activeAccounts: 'Active Accounts',
    virtualCards: 'Virtual Cards',
    encryptedAssets: 'Encrypted Records',
    atmModule: 'ATM / Debit Card Module',
    mobileBankingModule: 'Mobile Banking Module',
    originBranch: 'Origin Branch Name',
    bankOrgName: 'Bank / Organization Name',
    accountNumber: 'Account Number',
    phoneNumber: 'Phone Number',
    accountName: 'Account Name',
    atmCardNumber: 'ATM Card Number',
    cvv: 'CVV Security Code',
    atmPin: 'ATM PIN (Encrypted)',
    mobileBankingPin: 'Mobile Banking PIN (Encrypted)',
    memo: 'Memo & Notes',
    currentBalance: 'Current Balance',
    saveAccount: 'Save to Encrypted Vault',
    cancel: 'Cancel',
    deleteAccount: 'Delete Account',
    revealData: 'Reveal Sensitive Data',
    hideData: 'Mask Sensitive Data',
    flipCard: 'Flip Card',
    copyNumber: 'Copy to Clipboard',
    copied: 'Copied securely!',
    recentTransactions: 'Recent Transactions',
    addTransaction: 'Record Transaction',
    income: 'Income',
    expense: 'Expense',
    category: 'Category',
    amount: 'Amount',
    burnRate: 'Net Cashflow & Burn Rate',
    securityAudit: 'Security Health & Audit',
    emergencyExport: 'Export Encrypted Backup',
    importVault: 'Restore Encrypted Backup',
    language: 'Language / ቋንቋ',
    installApp: 'Install Vault PWA',
    offlineNotice: 'Offline Mode Active — Operating from Secure Local Cache',
    quickParseNotice: 'Smart Paste: paste bank notification/SMS to auto-populate',
    autoLockNotice: 'Auto-Lock configured to protect credentials at rest',
    weakPinWarning: 'Weak PIN detected: Sequential or repetitive numbers pose breach risk',
    zeroKnowledgeBadge: 'Zero-Knowledge Architecture • AES-256-GCM',
    tabs: {
      vault: 'Vault',
      cards: 'Cards',
      finance: 'Ledger',
      security: 'Security',
    },
  },
  am: {
    appName: 'ክሪፕቶን ቮልት (Krypton Vault)',
    vaultTitle: 'የተመሰጠረ የሂሳብ ማከማቻ (Encrypted Vault)',
    tagline: 'በደንበኛ-ወገን የተመሰጠረ የፋይናንስ መቆጣጠሪያ (Client-side encrypted financial vault)',
    unlocked: 'ቮልቱ ተከፍቷል (Unlocked)',
    locked: 'ቮልቱ ተቆልፏል (Locked)',
    lockVault: 'ቮልቱን ቆልፍ (Lock Vault)',
    unlockVault: 'ቮልቱን ክፈት (Unlock Vault)',
    enterMasterPin: 'ዋናውን የይለፍ ቃል ያስገቡ (Enter Master Passphrase)',
    masterPasswordPlaceholder: 'ዋና የይለፍ ቃል (Master Passphrase)',
    biometricUnlock: 'በጣት አሻራ ክፈት (Biometric Unlock)',
    searchPlaceholder: 'በስም ፣ በሂሳብ ቁጥር ፣ በባንክ ፈልግ (Search accounts)...',
    newAccount: 'አዲስ ሂሳብ ጨምር (New Account)',
    totalBalance: 'ጠቅላላ ሀብት (Total Assets)',
    activeAccounts: 'ንቁ ሂሳቦች (Active Accounts)',
    virtualCards: 'ዲጂታል ካርዶች (Virtual Cards)',
    encryptedAssets: 'የተመሰጠሩ መዛግብት (Encrypted Records)',
    atmModule: 'የኤቲኤም / ዴቢት ካርድ (ATM Module)',
    mobileBankingModule: 'የሞባይል ባንኪንግ (Mobile Banking)',
    originBranch: 'የመነሻ ቅርንጫፍ (Origin Branch)',
    bankOrgName: 'የባንክ ስም (Bank / Org Name)',
    accountNumber: 'የሂሳብ ቁጥር (Account Number)',
    phoneNumber: 'ስልክ ቁጥር (Phone Number)',
    accountName: 'የሂሳብ ስም (Account Name)',
    atmCardNumber: 'የኤቲኤም ካርድ ቁጥር (ATM Card #)',
    cvv: 'የሲቪቪ ኮድ (CVV)',
    atmPin: 'የኤቲኤም ፒን (ATM PIN)',
    mobileBankingPin: 'የሞባይል ባንክ ፒን (Mobile PIN)',
    memo: 'ማስታወሻ (Memo)',
    currentBalance: 'ቀሪ ሂሳብ (Balance)',
    saveAccount: 'ወደ ቮልት አስቀምጥ (Save Account)',
    cancel: 'ሰርዝ (Cancel)',
    deleteAccount: 'ሂሳቡን ሰርዝ (Delete Account)',
    revealData: 'ሚስጥራዊ ዳታ አሳይ (Reveal PIN)',
    hideData: 'ሚስጥራዊ ዳታ ደብቅ (Mask PIN)',
    flipCard: 'ካርዱን አዙር (Flip Card)',
    copyNumber: 'ቁጥሩን ቅዳ (Copy)',
    copied: 'ተቀድቷል (Copied)!',
    recentTransactions: 'የቅርብ ዝውውሮች (Recent Transactions)',
    addTransaction: 'ዝውውር መዝግብ (Record Transaction)',
    income: 'ገቢ (Income)',
    expense: 'ወጪ (Expense)',
    category: 'ዘርፍ (Category)',
    amount: 'መጠን (Amount)',
    burnRate: 'የወጪና ገቢ ንጽጽር (Burn Rate)',
    securityAudit: 'የደህንነት ኦዲት (Security Audit)',
    emergencyExport: 'ባክአፕ አውርድ (Export Backup)',
    importVault: 'ባክአፕ መልስ (Restore Backup)',
    language: 'ቋንቋ (Language)',
    installApp: 'አፑን ጫን (Install PWA)',
    offlineNotice: 'ከመስመር ውጭ ሁነታ (Offline Mode)',
    quickParseNotice: 'የባንክ መልዕክት በመለጠፍ ይሙሉ (Smart Paste)',
    autoLockNotice: 'አውቶ-መቆለፊያ ነቅቷል (Auto-Lock)',
    weakPinWarning: 'ደካማ ፒን ተገኝቷል (Weak PIN detected)',
    zeroKnowledgeBadge: 'ዜሮ-እውቀት ስነ-ህንፃ • AES-256-GCM',
    tabs: {
      vault: 'ሂሳቦች (Vault)',
      cards: 'ካርዶች (Cards)',
      finance: 'ፋይናንስ (Ledger)',
      security: 'ደህንነት (Security)',
    },
  },
  om: {
    appName: 'Krypton Vault',
    vaultTitle: 'Kuusaa Lakkoofsa Herregaa Eegamaa',
    tagline: 'Giddu-gala eegumsa herrega baankii fi iccitii dhuunfaa',
    unlocked: 'Kuusaan Banameera',
    locked: 'Kuusaan Cufameera',
    lockVault: 'Kuusaa Cufi',
    unlockVault: 'Kuusaa Bani',
    enterMasterPin: 'Jecha Darbii / PIN Galchaa',
    masterPasswordPlaceholder: 'Jecha Darbii Guddaa',
    biometricUnlock: 'Asxaa Qubiin Bani',
    searchPlaceholder: 'Maqaa, Lakkoofsa Herregaa, Baankii, Bilbila...',
    newAccount: 'Herrega Haaraa',
    totalBalance: 'Waliigala Qabeenyaa',
    activeAccounts: 'Herregawwan Jiran',
    virtualCards: 'Kaardiiwwan Dijitaalaa',
    encryptedAssets: 'Galmee Eegame',
    atmModule: 'Kaardii ATM / Deebitii',
    mobileBankingModule: 'Baankii Moobaayilaa',
    originBranch: 'Damee Baankii',
    bankOrgName: 'Maqaa Baankii / Dhaabbataa',
    accountNumber: 'Lakkoofsa Herregaa',
    phoneNumber: 'Lakkoofsa Bilbilaa',
    accountName: 'Maqaa Herregaa',
    atmCardNumber: 'Lakkoofsa Kaardii ATM',
    cvv: 'Koodii CVV',
    atmPin: 'PIN Kaardii ATM',
    mobileBankingPin: 'PIN Baankii Moobaayilaa',
    memo: 'Yaadannoo',
    currentBalance: 'Haftee Herregaa',
    saveAccount: 'Galmeessi',
    cancel: 'Haqi',
    deleteAccount: 'Herrega Balleessi',
    revealData: 'Iccitii Mul\'isi',
    hideData: 'Iccitii Dhoksi',
    flipCard: 'Kaardii Garagalsi',
    copyNumber: 'Waraabi',
    copied: 'Milkaa\'inaan waraabameera!',
    recentTransactions: 'Daddabarsa Dhihoo',
    addTransaction: 'Daddabarsa Galmeessi',
    income: 'Galii',
    expense: 'Baasii',
    category: 'Gosa',
    amount: 'Hamma',
    burnRate: 'Haala Baasii fi Galii',
    securityAudit: 'Qorannoo Eegumsaa',
    emergencyExport: 'Baak-appii Baasi',
    importVault: 'Baak-appii Deebisi',
    language: 'Afaan',
    installApp: 'Appii Fe\'adhu',
    offlineNotice: 'Interneetii Malee Hojjechaa Jira',
    quickParseNotice: 'Ergaa SMS Baankii maxxansi',
    autoLockNotice: 'Ofumaan cufamuun eegamaa dha',
    weakPinWarning: 'PIN Laafaa: Lakkoofsota salphoo fayyadamuun balaaf nama saaxila',
    zeroKnowledgeBadge: 'Iccitii Guutuu • AES-256-GCM',
    tabs: {
      vault: 'Kuusaa',
      cards: 'Kaardii',
      finance: 'Faayinaansii',
      security: 'Eegumsa',
    },
  },
  fr: {
    appName: 'Krypton Vault',
    vaultTitle: 'Coffre-fort Zéro-Connaissance',
    tagline: 'Centre de contrôle financier et identifiants chiffrés côté client',
    unlocked: 'Coffre Déverrouillé',
    locked: 'Coffre Verrouillé',
    lockVault: 'Verrouiller le Coffre',
    unlockVault: 'Déverrouiller le Coffre',
    enterMasterPin: 'Entrez le mot de passe maître / Code PIN',
    masterPasswordPlaceholder: 'Mot de passe maître (8 caractères min)',
    biometricUnlock: 'Déverrouiller avec FaceID / Biométrie',
    searchPlaceholder: 'Rechercher par nom, compte, banque, téléphone...',
    newAccount: 'Nouveau Compte',
    totalBalance: 'Actifs Totaux du Coffre',
    activeAccounts: 'Comptes Actifs',
    virtualCards: 'Cartes Virtuelles',
    encryptedAssets: 'Dossiers Chiffrés',
    atmModule: 'Module Carte Bancaire / DAB',
    mobileBankingModule: 'Module Banque Mobile',
    originBranch: 'Agence d\'Origine',
    bankOrgName: 'Banque / Organisation',
    accountNumber: 'Numéro de Compte',
    phoneNumber: 'Numéro de Téléphone',
    accountName: 'Intitulé du Compte',
    atmCardNumber: 'Numéro de Carte DAB',
    cvv: 'Code de Sécurité CVV',
    atmPin: 'Code PIN DAB (Chiffré)',
    mobileBankingPin: 'Code PIN Banque Mobile (Chiffré)',
    memo: 'Mémo & Notes',
    currentBalance: 'Solde Actuel',
    saveAccount: 'Enregistrer dans le Coffre Chiffré',
    cancel: 'Annuler',
    deleteAccount: 'Supprimer le Compte',
    revealData: 'Révéler les Données Secrètes',
    hideData: 'Masquer les Données',
    flipCard: 'Retourner la Carte',
    copyNumber: 'Copier dans le Presse-papier',
    copied: 'Copié en toute sécurité !',
    recentTransactions: 'Transactions Récentes',
    addTransaction: 'Enregistrer une Transaction',
    income: 'Revenu',
    expense: 'Dépense',
    category: 'Catégorie',
    amount: 'Montant',
    burnRate: 'Flux Financier & Taux de Dépense',
    securityAudit: 'Audit de Santé & Sécurité',
    emergencyExport: 'Exporter Sauvegarde Chiffrée',
    importVault: 'Restaurer Sauvegarde',
    language: 'Langue',
    installApp: 'Installer la PWA',
    offlineNotice: 'Mode Hors-Ligne Actif — Données depuis le cache local',
    quickParseNotice: 'Collage Intelligent : collez un SMS bancaire pour remplir automatiquement',
    autoLockNotice: 'Verrouillage automatique activé',
    weakPinWarning: 'Code PIN Faible : les suites ou répétitions présentent un risque',
    zeroKnowledgeBadge: 'Architecture Zéro-Connaissance • AES-256-GCM',
    tabs: {
      vault: 'Coffre',
      cards: 'Cartes',
      finance: 'Finances',
      security: 'Sécurité',
    },
  },
  es: {
    appName: 'Krypton Vault',
    vaultTitle: 'Bóveda de Conocimiento Cero',
    tagline: 'Centro de control de credenciales y finanzas con cifrado en el cliente',
    unlocked: 'Bóveda Desbloqueada',
    locked: 'Bóveda Bloqueada',
    lockVault: 'Bloquear Bóveda',
    unlockVault: 'Desbloquear Bóveda',
    enterMasterPin: 'Ingrese Contraseña Maestra / PIN',
    masterPasswordPlaceholder: 'Contraseña maestra (mínimo 8 caracteres)',
    biometricUnlock: 'Desbloquear con Huella / Biometría',
    searchPlaceholder: 'Buscar por nombre, cuenta, banco, teléfono...',
    newAccount: 'Nueva Cuenta',
    totalBalance: 'Activos Totales en Bóveda',
    activeAccounts: 'Cuentas Activas',
    virtualCards: 'Tarjetas Virtuales',
    encryptedAssets: 'Registros Cifrados',
    atmModule: 'Módulo de Tarjeta ATM / Débito',
    mobileBankingModule: 'Módulo de Banca Móvil',
    originBranch: 'Sucursal de Origen',
    bankOrgName: 'Banco / Organización',
    accountNumber: 'Número de Cuenta',
    phoneNumber: 'Número de Teléfono',
    accountName: 'Nombre de Cuenta',
    atmCardNumber: 'Número de Tarjeta ATM',
    cvv: 'Código CVV',
    atmPin: 'PIN de ATM (Cifrado)',
    mobileBankingPin: 'PIN de Banca Móvil (Cifrado)',
    memo: 'Memo y Notas',
    currentBalance: 'Saldo Actual',
    saveAccount: 'Guardar en Bóveda Cifrada',
    cancel: 'Cancelar',
    deleteAccount: 'Eliminar Cuenta',
    revealData: 'Revelar Datos Sensibles',
    hideData: 'Ocultar Datos',
    flipCard: 'Girar Tarjeta',
    copyNumber: 'Copiar al Portapapeles',
    copied: '¡Copiado de forma segura!',
    recentTransactions: 'Transacciones Recientes',
    addTransaction: 'Registrar Transacción',
    income: 'Ingreso',
    expense: 'Gasto',
    category: 'Categoría',
    amount: 'Monto',
    burnRate: 'Flujo de Caja y Tasa de Gasto',
    securityAudit: 'Auditoría de Seguridad',
    emergencyExport: 'Exportar Copia Cifrada',
    importVault: 'Restaurar Copia Cifrada',
    language: 'Idioma',
    installApp: 'Instalar Aplicación PWA',
    offlineNotice: 'Modo sin Conexión Activo — Usando caché local segura',
    quickParseNotice: 'Pegado Inteligente: pegue un SMS bancario para autocompletar',
    autoLockNotice: 'Bloqueo automático configurado',
    weakPinWarning: 'PIN Débil detectado: números secuenciales o repetitivos tienen alto riesgo',
    zeroKnowledgeBadge: 'Arquitectura de Conocimiento Cero • AES-256-GCM',
    tabs: {
      vault: 'Bóveda',
      cards: 'Tarjetas',
      finance: 'Finanzas',
      security: 'Seguridad',
    },
  },
};
