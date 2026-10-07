// Traducciones de los métodos registrados por Meraki. No indican disponibilidad actual.
const methods = new Map([
    [
        'Reward for finishing the ranked season in Gold or higher.',
        'Recompensa por terminar la temporada clasificatoria en Oro o superior.',
    ],
    [
        'Given to players who owned the original skin prior to patch 12.5',
        'Entrega a quienes poseían la skin original antes del parche 12.5.',
    ],
    [
        'Reward for finishing the ranked season with Honor level 5.',
        'Recompensa por terminar la temporada clasificatoria con nivel de Honor 5.',
    ],
    [
        'Purchase the Risen Legend Collection during the Hall of Legends event.',
        'Compra de la colección Leyenda en Ascenso durante el evento Hall of Legends.',
    ],
    ["Pre-order Digital Collector's Edition", 'Reserva de la edición digital de coleccionista.'],
    ["Pre-order Retail Collector's edition", 'Reserva de la edición física de coleccionista.'],
    ["Digital Collector's Pack", 'Pack digital de coleccionista.'],
    ['Youtube Distribution', 'Promoción de YouTube.'],
    ['Twitter Distribution', 'Promoción de Twitter.'],
    ['Facebook Distribution', 'Promoción de Facebook.'],
    ['Limited Availability', 'Disponibilidad limitada; la fuente no especifica el método.'],
    ['Limited Distribution', 'Distribución limitada; la fuente no especifica el método.'],
    ['Limited Purchase', 'Compra durante un período limitado.'],
    ['Code Redemption', 'Canje de un código promocional.'],
    ['Retail Purchase', 'Compra de una edición física del juego.'],
    ['Tournament Participation', 'Participación en un torneo.'],
    ['Champion Bundle', 'Pack de campeones.'],
    ['Honor Capsule', 'Cápsula de Honor.'],
    ['Essence Emporium', 'Emporio de Esencias.'],
    ['Hall of Legends Premium Pass reward (Level 10).', 'Recompensa del pase prémium de Hall of Legends, nivel 10.'],
    [
        "Reward for completing all three acts for the 'Jinx Fixes Everything' minigame",
        'Recompensa por completar los tres actos del minijuego Jinx Fixes Everything.',
    ],
    [
        'Code Redemption and obtainable for a limited time period as a Hextech Crafting skin, requiring 10 Gemstone.',
        'Canje de un código y, durante un período limitado, artesanía Hextech a cambio de 10 gemas.',
    ],
]);

export function describeAcquisition(distribution) {
    if (typeof distribution !== 'string') return 'Sin información confirmada.';
    const value = distribution.trim();
    if (methods.has(value)) return methods.get(value);
    let match = value.match(/^(\d+) Mythic Essence$/);
    if (match) return `Canje por ${match[1]} esencias míticas, según el registro de la fuente.`;
    match = value.match(/^(\d+)(?:th|st|nd|rd) Anniversary Reward$/);
    if (match) return `Recompensa del aniversario ${match[1]} de League of Legends.`;
    match = value.match(/^Reward for earning split points in Season (\d{4}) - Split (\d+)\.$/);
    if (match) return `Recompensa por obtener puntos en el split ${match[2]} de la temporada ${match[1]}.`;
    match = value.match(/^(\d{4}), S(\d+) Act (\d+) (Premium|Free) Battle Pass reward \(Level (\d+)\)$/);
    if (match)
        return `Recompensa del pase ${match[4] === 'Premium' ? 'prémium' : 'gratuito'} de ${match[1]}, temporada ${match[2]}, acto ${match[3]}, nivel ${match[5]}.`;
    match = value.match(/^([\d.]+)% drop rate from the Sanctum or opening (\d+) Ancient Sparks$/);
    if (match)
        return `El Santuario: probabilidad registrada del ${match[1].replace('.', ',')} %, o al abrir ${match[2]} chispas ancestrales.`;
    match = value.match(/^([\d.]+)% drop rate from (.+?) or opening (\d+) (.+)$/);
    if (match && match[2] === match[4]) {
        const capsules = new Map([
            ['Capsules', 'cápsulas'],
            ['Breakout 2023 Capsules', 'cápsulas Breakout 2023'],
            ['Cosmic 2023 Capsules', 'cápsulas Cósmicas 2023'],
            ['Divine 2024 Capsules', 'cápsulas Divinas 2024'],
            ['Anima Squad 2024 Capsules', 'cápsulas de Escuadrón Ánima 2024'],
            ['High Noon 2024 Capsules', 'cápsulas de Forajidos 2024'],
        ]);
        const name = capsules.get(match[2]);
        if (name)
            return `Probabilidad registrada del ${match[1].replace('.', ',')} % en ${name}, o al abrir ${match[3]} de ellas.`;
    }
    return 'Sin información confirmada.';
}
