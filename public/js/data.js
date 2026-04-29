// Данные о товарах
const products = [
    {
        id: 1,
        name: "Sony WH-1000XM5",
        brand: "Sony",
        category: "headphones",
        price: 29990,
        description: "Беспроводные наушники с активным шумоподавлением и премиальным звуком",
        image: "🎧"
    },
    {
        id: 2,
        name: "Bose QuietComfort 45",
        brand: "Bose",
        category: "headphones",
        price: 27990,
        description: "Комфортные наушники с лучшим в мире шумоподавлением",
        image: "🎧"
    },
    {
        id: 3,
        name: "Sennheiser HD 660S",
        brand: "Sennheiser",
        category: "headphones",
        price: 34990,
        description: "Профессиональные открытые наушники для аудиофилов",
        image: "🎧"
    },
    {
        id: 4,
        name: "AirPods Pro 2",
        brand: "Apple",
        category: "headphones",
        price: 19990,
        description: "Беспроводные наушники с пространственным звуком",
        image: "🎧"
    },
    {
        id: 5,
        name: "Audio-Technica ATH-M50x",
        brand: "Audio-Technica",
        category: "headphones",
        price: 12990,
        description: "Студийные мониторные наушники с отличным звуком",
        image: "🎧"
    },
    {
        id: 6,
        name: "JBL Flip 6",
        brand: "JBL",
        category: "speakers",
        price: 8990,
        description: "Портативная Bluetooth колонка с мощным басом",
        image: "🔊"
    },
    {
        id: 7,
        name: "Sonos Beam",
        brand: "Sonos",
        category: "speakers",
        price: 39990,
        description: "Компактная звуковая панель для телевизора",
        image: "🔊"
    },
    {
        id: 8,
        name: "Bose SoundLink Revolve+",
        brand: "Bose",
        category: "speakers",
        price: 24990,
        description: "Портативная колонка с объемным звуком 360°",
        image: "🔊"
    },
    {
        id: 9,
        name: "JBL PartyBox 310",
        brand: "JBL",
        category: "speakers",
        price: 49990,
        description: "Мощная портативная колонка для вечеринок",
        image: "🔊"
    },
    {
        id: 10,
        name: "Yamaha HS8",
        brand: "Yamaha",
        category: "speakers",
        price: 34990,
        description: "Студийные мониторы для профессиональной записи",
        image: "🔊"
    },
    {
        id: 11,
        name: "Shure SM7B",
        brand: "Shure",
        category: "microphones",
        price: 29990,
        description: "Легендарный динамический микрофон для студии",
        image: "🎤"
    },
    {
        id: 12,
        name: "Audio-Technica AT2020",
        brand: "Audio-Technica",
        category: "microphones",
        price: 8990,
        description: "Конденсаторный микрофон для записи вокала",
        image: "🎤"
    },
    {
        id: 13,
        name: "Rode NT1-A",
        brand: "Rode",
        category: "microphones",
        price: 12990,
        description: "Студийный конденсаторный микрофон с низким уровнем шума",
        image: "🎤"
    },
    {
        id: 14,
        name: "Blue Yeti",
        brand: "Blue",
        category: "microphones",
        price: 14990,
        description: "USB микрофон с несколькими режимами записи",
        image: "🎤"
    },
    {
        id: 15,
        name: "Sennheiser MKH 416",
        brand: "Sennheiser",
        category: "microphones",
        price: 44990,
        description: "Профессиональный направленный микрофон для видео",
        image: "🎤"
    },
    {
        id: 16,
        name: "Focusrite Scarlett Solo",
        brand: "Focusrite",
        category: "amplifiers",
        price: 8990,
        description: "USB аудиоинтерфейс для домашней студии",
        image: "🎛️"
    },
    {
        id: 17,
        name: "PreSonus AudioBox USB 96",
        brand: "PreSonus",
        category: "amplifiers",
        price: 6990,
        description: "Компактный аудиоинтерфейс для записи",
        image: "🎛️"
    },
    {
        id: 18,
        name: "Yamaha MG10XU",
        brand: "Yamaha",
        category: "amplifiers",
        price: 19990,
        description: "Аналоговый микшерный пульт с USB",
        image: "🎛️"
    },
    {
        id: 19,
        name: "Universal Audio Apollo Twin",
        brand: "Universal Audio",
        category: "amplifiers",
        price: 89990,
        description: "Профессиональный аудиоинтерфейс с DSP",
        image: "🎛️"
    },
    {
        id: 20,
        name: "Behringer U-Phoria UMC202HD",
        brand: "Behringer",
        category: "amplifiers",
        price: 5990,
        description: "Доступный USB аудиоинтерфейс с качественными преампами",
        image: "🎛️"
    },
    {
        id: 21,
        name: "AudioQuest DragonFly Red",
        brand: "AudioQuest",
        category: "accessories",
        price: 12990,
        description: "Портативный USB ЦАП для улучшения звука",
        image: "🔌"
    },
    {
        id: 22,
        name: "FiiO BTR5",
        brand: "FiiO",
        category: "accessories",
        price: 8990,
        description: "Bluetooth усилитель с поддержкой Hi-Res",
        image: "🔌"
    },
    {
        id: 23,
        name: "Cable Matters USB-C",
        brand: "Cable Matters",
        category: "accessories",
        price: 1990,
        description: "Качественный аудиокабель для наушников",
        image: "🔌"
    },
    {
        id: 24,
        name: "K&M 210/9 Stand",
        brand: "K&M",
        category: "accessories",
        price: 2990,
        description: "Профессиональная стойка для микрофона",
        image: "🔌"
    },
    {
        id: 25,
        name: "Pop Filter",
        brand: "Generic",
        category: "accessories",
        price: 990,
        description: "Поп-фильтр для устранения взрывных согласных",
        image: "🔌"
    }
];

if (typeof module !== "undefined" && module.exports) {
    module.exports = { products };
}
