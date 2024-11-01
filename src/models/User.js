import { db } from '../config/firebase.js';

const usersRef = db.collection('users');

export const UserModel = {
  async create(userData) {
    const docRef = await usersRef.add({
      ...userData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    return { id: docRef.id, ...userData };
  },

  async findById(id) {
    const doc = await usersRef.doc(id).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() };
  },

  async findAll() {
    const snapshot = await usersRef.get();
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  },

  async update(id, userData) {
    await usersRef.doc(id).update({
      ...userData,
      updatedAt: new Date().toISOString()
    });
    return { id, ...userData };
  },

  async delete(id) {
    await usersRef.doc(id).delete();
    return { id };
  }
};