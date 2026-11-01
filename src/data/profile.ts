// Everything on the site that isn't a project page. Sources: Harvey's current CV, his verified
// profile, and his GitHub READMEs. Add nothing here that those sources don't support.

export const person = {
  name: 'Harvey Phan',
  legalName: 'Phan Hoang Lam',
  siteTitle: "Harvey's Hub",
  statement: "I write navigation software for humanoid robots, and I measure what it can't do yet.",
  intro:
    "CS at Stanford. Software Engineer Lead for HARP's Human Perception & Social Interaction Team, working on the Unitree G1.",
  description:
    'Harvey Phan, Stanford CS: navigation software for humanoid robots and applied machine learning, each project shown with its measured result and its main limit.',
};

export const contact = {
  email: 'hoanglam@stanford.edu',
  phone: '(302) 687-2315',
  phoneHref: 'tel:+13026872315',
  location: 'Palo Alto and Stanford, CA',
  linkedin: 'https://www.linkedin.com/in/phanhlam',
  github: 'https://github.com/gitLamHoang',
  resume: '/Harvey_Phan_Resume.pdf',
  resumeLabel: "Harvey Phan's Resume",
};

export interface Role {
  title: string;
  org: string;
  detail?: string;
  dates: string;
  /** Project page slug, when there is one. */
  work?: string;
}

export const experience: Role[] = [
  {
    title: 'Software Engineer Lead',
    org: 'Humanoid Athletic Robotics Project (HARP), Stanford Student Robotics',
    detail: 'Human Perception & Social Interaction Team',
    dates: 'Oct. 2026 to present',
    work: 'harp-waypoint-navigation',
  },
  {
    title: 'Software Engineer',
    org: 'POSH (YC W22)',
    detail: 'AI infrastructure, modeling, time series',
    dates: 'Sep. 2026 to present',
  },
  { title: 'Software Engineer', org: 'Stanford Autonomous Underwater Vehicle', dates: 'Sep. 2026 to present' },
  {
    title: 'AI Engineer Apprentice',
    org: 'Pfizer',
    detail: 'Pharmaceutical document processing',
    dates: 'Jun. to Sep. 2026',
    work: 'pharma-document-processing',
  },
  {
    title: 'Machine Learning Researcher',
    org: 'Brown University',
    detail: 'CNN-based soil texture analysis, mentored by MSc. Leonard Gleyzer',
    dates: 'Jun. to Oct. 2025',
  },
  {
    title: 'Mathematics Researcher',
    org: 'Hanoi National University of Education',
    detail: 'Balancing numbers by the matrix method',
    dates: 'Jan. to Aug. 2025',
  },
  {
    title: 'Machine Learning Researcher',
    org: 'Hanoi University of Science and Technology',
    detail: 'EEG state classification',
    dates: 'Jun. to Aug. 2024',
    work: 'eeg-classification',
  },
];

export const papers = [
  {
    title: 'On Balancing Numbers by the Matrix Method',
    authors: 'Luu Ba Thang and Phan Hoang Lam',
    venue: 'HNUE Journal of Science: Natural Science 70(4), 3 to 10, 2025',
    doi: '10.18173/2354-1059.2025-0049',
    summary:
      'Defines a balancing B-matrix, proves its matrix-power representation, and derives a Binet-like formula and divisibility properties, including gcd(B(m), B(n)) = B(gcd(m, n)).',
  },
  {
    title:
      'AI-Based Forecasting of Macroeconomic Indicators: Empirical Evidence from Deep Learning Models for Inflation, GDP and Unemployment',
    authors: 'Nguyen Quang Dat, Phan Hoang Lam, Le Duy Quang, Vu Thi Thuy, Nguyen Thi Thanh Ha, and Do Duy Nhat',
    venue: 'Journal of Basic and Applied Research International 31(6), 163 to 171, 2025',
    doi: '10.56557/jobari/2025/v31i610064',
    summary:
      'Compares ARIMA, VAR, and BVAR with LSTM, GRU, TCN, Transformer, and a hybrid VAR-LSTM on quarterly U.S. and Vietnam data from 2000 to 2024. The hybrid reached RMSE 0.58 and 74.0% directional accuracy; SHAP points to oil prices, exchange rates, and M2 as the main drivers.',
    highlight: 'RMSE 0.58 and 74.0% directional accuracy',
  },
];

export const immc = {
  title: 'International Mathematical Modeling Challenge',
  summary:
    'A binary integer program for multi-round scheduling, with capacity, availability, time-conflict, and participation constraints and a weighted objective for unmet demand, utilization, and fair access. Honorable Mention in 2024 and 2025.',
};

export const education = [
  { school: 'Stanford University', detail: 'B.S. in Computer Science, class of 2030' },
  {
    school: 'Hanoi-Amsterdam High School for the Gifted',
    detail: 'Mathematics Specialized Class; Valedictorian, Hanoi City Entrance Examination; 2026',
  },
];

export const honors = [
  'Bronze Medal, Vietnam National Student Mathematics Olympiad',
  'Second Prize, Hanoi Mathematics Olympiad',
  'Honorable Mention, International Mathematical Modeling Challenge, 2024 and 2025',
];

export const scores = [
  'SAT 1550 (800 Math)',
  'IELTS 8.0',
  'AP 5s: Calculus BC, Computer Science A, Macroeconomics',
];

export const tools = [
  { group: 'Languages', items: 'Python, C/C++, Java, SQL, R, TypeScript' },
  { group: 'ML and data', items: 'PyTorch, scikit-learn, pandas, NumPy, SciPy' },
  { group: 'Robotics and systems', items: 'ROS 2, MuJoCo, Docker, Git' },
];
