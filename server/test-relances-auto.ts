const BASE_URL = 'http://127.0.0.1:5000/api';

async function runAutoRelancesTests() {
  console.log('🚀 Démarrage des tests complets du système de Relances WhatsApp (Manuel & Automatique)...');
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

    // =========================================================================
    // TEST 1 : Client avec numéro WhatsApp valide + Normalisation internationale
    // =========================================================================
    console.log('\n--- TEST 1 : Client avec numéro WhatsApp valide et normalisation ---');
    const uniquePhone = `+225 07 ${Math.floor(10000000 + Math.random() * 90000000)}`;
    const cliRes = await fetch(`${BASE_URL}/company/clients`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${loginA.token}`,
      },
      body: JSON.stringify({
        nom: 'M. Touré Alpha (Client Test Auto)',
        telephone: uniquePhone,
        email: 'toure.alpha@test.ci',
        adresse: 'Abidjan Cocody',
      }),
    });
    const cliData = await cliRes.json();
    const clientWithPhoneId = cliData.client.id;
    assert(cliRes.status === 201, 'Client avec téléphone créé');

    // Créer une créance pour ce client
    const pastDate7 = '2026-08-01';
    const creanceWithPhoneRes = await fetch(`${BASE_URL}/company/creances`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${loginA.token}`,
      },
      body: JSON.stringify({
        client_id: clientWithPhoneId,
        motif: 'Nettoyage 10 costumes de scène',
        montant_total: 150000,
        date_echeance: pastDate7,
      }),
    });
    const creanceWithPhoneData = await creanceWithPhoneRes.json();
    const creanceWithPhoneId = creanceWithPhoneData.creance.id;
    assert(creanceWithPhoneRes.status === 201, 'Créance créée pour client avec téléphone');

    // =========================================================================
    // TEST 2 : Relance manuelle enregistrée dans l'historique
    // =========================================================================
    console.log('\n--- TEST 2 : Enregistrement d\'une relance manuelle ---');
    const manualLogRes = await fetch(`${BASE_URL}/company/relances/manual-log`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${loginA.token}`,
      },
      body: JSON.stringify({
        creance_id: creanceWithPhoneId,
        message: 'Bonjour M. Touré, merci de procéder au règlement de votre facture de 150 000 FCFA.',
        canal: 'whatsapp',
      }),
    });
    const manualLogData = await manualLogRes.json();
    assert(manualLogRes.status === 201, 'Relance manuelle enregistrée (201)');
    assert(manualLogData.log.type === 'manuel', 'Type de log = "manuel"');
    assert(manualLogData.log.statut === 'envoye', 'Statut relance = "envoye"');
    assert(manualLogData.log.telephone_normalise.length >= 10, 'Numéro normalisé avec indicatif international');

    // =========================================================================
    // TEST 3 : Client sans numéro WhatsApp -> échec consigné dans l'historique
    // =========================================================================
    console.log('\n--- TEST 3 : Client SANS numéro WhatsApp -> échec consigné sans crash ---');
    const cliNoPhoneRes = await fetch(`${BASE_URL}/company/clients`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${loginA.token}`,
      },
      body: JSON.stringify({
        nom: 'Mme Sans Téléphone',
        telephone: '+225 00 00 00 00',
        email: 'sans.tel@test.ci',
      }),
    });
    const cliNoPhoneData = await cliNoPhoneRes.json();
    const clientNoPhoneId = cliNoPhoneData.client.id;

    // Vider le téléphone du client pour simuler l'absence de numéro WhatsApp
    await fetch(`${BASE_URL}/company/clients/${clientNoPhoneId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${loginA.token}`,
      },
      body: JSON.stringify({ telephone: '' }),
    });

    const creanceNoPhoneRes = await fetch(`${BASE_URL}/company/creances`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${loginA.token}`,
      },
      body: JSON.stringify({
        client_id: clientNoPhoneId,
        motif: 'Prestation sans numéro',
        montant_total: 80000,
        date_echeance: pastDate7,
      }),
    });
    const creanceNoPhoneData = await creanceNoPhoneRes.json();
    const creanceNoPhoneId = creanceNoPhoneData.creance.id;

    // Déclencher une relance auto forcée sur cette créance
    const autoFailRes = await fetch(`${BASE_URL}/company/relances/auto-process`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${loginA.token}`,
      },
      body: JSON.stringify({
        forceMilestone: 'J+7',
        forceCreanceId: creanceNoPhoneId,
      }),
    });
    const autoFailData = await autoFailRes.json();
    assert(autoFailRes.status === 200, 'Traitement relance auto exécuté sans erreur serveur');
    assert(autoFailData.result.failedCount >= 1, 'Échec d\'envoi comptabilisé (failedCount >= 1)');

    const failedLog = autoFailData.result.logs.find((l: { creance_id: string }) => l.creance_id === creanceNoPhoneId);
    assert(!!failedLog, 'Log d\'échec généré pour la créance sans numéro');
    assert(failedLog?.statut === 'echec', 'Statut du log = "echec"');
    assert(failedLog?.motif_echec?.includes('Numéro') || false, 'Motif d\'échec explicite présent dans le log');

    // =========================================================================
    // TEST 4 : Automatisation des échéances J-7, J-3, J0, J+3, J+7, J+14, J+30
    // =========================================================================
    console.log('\n--- TEST 4 : Moteur d\'échéances automatiques (J-7, J-3, J0, J+3, J+7, J+14, J+30) ---');
    const milestonesToTest = ['J-7', 'J-3', 'J0', 'J+3', 'J+7', 'J+14', 'J+30'];

    for (const ms of milestonesToTest) {
      const msRes = await fetch(`${BASE_URL}/company/relances/auto-process`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${loginA.token}`,
        },
        body: JSON.stringify({
          forceMilestone: ms,
          forceCreanceId: creanceWithPhoneId,
        }),
      });
      const msData = await msRes.json();
      assert(msRes.status === 200, `Échéance ${ms} traitée avec succès`);
      const log = msData.result.logs.find((l: { milestone: string }) => l.milestone === ms);
      assert(!!log && log.statut === 'envoye', `Relance automatique ${ms} envoyée et enregistrée`);
      assert(log?.message?.includes('FCFA'), `Message généré pour ${ms} contient le solde dû`);
    }

    // =========================================================================
    // TEST 5 : Paiement partiel -> Relance continue sur le solde restant
    // =========================================================================
    console.log('\n--- TEST 5 : Paiement partiel -> Relance sur solde restant ---');
    // Verser 50 000 F d'acompte sur creanceWithPhone (150 000 F -> solde 100 000 F)
    const partPayRes = await fetch(`${BASE_URL}/company/creances/${creanceWithPhoneId}/paiements`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${loginA.token}`,
      },
      body: JSON.stringify({
        montant: 50000,
        moyen_paiement: 'wave',
        reference: 'WAVE-TEST-PARTIEL',
      }),
    });
    const partPayData = await partPayRes.json();
    assert(partPayData.creance.solde === 100000, 'Solde créance recalculé à 100 000 FCFA');

    // Déclencher une nouvelle relance
    const autoPartRes = await fetch(`${BASE_URL}/company/relances/auto-process`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${loginA.token}`,
      },
      body: JSON.stringify({
        forceMilestone: 'J+14',
        forceCreanceId: creanceWithPhoneId,
      }),
    });
    const autoPartData = await autoPartRes.json();
    const partLog = autoPartData.result.logs.find((l: { creance_id: string }) => l.creance_id === creanceWithPhoneId);
    assert(partLog?.montant_solde === 100000, 'Le log de relance indique le solde restant exact de 100 000 FCFA');
    assert(partLog?.message?.includes('100\u202f000') || partLog?.message?.includes('100 000'), 'Le message WhatsApp mentionne le solde de 100 000 FCFA');

    // =========================================================================
    // TEST 6 : Paiement total -> Arrêt des relances futures
    // =========================================================================
    console.log('\n--- TEST 6 : Paiement total -> Arrêt définitif des relances ---');
    // Verser le solde restant de 100 000 F
    const fullPayRes = await fetch(`${BASE_URL}/company/creances/${creanceWithPhoneId}/paiements`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${loginA.token}`,
      },
      body: JSON.stringify({
        montant: 100000,
        moyen_paiement: 'especes',
        reference: 'ESP-TEST-SOLDE-TOTAL',
      }),
    });
    const fullPayData = await fullPayRes.json();
    assert(fullPayData.creance.solde === 0 && fullPayData.creance.statut === 'payee', 'Créance entièrement soldée (0 FCFA)');

    // Tenter de déclencher une relance auto sur cette créance payée
    const autoPaidRes = await fetch(`${BASE_URL}/company/relances/auto-process`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${loginA.token}`,
      },
      body: JSON.stringify({
        forceMilestone: 'J+30',
        forceCreanceId: creanceWithPhoneId,
      }),
    });
    const autoPaidData = await autoPaidRes.json();
    const paidLog = autoPaidData.result.logs.find((l: { creance_id: string }) => l.creance_id === creanceWithPhoneId);
    assert(!paidLog, 'AUCUNE relance n\'est générée pour une créance soldée (Arrêt confirmé)');

    // =========================================================================
    // TEST 7 : Paramètres d'automatisation (Activation / Désactivation par entreprise)
    // =========================================================================
    console.log('\n--- TEST 7 : Activation / Désactivation des relances automatiques ---');
    // Désactiver pour Entreprise A
    const setDisableRes = await fetch(`${BASE_URL}/company/relances/settings`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${loginA.token}`,
      },
      body: JSON.stringify({
        active: false,
        milestones: ['J-7', 'J0', 'J+7'],
      }),
    });
    const setDisableData = await setDisableRes.json();
    assert(setDisableRes.status === 200 && setDisableData.settings.active === false, 'Désactivation des relances auto enregistrée');

    // Vérifier que le moteur refuse de traiter lorsque désactivé
    const disabledProcessRes = await fetch(`${BASE_URL}/company/relances/auto-process`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${loginA.token}`,
      },
      body: JSON.stringify({}),
    });
    const disabledProcessData = await disabledProcessRes.json();
    assert(disabledProcessData.result.active === false && disabledProcessData.result.processedCount === 0, 'Le moteur ne traite aucune créance si l\'option est désactivée');

    // Réactiver pour Entreprise A
    await fetch(`${BASE_URL}/company/relances/settings`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${loginA.token}`,
      },
      body: JSON.stringify({
        active: true,
        milestones: ['J-7', 'J-3', 'J0', 'J+3', 'J+7', 'J+14', 'J+30'],
      }),
    });

    // =========================================================================
    // TEST 8 : Isolation multi-tenant des logs et paramètres
    // =========================================================================
    console.log('\n--- TEST 8 : Isolation multi-tenant des historiques et paramètres ---');
    const logsARes = await fetch(`${BASE_URL}/company/relances/logs`, {
      headers: { Authorization: `Bearer ${loginA.token}` },
    });
    const logsA = await logsARes.json();
    assert(logsARes.status === 200 && logsA.logs.length > 0, 'Entreprise A récupère son historique de relances');

    const logsBRes = await fetch(`${BASE_URL}/company/relances/logs`, {
      headers: { Authorization: `Bearer ${loginB.token}` },
    });
    const logsB = await logsBRes.json();

    // Vérifier qu'aucun log de A n'apparaît dans B
    const hasALogInB = logsB.logs.some((l: { entreprise_id: string }) => l.entreprise_id === 'ent-royal-clean');
    assert(!hasALogInB, 'L\'Entreprise B ne voit AUCUN log de relance de l\'Entreprise A (Isolation 100% étanche)');

    console.log(`\n🎉 BILAN DES TESTS RELANCES AUTOMATIQUES : ${passed} passés, ${failed} échoués sur ${passed + failed} tests.`);
    if (failed > 0) process.exit(1);
  } catch (err) {
    console.error('Erreur inattendue pendant les tests de relances automatiques:', err);
    process.exit(1);
  }
}

runAutoRelancesTests();
