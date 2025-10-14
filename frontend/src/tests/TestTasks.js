import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TestTasks from '../components/TestTasks';

// Mock user data
const mockUser = {
  username: 'testuser'
};

// Mock onLogout function
const mockOnLogout = jest.fn();

// Test setup
describe('TestTasks Component', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  test('renders loading state initially', () => {
    render(<TestTasks user={mockUser} onLogout={mockOnLogout} />);
    
    // Should show loading message
    expect(screen.getByText('Loading your dashboard...')).toBeInTheDocument();
    
    // Should not show stats grid while loading
    expect(screen.queryByText('Total Tasks')).not.toBeInTheDocument();
  });

  test('renders dashboard after loading', async () => {
    render(<TestTasks user={mockUser} onLogout={mockOnLogout} />);
    
    // Fast-forward timers
    jest.advanceTimersByTime(2000);
    
    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByText('Loading your dashboard...')).not.toBeInTheDocument();
    });
    
    // Should render all stat cards
    expect(screen.getByText('Total Tasks')).toBeInTheDocument();
    expect(screen.getByText('Not Started')).toBeInTheDocument();
    expect(screen.getByText('In Progress')).toBeInTheDocument();
    expect(screen.getByText('Completed')).toBeInTheDocument();
    
    // Should render stat numbers
    expect(screen.getByText('5')).toBeInTheDocument(); // Total Tasks
    expect(screen.getByText('2')).toBeInTheDocument(); // Not Started
    expect(screen.getByText('1')).toBeInTheDocument(); // In Progress
    expect(screen.getByText('2')).toBeInTheDocument(); // Completed
    
    // Should render test content
    expect(screen.getByText('Test content - header should stay visible')).toBeInTheDocument();
  });

  test('renders welcome message with username', () => {
    render(<TestTasks user={mockUser} onLogout={mockOnLogout} />);
    
    expect(screen.getByText('Welcome, testuser! 👋')).toBeInTheDocument();
    expect(screen.getByText("Here's your task dashboard")).toBeInTheDocument();
  });

  test('renders default welcome message when no user provided', () => {
    render(<TestTasks onLogout={mockOnLogout} />);
    
    expect(screen.getByText('Welcome, User! 👋')).toBeInTheDocument();
  });

  test('renders logout button and handles click', async () => {
    render(<TestTasks user={mockUser} onLogout={mockOnLogout} />);
    
    const logoutButton = screen.getByText('Logout');
    expect(logoutButton).toBeInTheDocument();
    
    // Click logout button
    await userEvent.click(logoutButton);
    
    expect(mockOnLogout).toHaveBeenCalledTimes(1);
  });

  test('header remains visible during loading', () => {
    render(<TestTasks user={mockUser} onLogout={mockOnLogout} />);
    
    // Header should always be visible
    expect(screen.getByText('Welcome, testuser! 👋')).toBeInTheDocument();
    expect(screen.getByText("Here's your task dashboard")).toBeInTheDocument();
    expect(screen.getByText('Logout')).toBeInTheDocument();
    
    // Loading message should also be visible
    expect(screen.getByText('Loading your dashboard...')).toBeInTheDocument();
  });

  test('applies correct CSS classes', () => {
    const { container } = render(<TestTasks user={mockUser} onLogout={mockOnLogout} />);
    
    // Check for main container class
    expect(container.querySelector('.dashboard-container')).toBeInTheDocument();
    expect(container.querySelector('.dashboard-header')).toBeInTheDocument();
    expect(container.querySelector('.header-content')).toBeInTheDocument();
    expect(container.querySelector('.header-text')).toBeInTheDocument();
    expect(container.querySelector('.logout-btn')).toBeInTheDocument();
  });
});

// Additional tests for edge cases
describe('TestTasks Edge Cases', () => {
  test('handles very fast timer completion', async () => {
    render(<TestTasks user={mockUser} onLogout={mockOnLogout} />);
    
    // Complete timers immediately
    jest.advanceTimersByTime(2000);
    
    await waitFor(() => {
      expect(screen.queryByText('Loading your dashboard...')).not.toBeInTheDocument();
    });
    
    expect(screen.getByText('Total Tasks')).toBeInTheDocument();
  });

  test('cleans up timer on unmount', () => {
    const { unmount } = render(<TestTasks user={mockUser} onLogout={mockOnLogout} />);
    
    // Unmount component
    unmount();
    
    // Should not throw errors about state updates on unmounted component
    expect(() => {
      jest.advanceTimersByTime(2000);
    }).not.toThrow();
  });
});