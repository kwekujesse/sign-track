export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  binNumber: string;
  status: "Awaiting Pickup" | "Picked Up";
  createdAt: string;
  pickedUpAt?: string;
  signature?: string; // base64 data URL
}
