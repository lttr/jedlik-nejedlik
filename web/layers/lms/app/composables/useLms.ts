// Mockovaný stav LMS pro prototyp. Nahrazuje Directus (studenti, oprávnění, postup,
// pokusy o test — viz TO-7). Vše žije jen v paměti prohlížeče; nic se neukládá.

export type LessonType = "video" | "text"

export interface Lesson {
  id: string
  title: string
  type: LessonType
  attachments?: string[]
}

// Pravidlo odemčení sekce (BP-13): volně | test | čas od nákupu | ručně administrátorem.
export type UnlockRule = { kind: "open" } | { kind: "test" } | { kind: "time"; days: number }

export interface QuizQuestion {
  id: string
  text: string
  options: { id: string; text: string }[]
  correct: string
}

export interface Quiz {
  passPercent: number // hranice úspěšnosti nastavitelná per kurz (O-6)
  blocking: boolean // blokující test je podmínkou postupu (TO-7)
  questions: QuizQuestion[]
}

export interface Section {
  id: string
  title: string
  unlock: UnlockRule
  lessons: Lesson[]
  quiz?: Quiz // test na konci sekce, který odemyká následující sekci
}

export interface Course {
  id: string
  title: string
  subtitle: string
  owned: boolean
  duration: string
  accent: "peach" | "lime"
  sections: Section[]
}

const COURSES: Course[] = [
  {
    id: "jistota-u-stolu",
    title: "Jistota u stolu",
    subtitle: "Jak přestat bojovat o jídlo a vrátit klid ke společnému stolu.",
    owned: true,
    duration: "2 h",
    accent: "peach",
    sections: [
      {
        id: "s1",
        title: "Sekce 1 · Základy",
        unlock: { kind: "open" },
        lessons: [
          { id: "l1", title: "Vítejte v kurzu", type: "video" },
          { id: "l2", title: "Role rodiče a dítěte u jídla", type: "video" },
          {
            id: "l3",
            title: "Materiály ke stažení",
            type: "text",
            attachments: ["Pracovní list.pdf", "Ukázkový jídelníček.pdf"],
          },
        ],
        quiz: {
          passPercent: 100,
          blocking: true,
          questions: [
            {
              id: "q1",
              text: "Kolik porcí zeleniny denně se doporučuje předškolákovi?",
              options: [
                { id: "a", text: "1 porce" },
                { id: "b", text: "3–5 porcí" },
                { id: "c", text: "10 porcí" },
              ],
              correct: "b",
            },
            {
              id: "q2",
              text: "Jaká je nejlepší reakce, když dítě odmítá novou potravinu?",
              options: [
                { id: "a", text: "Nabídnout ji znovu později, bez nátlaku" },
                { id: "b", text: "Vynutit snědení" },
                { id: "c", text: "Už nikdy ji nenabízet" },
              ],
              correct: "a",
            },
          ],
        },
      },
      {
        id: "s2",
        title: "Sekce 2 · Praxe",
        unlock: { kind: "test" },
        lessons: [
          { id: "l4", title: "Neutrální reakce na odmítání", type: "video" },
          { id: "l5", title: "Struktura jídelního dne", type: "video" },
        ],
      },
      {
        id: "s3",
        title: "Sekce 3 · Náročné situace",
        unlock: { kind: "time", days: 7 },
        lessons: [{ id: "l6", title: "Když dítě jí jen tři potraviny", type: "video" }],
      },
    ],
  },
  {
    id: "prvni-prikrmy",
    title: "První příkrmy s klidem",
    subtitle: "Praktický průvodce zaváděním příkrmů bez stresu.",
    owned: false,
    duration: "1,5 h",
    accent: "lime",
    sections: [],
  },
]

export interface UseLmsResult {
  student: Ref<string | null>
  courses: Course[]
  getCourse: (id: string) => Course | undefined
  getLesson: (
    courseId: string,
    lessonId: string,
  ) => { course: Course | undefined; section: Section; lesson: Lesson } | null
  isLessonDone: (id: string) => boolean
  completeLesson: (id: string) => void
  isSectionUnlocked: (section: Section) => boolean
  passSection: (id: string) => void
  timeElapsed: Ref<boolean>
  elapseTime: () => void
  login: (email: string) => void
  logout: () => void
}

export function useLms(): UseLmsResult {
  // Student = přihlášený uživatel (model účet-první, O-17). Identitou je e-mail.
  // Cookie (ne useState): přežije tvrdý reload a je čitelná i na serveru, takže
  // `lms-auth` middleware nehodí přihlášeného uživatele zpět na /kurzy/vstup.
  const student = useCookie<string | null>("lms-student", { default: () => null })
  // Postup: dokončené lekce a sekce odemčené splněním testu (úspěch odemyká trvale, R-6).
  const doneLessons = useState<string[]>("lms-done", () => [])
  const passedSections = useState<string[]>("lms-passed", () => [])
  // Prototyp: simulace "uplynul čas od nákupu" pro časově odemykané sekce (BP-13c, O-19).
  const timeElapsed = useState<boolean>("lms-time", () => false)

  const courses = COURSES

  function login(email: string) {
    student.value = email || "student@example.cz"
  }
  function logout() {
    student.value = null
  }

  const getCourse = (id: string) => courses.find((c) => c.id === id)

  function getLesson(courseId: string, lessonId: string) {
    const course = getCourse(courseId)
    for (const section of course?.sections ?? []) {
      const lesson = section.lessons.find((l) => l.id === lessonId)
      if (lesson) {
        return { course, section, lesson }
      }
    }
    return null
  }

  const isLessonDone = (id: string) => doneLessons.value.includes(id)

  function completeLesson(id: string) {
    if (!isLessonDone(id)) {
      doneLessons.value = [...doneLessons.value, id]
    }
  }

  // Je sekce odemčená? Pravidlo na úrovni sekce, ne globální režim (O-9).
  function isSectionUnlocked(section: Section): boolean {
    const rule = section.unlock
    if (rule.kind === "open") {
      return true
    }
    if (rule.kind === "test") {
      return passedSections.value.includes(section.id)
    }
    return timeElapsed.value // rule.kind === "time"
  }

  function passSection(id: string) {
    if (!passedSections.value.includes(id)) {
      passedSections.value = [...passedSections.value, id]
    }
  }

  function elapseTime() {
    timeElapsed.value = true
  }

  return {
    student,
    courses,
    getCourse,
    getLesson,
    isLessonDone,
    completeLesson,
    isSectionUnlocked,
    passSection,
    timeElapsed,
    elapseTime,
    login,
    logout,
  }
}
