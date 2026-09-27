'use strict';

(() => {
  const history = [];
  const form = document.getElementById('chat-form');
  const input = document.getElementById('message');
  const password = document.getElementById('password');
  const messages = document.getElementById('messages');
  const status = document.getElementById('status');
  const send = document.getElementById('send');
  const clear = document.getElementById('clear');
  const count = document.getElementById('count');
  const suggestions = [...document.querySelectorAll('.suggestion')];
  const welcomeTemplate = document.getElementById('welcome').cloneNode(true);
  const errorMessages = {
    400: 'This conversation is too long or could not be read. Please start a new conversation.',
    401: 'That bar pass does not match. Please check your access password.',
    413: 'That message is too long. Please shorten it and try again.',
    429: 'The AI service has reached a usage or request limit. Please try later or contact the site owner.',
    502: 'Our host could not get a reply from the AI service. Please try again. If it continues, contact the site owner.',
    503: 'The bar is not quite ready. The site owner needs to check the server configuration.'
  };

  function updateCount() {
    count.textContent = input.value.length.toLocaleString('en-US') + ' / 4,000';
  }
  function setStatus(text, isError = false) {
    status.textContent = text;
    status.classList.toggle('error', isError);
  }
  function setBusy(busy) {
    send.disabled = clear.disabled = input.disabled = password.disabled = busy;
    suggestions.forEach(button => { button.disabled = busy; });
    form.setAttribute('aria-busy', String(busy));
  }
  function showMessage(role, content) {
    document.getElementById('welcome')?.remove();
    const item = document.createElement('div');
    item.className = 'message ' + role;
    const speaker = document.createElement('p');
    speaker.className = 'speaker';
    speaker.textContent = role === 'user' ? 'YOU' : 'YOUR AI HOST';
    const body = document.createElement('div');
    body.className = 'message-body';
    body.textContent = content;
    item.append(speaker, body);
    messages.appendChild(item);
    messages.scrollTop = messages.scrollHeight;
    return item;
  }

  input.addEventListener('input', updateCount);
  input.addEventListener('keydown', event => {
    if (event.key === 'Enter' && !event.shiftKey && !event.isComposing) {
      event.preventDefault();
      if (!send.disabled) form.requestSubmit();
    }
  });
  suggestions.forEach(button => button.addEventListener('click', () => {
    input.value = button.dataset.prompt;
    updateCount();
    input.focus();
    setStatus('Your idea is ready. Add your bar pass, then press Send.');
  }));
  clear.addEventListener('click', () => {
    history.length = 0;
    messages.replaceChildren(welcomeTemplate.cloneNode(true));
    input.value = '';
    updateCount();
    setStatus('A fresh conversation. What are we making?');
    input.focus();
  });
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (send.disabled) return;
    const content = input.value.trim();
    if (!content) return;
    if (content.length > 4000) {
      setStatus('Please keep your message under 4,000 characters.', true);
      return;
    }
    const backendUrl = window.CHAT_CONFIG?.backendUrl?.replace(/\/+$/, '');
    if (!backendUrl || backendUrl.includes('YOUR-BACKEND')) {
      setStatus('The chat service has not been connected yet. Please contact the site owner.', true);
      return;
    }
    if (!password.value) {
      setStatus('Please enter your bar pass before sending a message.', true);
      password.focus();
      return;
    }
    const recent = history.slice(-10);
    while (recent.length && recent.reduce((n, m) => n + m.content.length, content.length) > 24000) {
      recent.splice(0, 2);
    }
    setBusy(true);
    setStatus('Your host is thinking… The first connection may take a little longer.');
    const pendingMessage = showMessage('user', content);
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 150000);
    try {
      const response = await fetch(backendUrl + '/api/chat', {
        method: 'POST',
        headers: {'Content-Type': 'application/json', 'X-Chat-Password': password.value},
        body: JSON.stringify({messages: [...recent, {role: 'user', content}]}),
        signal: controller.signal
      });
      const data = await response.json().catch(() => ({}));
      // Show English interface errors even when the backend returns Chinese text.
      if (!response.ok) throw new Error(errorMessages[response.status] || 'The service is temporarily unavailable. Please try again shortly.');
      if (typeof data.reply !== 'string' || !data.reply.trim()) throw new Error('No reply came through. Please try again.');
      history.push({role: 'user', content}, {role: 'assistant', content: data.reply});
      // Keep complete exchanges that fit the backend message-size limit.
      if (data.reply.length > 8000) history.length = 0;
      else if (history.length > 10) history.splice(0, history.length - 10);
      showMessage('assistant', data.reply);
      input.value = '';
      updateCount();
      setStatus('');
    } catch (error) {
      pendingMessage.remove();
      if (!messages.children.length) messages.appendChild(welcomeTemplate.cloneNode(true));
      setStatus(error.name === 'AbortError'
        ? 'The reply took too long. The service may be waking up; please try again.'
        : error instanceof TypeError
          ? 'We could not reach the bar. Please check your connection and try again. If this continues, contact the site owner.'
          : error.message, true);
    } finally {
      clearTimeout(timer);
      setBusy(false);
      input.focus();
    }
  });
})();
