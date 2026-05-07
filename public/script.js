class Toast {
  static init() {
    if (!document.querySelector('.toast-container')) {
      const container = document.createElement('div');
      container.className = 'toast-container';
      container.setAttribute('aria-live', 'polite');
      document.body.appendChild(container);
    }
  }

  static show(message, type = 'info') {
    this.init();
    const container = document.querySelector('.toast-container');
    const toast = document.createElement('div');
    toast.className = `toast toast--${type}`;
    toast.setAttribute('role', 'alert');
    
    let icon = 'i';
    if (type === 'success') icon = 'OK';
    if (type === 'error') icon = '!';

    toast.innerHTML = `
      <div class="toast-icon">${icon}</div>
      <div class="toast-content">${message}</div>
      <button class="toast-close" aria-label="Fechar">&times;</button>
    `;

    container.appendChild(toast);
    
    requestAnimationFrame(() => toast.classList.add('is-visible'));

    const removeToast = () => {
      toast.classList.remove('is-visible');
      toast.classList.add('is-hiding');
      toast.addEventListener('transitionend', () => toast.remove(), { once: true });
    };

    toast.querySelector('.toast-close').addEventListener('click', removeToast);
    setTimeout(removeToast, 4000);
  }
}

const planCards = document.querySelectorAll(".plan");
const selectedPlan = document.querySelector("#selected-plan");
const ageGate = document.querySelector("#age-gate");
const ageConfirm = document.querySelector("#age-confirm");
const interestModal = document.querySelector("#interest-modal");
const interestOptions = document.querySelectorAll(".interest-option");
const categoryLinks = document.querySelectorAll(".category-switcher a");
const profileEditorForm = document.querySelector(".profile-editor-form");
const dashboardActionButtons = document.querySelectorAll("[data-dashboard-target]");
const dashboardPanels = document.querySelectorAll(".dashboard-workspace-panel");
const mediaUploadForm = document.querySelector(".media-upload-form");
const interestTargets = {
  Mulheres: "/mulheres",
  Homens: "/homens",
  Trans: "/travestis",
};
const currentPage = window.location.pathname.split("/").pop() || "/index";
const savedInterest = localStorage.getItem("delirioInterest");

if (currentPage === "/index" && localStorage.getItem("delirioAgeConfirmed") === "true" && savedInterest) {
  window.location.href = interestTargets[savedInterest] || "/mulheres";
}

if (ageGate) {
  ageGate.classList.toggle("is-hidden", localStorage.getItem("delirioAgeConfirmed") === "true");
  if (!ageGate.classList.contains("is-hidden")) trapFocus(ageGate);
}

if (
  interestModal &&
  localStorage.getItem("delirioAgeConfirmed") === "true" &&
  localStorage.getItem("delirioInterest")
) {
  interestModal.classList.add("is-hidden");
}

if (
  interestModal &&
  localStorage.getItem("delirioAgeConfirmed") === "true" &&
  !localStorage.getItem("delirioInterest")
) {
  interestModal.classList.remove("is-hidden");
  trapFocus(interestModal);
}

if (ageConfirm && ageGate) {
  ageConfirm.addEventListener("click", () => {
    localStorage.setItem("delirioAgeConfirmed", "true");
    ageGate.classList.add("is-hidden");
    if (interestModal && !localStorage.getItem("delirioInterest")) {
      interestModal.classList.remove("is-hidden");
      trapFocus(interestModal);
    }
  });
}

// Function to trap focus inside a modal
function trapFocus(element) {
  const focusableEls = element.querySelectorAll('a[href]:not([disabled]), button:not([disabled]), textarea:not([disabled]), input[type="text"]:not([disabled]), input[type="radio"]:not([disabled]), input[type="checkbox"]:not([disabled]), select:not([disabled])');
  if(focusableEls.length === 0) return;
  const firstFocusableEl = focusableEls[0];  
  const lastFocusableEl = focusableEls[focusableEls.length - 1];

  firstFocusableEl.focus();

  element.addEventListener('keydown', function(e) {
    if (e.key === 'Tab') {
      if (e.shiftKey) { 
        if (document.activeElement === firstFocusableEl) {
          lastFocusableEl.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastFocusableEl) {
          firstFocusableEl.focus();
          e.preventDefault();
        }
      }
    }
  });
}

interestOptions.forEach((option) => {
  option.addEventListener("click", () => {
    localStorage.setItem("delirioInterest", option.dataset.interest);
    interestModal?.classList.add("is-hidden");
    if (option.dataset.target) {
      window.location.href = option.dataset.target;
    }
  });
});

categoryLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    const target = link.getAttribute("href");

    if (!target || link.classList.contains("is-active")) {
      return;
    }

    event.preventDefault();
    document.body.classList.add("is-switching-category");
    window.setTimeout(() => {
      window.location.href = target;
    }, 90);
  });
});

if (profileEditorForm) {
  profileEditorForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const submitButton = profileEditorForm.querySelector(".profile-editor-submit");
    if(submitButton) submitButton.classList.add('is-loading');
    
    setTimeout(() => {
      if(submitButton) submitButton.classList.remove('is-loading');
      Toast.show("InformaÃ§Ãµes do perfil atualizadas com sucesso!", "success");
    }, 1500);
  });
}

dashboardActionButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const targetPanel = document.querySelector(`#${button.dataset.dashboardTarget}`);
    dashboardPanels.forEach((panel) => {
      panel.hidden = panel !== targetPanel;
    });
    dashboardActionButtons.forEach((item) => item.classList.remove("is-active"));
    button.classList.add("is-active");
    targetPanel?.scrollIntoView({ behavior: "smooth", block: "start" });
  });
});

if (mediaUploadForm) {
  mediaUploadForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const fileInput = mediaUploadForm.querySelector('input[type="file"]');
    if (!fileInput || fileInput.files.length === 0) {
      Toast.show("Por favor, selecione pelo menos um arquivo.", "error");
      return;
    }

    const submitButton = mediaUploadForm.querySelector(".media-upload-submit");
    if(submitButton) submitButton.classList.add("is-loading");
    
    setTimeout(() => {
      if(submitButton) submitButton.classList.remove("is-loading");
      Toast.show("MÃ­dia enviada para aprovaÃ§Ã£o com sucesso!", "success");
      mediaUploadForm.reset();
    }, 2000);
  });
}

if (planCards.length && selectedPlan) {
  planCards.forEach((card) => {
    const button = card.querySelector(".plan__button");

    button.addEventListener("click", () => {
      planCards.forEach((item) => {
        item.classList.remove("is-selected");
        item.querySelector(".plan__button").classList.remove("button--primary");
        item.querySelector(".plan__button").classList.add("button--muted");
      });

      card.classList.add("is-selected");
      button.classList.remove("button--muted");
      button.classList.add("button--primary");
      selectedPlan.textContent = card.dataset.plan;
      document.querySelector("#checkout").scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });
}

const checkoutForm = document.querySelector(".checkout-form");

if (checkoutForm && selectedPlan) {
  checkoutForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const submitButton = event.currentTarget.querySelector(".checkout-form__submit");
    const paymentForm = new FormData(event.currentTarget);
    const payment = paymentForm.get("payment");
    
    if(!payment) {
      Toast.show("Selecione uma forma de pagamento.", "error");
      return;
    }

    if(submitButton) submitButton.classList.add("is-loading");
    
    setTimeout(() => {
      if(submitButton) submitButton.classList.remove("is-loading");
      Toast.show(`Pagamento via ${payment} processado. Plano ${selectedPlan.textContent} reservado!`, "success");
    }, 2500);
  });
}

let activeFilter = "all";

function normalizeText(value) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function getCatalogElements() {
  return {
    searchInput: document.querySelector("#profile-search"),
    profileCards: document.querySelectorAll(".profile-card[data-search]"),
    resultCount: document.querySelector("#result-count"),
    emptyState: document.querySelector("#empty-state"),
    sortProfiles: document.querySelector("#sort-profiles"),
    filterSelects: document.querySelectorAll(".filter-bar select:not(#sort-profiles)"),
    filterSummaryText: document.querySelector("#filter-summary-text"),
  };
}

function getSelectTerms() {
  const { filterSelects } = getCatalogElements();
  const placeholderTerms = ["cidade", "bairro", "idade", "categoria", "preco", "disponibilidade", "estado", "perfil", "servico", "serviÃ§o", "pagamento", "identidade", "viagem", "featured", "new", "views"];

  return Array.from(filterSelects)
    .map((select) => normalizeText(select.value))
    .filter((value) => !placeholderTerms.includes(value))
    .map((value) => {
      if (value === "online agora") {
        return "online";
      }
      if (value === "disponivel sob consulta") {
        return "disponivel sob consulta";
      }
      return value;
    });
}

function updateFilterSummary(visibleCount) {
  const { filterSummaryText } = getCatalogElements();

  if (!filterSummaryText) {
    return;
  }

  const selectedTerms = getSelectTerms();
  const activeChip = document.querySelector(".quick-chip.is-active, .sidebar-filter.is-active");
  const activeChipLabel = activeFilter !== "all" && activeChip ? activeChip.textContent.trim() : "";
  const pieces = [...selectedTerms, activeChipLabel].filter(Boolean);

  filterSummaryText.textContent = pieces.length
    ? `${pieces.join(" · ")} · ${visibleCount} perfis`
    : `Todos os perfis · ${visibleCount} perfis`;
}

function filterProfiles() {
  const { searchInput, profileCards, resultCount, emptyState } = getCatalogElements();
  if (!searchInput && !profileCards.length) {
    return;
  }

  const term = searchInput ? normalizeText(searchInput.value.trim()) : "";
  const selectTerms = getSelectTerms();
  let visibleCount = 0;

  profileCards.forEach((card) => {
    const searchable = normalizeText(`${card.dataset.search} ${card.dataset.tags}`);
    const tagTerms = normalizeText(card.dataset.tags || "");
    const normalizedFilter = normalizeText(activeFilter);
    const matchesSearch = searchable.includes(term);
    const matchesFilter = activeFilter === "all" || tagTerms.includes(normalizedFilter);
    const matchesSelects = selectTerms.every((selectTerm) => searchable.includes(selectTerm));
    const match = matchesSearch && matchesFilter && matchesSelects;
    card.hidden = !match;

    if (match) {
      visibleCount += 1;
    }
  });

  if (resultCount) {
    resultCount.textContent = String(visibleCount);
  }

  if (emptyState) {
    emptyState.hidden = visibleCount > 0;
  }

  updateFilterSummary(visibleCount);
}

let catalogRefreshTimer;

function scheduleCatalogRefresh() {
  window.clearTimeout(catalogRefreshTimer);
  catalogRefreshTimer = window.setTimeout(() => {
    filterProfiles();
  }, 0);
}

function resetCatalogFilters() {
  const { searchInput, filterSelects } = getCatalogElements();
  activeFilter = "all";
  if (searchInput) {
    searchInput.value = "";
  }
  filterSelects.forEach((select) => {
    select.selectedIndex = 0;
  });
  document.querySelectorAll(".quick-chip, .sidebar-filter").forEach((item) => item.classList.remove("is-active"));
  document.querySelector('.quick-chip[data-filter="all"]')?.classList.add("is-active");
  document.querySelector('.sidebar-filter[data-filter="all"]')?.classList.add("is-active");
  filterProfiles();
}

document.addEventListener("input", (event) => {
  if (event.target?.closest?.("#profile-search")) {
    filterProfiles();
  }
});

document.addEventListener("change", (event) => {
  const select = event.target?.closest?.(".filter-bar select");
  if (select) {
    const catalogControls = document.querySelector("#catalog-controls");
    const filterToggle = document.querySelector("#filter-toggle");
    catalogControls?.classList.remove("is-collapsed");
    filterToggle?.setAttribute("aria-expanded", "true");
    filterProfiles();
  }
});

document.addEventListener("click", (event) => {
  const chip = event.target.closest(".quick-chip, .sidebar-filter");
  if (chip) {
    event.preventDefault();
    document.querySelectorAll(".quick-chip, .sidebar-filter").forEach((item) => item.classList.remove("is-active"));
    chip.classList.add("is-active");
    activeFilter = chip.dataset.filter || "all";
    filterProfiles();
    return;
  }

  if (event.target.closest(".js-clear-filters")) {
    event.preventDefault();
    resetCatalogFilters();
    return;
  }

  const filterToggle = event.target.closest("#filter-toggle");
  const catalogControls = document.querySelector("#catalog-controls");
  if (filterToggle && catalogControls) {
    const isCollapsed = catalogControls.classList.toggle("is-collapsed");
    filterToggle.setAttribute("aria-expanded", String(!isCollapsed));
  }
});

document.addEventListener("change", (event) => {
  const sortProfiles = event.target?.closest?.("#sort-profiles");
  if (sortProfiles) {
    const sortKey = sortProfiles.value;
    document.querySelectorAll(".profile-grid").forEach((grid) => {
      const sortedCards = Array.from(grid.querySelectorAll(".profile-card")).sort(
        (a, b) => Number(b.dataset[sortKey]) - Number(a.dataset[sortKey]),
      );
      sortedCards.forEach((card) => grid.appendChild(card));
    });
  }
});

window.addEventListener("pageshow", scheduleCatalogRefresh);
window.addEventListener("popstate", scheduleCatalogRefresh);
document.addEventListener("DOMContentLoaded", scheduleCatalogRefresh);

if (document.body) {
  const catalogObserver = new MutationObserver((mutations) => {
    const shouldRefresh = mutations.some((mutation) =>
      Array.from(mutation.addedNodes).some((node) =>
        node.nodeType === 1 && node.querySelector?.("#profile-search, .profile-card[data-search], #filter-summary-text"),
      ),
    );

    if (shouldRefresh) {
      scheduleCatalogRefresh();
    }
  });

  catalogObserver.observe(document.body, { childList: true, subtree: true });
}

scheduleCatalogRefresh();

document.querySelectorAll(".favorite-button").forEach((button) => {
  button.setAttribute("aria-pressed", String(button.classList.contains("is-active")));

  button.addEventListener("click", () => {
    button.classList.toggle("is-active");
    const active = button.classList.contains("is-active");
    button.setAttribute("aria-pressed", String(active));
    if (button.classList.contains("favorite-button--wide")) {
      button.textContent = active ? "Favoritado" : "Favoritar";
    }
  });
});

const stepItems = document.querySelectorAll(".step-item");
const progress = document.querySelector("#signup-progress");
const modelTypeSelect = document.querySelector("#model-type");
const modelFieldsets = document.querySelectorAll(".model-fields[data-profile-type]");

stepItems.forEach((item) => {
  item.addEventListener("click", () => {
    stepItems.forEach((step) => step.classList.remove("is-active"));
    item.classList.add("is-active");
    progress.style.width = `${Number(item.dataset.step) * 20}%`;
  });
});

function updateModelFields() {
  if (!modelTypeSelect) {
    return;
  }

  modelFieldsets.forEach((fieldset) => {
    const isSelected = fieldset.dataset.profileType === modelTypeSelect.value;
    fieldset.hidden = !isSelected;
    fieldset.querySelectorAll("input, select, textarea").forEach((field) => {
      field.disabled = !isSelected;
    });
  });
}

modelTypeSelect?.addEventListener("change", updateModelFields);
updateModelFields();

const galleryMain = document.querySelector("#profile-gallery-main");
const galleryThumbs = document.querySelectorAll(".gallery-thumb[data-media]");
const mediaCounter = document.querySelector(".media-counter");
const galleryZoom = document.querySelector(".gallery-zoom");
const galleryPrev = document.querySelector(".gallery-nav--prev");
const galleryNext = document.querySelector(".gallery-nav--next");
const imageLightbox = document.querySelector("#image-lightbox");
const lightboxImage = imageLightbox?.querySelector("img");
const lightboxClose = imageLightbox?.querySelector(".image-lightbox__close");

function setGalleryIndex(index) {
  if (!galleryMain || !galleryThumbs.length) {
    return;
  }

  const normalizedIndex = (index + galleryThumbs.length) % galleryThumbs.length;
  const thumb = galleryThumbs[normalizedIndex];

  galleryThumbs.forEach((item) => item.classList.remove("is-active"));
  thumb.classList.add("is-active");
  galleryMain.src = thumb.dataset.media;
  galleryMain.alt = thumb.dataset.alt || "MÃ­dia do perfil";

  if (mediaCounter) {
    mediaCounter.textContent = `${normalizedIndex + 1} / ${galleryThumbs.length}`;
  }
}

galleryThumbs.forEach((thumb, index) => {
  thumb.addEventListener("click", () => setGalleryIndex(index));
});

galleryPrev?.addEventListener("click", () => {
  const currentIndex = Array.from(galleryThumbs).findIndex((thumb) => thumb.classList.contains("is-active"));
  setGalleryIndex(currentIndex - 1);
});

galleryNext?.addEventListener("click", () => {
  const currentIndex = Array.from(galleryThumbs).findIndex((thumb) => thumb.classList.contains("is-active"));
  setGalleryIndex(currentIndex + 1);
});

function closeLightbox() {
  imageLightbox?.classList.remove("is-open");
  if (imageLightbox) {
    imageLightbox.hidden = true;
  }
}

galleryZoom?.addEventListener("click", () => {
  if (!imageLightbox || !lightboxImage || !galleryMain) {
    return;
  }

  lightboxImage.src = galleryMain.src;
  lightboxImage.alt = galleryMain.alt;
  imageLightbox.hidden = false;
  imageLightbox.classList.add("is-open");
});

lightboxClose?.addEventListener("click", closeLightbox);

imageLightbox?.addEventListener("click", (event) => {
  if (event.target === imageLightbox) {
    closeLightbox();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeLightbox();
  }
});

// ==========================================================================
// Proteção e Privacidade
// ==========================================================================

// 1. Anti-Scraping / Proteção de Mídia
document.addEventListener('contextmenu', (e) => {
  if (e.target.tagName === 'IMG' || e.target.tagName === 'VIDEO') {
    e.preventDefault();
    Toast.show('Proteção de privacidade ativa. Download não permitido.', 'info');
  }
});

document.addEventListener('dragstart', (e) => {
  if (e.target.tagName === 'IMG' || e.target.tagName === 'VIDEO') {
    e.preventDefault();
  }
});

// 2. Ocultar e Proteger WhatsApp
document.querySelectorAll('a[href^="https://wa.me"]').forEach(link => {
  const originalHref = link.href;
  const isMobileContact = link.classList.contains('mobile-contact');
  
  link.setAttribute('data-href', originalHref);
  link.removeAttribute('href');
  link.removeAttribute('target');
  
  if (isMobileContact || link.classList.contains('button--primary')) {
    link.textContent = 'Revelar WhatsApp';
  } else {
    link.textContent = 'Ver Contato';
  }
  
  link.addEventListener('click', function(e) {
    if (!this.hasAttribute('href')) {
      e.preventDefault();
      const originalText = this.textContent;
      this.textContent = 'Desbloqueando...';
      this.classList.add('is-loading');
      
      setTimeout(() => {
        this.classList.remove('is-loading');
        this.setAttribute('href', originalHref);
        this.setAttribute('target', '_blank');
        
        // Formatar texto visÃ­vel
        if (isMobileContact || link.classList.contains('button--primary')) {
          this.textContent = 'Chamar no WhatsApp';
        } else {
          this.textContent = 'WhatsApp';
        }

        Toast.show('Contato revelado. Redirecionando para o WhatsApp.', 'success');
        
        // Delay para permitir leitura do toast
        setTimeout(() => {
          window.open(originalHref, '_blank');
        }, 1200);

      }, 1000);
    }
  });
});

