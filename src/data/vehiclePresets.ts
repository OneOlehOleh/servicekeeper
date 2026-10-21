import { VehicleCategory, MetricType, QuickSpecs, MaintenanceRule } from '@/types/garage';

export interface VehiclePreset {
  id: string;
  name: string;
  category: VehicleCategory;
  primaryMetric: MetricType;
  specs: QuickSpecs;
  rules: {
    name: string;
    intervalHours?: number;
    intervalKm?: number;
    intervalMonths?: number;
  }[];
}

export const POPULAR_PRESETS: VehiclePreset[] = [
  // --- ROAD BIKES ---
  {
    id: 'bmw-f800gs',
    name: 'BMW F800GS / F800R (Rotax 798cc)',
    category: 'road_moto',
    primaryMetric: 'km',
    specs: {
      engineOil: '15W-50 API SL / JASO MA2',
      engineOilCapacity: '2.9 л (с фильтром)',
      oilFilter: 'HF160 / Mahle OC306',
      airFilter: 'Mann C 15 143',
      sparkPlugs: 'NGK DCPR8E (зазор 0.8-0.9 мм)',
      drainPlugTorque: '40 Нм (медная шайба М24)',
      pressures: 'Перед 2.2 / Зад 2.5 бар (с кофрами 2.9 бар)',
      notes: 'Цепь 525-116, провис 35-40 мм. Тормозная жидкость DOT 4 каждые 2 года.',
    },
    rules: [
      { name: 'Замена моторного масла и фильтра', intervalKm: 10000 },
      { name: 'Замена воздушного фильтра', intervalKm: 10000 },
      { name: 'Проверка зазоров клапанов', intervalKm: 20000 },
      { name: 'Замена тормозной жидкости (DOT 4)', intervalMonths: 24 },
    ],
  },
  {
    id: 'bmw-r1200gs',
    name: 'BMW R1200GS / R1250GS (Boxer)',
    category: 'road_moto',
    primaryMetric: 'km',
    specs: {
      engineOil: '5W-40 API SL / JASO MA2 (Advantec)',
      engineOilCapacity: '4.0 л (с фильтром)',
      oilFilter: 'HF164 / Mahle OC619',
      gearOil: '75W-90 GL-5 (редуктор заднего моста, 180 мл)',
      sparkPlugs: 'NGK LMAR8D-J (зазор 0.8 мм)',
      drainPlugTorque: 'Картер 42 Нм / Редуктор 20 Нм',
      pressures: 'Перед 2.5 / Зад 2.9 бар',
      notes: 'Карданная передача. Замена масла в редукторе моста каждые 20 000 км или 2 года.',
    },
    rules: [
      { name: 'Замена моторного масла и фильтра', intervalKm: 10000 },
      { name: 'Замена масла в заднем редукторе моста', intervalKm: 20000 },
      { name: 'Проверка клапанов и фаз', intervalKm: 20000 },
    ],
  },

  // --- MARINE (ПЛМ И КАТЕРА) ---
  {
    id: 'parsun-40-fets',
    name: 'Parsun 40 FETS / F50 (4-тактный ПЛМ)',
    category: 'marine',
    primaryMetric: 'hours',
    specs: {
      engineOil: '10W-30 / 10W-40 4T Outboard NMMA FC-W',
      engineOilCapacity: '2.0 л (с фильтром 2.1 л)',
      gearOil: 'Hypoid Marine Gear Lube SAE 90 (430 мл)',
      oilFilter: 'Parsun F40-0200000 / Yamaha 5GH-13440',
      sparkPlugs: 'NGK DPR7EA-9 (зазор 0.9 мм)',
      drainPlugTorque: 'Картер 28 Нм / Редуктор 7 Нм',
      notes: 'Шприцевание поворотных тавотниц Marine Grease каждые 50 м/ч. Консервация на зиму.',
    },
    rules: [
      { name: 'Замена моторного масла и фильтра', intervalHours: 100, intervalMonths: 12 },
      { name: 'Замена масла в редукторе (дейдвуд)', intervalHours: 100, intervalMonths: 12 },
      { name: 'Шприцевание поворотных тавотниц', intervalHours: 50 },
      { name: 'Замена крыльчатки помпы', intervalHours: 200, intervalMonths: 24 },
      { name: 'Замена топливного сепаратора', intervalHours: 100, intervalMonths: 12 },
    ],
  },
  {
    id: 'yamaha-25-2t',
    name: 'Yamaha 25 / 30 FHMS / GMHS (2-тактный ПЛМ)',
    category: 'marine',
    primaryMetric: 'hours',
    specs: {
      fuelMix: '1:50 (АИ-92 + масло 2T NMMA TC-W3)',
      gearOil: 'Yamalube Outboard Gear Lube SAE 90 (320 мл)',
      sparkPlugs: 'NGK BR7HS-10 (зазор 1.0 мм)',
      drainPlugTorque: 'Винты редуктора 7 Нм',
      notes: '2-тактный карбюраторный. При консервации вырабатывать бензин из поплавковой камеры.',
    },
    rules: [
      { name: 'Замена масла в редукторе', intervalHours: 100, intervalMonths: 12 },
      { name: 'Ревизия и замена свечей зажигания', intervalHours: 100 },
      { name: 'Замена крыльчатки охлаждения', intervalHours: 200, intervalMonths: 24 },
      { name: 'Сезонная консервация на зиму', intervalMonths: 12 },
    ],
  },
  {
    id: 'yamaha-9-9-15',
    name: 'Yamaha / Hidea / Seanovo 9.9 - 15 (2-тактный)',
    category: 'marine',
    primaryMetric: 'hours',
    specs: {
      fuelMix: '1:50 (бензин АИ-92 + масло TC-W3)',
      gearOil: 'SAE 90 Marine Gear Lube (250 мл)',
      sparkPlugs: 'NGK B7HS-10 (зазор 1.0 мм)',
      notes: 'Самый массовый 2Т лодочный мотор. Замена масла в редукторе перед зимой обязательно.',
    },
    rules: [
      { name: 'Замена масла в редукторе', intervalHours: 100, intervalMonths: 12 },
      { name: 'Проверка свечей зажигания', intervalHours: 100 },
    ],
  },

  // --- ENDURO & PITBIKES ---
  {
    id: 'zongshen-172fmm',
    name: 'BRZ 250 / Avantis / GR7 (Двигатель 172FMM 250cc)',
    category: 'enduro_pit',
    primaryMetric: 'hours',
    specs: {
      engineOil: '10W-40 4T Synthetic / JASO MA2',
      engineOilCapacity: '1.1 л',
      airFilter: 'Поролон TwinAir (липкая пропитка фильтра)',
      sparkPlugs: 'NGK D8EA / Torch D8TC (зазор 0.7 мм)',
      drainPlugTorque: '22 Нм (болт М12 с магнитом)',
      pressures: 'Перед 0.9 / Зад 0.8 бар (с буксатором)',
      notes: 'Смена масла каждые 15 м/ч в режиме эндуро. Мыть фильтр после каждой пыльной покатушки.',
    },
    rules: [
      { name: 'Замена масла ДВС', intervalHours: 15 },
      { name: 'Промывка и пропитка воздушного фильтра', intervalHours: 5 },
      { name: 'Проверка зазоров клапанов (вп 0.06 / вып 0.08)', intervalHours: 35 },
      { name: 'Смазка и натяжение цепи', intervalHours: 4 },
    ],
  },
  {
    id: 'pitbike-yx150',
    name: 'Apollo / Kayo / BSE (Питбайк YX140 / YX150 / YX160)',
    category: 'enduro_pit',
    primaryMetric: 'hours',
    specs: {
      engineOil: '10W-40 4T Motorcycle Oil',
      engineOilCapacity: '0.9 л (по щупу без вкручивания)',
      oilFilter: 'Сетка в картере / центрифуга',
      airFilter: 'Поролоновый нулевик с чехлом',
      sparkPlugs: 'NGK CR7HSA / A7TC',
      drainPlugTorque: '18 Нм',
      pressures: 'Перед 1.2 / Зад 1.2 бар',
      notes: 'Смена масла каждые 10 м/ч. Проверять затяжку спиц колес и болтов маятника.',
    },
    rules: [
      { name: 'Замена масла в двигателе', intervalHours: 10 },
      { name: 'Обслуживание воздушного фильтра', intervalHours: 5 },
      { name: 'Регулировка клапанов (0.05 / 0.07 мм)', intervalHours: 25 },
    ],
  },
  {
    id: 'ktm-300-exc',
    name: 'KTM 250 / 300 EXC TPI (2-тактный хард-эндуро)',
    category: 'enduro_pit',
    primaryMetric: 'hours',
    specs: {
      engineOil: 'Motorex Top Speed 4T 15W-50 (КПП 800 мл)',
      airFilter: 'TwinAir поролон с пропиткой',
      sparkPlugs: 'NGK BR7ES',
      notes: 'Замена масла в КПП каждые 20 м/ч. Замена поршня каждые 80-100 м/ч.',
    },
    rules: [
      { name: 'Замена масла в коробке передач', intervalHours: 20 },
      { name: 'Мойка и пропитка воздушного фильтра', intervalHours: 5 },
      { name: 'Ревизия / замена поршнекомплекта', intervalHours: 90 },
    ],
  },

  // --- CARS ---
  {
    id: 'car-general-synth',
    name: 'Легковой автомобиль (Бензин 5W-30 / 5W-40)',
    category: 'car',
    primaryMetric: 'km',
    specs: {
      engineOil: '5W-30 / 5W-40 Full Synthetic (API SP / ACEA A3/B4)',
      engineOilCapacity: '4.0 - 4.5 л',
      pressures: '2.2 - 2.4 бар',
      notes: 'Замена масла каждые 7 500 - 10 000 км в городском цикле.',
    },
    rules: [
      { name: 'Замена моторного масла и фильтра', intervalKm: 8000, intervalMonths: 12 },
      { name: 'Замена воздушного и салонного фильтров', intervalKm: 15000 },
      { name: 'Замена тормозной жидкости (DOT 4)', intervalMonths: 24 },
    ],
  },

  // --- POWER EQUIPMENT (САДОВАЯ / СИЛОВАЯ) ---
  {
    id: 'garden-generator-gx',
    name: 'Генератор / Мотоблок (Honda GX200 / Loncin 168F-170F)',
    category: 'power_equipment',
    primaryMetric: 'hours',
    specs: {
      engineOil: '10W-30 / SAE 30 4T Small Engine',
      engineOilCapacity: '0.6 л',
      sparkPlugs: 'NGK BPR6ES / F7TC (зазор 0.7 мм)',
      notes: 'Воздушное охлаждение. Замена масла каждые 25-50 м/ч.',
    },
    rules: [
      { name: 'Замена моторного масла', intervalHours: 25, intervalMonths: 12 },
      { name: 'Очистка поролонового фильтра', intervalHours: 25 },
    ],
  },
];
