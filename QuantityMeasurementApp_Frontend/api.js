const BASE_URL = "http://localhost:5263/api";

function getToken() {
  return localStorage.getItem("token");
}

async function apiCall(url, method, data) {
  const res = await fetch(BASE_URL + url, {
    method: method,
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + getToken()
    },
    body: data ? JSON.stringify(data) : null
  });

  return res.json();
}