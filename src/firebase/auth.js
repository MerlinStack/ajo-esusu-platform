import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as fbSignOut,
  onAuthStateChanged,
  sendEmailVerification,
} from 'firebase/auth';
import { auth } from './config';

export const signIn = (email, password) =>
  signInWithEmailAndPassword(auth, email, password);

export const signUp = (email, password) =>
  createUserWithEmailAndPassword(auth, email, password);

export const signOut = () => fbSignOut(auth);

export const initAuthListener = (callback) =>
  onAuthStateChanged(auth, callback);

export const getCurrentUser = () => auth.currentUser;

export const sendVerificationEmail = async () => {
  const user = auth.currentUser;
  if (!user) return;
  await sendEmailVerification(user);
};

export const reloadUser = async () => {
  const user = auth.currentUser;
  if (!user) return;
  await user.reload();
  return user;
};
