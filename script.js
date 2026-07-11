document.addEventListener("DOMContentLoaded", () => {
    const imageUpload = document.getElementById("image-upload");
    const galleryContainer = document.getElementById("gallery-container");
    const searchBar = document.getElementById("search-bar");
    const viewToggle = document.getElementById("view-toggle");
    const themeToggle = document.getElementById("theme-toggle");
    const emptyState = document.getElementById("empty-state");
    const filterTabs = document.querySelectorAll(".tab");

    const lightbox = document.getElementById("lightbox");
    const lightboxImg = document.getElementById("lightbox-img");
    const lightboxTitle = document.getElementById("image-title");
    const favToggleBtn = document.getElementById("fav-toggle-btn");

    let imagesData = JSON.parse(localStorage.getItem("gallery_images")) || [];
    let currentFilter = "all";
    let currentSearch = "";
    let activeIndex = 0;

    // --- LOCAL STORAGE DATA SYNC ---
    function saveData() {
        localStorage.setItem("gallery_images", JSON.stringify(imagesData));
        renderGallery();
    }

    // --- REAL MEDIA UPLOAD HANDLER ---
    imageUpload.addEventListener("change", (e) => {
        const files = Array.from(e.target.files);
        
        files.forEach(file => {
            const reader = new FileReader();
            reader.onload = function(event) {
                const newImage = {
                    id: Date.now() + Math.random(),
                    src: event.target.result,
                    name: file.name,
                    isFavorite: false
                };
                imagesData.push(newImage);
                saveData();
            };
            reader.readAsDataURL(file); // Reads image from local device storage
        });
    });

    // --- RENDER DYNAMIC COMPONENT ---
    function renderGallery() {
        // Clear previous grid items except the empty state element
        const items = galleryContainer.querySelectorAll(".gallery-item");
        items.forEach(el => el.remove());

        // Process filtering & active searching matching
        const filtered = imagesData.filter(img => {
            const matchesFilter = currentFilter === "all" || (currentFilter === "favorites" && img.isFavorite);
            const matchesSearch = img.name.toLowerCase().includes(currentSearch.toLowerCase());
            return matchesFilter && matchesSearch;
        });

        if (filtered.length === 0) {
            emptyState.style.display = "block";
            return;
        }
        emptyState.style.display = "none";

        filtered.forEach((imgObj, idx) => {
            const item = document.createElement("div");
            item.classList.add("gallery-item");
            
            item.innerHTML = `
                <img src="${imgObj.src}" alt="${imgObj.name}">
                ${imgObj.isFavorite ? '<span class="fav-badge">❤️</span>' : ''}
            `;

            item.addEventListener("click", () => openLightbox(filtered, idx));
            galleryContainer.appendChild(item);
        });
    }

    // --- LIGHTBOX CONTROLS ---
    function openLightbox(list, index) {
        activeIndex = index;
        const updateModalView = () => {
            const currentItem = list[activeIndex];
            lightboxImg.src = currentItem.src;
            lightboxTitle.textContent = currentItem.name;
            favToggleBtn.textContent = currentItem.isFavorite ? "❤️ Favorited" : "🤍 Favorite";
        };

        updateModalView();
        lightbox.classList.add("active");

        // Action Buttons inside Modal view
        favToggleBtn.onclick = () => {
            const originalItem = imagesData.find(i => i.id === list[activeIndex].id);
            originalItem.isFavorite = !originalItem.isFavorite;
            list[activeIndex].isFavorite = originalItem.isFavorite;
            saveData();
            updateModalView();
        };

        document.getElementById("next-btn").onclick = () => {
            activeIndex = (activeIndex + 1) % list.length;
            updateModalView();
        };

        document.getElementById("prev-btn").onclick = () => {
            activeIndex = (activeIndex - 1 + list.length) % list.length;
            updateModalView();
        };
    }

    document.getElementById("close-lightbox").addEventListener("click", () => lightbox.classList.remove("active"));

    // --- LAYOUT SWITCHER (GRID / LIST MODE) ---
    viewToggle.addEventListener("click", () => {
        if (galleryContainer.classList.contains("grid-view")) {
            galleryContainer.classList.remove("grid-view");
            galleryContainer.classList.add("list-view");
            viewToggle.textContent = "☰";
        } else {
            galleryContainer.classList.remove("list-view");
            galleryContainer.classList.add("grid-view");
            viewToggle.textContent = "🔲";
        }
    });

    // --- LIVE CONTROLS: FILTER & SEARCH ---
    searchBar.addEventListener("input", (e) => {
        currentSearch = e.target.value;
        renderGallery();
    });

    filterTabs.forEach(tab => {
        tab.addEventListener("click", () => {
            document.querySelector(".tab.active").classList.remove("active");
            tab.classList.add("active");
            currentFilter = tab.getAttribute("data-filter");
            renderGallery();
        });
    });

    // --- MINIMALIST DARK/LIGHT THEME TOGGLE ---
    themeToggle.addEventListener("click", () => {
        document.body.classList.toggle("dark-theme");
    });

    // Initial load setup run execution
    renderGallery();
});