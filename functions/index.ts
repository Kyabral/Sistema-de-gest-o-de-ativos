import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();
const db = admin.firestore();

// 1. Set Custom Claims on New User Creation
// This function handles two scenarios:
// A) New user signing up independently -> becomes Admin of their own new Tenant.
// B) User signing up with an email that was previously INVITED -> joins the existing Tenant with the assigned role.
export const setCustomClaimsOnCreate = functions.auth.user().onCreate(async (user) => {
    const email = user.email;
    
    try {
        // Check if there is a pending invite for this email
        const inviteQuery = await db.collection("users")
            .where("email", "==", email)
            .where("status", "==", "invited")
            .limit(1)
            .get();

        let customClaims = {};
        let userProfile = {};

        if (!inviteQuery.empty) {
            // SCENARIO B: User was invited
            const inviteDoc = inviteQuery.docs[0];
            const inviteData = inviteDoc.data();

            customClaims = {
                tenantId: inviteData.tenantId,
                role: inviteData.role,
            };

            userProfile = {
                email: user.email,
                name: user.displayName || inviteData.name,
                role: inviteData.role,
                tenantId: inviteData.tenantId,
                status: 'active', // Activate the user
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
                joinedAt: admin.firestore.FieldValue.serverTimestamp(),
            };

            // Delete the placeholder invite document since we are creating the real auth user doc
            await inviteDoc.ref.delete();
            functions.logger.info(`User ${user.uid} joined tenant ${inviteData.tenantId} via invite.`);

        } else {
            // SCENARIO A: New independent user
            customClaims = {
                tenantId: user.uid, // Own tenant
                role: "admin",
            };

            userProfile = {
                email: user.email,
                name: user.displayName,
                role: "admin",
                tenantId: user.uid,
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
                status: 'active',
            };
            functions.logger.info(`New independent user ${user.uid} created.`);
        }

        // Apply claims and create Firestore document
        await admin.auth().setCustomUserClaims(user.uid, customClaims);
        await db.collection("users").doc(user.uid).set(userProfile);

    } catch (error) {
        functions.logger.error("Error setting custom claims:", error);
    }
});


// 2. Trigger to Simulate Sending Invitation Emails
export const sendInvitationEmail = functions.firestore
    .document("users/{userId}")
    .onCreate(async (snap, context) => {
        const userData = snap.data();

        // Only trigger for invited users (not full accounts yet)
        if (userData.status === 'invited') {
            const { email, role, tenantId, name } = userData;
            
            // Here you would integrate with SendGrid, Mailgun, etc.
            // For this demo, we log the action.
            functions.logger.info(`
                [MOCK EMAIL SERVICE]
                To: ${email}
                Subject: Você foi convidado para o SGA+!
                Body: Olá ${name}, você foi convidado para participar da organização (ID: ${tenantId}) como ${role}.
                Clique aqui para criar sua conta: https://app-sga-plus.web.app/login
            `);
            
            return db.collection("mail_logs").add({
                to: email,
                type: 'invitation',
                sentAt: admin.firestore.FieldValue.serverTimestamp(),
                status: 'simulated'
            });
        }
        return null;
    });


// 3. Firestore Trigger: Update an aggregate count when a new asset is created.
export const onAssetCreate = functions.firestore
    .document("assets/{assetId}")
    .onCreate(async (snap, context) => {
        const { tenantId } = snap.data();
        if (!tenantId) return null;

        const counterRef = db.collection("tenants").doc(tenantId);
        
        return db.runTransaction(async (transaction) => {
            const tenantDoc = await transaction.get(counterRef);
            if (!tenantDoc.exists) {
                transaction.set(counterRef, { assetCount: 1 });
            } else {
                const newCount = (tenantDoc.data()?.assetCount || 0) + 1;
                transaction.update(counterRef, { assetCount: newCount });
            }
        });
    });


// 4. Scheduled Function: Check for expiring contracts
export const checkExpiringContracts = functions.pubsub.schedule("every 24 hours").onRun(async (context) => {
    const now = admin.firestore.Timestamp.now();
    const thirtyDaysFromNow = admin.firestore.Timestamp.fromMillis(now.toMillis() + 30 * 24 * 60 * 60 * 1000);

    const snapshot = await db.collection("contracts")
        .where("status", "==", "Ativo")
        .where("endDate", "<=", thirtyDaysFromNow)
        .get();
        
    if (!snapshot.empty) {
        const expiringContracts = snapshot.docs.map((doc) => doc.id);
        functions.logger.info(`Expiring contracts found: ${expiringContracts.join(", ")}`);
    }
    return null;
});


// 5. Callable Function: Approve Maintenance
export const approveMaintenanceRequest = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "Must be authenticated.");
    }
    
    const { tenantId, role } = context.auth.token;
    const { assetId, maintenanceId, comment, approvalStatus } = data;

    if (!assetId || !maintenanceId || !approvalStatus) {
        throw new functions.https.HttpsError("invalid-argument", "Missing parameters.");
    }

    const assetRef = db.collection("assets").doc(assetId);

    return db.runTransaction(async (transaction) => {
        const assetDoc = await transaction.get(assetRef);
        if (!assetDoc.exists || assetDoc.data()?.tenantId !== tenantId) {
            throw new functions.https.HttpsError("not-found", "Asset not found.");
        }

        const assetData = assetDoc.data();
        const maintenanceHistory = assetData?.maintenanceHistory || [];
        const recordIndex = maintenanceHistory.findIndex((rec: any) => rec.id === maintenanceId);

        if (recordIndex === -1) {
            throw new functions.https.HttpsError("not-found", "Record not found.");
        }

        const record = maintenanceHistory[recordIndex];

        if (record.nextApprover !== role) {
            throw new functions.https.HttpsError("permission-denied", "Not authorized.");
        }
        
        record.approvalHistory.push({
            actor: role,
            status: approvalStatus,
            comment: comment || "",
            date: admin.firestore.Timestamp.now(),
        });

        if (approvalStatus === "Rejeitado") {
            record.status = "Rejeitado";
            record.nextApprover = null;
        } else if (approvalStatus === "Aprovado") {
            if (role === "Gerente" && record.cost > 5000) {
                record.status = "Pendente";
                record.nextApprover = "Diretor";
            } else {
                record.status = "Aprovado";
                record.nextApprover = null;
            }
        }
        
        maintenanceHistory[recordIndex] = record;
        transaction.update(assetRef, { maintenanceHistory });
        return { success: true, newStatus: record.status };
    });
});