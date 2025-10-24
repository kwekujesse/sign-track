
"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { addOrder, findOrdersByName, addSignatureToOrder as dbAddSignature } from "@/lib/data";

const orderSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  orderNumber: z.string().min(1, "Order number is required"),
  binNumber: z.string().min(1, "Bin number is required"),
});

export async function createOrder(prevState: any, formData: FormData) {
  const validatedFields = orderSchema.safeParse({
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    orderNumber: formData.get("orderNumber"),
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
    return { message: "Order created successfully." };
  } catch (e: any) {
    // This is a server action, so we can't use the client-side error emitter.
    // We return the error message to be displayed in the UI.
    return { message: e.message || "Failed to create order." };
  }
}

export async function searchOrders(prevState: any, formData: FormData) {
  const name = formData.get("customerName") as string;
  if (!name || name.length < 2) {
    return { orders: [], message: "Please enter at least 2 characters." };
  }
  try {
    const orders = await findOrdersByName(name.toLowerCase());
    const pendingOrders = orders.filter(order => order.status === "Awaiting Pickup");

    if (pendingOrders.length === 0) {
      return { orders: [], message: "No pending orders found for this name. Please see an associate for help" };
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
        // Revalidation is handled by real-time listeners, but we can still revalidate server-rendered pages if needed
    } catch (error: any) {
        console.error("Failed to add signature:", error);
        // Re-throw with a more specific message if possible, or just re-throw.
        throw new Error(error.message || "Failed to save signature.");
    }
}
