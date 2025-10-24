
"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { addOrder, findOrdersByName, addSignatureToOrder as dbAddSignature } from "@/lib/data";

const orderSchema = z.object({
  orderNumber: z.string().min(1, "Order number is required"),
  customerName: z.string().min(1, "Customer name is required"),
  binNumber: z.string().min(1, "Bin number is required"),
});

export async function createOrder(prevState: any, formData: FormData) {
  const validatedFields = orderSchema.safeParse({
    orderNumber: formData.get("orderNumber"),
    customerName: formData.get("customerName"),
    binNumber: formData.get("binNumber"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Validation Error.",
    };
  }
  
  try {
    await addOrder(validatedFields.data);
    // Revalidation is handled by the real-time listener on the dashboard
    // revalidatePath("/associate"); 
    return { message: "Order created successfully." };
  } catch (e) {
    return { message: "Failed to create order." };
  }
}

export async function searchOrders(prevState: any, formData: FormData) {
  const name = formData.get("customerName") as string;
  if (!name || name.length < 2) {
    return { orders: [], message: "Please enter at least 2 characters." };
  }
  try {
    const orders = await findOrdersByName(name);
    const pendingOrders = orders.filter(order => order.status === "Awaiting Pickup");

    if (pendingOrders.length === 0) {
      return { orders: [], message: "No pending orders found for this name." };
    }
    return { orders: pendingOrders, message: "" };
  } catch (e) {
    return { orders: [], message: "An error occurred while searching." };
  }
}

export async function addSignature(orderId: string, signature: string) {
    "use server"
    if (!orderId || !signature) {
        throw new Error("Order ID and signature are required.");
    }

    try {
        await dbAddSignature(orderId, signature);
        // Revalidation is handled by real-time listeners
        // revalidatePath(`/order/${orderId}`);
        // revalidatePath('/associate');
        // revalidatePath('/');
    } catch (error) {
        console.error("Failed to add signature:", error);
        throw new Error("Failed to save signature.");
    }
}
