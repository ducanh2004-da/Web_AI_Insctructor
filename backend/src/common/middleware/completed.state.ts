import { ProgressState } from '../interfaces/progress-state.interface';
import { ProgressStatus } from '@prisma/client';

export class CompletedState implements ProgressState {
  calculate(completedLessons: number, totalLessons: number) {
    // Khi gọi calculate nghĩa là đã tiến đến trạng thái completed
    return { percentage: 100, status: ProgressStatus.COMPLETED };
  }

  notify(progressResult: {
    percentage: number;
    status: ProgressStatus;
  }) {
    // Ví dụ: gửi email chúc mừng hoặc log
    console.log(`✅ Completed: Khoá học đã hoàn tất!`);
  }
}