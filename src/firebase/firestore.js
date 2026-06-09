import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
} from 'firebase/firestore';
import { db } from './config';

const ts = () => new Date().toISOString();

const COLLECTIONS = {
  users: 'users',
  circles: 'circles',
  circleMembers: 'circleMembers',
  transactions: 'transactions',
  notifications: 'notifications',
  auditLogs: 'auditLogs',
};

/* ───── Users ───── */

export const createUserDoc = async (uid, data) => {
  const ref = doc(db, COLLECTIONS.users, uid);
  const docData = { ...data, createdAt: data.createdAt || ts(), updatedAt: ts() };
  await setDoc(ref, docData);
  return { id: uid, ...docData };
};

export const getUserDoc = async (uid) => {
  const snap = await getDoc(doc(db, COLLECTIONS.users, uid));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
};

export const updateUserDoc = async (uid, data) =>
  updateDoc(doc(db, COLLECTIONS.users, uid), { ...data, updatedAt: ts() });

export const getAllUsers = async () => {
  const snap = await getDocs(collection(db, COLLECTIONS.users));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

/* ───── Circles ───── */

export const createCircle = async (data) => {
  const docData = {
    ...data, status: 'active', currentCycleIndex: 0,
    createdAt: data.createdAt || ts(), updatedAt: ts(),
  };
  const ref = await addDoc(collection(db, COLLECTIONS.circles), docData);
  return { id: ref.id, ...docData };
};

export const getAllCircles = async () => {
  const snap = await getDocs(collection(db, COLLECTIONS.circles));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const getCircleDoc = async (id) => {
  const snap = await getDoc(doc(db, COLLECTIONS.circles, id));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
};

export const updateCircle = async (id, data) =>
  updateDoc(doc(db, COLLECTIONS.circles, id), { ...data, updatedAt: ts() });

export const deleteCircle = async (id) =>
  deleteDoc(doc(db, COLLECTIONS.circles, id));

/* ───── Circle Members ───── */

export const createCircleMember = async (data) => {
  const docData = { ...data, joinedAt: data.joinedAt || ts() };
  const ref = await addDoc(collection(db, COLLECTIONS.circleMembers), docData);
  return { id: ref.id, ...docData };
};

export const getCircleMembers = async (circleId) => {
  const q = query(collection(db, COLLECTIONS.circleMembers), where('circleId', '==', circleId));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const getAllCircleMembers = async () => {
  const snap = await getDocs(collection(db, COLLECTIONS.circleMembers));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const deleteCircleMember = async (id) =>
  deleteDoc(doc(db, COLLECTIONS.circleMembers, id));

export const updateCircleMember = async (id, data) =>
  updateDoc(doc(db, COLLECTIONS.circleMembers, id), data);

export const deleteCircleMembersByCircle = async (circleId) => {
  const members = await getCircleMembers(circleId);
  await Promise.all(members.map((m) => deleteCircleMember(m.id)));
};

/* ───── Transactions ───── */

export const createTransaction = async (data) => {
  const docData = { ...data, timestamp: data.timestamp || ts() };
  const ref = await addDoc(collection(db, COLLECTIONS.transactions), docData);
  return { id: ref.id, ...docData };
};

export const getAllTransactions = async () => {
  const snap = await getDocs(collection(db, COLLECTIONS.transactions));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const getTransactionsForCircle = async (circleId) => {
  const q = query(collection(db, COLLECTIONS.transactions), where('circleId', '==', circleId));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const updateTransaction = async (id, data) =>
  updateDoc(doc(db, COLLECTIONS.transactions, id), data);

/* ───── Notifications ───── */

export const createNotification = async (data) => {
  const docData = { ...data, createdAt: data.createdAt || ts() };
  const ref = await addDoc(collection(db, COLLECTIONS.notifications), docData);
  return { id: ref.id, ...docData };
};

export const getNotificationsForUser = async (userId) => {
  const q = query(collection(db, COLLECTIONS.notifications), where('userId', '==', userId), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const getAllNotifications = async () => {
  const snap = await getDocs(collection(db, COLLECTIONS.notifications));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const updateNotification = async (id, data) =>
  updateDoc(doc(db, COLLECTIONS.notifications, id), data);

/* ───── Audit Logs ───── */

export const createAuditLog = async (data) => {
  const docData = { ...data, createdAt: data.createdAt || ts() };
  const ref = await addDoc(collection(db, COLLECTIONS.auditLogs), docData);
  return { id: ref.id, ...docData };
};

export const getAllAuditLogs = async () => {
  const snap = await getDocs(query(collection(db, COLLECTIONS.auditLogs), orderBy('createdAt', 'desc')));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};
