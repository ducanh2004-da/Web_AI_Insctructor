import { ProgressStatus } from '@prisma/client';
export interface ProgressState {
  calculate(
    completedLessons: number,
    totalLessons: number
  ): { percentage: number; status: ProgressStatus };
  notify?(progressResult: {
    percentage: number;
    status: ProgressStatus;
  }): void; // tuỳ chọn, nếu bạn muốn thêm notification
}