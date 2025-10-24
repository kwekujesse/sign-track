import { Timestamp } from "firebase/firestore";

export interface Order {
  id: string;
  orderNumber: string;
  firstName: string;
  lastName: string;
  customerName: string; // Combined for search and display
  binNumber: string;
  status: "Awaiting Pickup" | "Picked Up";
  createdAt: Timestamp | Date | string;
  pickedUpAt?: Timestamp | Date | string;
  signature?: string; // base64 data URL

  // Fields for case-insensitive search
  firstName_lowercase?: string;
  lastName_lowercase?: string;
  customerName_lowercase?: string;
}
