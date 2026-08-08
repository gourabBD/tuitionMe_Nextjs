/**
 * Seeds the `services` collection with a realistic course catalogue spanning
 * several categories.
 *
 * Safe to re-run: each course is upserted by its `subject`, and `$setOnInsert`
 * protects `createdAt` and `content`, so re-seeding never clobbers lessons an
 * instructor has already attached or reshuffles the catalogue order.
 *
 * Usage:  npm run seed
 */
import { MongoClient, ServerApiVersion } from "mongodb";

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error("MONGODB_URI is not set. Copy .env.example to .env.local first.");
  process.exit(1);
}

const img = (seed) => `https://picsum.photos/seed/${seed}/800/450`;

const courses = [
  {
    subject: "Complete Web Development Bootcamp",
    category: "Web Development",
    instructor: "Arif Hossain",
    level: "Beginner",
    class: "Beginner to Advanced",
    days: "5",
    cost: 2500,
    originalCost: 4000,
    rating: 4.8,
    students: 3200,
    bestseller: true,
    img: img("web-dev-bootcamp"),
    description:
      "Go from zero to job-ready: HTML, CSS, JavaScript, React and Node.js with real projects and code reviews every week.",
  },
  {
    subject: "Modern JavaScript & ES6+ Mastery",
    category: "Web Development",
    instructor: "Nusrat Jahan",
    level: "Intermediate",
    class: "Class 9 and above",
    days: "4",
    cost: 1800,
    originalCost: 2600,
    rating: 4.7,
    students: 2100,
    bestseller: true,
    img: img("modern-js"),
    description:
      "Master closures, async/await, modules and the modern JavaScript toolchain used in production apps.",
  },
  {
    subject: "React & Redux for Production Apps",
    category: "Web Development",
    instructor: "Tanvir Ahmed",
    level: "Intermediate",
    class: "All ages",
    days: "4",
    cost: 2200,
    originalCost: 3200,
    rating: 4.9,
    students: 2760,
    bestseller: true,
    img: img("react-redux"),
    description:
      "Build scalable, component-driven front-ends with React, Redux Toolkit, hooks and testing best practices.",
  },
  {
    subject: "Python for Data Science & Machine Learning",
    category: "Data Science",
    instructor: "Dr. Farhana Karim",
    level: "Beginner",
    class: "All ages",
    days: "5",
    cost: 2800,
    originalCost: 4200,
    rating: 4.8,
    students: 4100,
    bestseller: true,
    img: img("python-ds"),
    description:
      "Learn NumPy, pandas, scikit-learn and build your first machine learning models from scratch.",
  },
  {
    subject: "SQL & Database Design Fundamentals",
    category: "Data Science",
    instructor: "Imran Chowdhury",
    level: "Beginner",
    class: "All ages",
    days: "3",
    cost: 1500,
    rating: 4.5,
    students: 1560,
    img: img("sql-fundamentals"),
    description:
      "Design normalized schemas and write efficient queries with hands-on exercises using real datasets.",
  },
  {
    subject: "Advanced Higher Secondary Mathematics",
    category: "Mathematics",
    instructor: "Prof. Rashed Kabir",
    level: "All Levels",
    class: "Class 11-12",
    days: "4",
    cost: 1800,
    rating: 4.6,
    students: 1980,
    img: img("hsc-math"),
    description:
      "Comprehensive coverage of calculus, trigonometry and coordinate geometry for board and admission exams.",
  },
  {
    subject: "Algebra & Calculus Foundations",
    category: "Mathematics",
    instructor: "Shirin Akter",
    level: "Beginner",
    class: "Class 9-10",
    days: "3",
    cost: 1200,
    rating: 4.4,
    students: 980,
    img: img("algebra-calculus"),
    description:
      "Build a rock-solid foundation in algebra and introductory calculus with weekly problem sets.",
  },
  {
    subject: "Physics for HSC & Engineering Admission",
    category: "Physics",
    instructor: "Dr. Kamal Hasan",
    level: "Advanced",
    class: "Class 11-12",
    days: "4",
    cost: 2000,
    rating: 4.7,
    students: 2340,
    bestseller: true,
    img: img("physics-hsc"),
    description:
      "Mechanics, electromagnetism and modern physics explained with intuitive visuals and past-paper practice.",
  },
  {
    subject: "Organic Chemistry Made Easy",
    category: "Chemistry",
    instructor: "Nasrin Sultana",
    level: "Intermediate",
    class: "Class 11-12",
    days: "3",
    cost: 1700,
    rating: 4.5,
    students: 1450,
    img: img("organic-chem"),
    description:
      "Reaction mechanisms, functional groups and named reactions simplified with memory-friendly diagrams.",
  },
  {
    subject: "Human Biology & Anatomy Essentials",
    category: "Biology",
    instructor: "Dr. Sabina Yasmin",
    level: "Beginner",
    class: "Class 9-10",
    days: "3",
    cost: 1600,
    rating: 4.6,
    students: 1290,
    img: img("human-biology"),
    description:
      "Explore human body systems with 3D-style diagrams and exam-focused revision notes.",
  },
  {
    subject: "Spoken English & IELTS Preparation",
    category: "Languages",
    instructor: "Rebecca Islam",
    level: "All Levels",
    class: "All ages",
    days: "5",
    cost: 2200,
    rating: 4.8,
    students: 3560,
    bestseller: true,
    img: img("ielts-prep"),
    description:
      "Improve fluency and score higher on IELTS with speaking labs, mock tests and personalised feedback.",
  },
  {
    subject: "Business English for Professionals",
    category: "Languages",
    instructor: "James Carter",
    level: "Intermediate",
    class: "Working professionals",
    days: "3",
    cost: 1900,
    rating: 4.4,
    students: 870,
    img: img("business-english"),
    description:
      "Write clearer emails, lead confident meetings and present with polish in a professional workplace.",
  },
  {
    subject: "Financial Accounting & Bookkeeping",
    category: "Business & Finance",
    instructor: "Mahmudul Hasan",
    level: "Beginner",
    class: "All ages",
    days: "4",
    cost: 2100,
    rating: 4.5,
    students: 1120,
    img: img("accounting"),
    description:
      "Learn double-entry bookkeeping, financial statements and small-business accounting from the ground up.",
  },
  {
    subject: "Digital Marketing & SEO Masterclass",
    category: "Business & Finance",
    instructor: "Ayesha Siddiqua",
    level: "Intermediate",
    class: "All ages",
    days: "4",
    cost: 2400,
    originalCost: 3500,
    rating: 4.7,
    students: 2870,
    bestseller: true,
    img: img("digital-marketing"),
    description:
      "Grow real traffic with SEO, content strategy, and paid ads — including live campaign case studies.",
  },
  {
    subject: "UI/UX Design with Figma",
    category: "Design",
    instructor: "Rafiul Islam",
    level: "Beginner",
    class: "All ages",
    days: "4",
    cost: 2000,
    originalCost: 2800,
    rating: 4.8,
    students: 2050,
    bestseller: true,
    img: img("uiux-figma"),
    description:
      "Design polished, user-friendly interfaces in Figma and build a portfolio-ready case study.",
  },
  {
    subject: "Graphic Design Fundamentals",
    category: "Design",
    instructor: "Tania Rahman",
    level: "Beginner",
    class: "All ages",
    days: "3",
    cost: 1600,
    rating: 4.3,
    students: 760,
    img: img("graphic-design"),
    description:
      "Typography, color theory and layout principles taught through practical branding projects.",
  },
  {
    subject: "Guitar for Beginners: Chords to Songs",
    category: "Music",
    instructor: "Sabbir Ahmed",
    level: "Beginner",
    class: "All ages",
    days: "2",
    cost: 1300,
    rating: 4.6,
    students: 1340,
    img: img("guitar-beginners"),
    description:
      "Go from your first chord to playing full songs with weekly practice routines and play-along sessions.",
  },
  {
    subject: "University Admission Test Prep (Science)",
    category: "Test Prep",
    instructor: "Dr. Faisal Mahmud",
    level: "Advanced",
    class: "HSC Candidates",
    days: "6",
    cost: 3000,
    originalCost: 4500,
    rating: 4.9,
    students: 4590,
    bestseller: true,
    img: img("admission-prep"),
    description:
      "Intensive, exam-pattern practice across physics, chemistry and math for top university admission tests.",
  },
];

async function seed() {
  const client = new MongoClient(uri, {
    serverApi: { version: ServerApiVersion.v1 },
  });

  try {
    await client.connect();
    const db = client.db(process.env.MONGODB_DB || "tuition-me");
    const services = db.collection("services");

    let inserted = 0;
    let updated = 0;

    for (const course of courses) {
      const result = await services.updateOne(
        { subject: course.subject },
        {
          $set: {
            category: course.category,
            instructor: course.instructor,
            level: course.level,
            class: course.class,
            days: course.days,
            cost: course.cost,
            originalCost: course.originalCost,
            rating: course.rating,
            students: course.students,
            bestseller: Boolean(course.bestseller),
            img: course.img,
            description: course.description,
          },
          $setOnInsert: {
            // Seeded courses have no owner, so nobody can edit them through
            // the app — they exist purely as catalogue filler.
            instructorEmail: null,
            content: [],
            createdAt: new Date(),
          },
        },
        { upsert: true }
      );

      if (result.upsertedCount) inserted += 1;
      else if (result.modifiedCount) updated += 1;
    }

    console.log(
      `Seed complete: ${inserted} inserted, ${updated} updated, ${courses.length} total.`
    );
  } finally {
    await client.close();
  }
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
