const DASH_URL = "/dash";

const popupBackdrop = document.getElementById("popup-backdrop");
const popupTitle = document.getElementById("popup-title");
const popupMessage = document.getElementById("popup-message");
const popupButton = document.getElementById("popup-button");

function showPopup(title, message) {
  popupTitle.textContent = title;
  popupMessage.textContent = message;
  popupBackdrop.classList.remove("hidden");
}

popupButton.addEventListener("click", () => {
  window.location.replace(DASH_URL);
});

function redirectDash() {
  window.location.replace(DASH_URL);
}

function parseRequest() {
  const url = new URL(window.location.href);
  
  // Case: ?id=123
  if (url.searchParams.has("id")) {
    return {
      id: url.searchParams.get("id"),
      path: ""
    };
  }
  
  // Case: ?123/path/...
  if (url.search.startsWith("?")) {
    const raw = url.search.slice(1); // remove ?
    const parts = raw.split("/");
    return {
      id: parts[0],
      path: parts.slice(1).join("/")
    };
  }
  
  return null;
}

async function resolveUser(id, path) {
  try {
    const res = await fetch(`https://api.github.com/user/${id}`);
    
    if (res.status === 200) {
      const data = await res.json();
      const username = data.login;
      
      const target =
        path && path.length > 0 ?
        `https://github.com/${username}/${path}` :
        `https://github.com/${username}`;
      
      window.location.replace(target);
      return;
    }
    
    if (res.status === 404) {
      showPopup(
        "User not found",
        "GitHub user with this ID does not exist."
      );
      return;
    }
    
    if (res.status === 403 || res.status === 429) {
      showPopup(
        "Rate limited",
        "GitHub API rate limit exceeded on your IP. Please try again later."
      );
      return;
    }
    
    showPopup(
      "GitHub error",
      `GitHub API returned status ${res.status}.`
    );
    
  } catch (err) {
    showPopup(
      "Network error",
      "Unable to reach GitHub API. Please try again later."
    );
  }
}

(function main() {
  const parsed = parseRequest();
  
  if (!parsed || !parsed.id) {
    redirectDash();
    return;
  }

  const { id, path } = parsed;
  
  if (!/^\d+$/.test(id)) {
    showPopup(
      "Invalid ID",
      "GitHub user ID must be numeric."
    );
    return;
  }
  
  resolveUser(id, path);
})();
