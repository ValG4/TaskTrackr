import { getTasksForDate } from '../components/Tasks';

// Mock tasks with different date formats that might come from the database
const mockTasks = [
  {
    id: 1,
    title: 'Task with database format',
    dueDate: '2025-10-07 18:03:00+00',
    priority: 'high'
  },
  {
    id: 2,
    title: 'Task with different date',
    dueDate: '2025-10-08 09:15:00+00',
    priority: 'medium'
  },
  {
    id: 3,
    title: 'Task without due date',
    dueDate: null,
    priority: 'low'
  },
  {
    id: 4,
    title: 'Task with ISO format',
    dueDate: '2025-10-07T18:03:00.000Z',
    priority: 'high'
  },
  {
    id: 5,
    title: 'Task with just date',
    dueDate: '2025-10-07',
    priority: 'low'
  }
];

describe('Date Handling Tests', () => {
  test('should match tasks with October 7, 2025 dates', () => {
    const targetDate = new Date(2025, 9, 7); // October 7, 2025 (month is 0-indexed)
    const matchingTasks = getTasksForDate(targetDate, mockTasks);

    console.log('Matching tasks:', matchingTasks.map(t => ({ id: t.id, dueDate: t.dueDate })));
    console.log('Expected: tasks 1, 4, and 5 (all October 7, 2025)');

    expect(matchingTasks).toHaveLength(3); // Should match tasks 1, 4, and 5
    expect(matchingTasks.map(t => t.id)).toEqual(expect.arrayContaining([1, 4, 5]));
  });

  test('should not match tasks with different dates', () => {
    const targetDate = new Date(2025, 9, 7); // October 7, 2025
    const matchingTasks = getTasksForDate(targetDate, mockTasks);

    // Should NOT match task 2 (which is Oct 8) or task 3 (no due date)
    expect(matchingTasks.map(t => t.id)).not.toContain(2);
    expect(matchingTasks.map(t => t.id)).not.toContain(3);
  });

  test('should handle tasks without due dates', () => {
    const targetDate = new Date(2025, 9, 7);
    const matchingTasks = getTasksForDate(targetDate, mockTasks);

    // Should NOT match task 3 (no due date)
    expect(matchingTasks.map(t => t.id)).not.toContain(3);
  });

  test('should handle different date formats', () => {
    const targetDate = new Date(2025, 9, 7);
    const matchingTasks = getTasksForDate(targetDate, mockTasks);

    // Should match database format, ISO format, and date-only format
    expect(matchingTasks).toHaveLength(3);
  });

  test('should handle edge cases', () => {
    // Test with invalid date
    const invalidDate = new Date('invalid');
    const matchingTasks = getTasksForDate(invalidDate, mockTasks);

    expect(matchingTasks).toHaveLength(0);
  });

  test('should handle empty tasks array', () => {
    const targetDate = new Date(2025, 9, 7);
    const matchingTasks = getTasksForDate(targetDate, []);

    expect(matchingTasks).toHaveLength(0);
  });
});

// Test the date string extraction function
describe('Date String Extraction', () => {
  test('should extract date part from database format', () => {
    const dbDate = '2025-10-07 18:03:00+00';
    const datePart = dbDate.split(' ')[0];
    expect(datePart).toBe('2025-10-07');
  });

  test('should handle ISO format', () => {
    const isoDate = '2025-10-07T18:03:00.000Z';
    const datePart = isoDate.split('T')[0];
    expect(datePart).toBe('2025-10-07');
  });

  test('should handle date-only format', () => {
    const dateOnly = '2025-10-07';
    const datePart = dateOnly.split(' ')[0];
    expect(datePart).toBe('2025-10-07');
  });
});

// Test date formatting for comparison
describe('Date Formatting for Comparison', () => {
  test('should format JavaScript date to YYYY-MM-DD', () => {
    const date = new Date(2025, 9, 7); // October 7, 2025
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const formattedDate = `${year}-${month}-${day}`;

    expect(formattedDate).toBe('2025-10-07');
  });

  test('should handle single digit days and months', () => {
    const date = new Date(2025, 0, 5); // January 5, 2025
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const formattedDate = `${year}-${month}-${day}`;

    expect(formattedDate).toBe('2025-01-05');
  });
});