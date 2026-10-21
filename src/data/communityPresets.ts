import { VehicleCategory, MetricType, QuickSpecs, MaintenanceRule } from '@/types/garage';

export interface CommunityPreset {
  id: string;
  name: string;
  category: VehicleCategory;
  primaryMetric: MetricType;
  author: string;
  verifiedCount: number;
  createdAt: string;
  specs: QuickSpecs;
  rules: {
    name: string;
    intervalHours?: number;
    intervalKm?: number;
    intervalMonths?: number;
  }[];
}

export const INITIAL_COMMUNITY_PRESETS: CommunityPreset[] = [
  {
    id: 'comm-suzuki-df20a',
    name: 'Suzuki DF9.9BS / DF15A / DF20A (Инжекторный 4Т)',
    category: 'marine',
    primaryMetric: 'hours',
    author: 'Игорь_Рыбалка',
    verifiedCount: 18,
    createdAt: '2026-09-12',
    specs: {
      engineOil: 'Motul Outboard Synth 10W-40 4T FC-W',
      engineOilCapacity: '1.0 л (с фильтром 1.1 л)',
      gearOil: 'Suzuki Marine Gear Oil SAE 90 (430 мл)',
      oilFilter: 'Suzuki 16510-05240 / Mann W 67/2',
      sparkPlugs: 'NGK CPR6EA-9 (зазор 0.9 мм)',
      drainPlugTorque: 'Сливная пробка картера 20 Нм',
      notes: 'Очень популярный мотор под раздушку до 20 л.с. Масло менять раз в 100 м/ч или перед зимой.',
    },
    rules: [
      { name: 'Замена масла ДВС и масляного фильтра', intervalHours: 100, intervalMonths: 12 },
      { name: 'Замена трансмиссионного масла в редукторе', intervalHours: 100, intervalMonths: 12 },
      { name: 'Шприцевание поворотных тавотниц Marine Grease', intervalHours: 50 },
      { name: 'Замена свечей зажигания', intervalHours: 100 },
      { name: 'Замена крыльчатки помпы охлаждения', intervalHours: 200, intervalMonths: 24 },
    ],
  },
  {
    id: 'comm-cfmoto-cforce600',
    name: 'CFMOTO CFORCE 600 EPS (Квадроцикл)',
    category: 'enduro_pit',
    primaryMetric: 'km',
    author: 'ATV_North_Spb',
    verifiedCount: 24,
    createdAt: '2026-08-04',
    specs: {
      engineOil: '10W-40 4T ATV Synthetic (JASO MA2)',
      engineOilCapacity: '2.8 л (с фильтром)',
      gearOil: '80W-90 GL-5 (передний редуктор 250 мл, задний редуктор 300 мл)',
      oilFilter: 'CFMOTO 0800-011300-0004 / HF152',
      airFilter: 'CFMOTO поролоновый с пропиткой',
      sparkPlugs: 'NGK DCPR8E (зазор 0.8-0.9 мм)',
      pressures: '0.35 - 0.45 бар (перед/зад)',
      notes: 'Обязательно шприцевать все втулки рычагов и крестовины кардана после каждого брода!',
    },
    rules: [
      { name: 'Замена моторного масла и фильтра', intervalKm: 1000, intervalMonths: 6 },
      { name: 'Замена масла в переднем и заднем редукторах', intervalKm: 2000, intervalMonths: 12 },
      { name: 'Шприцевание подвески и крестовин кардана', intervalKm: 300 },
      { name: 'Очистка и пропитка воздушного фильтра', intervalKm: 500 },
    ],
  },
  {
    id: 'comm-sea-doo-spark',
    name: 'BRP Sea-Doo Spark 900 ACE (Гидроцикл)',
    category: 'marine',
    primaryMetric: 'hours',
    author: 'WaterRacer_77',
    verifiedCount: 15,
    createdAt: '2026-07-19',
    specs: {
      engineOil: 'XPS 4-Stroke 5W-40 Synthetic Blend',
      engineOilCapacity: '2.0 л (с заменой фильтра)',
      oilFilter: 'Rotax 420956123 / HF556',
      sparkPlugs: 'NGK CR8EB (зазор 0.7-0.8 мм)',
      notes: 'Специфика гидроцикла: откачка масла только через щуп экстрактором. Обязательная консервация с туманом в цилиндры перед морозами.',
    },
    rules: [
      { name: 'Замена моторного масла и фильтра', intervalHours: 50, intervalMonths: 12 },
      { name: 'Консервация на зиму (стабилизатор + осушение)', intervalMonths: 12 },
      { name: 'Проверка водомета и импеллера', intervalHours: 50 },
    ],
  },
  {
    id: 'comm-honda-crf250l',
    name: 'Honda CRF 250L / Rally (Dual Sport)',
    category: 'road_moto',
    primaryMetric: 'km',
    author: 'DualSport_Traveler',
    verifiedCount: 31,
    createdAt: '2026-05-30',
    specs: {
      engineOil: '10W-30 / 10W-40 JASO MA2',
      engineOilCapacity: '1.4 л (с фильтром 1.5 л)',
      oilFilter: 'HF107 / Honda 15412-MGS-D21',
      sparkPlugs: 'NGK SIMR8A9 (иридиевая, зазор 0.9 мм)',
      drainPlugTorque: '24 Нм (шайба М12)',
      pressures: 'Перед 1.5 / Зад 1.5 бар',
      notes: 'Очень надежный эндуро-турист. Цепь 520-106, провис 25-35 мм.',
    },
    rules: [
      { name: 'Замена моторного масла и фильтра', intervalKm: 5000, intervalMonths: 12 },
      { name: 'Очистка воздушного фильтра', intervalKm: 5000 },
      { name: 'Проверка клапанных зазоров', intervalKm: 24000 },
    ],
  },
  {
    id: 'comm-tohatsu-9-8-2t',
    name: 'Tohatsu 9.8B / Nissan Marine 9.8 (2Т)',
    category: 'marine',
    primaryMetric: 'hours',
    author: 'Капитан_Север',
    verifiedCount: 42,
    createdAt: '2026-06-15',
    specs: {
      fuelMix: '1:50 (бензин АИ-92 + масло 2Т TC-W3)',
      gearOil: 'SAE 90 Marine Gear Lube (320 мл)',
      sparkPlugs: 'NGK BP7HS-10 (зазор 1.0 мм)',
      drainPlugTorque: 'Винты редуктора 7 Нм (шайбы менять при замене)',
      notes: 'Легендарный легкий мотор (26 кг). Редуктор проверять на эмульсию каждую осень.',
    },
    rules: [
      { name: 'Замена трансмиссионного масла в редукторе', intervalHours: 100, intervalMonths: 12 },
      { name: 'Замена свечей зажигания', intervalHours: 100 },
      { name: 'Осенняя консервация перед заморозками', intervalMonths: 12 },
    ],
  },
];
