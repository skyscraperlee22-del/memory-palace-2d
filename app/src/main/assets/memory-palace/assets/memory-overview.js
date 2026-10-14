(() => {
  const STORAGE_KEY = "pico-spatial-builder-v3";
  const ENTER_THRESHOLD = 240;
  const EXIT_THRESHOLD = 120;
  const pinchPointers = new Map();
  let outwardTravel = 0;
  let overviewInwardTravel = 0;
  let lastPinchDistance = 0;
  let overviewGestureArmed = false;
  let armOnGestureEnd = false;
  let pinchCanEnterOverview = false;
  let pinchGestureHadOutward = false;
  let suppressPinchUntilRelease = false;
  let wheelIdleTimer = 0;
  let wheelGestureHadOutward = false;
  let isOpen = false;
  let controlsWereEnabled = true;
  let activeColor = "all";
  const COLOR_GROUPS = {
    living: { key: "aqua", label: "Home", color: "#4fc7c4" },
    office: { key: "violet", label: "Office", color: "#9a78dc" },
    school: { key: "coral", label: "School", color: "#ee7065" },
    mall: { key: "gold", label: "Mall", color: "#e8b72f" },
    corridor: { key: "neutral", label: "Neutral", color: "#aab5bd" },
  };
  const IS_OVERVIEW_PREVIEW =
    (location.hostname === "localhost" || location.hostname === "127.0.0.1") &&
    new URLSearchParams(location.search).has("overview-preview");
  const PREVIEW_MEMORIES = [
    { type: "todo", content: "Water the flowers", dueDate: "2026-08-03", dueTime: "18:00", assetId: "living-plant", category: "living" },
    { type: "memory", content: "I put my student ID in the drawer", assetId: "school-id-badge", category: "school" },
    { type: "todo", content: "Big sale starts tonight", dueDate: "2026-08-08", assetId: "mall-queue-barrier", category: "mall" },
    { type: "memory", content: "The round table is beside the window", assetId: "living-round-table", category: "living" },
    { type: "memory", content: "Project notes are in the violet binders", assetId: "office-binders", category: "office" },
    { type: "memory", content: "The monitor is ready for class", assetId: "school-monitor", category: "school" },
  ];

  const overlay = document.createElement("section");
  overlay.className = "memory-overview";
  overlay.setAttribute("aria-hidden", "true");
  overlay.innerHTML = `
    <header class="memory-overview__header">
      <div class="memory-overview__heading">
        <span class="memory-overview__eyebrow">Current floor</span>
        <div class="memory-overview__title-line">
          <h1 class="memory-overview__title">Memory overview</h1>
          <span class="memory-overview__count" aria-live="polite"></span>
        </div>
        <nav class="memory-overview__floors" aria-label="Switch floor"></nav>
      </div>
    </header>
    <div class="memory-overview__summary">
      <span class="memory-overview__filter-label">Spaces</span>
      <div class="memory-overview__filters" aria-label="Filter memories by model color"></div>
    </div>
    <div class="memory-overview__grid"></div>
  `;
  document.body.appendChild(overlay);

  const title = overlay.querySelector(".memory-overview__title");
  const floorSwitcher = overlay.querySelector(".memory-overview__floors");
  const count = overlay.querySelector(".memory-overview__count");
  const filters = overlay.querySelector(".memory-overview__filters");
  const grid = overlay.querySelector(".memory-overview__grid");

  const readState = () => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    } catch {
      return {};
    }
  };

  const text = (value) => String(value ?? "");

  const categoryFor = (assetId) => {
    const category = text(assetId).split("-")[0];
    return COLOR_GROUPS[category] ? category : "corridor";
  };

  const refreshAfterFloorSwitch = (floorId, attempt = 0) => {
    if (readState().activeFloorId === floorId || attempt >= 6) {
      renderOverview();
      return;
    }

    window.setTimeout(() => refreshAfterFloorSwitch(floorId, attempt + 1), 30);
  };

  const switchFloor = (floorId) => {
    const floorItem = [...document.querySelectorAll(".level-item")].find(
      (item) => item.dataset.floorId === floorId,
    );
    if (!floorItem) return;

    activeColor = "all";
    floorItem.click();
    refreshAfterFloorSwitch(floorId);
  };

  const renderFloorSwitcher = (floors, activeFloor) => {
    floorSwitcher.replaceChildren();

    floors.forEach((floor, index) => {
      const isActive = floor.id === activeFloor?.id;
      const button = document.createElement("button");
      button.className = "memory-overview__floor";
      button.type = "button";
      button.classList.toggle("is-active", isActive);
      button.dataset.floorId = floor.id;
      button.setAttribute("aria-label", `Switch to ${text(floor.label) || `Floor ${index + 1}`}`);

      const number = document.createElement("span");
      number.className = "memory-overview__floor-number";
      number.textContent = String(index + 1);

      const label = document.createElement("span");
      label.className = "memory-overview__floor-label";
      label.textContent = text(floor.label) || `Floor ${index + 1}`;

      button.append(number, label);
      button.addEventListener("pointerdown", (event) => {
        event.preventDefault();
      });
      button.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        document.activeElement?.blur?.();
        switchFloor(floor.id);
      });
      floorSwitcher.appendChild(button);
    });

    floorSwitcher.querySelector(".is-active")?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "nearest",
    });
  };

  const createModelPreview = (memory) => {
    const preview = document.createElement("span");
    preview.className = "memory-overview__model";
    preview.classList.add(`memory-overview__model--${memory.assetId}`);
    preview.setAttribute("aria-hidden", "true");

    if (memory.category === "corridor") {
      const wall = document.createElement("span");
      wall.className = "memory-overview__wall-preview";
      preview.appendChild(wall);
      return preview;
    }

    const image = document.createElement("img");
    image.src = `thumbnails/${memory.category}/${memory.assetId}.png`;
    image.alt = "";
    image.draggable = false;
    preview.appendChild(image);
    return preview;
  };

  const renderFilters = (memories) => {
    const available = new Map();
    memories.forEach((memory) => {
      const group = COLOR_GROUPS[memory.category];
      available.set(group.key, group);
    });

    if (activeColor !== "all" && !available.has(activeColor)) activeColor = "all";
    filters.replaceChildren();

    const options = [{ key: "all", label: "All", color: "currentColor" }, ...available.values()];
    options.forEach((option) => {
      const button = document.createElement("button");
      button.className = "memory-overview__filter";
      button.type = "button";
      button.dataset.color = option.key;
      button.classList.toggle("is-active", activeColor === option.key);
      button.setAttribute("aria-pressed", String(activeColor === option.key));
      button.setAttribute("aria-label", option.key === "all" ? "Show all colors" : `Show ${option.label} models`);
      button.innerHTML = `
        <span class="memory-overview__swatch" style="--swatch:${option.color}" aria-hidden="true"></span>
        <span>${option.label}</span>
      `;
      button.addEventListener("click", () => {
        activeColor = option.key;
        renderOverview();
      });
      filters.appendChild(button);
    });
  };

  const renderOverview = () => {
    const state = readState();
    const floors = Array.isArray(state.floors) ? state.floors : [];
    const objects = Array.isArray(state.objects) ? state.objects : [];
    const activeFloor = floors.find((floor) => floor.id === state.activeFloorId) || floors[0];
    const floorObjects = objects.filter((object) => object.floorId === activeFloor?.id);
    let memories = floorObjects.flatMap((object) =>
      (Array.isArray(object.notes) ? object.notes : []).map((note) => ({
        ...note,
        assetId: object.assetId,
        category: categoryFor(object.assetId),
      })),
    );
    if (IS_OVERVIEW_PREVIEW && !memories.length) memories = PREVIEW_MEMORIES;

    title.textContent = activeFloor?.label || "Memory overview";
    renderFloorSwitcher(floors, activeFloor);
    renderFilters(memories);
    const visibleMemories = memories.filter(
      (memory) => activeColor === "all" || COLOR_GROUPS[memory.category].key === activeColor,
    );
    count.textContent =
      activeColor === "all"
        ? `${memories.length} ${memories.length === 1 ? "memory" : "memories"} on this floor`
        : `${visibleMemories.length} of ${memories.length} memories`;
    grid.replaceChildren();

    if (!visibleMemories.length) {
      const empty = document.createElement("div");
      empty.className = "memory-overview__empty";
      empty.innerHTML = `
        <span class="memory-overview__empty-icon" aria-hidden="true">⌁</span>
        <strong>${memories.length ? "No memories in this color" : "No memories here yet"}</strong>
        <span>${memories.length ? "Choose another color to keep browsing." : "Add a note to an object, then zoom out again."}</span>
      `;
      grid.appendChild(empty);
      return;
    }

    visibleMemories.forEach((memory, index) => {
      const card = document.createElement("article");
      const isTodo = memory.type === "todo";
      card.className = `memory-overview__card ${isTodo ? "is-todo" : "is-memory"}`;
      card.style.setProperty("--memory-index", index);
      card.style.setProperty("--model-color", COLOR_GROUPS[memory.category].color);

      const icon = document.createElement("span");
      icon.className = "memory-overview__type-icon";
      icon.setAttribute("aria-hidden", "true");
      icon.textContent = isTodo ? "✓" : "↓";

      const content = document.createElement("p");
      content.textContent = text(memory.content).trim() || "Untitled memory";

      const dueDate = text(memory.dueDate).trim();
      const dueTime = text(memory.dueTime).trim();
      const due = document.createElement("span");
      due.className = "memory-overview__due";
      due.textContent = [dueDate, dueTime].filter(Boolean).join(" · ");

      const heading = document.createElement("div");
      heading.className = "memory-overview__card-heading";
      heading.append(createModelPreview(memory), icon);

      const face = document.createElement("div");
      face.className = "memory-overview__card-face";
      face.append(heading, content);
      if (isTodo && due.textContent) face.append(due);
      card.append(face);
      grid.appendChild(card);
    });
  };

  const openOverview = () => {
    if (isOpen) return;
    isOpen = true;
    activeColor = "all";
    outwardTravel = 0;
    overviewGestureArmed = false;
    armOnGestureEnd = false;
    pinchCanEnterOverview = false;
    pinchGestureHadOutward = false;
    wheelGestureHadOutward = false;
    overviewInwardTravel = 0;
    renderOverview();
    const controls = window.__memoryPalaceControls;
    controlsWereEnabled = controls?.enabled !== false;
    if (controls) controls.enabled = false;
    overlay.setAttribute("aria-hidden", "false");
    document.documentElement.classList.add("memory-overview-active");
    requestAnimationFrame(() => requestAnimationFrame(() => overlay.classList.add("is-visible")));
  };

  const closeOverview = () => {
    if (!isOpen) return;
    isOpen = false;
    outwardTravel = 0;
    overviewGestureArmed = true;
    armOnGestureEnd = false;
    pinchCanEnterOverview = false;
    pinchGestureHadOutward = false;
    wheelGestureHadOutward = false;
    overviewInwardTravel = 0;
    if (!suppressPinchUntilRelease) {
      pinchPointers.clear();
      lastPinchDistance = 0;
    }
    overlay.classList.remove("is-visible");
    document.documentElement.classList.remove("memory-overview-active");
    overlay.setAttribute("aria-hidden", "true");
    const controls = window.__memoryPalaceControls;
    if (controls) controls.enabled = controlsWereEnabled;
  };

  const atMinimumFloorScale = () => {
    const controls = window.__memoryPalaceControls;
    if (!controls) return false;
    const distance =
      typeof controls.getDistance === "function"
        ? controls.getDistance()
        : window.__memoryPalaceCamera?.position?.distanceTo?.(controls.target);
    return Number.isFinite(distance) && distance >= controls.maxDistance - 0.18;
  };

  const resetOverviewGesture = () => {
    outwardTravel = 0;
    overviewGestureArmed = false;
    armOnGestureEnd = false;
    pinchCanEnterOverview = false;
    pinchGestureHadOutward = false;
    wheelGestureHadOutward = false;
  };

  const addOutwardTravel = (amount, event, canEnter) => {
    if (!atMinimumFloorScale()) {
      resetOverviewGesture();
      return;
    }
    if (!canEnter) {
      outwardTravel = 0;
      armOnGestureEnd = true;
      return;
    }
    outwardTravel += Math.max(0, amount);
    if (outwardTravel < ENTER_THRESHOLD) return;
    event?.preventDefault?.();
    event?.stopImmediatePropagation?.();
    openOverview();
  };

  document.addEventListener(
    "wheel",
    (event) => {
      if (isOpen) {
        event.preventDefault();
        event.stopImmediatePropagation();
        if (
          event.deltaY < -4 &&
          (event.ctrlKey || !grid.contains(event.target) || grid.scrollTop <= 0)
        ) {
          closeOverview();
          return;
        }
        const maxScroll = Math.max(0, grid.scrollHeight - grid.clientHeight);
        if (maxScroll > 0 && grid.contains(event.target)) {
          grid.scrollTop = Math.max(0, Math.min(maxScroll, grid.scrollTop + event.deltaY));
          return;
        }
        return;
      }
      window.clearTimeout(wheelIdleTimer);
      if (event.deltaY > 0) {
        wheelGestureHadOutward = true;
        addOutwardTravel(event.deltaY, event, overviewGestureArmed);
      } else {
        wheelGestureHadOutward = false;
        resetOverviewGesture();
      }
      wheelIdleTimer = window.setTimeout(() => {
        if ((armOnGestureEnd || wheelGestureHadOutward) && atMinimumFloorScale()) {
          overviewGestureArmed = true;
        }
        armOnGestureEnd = false;
        wheelGestureHadOutward = false;
        outwardTravel = 0;
      }, 180);
    },
    { capture: true, passive: false },
  );

  window.addEventListener(
    "pointerdown",
    (event) => {
      if (event.pointerType !== "touch") return;
      if (suppressPinchUntilRelease) {
        event.preventDefault();
        event.stopImmediatePropagation();
      }
      pinchPointers.set(event.pointerId, [event.clientX, event.clientY]);
      if (pinchPointers.size === 2) {
        const [first, second] = [...pinchPointers.values()];
        lastPinchDistance = Math.hypot(first[0] - second[0], first[1] - second[1]);
        if (isOpen) {
          suppressPinchUntilRelease = true;
          event.preventDefault();
          event.stopImmediatePropagation();
          overviewInwardTravel = 0;
          if (boardDrag && grid.hasPointerCapture?.(boardDrag.pointerId)) {
            grid.releasePointerCapture(boardDrag.pointerId);
          }
          boardDrag = null;
          grid.classList.remove("is-dragging");
          return;
        }
        pinchCanEnterOverview = overviewGestureArmed && atMinimumFloorScale();
        if (pinchCanEnterOverview) {
          suppressPinchUntilRelease = true;
          event.preventDefault();
          event.stopImmediatePropagation();
        }
        pinchGestureHadOutward = false;
        armOnGestureEnd = false;
        outwardTravel = 0;
      }
    },
    { capture: true, passive: false },
  );

  window.addEventListener(
    "pointermove",
    (event) => {
      if (suppressPinchUntilRelease) {
        event.preventDefault();
        event.stopImmediatePropagation();
      }
      if (!pinchPointers.has(event.pointerId)) return;
      pinchPointers.set(event.pointerId, [event.clientX, event.clientY]);
      if (pinchPointers.size !== 2) return;
      const [first, second] = [...pinchPointers.values()];
      const distance = Math.hypot(first[0] - second[0], first[1] - second[1]);
      if (isOpen) {
        event.preventDefault();
        event.stopImmediatePropagation();
        if (lastPinchDistance && distance > lastPinchDistance) {
          overviewInwardTravel += (distance - lastPinchDistance) * 5;
          if (overviewInwardTravel >= EXIT_THRESHOLD) {
            event.preventDefault();
            event.stopImmediatePropagation();
            closeOverview();
            return;
          }
        } else if (lastPinchDistance && distance < lastPinchDistance) {
          overviewInwardTravel = Math.max(
            0,
            overviewInwardTravel - (lastPinchDistance - distance) * 2,
          );
        }
        lastPinchDistance = distance;
        return;
      }
      if (lastPinchDistance && lastPinchDistance > distance) {
        pinchGestureHadOutward = true;
        addOutwardTravel((lastPinchDistance - distance) * 5, event, pinchCanEnterOverview);
      } else if (lastPinchDistance && distance > lastPinchDistance && !atMinimumFloorScale()) {
        resetOverviewGesture();
      }
      lastPinchDistance = distance;
    },
    { capture: true, passive: false },
  );

  const endPointer = (event) => {
    if (suppressPinchUntilRelease) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
    pinchPointers.delete(event.pointerId);
    if (pinchPointers.size < 2) {
      overviewInwardTravel = 0;
      if (!isOpen) {
        if ((armOnGestureEnd || pinchGestureHadOutward) && atMinimumFloorScale()) {
        overviewGestureArmed = true;
        }
        armOnGestureEnd = false;
        pinchCanEnterOverview = false;
        pinchGestureHadOutward = false;
        outwardTravel = 0;
      }
      lastPinchDistance = 0;
    }
    if (pinchPointers.size === 0) {
      suppressPinchUntilRelease = false;
    }
  };
  window.addEventListener("pointerup", endPointer, { capture: true, passive: false });
  window.addEventListener("pointercancel", endPointer, { capture: true, passive: false });

  let boardDrag = null;
  grid.addEventListener("pointerdown", (event) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    boardDrag = {
      pointerId: event.pointerId,
      startY: event.clientY,
      scrollTop: grid.scrollTop,
      moved: false,
    };
    grid.setPointerCapture?.(event.pointerId);
  });
  grid.addEventListener(
    "pointermove",
    (event) => {
      if (!boardDrag || boardDrag.pointerId !== event.pointerId) return;
      const distance = event.clientY - boardDrag.startY;
      if (Math.abs(distance) < 4 && !boardDrag.moved) return;
      boardDrag.moved = true;
      grid.classList.add("is-dragging");
      grid.scrollTop = boardDrag.scrollTop - distance;
      event.preventDefault();
    },
    { passive: false },
  );
  const endBoardDrag = (event) => {
    if (!boardDrag || boardDrag.pointerId !== event.pointerId) return;
    grid.releasePointerCapture?.(event.pointerId);
    grid.classList.remove("is-dragging");
    boardDrag = null;
  };
  grid.addEventListener("pointerup", endBoardDrag);
  grid.addEventListener("pointercancel", endBoardDrag);

  window.addEventListener("storage", () => {
    if (isOpen) renderOverview();
  });
  window.__memoryPalaceOverview = {
    open: openOverview,
    close: closeOverview,
    isOpen: () => isOpen,
  };
  if (IS_OVERVIEW_PREVIEW) {
    window.setTimeout(openOverview, 300);
  }
})();
