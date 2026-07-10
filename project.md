# Project Overview: Smart Tutor & Timetable Generator

A comprehensive educational management platform should incorporate a wide range of features to ensure it is interactive, user-friendly, and administratively manageable. This project implements the following:

i. **Multi-Semester Management** allows administrators to select and generate schedules for multiple semesters (1–6) simultaneously from a single dashboard.
ii. **Dynamic Subject Synchronization** automatically retrieves subject details, including theory and practical hour requirements, from the database with a robust fallback system.
iii. **Teacher Assignment Interface** provides a streamlined way to assign faculty members to specific subjects with real-time occupancy checks.
iv. **Smart Shuffling Algorithm** generates optimized, conflict-free timetables by ensuring teachers are never double-booked and subjects are evenly distributed.
v. **Practical Block Scheduling** intelligently groups practical hours into contiguous two-period blocks to optimize laboratory and resource usage.
vi. **Automated Lunch Intervals** standardizes the daily schedule by automatically inserting lunch breaks across all class timetables during generation.
vii. **PDF Export Functionality** enables users to download professionally formatted, color-coded versions of their generated timetables for offline use.
viii. **Responsive Glassmorphism UI** provides a premium, modern experience across desktop and mobile devices using advanced CSS blur and transparency effects.
ix. **Real-time User Feedback** utilizes a custom toast notification system to keep users informed of generation status, validation errors, and successful exports.
x. **Role-Based Access Control** secures administrative features like "Make Global" and redirects users to a dedicated authentication module for security.
xi. **Automated Request Tracking** (Smart Tutor) allows tutors to manage and validate incoming student requests against their current availability.
xii. **Instant Email Notifications** (Smart Tutor) help users stay updated by sending real-time alerts for class approvals, cancellations, or scheduling changes.
xiii. **Interactive Analytics Dashboard** provides tutors and admins with insights into total tasks assigned, active classes, and upcoming sessions.
xiv. **Task & Homework Management** adds structure to the learning process by allowing tutors to assign time-bound tasks and track student progress.
xv. **Security-First Architecture** ensures data integrity using prepared SQL statements, input validation, and secure password hashing.
