const API_URL = "https://apps.und.edu/demo/public/index.php/post";
const postList = document.getElementById("post-list");
const searchInput = document.getElementById("search");
const hamburger = document.getElementById("hamburger");
const nav = document.getElementById("main-nav");

let allPosts = [];
let postsPerPage = 8;
let currentIndex = 0;
const loadMoreBtn = document.getElementById("load-more-btn");
const loadingIndicator = document.getElementById("loading-indicator");
let popupPosts = [];
let popupCurrentIndex = 0;


window.addEventListener("DOMContentLoaded", () => {
  showSkeleton();
  fetchAllPosts();
 loadMoreBtn.addEventListener("click", () => {
  loadingIndicator.style.display = "block";
  loadMoreBtn.disabled = true;

  setTimeout(() => {
    renderPosts(allPosts, true);
    loadingIndicator.style.display = "none";
    loadMoreBtn.disabled = false;
  }, 800);
});
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

function renderPosts(posts, isLoadMore = false) {
  if (!isLoadMore) {
    postList.innerHTML = ""; 
    currentIndex = 0;        
  }
  if (!posts.length) {
    postList.innerHTML = "<p>No posts found.</p>";
    return;
  }
 popupPosts = posts;
const nextPosts = posts.slice(currentIndex, currentIndex + postsPerPage);nextPosts.forEach((post,index) => {
    const card = document.createElement("div");
    card.className = "post-card reveal";
    card.addEventListener("click", () => {showBootstrapPost(currentIndex + index);});
    const localDate = new Date(post.date).toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
    card.id = `post-${post.id}`;
    const currentPageURL = window.location.href.split('#')[0];
const postURL = `${currentPageURL}#post-${post.id}`;
const encodedPostURL = encodeURIComponent(postURL);
 const messageEncoded = encodeURIComponent(post.message);
    card.innerHTML = `
      <img src="${post.image}" alt="Author image" />
      <p><strong>${post.author}</strong> (@${post.username})</p>
      <p>${post.message}</p>
      <p><strong>Location:</strong> ${post.location || "N/A"}</p>
      <p><small>${localDate}</small></p>
      <p>❤️ ${post.likes} | 🔁 ${post.reposts}</p>
      <div class="post-actions">
  <button class="share-toggle" aria-label="Share this post">
  <img src="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.3/icons/share-fill.svg" alt="Share icon" style=" height: 30px;" />
</button>
  <div class="share-icons hidden">
    <a href="https://www.facebook.com/sharer/sharer.php?u=${encodedPostURL}" target="_blank" aria-label="Share on Facebook"> <img src="https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/facebook.svg" alt="" class="icon" /> Facebook</a>
    <a href="https://www.linkedin.com/sharing/share-offsite/?url=${encodedPostURL}" target="_blank" aria-label="Share on LinkedIn"><img src="https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/linkedin.svg" alt="" class="icon" /> LinkedIn</a>
    <a href="https://twitter.com/intent/tweet?url=${encodedPostURL}&text=${messageEncoded}" target="_blank" aria-label="Share on Twitter"><img src="https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/twitter.svg" alt="" class="icon" /> Twitter</a>
    <a href="mailto:?subject=Check this out&body=${messageEncoded}%0A${encodedPostURL}" target="_blank" aria-label="Share via Email"><img src="https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/maildotru.svg" alt="" class="icon" /> Email</a>
  </div>
</div>
    `;

    postList.appendChild(card);
  });

  observeReveal();
attachShareToggles(); 
currentIndex += postsPerPage;

  if (currentIndex < posts.length) {
    loadMoreBtn.style.display = "block";
  } else {
    loadMoreBtn.style.display = "none";
  }
}

const modal = new bootstrap.Modal(document.getElementById('postModal'));
const modalPostContent = document.getElementById('modalPostContent');

function showBootstrapPost(index) {
  const post = popupPosts[index];
  const localDate = new Date(post.date).toLocaleString(undefined, {
    dateStyle: "medium", timeStyle: "short"
  });

  modalPostContent.innerHTML = `
    <div>
      <h5>${post.author} (@${post.username})</h5>
      <p>${post.message}</p>
      <p><strong>Location:</strong> ${post.location || "N/A"}</p>
      <p><small>${localDate}</small></p>
      <p>❤️ ${post.likes} | 🔁 ${post.reposts}</p>
    </div>
  `;

  popupCurrentIndex = index;
  modal.show();
}

document.getElementById("prevPost").addEventListener("click", (e) => {
    e.stopPropagation(); 
  if (popupCurrentIndex > 0) {
    showBootstrapPost(popupCurrentIndex - 1);
  }
});

document.getElementById("nextPost").addEventListener("click", (e) => {
     e.stopPropagation();
  if (popupCurrentIndex < popupPosts.length - 1) {
    showBootstrapPost(popupCurrentIndex + 1);
  }
});




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
function attachShareToggles() {
  const toggles = document.querySelectorAll(".share-toggle");

  toggles.forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation(); 

      
      document.querySelectorAll(".share-icons").forEach(icon => {
        if (icon !== btn.nextElementSibling) {
          icon.classList.add("hidden");
        }
      });

   
      const icons = btn.nextElementSibling;
      icons.classList.toggle("hidden");
    });
  });


  window.addEventListener("click", () => {
    document.querySelectorAll(".share-icons").forEach(icon => {
      icon.classList.add("hidden");
    });
  });

  
  document.querySelectorAll(".share-icons").forEach(icon => {
    icon.addEventListener("click", (e) => {
      e.stopPropagation();
    });
  });
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

document.querySelectorAll("#main-nav a").forEach(link => {
  link.addEventListener("click", function () {
    document.querySelectorAll("#main-nav a").forEach(l => l.classList.remove("active"));
    this.classList.add("active");
  });
});