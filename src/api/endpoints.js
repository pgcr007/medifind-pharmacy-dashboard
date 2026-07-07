import client from "./client";

// --- Auth ---
export async function login(email, password) {
  const { data } = await client.post("/auth/login", { email, password });
  return data; // { token, user: { id, name, email, role } }
}

// --- Pharmacy ---
export async function getMyPharmacy() {
  const { data } = await client.get("/pharmacies/mine");
  return data;
}

export async function createPharmacy(details) {
  const { data } = await client.post("/pharmacies", details);
  return data;
}

export async function updatePharmacy(pharmacyId, updates) {
  const { data } = await client.put(`/pharmacies/${pharmacyId}`, updates);
  return data;
}

// --- Inventory ---
export async function getInventory(pharmacyId) {
  const { data } = await client.get(`/inventory/${pharmacyId}`);
  return data;
}

export async function upsertInventoryItem(pharmacyId, { medicineId, stockQty, price }) {
  const { data } = await client.put(`/inventory/${pharmacyId}`, {
    medicineId,
    stockQty,
    price,
  });
  return data;
}

export async function deleteInventoryItem(pharmacyId, medicineId) {
  const { data } = await client.delete(`/inventory/${pharmacyId}/${medicineId}`);
  return data;
}

// --- Medicines (for adding new inventory items) ---
// ASSUMPTION: GET /medicines?name= per your documented convention
// ("Medicine search uses ?name= query param, not ?query="). Confirm/adjust if wrong.
export async function searchMedicines(name) {
  const { data } = await client.get("/medicines/search", { params: { name } });
  return data;
}

// --- Reservations ---
export async function getPharmacyReservations(pharmacyId) {
  const { data } = await client.get(`/reservations/pharmacy/${pharmacyId}`);
  return data;
}

export async function updateReservationStatus(reservationId, status) {
  const { data } = await client.put(`/reservations/${reservationId}/status`, { status });
  return data;
}

// --- Reviews ---
export async function getPharmacyReviews(pharmacyId) {
  const { data } = await client.get(`/reviews/pharmacy/${pharmacyId}`);
  return data;
}

export async function replyToReview(reviewId, text) {
  const { data } = await client.put(`/reviews/${reviewId}/reply`, { text });
  return data;
}

// --- Bulk inventory upload ---
export async function bulkUpsertInventory(pharmacyId, items) {
  const { data } = await client.post(`/inventory/${pharmacyId}/bulk`, { items });
  return data;
}