// Handle the search button click
document.getElementById("search-btn").addEventListener("click", async () => {
  // Get values from the search fields
  const query = document.getElementById("search-input").value;  // Product name
  const region = document.getElementById("region-input").value;  // Region
  const shop = document.getElementById("shop-input").value;  // Shop

  // Send GET request to the backend with search parameters
  const res = await fetch(`/api/products?q=${query}&region=${region}&shop=${shop}`);
  const products = await res.json();

  // Get the results table body element
  const resultsTableBody = document.getElementById("search-results");
  resultsTableBody.innerHTML = '';  // Clear any previous search results

  // Check if there are any products
  if (products.length > 0) {
    products.forEach(product => {
      const row = document.createElement("tr");

      // Create table cells for each product attribute
      const nameCell = document.createElement("td");
      nameCell.textContent = product.name;
      row.appendChild(nameCell);

      const priceCell = document.createElement("td");
      priceCell.textContent = `₹${product.price}`;
      row.appendChild(priceCell);

      const regionCell = document.createElement("td");
      regionCell.textContent = product.region;
      row.appendChild(regionCell);

      const shopCell = document.createElement("td");
      shopCell.textContent = product.shop;
      row.appendChild(shopCell);

      // Append the row to the results table body
      resultsTableBody.appendChild(row);
    });
  } else {
    // If no products are found, show a "No products found" message
    const noResultsRow = document.createElement("tr");
    const noResultsCell = document.createElement("td");
    noResultsCell.colSpan = 4;  // Span across all 4 columns
    noResultsCell.textContent = "No products found.";
    noResultsRow.appendChild(noResultsCell);
    resultsTableBody.appendChild(noResultsRow);
  }
});
