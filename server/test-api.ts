import { db } from './db.js';

const BASE_URL = 'http://127.0.0.1:5000/api';

async function runTests() {
  console.log('🚀 Démarrage des tests de validation backend & isolation...');
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, message: string) {
    if (condition) {
      console.log(`✅ [PASS] ${message}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${message}`);
      failed++;
    }
  }

  try {
    // Test 1: Inscription d'une nouvelle entreprise
    const newCompEmail = `test.garage.${Date.now()}@example.com`;
    const regRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nom_entreprise: 'Garage Turbo Test',
        responsable: 'Mamadou Touré',
        email: newCompEmail,
        telephone: '+225 07 12 34 56',
        secteur: 'Garage',
        password: 'Password123!',
        confirm_password: 'Password123!',
      }),
    });
    const regData = await regRes.json();
    assert(regRes.status === 201 && !!regData.token, 'Inscription nouvelle entreprise retourne token et 201');
    assert(regData.user.role === 'ENTREPRISE_ADMIN', 'L\'utilisateur créé a le rôle ENTREPRISE_ADMIN');
    assert(regData.company.secteur === 'Garage', 'L\'entreprise a le secteur Garage');

    // Test 2: Connexion de l'entreprise A
    const loginARes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'royalclean@example.com',
        password: 'Password123!',
      }),
    });
    const loginA = await loginARes.json();
    assert(loginARes.status === 200 && !!loginA.token, 'Connexion Entreprise A (royalclean) réussie');

    // Test 3: Connexion de l'entreprise B
    const loginBRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'etoiles@example.com',
        password: 'Password123!',
      }),
    });
    const loginB = await loginBRes.json();
    assert(loginBRes.status === 200 && !!loginB.token, 'Connexion Entreprise B (etoiles) réussie');

    // Test 4: ISOLATION CRITIQUE DES DONNÉES ENTREPRISE
    const dashARes = await fetch(`${BASE_URL}/company/dashboard`, {
      headers: { Authorization: `Bearer ${loginA.token}` },
    });
    const dashA = await dashARes.json();

    const dashBRes = await fetch(`${BASE_URL}/company/dashboard`, {
      headers: { Authorization: `Bearer ${loginB.token}` },
    });
    const dashB = await dashBRes.json();

    assert(dashA.company.nom === 'Pressing Royal Clean', 'Dashboard A appartient à Pressing Royal Clean');
    assert(dashB.company.nom === 'Groupe Scolaire Les Étoiles', 'Dashboard B appartient à Groupe Scolaire Les Étoiles');
    assert(dashA.company.id !== dashB.company.id, 'Les identifiants entreprise_id sont distincts');

    // Vérifier que les créances sont étanches et strictement isolées
    const claimsAforB = dashA.creances.some((c: { entreprise_id: string }) => c.entreprise_id === dashB.company.id);
    const claimsBforA = dashB.creances.some((c: { entreprise_id: string }) => c.entreprise_id === dashA.company.id);
    assert(!claimsAforB, 'Entreprise A ne peut voir AUCUNE créance de Entreprise B');
    assert(!claimsBforA, 'Entreprise B ne peut voir AUCUNE créance de Entreprise A');

    // Test 5: Mise à jour du profil et logo
    const updateRes = await fetch(`${BASE_URL}/company/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${loginA.token}`,
      },
      body: JSON.stringify({
        nom: 'Pressing Royal Clean Premium',
        couleur_principale: '#0ea5e9',
        couleur_secondaire: '#0369a1',
        adresse: 'Abidjan Cocody Nouveau Local',
      }),
    });
    const updateData = await updateRes.json();
    assert(updateRes.status === 200, 'Mise à jour profil entreprise A réussie');
    assert(updateData.company.nom === 'Pressing Royal Clean Premium', 'Nouveau nom entreprise persisté');

    // Test 6: Suppression du logo
    const deleteLogoRes = await fetch(`${BASE_URL}/company/logo`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${loginA.token}` },
    });
    const deleteLogoData = await deleteLogoRes.json();
    assert(deleteLogoRes.status === 200 && deleteLogoData.company.logo === null, 'Suppression du logo réussie');

    // Test 7: Super Admin Login & Dashboard
    const adminLoginRes = await fetch(`${BASE_URL}/auth/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@relancio.com',
        password: 'AdminRelancio2026!',
      }),
    });
    const adminLogin = await adminLoginRes.json();
    assert(adminLoginRes.status === 200 && !!adminLogin.token, 'Connexion Super Admin validée');

    // Test 8: Super Admin accès aux statistiques globales
    const adminStatsRes = await fetch(`${BASE_URL}/admin/stats`, {
      headers: { Authorization: `Bearer ${adminLogin.token}` },
    });
    const adminStats = await adminStatsRes.json();
    assert(adminStatsRes.status === 200 && adminStats.totalCompanies >= 2, 'Super Admin récupère les stats de toutes les entreprises');

    // Test 9: Refus d'accès administrateur à un utilisateur non-admin
    const unauthorizedRes = await fetch(`${BASE_URL}/admin/stats`, {
      headers: { Authorization: `Bearer ${loginA.token}` },
    });
    assert(unauthorizedRes.status === 403, 'Entreprise A est rejetée avec 403 sur la route Super Admin');

    // Test 10: Super Admin désactive une entreprise et vérifie le blocage d'accès
    const toggleDeactivateRes = await fetch(`${BASE_URL}/admin/companies/${regData.company.id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminLogin.token}`,
      },
      body: JSON.stringify({ actif: false }),
    });
    assert(toggleDeactivateRes.status === 200, 'Super Admin désactive l\'entreprise test');

    // Tentative d'accès par l'entreprise désactivée
    const blockedRes = await fetch(`${BASE_URL}/company/dashboard`, {
      headers: { Authorization: `Bearer ${regData.token}` },
    });
    assert(blockedRes.status === 403, 'L\'entreprise désactivée est immédiatement bloquée (403)');

    // Super Admin réactive l'entreprise
    const toggleActivateRes = await fetch(`${BASE_URL}/admin/companies/${regData.company.id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminLogin.token}`,
      },
      body: JSON.stringify({ actif: true }),
    });
    assert(toggleActivateRes.status === 200, 'Super Admin réactive l\'entreprise test avec succès');

    console.log(`\n🎉 Bilan des tests : ${passed} passés, ${failed} échoués sur ${passed + failed} tests.`);
    if (failed > 0) process.exit(1);
  } catch (error) {
    console.error('Erreur inattendue pendant les tests:', error);
    process.exit(1);
  }
}

runTests();
