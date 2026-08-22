# Frontend Information Architecture & Component Inventory

# Project

TaskFlow

Personal Task Tracking Application

Version: MVP 1.0

---

# Purpose

This document defines:

* Information Architecture
* Navigation Hierarchy
* Page Structure
* Component Inventory
* Component Relationships
* Reusability Guidelines

The goal is to maintain consistency and scalability across the application.

---

# Information Architecture

Application Structure

TaskFlow

├── Public Area
│
│   ├── Homepage
│   ├── Login
│   └── Register
│
└── Authenticated Area
│
├── Dashboard
├── Boards
│   └── Board Detail
│
├── Analytics
├── Activities
└── Profile

---

# Navigation Hierarchy

Public Navigation

Homepage
├── Login
└── Register

---

Authenticated Navigation

Dashboard

Boards
└── Board Detail

Analytics

Activities

Profile

Logout

---

# Layout Architecture

Layouts

layouts/

├── public.vue
└── dashboard.vue

---

Public Layout

Navbar
↓
Page Content
↓
Footer

---

Dashboard Layout

Sidebar
↓
Header
↓
Content Area

---

# Page Inventory

## Public Pages

### Homepage

Route:

/

Purpose:

Product introduction

Main Components:

* AppNavbar
* HeroSection
* FeaturesSection
* WorkflowSection
* BenefitsSection
* CTASection
* AppFooter

---

### Login

Route:

/login

Main Components:

* AuthCard
* LoginForm

---

### Register

Route:

/register

Main Components:

* AuthCard
* RegisterForm

---

# Authenticated Pages

## Dashboard

Route:

/dashboard

Main Components:

* DashboardStats
* RecentBoards
* RecentActivities

---

## Boards

Route:

/boards

Main Components:

* BoardGrid
* BoardCard
* CreateBoardModal

---

## Board Detail

Route:

/boards/[id]

Main Components:

* KanbanBoard
* ColumnCard
* TaskCard
* TaskModal

---

## Analytics

Route:

/analytics

Main Components:

* AnalyticsStats
* CompletionTrendChart
* StatusDistributionChart

---

## Activities

Route:

/activities

Main Components:

* ActivityTimeline
* ActivityItem

---

## Profile

Route:

/profile

Main Components:

* ProfileForm
* PasswordForm
* LogoutButton

---

# Component Inventory

---

# Global Components

Reusable across entire application.

components/

---

## AppLogo

Purpose:

Display application logo.

Reusable:

Yes

Used In:

* Navbar
* Sidebar

---

## AppNavbar

Purpose:

Public navigation.

Used In:

* Homepage

---

## AppFooter

Purpose:

Global footer.

Used In:

* Homepage

---

## AppSidebar

Purpose:

Authenticated navigation.

Used In:

* Dashboard Layout

---

## AppHeader

Purpose:

Page header.

Used In:

* Dashboard Layout

---

## AppAvatar

Purpose:

User profile image.

Reusable:

Yes

---

## AppButton

Purpose:

Standard button component.

Variants:

* Primary
* Secondary
* Danger
* Ghost

Reusable:

Yes

---

## AppInput

Purpose:

Text input.

Reusable:

Yes

---

## AppTextarea

Purpose:

Multiline input.

Reusable:

Yes

---

## AppSelect

Purpose:

Dropdown selection.

Reusable:

Yes

---

## AppModal

Purpose:

Base modal component.

Reusable:

Yes

---

## AppCard

Purpose:

Base card component.

Reusable:

Yes

---

## AppBadge

Purpose:

Display status or priority.

Variants:

* Success
* Warning
* Danger
* Neutral

Reusable:

Yes

---

## AppDropdown

Purpose:

Dropdown menu.

Reusable:

Yes

---

## AppEmptyState

Purpose:

Display empty state.

Reusable:

Yes

---

## AppLoading

Purpose:

Loading indicator.

Reusable:

Yes

---

# Authentication Components

features/auth/components/

---

## LoginForm

Responsibilities:

* Login validation
* Submit credentials

---

## RegisterForm

Responsibilities:

* Registration validation
* Submit registration

---

## AuthCard

Responsibilities:

* Shared auth page container

Used By:

* Login
* Register

---

# Dashboard Components

features/dashboard/components/

---

## DashboardStats

Purpose:

Display statistics summary.

Contains:

* StatCard

---

## StatCard

Displays:

* Label
* Value
* Trend

Reusable:

Yes

---

## RecentBoards

Purpose:

Display recently updated boards.

---

## RecentActivities

Purpose:

Display recent user activities.

---

# Board Components

features/boards/components/

---

## BoardGrid

Purpose:

Display board collection.

Contains:

* BoardCard

---

## BoardCard

Displays:

* Board Name
* Task Count
* Updated Date

Actions:

* Open
* Edit
* Delete

---

## CreateBoardModal

Purpose:

Create board.

Uses:

* AppModal

---

## EditBoardModal

Purpose:

Update board.

Uses:

* AppModal

---

# Kanban Components

features/kanban/components/

This is the most important feature area.

---

## KanbanBoard

Responsibilities:

* Render columns
* Handle drag-and-drop events

Contains:

* ColumnCard

---

## ColumnCard

Responsibilities:

* Display column
* Manage tasks

Contains:

* ColumnHeader
* TaskList
* AddTaskButton

---

## ColumnHeader

Displays:

* Column Name
* Task Count
* Actions Menu

---

## ColumnMenu

Actions:

* Rename
* Delete

---

## TaskList

Displays:

Task collection.

Contains:

* TaskCard

---

## TaskCard

Displays:

* Title
* Priority
* Due Date

Supports:

* Click
* Drag

---

## TaskModal

Purpose:

Create/Edit task.

Uses:

* AppModal

---

## TaskForm

Contains:

* Title Input
* Description Input
* Priority Select
* Due Date Picker

---

# Analytics Components

features/analytics/components/

---

## AnalyticsStats

Purpose:

Analytics summary cards.

---

## CompletionTrendChart

Purpose:

Task completion visualization.

---

## StatusDistributionChart

Purpose:

Task status breakdown.

---

# Activity Components

features/activities/components/

---

## ActivityTimeline

Purpose:

Display activity history.

Contains:

* ActivityItem

---

## ActivityItem

Displays:

* Action
* Timestamp
* Icon

---

# Profile Components

features/profile/components/

---

## ProfileForm

Purpose:

Update profile information.

---

## PasswordForm

Purpose:

Change password.

---

## LogoutButton

Purpose:

Logout action.

---

# Component Relationships

Board Detail Page

KanbanBoard
│
├── ColumnCard
│   │
│   ├── ColumnHeader
│   ├── TaskList
│   │   │
│   │   └── TaskCard
│   │
│   └── AddTaskButton
│
└── TaskModal

---

# Reusability Rules

Before creating a new component:

Check if existing component can be reused.

Examples:

Do NOT create:

PrimaryButton
SecondaryButton
DangerButton

Instead use:

AppButton

with variants.

---

Do NOT create:

CreateTaskModal
EditTaskModal

Instead use:

TaskModal

with modes.

---

# Naming Conventions

Global Components

Prefix:

App

Examples:

AppButton
AppModal
AppCard

---

Feature Components

Use feature context.

Examples:

TaskCard
BoardCard
ActivityTimeline

---

# Future Expansion Readiness

Architecture should support future modules:

* Notifications
* Calendar View
* Mobile Layout
* Team Collaboration

without requiring major refactoring.
