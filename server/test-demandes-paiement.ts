import assert from 'assert';

const API_URL = 'http://localhost:5000';

async function runDemandesPaiementTests() {
  console.log('🚀 Démarrage des tests automatisés : Demandes de Paiement + Liens Publics + Isolation Multi-Tenant...');

  let passed = 0;
  let failed = 0;

  function testAssert(condition: boolean, message: string) {
    if (condition) {
      console.log(`✅ [PASS] ${message}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${message}`);
      failed++;
    }
  }

  try {
    // 1. Connexion Entreprise A (Royal Clean)
    const loginARes = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'royalclean@example.com', password: 'Password123!' }),
    });
    const loginA = await loginARes.json();
    testAssert(loginARes.status === 200 && !!loginA.token, 'Connexion Entreprise A (Royal Clean) réussie');

    // 2. Connexion Entreprise B (Les Étoiles)
    const loginBRes = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'etoiles@example.com', password: 'Password123!' }),
    });
    const loginB = await loginBRes.json();
    testAssert(loginBRes.status === 200 && !!loginB.token, 'Connexion Entreprise B (Les Étoiles) réussie');

    // 3. Récupérer les créances de l'Entreprise A
    const creancesARes = await fetch(`${API_URL}/api/company/creances`, {
      headers: { Authorization: `Bearer ${loginA.token}` },
    });
    const creancesA = await creancesARes.json();
    testAssert(creancesARes.status === 200 && Array.isArray(creancesA.creances) && creancesA.creances.length > 0, 'Récupération des créances Entreprise A');

    const targetCreance = creancesA.creances[0];

    // 4. Entreprise A crée une demande de paiement liée à cette créance
    const createDemandeRes = await fetch(`${API_URL}/api/company/demandes-paiement`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${loginA.token}`,
      },
      body: JSON.stringify({
        creance_id: targetCreance.id,
        montant: Math.min(targetCreance.solde || 25000, 25000),
        motif: 'Règlement express Pressing Costume',
        description: 'Prestation pressing haute couture',
        date_expiration: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString().split('T')[0],
      }),
    });
    const createDemandeData = await createDemandeRes.json();
    testAssert(
      createDemandeRes.status === 201 && !!createDemandeData.demande && !!createDemandeData.demande.token,
      'Création demande de paiement Entreprise A réussie avec token unique'
    );

    const demandeA = createDemandeData.demande;
    const publicToken = demandeA.token;

    // 5. Test de la page publique (Sans AUCUNE authentification)
    const publicRes = await fetch(`${API_URL}/api/public/payer/${publicToken}`);
    const publicData = await publicRes.json();
    testAssert(
      publicRes.status === 200 &&
      publicData.demande.id === demandeA.id &&
      publicData.company.nom === 'Pressing Royal Clean Premium' &&
      !!publicData.client.nom &&
      publicData.demande.statut === 'en_attente',
      'Accès public sans connexion à la page de paiement avec branding entreprise et détails'
    );

    // 6. Test token invalide ou inexistant (404)
    const invalidTokenRes = await fetch(`${API_URL}/api/public/payer/token_inexistant_99999`);
    testAssert(invalidTokenRes.status === 404, 'Token public invalide rejeté avec erreur 404');

    // 7. Isolation Multi-Tenant : Entreprise B ne doit PAS voir la demande de A
    const listDemandesBRes = await fetch(`${API_URL}/api/company/demandes-paiement`, {
      headers: { Authorization: `Bearer ${loginB.token}` },
    });
    const listDemandesB = await listDemandesBRes.json();
    const hasAInB = listDemandesB.demandes.some((d: any) => d.id === demandeA.id || d.entreprise_id === loginA.company.id);
    testAssert(!hasAInB, 'Entreprise B ne voit strictement AUCUNE demande de paiement de Entreprise A');

    // 8. Isolation Multi-Tenant : Entreprise B ne peut pas consulter la demande de A par ID
    const getDemandeByIdB = await fetch(`${API_URL}/api/company/demandes-paiement/${demandeA.id}`, {
      headers: { Authorization: `Bearer ${loginB.token}` },
    });
    testAssert(getDemandeByIdB.status === 404, 'Tentative d\'accès direct de B à la demande de A rejetée (404)');

    // 9. Isolation Multi-Tenant : Entreprise B ne peut pas annuler la demande de A
    const cancelDemandeByB = await fetch(`${API_URL}/api/company/demandes-paiement/${demandeA.id}/annuler`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${loginB.token}` },
    });
    testAssert(cancelDemandeByB.status === 404, 'Tentative d\'annulation par B de la demande de A rejetée (404)');

    // 10. Entreprise A consulte ses demandes liées à la créance
    const creanceDemandesRes = await fetch(`${API_URL}/api/company/creances/${targetCreance.id}/demandes-paiement`, {
      headers: { Authorization: `Bearer ${loginA.token}` },
    });
    const creanceDemandesData = await creanceDemandesRes.json();
    testAssert(
      creanceDemandesRes.status === 200 &&
      Array.isArray(creanceDemandesData.demandes) &&
      creanceDemandesData.demandes.some((d: any) => d.id === demandeA.id),
      'Récupération des demandes de paiement liées à une créance spécifique'
    );

    // 11. Entreprise A annule sa propre demande de paiement
    const cancelRes = await fetch(`${API_URL}/api/company/demandes-paiement/${demandeA.id}/annuler`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${loginA.token}` },
    });
    const cancelData = await cancelRes.json();
    testAssert(
      cancelRes.status === 200 && cancelData.demande.statut === 'annulee',
      'Annulation de la demande de paiement par Entreprise A réussie'
    );

    // 12. Vérification que la page publique reflète le statut "annulee"
    const publicAfterCancelRes = await fetch(`${API_URL}/api/public/payer/${publicToken}`);
    const publicAfterCancelData = await publicAfterCancelRes.json();
    testAssert(
      publicAfterCancelRes.status === 200 && publicAfterCancelData.demande.statut === 'annulee',
      'Page publique synchronisée en temps réel avec le statut "annulee"'
    );

    console.log(`\n🎉 Résultat des tests du module Demandes de Paiement : ${passed} passés, ${failed} échoués sur ${passed + failed} tests.`);
    if (failed > 0) process.exit(1);
  } catch (err) {
    console.error('Erreur inattendue pendant les tests de demandes de paiement:', err);
    process.exit(1);
  }
}

runDemandesPaiementTests();
