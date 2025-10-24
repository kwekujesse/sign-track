// This file acts as a simple in-memory database.
// In a real application, you would replace this with a proper database like Firestore.
// The data is not persistent and will be reset on server restarts.

import { type Order } from "@/lib/types";

let orders: Order[] = [
  {
    id: "1",
    orderNumber: "ORD-001",
    customerName: "John Doe",
    binNumber: "A1",
    status: "Awaiting Pickup",
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "2",
    orderNumber: "ORD-002",
    customerName: "Jane Smith",
    binNumber: "B3",
    status: "Awaiting Pickup",
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "3",
    orderNumber: "ORD-003",
    customerName: "Peter Jones",
    binNumber: "C2",
    status: "Picked Up",
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    pickedUpAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    signature: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=", // Placeholder signature
  },
  {
    id: "4",
    orderNumber: "ORD-004",
    customerName: "John Appleseed",
    binNumber: "A5",
    status: "Awaiting Pickup",
    createdAt: new Date().toISOString(),
  },
];

export const getOrders = async (): Promise<Order[]> => {
  return orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

export const getOrderById = async (id: string): Promise<Order | undefined> => {
  return orders.find((order) => order.id === id);
};

export const findOrdersByName = async (name: string): Promise<Order[]> => {
  if (!name) return [];
  return orders.filter(
    (order) =>
      order.customerName.toLowerCase().includes(name.toLowerCase())
  );
};

export const addOrder = async (data: {
  orderNumber: string;
  customerName: string;
  binNumber: string;
}): Promise<Order> => {
  const newOrder: Order = {
    id: (orders.length + 1).toString(),
    ...data,
    status: "Awaiting Pickup",
    createdAt: new Date().toISOString(),
  };
  orders.push(newOrder);
  return newOrder;
};

export const addSignatureToOrder = async (
  id: string,
  signature: string
): Promise<Order | undefined> => {
  const orderIndex = orders.findIndex((order) => order.id === id);
  if (orderIndex !== -1) {
    orders[orderIndex] = {
      ...orders[orderIndex],
      status: "Picked Up",
      signature: signature,
      pickedUpAt: new Date().toISOString(),
    };
    return orders[orderIndex];
  }
  return undefined;
};
