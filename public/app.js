const state = {
  customers: [],
  services: [],
  professionals: [],
  appointments: [],
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
  select.innerHTML = `<option value="">${placeholder}</option>`;
  items.forEach((item) => {
    const option = document.createElement('option');
    option.value = item._id;
    option.textContent = item.name;
    select.appendChild(option);
  });
};

const resetForm = (form) => {
  form.reset();
  form.elements.id.value = '';
};

const renderEmpty = (tbody, colSpan, label) => {
  tbody.innerHTML = `<tr><td colspan="${colSpan}" class="empty">${label}</td></tr>`;
};

const renderCustomers = () => {
  const tbody = $('#customersTable');
  if (!state.customers.length) return renderEmpty(tbody, 4, 'Nenhum cliente cadastrado.');

  tbody.innerHTML = state.customers.map((customer) => `
    <tr>
      <td>${escapeHtml(customer.name)}</td>
      <td>${escapeHtml(customer.phone || '-')}<br>${escapeHtml(customer.email || '-')}</td>
      <td>${escapeHtml(customer.notes || '-')}</td>
      <td>
        <div class="actions d-flex flex-wrap gap-2">
          <button class="ghost compact" data-edit-customer="${customer._id}" type="button">Editar</button>
          <button class="danger compact" data-delete-customer="${customer._id}" type="button">Remover</button>
        </div>
      </td>
    </tr>
  `).join('');
};

const renderServices = () => {
  const tbody = $('#servicesTable');
  if (!state.services.length) return renderEmpty(tbody, 4, 'Nenhum serviço cadastrado.');

  tbody.innerHTML = state.services.map((service) => `
    <tr>
      <td>${escapeHtml(service.name)}<br><span>${escapeHtml(service.description || '-')}</span></td>
      <td>${service.durationMinutes || 60} min</td>
      <td>${formatMoney(service.price)}</td>
      <td>
        <div class="actions d-flex flex-wrap gap-2">
          <button class="ghost compact" data-edit-service="${service._id}" type="button">Editar</button>
          <button class="danger compact" data-delete-service="${service._id}" type="button">Remover</button>
        </div>
      </td>
    </tr>
  `).join('');
};

const renderProfessionals = () => {
  const tbody = $('#professionalsTable');
  if (!state.professionals.length) return renderEmpty(tbody, 4, 'Nenhum profissional cadastrado.');

  tbody.innerHTML = state.professionals.map((professional) => `
    <tr>
      <td>${escapeHtml(professional.name)}<br><span>${escapeHtml(professional.phone || professional.email || '-')}</span></td>
      <td>${escapeHtml(professional.category)}</td>
      <td>${professional.active === false ? 'Inativo' : 'Ativo'}</td>
      <td>
        <div class="actions d-flex flex-wrap gap-2">
          <button class="ghost compact" data-edit-professional="${professional._id}" type="button">Editar</button>
          <button class="danger compact" data-delete-professional="${professional._id}" type="button">Remover</button>
        </div>
      </td>
    </tr>
  `).join('');
};

const renderAppointments = () => {
  const tbody = $('#appointmentsTable');
  if (!state.appointments.length) return renderEmpty(tbody, 5, 'Nenhum agendamento cadastrado.');

  tbody.innerHTML = state.appointments.map((appointment) => `
    <tr>
      <td>${formatDate(appointment.startAt)}<br><span>até ${formatDate(appointment.endAt)}</span></td>
      <td>${escapeHtml(resolveName(appointment.customer, 'customers'))}</td>
      <td>${escapeHtml(resolveName(appointment.service, 'services'))}</td>
      <td>${escapeHtml(resolveName(appointment.professional, 'professionals'))}</td>
      <td>
        <div class="actions d-flex flex-wrap gap-2">
          <button class="ghost compact" data-reschedule-appointment="${appointment._id}" type="button">Reagendar</button>
          <button class="danger compact" data-cancel-appointment="${appointment._id}" type="button">Cancelar</button>
        </div>
      </td>
    </tr>
  `).join('');
};

const render = () => {
  fillSelect('#appointmentForm [name="customerId"]', state.customers, 'Selecione um cliente');
  fillSelect('#appointmentForm [name="serviceId"]', state.services, 'Selecione um serviço');
  fillSelect('#appointmentForm [name="professionalId"]', state.professionals, 'Selecione um profissional');
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
    api('/api/appointments'),
  ]);

  state.customers = customers;
  state.services = services;
  state.professionals = professionals;
  state.appointments = appointments;
  $('#statusText').textContent = health.dbConnected ? 'MongoDB conectado' : 'MongoDB desconectado';
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

const bindTabs = () => {
  $$('.tab').forEach((tab) => {
    tab.addEventListener('click', () => {
      $$('.tab').forEach((item) => item.classList.remove('is-active'));
      $$('.view').forEach((view) => view.classList.remove('is-active'));
      tab.classList.add('is-active');
      $(`#${tab.dataset.view}`).classList.add('is-active');
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
    const target = event.target;

    try {
      if (target.dataset.reset) resetForm($(`#${target.dataset.reset}`));
      if (target.id === 'resetAppointmentForm') resetAppointmentForm();
      if (target.id === 'refreshAppointments') {
        await loadData();
        showMessage('Agenda atualizada.');
      }

      if (target.dataset.editCustomer) {
        const customer = state.customers.find((item) => item._id === target.dataset.editCustomer);
        const form = $('#customerForm');
        form.elements.id.value = customer._id;
        form.elements.name.value = customer.name || '';
        form.elements.phone.value = customer.phone || '';
        form.elements.email.value = customer.email || '';
        form.elements.notes.value = customer.notes || '';
      }

      if (target.dataset.editService) {
        const service = state.services.find((item) => item._id === target.dataset.editService);
        const form = $('#serviceForm');
        form.elements.id.value = service._id;
        form.elements.name.value = service.name || '';
        form.elements.description.value = service.description || '';
        form.elements.durationMinutes.value = service.durationMinutes || 60;
        form.elements.price.value = service.price || 0;
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
      }

      if (target.dataset.rescheduleAppointment) {
        const appointment = state.appointments.find((item) => item._id === target.dataset.rescheduleAppointment);
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
      }

      if (target.dataset.deleteCustomer) await deleteEntity('customers', target.dataset.deleteCustomer, 'cliente');
      if (target.dataset.deleteService) await deleteEntity('services', target.dataset.deleteService, 'serviço');
      if (target.dataset.deleteProfessional) await deleteEntity('professionals', target.dataset.deleteProfessional, 'profissional');

      if (target.dataset.cancelAppointment) {
        if (!window.confirm('Cancelar agendamento?')) return;
        await api(`/api/appointments/${target.dataset.cancelAppointment}/cancel`, { method: 'DELETE' });
        await loadData();
        showMessage('Agendamento cancelado.');
      }
    } catch (error) {
      showMessage(error.message, true);
    }
  });
};

const init = async () => {
  bindTabs();
  bindForms();
  bindActions();

  try {
    await loadData();
  } catch (error) {
    showMessage(error.message, true);
    $('#statusText').textContent = 'API indisponível';
  }
};

init();
