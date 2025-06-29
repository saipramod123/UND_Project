const API_URL = "https://apps.und.edu/demo/public/index.php/post";
const postList = document.getElementById("post-list");
const searchInput = document.getElementById("search");
const hamburger = document.getElementById("hamburger");
const nav = document.getElementById("main-nav");

let allPosts = [];

window.addEventListener("DOMContentLoaded", () => {
  showSkeleton();
  fetchAllPosts();
  searchInput.addEventListener("input", handleSearch);
});

function showSkeleton() {
  postList.innerHTML = `
    <div class="skeleton"></div>
    <div class="skeleton"></div>
    <div class="skeleton"></div>
  `;
}

function handleSearch() {
  const query = searchInput.value.toLowerCase();
  const filtered = allPosts.filter(post =>
    post.message.toLowerCase().includes(query)
  );
  renderPosts(filtered);
}

async function fetchAllPosts() {
  const today = new Date();
  const allFetchedPosts = [];

  for (let offset = 0; offset < 9; offset += 3) {
    const fromDate = new Date(today);
    fromDate.setDate(today.getDate() - offset - 2);
    const toDate = new Date(today);
    toDate.setDate(today.getDate() - offset);

    const from = fromDate.toISOString().split("T")[0];
    const to = toDate.toISOString().split("T")[0];

    try {
      const response = await fetch(`${API_URL}?from=${from}&to=${to}`);
      if (response.ok) {
        const posts = await response.json();
        allFetchedPosts.push(...posts);
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
    }
  }

  allPosts = allFetchedPosts.sort((a, b) => new Date(b.date) - new Date(a.date));
  renderPosts(allPosts);
}

function renderPosts(posts) {
  postList.innerHTML = "";
  if (!posts.length) {
    postList.innerHTML = "<p>No posts found.</p>";
    return;
  }

  posts.forEach(post => {
    const card = document.createElement("div");
    card.className = "post-card reveal";

    const localDate = new Date(post.date).toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });

    card.innerHTML = `
      <img src="${post.image}" alt="Author image" />
      <p><strong>${post.author}</strong> (@${post.username})</p>
      <p>${post.message}</p>
      <p><strong>Location:</strong> ${post.location || "N/A"}</p>
      <p><small>${localDate}</small></p>
      <p>❤️ ${post.likes} | 🔁 ${post.reposts}</p>
    `;

    postList.appendChild(card);
  });

  observeReveal();
}

function observeReveal() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("revealed");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll(".reveal").forEach(el => observer.observe(el));
}
window.addEventListener("scroll", () => {
  const header = document.querySelector(".main-header");
  if (window.scrollY > 10) {
    header.style.boxShadow = "0 2px 6px rgba(0, 0, 0, 0.3)";
  } else {
    header.style.boxShadow = "none";
  }
});


hamburger.addEventListener("click", () => {
  hamburger.classList.toggle("open");
  nav.classList.toggle("active");
});

// Optional: Highlight clicked link
document.querySelectorAll("#main-nav a").forEach(link => {
  link.addEventListener("click", function () {
    document.querySelectorAll("#main-nav a").forEach(l => l.classList.remove("active"));
    this.classList.add("active");
  });
});