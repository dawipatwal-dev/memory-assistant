/* =============================
   DOM CONTENT LOADED HANDLER
============================= */

document.addEventListener("DOMContentLoaded", () => {
    // Reference to DOM elements
    const memoryForm = document.getElementById("memory-form");
    const memoryInput = document.getElementById("memory-input");
    const categorySelect = document.getElementById("category-select");
    const memoryList = document.getElementById("memory-list");
    const searchInput = document.getElementById("search-input");
    const filterCategory = document.getElementById("filter-category");
    
    const exportButton = document.getElementById("export-memories");
    const importInput = document.getElementById("import-memories");
    const sortDropdown = document.getElementById("sort-memories");
    const darkModeToggle = document.getElementById("dark-mode-toggle");
    const modal = document.getElementById("confirmation-modal");
    const modalMessage = document.getElementById("modal-message");
    const confirmButton = document.getElementById("confirm-button");
    const cancelButton = document.getElementById("cancel-button");
    const clearButton = document.getElementById("clear-memories");
    const todayMemoriesList = document.getElementById("today-memories");

    /* =============================
       DARK MODE FUNCTIONALITY
    ============================== */
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
        document.body.classList.add(savedTheme);
        darkModeToggle.checked = savedTheme === "dark-mode";
    }

    darkModeToggle.addEventListener("change", () => {
        const mode = darkModeToggle.checked ? "dark-mode" : "light-mode";
        document.body.classList.remove("dark-mode", "light-mode");
        document.body.classList.add(mode);
        localStorage.setItem("theme", mode);
    });

    /* =============================
       MEMORY FUNCTIONS
    ============================== */

    // Check if a memory was added today
    function isToday(timestamp) {
        const today = new Date();
        const memoryDate = new Date(timestamp);
        return (
            today.getFullYear() === memoryDate.getFullYear() &&
            today.getMonth() === memoryDate.getMonth() &&
            today.getDate() === memoryDate.getDate()
        );
    }

    // Update today's memories
    function updateTodayMemories() {
        todayMemoriesList.innerHTML = "";
        const memories = JSON.parse(localStorage.getItem("memories")) || [];
        const todayMemories = memories.filter(({ timestamp }) => isToday(timestamp));

        todayMemories.forEach(({ memory, category, timestamp }) => {
            const listItem = document.createElement("li");
            listItem.textContent = `${memory} (${category}) [Added: ${new Date(
                timestamp
            ).toLocaleTimeString()}]`;
            todayMemoriesList.appendChild(listItem);
        });
    }

    updateTodayMemories();

    // Save memory to local storage
    function saveMemory(memory, category) {
        const memories = JSON.parse(localStorage.getItem("memories")) || [];
        const timestamp = Date.now();
        memories.push({ memory, category, timestamp });
        localStorage.setItem("memories", JSON.stringify(memories));
    }

    // Update memory in local storage
    function updateMemory(oldMemory, newMemory, category, timestamp) {
        const memories = JSON.parse(localStorage.getItem("memories")) || [];
        const updatedMemories = memories.map((m) =>
            m.memory === oldMemory ? { memory: newMemory, category, timestamp } : m
        );
        localStorage.setItem("memories", JSON.stringify(updatedMemories));
    }

    // Delete memory from local storage
    function deleteMemory(memory) {
        const memories = JSON.parse(localStorage.getItem("memories")) || [];
        const updatedMemories = memories.filter((m) => m.memory !== memory);
        localStorage.setItem("memories", JSON.stringify(updatedMemories));
    }

    // Add a memory to the UI
    function addMemoryToList(memory, category, timestamp) {
        const existingMemory = Array.from(memoryList.children).find(
            (item) => item.firstChild.textContent.includes(memory)
        );
        if (existingMemory) return;

        const listItem = document.createElement("li");

        const memoryText = document.createElement("span");
        memoryText.textContent = `${memory} (${category})`;

        const timeText = document.createElement("small");
        timeText.textContent = ` [Added: ${new Date(
            timestamp || Date.now()
        ).toLocaleString()}]`;
        timeText.style.marginLeft = "10px";
        timeText.style.color = "gray";

        const editButton = document.createElement("button");
        editButton.textContent = "Edit";
        editButton.addEventListener("click", () => {
            const newMemory = prompt("Edit your memory:", memory);
            if (newMemory) {
                const updatedTimestamp = Date.now();
                updateMemory(memory, newMemory, category, updatedTimestamp);
                memoryText.textContent = `${newMemory} (${category})`;
                timeText.textContent = ` [Added: ${new Date(
                    updatedTimestamp
                ).toLocaleString()}]`;
            }
        });

        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete";
        deleteButton.addEventListener("click", () => {
            deleteMemory(memory);
            listItem.remove();
        });

        listItem.appendChild(memoryText);
        listItem.appendChild(timeText);
        listItem.appendChild(editButton);
        listItem.appendChild(deleteButton);
        memoryList.appendChild(listItem);
    }

    // Handle form submission
    memoryForm.addEventListener("submit", (event) => {
        event.preventDefault();
        const memory = memoryInput.value.trim();
        const category = categorySelect.value;
        if (memory) {
            addMemoryToList(memory, category);
            saveMemory(memory, category);
            memoryInput.value = "";
            categorySelect.value = "Work";
            updateTodayMemories();
        } else {
            alert("Please enter a memory!");
        }
    });

    /* =============================
       SEARCH AND FILTER FUNCTIONALITY
    ============================== */

    searchInput.addEventListener("input", () => {
        const query = searchInput.value.toLowerCase();
        const selectedCategory = filterCategory.value;

        Array.from(memoryList.children).forEach((item) => {
            const text = item.firstChild.textContent.toLowerCase();
            const categoryText = item.textContent.match(/\(([^)]+)\)/)?.[1]?.trim();

            item.style.display =
                (text.includes(query) || query === "") &&
                (selectedCategory === "All" || categoryText === selectedCategory)
                    ? ""
                    : "none";
        });
    });

    filterCategory.addEventListener("change", () => {
        const selectedCategory = filterCategory.value;

        Array.from(memoryList.children).forEach((item) => {
            const categoryText = item.textContent.match(/\(([^)]+)\)/)?.[1]?.trim();
            item.style.display =
                selectedCategory === "All" || categoryText === selectedCategory
                    ? ""
                    : "none";
        });
    });

    /* =============================
       SORTING FUNCTIONALITY
    ============================== */

    sortDropdown.addEventListener("change", () => {
        const sortOption = sortDropdown.value;
        const memories = JSON.parse(localStorage.getItem("memories")) || [];
        let sortedMemories;

        if (sortOption === "alphabetical") {
            sortedMemories = [...memories].sort((a, b) =>
                a.memory.localeCompare(b.memory)
            );
        } else if (sortOption === "category") {
            sortedMemories = [...memories].sort((a, b) =>
                a.category.localeCompare(b.category)
            );
        } else if (sortOption === "date") {
            sortedMemories = [...memories].sort((a, b) => b.timestamp - a.timestamp);
        } else {
            sortedMemories = memories;
        }

        memoryList.innerHTML = "";
        sortedMemories.forEach(({ memory, category, timestamp }) => {
            addMemoryToList(memory, category, timestamp);
        });
    });

    /* =============================
       IMPORT AND EXPORT FUNCTIONALITY
    ============================== */

    importInput.addEventListener("change", (event) => {
        const file = event.target.files[0];
        if (!file) return alert("No file selected!");

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const importedMemories = JSON.parse(e.target.result);
                if (!Array.isArray(importedMemories)) throw new Error("Invalid file format");

                const existingMemories = JSON.parse(localStorage.getItem("memories")) || [];
                const updatedMemories = [...existingMemories, ...importedMemories];
                localStorage.setItem("memories", JSON.stringify(updatedMemories));

                importedMemories.forEach(({ memory, category }) => {
                    addMemoryToList(memory, category);
                });

                alert("Memories imported successfully!");
            } catch (error) {
                alert("Failed to import memories: " + error.message);
            }
        };
        reader.readAsText(file);
    });

    exportButton.addEventListener("click", () => {
        const memories = JSON.parse(localStorage.getItem("memories")) || [];
        if (memories.length === 0) return alert("No memories to export!");

        const blob = new Blob([JSON.stringify(memories, null, 2)], { type: "application/json" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "memories.json";
        link.click();
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && modal.style.display === "flex") {
            closeModal();
        }
    });
    

     /* =============================
       MODAL FUNCTIONALITY
    ============================== */

    function showModal(message, onConfirm) {
        modalMessage.textContent = message;
        modal.style.display = "flex";
        confirmButton.focus(); // Set focus to the confirm button
        modal.setAttribute('aria-hidden', 'false');     // Set focus to the modal for accessibility
        confirmButton.onclick = () => {
            onConfirm();
            closeModal();
        };
        cancelButton.onclick = closeModal;
    }

    function closeModal() {
        modal.style.display = "none";
        clearButton.focus(); // Return focus to the trigger element
        modal.setAttribute('aria-hidden', 'true'); // Return focus to the triggering element if necessary
        
    }

    clearButton.addEventListener("click", () => {
        showModal("Are you sure you want to clear all memories?", () => {
            localStorage.removeItem("memories");
            memoryList.innerHTML = "";
            alert("All memories cleared!");
        });
    });

    // Optional: Close the modal when clicking outside of it
    window.addEventListener("click", (event) => {
        if (event.target === modal) {
            closeModal();
        }
    });

    /* =============================
       INITIALIZATION
    ============================== */

    const savedMemories = JSON.parse(localStorage.getItem("memories")) || [];
    savedMemories.forEach(({ memory, category, timestamp }) => {
        addMemoryToList(memory, category, timestamp);
    });
});
