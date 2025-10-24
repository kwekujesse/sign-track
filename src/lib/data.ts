'use server';

import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  query,
  where,
  orderBy,
  Timestamp,
} from 'firebase/firestore';
import { getSdks } from '@/firebase';
import { type Order } from '@/lib/types';

// This function is for server-side rendering and server actions.
// It initializes a server-side admin instance of Firebase.
function getDb() {
  const { firestore } = getSdks();
  return firestore;
}

export const getOrders = async (): Promise<Order[]> => {
  const db = getDb();
  const ordersCol = collection(db, 'orders');
  const q = query(ordersCol, orderBy('createdAt', 'desc'));
  const orderSnapshot = await getDocs(q);
  const orderList = orderSnapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      createdAt: (data.createdAt as Timestamp).toDate().toISOString(),
      pickedUpAt: data.pickedUpAt ? (data.pickedUpAt as Timestamp).toDate().toISOString() : undefined,
    } as Order;
  });
  return orderList;
};

export const getOrderById = async (id: string): Promise<Order | undefined> => {
  if (!id) return undefined;
  const db = getDb();
  const orderRef = doc(db, 'orders', id);
  const orderSnap = await getDoc(orderRef);
  if (orderSnap.exists()) {
    const data = orderSnap.data();
    return {
      id: orderSnap.id,
      ...data,
      createdAt: (data.createdAt as Timestamp).toDate().toISOString(),
      pickedUpAt: data.pickedUpAt ? (data.pickedUpAt as Timestamp).toDate().toISOString() : undefined,
    } as Order;
  }
  return undefined;
};

export const findOrdersByName = async (name: string): Promise<Order[]> => {
  if (!name) return [];
  const db = getDb();
  const ordersCol = collection(db, 'orders');
  // Firestore doesn't support case-insensitive search natively.
  // A common workaround is to store a lowercased version of the field.
  // For this simple case, we'll fetch and filter, but this is not efficient for large datasets.
  const q = query(ordersCol, where('customerName', '>=', name), where('customerName', '<=', name + '\uf8ff'));
  
  const orderSnapshot = await getDocs(q);
   const orderList = orderSnapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      createdAt: (data.createdAt as Timestamp).toDate().toISOString(),
      pickedUpAt: data.pickedUpAt ? (data.pickedUpAt as Timestamp).toDate().toISOString() : undefined,
    } as Order;
  });

  return orderList.filter(order => order.customerName.toLowerCase().includes(name.toLowerCase()));
};

export const addOrder = async (data: {
  orderNumber: string;
  customerName: string;
  binNumber: string;
}): Promise<Order> => {
  const db = getDb();
  const newOrderData = {
    ...data,
    status: 'Awaiting Pickup',
    createdAt: Timestamp.now(),
  };
  const docRef = await addDoc(collection(db, 'orders'), newOrderData);

  return {
    id: docRef.id,
    ...newOrderData,
    createdAt: newOrderData.createdAt.toDate().toISOString(),
  };
};

export const addSignatureToOrder = async (
  id: string,
  signature: string
): Promise<Order | undefined> => {
  const db = getDb();
  const orderRef = doc(db, 'orders', id);
  const orderSnap = await getDoc(orderRef);

  if (orderSnap.exists()) {
    await updateDoc(orderRef, {
      status: 'Picked Up',
      signature: signature,
      pickedUpAt: Timestamp.now(),
    });
    const updatedDoc = await getDoc(orderRef);
    const data = updatedDoc.data();
    if (!data) return undefined;
    
    return {
        id: updatedDoc.id,
        ...data,
        createdAt: (data.createdAt as Timestamp).toDate().toISOString(),
        pickedUpAt: (data.pickedUpAt as Timestamp).toDate().toISOString(),
    } as Order;
  }
  return undefined;
};
