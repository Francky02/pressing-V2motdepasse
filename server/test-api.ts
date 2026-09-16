const BASE_URL = 'http://127.0.0.1:5000/api';

async function runTests() {
  console.log('🚀 Démarrage des tests complets Relancio : Brique Clients + Créances + Isolation Multi-Tenant...');
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
    const loginARes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'royalclean@example.com', password: 'Password123!' }),
    });
    const loginA = await loginARes.json();
    assert(loginARes.status === 200 && !!loginA.token, 'Connexion Entreprise A (Royal Clean) réussie');

    // 2. Connexion Entreprise B
    const loginBRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'etoiles@example.com', password: 'Password123!' }),
    });
    const loginB = await loginBRes.json();
    assert(loginBRes.status === 200 && !!loginB.token, 'Connexion Entreprise B (Les Étoiles) réussie');

    // 3. Test Module Clients - Entreprise A crée un nouveau client
    const testPhone = `+225 07 ${Math.floor(10000000 + Math.random() * 90000000)}`;
    const createCliRes = await fetch(`${BASE_URL}/company/clients`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${loginA.token}`,
      },
      body: JSON.stringify({
        nom: 'Cabinet Dentaire Dr Touré',
        telephone: testPhone,
        email: 'contact@cabinet-toure.ci',
        adresse: 'Abidjan Cocody II Plateaux',
        type: 'entreprise',
        notes: 'Blouses médicales et draps stériles',
      }),
    });
    const createCliData = await createCliRes.json();
    assert(createCliRes.status === 201 && !!createCliData.client.id, 'Création Client pour Entreprise A réussie (201)');
    const clientAId = createCliData.client.id;

    // 4. Consultation et modification Client A
    const updateCliRes = await fetch(`${BASE_URL}/company/clients/${clientAId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${loginA.token}`,
      },
      body: JSON.stringify({
        adresse: 'Abidjan Cocody II Plateaux Vallon',
        notes: 'Blouses médicales avec livraison express',
      }),
    });
    const updateCliData = await updateCliRes.json();
    assert(updateCliRes.status === 200 && updateCliData.client.adresse.includes('Vallon'), 'Modification Client A réussie');

    // 5. Recherche et listing clients Entreprise A
    const listCliARes = await fetch(`${BASE_URL}/company/clients?search=Cabinet`, {
      headers: { Authorization: `Bearer ${loginA.token}` },
    });
    const listCliA = await listCliARes.json();
    assert(listCliARes.status === 200 && listCliA.clients.some((c: { id: string }) => c.id === clientAId), 'Recherche client par mot-clé fonctionne');

    // 6. Test Module Créances - Création Créance pour Client A
    const futureDate = new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString().split('T')[0];
    const createCreRes = await fetch(`${BASE_URL}/company/creances`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${loginA.token}`,
      },
      body: JSON.stringify({
        client_id: clientAId,
        motif: 'Nettoyage spécialisé 50 blouses médicales',
        description: 'Traitement antibactérien haute température',
        montant_total: 100000,
        date_echeance: futureDate,
        notes: 'Règlement à la livraison',
      }),
    });
    const createCreData = await createCreRes.json();
    assert(createCreRes.status === 201 && createCreData.creance.statut === 'en_attente', 'Créance créée avec statut initial "en_attente"');
    assert(createCreData.creance.solde === 100000, 'Solde initial calculé égal à 100 000 FCFA');
    const creanceAId = createCreData.creance.id;

    // 7. Enregistrement Paiement Partiel (30 000 FCFA)
    const partPayRes = await fetch(`${BASE_URL}/company/creances/${creanceAId}/paiements`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${loginA.token}`,
      },
      body: JSON.stringify({
        montant: 30000,
        moyen_paiement: 'virement',
        reference: 'VIR-MED-01',
        notes: 'Premier acompte',
      }),
    });
    const partPayData = await partPayRes.json();
    assert(partPayRes.status === 201, 'Paiement partiel enregistré (201)');
    assert(partPayData.creance.montant_paye === 30000, 'Montant payé mis à jour à 30 000 FCFA');
    assert(partPayData.creance.solde === 70000, 'Solde recalculé à 70 000 FCFA');
    assert(partPayData.creance.statut === 'partiellement_payee', 'Statut automatiquement basculé vers "partiellement_payee"');

    // 8. Enregistrement Solde Final (70 000 FCFA)
    const fullPayRes = await fetch(`${BASE_URL}/company/creances/${creanceAId}/paiements`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${loginA.token}`,
      },
      body: JSON.stringify({
        montant: 70000,
        moyen_paiement: 'especes',
        reference: 'ESP-MED-SOLDE',
        notes: 'Solde complet réglé',
      }),
    });
    const fullPayData = await fullPayRes.json();
    assert(fullPayRes.status === 201, 'Second paiement enregistré avec succès');
    assert(fullPayData.creance.solde === 0, 'Solde final égal à 0 FCFA');
    assert(fullPayData.creance.statut === 'payee', 'Statut automatiquement basculé vers "payee"');

    // 9. Créance avec date d'échéance dépassée -> statut "en_retard"
    const pastDate = '2026-08-01';
    const overdueRes = await fetch(`${BASE_URL}/company/creances`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${loginA.token}`,
      },
      body: JSON.stringify({
        client_id: clientAId,
        motif: 'Commande urgente gants et masques',
        description: 'Fourniture matériel',
        montant_total: 45000,
        date_echeance: pastDate,
      }),
    });
    const overdueData = await overdueRes.json();
    assert(overdueData.creance.statut === 'en_retard', 'Créance avec date dépassée est automatiquement statut "en_retard"');

    // 10. Consultation Fiche Client complète
    const clientDetailRes = await fetch(`${BASE_URL}/company/clients/${clientAId}`, {
      headers: { Authorization: `Bearer ${loginA.token}` },
    });
    const clientDetail = await clientDetailRes.json();
    assert(clientDetail.financialSummary.creancesCount >= 2, 'Fiche client compte les créances créées');
    assert(clientDetail.financialSummary.totalDue === 145000, 'Total dû cumulé calculé avec précision');
    assert(clientDetail.financialSummary.totalPaid === 100000, 'Total payé cumulé calculé avec précision');
    assert(clientDetail.financialSummary.balance === 45000, 'Solde restant client calculé avec précision (45 000 FCFA)');

    // 11. Soft delete (archivage / réactivation client)
    const archiveRes = await fetch(`${BASE_URL}/company/clients/${clientAId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${loginA.token}`,
      },
      body: JSON.stringify({ actif: false }),
    });
    const archiveData = await archiveRes.json();
    assert(archiveRes.status === 200 && archiveData.client.actif === false, 'Désactivation / archivage client (actif=false) sans suppression');

    // ==========================================
    // 12. ISOLATION MULTI-TENANT CRITIQUE (ENTREPRISE A vs ENTREPRISE B)
    // ==========================================
    console.log('\n🔒 Tests de sécurité et isolation étanche entre Entreprise A et Entreprise B...');

    // Tentative de B d'accéder au Client A
    const bAccessClientARes = await fetch(`${BASE_URL}/company/clients/${clientAId}`, {
      headers: { Authorization: `Bearer ${loginB.token}` },
    });
    assert(bAccessClientARes.status === 404, 'Entreprise B ne peut PAS consulter le client de l\'Entreprise A (404)');

    // Tentative de B de modifier le Client A
    const bUpdateClientARes = await fetch(`${BASE_URL}/company/clients/${clientAId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${loginB.token}`,
      },
      body: JSON.stringify({ nom: 'PIRATAGE DU NOM' }),
    });
    assert(bUpdateClientARes.status === 404, 'Entreprise B ne peut PAS modifier le client de l\'Entreprise A (404)');

    // Tentative de B d'accéder à la Créance A
    const bAccessCreanceARes = await fetch(`${BASE_URL}/company/creances/${creanceAId}`, {
      headers: { Authorization: `Bearer ${loginB.token}` },
    });
    assert(bAccessCreanceARes.status === 404, 'Entreprise B ne peut PAS consulter la créance de l\'Entreprise A (404)');

    // Tentative de B d'enregistrer un paiement sur la Créance A
    const bPayCreanceARes = await fetch(`${BASE_URL}/company/creances/${creanceAId}/paiements`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${loginB.token}`,
      },
      body: JSON.stringify({ montant: 5000 }),
    });
    assert(bPayCreanceARes.status === 404, 'Entreprise B ne peut PAS encaisser ou altérer la créance de l\'Entreprise A (404)');

    // Vérifier la liste des clients pour Entreprise B
    const listCliBRes = await fetch(`${BASE_URL}/company/clients`, {
      headers: { Authorization: `Bearer ${loginB.token}` },
    });
    const listCliB = await listCliBRes.json();
    const hasClientA = listCliB.clients.some((c: { id: string }) => c.id === clientAId);
    assert(!hasClientA, 'La liste des clients de B ne contient AUCUN client de A');

    // Réactiver le client A pour terminer proprement
    await fetch(`${BASE_URL}/company/clients/${clientAId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${loginA.token}`,
      },
      body: JSON.stringify({ actif: true }),
    });

    // 13. Dashboard Entreprise A : statistiques réelles
    const dashARes = await fetch(`${BASE_URL}/company/dashboard`, {
      headers: { Authorization: `Bearer ${loginA.token}` },
    });
    const dashA = await dashARes.json();
    assert(dashARes.status === 200, 'Dashboard Entreprise A récupère les statistiques réelles');
    assert(dashA.stats.totalToRecover > 0, `Total à récupérer réel calculé (${dashA.stats.totalToRecover.toLocaleString('fr-FR')} FCFA)`);
    assert(dashA.stats.totalCollected > 0, `Total encaissé réel calculé (${dashA.stats.totalCollected.toLocaleString('fr-FR')} FCFA)`);
    assert(dashA.stats.clientsToRemindCount >= 1, `Clients à relancer calculé (${dashA.stats.clientsToRemindCount} client(s) en retard)`);

    console.log(`\n🎉 Bilan des tests : ${passed} passés, ${failed} échoués sur ${passed + failed} tests.`);
    if (failed > 0) process.exit(1);
  } catch (error) {
    console.error('Erreur inattendue pendant les tests:', error);
    process.exit(1);
  }
}

runTests();
