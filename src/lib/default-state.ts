import { addDays, createId, toIsoDate } from "@/lib/utils";
import type { CampusState } from "@/lib/types";

const today = new Date();

export const defaultState: CampusState = {
  tasks: [
    {
      id: createId("task"),
      title: "Revise Graph Algorithms",
      subject: "DSA",
      dueDate: addDays(today, 2),
      priority: "high",
      status: "in-progress",
      progress: 60,
    },
    {
      id: createId("task"),
      title: "Prepare DBMS short notes",
      subject: "DBMS",
      dueDate: addDays(today, 4),
      priority: "medium",
      status: "todo",
      progress: 10,
    },
    {
      id: createId("task"),
      title: "Complete OS lab assignment",
      subject: "Operating Systems",
      dueDate: addDays(today, 1),
      priority: "high",
      status: "todo",
      progress: 0,
    },
  ],
  focus: {
    sessions: [
      {
        id: createId("focus"),
        startedAt: new Date(today.getTime() - 1000 * 60 * 120).toISOString(),
        minutes: 50,
        mode: "focus",
        ambient: "deep",
      },
      {
        id: createId("focus"),
        startedAt: new Date(today.getTime() - 1000 * 60 * 60).toISOString(),
        minutes: 25,
        mode: "focus",
        ambient: "rain",
      },
    ],
    dailyMinutes: {
      [toIsoDate(today)]: 75,
    },
    streak: 5,
    ambientMode: "deep",
  },
  exams: [
    {
      id: createId("exam"),
      subject: "Data Structures",
      date: addDays(today, 10),
      preparedTopics: 5,
      totalTopics: 10,
      targetScore: 85,
      schedule: ["Array + Strings", "Trees + Graphs", "DP revision"],
    },
    {
      id: createId("exam"),
      subject: "Computer Networks",
      date: addDays(today, 16),
      preparedTopics: 3,
      totalTopics: 8,
      targetScore: 80,
      schedule: ["OSI + TCP", "Routing", "Protocols + MCQ sprint"],
    },
  ],
  semesters: [
    {
      id: createId("sem"),
      name: "Semester 5",
      courses: [
        { id: createId("course"), name: "DBMS", credits: 4, grade: "A" },
        { id: createId("course"), name: "OS", credits: 4, grade: "A-" },
        { id: createId("course"), name: "AI", credits: 3, grade: "B+" },
      ],
    },
  ],
  gradeScale: [
    { grade: "O", points: 10 },
    { grade: "A+", points: 9 },
    { grade: "A", points: 8.5 },
    { grade: "B+", points: 8 },
    { grade: "B", points: 7 },
    { grade: "C", points: 6 },
    { grade: "D", points: 5 },
    { grade: "F", points: 0 },
  ],
  placement: {
    checklist: [
      { id: createId("pc"), title: "Resume v3 ready", done: true },
      { id: createId("pc"), title: "Aptitude mock test", done: false },
      { id: createId("pc"), title: "System design basics", done: false },
      { id: createId("pc"), title: "Top 100 DSA problems", done: true },
    ],
    applications: [
      {
        id: createId("app"),
        company: "Google",
        role: "SWE Intern",
        stage: "oa",
        appliedOn: addDays(today, -4),
        nextStep: addDays(today, 3),
      },
      {
        id: createId("app"),
        company: "Atlassian",
        role: "Software Engineer",
        stage: "interview",
        appliedOn: addDays(today, -14),
        nextStep: addDays(today, 2),
      },
    ],
    offers: [
      {
        id: createId("offer"),
        company: "StartupX",
        ctcLpa: 14,
        date: addDays(today, -30),
      },
    ],
    rejections: [
      {
        id: createId("rej"),
        company: "Amazon",
        stage: "Interview 2",
        date: addDays(today, -40),
      },
    ],
    resumeVersions: [
      {
        id: createId("rv"),
        name: "General SWE v3",
        roleTarget: "SDE",
        score: 82,
        updatedAt: addDays(today, -3),
      },
      {
        id: createId("rv"),
        name: "Data Analyst v1",
        roleTarget: "Analytics",
        score: 74,
        updatedAt: addDays(today, -7),
      },
    ],
  },
  coding: {
    platforms: [
      {
        id: createId("cp"),
        platform: "LeetCode",
        username: "you",
        solved: 320,
        contests: 21,
        rating: 1720,
        easy: 140,
        medium: 150,
        hard: 30,
      },
      {
        id: createId("cp"),
        platform: "Codeforces",
        username: "you_cf",
        solved: 190,
        contests: 14,
        rating: 1460,
        easy: 90,
        medium: 78,
        hard: 22,
      },
    ],
    dailyActivity: Array.from({ length: 30 }, (_, index) => {
      const date = new Date();
      date.setDate(date.getDate() - (29 - index));
      return {
        date: toIsoDate(date),
        count: Math.floor(Math.random() * 6),
      };
    }),
    topics: [
      { topic: "Arrays", solved: 52, target: 80 },
      { topic: "Graphs", solved: 21, target: 40 },
      { topic: "Dynamic Programming", solved: 18, target: 35 },
      { topic: "Trees", solved: 34, target: 45 },
    ],
  },
  companyKits: [
    {
      id: createId("kit"),
      company: "Google",
      roadmap: [
        "Master DSA rounds",
        "Revise CS fundamentals",
        "Solve 5 mock interviews",
      ],
      topics: [
        { id: createId("topic"), title: "Graphs + DP", done: false },
        { id: createId("topic"), title: "System design basics", done: false },
        { id: createId("topic"), title: "Behavioral stories", done: true },
      ],
    },
    {
      id: createId("kit"),
      company: "Microsoft",
      roadmap: [
        "OOP + OS deep revision",
        "LeetCode company tagged set",
        "Mock interview rounds",
      ],
      topics: [
        { id: createId("topic"), title: "Arrays + Strings", done: true },
        { id: createId("topic"), title: "Concurrency", done: false },
        { id: createId("topic"), title: "Resume tailoring", done: true },
      ],
    },
  ],
  resume: {
    template: "classic",
    fullName: "Your Name",
    email: "you@email.com",
    phone: "+91 90000 00000",
    location: "Bengaluru, India",
    headline: "Final-year CSE Student | Aspiring Software Engineer",
    summary:
      "Problem-solving focused student with strong DSA practice and real-world internship experience.",
    education:
      "B.Tech in Computer Science, XYZ University (2023 - 2027), CGPA: 8.7/10",
    experience:
      "Software Intern, Acme Labs (May 2025 - Jul 2025) - Built dashboard modules and improved load time by 30%.",
    projects:
      "CampusOS super-app, Real-time attendance tracker, Placement analytics dashboard.",
    skills: "TypeScript, React, Next.js, Node.js, SQL, DSA, System Design",
  },
  resources: [
    {
      id: createId("res"),
      title: "NeetCode 150",
      url: "https://neetcode.io",
      category: "DSA",
      favorite: true,
    },
    {
      id: createId("res"),
      title: "DBMS Notes",
      url: "https://www.geeksforgeeks.org/dbms/",
      category: "Academics",
      favorite: false,
    },
  ],
  goals: [
    {
      id: createId("goal"),
      type: "goal",
      title: "Solve 300 DSA problems",
      target: 300,
      progress: 210,
      streak: 6,
      doneToday: true,
    },
    {
      id: createId("goal"),
      type: "habit",
      title: "2 Pomodoros daily",
      target: 2,
      progress: 1,
      streak: 11,
      doneToday: false,
    },
  ],
  settings: {
    theme: "dark",
    focusMinutes: 25,
    breakMinutes: 5,
  },
};
