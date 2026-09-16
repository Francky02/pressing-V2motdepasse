import { apiRequest } from '../src/services/api';

async function runLogoutCycleTests() {
  console.log('🧪 Démarrage des tests automatisés du cycle de déconnexion & sécurité des sessions Relancio...');
  const API_URL = 'http://localhost:5000';
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
    // 1. Connexion Entreprise A
    const loginARes = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'royalclean@example.com', password: 'Password123!' }),
    });
    const dataA = await loginARes.json();
    assert(loginARes.status === 200 && !!dataA.token, 'Connexion Entreprise A réussie et obtention du token JWT');
    const tokenA = dataA.token;

    // 2. Vérification des headers Cache-Control no-store
    const cacheControlHeader = loginARes.headers.get('cache-control');
    assert(
      cacheControlHeader !== null && cacheControlHeader.includes('no-store'),
      `En-têtes anti-cache configurés sur les réponses API (Cache-Control: ${cacheControlHeader})`
    );

    // 3. Accès autorisé avec token A
    const dashboardARes = await fetch(`${API_URL}/api/company/dashboard`, {
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    assert(dashboardARes.status === 200, 'Accès au dashboard autorisé avec le token valide de l\'Entreprise A');

    // 4. Appel de l\'endpoint de déconnexion côté serveur
    const logoutRes = await fetch(`${API_URL}/api/auth/logout`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    assert(logoutRes.status === 200, 'Endpoint /api/auth/logout répond avec succès (code 200)');

    // 5. Simulation de la suppression du token côté client et tentative d\'accès direct
    const noTokenDashboardRes = await fetch(`${API_URL}/api/company/dashboard`, {
      headers: {}, // Token supprimé du stockage
    });
    assert(noTokenDashboardRes.status === 401, 'Accès direct sans token refusé immédiatement (Erreur 401 Non authentifié)');

    const noTokenClientsRes = await fetch(`${API_URL}/api/company/clients`, {
      headers: {},
    });
    assert(noTokenClientsRes.status === 401, 'Accès à la liste des clients sans token refusé immédiatement (Erreur 401)');

    const noTokenCreancesRes = await fetch(`${API_URL}/api/company/creances`, {
      headers: {},
    });
    assert(noTokenCreancesRes.status === 401, 'Accès aux créances sans token refusé immédiatement (Erreur 401)');

    // 6. Test Super Admin : Connexion -> Token -> Déconnexion -> Refus
    const adminLoginRes = await fetch(`${API_URL}/api/auth/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@relancio.com', password: 'AdminRelancio2026!' }),
    });
    const adminData = await adminLoginRes.json();
    assert(adminLoginRes.status === 200 && adminData.user.role === 'SUPER_ADMIN', 'Connexion Super Admin validée');

    const adminStatsWithToken = await fetch(`${API_URL}/api/admin/stats`, {
      headers: { Authorization: `Bearer ${adminData.token}` },
    });
    assert(adminStatsWithToken.status === 200, 'Accès à la console Super Admin autorisé avec token');

    // Déconnexion Super Admin : accès sans token
    const adminStatsWithoutToken = await fetch(`${API_URL}/api/admin/stats`, {
      headers: {},
    });
    assert(adminStatsWithoutToken.status === 401, 'Accès à /api/admin sans token rejeté immédiatement (Erreur 401)');

    // 7. Test de Reconnexion avec Compte B (Étanchéité totale)
    const loginBRes = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'etoiles@example.com', password: 'Password123!' }),
    });
    const dataB = await loginBRes.json();
    assert(loginBRes.status === 200 && dataB.company.id !== dataA.company.id, 'Reconnexion Compte B (Les Étoiles) réussie');

    const clientsBRes = await fetch(`${API_URL}/api/company/clients`, {
      headers: { Authorization: `Bearer ${dataB.token}` },
    });
    const clientsBData = await clientsBRes.json();
    const hasADataInB = clientsBData.clients?.some((c: any) => c.entreprise_id === dataA.company.id);
    assert(!hasADataInB, 'Le Compte B ne possède strictement AUCUNE donnée du Compte A après sa reconnexion');

    console.log(`\n🎉 Résultat du cycle de déconnexion : ${passed} passés, ${failed} échoués sur ${passed + failed} tests.`);
    if (failed > 0) process.exit(1);
  } catch (err) {
    console.error('Erreur durant les tests du cycle de session:', err);
    process.exit(1);
  }
}

runLogoutCycleTests();
