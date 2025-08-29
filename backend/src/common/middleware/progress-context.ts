import { ProgressState } from '../interfaces/progress-state.interface';
import { InProgressState } from './in-progress.state';
import { CompletedState } from './completed.state';
import { ProgressStatus } from '@prisma/client';

export class ProgressContext {
  private state: ProgressState;

  constructor(initialStatus: ProgressStatus) {
    this.state = initialStatus === ProgressStatus.COMPLETED
      ? new CompletedState()
      : new InProgressState();
  }

  // Khi có completedLessons cập nhật, ta delegate
  public handleCalculate(
    completedLessons: number,
    totalLessons: number
  ): { percentage: number; status: ProgressStatus } {
    const result = this.state.calculate(completedLessons, totalLessons);

    // Nếu vừa chuyển sang completed, thay đổi state
    if (result.status === ProgressStatus.COMPLETED &&
        !(this.state instanceof CompletedState)) {
      this.state = new CompletedState();
    }

    // Gọi notify (nếu có)
    if (typeof this.state.notify === 'function') {
      this.state.notify(result);
    }

    return result;
  }
}