import Alpine from 'alpinejs';

window.Alpine = Alpine;
Alpine.store('theme', {
    current: document.documentElement.dataset.bsTheme || 'dark',
    get label() { return `Switch to ${this.current === 'dark' ? 'light' : 'dark'} theme`; },
    toggle() {
        this.current = this.current === 'dark' ? 'light' : 'dark';
        document.documentElement.dataset.bsTheme = this.current;
        try { localStorage.setItem('beast-theme', this.current); } catch (_) { /* Theme remains usable without storage. */ }
    },
});
Alpine.data('managementShell', () => ({
    sidebarOpen: false,
    isMobile: innerWidth <= 1000,
    previousFocus: null,
    init() {
        window.addEventListener('resize', () => {
            this.isMobile = innerWidth <= 1000;
            if (!this.isMobile) this.sidebarOpen = false;
        });
    },
    toggleSidebar() {
        if (this.sidebarOpen) return this.closeSidebar();
        this.previousFocus = document.activeElement;
        this.sidebarOpen = true;
        this.$nextTick(() => this.$refs.sidebar?.querySelector('a,button')?.focus());
    },
    closeSidebar() {
        if (!this.sidebarOpen) return;
        this.sidebarOpen = false;
        this.$nextTick(() => this.previousFocus?.focus());
    },
    trapSidebar(event) {
        if (!this.sidebarOpen || innerWidth > 1000) return;
        const controls = [...this.$refs.sidebar.querySelectorAll('a[href],button')].filter(e => e.getClientRects().length);
        const first = controls[0], last = controls.at(-1);
        if (!controls.includes(document.activeElement) || (event.shiftKey && document.activeElement === first)) {
            event.preventDefault(); (event.shiftKey ? last : first)?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault(); first?.focus();
        }
    },
}));
Alpine.start();
