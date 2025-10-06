// Centralized loader for leaflet and react-leaflet to avoid duplicated dynamic import code
export async function loadLeafletModules() {
    const [LModule, RLModule] = await Promise.all([import("leaflet"), import("react-leaflet")]);
    const L = (LModule && (LModule as any).default) || LModule;

    // Try to set default marker icons if available. The caller components may pass URLs
    try {
        // nothing to require here; keep try block for future fallback
    } catch (e) {
        // noop
    }

    return { L, RLModule };
}
