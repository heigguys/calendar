const STORAGE_KEY = "clario-calendar-events-v1";
const VIEW_NAMES = new Set(["calendar", "tasks", "stats", "profile"]);
const CATEGORY_CLASS = {
  "工作": "accent-coral",
  "设计": "accent-gold",
  "生活": "accent-sky",
  "学习": "accent-mint"
};

const monthTitle = document.getElementById("monthTitle");
const todayDate = document.getElementById("todayDate");
const todayWeekday = document.getElementById("todayWeekday");
const dateCardLabel = document.getElementById("dateCardLabel");
const heroEyebrow = document.getElementById("heroEyebrow");
const heroTitle = document.getElementById("heroTitle");
const eventCount = document.getElementById("eventCount");
const eventCountLabel = document.getElementById("eventCountLabel");
const calendarGrid = document.getElementById("calendarGrid");
const prevMonth = document.getElementById("prevMonth");
const nextMonth = document.getElementById("nextMonth");
const jumpToday = document.getElementById("jumpToday");
const agendaTitle = document.getElementById("agendaTitle");
const agendaList = document.getElementById("agendaList");
const agendaEmpty = document.getElementById("agendaEmpty");
const allTasksList = document.getElementById("allTasksList");
const tasksEmpty = document.getElementById("tasksEmpty");
const taskCountPill = document.getElementById("taskCountPill");
const statsTotal = document.getElementById("statsTotal");
const statsMonth = document.getElementById("statsMonth");
const statsToday = document.getElementById("statsToday");
const categoryStats = document.getElementById("categoryStats");
const statsEmpty = document.getElementById("statsEmpty");
const nextEventText = document.getElementById("nextEventText");
const selectedDateText = document.getElementById("selectedDateText");
const openEventForm = document.getElementById("openEventForm");
const cancelEventForm = document.getElementById("cancelEventForm");
const eventForm = document.getElementById("eventForm");
const formError = document.getElementById("formError");
const eventTitleInput = document.getElementById("eventTitle");
const eventDateInput = document.getElementById("eventDate");
const eventStartInput = document.getElementById("eventStart");
const eventEndInput = document.getElementById("eventEnd");
const eventCategoryInput = document.getElementById("eventCategory");
const eventDescriptionInput = document.getElementById("eventDescription");
const navButtons = Array.from(document.querySelectorAll(".nav-item"));
const viewPanels = Array.from(document.querySelectorAll(".view-panel"));
const VIEW_META = {
  calendar: { eyebrow: "我的日历 App", title: "日历" },
  tasks: { eyebrow: "全部已创建日程", title: "任务" },
  stats: { eyebrow: "日程数据概览", title: "统计" },
  profile: { eyebrow: "本地保存与个人概览", title: "我的" }
};

const today = startOfDay(new Date());
const state = {
  selectedDate: today,
  displayedMonth: new Date(today.getFullYear(), today.getMonth(), 1),
  currentView: getViewFromHash(),
  events: loadEvents()
};

const fullDateFormatter = new Intl.DateTimeFormat("zh-CN", {
  year: "numeric",
  month: "long",
  day: "numeric",
  weekday: "long"
});

const monthDayFormatter = new Intl.DateTimeFormat("zh-CN", {
  month: "numeric",
  day: "numeric"
});

const weekdayFormatter = new Intl.DateTimeFormat("zh-CN", {
  weekday: "long"
});

function startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function getDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseDateKey(dateKey) {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function getViewFromHash() {
  const nextView = window.location.hash.replace("#", "");
  return VIEW_NAMES.has(nextView) ? nextView : "calendar";
}

function loadEvents() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(isValidEvent) : [];
  } catch (error) {
    return [];
  }
}

function saveEvents() {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state.events));
  } catch (error) {
    showFormError("保存失败，请确认浏览器允许本地存储。");
  }
}

function isValidEvent(item) {
  return Boolean(
    item &&
      typeof item.id === "string" &&
      typeof item.title === "string" &&
      typeof item.date === "string" &&
      typeof item.start === "string" &&
      typeof item.end === "string" &&
      typeof item.category === "string"
  );
}

function compareEvents(left, right) {
  const leftValue = `${left.date} ${left.start}`;
  const rightValue = `${right.date} ${right.start}`;
  return leftValue.localeCompare(rightValue);
}

function getEventsForDate(date) {
  const dateKey = getDateKey(date);
  return state.events
    .filter((item) => item.date === dateKey)
    .sort(compareEvents);
}

function getMonthEvents(date) {
  const year = date.getFullYear();
  const month = date.getMonth();
  return state.events.filter((item) => {
    const current = parseDateKey(item.date);
    return current.getFullYear() === year && current.getMonth() === month;
  });
}

function formatCardDate(date) {
  return monthDayFormatter.format(date).replace("/", " / ");
}

function formatSelectedDateLabel(date) {
  return fullDateFormatter.format(date).replace(/\s/g, "");
}

function updateTodayCard() {
  const isToday = getDateKey(state.selectedDate) === getDateKey(today);
  const selectedEvents = getEventsForDate(state.selectedDate);

  dateCardLabel.textContent = isToday ? "今天" : "已选日期";
  todayDate.textContent = formatCardDate(state.selectedDate);
  todayWeekday.textContent = weekdayFormatter.format(state.selectedDate);
  eventCount.textContent = String(selectedEvents.length);
  eventCountLabel.textContent = selectedEvents.length === 1 ? "个日程" : "个日程";
  agendaTitle.textContent = isToday ? "今天的日程" : `${formatCardDate(state.selectedDate)} 的日程`;
  selectedDateText.textContent = formatSelectedDateLabel(state.selectedDate);
}

function createDayCell(date, muted) {
  const button = document.createElement("button");
  const dateKey = getDateKey(date);
  const hasEvents = state.events.some((item) => item.date === dateKey);
  const isToday = dateKey === getDateKey(today);
  const isSelected = dateKey === getDateKey(state.selectedDate);

  button.type = "button";
  button.className = "day-cell";
  button.setAttribute("aria-label", formatSelectedDateLabel(date));

  if (muted) {
    button.classList.add("muted");
  }

  if (isToday) {
    button.classList.add("today");
  }

  if (isSelected) {
    button.classList.add("selected");
  }

  if (hasEvents) {
    button.classList.add("has-events");
  }

  const number = document.createElement("span");
  number.className = "day-number";
  number.textContent = String(date.getDate());
  button.appendChild(number);

  if (hasEvents) {
    const dot = document.createElement("span");
    dot.className = "event-dot";
    dot.setAttribute("aria-hidden", "true");
    button.appendChild(dot);
  }

  button.addEventListener("click", () => {
    state.selectedDate = startOfDay(date);
    state.displayedMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    renderApp();
  });

  return button;
}

function renderCalendar() {
  calendarGrid.innerHTML = "";
  monthTitle.textContent = `${state.displayedMonth.getFullYear()} / ${state.displayedMonth.getMonth() + 1}`;

  const year = state.displayedMonth.getFullYear();
  const month = state.displayedMonth.getMonth();
  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();
  const offset = (firstDay.getDay() + 6) % 7;

  for (let index = offset - 1; index >= 0; index -= 1) {
    calendarGrid.appendChild(createDayCell(new Date(year, month - 1, daysInPrevMonth - index), true));
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    calendarGrid.appendChild(createDayCell(new Date(year, month, day), false));
  }

  const remainder = calendarGrid.children.length % 7;
  const trailingDays = remainder === 0 ? 0 : 7 - remainder;

  for (let day = 1; day <= trailingDays; day += 1) {
    calendarGrid.appendChild(createDayCell(new Date(year, month + 1, day), true));
  }
}

function renderAgenda() {
  const selectedEvents = getEventsForDate(state.selectedDate);
  agendaList.innerHTML = "";
  agendaEmpty.hidden = selectedEvents.length > 0;

  selectedEvents.forEach((item) => {
    agendaList.appendChild(createEventCard(item));
  });
}

function renderTasks() {
  const sortedEvents = [...state.events].sort(compareEvents);
  allTasksList.innerHTML = "";
  tasksEmpty.hidden = sortedEvents.length > 0;
  taskCountPill.textContent = `${sortedEvents.length} 条`;

  sortedEvents.forEach((item) => {
    allTasksList.appendChild(createEventCard(item, true));
  });
}

function renderStats() {
  const total = state.events.length;
  const currentMonthCount = getMonthEvents(state.displayedMonth).length;
  const todayCountValue = getEventsForDate(today).length;
  const categories = new Map();

  state.events.forEach((item) => {
    categories.set(item.category, (categories.get(item.category) || 0) + 1);
  });

  statsTotal.textContent = String(total);
  statsMonth.textContent = String(currentMonthCount);
  statsToday.textContent = String(todayCountValue);

  categoryStats.innerHTML = "";
  statsEmpty.hidden = categories.size > 0;

  Array.from(categories.entries())
    .sort((left, right) => right[1] - left[1])
    .forEach(([name, value]) => {
      const row = document.createElement("article");
      row.className = "stat-row";
      row.innerHTML = `
        <div>
          <p class="stat-name">${name}</p>
          <p class="stat-note">${value} 条日程</p>
        </div>
        <strong>${value}</strong>
      `;
      categoryStats.appendChild(row);
    });
}

function renderProfile() {
  const nowValue = Date.now();
  const upcoming = [...state.events]
    .sort(compareEvents)
    .find((item) => {
      const eventTime = new Date(`${item.date}T${item.start}:00`).getTime();
      return eventTime >= nowValue;
    });

  if (!upcoming) {
    nextEventText.textContent = "还没有即将开始的日程。";
    return;
  }

  nextEventText.textContent = `${upcoming.title} · ${upcoming.date} ${upcoming.start}-${upcoming.end}`;
}

function renderViews() {
  const viewMeta = VIEW_META[state.currentView] || VIEW_META.calendar;

  heroEyebrow.textContent = viewMeta.eyebrow;
  heroTitle.textContent = viewMeta.title;

  viewPanels.forEach((panel) => {
    const isActive = panel.dataset.view === state.currentView;
    panel.hidden = !isActive;
  });

  navButtons.forEach((button) => {
    const isActive = button.dataset.view === state.currentView;
    button.classList.toggle("active", isActive);
    button.setAttribute("aria-current", isActive ? "page" : "false");
  });
}

function renderApp() {
  updateTodayCard();
  renderCalendar();
  renderAgenda();
  renderTasks();
  renderStats();
  renderProfile();
  renderViews();
}

function createEventCard(item, showDate = false) {
  const article = document.createElement("article");
  const accentClass = CATEGORY_CLASS[item.category] || "accent-coral";
  const description = item.description ? item.description : "未填写备注";

  article.className = `agenda-item ${accentClass}`;
  article.innerHTML = `
    <div class="item-content">
      <div class="item-top">
        <p class="agenda-time">${item.start} - ${item.end}</p>
        ${showDate ? `<span class="item-date">${item.date}</span>` : ""}
      </div>
      <h4>${escapeHtml(item.title)}</h4>
      <p class="item-description">${escapeHtml(description)}</p>
    </div>
    <span class="agenda-tag">${escapeHtml(item.category)}</span>
  `;

  return article;
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll("\"", "&quot;")
    .replaceAll("'", "&#39;");
}

function openForm() {
  formError.hidden = true;
  formError.textContent = "";
  eventDateInput.value = getDateKey(state.selectedDate);
  eventStartInput.value = "09:00";
  eventEndInput.value = "10:00";
  eventCategoryInput.value = "工作";
  eventDescriptionInput.value = "";
  eventTitleInput.value = "";
  eventForm.hidden = false;
  eventTitleInput.focus();
}

function closeForm() {
  eventForm.hidden = true;
  formError.hidden = true;
  formError.textContent = "";
  eventForm.reset();
}

function createEvent(formData) {
  return {
    id: `event-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
    title: formData.get("title").trim(),
    date: formData.get("date"),
    start: formData.get("start"),
    end: formData.get("end"),
    category: formData.get("category"),
    description: formData.get("description").trim()
  };
}

function showFormError(message) {
  formError.hidden = false;
  formError.textContent = message;
}

prevMonth.addEventListener("click", () => {
  state.displayedMonth = new Date(
    state.displayedMonth.getFullYear(),
    state.displayedMonth.getMonth() - 1,
    1
  );
  renderApp();
});

nextMonth.addEventListener("click", () => {
  state.displayedMonth = new Date(
    state.displayedMonth.getFullYear(),
    state.displayedMonth.getMonth() + 1,
    1
  );
  renderApp();
});

jumpToday.addEventListener("click", () => {
  state.selectedDate = today;
  state.displayedMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  state.currentView = "calendar";
  window.location.hash = "calendar";
  renderApp();
});

openEventForm.addEventListener("click", () => {
  state.currentView = "calendar";
  renderViews();
  openForm();
});

cancelEventForm.addEventListener("click", () => {
  closeForm();
});

eventForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = new FormData(eventForm);
  const createdEvent = createEvent(formData);

  if (!createdEvent.title) {
    showFormError("请先填写日程标题。");
    return;
  }

  if (!createdEvent.date || !createdEvent.start || !createdEvent.end) {
    showFormError("请把日期和时间填写完整。");
    return;
  }

  if (createdEvent.start >= createdEvent.end) {
    showFormError("结束时间需要晚于开始时间。");
    return;
  }

  state.events.push(createdEvent);
  state.events.sort(compareEvents);
  saveEvents();

  state.selectedDate = parseDateKey(createdEvent.date);
  state.displayedMonth = new Date(state.selectedDate.getFullYear(), state.selectedDate.getMonth(), 1);
  state.currentView = "calendar";
  window.location.hash = "calendar";

  closeForm();
  renderApp();
});

navButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const nextView = button.dataset.view;

    if (!VIEW_NAMES.has(nextView)) {
      return;
    }

    state.currentView = nextView;
    window.location.hash = nextView;

    if (nextView !== "calendar") {
      closeForm();
    }

    renderViews();
  });
});

window.addEventListener("hashchange", () => {
  state.currentView = getViewFromHash();

  if (state.currentView !== "calendar") {
    closeForm();
  }

  renderViews();
});

renderApp();
