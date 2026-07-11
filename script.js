document.addEventListener("DOMContentLoaded", () => {
    const imageUpload = document.getElementById("image-upload");
    const galleryContainer = document.getElementById("gallery-container");
    const searchBar = document.getElementById("search-bar");
    const viewToggle = document.getElementById("view-toggle");
    const themeToggle = document.getElementById("theme-toggle");
    const emptyState = document.getElementById("empty-state");

    const lightbox = document.getElementById("lightbox");
    const lightboxImg = document.getElementById("lightbox-img");
    const lightboxTitle = document.getElementById("image-title");
    const deleteBtn = document.getElementById("delete-btn");
    const slideshowBtn = document.getElementById("slideshow-btn");
    const editButtons = document.querySelectorAll(".edit-btn");

    let imagesData = JSON.parse(localStorage.getItem("gallery_images")) || [];
    let currentSearch = "";
    let activeIndex = 0;
    let slideshowInterval = null;

    function saveData() {
        localStorage.setItem("gallery_images", JSON.stringify(imagesData));
        renderGallery();
    }

    imageUpload.addEventListener("change", (e) => {
        const files = Array.from(e.target.files);
        files.forEach(file => {
            const reader = new FileReader();
            reader.onload = function(event) {
                imagesData.push({
                    id: Date.now() + Math.random(),
                    src: event.target.result,
                    name: file.name,
                    editFilter: "none" // Stores applied filter styling state
                });
                saveData();
            };
            reader.readAsDataURL(file);
        });
    });

    function renderGallery() {
        const items = galleryContainer.querySelectorAll(".gallery-item");
        items.forEach(el => el.remove());

        const filtered = imagesData.filter(img => img.name.toLowerCase().includes(currentSearch.toLowerCase()));

        if (filtered.length === 0) {
            emptyState.style.display = "block";
            return;
        }
        emptyState.style.display = "none";

        filtered.forEach((imgObj, idx) => {
            const item = document.createElement("div");
            item.classList.add("gallery-item");
            item.innerHTML = `<img src="${imgObj.src}" alt="${imgObj.name}" style="filter: ${getFilterCSS(imgObj.editFilter)}">`;
            item.addEventListener("click", () => openLightbox(filtered, idx));
            galleryContainer.appendChild(item);
        });
    }

    function getFilterCSS(filterName) {
        if (filterName === "grayscale") return "grayscale(1)";
        if (filterName === "sepia") return "sepia(1)";
        if (filterName === "invert") return "invert(1)";
        if (filterName === "blur") return "blur(4px)";
        return "none";
    }

    function openLightbox(list, index) {
        activeIndex = index;
        
        const updateModalView = () => {
            if (!list[activeIndex]) {
                closeLightboxView();
                return;
            }
            const currentItem = list[activeIndex];
            lightboxImg.src = currentItem.src;
            lightboxTitle.textContent = currentItem.name;
            
            // Set active editor button state
            document.querySelector(".edit-btn.active").classList.remove("active");
            const filterToFind = currentItem.editFilter || "none";
            document.querySelector(`[data-filter="${filterToFind}"]`).classList.add("active");
            lightboxImg.style.filter = getFilterCSS(filterToFind);
        };

        updateModalView();
        lightbox.classList.add("active");

        // --- EDITING SYSTEM TOOLS ---
        editButtons.forEach(btn => {
            btn.onclick = () => {
                document.querySelector(".edit-btn.active").classList.remove("active");
                btn.classList.add("active");
                const chosenFilter = btn.getAttribute("data-filter");
                
                const originalItem = imagesData.find(i => i.id === list[activeIndex].id);
                if (originalItem) {
                    originalItem.editFilter = chosenFilter;
                    list[activeIndex].editFilter = chosenFilter;
                    localStorage.setItem("gallery_images", JSON.stringify(imagesData));
                }
                lightboxImg.style.filter = getFilterCSS(chosenFilter);
                renderGallery();
            };
        });

        // --- DELETE FUNCTIONALITY ---
        deleteBtn.onclick = () => {
            stopSlideshow();
            const targetId = list[activeIndex].id;
            imagesData = imagesData.filter(img => img.id !== targetId);
            list.splice(activeIndex, 1);
            saveData();
            
            if (list.length === 0 || activeIndex >= list.length) {
                activeIndex = 0;
            }
            if (list.length === 0) {
                closeLightboxView();
            } else {
                updateModalView();
            }
        };

        // --- SLIDESHOW TIMING ACTION ---
        slideshowBtn.onclick = () => {
            if (slideshowInterval) {
                stopSlideshow();
            } else {
                slideshowBtn.textContent = "⏸️ Pause";
                slideshowBtn.style.background = "#ffec3d";
                slideshowBtn.style.color = "#000";
                slideshowInterval = setInterval(() => {
                    activeIndex = (activeIndex + 1) % list.length;
                    updateModalView();
                }, 2500); // Transitions to next frame every 2.5 seconds
            }
        };

        document.getElementById("next-btn").onclick = () => { stopSlideshow(); activeIndex = (activeIndex + 1) % list.length; updateModalView(); };
        document.getElementById("prev-btn").onclick = () => { stopSlideshow(); activeIndex = (activeIndex - 1 + list.length) % list.length; updateModalView(); };
    }

    function stopSlideshow() {
        if (slideshowInterval) {
            clearInterval(slideshowInterval);
            slideshowInterval = null;
            slideshowBtn.textContent = "▶ Slideshow";
            slideshowBtn.style.background = "#18181b";
            slideshowBtn.style.color = "#f4f4f5";
        }
    }

    function closeLightboxView() {
        stopSlideshow();
        lightbox.classList.remove("active");
    }

    document.getElementById("close-lightbox").addEventListener("click", closeLightboxView);

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

    searchBar.addEventListener("input", (e) => {
        currentSearch = e.target.value;
        renderGallery();
    });

    themeToggle.addEventListener("click", () => document.body.classList.toggle("dark-theme"));
    renderGallery();
});