export const setToken = (token: string, role: string) => {
  if (typeof window !== "undefined") {
    localStorage.setItem("annapurna_token", token);
    localStorage.setItem("annapurna_role", role);
  }
};

export const getToken = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("annapurna_token");
  }
  return null;
};

export const getRole = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("annapurna_role");
  }
  return null;
};

export const clearToken = () => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("annapurna_token");
    localStorage.removeItem("annapurna_role");
  }
};
