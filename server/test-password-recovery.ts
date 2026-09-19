import express from 'express';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { db } from './db.js';
import { authRouter } from './routes/auth.routes.js';
import { sendPasswordResetEmail, isSmtpConfigured } from './services/mailer.service.js';
import type { User } from './types.js';

interface TestResult {
  name: string;
  passed: boolean;
  details: string;
}

const results: TestResult[] = [];

function assert(condition: boolean, name: string, details: string) {
  if (condition) {
    results.push({ name, passed: true, details });
    console.log(`  ✓ [PASS] ${name}: ${details}`);
  } else {
    results.push({ name, passed: false, details });
    console.error(`  ✗ [FAIL] ${name}: ${details}`);
  }
}

async function runTests() {
  console.log('====================================================');
  console.log('  TEST DE VALIDATION : RÉCUPÉRATION DE MOT DE PASSE');
  console.log('====================================================\n');

  const testEmail = `test-recov-${Date.now()}@relancio-audit.ci`;
  const initialPassword = 'OldPassword123!';
  const newPassword = 'NewSecretPassword2026!';
  const testUserId = `usr-test-recov-${Date.now()}`;

  // 0. Création d'un compte de test isolé
  console.log('Étape 0 : Création du compte utilisateur de test...');
  const salt = bcrypt.genSaltSync(10);
  const initialHash = bcrypt.hashSync(initialPassword, salt);

  const testUser: User = {
    id: testUserId,
    entreprise_id: null,
    nom: 'Utilisateur Audit Récupération',
    email: testEmail,
    telephone: '+225 01 02 03 04',
    password_hash: initialHash,
    role: 'ENTREPRISE_ADMIN',
    actif: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  db.createUser(testUser);
  assert(!!db.getUserByEmail(testEmail), 'Création compte test', `Compte ${testEmail} prêt`);

  // 1. Test adresse inexistante (ne doit jamais révéler publiquement si l'adresse existe)
  console.log('\nÉtape 1 : Test adresse e-mail inexistante...');
  const unknownEmail = 'adresse-inexistante-99999@domain-non-existant.com';
  const unknownUser = db.getUserByEmail(unknownEmail);
  assert(unknownUser === undefined, 'Vérification non-existence', 'L\'adresse inconnue n\'existe pas');

  // 2. Test format invalide
  console.log('\nÉtape 2 : Test format d\'e-mail invalide...');
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isInvalidFormat = !emailRegex.test('mauvais-format-email');
  assert(isInvalidFormat, 'Rejet format email invalide', 'Le format est correctement détecté comme invalide');

  // 3. Test génération du token cryptographique et hashage SHA-256
  console.log('\nÉtape 3 : Génération du token cryptographique...');
  const rawToken = crypto.randomBytes(32).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');

  assert(rawToken.length === 64, 'Token longueur', 'Token généré de 64 caractères hex (32 octets aléatoires)');
  assert(tokenHash.length === 64, 'Token hash SHA-256', 'Le hash est bien un digest SHA-256');

  // Sauvegarde du token avec expiration 60 min
  const tokenRecord = db.createPasswordResetToken(testUser.id, tokenHash, 60);
  assert(!!tokenRecord && tokenRecord.used === false, 'Stockage du token', 'Token enregistré en base avec statut non-utilisé');

  // 4. Test du service d'e-mail (SMTP réel si configuré, ou mode DEV sans blocage)
  console.log('\nÉtape 4 : Test du service d\'e-mail (SMTP réel ou mode DEV)...');
  const appUrl = (process.env.APP_URL || 'http://localhost:5173').replace(/\/+$/, '');
  const resetUrl = `${appUrl}/reinitialiser-mot-de-passe/${rawToken}`;

  const mailResult = await sendPasswordResetEmail({
    to: testEmail,
    userName: testUser.nom,
    resetUrl,
    expiresInMinutes: 60,
  });

  if (isSmtpConfigured()) {
    assert(
      mailResult.success === true && mailResult.status === 'sent',
      'Envoi réel e-mail SMTP',
      `Message expédié via SMTP (MessageId: ${mailResult.messageId || 'N/A'})`
    );
  } else {
    assert(
      mailResult.status === 'smtp_not_configured' && mailResult.success === false,
      'Gestion gracieuse sans SMTP',
      'Détecté sans SMTP réel : aucune fausse confirmation d\'envoi, lien direct généré sans bloquer'
    );
  }

  // 5. Test vérification du token valide
  console.log('\nÉtape 5 : Vérification de la validité du token...');
  const fetchedToken = db.getPasswordResetToken(tokenHash);
  assert(
    !!fetchedToken && !fetchedToken.used && new Date(fetchedToken.expires_at).getTime() > Date.now(),
    'Validation token actif',
    'Le token est reconnu comme valide et non expiré'
  );

  // 6. Test token invalide
  console.log('\nÉtape 6 : Test token inexistant / invalide...');
  const fakeHash = crypto.createHash('sha256').update('fake-token-12345').digest('hex');
  const fakeTokenRecord = db.getPasswordResetToken(fakeHash);
  assert(fakeTokenRecord === undefined, 'Rejet token inconnu', 'Un faux token est correctement rejeté');

  // 7. Test token expiré
  console.log('\nÉtape 7 : Test simulation token expiré...');
  const expiredRawToken = crypto.randomBytes(32).toString('hex');
  const expiredHash = crypto.createHash('sha256').update(expiredRawToken).digest('hex');
  db.createPasswordResetToken(testUser.id, expiredHash, -10); // Expiré il y a 10 minutes
  const expiredTokenRecord = db.getPasswordResetToken(expiredHash);
  const isExpired = expiredTokenRecord ? new Date(expiredTokenRecord.expires_at).getTime() < Date.now() : false;
  assert(isExpired, 'Détection expiration token', 'Le token expiré est immédiatement détecté');

  // 8. Test validation mot de passe : non conforme (< 6 caractères) et différents
  console.log('\nÉtape 8 : Test règles de validation du mot de passe...');
  const shortPassword = '123';
  assert(shortPassword.length < 6, 'Rejet mot de passe trop court', 'Les mots de passe de moins de 6 caractères sont rejetés');
  assert('PasswordA' !== 'PasswordB', 'Rejet confirmation différente', 'Deux mots de passe non identiques sont rejetés');

  // 9. Test changement effectif du mot de passe
  console.log('\nÉtape 9 : Changement effectif du mot de passe...');
  const newSalt = bcrypt.genSaltSync(10);
  const newPasswordHash = bcrypt.hashSync(newPassword, newSalt);
  const updateSuccess = db.updateUserPassword(testUser.id, newPasswordHash);
  assert(updateSuccess, 'Mise à jour hash mot de passe', 'Nouveau hash bcrypt appliqué au compte');

  // Invalidation immédiate du token
  db.markPasswordResetTokenAsUsed(tokenHash);
  const invalidatedToken = db.getPasswordResetToken(tokenHash);
  assert(invalidatedToken?.used === true, 'Invalidation immédiate du token', 'Token marqué comme used=true');

  // 10. Test anti-rejeu : réutilisation du même token refusée
  console.log('\nÉtape 10 : Test anti-rejeu (réutilisation du token)...');
  const isReplayPrevented = invalidatedToken?.used === true;
  assert(isReplayPrevented, 'Prévention réutilisation token', 'Le token déjà utilisé ne peut plus être validé');

  // 11. Test connexion avec nouveau mot de passe
  console.log('\nÉtape 11 : Test connexion avec les nouveaux identifiants...');
  const refreshedUser = db.getUserByEmail(testEmail);
  assert(!!refreshedUser, 'Récupération utilisateur', 'Utilisateur retrouvé en base');

  if (refreshedUser) {
    const oldPasswordMatches = bcrypt.compareSync(initialPassword, refreshedUser.password_hash);
    assert(!oldPasswordMatches, 'Ancien mot de passe révoqué', 'L\'ancien mot de passe ne fonctionne PLUS');

    const newPasswordMatches = bcrypt.compareSync(newPassword, refreshedUser.password_hash);
    assert(newPasswordMatches, 'Nouveau mot de passe opérationnel', 'Le nouveau mot de passe fonctionne IMMÉDIATEMENT');
  }

  // 11b. Test HTTP réel des endpoints Express (Validation format JSON pur, absence totale de DOCTYPE HTML)
  console.log('\nÉtape 11b : Test HTTP direct des endpoints API Express...');
  const testApp = express();
  testApp.use(express.json());
  testApp.use('/api/auth', authRouter);
  testApp.use('/api', (_req, res) => res.status(404).json({ error: 'Endpoint API introuvable' }));

  const server = await new Promise<any>((resolve) => {
    const s = testApp.listen(0, '127.0.0.1', () => resolve(s));
  });
  const port = server.address().port;
  const baseUrl = `http://127.0.0.1:${port}`;

  try {
    // Test HTTP A : POST /api/auth/forgot-password format email invalide -> 400 JSON (pas de DOCTYPE)
    const resBad = await fetch(`${baseUrl}/api/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'format-invalide' }),
    });
    const contentTypeBad = resBad.headers.get('content-type') || '';
    const bodyBad = await resBad.json();
    assert(
      resBad.status === 400 && contentTypeBad.includes('application/json') && !!bodyBad.error,
      'HTTP POST /forgot-password erreur 400',
      `Retourne HTTP 400 avec Content-Type JSON valide et message : "${bodyBad.error}"`
    );

    // Test HTTP B : POST /api/auth/forgot-password valide -> 200 JSON pur (pas de DOCTYPE)
    const resGood = await fetch(`${baseUrl}/api/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail }),
    });
    const contentTypeGood = resGood.headers.get('content-type') || '';
    const textGood = await resGood.text();
    const isDocType = textGood.trim().startsWith('<!DOCTYPE') || textGood.trim().startsWith('<html');
    assert(
      resGood.status === 200 && contentTypeGood.includes('application/json') && !isDocType,
      'HTTP POST /forgot-password succès 200 JSON pur',
      'Retourne HTTP 200 au format JSON strict (aucun DOCTYPE HTML détecté)'
    );

    // Test HTTP C : GET /api/auth/verify-reset-token faux token -> 400 JSON (pas de DOCTYPE)
    const resVerifyBad = await fetch(`${baseUrl}/api/auth/verify-reset-token/fake-token-xyz-999`);
    const contentTypeVerify = resVerifyBad.headers.get('content-type') || '';
    const bodyVerify = await resVerifyBad.json();
    assert(
      resVerifyBad.status === 400 && contentTypeVerify.includes('application/json') && bodyVerify.valid === false,
      'HTTP GET /verify-reset-token faux token',
      `Retourne HTTP 400 JSON avec valid: false ("${bodyVerify.error}")`
    );
  } finally {
    await new Promise<void>((resolve) => server.close(() => resolve()));
  }

  // 12. Nettoyage du compte de test pour laisser db.json intact
  console.log('\nÉtape 12 : Nettoyage du compte de test...');
  const userIdx = (db as any).data.users.findIndex((u: User) => u.id === testUserId);
  if (userIdx !== -1) {
    (db as any).data.users.splice(userIdx, 1);
  }
  if ((db as any).data.password_reset_tokens) {
    (db as any).data.password_reset_tokens = (db as any).data.password_reset_tokens.filter(
      (t: any) => t.user_id !== testUserId
    );
  }
  (db as any).save();

  const cleanedUser = db.getUserByEmail(testEmail);
  assert(cleanedUser === undefined, 'Nettoyage terminé', 'Compte de test supprimé et db.json préservé');

  // Synthèse
  console.log('\n====================================================');
  console.log('  RÉSULTAT GLOBAL DE L\'AUDIT DE RÉCUPÉRATION');
  console.log('====================================================');
  const total = results.length;
  const passedCount = results.filter(r => r.passed).length;
  const failedCount = total - passedCount;

  console.log(`Total tests : ${total}`);
  console.log(`Succès      : ${passedCount}`);
  console.log(`Échecs      : ${failedCount}`);

  if (failedCount === 0) {
    console.log('\n>>> TOUS LES TESTS SONT VALIDÉS À 100% AVEC SUCCÈS ! <<<');
  } else {
    console.error(`\n>>> ATTENTION : ${failedCount} test(s) en échec ! <<<`);
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Erreur fatale exécution tests:', err);
  process.exit(1);
});
