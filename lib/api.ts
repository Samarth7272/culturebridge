export const API =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "") ||
  "http://localhost:5000/api";

// Common API request handler
async function apiRequest(path: string, options: RequestInit = {}) {
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("token")
      : null;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 20000);

  try {
    const res = await fetch(`${API}${path}`, {
      ...options,
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new Error(
        data.message || `Request failed with status ${res.status}`
      );
    }

    return data;
  } catch (error: any) {
    if (error.name === "AbortError") {
      throw new Error(
        "Request timed out. Check whether the backend is running."
      );
    }

    if (error instanceof TypeError) {
      throw new Error(
        "Cannot connect to the backend. Check the API URL."
      );
    }

    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

// General POST request
export async function post(path: string, body: object) {
  return apiRequest(path, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

// =====================================
// WORKSHOP APIs
// =====================================

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

export async function saveAttendance(
  id: string,
  attendance: string[]
) {
  return apiRequest(`/workshops/${id}/attendance`, {
    method: "PATCH",
    body: JSON.stringify({ attendance }),
  });
}

export async function deleteWorkshop(id: string) {
  return apiRequest(`/workshops/${id}`, {
    method: "DELETE",
  });
}

// Employee enrollment
export async function enrollWorkshop(id: string) {
  return apiRequest(`/workshops/${id}/enroll`, {
    method: "POST",
  });
}

// Employee leaves workshop
export async function leaveWorkshop(id: string) {
  return apiRequest(`/workshops/${id}/enroll`, {
    method: "DELETE",
  });
}

// =====================================
// ORGANISATION APIs
// =====================================

export type Organisation = {
  _id: string;
  name: string;
  industry: string;
  email: string;
  contactPerson: string;
  phone: string;
  status: "Active" | "Inactive";
  createdAt?: string;
};

// Get all organisations
export async function getOrganisations(): Promise<Organisation[]> {
  return apiRequest("/organisations");
}

// Add organisation
export async function addOrganisation(
  data: Partial<Organisation>
) {
  return apiRequest("/organisations", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// Update organisation
export async function updateOrganisation(
  id: string,
  data: Partial<Organisation>
) {
  return apiRequest(`/organisations/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

// Delete organisation
export async function deleteOrganisation(id: string) {
  return apiRequest(`/organisations/${id}`, {
    method: "DELETE",
  });
}
export type ManagedUser = {
  _id: string;
  name: string;
  email: string;
  role: "learner" | "facilitator" | "admin";
  status: "Active" | "Inactive";
  organisation:
    | string
    | {
        _id: string;
        name: string;
        industry?: string;
      }
    | null;
};

export async function getUsers(): Promise<ManagedUser[]> {
  return apiRequest("/users");
}

export async function addUser(data: {
  name: string;
  email: string;
  password: string;
  role: "learner" | "facilitator";
  organisation?: string | null;
}) {
  return apiRequest("/users", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateUser(
  id: string,
  data: Partial<ManagedUser>
) {
  return apiRequest(`/users/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function deleteUser(id: string) {
  return apiRequest(`/users/${id}`, {
    method: "DELETE",
  });
}
// Fetch one programme/workshop by ID.
export async function getWorkshop(id: string) {
  return apiRequest(`/workshops/${id}`);
}