const API =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

async function apiRequest(path: string, options: RequestInit = {}) {
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("token")
      : null;

  const res = await fetch(`${API}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message || "Something went wrong");
  }

  return data;
}

export async function post(path: string, body: object) {
  return apiRequest(path, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function getWorkshops() {
  return apiRequest("/workshops");
}

export async function addWorkshop(w: object) {
  return apiRequest("/workshops", {
    method: "POST",
    body: JSON.stringify(w),
  });
}

export async function updateWorkshop(id: string, body: object) {
  return apiRequest(`/workshops/${id}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

export async function deleteWorkshop(id: string) {
  await apiRequest(`/workshops/${id}`, {
    method: "DELETE",
  });
}