const state = {
  customers: [],
  services: [],
  professionals: [],
  appointments: [],
  appointmentFilters: {
    range: 'day',
    date: '',
    professionalId: '',
    customerId: '',
    status: '',
  },
  entityFilters: {
    customers: '',
    services: '',
    professionals: '',
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
    throw new Error(data.error?.message || data.message || 'Erro na requisição');
  }

  return data;
};

const listData = (response) => Array.isArray(response) ? response : response.data || [];

const setLoading = (isLoading, text = 'Carregando...') => {
  const overlay = $('#loadingOverlay');
  if (!overlay) return;
  overlay.querySelector('span').textContent = text;
  overlay.hidden = !isLoading;
  document.body.classList.toggle('is-loading', isLoading);
};

const setFormLoading = (form, isLoading) => {
  form.querySelectorAll('button, input, select, textarea').forEach((field) => {
    field.disabled = isLoading;
  });
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

const confirmAction = ({ title = 'Confirmar ação', text, acceptLabel = 'Confirmar', danger = true }) =>
  new Promise((resolve) => {
    const dialog = $('#confirmDialog');
    const cancelButton = $('#confirmCancel');
    const acceptButton = $('#confirmAccept');

    $('#confirmTitle').textContent = title;
    $('#confirmText').textContent = text;
    acceptButton.textContent = acceptLabel;
    acceptButton.classList.toggle('btn-danger', danger);
    acceptButton.classList.toggle('btn-primary', !danger);

    const cleanup = (result) => {
      cancelButton.removeEventListener('click', onCancel);
      acceptButton.removeEventListener('click', onAccept);
      dialog.removeEventListener('cancel', onCancel);
      dialog.close();
      resolve(result);
    };

    const onCancel = () => cleanup(false);
    const onAccept = () => cleanup(true);

    cancelButton.addEventListener('click', onCancel);
    acceptButton.addEventListener('click', onAccept);
    dialog.addEventListener('cancel', onCancel);
    dialog.showModal();
  });

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

const toDateInput = (date) => {
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 10);
};

const getSelectedEntity = (collection, id) =>
  state[collection].find((item) => item._id === id);

const getWeekRange = (dateValue) => {
  const date = new Date(`${dateValue}T00:00:00`);
  const day = date.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  const start = new Date(date);
  start.setDate(date.getDate() + mondayOffset);
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setDate(start.getDate() + 7);

  return {
    from: start.toISOString(),
    to: end.toISOString(),
  };
};

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

const appointmentActionLabels = {
  create: 'criar',
  reschedule: 'reagendar',
};

const buildAppointmentQuery = () => {
  const params = new URLSearchParams();
  const { range, date, ...filters } = state.appointmentFilters;

  if (date && range === 'week') {
    const { from, to } = getWeekRange(date);
    params.set('from', from);
    params.set('to', to);
  } else if (date) {
    params.set('date', date);
  }

  Object.entries(filters).forEach(([key, value]) => {
    if (value) params.set(key, value);
  });

  const query = params.toString();
  return query ? `?${query}` : '';
};

const buildEntityQuery = (resource) => {
  const params = new URLSearchParams();
  const search = state.entityFilters[resource];

  if (search) {
    params.set('search', search);
  }

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
  $('#appointmentRangeFilter').value = state.appointmentFilters.range;
  $('#appointmentDateFilter').value = state.appointmentFilters.date;
  $('#appointmentCustomerFilter').value = state.appointmentFilters.customerId;
  $('#appointmentProfessionalFilter').value = state.appointmentFilters.professionalId;
  $('#appointmentStatusFilter').value = state.appointmentFilters.status;
  Object.entries(state.entityFilters).forEach(([resource, value]) => {
    const input = $(`[data-filter-resource="${resource}"] [name="search"]`);
    if (input) input.value = value;
  });
  renderCustomers();
  renderServices();
  renderProfessionals();
  renderAppointments();
};

const loadData = async () => {
  setLoading(true);
  try {
    const [health, customers, services, professionals, appointments] = await Promise.all([
      api('/api/health'),
      api(`/api/customers${buildEntityQuery('customers')}`),
      api(`/api/services${buildEntityQuery('services')}`),
      api(`/api/professionals${buildEntityQuery('professionals')}`),
      api(`/api/appointments${buildAppointmentQuery()}`),
    ]);

    state.customers = listData(customers);
    state.services = listData(services);
    state.professionals = listData(professionals);
    state.appointments = listData(appointments);

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
  } finally {
    setLoading(false);
  }
};

const saveEntity = async (resource, form, buildPayload) => {
  setFormLoading(form, true);
  const id = form.elements.id.value;
  const payload = buildPayload(form);
  try {
    await api(`/api/${resource}${id ? `/${id}` : ''}`, {
      method: id ? 'PUT' : 'POST',
      body: JSON.stringify(payload),
    });
    resetForm(form);
    await loadData();
  } finally {
    setFormLoading(form, false);
  }
};

const confirmAppointment = (form) => {
  const id = form.elements.id.value;
  const customer = getSelectedEntity('customers', form.elements.customerId.value);
  const service = getSelectedEntity('services', form.elements.serviceId.value);
  const professional = getSelectedEntity('professionals', form.elements.professionalId.value);
  const startAt = new Date(form.elements.startAt.value);
  const action = id ? 'reschedule' : 'create';
  const notes = form.elements.notes.value.trim();

  const details = [
    `Cliente: ${customer?.name || '-'}`,
    `Serviço: ${service?.name || '-'}`,
    `Profissional: ${professional?.name || '-'}`,
    `Data e horário: ${formatDate(startAt.toISOString())}`,
    `Duração: ${service?.durationMinutes || 60} min`,
  ];

  if (notes) details.push(`Observações: ${notes}`);

  return confirmAction({
    title: id ? 'Confirmar reagendamento' : 'Confirmar agendamento',
    text: details.join('\n'),
    acceptLabel: id ? 'Reagendar' : 'Criar agendamento',
    danger: false,
  }).then((confirmed) => {
    if (!confirmed) {
      showMessage(`Revise as seleções antes de ${appointmentActionLabels[action]} o agendamento.`);
    }
    return confirmed;
  });
};

const deleteEntity = async (resource, id, label) => {
  const confirmed = await confirmAction({
    title: `Remover ${label}`,
    text: `Tem certeza que deseja remover este ${label}?`,
    acceptLabel: 'Remover',
  });
  if (!confirmed) return;

  setLoading(true, `Removendo ${label}...`);
  try {
    await api(`/api/${resource}/${id}`, { method: 'DELETE' });
    await loadData();
    showMessage(`${label} removido.`);
  } finally {
    setLoading(false);
  }
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
  $$('[data-filter-resource]').forEach((form) => {
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      const resource = form.dataset.filterResource;
      state.entityFilters[resource] = form.elements.search.value.trim();

      try {
        await loadData();
        showMessage('Lista filtrada.');
      } catch (error) {
        showMessage(error.message, true);
      }
    });
  });

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

  ['professionalId', 'serviceId', 'appointmentDate'].forEach((name) => {
    $('#appointmentForm').elements[name].addEventListener('change', () => {
      $('#appointmentForm').elements.startAt.value = '';
      loadAvailability();
    });
  });

  [
    ['#appointmentRangeFilter', 'range'],
    ['#appointmentDateFilter', 'date'],
    ['#appointmentProfessionalFilter', 'professionalId'],
    ['#appointmentCustomerFilter', 'customerId'],
    ['#appointmentStatusFilter', 'status'],
  ].forEach(([selector, key]) => {
    $(selector).addEventListener('change', async (event) => {
      state.appointmentFilters[key] = event.target.value;
      try {
        setLoading(true);
        await loadData();
      } catch (error) {
        showMessage(error.message, true);
      }
    });
  });

  $('#appointmentForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    let isSubmitting = false;

    try {
      const id = form.elements.id.value;
      if (!form.elements.startAt.value) {
        showMessage('Selecione um horário disponível.', true);
        return;
      }

      const confirmed = await confirmAppointment(form);
      if (!confirmed) return;

      isSubmitting = true;
      setFormLoading(form, true);
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
    } finally {
      if (isSubmitting) {
        setFormLoading(form, false);
        if (form.elements.id.value) {
          form.elements.customerId.disabled = true;
          form.elements.serviceId.disabled = true;
          form.elements.professionalId.disabled = true;
        }
      }
    }
  });
};

const resetAppointmentForm = () => {
  const form = $('#appointmentForm');
  resetForm(form);
  form.elements.customerId.disabled = false;
  form.elements.serviceId.disabled = false;
  form.elements.professionalId.disabled = false;
  form.elements.appointmentDate.value = toDateInput(new Date());
  form.elements.startAt.value = '';
  $('#availabilityContainer').innerHTML = '<p>Selecione serviço, profissional e data para ver os horários disponíveis.</p>';
  $('#appointmentFormTitle').textContent = 'Novo agendamento';
};

const bindActions = () => {
  document.addEventListener('click', async (event) => {
    const target = event.target.closest('button, [data-slot], [data-select-customer], [data-select-service], [data-select-professional], [data-select-appointment], [data-complete-appointment]');

    if (!target) return;

    try {
      // Cancel buttons
      if (target.textContent.includes('Cancelar')) {
        const form = target.closest('#customerForm, #serviceForm, #professionalForm, #appointmentForm');
        if (form) {
          if (form.id === 'appointmentForm') resetAppointmentForm();
          else resetForm(form);
          return;
        }
      }

      if (target.dataset.clearFilter) {
        state.entityFilters[target.dataset.clearFilter] = '';
        const form = target.closest('form');
        form.elements.search.value = '';
        await loadData();
        showMessage('Filtro limpo.');
        return;
      }

      // Refresh button
      if (target.id === 'refreshAppointments') {
        setLoading(true);
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
        form.elements.appointmentDate.value = toDateInput(new Date(appointment.startAt));
        form.elements.startAt.value = toDatetimeLocal(appointment.startAt);
        form.elements.notes.value = appointment.notes || '';
        $('#appointmentFormTitle').textContent = 'Reagendar agendamento';
        $$('#appointmentsList .item').forEach((item) => item.classList.remove('is-selected'));
        target.closest('.item').classList.add('is-selected');
        await loadAvailability();
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
        const confirmed = await confirmAction({
          title: 'Cancelar agendamento',
          text: 'Tem certeza que deseja cancelar este agendamento?',
          acceptLabel: 'Cancelar agendamento',
        });
        if (!confirmed) return;

        setLoading(true, 'Cancelando agendamento...');
        await api(`/api/appointments/${target.dataset.deleteAppointment}/cancel`, { method: 'DELETE' });
        await loadData();
        showMessage('Agendamento cancelado.');
      }

      if (target.dataset.completeAppointment) {
        const confirmed = await confirmAction({
          title: 'Concluir agendamento',
          text: 'Marcar este agendamento como concluido?',
          acceptLabel: 'Concluir',
          danger: false,
        });
        if (!confirmed) return;

        setLoading(true, 'Concluindo agendamento...');
        await api(`/api/appointments/${target.dataset.completeAppointment}/complete`, { method: 'PATCH' });
        await loadData();
        showMessage('Agendamento concluido.');
      }

      if (target.dataset.slot) {
        const form = $('#appointmentForm');
        form.elements.startAt.value = toDatetimeLocal(target.dataset.slot);
        $$('.slot-btn').forEach((button) => button.classList.remove('is-selected'));
        target.classList.add('is-selected');
        return;
      }
    } catch (error) {
      setLoading(false);
      showMessage(error.message, true);
    }
  });
};

const loadAvailability = async () => {
  const form = $('#appointmentForm');
  const container = $('#availabilityContainer');

  const professionalId = form.elements.professionalId.value;
  const serviceId = form.elements.serviceId.value;
  const date = form.elements.appointmentDate.value;

  if (!professionalId || !serviceId || !date) {
    container.innerHTML = '<p>Selecione serviço, profissional e data para ver os horários disponíveis.</p>';
    return;
  }

  const service = getSelectedEntity('services', serviceId);

  if (!service) return;

  try {
    container.innerHTML = '<p class="loading-text">Buscando horários...</p>';
    const slots = await api(
      `/api/appointments/availability?professionalId=${encodeURIComponent(professionalId)}&serviceId=${encodeURIComponent(serviceId)}&date=${encodeURIComponent(date)}`
    );

    renderAvailability(slots);
  } catch (err) {
    showMessage(err.message, true);
  }
};

const renderAvailability = (slots) => {
  const container = $('#availabilityContainer');
  const selectedStartAt = $('#appointmentForm').elements.startAt.value;

  if (!slots.length) {
    container.innerHTML = '<p>Nenhum horário disponível para esta data.</p>';
    return;
  }

  container.innerHTML = `
    <div class="availability-list">
      ${slots.map(slot => {
        const date = new Date(slot);
        const value = toDatetimeLocal(slot);
        const label = date.toLocaleTimeString('pt-BR', {
          hour: '2-digit',
          minute: '2-digit'
        });
        const selectedClass = value === selectedStartAt ? ' is-selected' : '';
        return `<button type="button" class="slot-btn${selectedClass}" data-slot="${slot}">${label}</button>`;
      }).join('')}
    </div>
  `;
};

const init = async () => {
  bindNavigation();
  bindForms();
  bindActions();
  state.appointmentFilters.date = toDateInput(new Date());
  $('#appointmentForm').elements.appointmentDate.value = state.appointmentFilters.date;
  $('#availabilityContainer').innerHTML = '<p>Selecione serviço, profissional e data para ver os horários disponíveis.</p>';

  try {
    await loadData();
  } catch (error) {
    setLoading(false);
    showMessage(error.message, true);
    $('#statusText').textContent = 'API indisponível';
    const indicator = $('#statusIndicator');
    indicator.style.background = '#c50f1f';
  }
};

init();
