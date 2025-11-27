
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();
const db = admin.firestore();

// --- HELPER FUNCTIONS ---

const findUserByRole = async (tenantId: string, role: string): Promise<string | null> => {
    const usersQuery = await db.collection("users")
        .where("tenantId", "==", tenantId)
        .where("role", "==", role)
        .limit(1)
        .get();
    if (!usersQuery.empty) {
        return usersQuery.docs[0].id;
    }
    return null;
};

// --- ERP INTEGRATION HANDLERS (MODULARIZED) ---

// Mock handler for SAP integration
const handleSapSync = async (tenantId: string, syncType: string) => {
    functions.logger.info(`[MOCK-SAP] Starting sync for tenant ${tenantId}, type: ${syncType}`);
    if (syncType === 'assets') {
        return { success: true, message: "Successfully synced 50 assets from SAP." };
    } else if (syncType === 'financials') {
        const mockData = [{ id: 'SAP-FIN-001', amount: 7500, vendor: 'SAP Vendor' }];
        return { success: true, data: mockData, message: "Successfully pulled financial data from SAP." };
    }
    throw new functions.https.HttpsError("invalid-argument", "Invalid syncType for SAP.");
};

// Mock handler for Totvs integration
const handleTotvsSync = async (tenantId: string, syncType: string) => {
    functions.logger.info(`[MOCK-TOTVS] Starting sync for tenant ${tenantId}, type: ${syncType}`);
    if (syncType === 'assets') {
        return { success: true, message: "Successfully synced 120 assets from Totvs." };
    } else if (syncType === 'financials') {
        const mockData = [{ id: 'TOTVS-FIN-002', amount: 3200, vendor: 'Totvs Vendor' }];
        return { success: true, data: mockData, message: "Successfully pulled financial data from Totvs." };
    }
    throw new functions.https.HttpsError("invalid-argument", "Invalid syncType for Totvs.");
};

// Mock handler for Oracle integration
const handleOracleSync = async (tenantId: string, syncType: string) => {
    functions.logger.info(`[MOCK-ORACLE] Starting sync for tenant ${tenantId}, type: ${syncType}`);
    if (syncType === 'assets') {
        return { success: true, message: "Successfully synced 200 assets from Oracle." };
    } else if (syncType === 'financials') {
        const mockData = [{ id: 'ORACLE-FIN-003', amount: 15000, vendor: 'Oracle Vendor' }];
        return { success: true, data: mockData, message: "Successfully pulled financial data from Oracle." };
    }
    throw new functions.https.HttpsError("invalid-argument", "Invalid syncType for Oracle.");
};


// --- CLOUD FUNCTIONS ---

// 1. Set Custom Claims on New User Creation
export const setCustomClaimsOnCreate = functions.auth.user().onCreate(async (user) => {
    const email = user.email;
    try {
        const inviteQuery = await db.collection("users").where("email", "==", email).where("status", "==", "invited").limit(1).get();
        let customClaims = {};
        let userProfile = {};

        if (!inviteQuery.empty) {
            const inviteDoc = inviteQuery.docs[0];
            const inviteData = inviteDoc.data();
            customClaims = { tenantId: inviteData.tenantId, role: inviteData.role };
            userProfile = {
                email: user.email, name: user.displayName || inviteData.name, role: inviteData.role,
                tenantId: inviteData.tenantId, status: 'active',
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
                joinedAt: admin.firestore.FieldValue.serverTimestamp(),
            };
            await inviteDoc.ref.delete();
            functions.logger.info(`User ${user.uid} joined tenant ${inviteData.tenantId} via invite.`);
        } else {
            customClaims = { tenantId: user.uid, role: "admin" };
            userProfile = {
                email: user.email, name: user.displayName, role: "admin",
                tenantId: user.uid, createdAt: admin.firestore.FieldValue.serverTimestamp(), status: 'active',
            };
            functions.logger.info(`New independent user ${user.uid} created.`);
        }
        await admin.auth().setCustomUserClaims(user.uid, customClaims);
        await db.collection("users").doc(user.uid).set(userProfile);
    } catch (error) {
        functions.logger.error("Error setting custom claims:", error);
    }
});

// 2. Trigger to Send Invitation Emails
export const sendInvitationEmail = functions.firestore.document("users/{userId}").onCreate(async (snap) => {
    const userData = snap.data();
    if (userData.status === 'invited') {
        const { email, role, tenantId, name } = userData;
        return db.collection("mail").add({
            to: email,
            message: {
                subject: "Você foi convidado para o SGA+!",
                html: `<p>Olá ${name},</p><p>Você foi convidado para participar da organização (ID: ${tenantId}) como ${role}.</p><p>Clique no link abaixo para criar sua conta:</p><a href="https://app-sga-plus.web.app/login">Criar Minha Conta</a>`,
            },
        });
    }
    return null;
});

// 3. Firestore Trigger: Update an aggregate count
export const onAssetCreate = functions.firestore.document("assets/{assetId}").onCreate(async (snap) => {
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
export const checkExpiringContracts = functions.pubsub.schedule("every 24 hours").onRun(async () => {
    const now = admin.firestore.Timestamp.now();
    const thirtyDaysFromNow = admin.firestore.Timestamp.fromMillis(now.toMillis() + 30 * 24 * 60 * 60 * 1000);
    const snapshot = await db.collection("contracts").where("status", "==", "Ativo").where("endDate", "<=", thirtyDaysFromNow).get();
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
    const { uid, tenantId, role } = context.auth.token;
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
        if (record.nextApprover !== uid) {
            throw new functions.https.HttpsError("permission-denied", "Not authorized for this approval.");
        }
        record.approvalHistory.push({
            actorId: uid, actorRole: role, status: approvalStatus,
            comment: comment || "", date: admin.firestore.Timestamp.now(),
        });
        if (approvalStatus === "Rejeitado") {
            record.status = "Rejeitado";
            record.nextApprover = null;
        } else if (approvalStatus === "Aprovado") {
            if (role === "Gerente" && record.cost > 5000) {
                const directorId = await findUserByRole(tenantId, "Diretor");
                if (!directorId) {
                    throw new functions.https.HttpsError("failed-precondition", "No Director found to escalate approval.");
                }
                record.status = "Pendente";
                record.nextApprover = directorId;
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

// 6. Callable Function: ERP Integration (Refactored for Modularity)
export const syncWithERP = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "Must be authenticated.");
    }
    const { tenantId, role } = context.auth.token;
    const { erpSystem, syncType } = data;

    if (role !== 'admin' && role !== 'Gerente') {
        throw new functions.https.HttpsError("permission-denied", "You do not have permission for this action.");
    }
    if (!erpSystem || !syncType) {
        throw new functions.https.HttpsError("invalid-argument", "Missing erpSystem or syncType parameters.");
    }

    try {
        switch (erpSystem) {
            case "sap":
                return await handleSapSync(tenantId, syncType);
            case "totvs":
                return await handleTotvsSync(tenantId, syncType);
            case "oracle":
                return await handleOracleSync(tenantId, syncType);
            default:
                throw new functions.https.HttpsError("invalid-argument", `ERP system '${erpSystem}' is not supported.`);
        }
    } catch (error) {
        functions.logger.error(`Error during ERP sync for tenant ${tenantId}:`, error);
        if (error instanceof functions.https.HttpsError) {
            throw error;
        }
        throw new functions.https.HttpsError("internal", "An error occurred during ERP synchronization.");
    }
});


// 7. Callable Function: Update Tenant Theme Settings
export const updateThemeSettings = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "Must be authenticated to update theme settings.");
    }
    const { tenantId, role } = context.auth.token;
    const { logoUrl, primaryColor, secondaryColor } = data;

    if (role !== 'admin') {
        throw new functions.https.HttpsError("permission-denied", "You do not have permission for this action.");
    }
    if (!logoUrl && !primaryColor && !secondaryColor) {
        throw new functions.https.HttpsError("invalid-argument", "At least one theme setting must be provided.");
    }

    const themeData: { [key: string]: any } = {};
    if (logoUrl) {
        if (typeof logoUrl !== 'string' || !logoUrl.startsWith('https://')) {
            throw new functions.https.HttpsError("invalid-argument", "Invalid logo URL format.");
        }
        themeData['logoUrl'] = logoUrl;
    }
    if (primaryColor) {
        if (typeof primaryColor !== 'string' || !/^#[0-9a-fA-F]{6}$/.test(primaryColor)) {
            throw new functions.https.HttpsError("invalid-argument", "Invalid primary color format. Must be a hex code.");
        }
        themeData['primaryColor'] = primaryColor;
    }
    if (secondaryColor) {
        if (typeof secondaryColor !== 'string' || !/^#[0-9a-fA-F]{6}$/.test(secondaryColor)) {
            throw new functions.https.HttpsError("invalid-argument", "Invalid secondary color format. Must be a hex code.");
        }
        themeData['secondaryColor'] = secondaryColor;
    }

    const tenantRef = db.collection("tenants").doc(tenantId);
    try {
        await tenantRef.set({ theme: themeData }, { merge: true });
        functions.logger.info(`Theme settings updated for tenant ${tenantId}.`);
        return { success: true, message: "Theme updated successfully." };
    } catch (error) {
        functions.logger.error(`Error updating theme for tenant ${tenantId}:`, error);
        throw new functions.https.HttpsError("internal", "An error occurred while updating the theme.");
    }
});

// 8. Callable Function: Send Chat Message
export const sendChatMessage = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "Must be authenticated to send a message.");
    }
    const { tenantId } = context.auth.token;
    const { messageText } = data;

    if (!messageText || typeof messageText !== 'string') {
        throw new functions.https.HttpsError("invalid-argument", "Message text is required.");
    }

    const chatMessage = {
        senderId: context.auth.uid,
        senderName: context.auth.token.name || "Usuário", // Assumes 'name' is in the token
        tenantId: tenantId,
        text: messageText,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
    };

    try {
        await db.collection("chats").doc(tenantId).collection("messages").add(chatMessage);
        return { success: true };
    } catch (error) {
        functions.logger.error(`Error sending chat message for tenant ${tenantId}:`, error);
        throw new functions.https.HttpsError("internal", "Failed to send message.");
    }
});

// 9. Firestore Trigger: On New Chat Message (for future notifications)
export const onNewChatMessage = functions.firestore
    .document("chats/{tenantId}/messages/{messageId}")
    .onCreate(async (snap, context) => {
        const message = snap.data();
        const { tenantId } = context.params;

        // Log the new message for now. 
        // This can be expanded to send push notifications to other users in the tenant.
        functions.logger.info(`New chat message in tenant ${tenantId}: ${message.text}`);

        return null;
    });
