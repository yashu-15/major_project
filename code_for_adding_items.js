const apiBaseUrl = "http://localhost:5000/api/items";

async function checkAuth() {
    const token = localStorage.getItem("token");
    if (!token) {
        alert("You must be logged in!");
        window.location.href = "login.html";
        return;
    }

    try {
        const response = await fetch("http://localhost:5000/api/auth/check", {
            method: "GET",
            headers: { Authorization: `Bearer ${token}` },
            credentials: "include" // Ensures cookies are sent if required
        });

        if (!response.ok) {
            throw new Error("Unauthorized");
        }

        const userData = await response.json();
        return userData.userId; // Ensure this is returned correctly
    } catch (error) {
        console.error("Authentication error:", error);
        alert("Session expired. Please log in again.");
        localStorage.removeItem("token");
        window.location.href = "login.html";
    }
}

// ✅ Fetch & display logged-in user's items
async function fetchItems() {
    try {
        const response = await fetch(apiBaseUrl, {
            method: "GET",
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            credentials: "include"
        });

        if (!response.ok) throw new Error("Failed to fetch items");

        const items = await response.json();
        const itemsList = document.getElementById("itemsList");

        itemsList.innerHTML = ""; // Clear existing content

        items.forEach(item => {
            const remainingDays = Math.ceil((new Date(item.expiryDate) - new Date()) / (1000 * 60 * 60 * 24));
            const imageUrl = item.imageUrl ? `http://localhost:5000${item.imageUrl}` : "placeholder.png";

            // Append items
            const row = `
                <tr>
                    <td><img src="${imageUrl}" alt="${item.name}" class="img-thumbnail" width="50"></td>
                    <td>${item.name}</td>
                    <td>${item.weight} kg</td>
                    <td>${new Date(item.expiryDate).toLocaleDateString()}</td>
                    <td>${remainingDays} days</td>
                    <td>
                        <button class="btn btn-info btn-sm" onclick="viewItem('${item._id}', '${item.name}', '${item.weight}', '${item.expiryDate}', '${imageUrl}')">View</button>
                        <button class="btn btn-danger btn-sm" onclick="deleteItem('${item._id}')">Delete</button>
                    </td>
                </tr>
            `;
            itemsList.innerHTML += row;
        });
    } catch (error) {
        console.error("Error fetching items:", error);
    }
}

// ✅ Handle adding a new item
document.getElementById("itemForm").addEventListener("submit", async function (e) {
    e.preventDefault();

    const formData = new FormData(this);
    
    try {
        const response = await fetch(apiBaseUrl, {
            method: "POST",
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            body: formData
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Failed to add item");
        }

        alert("Item added successfully!");
        this.reset();
        await fetchItems();
    } catch (error) {
        console.error("Error adding item:", error);
        alert("Failed to add item: " + error.message);
    }
});

// ✅ Delete an item
async function deleteItem(id) {
    if (!confirm("Are you sure you want to delete this item?")) return;

    try {
        const response = await fetch(`${apiBaseUrl}/${id}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        });

        if (!response.ok) throw new Error("Failed to delete item");

        alert("Item deleted successfully!");
        await fetchItems();
    } catch (error) {
        console.error("Error deleting item:", error);
        alert("Failed to delete the item.");
    }
}

// ✅ View & Edit item
function viewItem(id, name, weight, expiryDate, imageUrl) {
    document.getElementById("editItemId").value = id;
    document.getElementById("editName").value = name;
    document.getElementById("editWeight").value = weight;
    document.getElementById("editExpiryDate").value = expiryDate;
    document.getElementById("modalImage").src = imageUrl;

    const modal = new bootstrap.Modal(document.getElementById("itemModal"));
    modal.show();
}

// ✅ Handle edit form submission
document.getElementById("editItemForm").addEventListener("submit", async function (e) {
    e.preventDefault();
    const id = document.getElementById("editItemId").value;

    const updatedItem = {
        name: document.getElementById("editName").value,
        weight: document.getElementById("editWeight").value,
        expiryDate: document.getElementById("editExpiryDate").value
    };

    try {
        const response = await fetch(`${apiBaseUrl}/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("token")}`
            },
            body: JSON.stringify(updatedItem)
        });

        if (!response.ok) throw new Error("Failed to update item");

        alert("Item updated successfully!");
        await fetchItems();
    } catch (error) {
        console.error("Error updating item:", error);
    }
});

// ✅ Load items on page load
checkAuth().then(fetchItems);
