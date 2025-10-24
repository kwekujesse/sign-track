export interface Order {
  id: string;
  orderNumber: string;
  firstName: string;
  lastName: string;
  customerName: string; // Combined for search and display
  binNumber: string;
  status: "Awaiting Pickup" | "Picked Up";
  createdAt: string;
  pickedUpAt?: string;
  signature?: string; // base64 data URL
}
