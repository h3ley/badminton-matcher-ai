self.getAppVersion = async function getAppVersion() {
    try {
        const res = await fetch('/version.txt', { cache: 'no-store' });
        if (!res.ok) throw new Error('fetch failed');
        return (await res.text()).trim();
    } catch {
        return 'unknown';
    }
};