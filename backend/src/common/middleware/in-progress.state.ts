import { ProgressState } from '../interfaces/progress-state.interface';
import { ProgressStatus } from '@prisma/client';

export class InProgressState implements ProgressState {
  calculate(completedLessons: number, totalLessons: number) {
    const percentage = totalLessons > 0
      ? Math.min(100, (completedLessons / totalLessons) * 100)
      : 0;
    return { percentage, status: ProgressStatus.IN_PROGRESS };
  }

  notify(progressResult: {
    percentage: number;
    status: ProgressStatus;
  }) {
    // Ví dụ: gửi notification “Bạn đã hoàn thành X% khoá học”
    console.log(`🛈 InProgress: Đã hoàn thành ${progressResult.percentage}%`);
  }
}