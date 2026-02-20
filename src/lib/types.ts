export type Priority = "low" | "medium" | "high";
export type ThemeMode = "dark" | "light";
export type TaskStatus = "todo" | "in-progress" | "done";
export type ApplicationStage =
  | "applied"
  | "oa"
  | "shortlisted"
  | "interview"
  | "offer"
  | "rejected";
export type NoteFormat = "markdown" | "rich";

export interface StudyTask {
  id: string;
  title: string;
  subject: string;
  dueDate: string;
  priority: Priority;
  status: TaskStatus;
  progress: number;
}

export interface FocusSession {
  id: string;
  startedAt: string;
  minutes: number;
  mode: "focus" | "break";
  ambient: "none" | "rain" | "deep" | "cafe";
}

export interface Exam {
  id: string;
  subject: string;
  date: string;
  preparedTopics: number;
  totalTopics: number;
  targetScore: number;
  schedule: string[];
}

export interface Course {
  id: string;
  name: string;
  credits: number;
  grade: string;
}

export interface Semester {
  id: string;
  name: string;
  courses: Course[];
}

export interface GradeScaleEntry {
  grade: string;
  points: number;
}

export interface PlacementChecklistItem {
  id: string;
  title: string;
  done: boolean;
}

export interface PlacementApplication {
  id: string;
  company: string;
  role: string;
  stage: ApplicationStage;
  appliedOn: string;
  nextStep?: string;
  notes?: string;
}

export interface OfferRecord {
  id: string;
  company: string;
  ctcLpa: number;
  date: string;
}

export interface RejectionRecord {
  id: string;
  company: string;
  stage: string;
  date: string;
  reason?: string;
}

export interface ResumeVersion {
  id: string;
  name: string;
  roleTarget: string;
  score: number;
  updatedAt: string;
}

export interface CodingPlatformProfile {
  id: string;
  platform: string;
  username: string;
  solved: number;
  contests: number;
  rating: number;
  easy: number;
  medium: number;
  hard: number;
}

export interface DailyCodingActivity {
  date: string;
  count: number;
}

export interface CodingTopicProgress {
  topic: string;
  solved: number;
  target: number;
}

export interface CompanyKitTopic {
  id: string;
  title: string;
  done: boolean;
}

export interface CompanyKit {
  id: string;
  company: string;
  roadmap: string[];
  topics: CompanyKitTopic[];
}

export interface ResumeData {
  template: "classic" | "minimal" | "executive";
  fullName: string;
  email: string;
  phone: string;
  location: string;
  headline: string;
  summary: string;
  education: string;
  experience: string;
  projects: string;
  skills: string;
}

export interface ResourceItem {
  id: string;
  title: string;
  url: string;
  category: string;
  favorite: boolean;
}

export interface GoalHabit {
  id: string;
  type: "goal" | "habit";
  title: string;
  target: number;
  progress: number;
  streak: number;
  doneToday: boolean;
}

export interface AppSettings {
  theme: ThemeMode;
  focusMinutes: number;
  breakMinutes: number;
}

export interface CampusState {
  tasks: StudyTask[];
  focus: {
    sessions: FocusSession[];
    dailyMinutes: Record<string, number>;
    streak: number;
    ambientMode: FocusSession["ambient"];
  };
  exams: Exam[];
  semesters: Semester[];
  gradeScale: GradeScaleEntry[];
  placement: {
    checklist: PlacementChecklistItem[];
    applications: PlacementApplication[];
    offers: OfferRecord[];
    rejections: RejectionRecord[];
    resumeVersions: ResumeVersion[];
  };
  coding: {
    platforms: CodingPlatformProfile[];
    dailyActivity: DailyCodingActivity[];
    topics: CodingTopicProgress[];
  };
  companyKits: CompanyKit[];
  resume: ResumeData;
  resources: ResourceItem[];
  goals: GoalHabit[];
  settings: AppSettings;
}

export interface NoteRecord {
  id: string;
  title: string;
  subject: string;
  format: NoteFormat;
  content: string;
  updatedAt: string;
}
