import { create } from 'zustand';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { signIn, signUp, signOut, getCurrentUser, sendVerificationEmail, reloadUser } from '../firebase/auth';
import { auth } from '../firebase/config';
import * as fb from '../firebase/firestore';

const now = () => new Date().toISOString();
const daysAgo = (n) => new Date(Date.now() - n * 86400000).toISOString();
const hoursAgo = (n) => new Date(Date.now() - n * 3600000).toISOString();

const hydrate = (obj) => {
  if (!obj || typeof obj !== 'object') return obj;
  const result = {};
  for (const [key, val] of Object.entries(obj)) {
    if (val && typeof val === 'object' && 'toDate' in val && typeof val.toDate === 'function') {
      result[key] = val.toDate().toISOString();
    } else if (val && typeof val === 'object' && 'seconds' in val) {
      result[key] = new Date(val.seconds * 1000).toISOString();
    } else {
      result[key] = val;
    }
  }
  return result;
};

const hydrateAll = (arr) => arr.map(hydrate);

const useAppStore = create((set, get) => ({
  auth: {
    currentUser: null,
    isAuthenticated: false,
    activeRole: 'Consumer',
    isLoading: false,
    error: null,
  },

  users: [],
  circles: [],
  circleMembers: [],
  transactions: [],
  notifications: [],
  auditLogs: [],

  ui: {
    globalLoading: false,
    activeDialog: null,
    dialogData: null,
    snackbar: { open: false, message: '', severity: 'info' },
    telemetry: {
      ledgerIntegrity: 100,
      activeUsers: 0,
      connectionHealth: 'healthy',
      lastAuditTimestamp: null,
    },
  },

  /* ───── Firebase auth listener callback ───── */
  onAuthChanged: async (firebaseUser) => {
    if (firebaseUser) {
      set((s) => ({ auth: { ...s.auth, isLoading: true, error: null } }));
      const profile = await fb.getUserDoc(firebaseUser.uid);
      if (profile) {
        const u = hydrate(profile);
        set((s) => ({
          auth: {
            currentUser: u,
            isAuthenticated: true,
            activeRole: u.role || 'Consumer',
            isLoading: false,
            error: null,
          },
        }));
        await get().loadAllData();
      } else {
        set((s) => ({
          auth: {
            currentUser: { id: firebaseUser.uid, email: firebaseUser.email, role: 'Consumer' },
            isAuthenticated: true,
            activeRole: 'Consumer',
            isLoading: false,
            error: null,
          },
        }));
      }
    } else {
      set({
        auth: { currentUser: null, isAuthenticated: false, activeRole: 'Consumer', isLoading: false, error: null },
        users: [], circles: [], circleMembers: [], transactions: [], notifications: [], auditLogs: [],
      });
    }
  },

  /* ───── Load all data from Firestore ───── */
  loadAllData: async () => {
    try {
      const [users, circles, circleMembers, transactions, notifications, auditLogs] = await Promise.all([
        fb.getAllUsers(),
        fb.getAllCircles(),
        fb.getAllCircleMembers(),
        fb.getAllTransactions(),
        fb.getAllNotifications(),
        fb.getAllAuditLogs(),
      ]);
      const hydrated = {
        users: hydrateAll(users),
        circles: hydrateAll(circles),
        circleMembers: hydrateAll(circleMembers),
        transactions: hydrateAll(transactions),
        notifications: hydrateAll(notifications),
        auditLogs: hydrateAll(auditLogs),
      };
      const telemetry = get().computeTelemetry(hydrated);
      set({ ...hydrated, ui: { ...get().ui, telemetry } });
    } catch (err) {
      console.error('loadAllData error:', err);
    }
  },

  /* ───── Seed Firestore with demo data (idempotent) ───── */
  seedInitialData: async () => {
    const existing = await fb.getAllUsers();
    if (existing.length > 0) return;

    const u1 = { name: 'Amara Okafor', email: 'amara.okafor@example.com', phone: '+2348012345678', role: 'Admin', avatar: null, createdAt: daysAgo(90), updatedAt: daysAgo(1) };
    const u2 = { name: 'Chidi Eze', email: 'chidi.eze@example.com', phone: '+2348023456789', role: 'Consumer', avatar: null, createdAt: daysAgo(60), updatedAt: daysAgo(2) };
    const u3 = { name: 'Folake Balogun', email: 'folake.balogun@example.com', phone: '+2348034567890', role: 'Consumer', avatar: null, createdAt: daysAgo(45), updatedAt: daysAgo(3) };
    const u4 = { name: 'Kofi Mensah', email: 'kofi.mensah@example.com', phone: '+2348045678901', role: 'Consumer', avatar: null, createdAt: daysAgo(30), updatedAt: daysAgo(4) };
    const u5 = { name: 'Ngozi Okonkwo', email: 'ngozi.okonkwo@example.com', phone: '+2348056789012', role: 'Consumer', avatar: null, createdAt: daysAgo(20), updatedAt: daysAgo(5) };
    const u6 = { name: 'Tunde Bakare', email: 'tunde.bakare@example.com', phone: '+2348067890123', role: 'Admin', avatar: null, createdAt: daysAgo(100), updatedAt: daysAgo(1) };
    const u7 = { name: 'Yaa Asantewaa', email: 'yaa.asantewaa@example.com', phone: '+2348078901234', role: 'Consumer', avatar: null, createdAt: daysAgo(15), updatedAt: daysAgo(1) };
    const u8 = { name: 'Emeka Nwosu', email: 'emeka.nwosu@example.com', phone: '+2348089012345', role: 'Consumer', avatar: null, createdAt: daysAgo(10), updatedAt: daysAgo(1) };

    const seedUsers = [u1, u2, u3, u4, u5, u6, u7, u8];

    const uRefs = await Promise.all(
      seedUsers.map((u, i) => fb.createUserDoc(`SEED-USR-${String(i + 1).padStart(6, '0')}`, u))
    );
    const userIds = uRefs.map((u) => u.id);

    const circle1 = await fb.createCircle({ name: 'Alajo Savings Circle', description: 'Weekly rotating savings for market traders in Alajo market.', contributionAmount: 25000, frequency: 'Weekly', maxMembers: 6, createdBy: userIds[0] });
    const circle2 = await fb.createCircle({ name: 'Yaba Monthly Thrift', description: 'Monthly contribution pool for Yaba tech community members.', contributionAmount: 50000, frequency: 'Monthly', maxMembers: 8, createdBy: userIds[5] });
    const circle3 = await fb.createCircle({ name: 'Lagos Daily Ajo', description: 'Daily micro-savings pool for informal sector workers.', contributionAmount: 5000, frequency: 'Daily', maxMembers: 5, createdBy: userIds[0] });
    const circles = [circle1, circle2, circle3];
    const cIds = circles.map((c) => c.id);

    const cmDefs = [
      { circleId: cIds[0], userId: userIds[1], payoutOrder: 0 }, { circleId: cIds[0], userId: userIds[2], payoutOrder: 1 },
      { circleId: cIds[0], userId: userIds[3], payoutOrder: 2 }, { circleId: cIds[0], userId: userIds[4], payoutOrder: 3 },
      { circleId: cIds[0], userId: userIds[6], payoutOrder: 4 }, { circleId: cIds[1], userId: userIds[0], payoutOrder: 0 },
      { circleId: cIds[1], userId: userIds[2], payoutOrder: 1 }, { circleId: cIds[1], userId: userIds[3], payoutOrder: 2 },
      { circleId: cIds[1], userId: userIds[6], payoutOrder: 3 }, { circleId: cIds[1], userId: userIds[7], payoutOrder: 4 },
      { circleId: cIds[2], userId: userIds[0], payoutOrder: 0 }, { circleId: cIds[2], userId: userIds[1], payoutOrder: 1 },
      { circleId: cIds[2], userId: userIds[4], payoutOrder: 2 }, { circleId: cIds[2], userId: userIds[5], payoutOrder: 3 },
      { circleId: cIds[2], userId: userIds[7], payoutOrder: 4 },
    ];
    const cmRefs = await Promise.all(cmDefs.map((d) => fb.createCircleMember(d)));
    const getCm = (uId, cId) => cmRefs.find((m) => m.userId === uId && m.circleId === cId);

    const txs = [
      { circleId: cIds[0], memberId: getCm(userIds[1], cIds[0])?.id, userId: userIds[1], type: 'contribution', amount: 25000, reference: 'REF-AL-001', status: 'verified', verifiedBy: userIds[0], metadata: { cycleIndex: 0 } },
      { circleId: cIds[0], memberId: getCm(userIds[2], cIds[0])?.id, userId: userIds[2], type: 'contribution', amount: 25000, reference: 'REF-AL-002', status: 'verified', verifiedBy: userIds[0], metadata: { cycleIndex: 0 } },
      { circleId: cIds[0], memberId: getCm(userIds[3], cIds[0])?.id, userId: userIds[3], type: 'contribution', amount: 25000, reference: 'REF-AL-003', status: 'verified', verifiedBy: userIds[0], metadata: { cycleIndex: 0 } },
      { circleId: cIds[0], memberId: getCm(userIds[4], cIds[0])?.id, userId: userIds[4], type: 'contribution', amount: 25000, reference: 'REF-AL-004', status: 'verified', verifiedBy: userIds[0], metadata: { cycleIndex: 0 } },
      { circleId: cIds[0], memberId: getCm(userIds[6], cIds[0])?.id, userId: userIds[6], type: 'contribution', amount: 25000, reference: 'REF-AL-005', status: 'verified', verifiedBy: userIds[0], metadata: { cycleIndex: 0 } },
      { circleId: cIds[0], memberId: getCm(userIds[1], cIds[0])?.id, userId: userIds[1], type: 'payout', amount: 125000, reference: 'PAY-AL-001', status: 'verified', verifiedBy: userIds[0], metadata: { cycleIndex: 0, recipient: userIds[1] } },
      { circleId: cIds[1], memberId: getCm(userIds[0], cIds[1])?.id, userId: userIds[0], type: 'contribution', amount: 50000, reference: 'REF-YB-001', status: 'verified', verifiedBy: userIds[5], metadata: { cycleIndex: 0 } },
      { circleId: cIds[1], memberId: getCm(userIds[2], cIds[1])?.id, userId: userIds[2], type: 'contribution', amount: 50000, reference: 'REF-YB-002', status: 'verified', verifiedBy: userIds[5], metadata: { cycleIndex: 0 } },
      { circleId: cIds[1], memberId: getCm(userIds[3], cIds[1])?.id, userId: userIds[3], type: 'contribution', amount: 50000, reference: 'REF-YB-003', status: 'verified', verifiedBy: userIds[5], metadata: { cycleIndex: 0 } },
      { circleId: cIds[1], memberId: getCm(userIds[6], cIds[1])?.id, userId: userIds[6], type: 'contribution', amount: 50000, reference: 'REF-YB-004', status: 'verified', verifiedBy: userIds[5], metadata: { cycleIndex: 0 } },
      { circleId: cIds[1], memberId: getCm(userIds[7], cIds[1])?.id, userId: userIds[7], type: 'contribution', amount: 50000, reference: 'REF-YB-005', status: 'verified', verifiedBy: userIds[5], metadata: { cycleIndex: 0 } },
      { circleId: cIds[1], memberId: getCm(userIds[0], cIds[1])?.id, userId: userIds[0], type: 'payout', amount: 250000, reference: 'PAY-YB-001', status: 'verified', verifiedBy: userIds[5], metadata: { cycleIndex: 0, recipient: userIds[0] } },
      { circleId: cIds[2], memberId: getCm(userIds[0], cIds[2])?.id, userId: userIds[0], type: 'contribution', amount: 5000, reference: 'REF-LD-001', status: 'verified', verifiedBy: userIds[0], metadata: { cycleIndex: 0 } },
      { circleId: cIds[2], memberId: getCm(userIds[1], cIds[2])?.id, userId: userIds[1], type: 'contribution', amount: 5000, reference: 'REF-LD-002', status: 'verified', verifiedBy: userIds[0], metadata: { cycleIndex: 0 } },
      { circleId: cIds[2], memberId: getCm(userIds[4], cIds[2])?.id, userId: userIds[4], type: 'contribution', amount: 5000, reference: 'REF-LD-003', status: 'verified', verifiedBy: userIds[0], metadata: { cycleIndex: 0 } },
    ];
    for (const u of seedUsers) {
      try {
        await createUserWithEmailAndPassword(auth, u.email, 'password123');
      } catch (e) {
        // user likely already exists
      }
    }
    await signOut();

    const txPromises = txs.map((t) => fb.createTransaction(t));

    const notifs = [
      { userId: userIds[0], type: 'payout', title: 'Payout Processed', message: 'Cycle 1 payout of 250,000 has been processed for Yaba Monthly Thrift.', read: true },
      { userId: userIds[1], type: 'payout', title: 'You Received a Payout!', message: 'Congratulations! You received 125,000 from Alajo Savings Circle.', read: false },
      { userId: userIds[2], type: 'reminder', title: 'Contribution Due', message: 'Your weekly contribution of 25,000 for Alajo Savings Circle is due tomorrow.', read: false },
      { userId: userIds[3], type: 'reminder', title: 'Contribution Due', message: 'Your weekly contribution of 25,000 for Alajo Savings Circle is due tomorrow.', read: false },
      { userId: userIds[4], type: 'cycle', title: 'New Cycle Started', message: 'Alajo Savings Circle has advanced to Cycle 2.', read: true },
      { userId: userIds[0], type: 'system', title: 'Ledger Audit Complete', message: 'Scheduled audit of all transaction ledgers completed successfully. No discrepancies found.', read: true },
      { userId: userIds[5], type: 'system', title: 'New Member Joined Yaba Circle', message: 'Emeka Nwosu has joined Yaba Monthly Thrift circle.', read: true },
    ];
    const notifPromises = notifs.map((n) => fb.createNotification(n));

    const logs = [
      { userId: userIds[0], action: 'CIRCLE_CREATE', entityType: 'circle', entityId: cIds[0], details: { name: 'Alajo Savings Circle' } },
      { userId: userIds[5], action: 'CIRCLE_CREATE', entityType: 'circle', entityId: cIds[1], details: { name: 'Yaba Monthly Thrift' } },
      { userId: userIds[0], action: 'CIRCLE_CREATE', entityType: 'circle', entityId: cIds[2], details: { name: 'Lagos Daily Ajo' } },
      { userId: userIds[0], action: 'TRANSACTION_VERIFY', entityType: 'transaction', details: { amount: 125000, type: 'payout' } },
      { userId: userIds[5], action: 'TRANSACTION_VERIFY', entityType: 'transaction', details: { amount: 250000, type: 'payout' } },
      { userId: userIds[0], action: 'CYCLE_ADVANCE', entityType: 'circle', entityId: cIds[0], details: { fromIndex: 0, toIndex: 1 } },
      { userId: userIds[0], action: 'SYSTEM_AUDIT', entityType: 'system', entityId: 'SYS-001', details: { result: 'clean', recordsScanned: 15 } },
    ];
    const logPromises = logs.map((l) => fb.createAuditLog(l));

    await Promise.all([...txPromises, ...notifPromises, ...logPromises]);

    const currentUser = get().auth.currentUser;
    if (currentUser) {
      const authedUser = seedUsers.find((u) => u.email === currentUser.email);
      if (authedUser) {
        const idx = seedUsers.indexOf(authedUser);
        const uid = uRefs[idx]?.id;
        if (uid) {
          const profile = await fb.getUserDoc(uid);
          if (profile) {
            set((s) => ({
              auth: { ...s.auth, currentUser: hydrate(profile), activeRole: profile.role || 'Consumer' },
            }));
          }
        }
      }
      await get().loadAllData();
    }
  },

  /* ───── Auth ───── */
  login: async (email, password) => {
    set((s) => ({ auth: { ...s.auth, isLoading: true, error: null } }));
    try {
      const cred = await signIn(email, password);
      const profile = await fb.getUserDoc(cred.user.uid);
      if (profile) {
        const u = hydrate(profile);
        set((s) => ({
          auth: { currentUser: u, isAuthenticated: true, activeRole: u.role || 'Consumer', isLoading: false, error: null },
        }));
        await get().loadAllData();
        return { success: true, user: u };
      }
      const fallback = { id: cred.user.uid, email: cred.user.email, name: cred.user.displayName || '', role: 'Consumer' };
      set((s) => ({
        auth: { currentUser: fallback, isAuthenticated: true, activeRole: 'Consumer', isLoading: false, error: null },
      }));
      return { success: true, user: fallback };
    } catch (err) {
      const msg = err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found'
        ? 'Invalid email or password.' : err.message || 'Login failed.';
      set((s) => ({ auth: { ...s.auth, isLoading: false, error: msg } }));
      return { success: false, error: msg };
    }
  },

  register: async (userData) => {
    set((s) => ({ auth: { ...s.auth, isLoading: true, error: null } }));
    try {
      const cred = await signUp(userData.email, userData.password);
      const newUser = {
        name: userData.name, email: userData.email, phone: userData.phone || '', role: 'Consumer',
        avatar: null, createdAt: now(), updatedAt: now(),
      };
      await fb.createUserDoc(cred.user.uid, newUser);
      const u = { id: cred.user.uid, ...newUser };
      set((s) => ({
        auth: { currentUser: u, isAuthenticated: true, activeRole: 'Consumer', isLoading: false, error: null },
        auditLogs: [...s.auditLogs, { id: 'local', userId: cred.user.uid, action: 'USER_REGISTER', entityType: 'user', entityId: cred.user.uid, details: { email: newUser.email }, createdAt: now() }],
      }));
      await fb.createAuditLog({ userId: cred.user.uid, action: 'USER_REGISTER', entityType: 'user', entityId: cred.user.uid, details: { email: newUser.email } });
      return { success: true, user: u };
    } catch (err) {
      const msg = err.code === 'auth/email-already-in-use' ? 'An account with this email already exists.' : err.message || 'Registration failed.';
      set((s) => ({ auth: { ...s.auth, isLoading: false, error: msg } }));
      return { success: false, error: msg };
    }
  },

  registerAdminWithVerification: async (userData) => {
    set((s) => ({ auth: { ...s.auth, isLoading: true, error: null } }));
    try {
      const cred = await signUp(userData.email, userData.password);
      const newUser = {
        name: userData.name, email: userData.email, phone: userData.phone || '', role: 'PendingAdmin',
        avatar: null, createdAt: now(), updatedAt: now(),
      };
      await fb.createUserDoc(cred.user.uid, newUser);
      await sendVerificationEmail();
      const u = { id: cred.user.uid, ...newUser };
      set((s) => ({
        auth: { currentUser: u, isAuthenticated: true, activeRole: 'PendingAdmin', isLoading: false, error: null },
      }));
      await fb.createAuditLog({ userId: cred.user.uid, action: 'ADMIN_REGISTER', entityType: 'user', entityId: cred.user.uid, details: { email: newUser.email } });
      return { success: true, user: u, emailSent: true };
    } catch (err) {
      if (err.code === 'auth/email-already-in-use') {
        set((s) => ({ auth: { ...s.auth, isLoading: false, error: null } }));
        return { success: false, error: 'email-in-use', email: userData.email, password: userData.password };
      }
      const msg = err.message || 'Registration failed.';
      set((s) => ({ auth: { ...s.auth, isLoading: false, error: msg } }));
      return { success: false, error: msg };
    }
  },

  startAdminUpgrade: async (email, password, name, phone) => {
    set((s) => ({ auth: { ...s.auth, isLoading: true, error: null } }));
    try {
      const cred = await signIn(email, password);
      const uid = cred.user.uid;
      const existing = await fb.getUserDoc(uid);
      if (existing && existing.role === 'Admin') {
        set((s) => ({ auth: { ...s.auth, isLoading: false } }));
        return { success: true, alreadyAdmin: true };
      }
      const profile = {
        name: name || existing?.name || email.split('@')[0],
        email, phone: phone || existing?.phone || '', role: 'PendingAdmin',
        avatar: null, createdAt: existing?.createdAt || now(), updatedAt: now(),
      };
      await fb.createUserDoc(uid, profile);
      await sendVerificationEmail();
      await cred.user.reload();
      const u = { id: uid, ...profile };
      set((s) => ({
        auth: { currentUser: u, isAuthenticated: true, activeRole: 'PendingAdmin', isLoading: false, error: null },
      }));
      await fb.createAuditLog({ userId: uid, action: 'ADMIN_UPGRADE_STARTED', entityType: 'user', entityId: uid, details: { email } });
      return { success: true, user: u, emailSent: true };
    } catch (err) {
      const msg = err.code === 'auth/invalid-credential' ? 'Invalid password.' : err.message || 'Sign in failed.';
      set((s) => ({ auth: { ...s.auth, isLoading: false, error: msg } }));
      return { success: false, error: msg };
    }
  },

  checkAdminEmailVerification: async () => {
    set((s) => ({ auth: { ...s.auth, isLoading: true, error: null } }));
    try {
      const user = await reloadUser();
      if (!user || !user.emailVerified) {
        set((s) => ({ auth: { ...s.auth, isLoading: false, error: 'Email not verified yet. Please check your inbox and click the verification link.' } }));
        return { success: false };
      }
      const uid = user.uid;
      await fb.updateUserDoc(uid, { role: 'Admin' });
      const profile = await fb.getUserDoc(uid);
      const u = { id: uid, ...profile, role: 'Admin' };
      set((s) => ({
        auth: { currentUser: u, isAuthenticated: true, activeRole: 'Admin', isLoading: false, error: null },
      }));
      await get().loadAllData();
      return { success: true, user: u };
    } catch (err) {
      set((s) => ({ auth: { ...s.auth, isLoading: false, error: err.message } }));
      return { success: false, error: err.message };
    }
  },

  logout: async () => {
    await signOut();
    set({
      auth: { currentUser: null, isAuthenticated: false, activeRole: 'Consumer', isLoading: false, error: null },
      users: [], circles: [], circleMembers: [], transactions: [], notifications: [], auditLogs: [],
    });
  },

  switchRole: () => {
    const state = get();
    const currentUser = state.auth.currentUser;
    if (!currentUser) return;
    const newRole = state.auth.activeRole === 'Consumer' ? 'Admin' : 'Consumer';
    const targetUser = state.users.find((u) => u.id === currentUser.id && u.role === newRole);
    if (targetUser) {
      set((s) => ({ auth: { ...s.auth, currentUser: targetUser, activeRole: newRole } }));
    } else {
      const fallbackUser = state.users.find((u) => u.role === newRole);
      if (fallbackUser) {
        set((s) => ({ auth: { ...s.auth, currentUser: fallbackUser, activeRole: newRole } }));
      }
    }
  },

  /* ───── Data helpers ───── */
  computeTelemetry: (data) => {
    const d = data || get();
    const totalContributions = d.transactions.filter((tx) => tx.type === 'contribution' && tx.status === 'verified').reduce((s, tx) => s + tx.amount, 0);
    const totalPayouts = d.transactions.filter((tx) => tx.type === 'payout' && tx.status === 'verified').reduce((s, tx) => s + tx.amount, 0);
    const pendingTx = d.transactions.filter((tx) => tx.status === 'pending').length;
    const ledgerIntegrity = pendingTx === 0 ? 100 : Math.round((1 - pendingTx / Math.max(d.transactions.length, 1)) * 100);
    return {
      totalContributions, totalPayouts, ledgerIntegrity,
      activeUsers: d.users.length,
      connectionHealth: 'healthy',
      totalCircles: d.circles.length,
      totalTransactions: d.transactions.length,
      unreadNotifications: d.notifications.filter((n) => !n.read).length,
    };
  },

  updateTelemetry: () => {
    set((s) => ({ ui: { ...s.ui, telemetry: get().computeTelemetry() } }));
  },

  /* ───── Circle CRUD ───── */
  createCircle: async (circleData) => {
    const currentUser = get().auth.currentUser;
    if (!currentUser) return { success: false, error: 'Not authenticated.' };
    try {
      const circle = await fb.createCircle({
        name: circleData.name, description: circleData.description || '',
        contributionAmount: circleData.contributionAmount, frequency: circleData.frequency,
        maxMembers: circleData.maxMembers, createdBy: currentUser.id,
      });
      set((s) => ({ circles: [...s.circles, hydrate(circle)] }));
      await fb.createAuditLog({ userId: currentUser.id, action: 'CIRCLE_CREATE', entityType: 'circle', entityId: circle.id, details: { name: circle.name } });
      get().updateTelemetry();
      return { success: true, circle: hydrate(circle) };
    } catch (err) {
      return { success: false, error: err.message };
    }
  },

  joinCircle: async (circleId) => {
    const currentUser = get().auth.currentUser;
    if (!currentUser) return { success: false, error: 'Not authenticated.' };
    const circle = get().circles.find((c) => c.id === circleId);
    if (!circle) return { success: false, error: 'Circle not found.' };
    if (get().circleMembers.find((m) => m.circleId === circleId && m.userId === currentUser.id)) {
      return { success: false, error: 'Already a member.' };
    }
    const members = get().circleMembers.filter((m) => m.circleId === circleId);
    if (members.length >= circle.maxMembers) return { success: false, error: 'Circle is full.' };
    try {
      const cm = await fb.createCircleMember({ circleId, userId: currentUser.id, payoutOrder: members.length });
      set((s) => ({ circleMembers: [...s.circleMembers, hydrate(cm)] }));
      await fb.createAuditLog({ userId: currentUser.id, action: 'CIRCLE_JOIN', entityType: 'circle_member', entityId: cm.id, details: { circleId, userName: currentUser.name } });
      get().updateTelemetry();
      return { success: true, member: hydrate(cm) };
    } catch (err) {
      return { success: false, error: err.message };
    }
  },

  leaveCircle: async (circleId) => {
    const currentUser = get().auth.currentUser;
    if (!currentUser) return { success: false, error: 'Not authenticated.' };
    const member = get().circleMembers.find((m) => m.circleId === circleId && m.userId === currentUser.id);
    if (!member) return { success: false, error: 'Not a member.' };
    try {
      await fb.deleteCircleMember(member.id);
      set((s) => ({ circleMembers: s.circleMembers.filter((m) => m.id !== member.id) }));
      await fb.createAuditLog({ userId: currentUser.id, action: 'CIRCLE_LEAVE', entityType: 'circle_member', entityId: circleId, details: { circleId } });
      get().updateTelemetry();
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  },

  deleteCircle: async (circleId) => {
    const currentUser = get().auth.currentUser;
    if (!currentUser || currentUser.role !== 'Admin') return { success: false, error: 'Unauthorized.' };
    try {
      await fb.deleteCircleMembersByCircle(circleId);
      await fb.deleteCircle(circleId);
      set((s) => ({
        circles: s.circles.filter((c) => c.id !== circleId),
        circleMembers: s.circleMembers.filter((m) => m.circleId !== circleId),
      }));
      await fb.createAuditLog({ userId: currentUser.id, action: 'CIRCLE_DELETE', entityType: 'circle', entityId: circleId, details: {} });
      get().updateTelemetry();
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  },

  /* ───── Transaction ───── */
  recordContribution: async (circleId) => {
    const currentUser = get().auth.currentUser;
    if (!currentUser) return { success: false, error: 'Not authenticated.' };
    const circle = get().circles.find((c) => c.id === circleId);
    if (!circle) return { success: false, error: 'Circle not found.' };
    const member = get().circleMembers.find((m) => m.circleId === circleId && m.userId === currentUser.id);
    if (!member) return { success: false, error: 'Not a member of this circle.' };
    try {
      const tx = await fb.createTransaction({
        circleId, memberId: member.id, userId: currentUser.id, type: 'contribution',
        amount: circle.contributionAmount, reference: `REF-${circleId.slice(-4)}-${Date.now()}`,
        status: 'verified', verifiedBy: currentUser.id,
        metadata: { cycleIndex: circle.currentCycleIndex },
      });
      set((s) => ({ transactions: [...s.transactions, hydrate(tx)] }));
      await fb.createAuditLog({ userId: currentUser.id, action: 'CONTRIBUTION_RECORD', entityType: 'transaction', entityId: tx.id, details: { amount: tx.amount, circleId } });
      await get().evaluateCyclePayout(circleId);
      get().updateTelemetry();
      return { success: true, transaction: hydrate(tx) };
    } catch (err) {
      return { success: false, error: err.message };
    }
  },

  evaluateCyclePayout: async (circleId) => {
    const state = get();
    const circle = state.circles.find((c) => c.id === circleId);
    if (!circle || circle.status !== 'active') return;
    const members = state.circleMembers.filter((m) => m.circleId === circleId).sort((a, b) => a.payoutOrder - b.payoutOrder);
    if (members.length === 0) return;
    const currentContributions = state.transactions.filter(
      (tx) => tx.circleId === circleId && tx.type === 'contribution' && tx.metadata?.cycleIndex === circle.currentCycleIndex && tx.status === 'verified'
    );
    const contributedUserIds = [...new Set(currentContributions.map((tx) => tx.userId))];
    const allPaid = members.every((m) => contributedUserIds.includes(m.userId));
    if (!allPaid) return;
    const recipientMember = members[0];
    if (!recipientMember) return;
    const totalPool = currentContributions.reduce((s, tx) => s + tx.amount, 0);
    if (totalPool <= 0) return;
    try {
      const payoutTx = await fb.createTransaction({
        circleId, memberId: recipientMember.id, userId: recipientMember.userId, type: 'payout',
        amount: totalPool, reference: `PAY-${circleId.slice(-4)}-${Date.now()}`,
        status: 'verified', verifiedBy: null,
        metadata: { cycleIndex: circle.currentCycleIndex, recipient: recipientMember.userId },
      });
      const updatedMembers = members.map((m, i) => ({ ...m, payoutOrder: (i - 1 + members.length) % members.length }));
      await Promise.all(updatedMembers.map((m) => fb.updateCircleMember(m.id, { payoutOrder: m.payoutOrder })));
      await fb.updateCircle(circleId, { currentCycleIndex: circle.currentCycleIndex + 1 });
      await fb.createNotification({
        userId: recipientMember.userId, type: 'payout', title: 'Payout Received!',
        message: `You received ${totalPool.toLocaleString()} from ${circle.name}.`, read: false,
      });
      await fb.createAuditLog({ userId: recipientMember.userId, action: 'PAYOUT_PROCESSED', entityType: 'transaction', entityId: payoutTx.id, details: { amount: totalPool, circleId, cycleIndex: circle.currentCycleIndex } });
      await fb.createAuditLog({ userId: recipientMember.userId, action: 'CYCLE_ADVANCE', entityType: 'circle', entityId: circleId, details: { fromIndex: circle.currentCycleIndex, toIndex: circle.currentCycleIndex + 1 } });
      await get().loadAllData();
    } catch (err) {
      console.error('evaluateCyclePayout error:', err);
    }
  },

  recordAdminPayout: async (circleId, memberUserId, amount) => {
    const currentUser = get().auth.currentUser;
    if (!currentUser || currentUser.role !== 'Admin') return { success: false, error: 'Unauthorized.' };
    const member = get().circleMembers.find((m) => m.circleId === circleId && m.userId === memberUserId);
    if (!member) return { success: false, error: 'Member not found.' };
    const circle = get().circles.find((c) => c.id === circleId);
    try {
      const tx = await fb.createTransaction({
        circleId, memberId: member.id, userId: memberUserId, type: 'payout',
        amount, reference: `ADM-PAY-${Date.now()}`, status: 'verified', verifiedBy: currentUser.id,
        metadata: { cycleIndex: circle?.currentCycleIndex ?? -1, recipient: memberUserId, adminOverride: true },
      });
      set((s) => ({ transactions: [...s.transactions, hydrate(tx)] }));
      await fb.createAuditLog({ userId: currentUser.id, action: 'ADMIN_PAYOUT_OVERRIDE', entityType: 'transaction', entityId: tx.id, details: { amount, circleId, targetUser: memberUserId } });
      get().updateTelemetry();
      return { success: true, transaction: hydrate(tx) };
    } catch (err) {
      return { success: false, error: err.message };
    }
  },

  verifyTransaction: async (txId) => {
    const currentUser = get().auth.currentUser;
    if (!currentUser || currentUser.role !== 'Admin') return { success: false, error: 'Unauthorized.' };
    try {
      await fb.updateTransaction(txId, { status: 'verified', verifiedBy: currentUser.id });
      set((s) => ({
        transactions: s.transactions.map((tx) => (tx.id === txId ? { ...tx, status: 'verified', verifiedBy: currentUser.id } : tx)),
      }));
      await fb.createAuditLog({ userId: currentUser.id, action: 'TRANSACTION_VERIFY', entityType: 'transaction', entityId: txId, details: {} });
      get().updateTelemetry();
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  },

  /* ───── Notifications ───── */
  sendSystemNotification: async (title, message, targetUserId) => {
    const currentUser = get().auth.currentUser;
    if (!currentUser || currentUser.role !== 'Admin') return { success: false, error: 'Unauthorized.' };
    try {
      const notif = await fb.createNotification({ userId: targetUserId || null, type: 'system', title, message, read: false });
      set((s) => ({ notifications: [...s.notifications, hydrate(notif)] }));
      return { success: true, notification: hydrate(notif) };
    } catch (err) {
      return { success: false, error: err.message };
    }
  },

  markNotificationRead: async (notificationId) => {
    await fb.updateNotification(notificationId, { read: true });
    set((s) => ({
      notifications: s.notifications.map((n) => (n.id === notificationId ? { ...n, read: true } : n)),
    }));
  },

  markAllNotificationsRead: async (userId) => {
    const notifs = get().notifications.filter((n) => n.userId === userId && !n.read);
    await Promise.all(notifs.map((n) => fb.updateNotification(n.id, { read: true })));
    set((s) => ({
      notifications: s.notifications.map((n) => (n.userId === userId ? { ...n, read: true } : n)),
    }));
  },

  /* ───── Computed selectors ───── */
  getCirclesForUser: (userId) => {
    const state = get();
    const memberships = state.circleMembers.filter((m) => m.userId === userId);
    return state.circles.filter((c) => memberships.some((m) => m.circleId === c.id));
  },

  getTransactionsForCircle: (circleId) => get().transactions.filter((tx) => tx.circleId === circleId),
  getTransactionsForUser: (userId) => get().transactions.filter((tx) => tx.userId === userId),
  getCircleContributionTotal: (circleId) => get().transactions.filter((tx) => tx.circleId === circleId && tx.type === 'contribution' && tx.status === 'verified').reduce((s, tx) => s + tx.amount, 0),
  getCirclePayoutTotal: (circleId) => get().transactions.filter((tx) => tx.circleId === circleId && tx.type === 'payout' && tx.status === 'verified').reduce((s, tx) => s + tx.amount, 0),
  getCircleBalance: (circleId) => get().getCircleContributionTotal(circleId) - get().getCirclePayoutTotal(circleId),

  getMemberPaidStatusForCycle: (circleId, cycleIndex) => {
    const state = get();
    const members = state.circleMembers.filter((m) => m.circleId === circleId);
    const contributions = state.transactions.filter((tx) => tx.circleId === circleId && tx.type === 'contribution' && tx.metadata?.cycleIndex === cycleIndex && tx.status === 'verified');
    const paidUserIds = new Set(contributions.map((tx) => tx.userId));
    return members.map((m) => ({ member: m, user: state.users.find((u) => u.id === m.userId), hasPaid: paidUserIds.has(m.userId) }));
  },

  getTelemetryData: () => get().computeTelemetry(),

  /* ───── UI actions ───── */
  setSnackbar: (open, message, severity) => {
    set((state) => ({ ui: { ...state.ui, snackbar: { open, message, severity: severity || 'info' } } }));
  },
  setDialog: (dialog, data) => {
    set((state) => ({ ui: { ...state.ui, activeDialog: dialog, dialogData: data || null } }));
  },
  setGlobalLoading: (loading) => {
    set((state) => ({ ui: { ...state.ui, globalLoading: loading } }));
  },
  resetError: () => {
    set((state) => ({ auth: { ...state.auth, error: null } }));
  },
}));

export default useAppStore;
