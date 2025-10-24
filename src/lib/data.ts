
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
  or,
} from 'firebase/firestore';
import { initializeFirebase } from '@/firebase/server';
import { type Order } from '@/lib/types';

// This function is for server-side rendering and server actions.
function getDb() {
  const { firestore } = initializeFirebase();
  return firestore;
}

const toOrder = (doc: firebase.firestore.QueryDocumentSnapshot | firebase.firestore.DocumentSnapshot): Order => {
  const data = doc.data()!;
  return {
    id: doc.id,
    ...data,
    customerName: data.customerName || `${data.firstName} ${data.lastName}`,
    createdAt: (data.createdAt as Timestamp).toDate().toISOString(),
    pickedUpAt: data.pickedUpAt ? (data.pickedUpAt as Timestamp).toDate().toISOString() : undefined,
  } as Order;
}

export const getOrders = async (): Promise<Order[]> => {
  const db = getDb();
  const ordersCol = collection(db, 'orders');
  const q = query(ordersCol, orderBy('createdAt', 'desc'));
  const orderSnapshot = await getDocs(q);
  const orderList = orderSnapshot.docs.map(toOrder);
  return orderList;
};

export const getOrderById = async (id: string): Promise<Order | undefined> => {
  if (!id) return undefined;
  const db = getDb();
  const orderRef = doc(db, 'orders', id);
  const orderSnap = await getDoc(orderRef);
  if (orderSnap.exists()) {
    return toOrder(orderSnap);
  }
  return undefined;
};

export const findOrdersByName = async (name: string): Promise<Order[]> => {
  if (!name) return [];
  const db = getDb();
  const ordersCol = collection(db, 'orders');

  const nameLower = name.toLowerCase();
  
  // Create queries for first name and last name
  const q = query(ordersCol, 
    or(
      where('firstName', '>=', name), where('firstName', '<=', name + '\uf8ff'),
      where('lastName', '>=', name), where('lastName', '<=', name + '\uf8ff'),
      where('customerName', '>=', name), where('customerName', '<=', name + '\uf8ff')
    )
  );

  const orderSnapshot = await getDocs(q);
  const orderList = orderSnapshot.docs.map(toOrder);
  
  // Client-side filter for case-insensitivity as Firestore is case-sensitive
  return orderList.filter(order => 
       order.firstName.toLowerCase().includes(nameLower) 
    || order.lastName.toLowerCase().includes(nameLower)
    || order.customerName.toLowerCase().includes(nameLower)
  );
};

export const addOrder = async (data: {
  orderNumber: string;
  firstName: string;
  lastName: string;
  binNumber: string;
}): Promise<Order> => {
  const db = getDb();
  const newOrderData = {
    ...data,
    customerName: `${data.firstName} ${data.lastName}`,
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
    
    return toOrder(updatedDoc);
  }
  return undefined;
};
