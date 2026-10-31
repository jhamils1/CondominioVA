// La revocación puede fallar por conectividad; la sesión local se limpia siempre.
export async function closeSession({ access, refresh, revoke, clear }) {
  try {
    if (!access || !refresh) return false;
    await revoke(access, refresh);
    return true;
  } catch {
    return false;
  } finally {
    clear();
  }
}
