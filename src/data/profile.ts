// Everything on the site that isn't a project page. Sources: Harvey's current CV, his verified
// profile, his GitHub and HARP repositories, his IM²C certificates, and his own notes. Add nothing
// here that those sources don't support.

export const person = {
  name: 'Harvey Phan',
  legalName: 'Phan Hoang Lam',
  siteTitle: "Harvey's Hub",
  statement: "I build navigation and control software for humanoid robots, and I measure what it can't do yet.",
  intro:
    'CS at Stanford. Software Engineer Lead for the Human Perception & Social Interaction Team at HARP, Stanford Student Robotics, and software engineer at POSH (YC W22) and Stanford AUV.',
  now: "Now: NMPC crowd navigation for HARP's Unitree G1",
  description:
    'Harvey Phan, Stanford CS: predictive crowd navigation for humanoid robots, applied machine learning, and mathematical research, each shown with its measured result and its main limit.',
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

/** Organizations, in the order they appear in the affiliations band: name, then Harvey's role there. */
export const affiliations = [
  { name: 'Stanford University', note: 'B.S. Computer Science' },
  { name: 'Stanford Student Robotics', note: 'Stanford Humanoid Athletic Robotics Project' },
  { name: 'POSH (YC W22)', note: 'Software Engineer' },
  { name: 'Stanford AUV', note: 'Autonomous Underwater Vehicle' },
  { name: 'Pfizer', note: 'AI Engineer Apprenticeship' },
  { name: 'Brown University', note: 'Machine Learning Researcher' },
  { name: 'Hanoi University of Science and Technology', note: 'Machine Learning Researcher' },
  { name: 'Hanoi National University of Education', note: 'Mathematics Researcher' },
  { name: 'International Mathematical Modeling Challenge', note: 'Honorable Mention, 2024 and 2025' },
];

export interface Role {
  org: string;
  /** What the organization or team is, in one line. */
  context?: string;
  title: string;
  detail?: string;
  dates: string;
  /** Project page slug, when there is one. */
  work?: string;
}

export const experience: Role[] = [
  {
    org: 'Humanoid Athletic Robotics Project (HARP)',
    context: "Stanford Student Robotics' humanoid program, building on the Unitree G1",
    title: 'Software Engineer Lead, Human Perception & Social Interaction Team',
    detail: 'Predictive crowd navigation (NMPC), waypoint routes, manual takeover, motion smoothing',
    dates: 'Oct 2026 - Present',
    work: 'harp-crowd-navigation',
  },
  {
    org: 'POSH (YC W22)',
    title: 'Software Engineer',
    detail: 'AI infrastructure, modeling, time series',
    dates: 'Sep 2026 - Present',
  },
  {
    org: 'Stanford Autonomous Underwater Vehicle',
    context: "Stanford's autonomous underwater vehicle team",
    title: 'Software Engineer',
    dates: 'Sep 2026 - Present',
  },
  {
    org: 'Pfizer',
    title: 'AI Engineer Apprentice',
    detail: 'Pharmaceutical document processing: OCR, retrieval, and classification pipeline',
    dates: 'Jun 2026 - Sep 2026',
    work: 'pharma-document-processing',
  },
  {
    org: 'Brown University',
    title: 'Machine Learning Researcher',
    detail: 'CNN-based soil texture analysis, mentored by MSc. Leonard Gleyzer',
    dates: 'Jun 2025 - Oct 2025',
  },
  {
    org: 'Hanoi National University of Education',
    title: 'Mathematics Researcher',
    detail: 'Balancing numbers by the matrix method, with Luu Ba Thang',
    dates: 'Jan 2025 - Aug 2025',
  },
  {
    org: 'Hanoi University of Science and Technology',
    title: 'Machine Learning Researcher',
    detail: 'EEG state classification, guided by Prof. Trinh Van Chien',
    dates: 'Jun 2024 - Aug 2024',
    work: 'eeg-classification',
  },
];

export interface Paper {
  title: string;
  authors: string;
  venue: string;
  journal: string;
  issue: string;
  role: string;
  doi: string;
  /** The research question, for a reader who hasn't seen the paper. */
  overview: string;
  /** What the paper shows. */
  findings: string;
  highlight?: string;
}

export const papers: Paper[] = [
  {
    title: 'On Balancing Numbers by the Matrix Method',
    authors: 'Luu Ba Thang and Phan Hoang Lam',
    venue: 'HNUE Journal of Science: Natural Science 70(4), 3 to 10, 2025',
    journal: 'HNUE Journal of Science: Natural Science',
    issue: 'Vol. 70, Issue 4, pp. 3 to 10, 2025',
    role: 'Co-author, with Luu Ba Thang',
    doi: '10.18173/2354-1059.2025-0049',
    overview:
      'A balancing number n satisfies 1 + 2 + … + (n − 1) = (n + 1) + … + (n + r) for some r, and the sequence obeys B(n) = 6B(n − 1) − B(n − 2). Fibonacci and Lucas numbers have classic matrix representations, the Q-matrix among them; this paper builds the analogue for balancing numbers.',
    findings:
      'Defines a balancing B-matrix and proves by induction that its powers generate the sequence. Determinant, eigenvalue, and diagonalization arguments give a Binet-like closed form and recurrence identities; Euclidean-algorithm reasoning gives divisibility results, including gcd(B(m), B(n)) = B(gcd(m, n)).',
  },
  {
    title:
      'AI-Based Forecasting of Macroeconomic Indicators: Empirical Evidence from Deep Learning Models for Inflation, GDP and Unemployment',
    authors: 'Nguyen Quang Dat, Phan Hoang Lam, Le Duy Quang, Vu Thi Thuy, Nguyen Thi Thanh Ha, and Do Duy Nhat',
    venue: 'Journal of Basic and Applied Research International 31(6), 163 to 171, 2025',
    journal: 'Journal of Basic and Applied Research International',
    issue: 'Vol. 31, Issue 6, pp. 163 to 171, 2025',
    role: 'Co-author, second of six authors',
    doi: '10.56557/jobari/2025/v31i610064',
    overview:
      'Do deep sequence models beat classical econometrics at forecasting inflation, GDP growth, and unemployment? The study tests both families on quarterly U.S. and Vietnam data from 2000 to 2024, 100 quarters per country, with financial and sentiment covariates.',
    findings:
      'ARIMA, VAR, and BVAR are compared with LSTM, GRU, TCN, Transformer, and a hybrid VAR-LSTM under time-aware validation, scored by RMSE, MAE, directional accuracy, Theil’s U, and Diebold-Mariano tests. The hybrid led with RMSE 0.58 and 74.0% directional accuracy, held up over 8- and 12-quarter horizons and 2020 to 2024 backtests, and SHAP attribution points to oil prices, exchange rates, and M2 as the main drivers.',
    highlight: 'RMSE 0.58 and 74.0% directional accuracy',
  },
];

export const immc = {
  title: 'International Mathematical Modeling Challenge (IM²C)',
  overview:
    'The IM²C, cosponsored by COMAP and the NeoUnion ESC Organization, gives high-school teams of up to four students five consecutive days to model an open real-world problem and defend the model in a written report. Each country sends at most two teams to international judging.',
  work:
    'I competed for Hanoi-Amsterdam High School for the Gifted, representing Vietnam, in 2024 and 2025. Our modeling included a binary integer program for multi-round scheduling, with assignment variables and capacity, availability, time-conflict, and participation constraints, a weighted objective balancing unmet demand, utilization, and fair access, and scenario and sensitivity analysis on demand, capacity, and penalty weights.',
  result: 'Honorable Mention at the 10th (2024) and 11th (2025) annual challenges.',
  certificates: [
    {
      year: '2025',
      label: '11th annual IM²C, Honorable Mention',
      team: 'Phan Hoang Lam, Pham Dang Nguyen, Hoang Minh Tung, Le Dao Khoi Minh',
      pdf: '/certificates/IMMC-2025-Honorable-Mention.pdf',
    },
    {
      year: '2024',
      label: '10th annual IM²C, Honorable Mention',
      team: 'Phan Hoang Lam, Hoang Nam Khanh, Pham Dang Nguyen, Nguyen Minh Tri; advisor Nguyen Trung Hieu',
      pdf: '/certificates/IMMC-2024-Honorable-Mention.pdf',
    },
  ],
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
  { group: 'Robotics and control', items: 'ROS 2, Nav2, MuJoCo, NMPC (SciPy SLSQP), multi-object tracking' },
  { group: 'ML and data', items: 'PyTorch, scikit-learn, pandas, NumPy, SciPy' },
  { group: 'Systems', items: 'Docker, Git, FastAPI' },
];

/** People Harvey has met. Names and titles are as Harvey recorded them. */
export const people = [
  { name: 'Sachin Kansal', title: 'Chief Product Officer, Uber', photo: 'sachin-kansal', focus: '50% 35%' },
  { name: 'James Walker', title: 'Principal, Draper Associates', photo: 'james-walker', focus: '50% 25%' },
  { name: 'Wesley Tillu', title: 'Partner, S32', photo: 'wesley-tillu', focus: '50% 40%' },
];
