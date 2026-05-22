const state = {
  customers: [],
  services: [],
  professionals: [],
  appointments: [],
  appointmentFilters: {
    date: '',
    professionalId: '',
    customerId: '',
    status: '',
  },
};

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

const api = async (path, options = {}) => {
  const response = await fetch(path, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  if (response.status === 204) return null;

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Erro na requisição');
  }

  return data;
};

const showMessage = (text, isError = false) => {
  const message = $('#message');
  message.textContent = text;
  message.hidden = false;
  message.classList.toggle('is-error', isError);
  window.clearTimeout(showMessage.timer);
  showMessage.timer = window.setTimeout(() => {
    message.hidden = true;
  }, 4200);
};

const formatDate = (value) =>
  value ? new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(value)) : '-';

const formatMoney = (value) =>
  new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(Number(value || 0));

const escapeHtml = (value) => String(value ?? '')
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#039;');

const toDatetimeLocal = (value) => {
  if (!value) return '';
  const date = new Date(value);
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
};

const fromDatetimeLocal = (value) => new Date(value).toISOString();

const resolveName = (item, collection, fallback = '-') => {
  if (!item) return fallback;
  if (typeof item === 'object') return item.name || fallback;
  const found = state[collection].find((record) => record._id === item);
  return found?.name || fallback;
};

const fillSelect = (selector, items, placeholder) => {
  const select = $(selector);
  const selectedValue = select.value;
  select.innerHTML = `<option value="">${placeholder}</option>`;
  items.forEach((item) => {
    const option = document.createElement('option');
    option.value = item._id;
    option.textContent = item.name;
    select.appendChild(option);
  });
  select.value = selectedValue;
};

const statusLabels = {
  scheduled: 'Agendado',
  cancelled: 'Cancelado',
  completed: 'Concluido',
};

const buildAppointmentQuery = () => {
  const params = new URLSearchParams();
  Object.entries(state.appointmentFilters).forEach(([key, value]) => {
    if (value) params.set(key, value);
  });
  const query = params.toString();
  return query ? `?${query}` : '';
};

const resetForm = (form) => {
  form.reset();
  form.elements.id.value = '';
};

const createListItem = (item, type) => {
  const div = document.createElement('div');
  div.className = 'item';
  div.dataset[`select${type}`] = item._id;
  const typeAttr = type.toLowerCase();

  let mainContent = '';
  let subtitle = '';

  if (type === 'Customer') {
    mainContent = escapeHtml(item.name);
    subtitle = escapeHtml(item.phone || item.email || 'Sem contato');
  } else if (type === 'Service') {
    mainContent = escapeHtml(item.name);
    subtitle = `${item.durationMinutes || 60} min • ${formatMoney(item.price)}`;
  } else if (type === 'Professional') {
    mainContent = escapeHtml(item.name);
    subtitle = escapeHtml(item.category || 'Sem categoria');
  } else if (type === 'Appointment') {
    mainContent = `${escapeHtml(resolveName(item.customer, 'customers'))} - ${escapeHtml(resolveName(item.service, 'services'))}`;
    const professionalName = resolveName(item.professional, 'professionals');
    const history = item.reschedules?.length ? ` • ${item.reschedules.length} reagendamento(s)` : '';
    subtitle = `${formatDate(item.startAt)} • ${escapeHtml(professionalName)} • ${statusLabels[item.status] || item.status || 'Agendado'}${history}`;
  }

  const canChangeAppointment = type !== 'Appointment' || item.status === 'scheduled';

  div.innerHTML = `
    <div class="item-main">
      <p class="item-title">${mainContent}</p>
      <p class="item-subtitle">${subtitle}</p>
    </div>
    <div class="item-actions">
      ${canChangeAppointment ? `<button class="item-btn" data-edit-${typeAttr}="${item._id}" title="${type === 'Appointment' ? 'Reagendar' : 'Editar'}">
        <i class="fas fa-pencil"></i>
      </button>` : ''}
      ${type === 'Appointment' && canChangeAppointment ? `<button class="item-btn" data-complete-appointment="${item._id}" title="Concluir">
        <i class="fas fa-check"></i>
      </button>` : ''}
      ${type !== 'Appointment' || canChangeAppointment ? `<button class="item-btn danger" data-delete-${typeAttr}="${item._id}" title="${type === 'Appointment' ? 'Cancelar' : 'Remover'}">
        <i class="fas fa-trash"></i>
      </button>` : ''}
    </div>
  `;

  return div;
};

const renderCustomers = () => {
  const list = $('#customersList');
  list.innerHTML = '';
  if (!state.customers.length) {
    list.innerHTML = '<div class="empty">Nenhum cliente cadastrado.</div>';
    return;
  }
  state.customers.forEach((customer) => {
    list.appendChild(createListItem(customer, 'Customer'));
  });
};

const renderServices = () => {
  const list = $('#servicesList');
  list.innerHTML = '';
  if (!state.services.length) {
    list.innerHTML = '<div class="empty">Nenhum serviço cadastrado.</div>';
    return;
  }
  state.services.forEach((service) => {
    list.appendChild(createListItem(service, 'Service'));
  });
};

const renderProfessionals = () => {
  const list = $('#professionalsList');
  list.innerHTML = '';
  if (!state.professionals.length) {
    list.innerHTML = '<div class="empty">Nenhum profissional cadastrado.</div>';
    return;
  }
  state.professionals.forEach((professional) => {
    list.appendChild(createListItem(professional, 'Professional'));
  });
};

const renderAppointments = () => {
  const list = $('#appointmentsList');
  list.innerHTML = '';
  if (!state.appointments.length) {
    list.innerHTML = '<div class="empty">Nenhum agendamento cadastrado.</div>';
    return;
  }
  state.appointments.forEach((appointment) => {
    list.appendChild(createListItem(appointment, 'Appointment'));
  });
};

const render = () => {
  fillSelect('#appointmentForm [name="customerId"]', state.customers, 'Selecione um cliente');
  fillSelect('#appointmentForm [name="serviceId"]', state.services, 'Selecione um serviço');
  fillSelect('#appointmentForm [name="professionalId"]', state.professionals, 'Selecione um profissional');
  fillSelect('#appointmentCustomerFilter', state.customers, 'Todos os clientes');
  fillSelect('#appointmentProfessionalFilter', state.professionals, 'Todos os profissionais');
  $('#appointmentDateFilter').value = state.appointmentFilters.date;
  $('#appointmentCustomerFilter').value = state.appointmentFilters.customerId;
  $('#appointmentProfessionalFilter').value = state.appointmentFilters.professionalId;
  $('#appointmentStatusFilter').value = state.appointmentFilters.status;
  renderCustomers();
  renderServices();
  renderProfessionals();
  renderAppointments();
};

const loadData = async () => {
  const [health, customers, services, professionals, appointments] = await Promise.all([
    api('/api/health'),
    api('/api/customers'),
    api('/api/services'),
    api('/api/professionals'),
    api(`/api/appointments${buildAppointmentQuery()}`),
  ]);

  state.customers = customers;
  state.services = services;
  state.professionals = professionals;
  state.appointments = appointments;

  const indicator = $('#statusIndicator');
  const statusText = $('#statusText');
  if (health.dbConnected) {
    indicator.style.background = '#107c10';
    statusText.textContent = 'Conectado';
  } else {
    indicator.style.background = '#c50f1f';
    statusText.textContent = 'Desconectado';
  }
  render();
};

const saveEntity = async (resource, form, buildPayload) => {
  const id = form.elements.id.value;
  const payload = buildPayload(form);
  await api(`/api/${resource}${id ? `/${id}` : ''}`, {
    method: id ? 'PUT' : 'POST',
    body: JSON.stringify(payload),
  });
  resetForm(form);
  await loadData();
};

const deleteEntity = async (resource, id, label) => {
  if (!window.confirm(`Remover ${label}?`)) return;
  await api(`/api/${resource}/${id}`, { method: 'DELETE' });
  await loadData();
  showMessage(`${label} removido.`);
};

const bindNavigation = () => {
  $$('.nav-item').forEach((item) => {
    item.addEventListener('click', () => {
      $$('.nav-item').forEach((navItem) => navItem.classList.remove('is-active'));
      $$('.view').forEach((view) => view.classList.remove('is-active'));
      item.classList.add('is-active');
      $(`#${item.dataset.view}`).classList.add('is-active');
    });
  });
};

const bindForms = () => {
  $('#customerForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    try {
      await saveEntity('customers', event.currentTarget, (form) => ({
        name: form.elements.name.value,
        phone: form.elements.phone.value,
        email: form.elements.email.value,
        notes: form.elements.notes.value,
      }));
      showMessage('Cliente salvo.');
    } catch (error) {
      showMessage(error.message, true);
    }
  });

  $('#serviceForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    try {
      await saveEntity('services', event.currentTarget, (form) => ({
        name: form.elements.name.value,
        description: form.elements.description.value,
        durationMinutes: Number(form.elements.durationMinutes.value || 60),
        price: Number(form.elements.price.value || 0),
      }));
      showMessage('Serviço salvo.');
    } catch (error) {
      showMessage(error.message, true);
    }
  });

  $('#professionalForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    try {
      await saveEntity('professionals', event.currentTarget, (form) => ({
        name: form.elements.name.value,
        category: form.elements.category.value,
        phone: form.elements.phone.value,
        email: form.elements.email.value,
        active: form.elements.active.checked,
      }));
      showMessage('Profissional salvo.');
    } catch (error) {
      showMessage(error.message, true);
    }
  });

  ['professionalId', 'serviceId'].forEach(name => { $('#appointmentForm').elements[name].addEventListener('change', loadAvailability); });
  $('#appointmentForm').elements.startAt.addEventListener('change', loadAvailability);

  [
    ['#appointmentDateFilter', 'date'],
    ['#appointmentProfessionalFilter', 'professionalId'],
    ['#appointmentCustomerFilter', 'customerId'],
    ['#appointmentStatusFilter', 'status'],
  ].forEach(([selector, key]) => {
    $(selector).addEventListener('change', async (event) => {
      state.appointmentFilters[key] = event.target.value;
      try {
        await loadData();
      } catch (error) {
        showMessage(error.message, true);
      }
    });
  });

  $('#appointmentForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    try {
      const form = event.currentTarget;
      const id = form.elements.id.value;
      const payload = {
        startAt: fromDatetimeLocal(form.elements.startAt.value),
        notes: form.elements.notes.value,
      };

      if (id) {
        await api(`/api/appointments/${id}/reschedule`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
        showMessage('Agendamento reagendado.');
      } else {
        await api('/api/appointments', {
          method: 'POST',
          body: JSON.stringify({
            ...payload,
            customerId: form.elements.customerId.value,
            serviceId: form.elements.serviceId.value,
            professionalId: form.elements.professionalId.value,
          }),
        });
        showMessage('Agendamento criado.');
      }

      resetAppointmentForm();
      await loadData();
    } catch (error) {
      showMessage(error.message, true);
    }
  });
};

const resetAppointmentForm = () => {
  const form = $('#appointmentForm');
  resetForm(form);
  form.elements.customerId.disabled = false;
  form.elements.serviceId.disabled = false;
  form.elements.professionalId.disabled = false;
  $('#appointmentFormTitle').textContent = 'Novo agendamento';
};

const bindActions = () => {
  document.addEventListener('click', async (event) => {
    const target = event.target.closest('button, [data-slot], [data-select-customer], [data-select-service], [data-select-professional], [data-select-appointment], [data-complete-appointment]');

    if (!target) return;

    try {
      // Cancel buttons
      if (target.textContent.includes('Cancelar')) {
        const form = target.closest('form');
        if (form.id === 'appointmentForm') resetAppointmentForm();
        else resetForm(form);
        return;
      }

      // Refresh button
      if (target.id === 'refreshAppointments') {
        await loadData();
        showMessage('Agenda atualizada.');
        return;
      }

      // Select items from list
      if (target.dataset.selectCustomer) {
        const customer = state.customers.find((item) => item._id === target.dataset.selectCustomer);
        const form = $('#customerForm');
        form.elements.id.value = customer._id;
        form.elements.name.value = customer.name || '';
        form.elements.phone.value = customer.phone || '';
        form.elements.email.value = customer.email || '';
        form.elements.notes.value = customer.notes || '';
        $$('#customersList .item').forEach((item) => item.classList.remove('is-selected'));
        target.closest('.item').classList.add('is-selected');
        return;
      }

      if (target.dataset.selectService) {
        const service = state.services.find((item) => item._id === target.dataset.selectService);
        const form = $('#serviceForm');
        form.elements.id.value = service._id;
        form.elements.name.value = service.name || '';
        form.elements.description.value = service.description || '';
        form.elements.durationMinutes.value = service.durationMinutes || 60;
        form.elements.price.value = service.price || 0;
        $$('#servicesList .item').forEach((item) => item.classList.remove('is-selected'));
        target.closest('.item').classList.add('is-selected');
        return;
      }

      if (target.dataset.selectProfessional) {
        const professional = state.professionals.find((item) => item._id === target.dataset.selectProfessional);
        const form = $('#professionalForm');
        form.elements.id.value = professional._id;
        form.elements.name.value = professional.name || '';
        form.elements.category.value = professional.category || '';
        form.elements.phone.value = professional.phone || '';
        form.elements.email.value = professional.email || '';
        form.elements.active.checked = professional.active !== false;
        $$('#professionalsList .item').forEach((item) => item.classList.remove('is-selected'));
        target.closest('.item').classList.add('is-selected');
        return;
      }

      if (target.dataset.selectAppointment) {
        const appointment = state.appointments.find((item) => item._id === target.dataset.selectAppointment);
        const form = $('#appointmentForm');
        form.elements.id.value = appointment._id;
        form.elements.customerId.value = typeof appointment.customer === 'object' ? appointment.customer._id : appointment.customer;
        form.elements.serviceId.value = typeof appointment.service === 'object' ? appointment.service._id : appointment.service;
        form.elements.professionalId.value = typeof appointment.professional === 'object' ? appointment.professional._id : appointment.professional;
        form.elements.customerId.disabled = true;
        form.elements.serviceId.disabled = true;
        form.elements.professionalId.disabled = true;
        form.elements.startAt.value = toDatetimeLocal(appointment.startAt);
        form.elements.notes.value = appointment.notes || '';
        $('#appointmentFormTitle').textContent = 'Reagendar agendamento';
        $$('#appointmentsList .item').forEach((item) => item.classList.remove('is-selected'));
        target.closest('.item').classList.add('is-selected');
        return;
      }

      // Edit buttons
      if (target.dataset.editCustomer) {
        const customer = state.customers.find((item) => item._id === target.dataset.editCustomer);
        const form = $('#customerForm');
        form.elements.id.value = customer._id;
        form.elements.name.value = customer.name || '';
        form.elements.phone.value = customer.phone || '';
        form.elements.email.value = customer.email || '';
        form.elements.notes.value = customer.notes || '';
        return;
      }

      if (target.dataset.editService) {
        const service = state.services.find((item) => item._id === target.dataset.editService);
        const form = $('#serviceForm');
        form.elements.id.value = service._id;
        form.elements.name.value = service.name || '';
        form.elements.description.value = service.description || '';
        form.elements.durationMinutes.value = service.durationMinutes || 60;
        form.elements.price.value = service.price || 0;
        return;
      }

      if (target.dataset.editProfessional) {
        const professional = state.professionals.find((item) => item._id === target.dataset.editProfessional);
        const form = $('#professionalForm');
        form.elements.id.value = professional._id;
        form.elements.name.value = professional.name || '';
        form.elements.category.value = professional.category || '';
        form.elements.phone.value = professional.phone || '';
        form.elements.email.value = professional.email || '';
        form.elements.active.checked = professional.active !== false;
        return;
      }

      // Delete buttons
      if (target.dataset.deleteCustomer) await deleteEntity('customers', target.dataset.deleteCustomer, 'cliente');
      if (target.dataset.deleteService) await deleteEntity('services', target.dataset.deleteService, 'serviço');
      if (target.dataset.deleteProfessional) await deleteEntity('professionals', target.dataset.deleteProfessional, 'profissional');

      if (target.dataset.deleteAppointment) {
        if (!window.confirm('Cancelar agendamento?')) return;
        await api(`/api/appointments/${target.dataset.deleteAppointment}/cancel`, { method: 'DELETE' });
        await loadData();
        showMessage('Agendamento cancelado.');
      }

      if (target.dataset.completeAppointment) {
        await api(`/api/appointments/${target.dataset.completeAppointment}/complete`, { method: 'PATCH' });
        await loadData();
        showMessage('Agendamento concluido.');
      }

      if (target.dataset.slot) {
        const form = $('#appointmentForm');
        form.elements.startAt.value = toDatetimeLocal(target.dataset.slot);
        return;
      }
    } catch (error) {
      showMessage(error.message, true);
    }
  });
};

const loadAvailability = async () => {
  const form = $('#appointmentForm');

  const professionalId = form.elements.professionalId.value;
  const serviceId = form.elements.serviceId.value;
  const startAt = form.elements.startAt.value;

  if (!professionalId || !serviceId) return;

  const service = state.services.find(s => s._id === serviceId);

  if (!service) return;

  const baseDate = startAt ? new Date(startAt) : new Date();
  const date = baseDate.toLocaleDateString('en-CA');

  try {
    const slots = await api(
      `/api/appointments/availability?professionalId=${professionalId}&serviceId=${serviceId}&date=${date}`
    );

    renderAvailability(slots);

    showMessage(`${slots.length} horários disponíveis`);
  } catch (err) {
    console.error(err);
  }
};

const renderAvailability = (slots) => {
  const container = $('#availabilityContainer');

  if (!slots.length) {
    container.innerHTML = '<p>Nenhum horário disponível</p>';
    return;
  }

  container.innerHTML = `
    <div class="availability-list">
      ${slots.map(slot => {
        const date = new Date(slot);
        const label = date.toLocaleTimeString('pt-BR', {
          hour: '2-digit',
          minute: '2-digit'
        });
        return `<button class="slot-btn" data-slot="${slot}">${label}</button>`;
      }).join('')}
    </div>
  `;
};

const init = async () => {
  bindNavigation();
  bindForms();
  bindActions();

  try {
    await loadData();
  } catch (error) {
    showMessage(error.message, true);
    $('#statusText').textContent = 'API indisponível';
    const indicator = $('#statusIndicator');
    indicator.style.background = '#c50f1f';
  }
};

init();
