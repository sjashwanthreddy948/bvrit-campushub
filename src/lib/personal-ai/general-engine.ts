/**
 * CampusHub AI — General Knowledge & Technical Intelligence Engine
 * 
 * Provides expert programming, algorithmic, database, and professional writing guidance.
 * STRICT POLICY:
 * - Never says "I only have access to CampusHub information".
 * - Avoids repetitive robotic self-introductions.
 * - Answers the user's actual question immediately with clarity and practical examples.
 * - Uses clean code snippets, Big-O analysis, and senior-mentor intuition.
 */

export interface GeneralAnswerResult {
  title: string;
  answer: string;
  category: string;
  suggestedQuestions: string[];
}

export function handleGeneralQuery(query: string): GeneralAnswerResult {
  const q = query.trim().toLowerCase();

  // -------------------------------------------------------------------------
  // 1. Binary Search
  // -------------------------------------------------------------------------
  if (q.includes("binary search")) {
    return {
      title: "Binary Search Explained",
      category: "Algorithms",
      suggestedQuestions: [
        "What are common binary search edge cases?",
        "Explain Two Pointers technique",
        "How do I prepare for coding interviews?",
      ],
      answer: `### 🔍 Binary Search: Concept & Implementation

**Binary Search** is an efficient algorithm for searching an element in a **sorted array** by repeatedly dividing the search interval in half.

* **Time Complexity:** $\\mathcal{O}(\\log N)$ (halves the search space each step)
* **Space Complexity:** $\\mathcal{O}(1)$ for iterative, $\\mathcal{O}(\\log N)$ for recursive
* **Prerequisite:** The input array MUST be sorted.

#### How It Works:
1. Maintain two pointers: \`left = 0\` and \`right = n - 1\`.
2. Compute midpoint: \`mid = left + Math.floor((right - left) / 2)\` (avoids integer overflow).
3. Compare \`arr[mid]\` with \`target\`:
   * If \`arr[mid] === target\`: Found! Return index \`mid\`.
   * If \`arr[mid] < target\`: Target lies in the right half $\\rightarrow$ \`left = mid + 1\`.
   * If \`arr[mid] > target\`: Target lies in the left half $\\rightarrow$ \`right = mid - 1\`.
4. If \`left > right\`, target does not exist $\\rightarrow$ return \`-1\`.

\`\`\`python
def binary_search(arr: list[int], target: int) -> int:
    left, right = 0, len(arr) - 1
    
    while left <= right:
        mid = left + (right - left) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
            
    return -1

# Example:
nums = [2, 5, 8, 12, 16, 23, 38, 56, 72, 91]
print(binary_search(nums, 23))  # Returns 5
\`\`\`

💡 **Senior Tip for Coding Rounds:** Watch out for off-by-one errors in \`while left <= right\` versus \`while left < right\`. Use \`left <= right\` when searching for an exact target, and \`left < right\` when finding lower/upper bounds.`,
    };
  }

  // -------------------------------------------------------------------------
  // 2. React: How React Works & Virtual DOM
  // -------------------------------------------------------------------------
  if (q.includes("how does react work") || q.includes("explain react") || q.includes("virtual dom")) {
    return {
      title: "How React Works",
      category: "Frontend Architecture",
      suggestedQuestions: [
        "Explain useState vs useEffect",
        "Should I learn React or Java?",
        "What are React Server Components?",
      ],
      answer: `### ⚛️ How React Works: Core Architecture

React is a declarative, component-based UI library. Its core power comes from three architectural pillars:

#### 1. The Virtual DOM (VDOM)
Manipulating the browser's real DOM is slow because it causes browser reflows and repaints. React solves this by maintaining a lightweight JavaScript representation of the DOM in memory called the **Virtual DOM**.

#### 2. Reconciliation & Diffing Algorithm
When a component's state or props change:
1. **Render phase:** React produces a new Virtual DOM tree representing the updated UI.
2. **Diffing:** React compares the new Virtual DOM tree with the previous Virtual DOM tree using an efficient $\\mathcal{O}(N)$ heuristic diffing algorithm.
3. **Commit phase:** React computes the minimal set of changes needed and updates ONLY those specific nodes in the real browser DOM.

\`\`\`jsx
// When count increments, React ONLY modifies the text inside <span>
function Counter() {
  const [count, setCount] = React.useState(0);
  return (
    <div>
      <h1>Counter</h1>
      <span>{count}</span>
      <button onClick={() => setCount(count + 1)}>+</button>
    </div>
  );
}
\`\`\`

#### 3. One-Way Data Flow
Data flows strictly from parent to child via \`props\`. This predictability makes debugging and state tracking straightforward.

💡 **Interview Tip:** When asked in interviews, mention that in modern React (React 18+), the **Fiber Architecture** enables concurrent rendering—allowing React to pause, resume, or abort rendering work so high-priority updates (like typing in an input) aren't blocked by heavy render trees.`,
    };
  }

  // -------------------------------------------------------------------------
  // 3. Database Normalization (1NF, 2NF, 3NF, BCNF)
  // -------------------------------------------------------------------------
  if (q.includes("normalization") || q.includes("1nf") || q.includes("2nf") || q.includes("3nf") || q.includes("database normal")) {
    return {
      title: "Database Normalization Explained",
      category: "Databases & DBMS",
      suggestedQuestions: [
        "Explain SQL Joins with examples",
        "What is indexing in database?",
        "What are ACID properties?",
      ],
      answer: `### 🗄️ Database Normalization: 1NF to 3NF

**Normalization** is the process of organizing relational database tables to **minimize data redundancy** and avoid update, insertion, and deletion anomalies.

#### 1. First Normal Form (1NF)
* **Rule:** Each table column must contain atomic (indivisible) values, and each record must be unique.
* **Fix:** No arrays, lists, or multiple comma-separated values in a single cell.

#### 2. Second Normal Form (2NF)
* **Rule:** Must be in 1NF **AND** have no partial dependencies.
* **Meaning:** Every non-prime attribute must depend on the **whole** candidate key, not just part of a composite primary key.
* **Fix:** Split the table so attributes only depend on their complete primary key.

#### 3. Third Normal Form (3NF)
* **Rule:** Must be in 2NF **AND** have no transitive dependencies.
* **Meaning:** Non-prime attributes must not depend on other non-prime attributes ($X \\rightarrow Y$ and $Y \\rightarrow Z$, where $X$ is the primary key).
* *Mnemonic:* "Every attribute must depend on the key, the whole key, and nothing but the key (so help me Codd)."

#### Quick Comparison Table:
| Normal Form | Elimination Target | Example Problem Solved |
|---|---|---|
| **1NF** | Multi-valued attributes | Storing \`"Python, Java"\` in one cell |
| **2NF** | Partial dependencies | Student course grade depending on only StudentID in composite (StudentID, CourseID) |
| **3NF** | Transitive dependencies | Student $\\rightarrow$ DeptID $\\rightarrow$ DeptHead |

💡 **Practical Tip for Real Systems:** In production web apps, OLTP databases are usually normalized to **3NF** to ensure data integrity during writes. OLAP/Analytics data warehouses are often intentionally **denormalized** (star schema) to speed up complex queries.`,
    };
  }

  // -------------------------------------------------------------------------
  // 4. Technology Choice: React vs Java
  // -------------------------------------------------------------------------
  if ((q.includes("react") && q.includes("java")) || (q.includes("should i learn") && (q.includes("react") || q.includes("java")))) {
    return {
      title: "React vs Java: Strategic Career Guidance",
      category: "Career & Tech Strategy",
      suggestedQuestions: [
        "What are top recruiters looking for on campus?",
        "How do I prepare for coding interviews?",
        "What should I learn next?",
      ],
      answer: `### ⚖️ React vs Java: Which Should You Learn First?

The short answer depends on whether your immediate target is **campus placements (high-package product companies & MNCs)** or **building end-to-end full-stack web applications**.

#### Choose Java if your priority is Campus Placements & Backend:
* **Campus Hiring Advantage:** 80% of top tier recruiters (Amazon, JPMorgan, Qualcomm, Cognizant, TCS Digital) test core programming and DSA in Java or C++.
* **Enterprise Backend:** Spring Boot is the undisputed enterprise standard in banking, fintech, and large distributed systems.
* **OOP Concepts:** Mastering Java solidifies Object-Oriented Design, multithreading, and memory management—frequently asked in technical rounds.

#### Choose React if your priority is Full-Stack Web Development & Startups:
* **Product Building:** React lets you build interactive user interfaces and deploy live web projects quickly.
* **Startup & Frontend Demand:** High demand in early-stage startups and modern product companies seeking MERN/Next.js developers.
* **Portfolio Impact:** Deploying a live React web application on Vercel gives recruiters something tangible to test during interviews.

#### 🎯 Recommended 2-Phase Strategy:
1. **Phase 1 (Placements & DSA):** Use **Java** for DSA and coding assessments. It guarantees interview round compliance across all companies.
2. **Phase 2 (Project & Resume):** Learn **React** to build 1 or 2 high-impact full-stack projects to display on your resume.

You don't have to choose permanently—Java backend + React frontend is one of the highest-paying full-stack combinations in the industry.`,
    };
  }

  // -------------------------------------------------------------------------
  // 5. Help Me Learn Python
  // -------------------------------------------------------------------------
  if (q.includes("learn python") || q.includes("help me learn python") || q.includes("python roadmap")) {
    return {
      title: "Python Learning Roadmap",
      category: "Programming Guide",
      suggestedQuestions: [
        "Explain binary search in Python",
        "What are Python list comprehensions?",
        "How do I prepare for placements?",
      ],
      answer: `### 🐍 Python: Fast-Track Learning Roadmap

Python is the most versatile language for DSA, AI/ML, backend scripting, and automation. Here is a streamlined 4-week mastery plan:

#### Week 1: Syntax & Core Data Structures
* Variables, type hints, loops, conditionals
* **Lists, Tuples, Sets, Dictionaries** (Know time complexities: dict lookup is $\\mathcal{O}(1)$, list search is $\\mathcal{O}(N)$)
* List comprehensions & lambda functions:
\`\`\`python
# Clean Pythonic list comprehension
evens = [x for x in range(20) if x % 2 == 0]
\`\`\`

#### Week 2: Object-Oriented Python & Functions
* \`*args\` and \`**kwargs\`
* Classes, inheritance, \`__init__\`, and \`__repr__\`
* Exception handling (\`try / except / finally\`)

#### Week 3: Essential Libraries & File I/O
* Built-in modules: \`collections\` (\`Counter\`, \`defaultdict\`), \`itertools\`, \`heapq\`
* Working with JSON and file streams
* Virtual environments (\`venv\`) and \`pip\`

#### Week 4: Choose Your Path
* **Path A (Placements & DSA):** Solve LeetCode problems using Python's clean syntax.
* **Path B (Backend API):** Build REST APIs with **FastAPI**.
* **Path C (Data & AI):** Learn **Pandas, NumPy, and PyTorch**.

💡 **Senior Tip:** In coding interviews, writing clean Python often saves 30% of time compared to C++ or Java, giving you more time to think about edge cases.`,
    };
  }

  // -------------------------------------------------------------------------
  // 6. Professional Email Writing
  // -------------------------------------------------------------------------
  if (q.includes("email") || q.includes("cold email") || q.includes("cover letter")) {
    return {
      title: "Professional Email Template for Students",
      category: "Professional Communication",
      suggestedQuestions: [
        "How can I improve my resume?",
        "How to prepare for an HR interview?",
        "What skills am I missing?",
      ],
      answer: `### ✉️ Professional Email: Referral / Networking Template

When reaching out to college alumni, HR recruiters, or mentors, keep it **concise, respectful, and actionable** (under 120 words).

#### Subject Line Template:
\`\`\`
B.Tech CSE Student @ BVRIT | Application for [Role Name] (Job ID: #[12345])
\`\`\`

#### Email Body:
\`\`\`text
Dear [Recipient Name / Hiring Team],

I hope this email finds you well.

My name is [Your Name], and I am currently a 3rd-year B.Tech Computer Science student at BVRIT Narsapur. I have been following [Company Name]'s recent work in [specific domain, e.g., cloud infrastructure / fintech payments], and I am very interested in the [Role Title] position.

My technical background includes [Key Skill 1, Key Skill 2, and Key Skill 3]. Recently, I built [Brief 1-sentence description of relevant project], which achieved [brief metric or outcome].

I have attached my single-page ATS resume for your review. If your schedule allows, I would welcome the opportunity to discuss how my skillset aligns with your team's goals.

Thank you for your time and consideration.

Warm regards,

[Your Name]
B.Tech Computer Science & Engineering, Year 3
BVRIT Narsapur | [Phone Number]
LinkedIn: [Profile URL] | GitHub: [GitHub URL]
\`\`\`

💡 **Golden Rule:** Always customize the 2nd paragraph to the specific company. Never send a mass-copy-pasted email without mentioning their actual product or tech stack.`,
    };
  }

  // -------------------------------------------------------------------------
  // 7. Code Debugging Guidance
  // -------------------------------------------------------------------------
  if (q.includes("debug") || q.includes("fix this code") || q.includes("error in code")) {
    return {
      title: "Systematic Code Debugging Process",
      category: "Software Engineering",
      suggestedQuestions: [
        "Explain binary search",
        "How does React work?",
        "How to prepare for coding interviews?",
      ],
      answer: `### 🛠️ Systematic 4-Step Code Debugging

When your code fails a test case or throws a runtime error, follow this proven engineering approach rather than guessing:

#### 1. Reproduce with the Smallest Test Case
* Don't debug with an input of 100 elements. Reduce the input to 2 or 3 elements, or test boundary values (\`0\`, \`-1\`, empty array, single element).

#### 2. Trace the Program State
* If in browser/Node: use \`console.log({ variableName })\` with object wrapping so the variable name prints alongside its value.
* Check off-by-one errors in loop boundaries (\`<=\` vs \`<\`).
* Check for unintended state mutations in React: always create shallow copies with \`[...array]\` or \`{ ...obj }\`.

#### 3. Common Pitfalls Checklist:
* **Null / Undefined:** Are you accessing \`obj.user.name\` when \`user\` might be null? Use optional chaining: \`obj?.user?.name\`.
* **Async/Await:** Did you forget to \`await\` an asynchronous promise before using its returned value?
* **Integer Division:** In Python 3, \`/\` returns a float. Use \`//\` for floor integer division.

If you have a specific code snippet or error message, paste it here and I will point out the exact line and fix!`,
    };
  }

  // -------------------------------------------------------------------------
  // 8. General AI Fallback (Natural, helpful, senior persona)
  // -------------------------------------------------------------------------
  return {
    title: "Technical & Placement Assistant",
    category: "General Assistant",
    suggestedQuestions: [
      "Explain binary search with an example",
      "Should I learn React or Java?",
      "How do I prepare for placements?",
      "What am I weak at?",
    ],
    answer: `I'm here to help with both technical concepts and placement preparation. 

Whether you need:
* **Data structures & algorithms:** Binary search, graph traversals, dynamic programming, or Big-O analysis.
* **Web development & backend:** React, Next.js, Python, Java Spring Boot, or SQL normalization.
* **Placement prep & career advice:** Resume guidance, tech stack selection, or coding interview roadmaps.
* **Campus queries:** Your upcoming deadlines, eligible placement drives, and verified circulars.

What specific problem, language, or concept would you like to explore?`,
  };
}
