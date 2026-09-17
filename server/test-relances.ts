const BASE_URL = 'http://127.0.0.1:5000/api';

async function runRelancesTests() {
  console.log('🚀 Démarrage des tests spécifiques au module Relances de Relancio...');
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
    // 0. Authentification Entreprise A (Royal Clean) et Entreprise B (Les Étoiles)
    const loginARes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'royalclean@example.com', password: 'Password123!' }),
    });
    const loginA = await loginARes.json();
    assert(loginARes.status === 200 && !!loginA.token, 'Authentification Entreprise A réussie');

    const loginBRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'etoiles@example.com', password: 'Password123!' }),
    });
    const loginB = await loginBRes.json();
    assert(loginBRes.status === 200 && !!loginB.token, 'Authentification Entreprise B réussie');

    // Récupérer un client pour Entreprise A
    const clientsARes = await fetch(`${BASE_URL}/company/clients`, {
      headers: { Authorization: `Bearer ${loginA.token}` },
    });
    const clientsA = await clientsARes.json();
    const clientA = clientsA.clients[0];
    assert(!!clientA, `Client trouvé pour Entreprise A (${clientA?.nom})`);

    // Récupérer un client pour Entreprise B
    const clientsBRes = await fetch(`${BASE_URL}/company/clients`, {
      headers: { Authorization: `Bearer ${loginB.token}` },
    });
    const clientsB = await clientsBRes.json();
    const clientB = clientsB.clients[0];
    assert(!!clientB, `Client trouvé pour Entreprise B (${clientB?.nom})`);

    // =========================================================================
    // TEST 1 : Créance 150 000 F, encaissé 0 F, échéance dépassée -> en retard
    // =========================================================================
    console.log('\n--- TEST 1 : Créance 150 000 F, encaissé 0 F, échéance dépassée ---');
    const pastDate = '2026-08-15';
    const creance1Res = await fetch(`${BASE_URL}/company/creances`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${loginA.token}`,
      },
      body: JSON.stringify({
        client_id: clientA.id,
        motif: 'Test 1 - Facture échue impayée',
        montant_total: 150000,
        date_echeance: pastDate,
      }),
    });
    const creance1Data = await creance1Res.json();
    assert(creance1Res.status === 201, 'Créance 1 créée (201)');
    assert(creance1Data.creance.montant_total === 150000, 'Montant total = 150 000 F');
    assert(creance1Data.creance.montant_paye === 0, 'Déjà encaissé = 0 F');
    assert(creance1Data.creance.solde === 150000, 'Solde restant = 150 000 F');
    assert(creance1Data.creance.statut === 'en_retard', 'Statut créance = "en_retard"');

    // Vérifier dans le endpoint des relances
    const relancesRes1 = await fetch(`${BASE_URL}/company/relances`, {
      headers: { Authorization: `Bearer ${loginA.token}` },
    });
    const relancesData1 = await relancesRes1.json();
    const foundInOverdue1 = relancesData1.overdue.find((c: { id: string }) => c.id === creance1Data.creance.id);
    assert(!!foundInOverdue1, 'La créance 150 000 F (0 F encaissé, échue) apparaît bien dans la liste des relances en retard');
    assert(foundInOverdue1?.solde === 150000, 'Le solde affiché dans les relances est de 150 000 F');
    assert(relancesData1.summary.isFullyUpToDate === false, 'Le système n\'affiche PAS "Tous les paiements sont à jour"');

    // =========================================================================
    // TEST 2 : Créance 150 000 F, encaissé 50 000 F, échéance dépassée -> solde 100 000 F
    // =========================================================================
    console.log('\n--- TEST 2 : Créance 150 000 F, encaissé 50 000 F, échéance dépassée ---');
    const creance2Res = await fetch(`${BASE_URL}/company/creances`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${loginA.token}`,
      },
      body: JSON.stringify({
        client_id: clientA.id,
        motif: 'Test 2 - Facture avec acompte et échéance passée',
        montant_total: 150000,
        date_echeance: pastDate,
      }),
    });
    const creance2Data = await creance2Res.json();
    const creance2Id = creance2Data.creance.id;

    // Enregistrer un acompte de 50 000 F
    const pay2Res = await fetch(`${BASE_URL}/company/creances/${creance2Id}/paiements`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${loginA.token}`,
      },
      body: JSON.stringify({
        montant: 50000,
        moyen_paiement: 'virement',
        reference: 'TEST-ACOMPTE-50K',
      }),
    });
    const pay2Data = await pay2Res.json();
    assert(pay2Res.status === 201, 'Acompte de 50 000 F enregistré');
    assert(pay2Data.creance.montant_paye === 50000, 'Déjà encaissé = 50 000 F');
    assert(pay2Data.creance.solde === 100000, 'Solde restant = 100 000 F');
    assert(pay2Data.creance.statut === 'en_retard', 'Statut créance avec solde > 0 et date échue reste "en_retard"');

    // Vérifier dans le endpoint relances
    const relancesRes2 = await fetch(`${BASE_URL}/company/relances`, {
      headers: { Authorization: `Bearer ${loginA.token}` },
    });
    const relancesData2 = await relancesRes2.json();
    const foundInOverdue2 = relancesData2.overdue.find((c: { id: string }) => c.id === creance2Id);
    assert(!!foundInOverdue2, 'La créance partiellement payée apparaît dans les relances en retard');
    assert(foundInOverdue2?.solde === 100000, 'Le solde restant exact de 100 000 F est pris en compte dans les relances');

    // =========================================================================
    // TEST 3 : Créance 150 000 F, encaissé 150 000 F -> doit être à jour
    // =========================================================================
    console.log('\n--- TEST 3 : Créance 150 000 F, encaissé 150 000 F ---');
    const creance3Res = await fetch(`${BASE_URL}/company/creances`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${loginA.token}`,
      },
      body: JSON.stringify({
        client_id: clientA.id,
        motif: 'Test 3 - Facture totalement réglée',
        montant_total: 150000,
        date_echeance: pastDate,
      }),
    });
    const creance3Data = await creance3Res.json();
    const creance3Id = creance3Data.creance.id;

    // Enregistrer le règlement complet de 150 000 F
    const pay3Res = await fetch(`${BASE_URL}/company/creances/${creance3Id}/paiements`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${loginA.token}`,
      },
      body: JSON.stringify({
        montant: 150000,
        moyen_paiement: 'especes',
        reference: 'TEST-SOLDE-TOTAL-150K',
      }),
    });
    const pay3Data = await pay3Res.json();
    assert(pay3Res.status === 201, 'Paiement total de 150 000 F enregistré');
    assert(pay3Data.creance.solde === 0, 'Solde créance = 0 F');
    assert(pay3Data.creance.statut === 'payee', 'Statut créance = "payee"');

    // Vérifier dans les relances
    const relancesRes3 = await fetch(`${BASE_URL}/company/relances`, {
      headers: { Authorization: `Bearer ${loginA.token}` },
    });
    const relancesData3 = await relancesRes3.json();
    const foundInOverdue3 = relancesData3.overdue.find((c: { id: string }) => c.id === creance3Id);
    const foundInUpcoming3 = relancesData3.upcoming.find((c: { id: string }) => c.id === creance3Id);
    const foundInUpToDate3 = relancesData3.upToDate.find((c: { id: string }) => c.id === creance3Id);
    assert(!foundInOverdue3, 'La créance payée n\'apparaît PAS dans les relances en retard');
    assert(!foundInUpcoming3, 'La créance payée n\'apparaît PAS dans les relances à venir');
    assert(!!foundInUpToDate3, 'La créance est correctement classée comme soldée / à jour');

    // =========================================================================
    // TEST 4 : Créance avec solde > 0 mais échéance future -> pas en retard, mais à venir
    // =========================================================================
    console.log('\n--- TEST 4 : Créance avec solde > 0 mais échéance future ---');
    const futureDate = new Date(Date.now() + 10 * 24 * 3600 * 1000).toISOString().split('T')[0];
    const creance4Res = await fetch(`${BASE_URL}/company/creances`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${loginA.token}`,
      },
      body: JSON.stringify({
        client_id: clientA.id,
        motif: 'Test 4 - Facture avec échéance future',
        montant_total: 150000,
        date_echeance: futureDate,
      }),
    });
    const creance4Data = await creance4Res.json();
    assert(creance4Res.status === 201, 'Créance 4 créée avec échéance future');
    assert(creance4Data.creance.statut === 'en_attente', 'Statut initial = "en_attente"');
    assert(creance4Data.creance.solde === 150000, 'Solde = 150 000 F');

    // Vérifier dans le endpoint des relances
    const relancesRes4 = await fetch(`${BASE_URL}/company/relances`, {
      headers: { Authorization: `Bearer ${loginA.token}` },
    });
    const relancesData4 = await relancesRes4.json();
    const foundInOverdue4 = relancesData4.overdue.find((c: { id: string }) => c.id === creance4Data.creance.id);
    const foundInUpcoming4 = relancesData4.upcoming.find((c: { id: string }) => c.id === creance4Data.creance.id);
    assert(!foundInOverdue4, 'La créance à échéance future ne doit PAS apparaître dans les créances en retard');
    assert(!!foundInUpcoming4, 'La créance à échéance future apparaît bien dans les créances à venir');
    assert(foundInUpcoming4?.solde === 150000, 'Le solde de 150 000 F est bien présent dans les créances à venir');

    // =========================================================================
    // TEST 5 : Isolation multi-tenant étanche entre Entreprise A et Entreprise B
    // =========================================================================
    console.log('\n--- TEST 5 : Isolation multi-tenant des relances ---');
    // Créer une créance spécifique chez Entreprise B
    const creanceBRes = await fetch(`${BASE_URL}/company/creances`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${loginB.token}`,
      },
      body: JSON.stringify({
        client_id: clientB.id,
        motif: 'Test 5 - Créance secrète Entreprise B',
        montant_total: 250000,
        date_echeance: pastDate,
      }),
    });
    const creanceBData = await creanceBRes.json();
    assert(creanceBRes.status === 201, 'Créance créée pour Entreprise B');

    // Requêter les relances d'Entreprise A
    const relancesAFinalRes = await fetch(`${BASE_URL}/company/relances`, {
      headers: { Authorization: `Bearer ${loginA.token}` },
    });
    const relancesAFinal = await relancesAFinalRes.json();

    // Vérifier qu'aucune créance d'Entreprise B n'apparaît dans les relances d'Entreprise A
    const hasBCreanceInA = relancesAFinal.allUnpaid.some((c: { id: string }) => c.id === creanceBData.creance.id);
    assert(!hasBCreanceInA, 'L\'Entreprise A ne voit AUCUNE créance ni relance de l\'Entreprise B');

    // Requêter les relances d'Entreprise B
    const relancesBFinalRes = await fetch(`${BASE_URL}/company/relances`, {
      headers: { Authorization: `Bearer ${loginB.token}` },
    });
    const relancesBFinal = await relancesBFinalRes.json();
    const hasACreanceInB = relancesBFinal.allUnpaid.some((c: { id: string }) => c.id === creance1Data.creance.id || c.id === creance2Id);
    assert(!hasACreanceInB, 'L\'Entreprise B ne voit AUCUNE créance ni relance de l\'Entreprise A');

    console.log(`\n🎉 BILAN DES TESTS RELANCES : ${passed} passés, ${failed} échoués sur ${passed + failed} tests.`);
    if (failed > 0) process.exit(1);
  } catch (err) {
    console.error('Erreur inattendue pendant les tests de relances:', err);
    process.exit(1);
  }
}

runRelancesTests();
