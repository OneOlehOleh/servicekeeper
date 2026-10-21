import { MaintenanceRule, Vehicle, RuleStatusInfo, UrgencyStatus } from '@/types/garage';

export function calculateRuleStatus(rule: MaintenanceRule, vehicle: Vehicle): RuleStatusInfo {
  let isOverdue = false;
  let isDueSoon = false;
  let remainingUnits = Infinity;
  let unitLabel = '';
  let description = '';

  const currentDate = new Date();
  const lastDate = new Date(rule.lastPerformedDate);
  const monthsElapsed = (currentDate.getFullYear() - lastDate.getFullYear()) * 12 + (currentDate.getMonth() - lastDate.getMonth());

  // Check Hours
  if (rule.intervalHours !== undefined && vehicle.currentHours !== undefined) {
    const lastHours = rule.lastPerformedHours ?? 0;
    const hoursElapsed = vehicle.currentHours - lastHours;
    const hoursRemaining = rule.intervalHours - hoursElapsed;
    
    remainingUnits = Math.round(hoursRemaining * 10) / 10;
    unitLabel = 'м/ч';

    if (hoursRemaining <= 0) {
      isOverdue = true;
      description = `Просрочено на ${Math.abs(remainingUnits)} м/ч`;
    } else if (hoursRemaining <= 3.0 || hoursRemaining <= rule.intervalHours * 0.15) {
      isDueSoon = true;
      description = `Осталось ${remainingUnits} м/ч`;
    } else {
      description = `Осталось ${remainingUnits} м/ч`;
    }
  }

  // Check Km
  if (rule.intervalKm !== undefined && vehicle.currentKm !== undefined) {
    const lastKm = rule.lastPerformedKm ?? 0;
    const kmElapsed = vehicle.currentKm - lastKm;
    const kmRemaining = rule.intervalKm - kmElapsed;

    // If metric is km or this takes priority
    if (vehicle.primaryMetric === 'km' || remainingUnits === Infinity) {
      remainingUnits = kmRemaining;
      unitLabel = 'км';

      if (kmRemaining <= 0) {
        isOverdue = true;
        description = `Просрочено на ${Math.abs(kmRemaining).toLocaleString('ru-RU')} км`;
      } else if (kmRemaining <= 1000 || kmRemaining <= rule.intervalKm * 0.15) {
        isDueSoon = true;
        description = `Осталось ${kmRemaining.toLocaleString('ru-RU')} км`;
      } else {
        description = `Осталось ${kmRemaining.toLocaleString('ru-RU')} км`;
      }
    }
  }

  // Check Months (calendar-based)
  if (rule.intervalMonths !== undefined) {
    const monthsRemaining = rule.intervalMonths - monthsElapsed;
    if (monthsRemaining <= 0) {
      isOverdue = true;
      if (remainingUnits === Infinity || monthsRemaining < 0) {
        description = `Просрочено по времени (${Math.abs(monthsRemaining)} мес. назад)`;
      }
    } else if (monthsRemaining <= 1) {
      if (!isOverdue) isDueSoon = true;
      if (remainingUnits === Infinity) {
        description = `Срок через ${monthsRemaining} мес.`;
      }
    }
  }

  const status: UrgencyStatus = isOverdue ? 'overdue' : isDueSoon ? 'due_soon' : 'ok';

  return {
    rule,
    status,
    remainingUnits,
    unitLabel,
    description: description || 'В норме',
  };
}

export function getVehicleUrgency(vehicle: Vehicle): {
  overallStatus: UrgencyStatus;
  overdueCount: number;
  dueSoonCount: number;
  rulesStatus: RuleStatusInfo[];
} {
  const rulesStatus = vehicle.rules.map((rule) => calculateRuleStatus(rule, vehicle));
  const overdueCount = rulesStatus.filter((r) => r.status === 'overdue').length;
  const dueSoonCount = rulesStatus.filter((r) => r.status === 'due_soon').length;

  let overallStatus: UrgencyStatus = 'ok';
  if (overdueCount > 0) overallStatus = 'overdue';
  else if (dueSoonCount > 0) overallStatus = 'due_soon';

  return {
    overallStatus,
    overdueCount,
    dueSoonCount,
    rulesStatus,
  };
}
