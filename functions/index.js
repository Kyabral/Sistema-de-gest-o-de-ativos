
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.approveMaintenanceRequest = exports.checkExpiringContracts = exports.onAssetCreate = exports.setCustomClaimsOnCreate = void 0;
const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();
const db = admin.firestore();
// 1. Set Custom Claims on New User Creation
exports.setCustomClaimsOnCreate = functions.auth.user().onCreate(async (user) => {
    // For this model, each user is the admin of their own tenant.
    // The tenantId is the user's UID.
    const customClaims = {
        tenantId: user.uid,
        role: "admin",
    };
    try {
        await admin.auth().setCustomUserClaims(user.uid, customClaims);
        // Also create a user profile document in Firestore.
        await db.collection("users").doc(user.uid).set({
            email: user.email,
            name: user.displayName,
            role: "admin",
            tenantId: user.uid,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            status: 'active',
        });
        functions.logger.info(`Custom claims and user profile set for user ${user.uid}`, { uid: user.uid });
    }
    catch (error) {
        functions.logger.error("Error setting custom claims:", error);
    }
});
// 2. Firestore Trigger: Update an aggregate count when a new asset is created.
exports.onAssetCreate = functions.firestore
    .document("assets/{assetId}")
    .onCreate(async (snap, context) => {
    const { tenantId } = snap.data();
    if (!tenantId) {
        functions.logger.error("Asset created without tenantId!", { assetId: context.params.assetId });
        return null;
    }
    const counterRef = db.collection("tenants").doc(tenantId);
    // Use a transaction to safely increment the counter.
    return db.runTransaction(async (transaction) => {
        const tenantDoc = await transaction.get(counterRef);
        if (!tenantDoc.exists) {
            transaction.set(counterRef, { assetCount: 1 });
        }
        else {
            const newCount = (tenantDoc.data()?.assetCount || 0) + 1;
            transaction.update(counterRef, { assetCount: newCount });
        }
    });
});
// 3. Scheduled Function (Cron Job): Runs daily to check for expiring contracts.
exports.checkExpiringContracts = functions.pubsub.schedule("every 24 hours").onRun(async (context) => {
    functions.logger.info("Running daily check for expiring contracts...");
    const now = admin.firestore.Timestamp.now();
    const thirtyDaysFromNow = admin.firestore.Timestamp.fromMillis(now.toMillis() + 30 * 24 * 60 * 60 * 1000);
    const snapshot = await db.collection("contracts")
        .where("status", "==", "Ativo")
        .where("endDate", "<=", thirtyDaysFromNow)
        .get();
    if (snapshot.empty) {
        functions.logger.info("No contracts expiring soon.");
        return null;
    }
    const expiringContracts = snapshot.docs.map((doc) => doc.id);
    functions.logger.info(`Found expiring contracts: ${expiringContracts.join(", ")}`);
    // In a real app, you would create notifications or send emails here.
    return null;
});
// 4. Callable Function: A secure endpoint for complex business logic.
exports.approveMaintenanceRequest = functions.https.onCall(async (data, context) => {
    // Check authentication
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "The function must be called while authenticated.");
    }
    const { tenantId, role } = context.auth.token;
    const { assetId, maintenanceId, comment, approvalStatus } = data;
    if (!assetId || !maintenanceId || !approvalStatus) {
        throw new functions.https.HttpsError("invalid-argument", "Missing required parameters.");
    }
    const assetRef = db.collection("assets").doc(assetId);
    return db.runTransaction(async (transaction) => {
        const assetDoc = await transaction.get(assetRef);
        if (!assetDoc.exists || assetDoc.data()?.tenantId !== tenantId) {
            throw new functions.https.HttpsError("not-found", "Asset not found or permission denied.");
        }
        const assetData = assetDoc.data();
        const maintenanceHistory = assetData?.maintenanceHistory || [];
        const recordIndex = maintenanceHistory.findIndex((rec) => rec.id === maintenanceId);
        if (recordIndex === -1) {
            throw new functions.https.HttpsError("not-found", "Maintenance record not found.");
        }
        const record = maintenanceHistory[recordIndex];
        // Authorization check
        if (record.nextApprover !== role) {
            throw new functions.https.HttpsError("permission-denied", "You are not the designated approver for this request.");
        }
        // Business logic for approval flow
        record.approvalHistory.push({
            actor: role,
            status: approvalStatus,
            comment: comment || "",
            date: admin.firestore.Timestamp.now(),
        });
        if (approvalStatus === "Rejeitado") {
            record.status = "Rejeitado";
            record.nextApprover = null;
        }
        else if (approvalStatus === "Aprovado") {
            // Multi-level approval logic
            if (role === "Gerente" && record.cost > 5000) {
                record.status = "Pendente";
                record.nextApprover = "Diretor";
            }
            else {
                record.status = "Aprovado";
                record.nextApprover = null;
            }
        }
        maintenanceHistory[recordIndex] = record;
        transaction.update(assetRef, { maintenanceHistory });
        return { success: true, newStatus: record.status };
    });
});
//# sourceMappingURL=index.js.map
