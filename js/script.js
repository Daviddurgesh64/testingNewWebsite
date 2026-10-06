"use strict";

/*
 * Replace this number with the business WhatsApp number.
 *
 * Required format:
 * - Include the country code.
 * - Do not include "+".
 * - Do not include spaces, brackets, or hyphens.
 *
 * Example for India:
 * 919876543210
 */
const WHATSAPP_NUMBER = "917765840046";

const productGrid = document.getElementById("productGrid");
const productCards = Array.from(
  document.querySelectorAll(".product-card")
);

const searchInput = document.getElementById("productSearch");
const clearSearchButton = document.getElementById("clearSearchButton");
const productCount = document.getElementById("productCount");
const emptyState = document.getElementById("emptyState");

const categoryInputs = Array.from(
  document.querySelectorAll('input[name="category"]')
);

const priceInputs = Array.from(
  document.querySelectorAll('input[name="price"]')
);

const categoryNavButtons = Array.from(
  document.querySelectorAll(".category-nav-button")
);

const sortProductsSelect = document.getElementById("sortProducts");
const resetFiltersButton = document.getElementById("resetFiltersButton");
const emptyStateResetButton = document.getElementById(
  "emptyStateResetButton"
);

const mobileFilterButton = document.getElementById(
  "mobileFilterButton"
);

const filterSidebar = document.getElementById("filterSidebar");
const exploreCollectionButton = document.getElementById(
  "exploreCollectionButton"
);

const headerContactLink = document.getElementById(
  "headerContactLink"
);

const footerContactLink = document.getElementById(
  "footerContactLink"
);

let activeCategory = "all";
let activePriceRange = "all";

/**
 * Normalizes text so searches are case-insensitive
 * and unaffected by extra spaces.
 */
function normalizeText(value) {
  return String(value || "")
    .trim()
    .toLowerCase();
}

/**
 * Converts a product's data-price value to a usable number.
 */
function getProductPrice(productCard) {
  const price = Number(productCard.dataset.price);
  return Number.isFinite(price) ? price : 0;
}

/**
 * Checks whether a price matches the selected range.
 */
function matchesPriceRange(price, range) {
  switch (range) {
    case "0-499":
      return price >= 0 && price <= 499;

    case "500-999":
      return price >= 500 && price <= 999;

    case "1000-1499":
      return price >= 1000 && price <= 1499;

    case "1500-Infinity":
      return price >= 1500;

    case "all":
    default:
      return true;
  }
}

/**
 * Sorts product cards using the selected sort option.
 */
function sortProductCards() {
  const sortValue = sortProductsSelect.value;

  const sortedCards = [...productCards].sort((firstCard, secondCard) => {
    const firstName = normalizeText(firstCard.dataset.name);
    const secondName = normalizeText(secondCard.dataset.name);

    const firstPrice = getProductPrice(firstCard);
    const secondPrice = getProductPrice(secondCard);

    const firstOrder = Number(firstCard.dataset.order);
    const secondOrder = Number(secondCard.dataset.order);

    switch (sortValue) {
      case "price-low-high":
        return firstPrice - secondPrice;

      case "price-high-low":
        return secondPrice - firstPrice;

      case "name-a-z":
        return firstName.localeCompare(secondName);

      case "featured":
      default:
        return firstOrder - secondOrder;
    }
  });

  sortedCards.forEach((card) => {
    productGrid.appendChild(card);
  });
}

/**
 * Applies search, category, and price filters.
 */
function filterProducts() {
  const searchTerm = normalizeText(searchInput.value);
  let visibleProducts = 0;

  productCards.forEach((productCard) => {
    const productName = normalizeText(productCard.dataset.name);
    const productCategory = productCard.dataset.category || "";
    const productPrice = getProductPrice(productCard);

    /*
     * Include the card's full visible text so users can also search
     * for descriptions such as "ceramic", "flowers", or "notebook".
     */
    const searchableContent = normalizeText(productCard.textContent);

    const matchesSearch =
      searchTerm === "" ||
      productName.includes(searchTerm) ||
      searchableContent.includes(searchTerm);

    const matchesCategory =
      activeCategory === "all" ||
      productCategory === activeCategory;

    const matchesPrice = matchesPriceRange(
      productPrice,
      activePriceRange
    );

    const shouldDisplay =
      matchesSearch && matchesCategory && matchesPrice;

    productCard.classList.toggle(
      "is-filtered-out",
      !shouldDisplay
    );

    productCard.classList.toggle(
      "is-visible",
      shouldDisplay
    );

    if (shouldDisplay) {
      visibleProducts += 1;
    }
  });

  updateProductCount(visibleProducts);
  updateEmptyState(visibleProducts);
  updateSearchClearButton();
}

/**
 * Updates the product result count.
 */
function updateProductCount(visibleProducts) {
  const productText =
    visibleProducts === 1 ? "product" : "products";

  productCount.textContent =
    `Showing ${visibleProducts} ${productText}`;
}

/**
 * Displays an empty state when no product matches.
 */
function updateEmptyState(visibleProducts) {
  const hasNoResults = visibleProducts === 0;

  emptyState.classList.toggle("hidden", !hasNoResults);
  productGrid.classList.toggle("hidden", hasNoResults);
}

/**
 * Shows or hides the clear-search button.
 */
function updateSearchClearButton() {
  const hasSearchValue = searchInput.value.trim().length > 0;

  clearSearchButton.classList.toggle(
    "hidden",
    !hasSearchValue
  );

  clearSearchButton.classList.toggle(
    "flex",
    hasSearchValue
  );
}

/**
 * Synchronizes the sidebar category radio options
 * with the secondary navigation.
 */
function synchronizeCategoryControls(category) {
  activeCategory = category;

  categoryInputs.forEach((input) => {
    input.checked = input.value === category;
  });

  categoryNavButtons.forEach((button) => {
    const isActive =
      button.dataset.categoryFilter === category;

    button.classList.toggle("active", isActive);
  });
}

/**
 * Resets all filters, search input, and sorting.
 */
function resetAllFilters() {
  searchInput.value = "";
  activeCategory = "all";
  activePriceRange = "all";

  synchronizeCategoryControls("all");

  priceInputs.forEach((input) => {
    input.checked = input.value === "all";
  });

  sortProductsSelect.value = "featured";

  sortProductCards();
  filterProducts();
}

/**
 * Opens WhatsApp with a pre-filled product order message.
 *
 * Product name and price are dynamically read from the
 * clicked button's data-product-name and data-product-price
 * attributes.
 */
function buyOnWhatsApp(button) {
  const productName = button.dataset.productName?.trim();
  const productPrice = button.dataset.productPrice?.trim();

  if (!productName || !productPrice) {
    console.error(
      "The WhatsApp button is missing product name or price data."
    );

    window.alert(
      "Product information is unavailable. Please contact us directly."
    );

    return;
  }

  const message =
    `Hi, I'm interested in ordering ${productName} ` +
    `for ₹${productPrice}. Please share availability ` +
    `and delivery details.`;

  const whatsappUrl =
    `https://wa.me/${WHATSAPP_NUMBER}` +
    `?text=${encodeURIComponent(message)}`;

  /*
   * noopener and noreferrer prevent the newly opened page
   * from accessing the original page through window.opener.
   */
  window.open(
    whatsappUrl,
    "_blank",
    "noopener,noreferrer"
  );
}

/**
 * Opens a general WhatsApp enquiry without a selected product.
 */
function openGeneralWhatsAppEnquiry(event) {
  event.preventDefault();

  const message =
    "Hi, I would like to know more about your gifting products.";

  const whatsappUrl =
    `https://wa.me/${WHATSAPP_NUMBER}` +
    `?text=${encodeURIComponent(message)}`;

  window.open(
    whatsappUrl,
    "_blank",
    "noopener,noreferrer"
  );
}

/* =========================
   Event Listeners
========================= */

/* Instant frontend search. */
searchInput.addEventListener("input", filterProducts);

/* Clear only the search field while keeping other filters. */
clearSearchButton.addEventListener("click", () => {
  searchInput.value = "";
  searchInput.focus();
  filterProducts();
});

/* Sidebar category filtering. */
categoryInputs.forEach((input) => {
  input.addEventListener("change", (event) => {
    synchronizeCategoryControls(event.target.value);
    filterProducts();
  });
});

/* Secondary category navigation filtering. */
categoryNavButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const selectedCategory =
      button.dataset.categoryFilter || "all";

    synchronizeCategoryControls(selectedCategory);
    filterProducts();

    document
      .getElementById("catalogueHeading")
      .scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
  });
});

/* Sidebar price filtering. */
priceInputs.forEach((input) => {
  input.addEventListener("change", (event) => {
    activePriceRange = event.target.value;
    filterProducts();
  });
});

/* Product sorting. */
sortProductsSelect.addEventListener("change", () => {
  sortProductCards();
  filterProducts();
});

/* Reset buttons. */
resetFiltersButton.addEventListener(
  "click",
  resetAllFilters
);

emptyStateResetButton.addEventListener(
  "click",
  resetAllFilters
);

/* WhatsApp product-order buttons. */
document.addEventListener("click", (event) => {
  const whatsappButton = event.target.closest(
    ".whatsapp-button"
  );

  if (whatsappButton) {
    buyOnWhatsApp(whatsappButton);
  }
});

/* General WhatsApp contact links. */
headerContactLink.addEventListener(
  "click",
  openGeneralWhatsAppEnquiry
);

footerContactLink.addEventListener(
  "click",
  openGeneralWhatsAppEnquiry
);

/* Mobile filter sidebar toggle. */
mobileFilterButton.addEventListener("click", () => {
  const isOpen = filterSidebar.classList.toggle(
    "is-mobile-open"
  );

  mobileFilterButton.setAttribute(
    "aria-expanded",
    String(isOpen)
  );
});

/* Scroll from the banner to the catalogue. */
exploreCollectionButton.addEventListener("click", () => {
  document
    .getElementById("catalogueHeading")
    .scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
});

/*
 * Prevent images from being dragged.
 * This is a basic UX deterrent, not content protection.
 */
document.querySelectorAll("img").forEach((image) => {
  image.setAttribute("draggable", "false");

  image.addEventListener("dragstart", (event) => {
    event.preventDefault();
  });
});

/* Set the footer year automatically. */
document.getElementById("currentYear").textContent =
  new Date().getFullYear();

/* Initial catalogue setup. */
sortProductCards();
filterProducts();
``
