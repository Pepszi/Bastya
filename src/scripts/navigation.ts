/** Initializes header mobile menu and mobile dropdown toggles. */
export function initNavigation() {
	const nav = document.querySelector<HTMLElement>('[data-nav]');
	if (!nav) return;

	const toggle = nav.querySelector<HTMLButtonElement>('[data-nav-toggle]');
	const menu = nav.querySelector<HTMLElement>('[data-nav-menu]');
	const openIcon = nav.querySelector<HTMLElement>('[data-nav-icon-open]');
	const closeIcon = nav.querySelector<HTMLElement>('[data-nav-icon-close]');
	const desktopQuery = window.matchMedia('(min-width: 1024px)');
	const openClass = 'max-lg:!block';

	const setMenuOpen = (open: boolean) => {
		if (!menu || !toggle) return;
		menu.classList.toggle('max-lg:hidden', !open);
		menu.classList.toggle('max-lg:flex', open);
		toggle.setAttribute('aria-expanded', String(open));
		openIcon?.classList.toggle('hidden', open);
		closeIcon?.classList.toggle('hidden', !open);
	};

	const setDropdownOpen = (
		button: HTMLButtonElement,
		panel: HTMLElement,
		open: boolean,
	) => {
		button.setAttribute('aria-expanded', String(open));
		panel.classList.toggle(openClass, open);
	};

	const closeDropdowns = () => {
		nav.querySelectorAll<HTMLElement>('[data-dropdown]').forEach((dropdown) => {
			const button = dropdown.querySelector<HTMLButtonElement>('[data-dropdown-toggle]');
			const panel = dropdown.querySelector<HTMLElement>('[data-dropdown-menu]');
			if (!button || !panel) return;
			setDropdownOpen(button, panel, false);
		});
	};

	toggle?.addEventListener('click', () => {
		const open = toggle.getAttribute('aria-expanded') !== 'true';
		setMenuOpen(open);
		if (!open) closeDropdowns();
	});

	nav.querySelectorAll<HTMLElement>('[data-dropdown]').forEach((dropdown) => {
		const button = dropdown.querySelector<HTMLButtonElement>('[data-dropdown-toggle]');
		const panel = dropdown.querySelector<HTMLElement>('[data-dropdown-menu]');
		if (!button || !panel) return;

		button.addEventListener('click', (event) => {
			if (desktopQuery.matches) return;

			event.stopPropagation();
			const willOpen = button.getAttribute('aria-expanded') !== 'true';

			nav.querySelectorAll<HTMLElement>('[data-dropdown]').forEach((other) => {
				if (other === dropdown) return;
				const otherButton = other.querySelector<HTMLButtonElement>('[data-dropdown-toggle]');
				const otherPanel = other.querySelector<HTMLElement>('[data-dropdown-menu]');
				if (!otherButton || !otherPanel) return;
				setDropdownOpen(otherButton, otherPanel, false);
			});

			setDropdownOpen(button, panel, willOpen);
		});
	});

	document.addEventListener('click', (event) => {
		if (nav.contains(event.target as Node)) return;
		closeDropdowns();
		setMenuOpen(false);
	});
}
