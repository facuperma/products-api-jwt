import { collection, doc, getDocs, getDoc, addDoc, setDoc, updateDoc, deleteDoc, query, where } from "firebase/firestore";
import { db } from "../data/firebase.data.js";

export async function readDocuments(collectionName) {
  const colRef = collection(db, collectionName);
  const snapshot = await getDocs(colRef);
  
  return snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }));
}

export async function readDocument(collectionName, id) {
  const docRef = doc(db, collectionName, id);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    return null;
  }

  return { id: docSnap.id, ...docSnap.data() };
}

export async function createDocument(collectionName, data) {
  const id = data.id;

  if (id) {
    const docRef = doc(db, collectionName, id);
    const docSnap = await getDoc(docRef);
    const existed = docSnap.exists();

    await setDoc(docRef, data);
    console.log(`Producto ${existed ? "sobreescrito" : "creado"} correctamente en ${collectionName} con id: ${id}`);

    return { id, overwritten: existed };
  }

  const colRef = collection(db, collectionName);
  const docRef = await addDoc(colRef, data);
  console.log(`Producto creado correctamente en ${collectionName} con id: ${docRef.id}`);
  return { id: docRef.id, overwritten: false };
}

export async function setDocument(collectionName, id, data) {
  const docRef = doc(db, collectionName, id);
  await setDoc(docRef, data);
}

export async function updateDocument(collectionName, id, data) {
  const docRef = doc(db, collectionName, id);
  
  return await updateDoc(docRef, data);
}

export async function deleteDocument(collectionName, id) {
  const docRef = doc(db, collectionName, id);
  console.log(`Intentando eliminar documento: ${collectionName}/${id}`);

  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) {
    console.log(`Documento no encontrado: ${collectionName}/${id}`);
    return false;
  }

  await deleteDoc(docRef);
  console.log(`Documento eliminado correctamente: ${collectionName}/${id}`);
  return true;
}

export async function queryDocumentsByStatus(collectionName) {
  const colRef = collection(db, collectionName);
  const q = query(colRef, where("status", "==", "activo"));
  const snapshot = await getDocs(q);
  
  return snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }));
}