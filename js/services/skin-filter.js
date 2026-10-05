export function primarySkins(skins) {
    // Data Dragon nombra las variantes como «Aspecto (Color)».
    // Excluirlas sólo si existe el aspecto principal del mismo campeón.
    const normalize = (name) =>
        name
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase()
            .trim();
    const names = new Set(skins.map((skin) => normalize(skin.name)));
    return skins.filter((skin) => {
        const name = normalize(skin.name);
        const base = name.replace(/\s*\([^)]*\)\s*$/, '').trim();
        return base === name || !names.has(base);
    });
}
