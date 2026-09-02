import { Notice } from './types';

export const initialNotices: Notice[] = [
  {
    id: '1',
    title: 'Spring Semester Final Exam Schedule Released',
    content: 'The final examination schedule for the upcoming Spring semester has been published. Please check the portal for your specific course timings and venue assignments. Report any clashes to the registrar immediately.',
    author: 'Registrar Office',
    department: 'Academic Affairs',
    date: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    category: 'Academic',
    isUrgent: true
  },
  {
    id: '2',
    title: 'Library Extended Hours for Finals Week',
    content: 'The Main Library will remain open 24/7 starting next Monday to accommodate students during finals week. Coffee and snacks will be provided at midnight in the lobby.',
    author: 'Library Services',
    department: 'Campus Facilities',
    date: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    category: 'Campus Life',
    isUrgent: false
  },
  {
    id: '3',
    title: 'Campus Network Maintenance',
    content: 'IT Services will be conducting routine maintenance on the campus Wi-Fi network this Saturday from 2:00 AM to 5:00 AM. Intermittent connectivity issues are expected during this window.',
    author: 'IT Support',
    department: 'Information Technology',
    date: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 2 days ago
    category: 'Alert',
    isUrgent: false
  },
  {
    id: '4',
    title: 'Tech Club Annual Hackathon Registration Open',
    content: 'Registration for the 5th Annual Campus Hackathon is now open! Form teams of up to 4 students and compete for a $5,000 prize pool. All skill levels are welcome. Scan the QR codes on the flyers around campus to register.',
    author: 'Tech Club President',
    department: 'Student Organizations',
    date: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(), // 3 days ago
    category: 'Clubs',
    isUrgent: false
  },
  {
    id: '5',
    title: 'Deadline for Add/Drop Courses',
    content: 'Reminder: The final deadline to add or drop courses without academic penalty is this Friday at 5:00 PM. No exceptions will be made after this deadline.',
    author: 'Academic Advising',
    department: 'Academic Affairs',
    date: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(), // 12 hours ago
    category: 'Administrative',
    isUrgent: true,
    dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2 + 1000 * 60 * 60 * 5).toISOString() // 2 days and 5 hours from now
  }
];
