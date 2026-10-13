/** Submits the contact form through FormSubmit and shows success or error on the page. */
export function initContactForm() {
	const form = document.querySelector<HTMLFormElement>('[data-contact-form]');
	if (!form || form.dataset.contactReady === 'true') return;
	form.dataset.contactReady = 'true';

	const status = form.querySelector<HTMLElement>('[data-contact-status]');
	const submit = form.querySelector<HTMLButtonElement>('[data-contact-submit]');
	const subjectField = form.querySelector<HTMLInputElement>('[data-contact-subject]');
	const emailField = form.querySelector<HTMLInputElement>('[data-contact-email]');
	const defaultLabel = submit?.textContent?.trim() || 'Küldés';
	const endpoint = form.dataset.contactEndpoint;
	if (!endpoint) return;

	form.addEventListener('submit', async (event) => {
		event.preventDefault();
		event.stopPropagation();

		if (submit) {
			submit.disabled = true;
			submit.textContent = 'Küldés…';
			submit.setAttribute('aria-busy', 'true');
		}
		form.setAttribute('aria-busy', 'true');

		const body = new FormData(form);
		if (subjectField) body.set('_subject', subjectField.value);
		if (emailField) body.set('_replyto', emailField.value);

		try {
			const response = await fetch(endpoint, {
				method: 'POST',
				headers: { Accept: 'application/json' },
				body,
			});
			const data = (await response.json().catch(() => null)) as {
				success?: string | boolean;
				message?: string;
			} | null;
			const ok = response.ok && (data?.success === true || data?.success === 'true');
			if (!ok) throw new Error(data?.message || 'submit failed');

			form.reset();
			showStatus(status, 'Köszönjük. Az üzenetet megkaptuk, hamarosan válaszolunk.', false);
		} catch {
			showStatus(
				status,
				'Az üzenetet nem sikerült elküldeni. Próbálja újra, vagy írjon az info@bastyaalapitvany.hu címre.',
				true,
			);
		} finally {
			form.removeAttribute('aria-busy');
			if (submit) {
				submit.disabled = false;
				submit.textContent = defaultLabel;
				submit.removeAttribute('aria-busy');
			}
		}
	});
}

function showStatus(status: HTMLElement | null, message: string, isError: boolean) {
	if (!status) return;
	const text = status.querySelector<HTMLElement>('[data-contact-status-text]');
	const icon = status.querySelector<HTMLElement>('[data-contact-status-icon]');
	if (text) text.textContent = message;
	status.classList.toggle('text-success', !isError);
	status.classList.toggle('text-primary', isError);
	icon?.classList.toggle('hidden', isError);
	status.hidden = false;
	status.setAttribute('role', isError ? 'alert' : 'status');
}
